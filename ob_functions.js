/**
 * Add order to order book database, without performing any matching.
 * @param {keyValueStore} db - OrbitDB key value database holding order book.
 * @param {bool} is_buy_in - True if order is a buy order, false otherwise.
 * @param {float} amount_in - Amount of currency to trade.
 * @param {float} price_in - Price at which to trade.
 * @param {string} user_in - Identifies user.
 */
async function addOrder(db, is_buy_in, amount_in, price_in, user_in) {

  const order = {
    is_buy: is_buy_in,
    amount: amount_in,
    price: price_in,
    timestamp: new Date().getTime(),
    user: user_in
  }

  if (db.get(price_in) === undefined) {
    await db.put(price_in, [order]);
  } else {
    let queue = db.get(price_in);
    queue.push(order);
    await db.set(price_in, queue);
  }

  // Update best bid/ask
  let metadata = db.get("metadata");
  if (order.is_buy === true) {
    if ((metadata.best_bid === undefined) || (order.price > metadata.best_bid)) {
      metadata.best_bid = order.price;
      await db.set("metadata", metadata);
    }
  } else {
    if ((metadata.best_ask === undefined) || (order.price < metadata.best_ask)) {
      metadata.best_ask = order.price;
      await db.set("metadata", metadata);
    }
  }
}

module.exports = addOrder;