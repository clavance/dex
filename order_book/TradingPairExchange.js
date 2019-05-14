"use strict"

const OrbitDB = require('orbit-db');
let Trade = require('./Trade').Trade;
let Order = require('./Order').Order;

/**
 * The TradingPairExchange class represents the order book that backs a pair of
 * currencies being traded against each other. It stores the resting orders in
 * an OrbitDB key-value store database, where the keys are prices and the values
 * are arrays of Order objects, representing the queue of Order objects at each
 * price level in the book.
 *
 * One would instantiate a new instance of this class for each pair of currencies
 * to be traded against each other.
 */
class TradingPairExchange {

  /**
   * Initialise object with orbit db instance, and populated metadata fields.
   *
   * @param {String} name - Name of key-value store in database
   * @param {IPFS} ipfs - IPFS instance to use
   * @param {Number} tick_size (optional) - Minimum distance between price levels
   * @param {uint} price_shift (optional) - No. of decimal places to shift prices by,
     so they can be stored internally as integers. E.g. 10.43, price_shift=2, => 1043
   * @param {uint} amount_shift (optional) - No. of decimal places to shift amounts by,
     so they can be stored internally as integers
   */
  constructor(name, ipfs, tick_size, price_shift, amount_shift) {
    // Populate default parameters
    this.price_shift = price_shift || 0;
    this.amount_shift = amount_shift || 0;
    this.tick_size = TradingPairExchange.shiftToInt(tick_size, price_shift) || 1;

    this.name = name;
    this.ipfs = ipfs;
    this.trade_queue = [];
  }

