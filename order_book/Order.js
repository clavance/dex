"use strict"

/**
 * The Order class represents an order object. This is any order that has been
 * placed by a user (could be maker or taker), and could even be only part of
 * an order (e.g. part that has matched).
 */
class Order {

  /**
   * @param {Boolean} is_buy - true if order is a buy order, false if sell
   * @param {Number} amount - amount of currency to trade
   * @param {Number} price - price at which to trade currency
   * @param {String} user - unique identifier for a user
   * @param {Number} timestamp - represents date and time, in milliseconds since 1 Jan 1970 00:00:00
   */
  constructor(is_buy, amount, price, user, timestamp) {
    this.is_buy = is_buy;
    this.amount = amount;
    this.price = price;
    this.user = user;
    this.timestamp = timestamp;
  } 
}

module.exports = {
  Order: Order
}