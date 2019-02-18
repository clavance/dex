"use strict"

const OrbitDB = require('orbit-db');

class TradingPairExchange {
  
  /**
   * Initialise object with orbit db instance, and populated metadata fields.
   * @param {string} name - Name of key-value store in database.
   * @param {IPFS} ipfs - IPFS instance to use.
   * @param {int/float} tick_size (optional) - Minimum distance between price levels.
   * @param {uint} price_shift (optional) - No. of decimal places to shift prices by,
     so they can be stored internally as integers. E.g. 10.43, price_shift=2, => 1043
   * @param {uint} amount_shift (optional) - No. of decimal places to shift amounts by,
     so they can be stored internally as integers.
   */
  constructor(name, ipfs, tick_size, price_shift, amount_shift) {
    // Populate default parameters
    this.tick_size = TradingPairExchange.shiftToInt(tick_size, price_shift) || 1;
    this.price_shift = price_shift || 0;
    this.amount_shift = amount_shift || 0;

    this.name = name;
    this.ipfs = ipfs;
    this.trade_queue = [];
  }

  async init() {
    // Create OrbitDB instance
    this.orbitdb = new OrbitDB(this.ipfs);
    this.db = await this.orbitdb.keyvalue(this.name);

    await this.db.put("metadata", {
      best_bid: undefined,
      best_ask: undefined,
      tick_size: this.tick_size,
      worst_bid: undefined,
      worst_ask: undefined,
      price_shift: this.price_shift,
      amount_shift: this.amount_shift
    });
  }

  /**
   * Shift input by given no. of decimal places, making number bigger.
   * @param {int/float} num - Number to shift.
   * @param {int} shift_amount - No. of decimal places to shift by.
   */
  static shiftToInt(num, shift_amount) {
    return Math.round(num * Math.pow(10, shift_amount));
  }

     /**
   * Shift input by given no. of decimal places, making number smaller.
   * @param {int/float} num - Number to shift.
   * @param {int} shift_amount - No. of decimal places to shift by.
   */
  static shiftToFloat(num, shift_amount) {
    return num / Math.pow(10, shift_amount);
  }

  getTradeQueue() {
    return this.trade_queue;
  }

   /**
   * Remove and return first element in queue, if it exists. Otherwise return undefined.
   */
   popNextTrade() {
    if (len(this.trade_queue > 0))
      return this.trade_queue.shift();
    return undefined;
   }

  /**
   * Add order to order book database, without performing any matching.
   * @param {keyValueStore} db - OrbitDB key value database holding order book.
   * @param {Order} order - Contains details of order to add.
   */
  async addOrder(order) {

    let order_ts = new Date().getTime();
    order.timestamp = new Date().getTime();

    // Shift order values so represented as int internally
    order.price = TradingPairExchange.shiftToInt(order.price, this.price_shift);
    order.amount = TradingPairExchange.shiftToInt(order.amount, this.amount_shift);

    // Perform order matching
    this.matchOrder(order);

    // Place (rest of) order on book if not fully matched, otherwise no need to add to book
    if (order.amount === 0)
      return order.timestamp;

    // Add order to book
    if (this.db.get(order.price) === undefined) {
      await this.db.put(order.price, [order]);
    } else {
      let queue = this.db.get(order.price);
      queue.push(order);
      await this.db.set(order.price, queue);
    }

    // Update best/worst bid/ask
    let metadata = this.db.get("metadata");
    if (order.is_buy === true) {
      if ((metadata.best_bid === undefined) || (order.price > metadata.best_bid)) {
        metadata.best_bid = order.price;
        await this.db.set("metadata", metadata);
      }
      if ((metadata.worst_bid === undefined)||(order.price < metadata.worst_bid)) {
        metadata.worst_bid = order.price;
        await this.db.set("metadata", metadata);
      }

    } else {
      if ((metadata.best_ask === undefined) || (order.price < metadata.best_ask)) {
        metadata.best_ask = order.price;
        await this.db.set("metadata", metadata);
      }
      if ((metadata.worst_ask === undefined)||(order.price > metadata.worst_ask)) {
        metadata.worst_ask = order.price;
        await this.db.set("metadata", metadata);
      }
    }

    return order.timestamp;
  }

  /**
   * Cancel order in order book database
   * @param {Order} order - Contains details of order to cancel.
   */
  async cancelOrder(order) {

    // Shift order values so represented as int internally
    order.price = TradingPairExchange.shiftToInt(order.price, this.price_shift);
    order.amount = TradingPairExchange.shiftToInt(order.amount, this.amount_shift);

    await this.removeOrder(order);

    await this.updateMetadataAfterOrderRemoval(order);
  }

  /**
   * Remove order in order book database
   * @param {Order} order - Contains details of order to remove.
   */
  async removeOrder(order) {

    let queue = this.db.get(order.price);

    if (queue === undefined || queue.length === 0)
      throw new Error("InvalidOrder");
   
    // Find index of order to remove
    let i;
    let found = false;
    for (i = 0; i < queue.length; i++) {
      if (queue[i].timestamp === order.timestamp &&
          queue[i].user === order.user &&
          queue[i].is_buy === order.is_buy) {
        found = true;
        break;
      }
    }
    // Didn't find target order in queue
    if (!found)
      throw new Error("InvalidOrder");

    // Remove order
    queue.splice(i, 1);

    // Put updated queue into database
    await this.db.set(order.price, queue);
  }