  /**
   * Perform further initialisation steps, that can't be performed in
   * constructor because of need to use async functions.
   *
   * Creates necessary orbit db instances (key-value stores), and initial
   * metadata setup.
   */
  async init() {
    // Create OrbitDB instance
    this.orbitdb = new OrbitDB(this.ipfs);
    this.db = await this.orbitdb.keyvalue(this.name);
    this.matched_orders_db = await this.orbitdb.keyvalue("matched_orders_db");
    this.pending_orders_db = await this.orbitdb.keyvalue("pending_orders_db");

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
   * Private internal helper function.
   * Shift input by given no. of decimal places, making number bigger.
   *
   * @param {Number} num - Number to shift.
   * @param {Integer} shift_amount - No. of decimal places to shift by.
   * @return {Integer} shifted input number
   */
  static shiftToInt(num, shift_amount) {
    return Math.round(num * Math.pow(10, shift_amount));
  }

  /**
   * Private internal helper function.
   * Shift input by given no. of decimal places, making number smaller.
   *
   * @param {Number} num - Number to shift.
   * @param {Integer} shift_amount - No. of decimal places to shift by.
   * @return {Number} shifted input number
   */
  static shiftToFloat(num, shift_amount) {
    return num / Math.pow(10, shift_amount);
  }

  /**
   * Private internal helper function.
   * Shift order by given no. of decimal places, for price and amount making
   * number larger, so it is represented as an integer internally.
   *
   * @param {Order} order - Order to shift
   * @param {Integer} price_shift - No. of decimal places to shift price by.
   * @param {Integer} amount_shift - No. of decimal places to amount price by.
   * @return {Order} shifted order
   */
  static shiftOrder(order, price_shift, amount_shift) {
    let internal_order = TradingPairExchange.shallowCopy(order);
    // Shift order values so represented as int internally
    internal_order.price = TradingPairExchange.shiftToInt(
      internal_order.price, price_shift);
    internal_order.amount = TradingPairExchange.shiftToInt(
      internal_order.amount, amount_shift);
    return internal_order;
  }

  /**
   * Private internal helper function.
   * Shift order by given no. of decimal places, for price and amount making
   * number smaller, so it is represented as a float. FOr returning float value
   * back to user.
   *
   * @param {Order} order - Order to shift
   * @param {Integer} price_shift - No. of decimal places to shift price by.
   * @param {Integer} amount_shift - No. of decimal places to amount price by.
   * @return {Order} shifted order
   */
  static unshiftOrder(order, price_shift, amount_shift) {
    let internal_order = TradingPairExchange.shallowCopy(order);
    // Shift order values so represented as int internally
    internal_order.price = TradingPairExchange.shiftToFloat(
      internal_order.price, price_shift);
    internal_order.amount = TradingPairExchange.shiftToFloat(
      internal_order.amount, amount_shift);
    return internal_order;
  }

  /**
   * Private internal helper function.
   * Call unshiftOrder on maker and taker orders inside a Trade object.
   *
   * @param {Trade} trade - Trade to shift
   * @param {Integer} price_shift - No. of decimal places to shift price by.
   * @param {Integer} amount_shift - No. of decimal places to amount price by.
   * @return {Trade} unshifted trade
   */
  static unshiftTrade(trade, price_shift, amount_shift) {
    // Make copy
    let trade_copy = new Trade(
      TradingPairExchange.shallowCopy(trade.maker_order),
      TradingPairExchange.shallowCopy(trade.taker_order));
    trade_copy.timestamp = TradingPairExchange.shallowCopy(trade.timestamp);

    // Unshift
    trade_copy.maker_order = TradingPairExchange.unshiftOrder(
      trade_copy.maker_order, price_shift, amount_shift);
    trade_copy.taker_order = TradingPairExchange.unshiftOrder(
      trade_copy.taker_order, price_shift, amount_shift);
    return trade_copy;
  }

  /**
   * Private internal helper function.
   * Call shiftOrder on maker and taker orders inside a Trade object.
   *
   * @param {Trade} trade - Trade to shift
   * @param {Integer} price_shift - No. of decimal places to shift price by.
   * @param {Integer} amount_shift - No. of decimal places to amount price by.
   * @return {Trade} shifted trade
   */
  static shiftTrade(trade, price_shift, amount_shift) {
    // Make copy
    let trade_copy = new Trade(
      TradingPairExchange.shallowCopy(trade.maker_order),
      TradingPairExchange.shallowCopy(trade.taker_order));
    trade_copy.timestamp = TradingPairExchange.shallowCopy(trade.timestamp);

    // Unshift
    trade_copy.maker_order = TradingPairExchange.shiftOrder(
      trade_copy.maker_order, price_shift, amount_shift);
    trade_copy.taker_order = TradingPairExchange.shiftOrder(
      trade_copy.taker_order, price_shift, amount_shift);
    return trade_copy;
  }


  /**
   * Private internal helper function.
   * Stores given order for given user, in given (user: X) key-value store
   *
   * @param {orbitdb.keyvalue} input_db - key-value store to insert order into
   * @param {String} user - user id, used as key in input_db
   * @param {Order} order - order to store
   **/
  async storeOrderInPerUserDB(input_db, user, order) {
    if (input_db.get(user) === undefined) {
      await input_db.put(user, [order]);
    } else {
      let trades = input_db.get(user);
      trades.unshift(order)
      await input_db.put(user, trades)
    }
  }

  /**
   * Private internal helper function.
   * Removes given order for given user, from given (user: X) key-value store
   *
   * @param {orbitdb.keyvalue} input_db - key-value store to remove order from
   * @param {String} user - user id, used as key in input_db
   * @param {Order} order - order to remove
   **/
  async removeOrderFromPerUserDB(input_db, user, order) {
    if (input_db.get(user) === undefined) {
      return;
    }
    let orders = input_db.get(user);
    // Find index of order to remove
    let i;
    let found = false;
    for (i = 0; i < orders.length; i++) {
      if (orders[i].timestamp === order.timestamp &&
          orders[i].user === order.user &&
          orders[i].is_buy === order.is_buy) {
        found = true;
        break;
      }
    }
    // Didn't find target order in queue
    if (!found)
      throw new Error("InvalidOrder");

    // Remove order
    orders.splice(i, 1);

    await input_db.set(user, orders);
  }

  /**
   * Remove and return first Trade in trade queue, if it exists. Otherwise return undefined.
   * Also extract and store maker and taker Order objects from Trade object in
   * matched_orders_db.
   *
   * @return {Trade} Trade object at front of trade_queue
   */
  async popNextTrade() {
    if (this.trade_queue.length > 0) {
      let trade = this.trade_queue.shift();
      // Set timestamps
      trade.maker_order.timestamp = trade.timestamp;
      trade.taker_order.timestamp = trade.timestamp;

      // Store maker order
      // await this.storeOrderInPerUserDB(this.matched_orders_db, trade.maker_order.user, trade.maker_order);

      // Store taker order
      // await this.storeOrderInPerUserDB(this.matched_orders_db, trade.taker_order.user, trade.taker_order);

      return TradingPairExchange.unshiftTrade(trade, this.price_shift, this.amount_shift);
  }
  return undefined;
  }

  /**
   * Extract and store maker and taker Order objects from Trade object in
   * matched_orders_db.
   *
   * @param {Trade} trade - Trade object to store
   */
  async addTradeToTradeHistory(trade) {
  	let trade_shifted = TradingPairExchange.shiftTrade(trade, this.price_shift, this.amount_shift);
  	// Store maker order
  	await this.storeOrderInPerUserDB(this.matched_orders_db, trade_shifted.maker_order.user, trade_shifted.maker_order);

  	// Store taker order
  	await this.storeOrderInPerUserDB(this.matched_orders_db, trade_shifted.taker_order.user, trade_shifted.taker_order);
  }

  /**
  * Retrieves list of Order objects, representing the user's Order in Trades
  * that they have been involved in, that have been executed on the blockchain.
  *
  * @param {String} user - unique id representing a user
  * @return {Order[]} list of Order objects, for given user
  */
  getTradeHistoryPerUser(user) {
  	let orders = this.matched_orders_db.get(user);
  	let orders_copy = []
  	for (let i = 0; i < orders.length; i++) {
  		orders_copy.push(TradingPairExchange.unshiftOrder(orders[i], this.price_shift, this.amount_shift));
  	}
  	return orders_copy;
  }

  /**
  * Retrieves lists of Order objects, representing pending orders for a particular user
  *
  * @param {String} user - unique id representing a user
  * @return {Order[]} list of Order objects, for given user
  */
  getPendingOrdersPerUser(user) {
  	let orders = this.pending_orders_db.get(user);
  	let orders_copy = []
  	for (let i = 0; i < orders.length; i++) {
  		orders_copy.push(TradingPairExchange.unshiftOrder(orders[i], this.price_shift, this.amount_shift));
  	}
  	return orders_copy;
  }


  /**
   * Add order to order book database, matching passed Order with orders resting
   * on the order book, if possible. Can also match only part of the passed
   * Order, depending on state of order book.
   *
   * @param {Order} order - order to add/match
   * @return {Number} timestamp of order, in milliseconds since 1 Jan 1970 00:00:00
   */
  async addOrder(order_in) {

    order_in.timestamp = new Date().getTime();

    // Shift order values so represented as int internally
    let order = TradingPairExchange.shiftOrder(order_in, this.price_shift, this.amount_shift);

    // Perform order matching
    await this.matchOrder(order);

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

    // Add order to pending orders, per user
    await this.storeOrderInPerUserDB(this.pending_orders_db, order.user, order);

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
   * Cancel order in order book database. Remove Order object from OrbitDB. Also
   * updates metadata and pending orders.
   *
   * @param {Order} order - order to cancel
   */
  async cancelOrder(order) {

    // Shift order values so represented as int internally
    order = TradingPairExchange.shiftOrder(order, this.price_shift, this.amount_shift);

    await this.removeOrder(order);

    await this.updateMetadataAfterOrderRemoval(order);

    await this.removeOrderFromPerUserDB(this.pending_orders_db, order.user, order);
  }

  /**
   * Private internal helper function.
   * Remove Order object from order book database
   *
   * @param {Order} order - order to remove
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
   * Private internal helper function.
   * Update metadata fields after removing given Order from order book database
   *
   * @param {Order} order - removed order
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
   * Private internal helper function.
   * Remove part of the amount from an Order in order book database
   *
   * @param {Order} order - order to modify
   * @param {Number} amount - Amount to deplete order by
   */
  async depleteOrder(order, amount) {
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
   * Private internal helper function.
   * Match given order with orders already on order book. Modify existing order
   * book as matches are made, as well as appending resulting Trade objects to
   * trade queue
   *
   * @param {Order} taker_order - Incoming taker order.
   */
  async matchOrder(taker_order) {
    if (!this.matchingOrdersExist(taker_order))
      return;

    let orders_to_cancel = []  // store orders to be cancelled later (to
    // avoid changing data while iterating over it)

    let iter_params = this.getIterationParams(!taker_order.is_buy);

    // Iterate through potential matching orders
    let iter = this.bookIterator(
      iter_params[0], iter_params[1], iter_params[2]);
    let maker_order = TradingPairExchange.shallowCopy(iter.next());
    let trade, trade_taker_order, trade_maker_order;
    while (!maker_order.done && taker_order.amount > 0) {

      if (this.priceValid(taker_order, maker_order)) {

        // Prepare maker and taker orders for putting into trade
        trade_taker_order = TradingPairExchange.shallowCopy(taker_order);
        trade_maker_order = TradingPairExchange.shallowCopy(maker_order);
        trade_taker_order.price = TradingPairExchange.shallowCopy(trade_maker_order.price);

        if (maker_order.amount > taker_order.amount) {
          await this.depleteOrder(maker_order, taker_order.amount);
          trade_maker_order.amount = TradingPairExchange.shallowCopy(taker_order.amount);
          taker_order.amount = 0;

        } else {
          orders_to_cancel.push(TradingPairExchange.shallowCopy(maker_order));
          trade_taker_order.amount = TradingPairExchange.shallowCopy(trade_maker_order.amount);
          taker_order.amount -= TradingPairExchange.shallowCopy(maker_order.amount);
        }

        // Make Trade
        trade = new Trade(trade_maker_order, trade_taker_order);

        // Append trade to trade queue
        this.trade_queue.push(trade);

      } else {
        // Price too high/low, so no more matching orders
        break;
      }

      // Get next order, creating a copy
      maker_order = TradingPairExchange.shallowCopy(iter.next());
    }

    // Cancel all outstanding orders
    for (let i = 0; i < orders_to_cancel.length; i++) {
      await this.cancelOrder(
      	TradingPairExchange.unshiftOrder(
      		orders_to_cancel[i], this.price_shift, this.amount_shift));
    }
  }

  /**
   * Private internal helper function.
   * Check if price is valid such that maker and taker orders can match against
   * each other.
   *
   * @param {Order} taker_order - Incoming taker order.
   * @param {Order} maker_order - Incoming maker order.
   * @return {Boolean} true if price is valid, false if not
   */
  priceValid(taker_order, maker_order) {
    if (taker_order.is_buy && maker_order.price <= taker_order.price)
      return true;
    if (!taker_order.is_buy && maker_order.price >= taker_order.price)
      return true;
    return false;
  }

  /**
   * Private internal helper function.
   * Create shallow copy of object, assuming no functions are called within
   * object
   *
   * @param {Object} obj - Object to copy
   * @return {Object} copied object
   */
  static shallowCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
 

  /**
   * Private internal helper function.
   * Quick check if any matching orders exist, using best bid/ask
   *
   * @param {Order} taker_order - Incoming taker order
   * @return {Boolean} true if at least one matching order exists, false otherwise
   */
  matchingOrdersExist(taker_order) {
    let metadata = this.db.get("metadata");

    // Simple case where order price isn't better than best bid/ask (or no
    // sell/buy orders exist), so know no matches are possible
    if (taker_order.is_buy &&
      (metadata.best_ask === undefined ||
        taker_order.price < metadata.best_ask)) {
      return false;
    }
    if (!taker_order.is_buy &&
      (metadata.best_bid === undefined ||
        taker_order.price > metadata.best_bid)) {
      return false;
    }
    return true;
  }

  /**
   * Private internal helper function.
   * Get parameters for iterating through either bids or asks, from best to
   * worst.
   *
   * @param {Boolean} get_bids - true if want to iterate through bids, false for
     asks
   * @return {Number[]} array of price to start iterating from, price to finish
   * iterating at, and increment to use when iterating
   */
  getIterationParams(get_bids) {
    let metadata = this.db.get("metadata");
    let start_price, end_price, increment;

    if (!get_bids) {
      start_price = metadata.best_ask;
      end_price = metadata.worst_ask;
      increment = metadata.tick_size;
    } else {
      start_price = metadata.best_bid;
      end_price = metadata.worst_bid;
      increment = metadata.tick_size * -1;
    }
    return [start_price, end_price, increment];
  }

  /**
   * Private internal helper function.
   * Iterator for iterating through Orders objects on order book, from start
   * price to end price using given increment, iterating through Order objects
   * in each trade queue at each price level within given range.
   *
   * @param {Integer} start_price - price level to start iterating from
   * @param {Integer} end_price - price level to finish iterating at
   * @param {Integer} increment - increment to use when iterating. Can be used
   * to specify iteration direction.
   * @return {Object} object containing next() function, which is called to get
   * next Order object in iteration sequence.
   *
   * @example
   *
   *   let iter = this.bookIterator(100, 200, 1);
   *   let order = iter.next();
   *   while (!order.done) {
   *     // do something with order
   *     order = iter.next();
   *   }
   */
  bookIterator(start_price, end_price, increment) {
    let current_price = start_price;
    let db = this.db
    let current_queue = db.get(current_price);
    let current_index = 0;

    const iterator = {
      next: function() {
        // Return order at front of current queue, if present
        if (current_index < current_queue.length) {
          current_index += 1;
          return current_queue[current_index - 1];
        }

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
          current_price != end_price);

        // Check to see if we were unable to find valid queue
        if (current_queue === undefined || current_queue.length === 0)
          return {done: true}

        // Found non-empty queue, so return first element
        current_index = 1;
        return current_queue[0];
      }
    };
    return iterator;
  }

  /**
   * Retrieve list of all orders, first ordered from price low to high, then if
   * price is same order by earliest placement time.
   *
   * @return {Order[]} list of orders
   */
  getAllOrders() {
    let orders = [];
    let metadata = this.db.get("metadata");
    // Special case for no orders present
    if (metadata.worst_bid === undefined && metadata.worst_ask === undefined) {
      return [];
    }

    // Special cases when only bids or only asks
    let low = metadata.worst_bid;
    let high = metadata.worst_ask;
    if (metadata.worst_bid !== undefined && metadata.worst_ask === undefined) {
      high = metadata.best_bid;
    }
    if (metadata.worst_bid === undefined && metadata.worst_ask !== undefined) {
      low = metadata.best_ask;
    }

    // Perform iteration
  	let iter = this.bookIterator(low, high, this.tick_size);
  	let order = iter.next();
  	while (!order.done) {
      orders.push(TradingPairExchange.unshiftOrder(order, this.price_shift, this.amount_shift));
  	  order = iter.next();
  	}
    return orders;
  }

}

module.exports = {
  TradingPairExchange: TradingPairExchange
}
