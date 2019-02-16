"use strict"

class Order {
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