  /**
   * Update metadata fields after removing order from order book database
   * @param {Order} order - Contains details of order to remove.
   */
  async updateMetadataAfterOrderRemoval(order) {

    let metadata = this.db.get("metadata");

    // Return from function if price is not at best/worst bid/ask
    if (order.is_buy && order.price !== metadata.worst_bid && order.price !== metadata.best_bid)
      return;

    if (!order.is_buy && order.price !== metadata.worst_ask && order.price !== metadata.best_ask)
      return;

    // Return from function if at least one order at price level
    if (this.db.get(order.price).length > 0)
      return;

    // Get start and end prices of range to search through
    let start_price, end_price;
    if (order.is_buy) {
      start_price = metadata.worst_bid;
      end_price = metadata.best_bid;
    } else {
      start_price = metadata.best_ask;
      end_price = metadata.worst_ask;
    }

    // Search through possible price levels to find min and max values
    let min_val = undefined;
    let max_val = undefined;
    for (let price_lvl = start_price; price_lvl <= end_price; price_lvl += metadata.tick_size) {
      // Check price level exists in database
      if (this.db.get(price_lvl) !== undefined && this.db.get(price_lvl).length > 0) {
        if (min_val === undefined)
          min_val = price_lvl;
        if (max_val === undefined || price_lvl > max_val)
          max_val = price_lvl;
      }
    }

    // Update metadata
    if (order.is_buy) {
      metadata.worst_bid = min_val;
      metadata.best_bid = max_val;
    } else {
      metadata.best_ask = min_val;
      metadata.worst_ask = max_val;
    }

    await this.db.set("metadata", metadata);
  }

  /**
   * Remove part of the amount from an order in order book database
   * @param {Order} order - Contains details of order to modify.
   * @param {int} amount - Amount to deplete order by.
   */
  async depleteOrder(order, amount) {

    // Shift order values so represented as int internally
    order.price = TradingPairExchange.shiftToInt(order.price, this.price_shift);
    order.amount = TradingPairExchange.shiftToInt(order.amount, this.amount_shift);

    let queue = this.db.get(order.price);

    if (queue === undefined || queue.length === 0)
      throw new Error("InvalidOrder");
    
    // Find index of order to remove
    let i;
    let found = false;
    for (i = 0; i < queue.length; i++) {
      if (queue[i].timestamp === order.timestamp &&
          queue[i].user === order.user &&
          queue[i].is_buy === order.is_buy) {
        found = true;
        break;
      }
    }
    // Didn't find target order in queue
    if (!found)
      throw new Error("InvalidOrder");

    // Check that order contains sufficient units to perform depletion
    if (queue[i].amount < amount)
      throw new Error("InvalidDepletionAmount");

    // Check that depletion amount does not fully deplete order
    if (queue[i].amount == amount)
      throw new Error("InvalidDepletionAmount");

    // Deplete amount
    queue[i].amount -= amount;

    // Put updated queue into database
    await this.db.set(order.price, queue);
  }

  /**
   * Match given order with orders already on order book. Modify existing order
     book as matches are made, as well as appending to trade queue, for orders
     yet to be executed on blockchain.
   * @param {Order} order - Incoming taker order.
   */
  matchOrder(taker_order) {
    let metadata = db.get("metadata");

    // Simple case where order price isn't better than best bid/ask (or no
    // sell/buy orders exist), so know no matches are possible
    if (taker_order.is_buy &&
      (metadata.best_ask === undefined ||
        taker_order.price < metadata.best_ask)) {
      return;
    }
    if (!taker_order.is_buy &&
      (metadata.best_bid === undefined ||
        taker_order.price > metadata.best_bid)) {
      return;
    }

    // Get price to start searching for order from
    let current_price;
    if (taker_order.is_buy)
      current_price = metadata.best_ask;
    else
      current_price = metadata.best_bid;


  }

  bookIterator(start_price, end_price, increment) {
    let current_price = start_price;
    let db = this.db
    let current_queue = db.get(current_price);

    const iterator = {
      next: function() {
        // Return order at front of current queue, if present
        if (current_queue.length > 0)
          return current_queue.shift();

        // Queue depleted, so need to look for next one
        // Case when we are at final queue, so done
        if (current_price === end_price)
          return {done: true}

        // Find next queue
        do {
          current_price += increment;
          current_queue = db.get(current_price);
        } while (
          (current_queue === undefined || current_queue.length === 0) &&
          current_price <= end_price);

        // console.log(current_queue);

        // Check to see if we were unable to find valid queue
        if (current_queue === undefined || current_queue.length === 0)
          return {done: true}

        // Found non-empty queue, so return first element
        return current_queue.shift();
      }
    };
    return iterator;
  }


}


module.exports = {
  TradingPairExchange: TradingPairExchange
}