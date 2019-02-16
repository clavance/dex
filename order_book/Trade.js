"use strict"

class Trade {

	/**
	 * Initialise object with maker and taker orders, which together
	   define a trade.
	 * @param {Order} maker_order - Maker order (resitng on book).
	 * @param {Order} taker_order - IPFS instance to use.
	 */
  constructor(maker_order, taker_order) {
  	this.maker_order = maker_order;
  	this.taker_order = taker_order;
  	this.timestamp = new Date().getTime();
  } 
}

module.exports = {
  Trade: Trade
}