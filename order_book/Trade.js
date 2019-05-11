"use strict"

/**
 * The Trade class represents an trade object. A trade object consists of a maker
 * Order and a taker Order, as well as the timestamp at which the trade occurred.
 */
class Trade {

	/**
	 * @param {Order} maker_order - Maker order (adds liquidity, rests on book)
	 * @param {Order} taker_order - Taker order (removes liquidity, matching against resting order)
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