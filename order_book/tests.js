"use strict"

let Order = require('./Order').Order;
let Trade = require('./Trade').Trade;
let TradingPairExchange = require('./TradingPairExchange').TradingPairExchange;

const assert = require('assert');
const IPFS = require('ipfs');


const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  }
}

// Create IPFS instance
const ipfs = new IPFS(ipfsOptions);

ipfs.on('ready', async () => {

  // TEST: addOrder

  let num_tests_failed = 0;
  let num_tests_run = 0;
  let num_tests_passed = 0;

  let exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  // Test that retrieved metadata is as expected
  num_tests_run++;
  try {
    let result = exchange.db.get("metadata");
    assert.strictEqual(JSON.stringify(result), JSON.stringify({
      best_bid: undefined,
      best_ask: undefined,
      tick_size: 1,
      worst_bid: undefined,
      worst_ask: undefined,
      price_shift: 0,
      amount_shift: 0
    }));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder: Test 1");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  await exchange.addOrder(new Order(true, 100, 20, "A", undefined));

  // Test that length of queue at key 20 is 1, after putting a single order into it
  num_tests_run++;
  try {
    assert.strictEqual(exchange.db.get(20).length, 1);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder: Test 2");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test that object we can fetch the object we just put in, as expected
  num_tests_run++;
  try {
    let result = exchange.db.get(20)[0];
    result.timestamp = "PASS";
    assert.strictEqual(JSON.stringify(result), JSON.stringify({
      is_buy: true,
      amount: 100,
      price: 20,
      user: "A",
      timestamp: "PASS"
    }));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder: Test 3");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  await exchange.addOrder(new Order(true, 50, 20, "B", undefined));

  // Test that orders are in correct place in queue, for same key (20)
  num_tests_run++;
  try {
    let result_a = exchange.db.get(20)[0];
    let result_b = exchange.db.get(20)[1];
    assert.strictEqual(result_a.user, "A");
    assert.strictEqual(result_b.user, "B");
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder: Test 4");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  await exchange.addOrder(new Order(true, 50, 30, "C", undefined));

  // Test that best_bid in metadata gets updated when adding new best bid order
  num_tests_run++;
  try {
    assert.strictEqual(exchange.db.get("metadata").best_bid, 30);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder: Test 5");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  await exchange.addOrder(new Order(false, 50, 60, "D", undefined));

  // Test that best_ask in metadata gets updated when adding new best ask order
  num_tests_run++;
  try {
    assert.strictEqual(exchange.db.get("metadata").best_ask, 60);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder: Test 6");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  await exchange.addOrder(new Order(false, 50, 100, "E", undefined));

  // Test that worst_ask in metadata gets updated when adding new worst ask order
  num_tests_run++;
  try {
    assert.strictEqual(exchange.db.get("metadata").worst_ask, 100);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder: Test 7");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  await exchange.addOrder(new Order(true, 50, 10, "F", undefined));

  // Test that worst_bid in metadata gets updated when adding new worst bid order
  num_tests_run++;
  try {
    assert.strictEqual(exchange.db.get("metadata").worst_bid, 10);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder: Test 8");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Compute stats of tests that passed/failed
  if (num_tests_passed === num_tests_run) {
    console.log("ALL " + num_tests_run + " addOrder TESTS PASSED!");
  } else {
    console.log("NOT ALL addOrder TESTS PASSED!");
    console.log(num_tests_passed + " out of " + num_tests_run + " tests passed.");
  }

  exchange.db.close();


  // TEST: cancelOrder

  num_tests_failed = 0;
  num_tests_run = 0;
  num_tests_passed = 0;

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_a = await exchange.addOrder(new Order(true, 100, 20, "A", undefined));
  let ts_b = await exchange.addOrder(new Order(true, 50, 20, "B", undefined));

  // Test cancelling orders within same queue, queue length changes
  num_tests_run++;
  try {
    await exchange.cancelOrder(new Order(true, 100, 20, "A", ts_a));
    assert.strictEqual(exchange.db.get(20).length, 1);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 1");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  let ts_c = await exchange.addOrder(new Order(true, 100, 20, "C", undefined));

  // Test cancelling orders within same queue, correct order gets cancelled
  num_tests_run++;
  try {
    await exchange.cancelOrder(new Order(true, 50, 20, "B", ts_b));
    assert.strictEqual(exchange.db.get(20)[0].user, "C");
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 2");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test cancel last order in queue, queue becomes empty
  num_tests_run++;
  try {
    await exchange.cancelOrder(new Order(true, 100, 20, "C", ts_c));
    assert.strictEqual(exchange.db.get(20).length, 0);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 3");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  let ts_d = await exchange.addOrder(new Order(true, 100, 20, "D", undefined));
  let ts_e = await exchange.addOrder(new Order(true, 100, 30, "E", undefined));

  // Test best bid changes when deleting best bid order
  num_tests_run++;
  try {
    await exchange.cancelOrder(new Order(true, 100, 30, "E", ts_e));
    assert.strictEqual(exchange.db.get("metadata").best_bid, 20);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 4");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  let ts_f = await exchange.addOrder(new Order(true, 100, 25, "F", undefined));

  // Test worst bid changes when deleting worst bid order
  num_tests_run++;
  try {
    await exchange.cancelOrder(new Order(true, 100, 20, "D", ts_d));
    assert.strictEqual(exchange.db.get("metadata").worst_bid, 25);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 5");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  let ts_g = await exchange.addOrder(new Order(false, 50, 80, "G", undefined));
  let ts_h = await exchange.addOrder(new Order(false, 50, 100, "H", undefined));

  // Test best ask changes when deleting best ask order
  num_tests_run++;
  try {
    await exchange.cancelOrder(new Order(false, 50, 80, "G", ts_g));
    assert.strictEqual(exchange.db.get("metadata").best_ask, 100);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 6");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  let ts_i = await exchange.addOrder(new Order(false, 50, 120, "I", undefined));

  // Test worst ask changes when deleting worst ask order
  num_tests_run++;
  try {
    await exchange.cancelOrder(new Order(false, 50, 120, "I", ts_i));
    assert.strictEqual(exchange.db.get("metadata").worst_ask, 100);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 7");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test cancelling non-existent order
  num_tests_run++;
  try {
    await exchange.cancelOrder(new Order(false, 233, 89, "J", ts_i)).catch(
      error => {assert.strictEqual(error.message, "InvalidOrder")});
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 8");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Compute stats of tests that passed/failed
  if (num_tests_passed === num_tests_run) {
    console.log("ALL " + num_tests_run + " cancelOrder TESTS PASSED!");
  } else {
    console.log("NOT ALL cancelOrder TESTS PASSED!");
    console.log(num_tests_passed + " out of " + num_tests_run + " tests passed.");
  }

  exchange.db.close();


  // TEST: depleteOrder

  num_tests_failed = 0;
  num_tests_run = 0;
  num_tests_passed = 0;

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_k = await exchange.addOrder(new Order(true, 50, 100, "K", undefined));

  // Test normal behaviour for depleting order
  num_tests_run++;
  try {
    await exchange.depleteOrder(new Order(true, 50, 100, "K", ts_k), 20)
    assert.strictEqual(exchange.db.get(100)[0].amount, 30);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: depleteOrder: Test 1");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test attempting to deplete too much from order raises error
  num_tests_run++;
  try {
    await exchange.depleteOrder(new Order(true, 50, 100, "K", ts_k), 60).catch(
      error => {assert.strictEqual(error.message, "InvalidDepletionAmount")});
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: depleteOrder: Test 2");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test attempting to deplete entire order raises error
  num_tests_run++;
  try {
    await exchange.depleteOrder(new Order(true, 50, 100, "K", ts_k), 50).catch(
      error => {assert.strictEqual(error.message, "InvalidDepletionAmount")});
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: depleteOrder: Test 3");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Compute stats of tests that passed/failed
  if (num_tests_passed === num_tests_run) {
    console.log("ALL " + num_tests_run + " depleteOrder TESTS PASSED!");
  } else {
    console.log("NOT ALL depleteOrder TESTS PASSED!");
    console.log(num_tests_passed + " out of " + num_tests_run + " tests passed.");
  }

  exchange.db.close();


  // TEST: floatIntConversion: storing floats as int functionality

  num_tests_failed = 0;
  num_tests_run = 0;
  num_tests_passed = 0;

  exchange = new TradingPairExchange('test-db', ipfs, 0.01, 2, 3);
  await exchange.init();

  let ts_l = await exchange.addOrder(new Order(true, 100.111, 67.70, "L", undefined));

  // Test amount stored correctly internally
  num_tests_run++;
  try {
    assert.strictEqual(exchange.db.get(6770)[0].amount, 100111);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: floatIntConversion: Test 1");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test price stored correctly internally
  num_tests_run++;
  try {
    assert.strictEqual(exchange.db.get(6770)[0].price, 6770);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: floatIntConversion: Test 2");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test shiftToInt static method, shifting by same no. of decimals as
  // accuracy of float
  num_tests_run++;
  try {
    assert.strictEqual(TradingPairExchange.shiftToInt(101.987, 3), 101987);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: floatIntConversion: Test 3");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test shiftToInt static method, shifting by fewer no. of decimals to
  // accuracy of float
  num_tests_run++;
  try {
    assert.strictEqual(TradingPairExchange.shiftToInt(101.987, 2), 10199);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: floatIntConversion: Test 4");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test shiftToInt static method, shifting by greater no. of decimals to
  // accuracy of float
  num_tests_run++;
  try {
    assert.strictEqual(TradingPairExchange.shiftToInt(101.987, 4), 1019870);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: floatIntConversion: Test 5");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test shiftToFloat static method, shifting by same no. of decimals as
  // accuracy of float
  num_tests_run++;
  try {
    assert.strictEqual(TradingPairExchange.shiftToFloat(101987, 3), 101.987);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: floatIntConversion: Test 6");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test shiftToFloat static method, shifting by fewer no. of decimals to
  // accuracy of float
  num_tests_run++;
  try {
    assert.strictEqual(TradingPairExchange.shiftToFloat(10199, 2), 101.99);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: floatIntConversion: Test 7");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test shiftToFloat static method, shifting by greater no. of decimals to
  // accuracy of float
  num_tests_run++;
  try {
    assert.strictEqual(TradingPairExchange.shiftToFloat(1019870, 4), 101.987);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: floatIntConversion: Test 8");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Compute stats of tests that passed/failed
  if (num_tests_passed === num_tests_run) {
    console.log("ALL " + num_tests_run + " floatIntConversion TESTS PASSED!");
  } else {
    console.log("NOT ALL floatIntConversion TESTS PASSED!");
    console.log(num_tests_passed + " out of " + num_tests_run + " tests passed.");
  }

  exchange.db.close();


  // TEST matchOrder.
  // Test for buy orders.
  let order;

  num_tests_failed = 0;
  num_tests_run = 0;
  num_tests_passed = 0;

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_1 = await exchange.addOrder(new Order(false, 10, 100, "#1", undefined));
  let ts_2 = await exchange.addOrder(new Order(false, 10, 100, "#2", undefined));
  let ts_3 = await exchange.addOrder(new Order(false, 15, 100, "#3", undefined));
  let ts_4 = await exchange.addOrder(new Order(false, 20, 120, "#4", undefined));

  // Test that taker order price is too low for matching.
  num_tests_run++;
  try {
    order = new Order(true, 20, 90, "#5", undefined);
    let ts_5 = await exchange.addOrder(order);
    console.log
    assert.strictEqual(exchange.trade_queue.length, [].length);
    assert.strictEqual(JSON.stringify(exchange.db.get(90)[0]), JSON.stringify(new Order(true, 20, 90, "#5", ts_5)));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Buy order: Test 1");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  // Test that no maker orders exist.
  num_tests_run++;
  try {
    order = new Order(true, 20, 90, "#6", undefined);
    let ts_6 = await exchange.addOrder(order);
    assert.strictEqual(exchange.trade_queue.length, [].length);
    assert.strictEqual(JSON.stringify(exchange.db.get(90)[0]), JSON.stringify(new Order(true, 20, 90, "#6", ts_6)));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Buy Order: Test 2");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();
  

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_7 = await exchange.addOrder(new Order(false, 10, 50, "#7", undefined));
  let ts_8 = await exchange.addOrder(new Order(false, 10, 100, "#8", undefined));

  // Test the case that one taker order fully depletes one maker order.
  num_tests_run++;
  try {
    order = new Order(true, 10, 50, "#9", undefined);
    let ts_9 = await exchange.addOrder(order);
    let trade_queue = exchange.trade_queue;
    assert.strictEqual(JSON.stringify(trade_queue[0].maker_order), JSON.stringify(new Order(false, 10, 50, "#7", ts_7)));
    assert.strictEqual(JSON.stringify(trade_queue[0].taker_order), JSON.stringify(new Order(true, 10, 50, "#9", ts_9)));
    assert.strictEqual(exchange.db.get(50).length, 0);
    assert.strictEqual(JSON.stringify(exchange.db.get(100)[0]), JSON.stringify(new Order(false, 10, 100, "#8", ts_8)));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Buy Order: Test 3");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();


  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_10 = await exchange.addOrder(new Order(false, 20, 50, "#10", undefined));
  let ts_11 = await exchange.addOrder(new Order(false, 10, 100, "#11", undefined));

  // Test the case that one taker order partially depletes one maker order.
  num_tests_run++;
  try {
    order = new Order(true, 9, 50, "#12", undefined);
    let ts_12 = await exchange.addOrder(order);
    let trade_queue = exchange.trade_queue;
    assert.strictEqual(JSON.stringify(trade_queue[0].maker_order), JSON.stringify(new Order(false, 9, 50, "#10", ts_10)));
    assert.strictEqual(JSON.stringify(trade_queue[0].taker_order), JSON.stringify(new Order(true, 9, 50, "#12", ts_12)));

    assert.strictEqual(JSON.stringify(exchange.db.get(50)[0]), JSON.stringify(new Order(false, 11, 50, "#10", ts_10)));
    assert.strictEqual(JSON.stringify(exchange.db.get(100)[0]), JSON.stringify(new Order(false, 10, 100, "#11", ts_11)));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Buy Order: Test 4");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();


  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_13 = await exchange.addOrder(new Order(false, 10, 100, "#13", undefined));
  let ts_14 = await exchange.addOrder(new Order(false, 15, 100, "#14", undefined));
  let ts_15 = await exchange.addOrder(new Order(false, 20, 120, "#15", undefined));

  // Test the case that a taker order partially depletes
  // multiple maker orders in a single queue.
  num_tests_run++;
  try {
    order = new Order(true, 20, 100, "#16", undefined);
    let ts_16 = await exchange.addOrder(order);
    let trade_queue = exchange.trade_queue;
    assert.strictEqual(JSON.stringify(trade_queue[0].maker_order), JSON.stringify(new Order(false, 10, 100, "#13", ts_13)));
    assert.strictEqual(JSON.stringify(trade_queue[0].taker_order), JSON.stringify(new Order(true, 10, 100, "#16", ts_16)));
    assert.strictEqual(JSON.stringify(trade_queue[1].maker_order), JSON.stringify(new Order(false, 10, 100, "#14", ts_14)));
    assert.strictEqual(JSON.stringify(trade_queue[1].taker_order), JSON.stringify(new Order(true, 10, 100, "#16", ts_16)));

    assert.strictEqual(exchange.db.get(100).length, 1);

    assert.strictEqual(JSON.stringify(exchange.db.get(100)[0]), JSON.stringify(new Order(false, 5, 100, "#14", ts_14)));
    assert.strictEqual(JSON.stringify(exchange.db.get(120)[0]), JSON.stringify(new Order(false, 20, 120, "#15", ts_15)));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Buy Order: Test 5");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_17 = await exchange.addOrder(new Order(false, 10, 100, "#17", undefined));
  let ts_18 = await exchange.addOrder(new Order(false, 10, 100, "#18", undefined));
  let ts_19 = await exchange.addOrder(new Order(false, 15, 100, "#19", undefined));
  let ts_20 = await exchange.addOrder(new Order(false, 20, 120, "#20", undefined));

  // Test the case that a taker order fully depletes the
  // entire queue of maker orders exactly.
  num_tests_run++;
  try {
    order = new Order(true, 35, 100, "#21", undefined);
    let ts_21 = await exchange.addOrder(order);
    let trade_queue = exchange.trade_queue;
    assert.strictEqual(JSON.stringify(trade_queue[0].maker_order), JSON.stringify(new Order(false, 10, 100, "#17", ts_17)));
    assert.strictEqual(JSON.stringify(trade_queue[0].taker_order), JSON.stringify(new Order(true, 10, 100, "#21", ts_21)));
    assert.strictEqual(JSON.stringify(trade_queue[1].maker_order), JSON.stringify(new Order(false, 10, 100, "#18", ts_18)));
    assert.strictEqual(JSON.stringify(trade_queue[1].taker_order), JSON.stringify(new Order(true, 10, 100, "#21", ts_21)));
    assert.strictEqual(JSON.stringify(trade_queue[2].maker_order), JSON.stringify(new Order(false, 15, 100, "#19", ts_19)));
    assert.strictEqual(JSON.stringify(trade_queue[2].taker_order), JSON.stringify(new Order(true, 15, 100, "#21", ts_21)));

    assert.strictEqual(exchange.db.get(100).length, 0);
    assert.strictEqual(JSON.stringify(exchange.db.get(120)[0]), JSON.stringify(new Order(false, 20, 120, "#20", ts_20)));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Buy Order: Test 6");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_21 = await exchange.addOrder(new Order(false, 10, 100, "#21", undefined));
  let ts_22 = await exchange.addOrder(new Order(false, 10, 110, "#22", undefined));
  let ts_23 = await exchange.addOrder(new Order(false, 20, 120, "#23", undefined));

  // Test the case that a taker order depletes several maker order
  // queues and partially depletes the last queue.
  num_tests_run++;
  try {
    order = new Order(true, 30, 120, "#24", undefined);
    let ts_24 = await exchange.addOrder(order);
    let trade_queue = exchange.trade_queue;
    assert.strictEqual(JSON.stringify(trade_queue[0].maker_order), JSON.stringify(new Order(false, 10, 100, "#21", ts_21)));
    assert.strictEqual(JSON.stringify(trade_queue[0].taker_order), JSON.stringify(new Order(true, 10, 100, "#24", ts_24)));
    assert.strictEqual(JSON.stringify(trade_queue[1].maker_order), JSON.stringify(new Order(false, 10, 110, "#22", ts_22)));
    assert.strictEqual(JSON.stringify(trade_queue[1].taker_order), JSON.stringify(new Order(true, 10, 110, "#24", ts_24)));
    assert.strictEqual(JSON.stringify(trade_queue[2].maker_order), JSON.stringify(new Order(false, 10, 120, "#23", ts_23)));
    assert.strictEqual(JSON.stringify(trade_queue[2].taker_order), JSON.stringify(new Order(true, 10, 120, "#24", ts_24)));

    assert.strictEqual(exchange.db.get(100).length, 0);
    assert.strictEqual(exchange.db.get(110).length, 0);
    assert.strictEqual(JSON.stringify(exchange.db.get(120)[0]), JSON.stringify(new Order(false, 10, 120, "#23", ts_23)));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Buy Order: Test 7");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_25 = await exchange.addOrder(new Order(false, 10, 100, "#25", undefined));
  let ts_26 = await exchange.addOrder(new Order(false, 10, 110, "#26", undefined));
  let ts_27 = await exchange.addOrder(new Order(false, 20, 120, "#27", undefined));

  // Test the case that a taker order depletes all the maker orders exactly.
  num_tests_run++;
  try {
    order = new Order(true, 40, 120, "#28", undefined);
    let ts_28 = await exchange.addOrder(order);
    let trade_queue = exchange.trade_queue;
    assert.strictEqual(JSON.stringify(trade_queue[0].maker_order), JSON.stringify(new Order(false, 10, 100, "#25", ts_25)));
    assert.strictEqual(JSON.stringify(trade_queue[0].taker_order), JSON.stringify(new Order(true, 10, 100, "#28", ts_28)));
    assert.strictEqual(JSON.stringify(trade_queue[1].maker_order), JSON.stringify(new Order(false, 10, 110, "#26", ts_26)));
    assert.strictEqual(JSON.stringify(trade_queue[1].taker_order), JSON.stringify(new Order(true, 10, 110, "#28", ts_28)));
    assert.strictEqual(JSON.stringify(trade_queue[2].maker_order), JSON.stringify(new Order(false, 20, 120, "#27", ts_27)));
    assert.strictEqual(JSON.stringify(trade_queue[2].taker_order), JSON.stringify(new Order(true, 20, 120, "#28", ts_28)));

    assert.strictEqual(exchange.db.get(100).length, 0);
    assert.strictEqual(exchange.db.get(110).length, 0);
    assert.strictEqual(exchange.db.get(120).length, 0);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Buy Order: Test 8");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_29 = await exchange.addOrder(new Order(false, 10, 100, "#29", undefined));
  let ts_30 = await exchange.addOrder(new Order(false, 10, 110, "#30", undefined));
  let ts_31 = await exchange.addOrder(new Order(false, 20, 120, "#31", undefined));

  // Test the case that a taker order depletes all the sell
  // orders with some amount unfilled.
  num_tests_run++;
  try {
    order = new Order(true, 50, 120, "#32", undefined);
    let ts_32 = await exchange.addOrder(order);
    let trade_queue = exchange.trade_queue;
    assert.strictEqual(JSON.stringify(trade_queue[0].maker_order), JSON.stringify(new Order(false, 10, 100, "#29", ts_29)));
    assert.strictEqual(JSON.stringify(trade_queue[0].taker_order), JSON.stringify(new Order(true, 10, 100, "#32", ts_32)));
    assert.strictEqual(JSON.stringify(trade_queue[1].maker_order), JSON.stringify(new Order(false, 10, 110, "#30", ts_30)));
    assert.strictEqual(JSON.stringify(trade_queue[1].taker_order), JSON.stringify(new Order(true, 10, 110, "#32", ts_32)));
    assert.strictEqual(JSON.stringify(trade_queue[2].maker_order), JSON.stringify(new Order(false, 20, 120, "#31", ts_31)));
    assert.strictEqual(JSON.stringify(trade_queue[2].taker_order), JSON.stringify(new Order(true, 20, 120, "#32", ts_32)));

    assert.strictEqual(exchange.db.get(100).length, 0);
    assert.strictEqual(exchange.db.get(110).length, 0);
    assert.strictEqual(JSON.stringify(exchange.db.get(120)[0]), JSON.stringify(new Order(true, 10, 120, "#32", ts_32)));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Buy Order: Test 9");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_33 = await exchange.addOrder(new Order(false, 10, 100, "#33", undefined));
  let ts_34 = await exchange.addOrder(new Order(false, 10, 110, "#34", undefined));

  // Test the best ask changes after depletion.
  num_tests_run++;
  try {
    order = new Order(true, 10, 100, "#35", undefined);
    let ts_35 = await exchange.addOrder(order);
    assert.strictEqual(exchange.db.get("metadata").best_ask, 110);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder, Buy Order: Test 10");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();

  if (num_tests_passed === num_tests_run) {
    console.log("ALL " + num_tests_run + " matchOrder TESTS in Buy Order PASSED!");
  } else {
    console.log("NOT ALL matchOrder TESTS in Buy Order PASSED!");
    console.log(num_tests_passed + " out of " + num_tests_run + " tests passed.");
  }


  // Tests for sell orders

  num_tests_failed = 0;
  num_tests_run = 0;
  num_tests_passed = 0;

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_36 = await exchange.addOrder(new Order(true, 10, 100, "#36", undefined));
  let ts_37 = await exchange.addOrder(new Order(true, 10, 110, "#37", undefined));

  // Test that taker order price is too high for matching.
  num_tests_run++;
  try {
    order = new Order(false, 10, 120, "#38", undefined);
    let ts_38 = await exchange.addOrder(order);
    assert.strictEqual(exchange.trade_queue.length, [].length);
    assert.strictEqual(JSON.stringify(exchange.db.get(120)[0]), JSON.stringify(new Order(false, 10, 120, "#38", ts_38)));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Sell Order: Test 1");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();


  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  // Test that no maker orders exist.
  num_tests_run++;
  try {
    order = new Order(false, 20, 90, "#39", undefined);
    let ts_39 = await exchange.addOrder(order);
    assert.strictEqual(exchange.trade_queue.length, [].length);
    assert.strictEqual(JSON.stringify(exchange.db.get(90)[0]), JSON.stringify(new Order(false, 20, 90, "#39", ts_39)))
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Sell Order: Test 2");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();


  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_40 = await exchange.addOrder(new Order(true, 10, 50, "#40", undefined));
  let ts_41 = await exchange.addOrder(new Order(true, 10, 100, "#41", undefined));

  // Test the case that one taker order fully depletes one maker order.
  num_tests_run++;
  try {
    order = new Order(false, 10, 100, "#42", undefined);
    let ts_42 = await exchange.addOrder(order);
    let trade_queue = exchange.trade_queue;
    assert.strictEqual(JSON.stringify(trade_queue[0].taker_order), JSON.stringify(new Order(false, 10, 100, "#42", ts_42)));
    assert.strictEqual(JSON.stringify(trade_queue[0].maker_order), JSON.stringify(new Order(true, 10, 100, "#41", ts_41)));
    assert.strictEqual(JSON.stringify(exchange.db.get(50)[0]), JSON.stringify(new Order(true, 10, 50, "#40",ts_40)));
    assert.strictEqual(exchange.db.get(100).length, 0);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Sell Order: Test 3");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();


  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_43 = await exchange.addOrder(new Order(true, 20, 50, "#43", undefined));
  let ts_44 = await exchange.addOrder(new Order(true, 10, 100, "#44", undefined));

  // Test the case that a taker order partially depletes one maker order.
  num_tests_run++;
  try {
    order = new Order(false, 5, 100, "#45", undefined);
    let ts_45 = await exchange.addOrder(order);
    let trade_queue = exchange.trade_queue;
    assert.strictEqual(JSON.stringify(trade_queue[0].taker_order), JSON.stringify(new Order(false, 5, 100, "#45", ts_45)));
    assert.strictEqual(JSON.stringify(trade_queue[0].maker_order), JSON.stringify(new Order(true, 5, 100, "#44", ts_44)));

    assert.strictEqual(JSON.stringify(exchange.db.get(100)[0]), JSON.stringify(new Order(true, 5, 100, "#44", ts_44)));
    assert.strictEqual(JSON.stringify(exchange.db.get(50)[0]), JSON.stringify(new Order(true, 20, 50, "#43", ts_43)));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Sell Order: Test 4");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();


  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_46 = await exchange.addOrder(new Order(true, 10, 100, "#46", undefined));
  let ts_47 = await exchange.addOrder(new Order(true, 15, 120, "#47", undefined));
  let ts_48 = await exchange.addOrder(new Order(true, 10, 120, "#48", undefined));

  // Test the case that a taker order partially
  // depletes multiple maker orders in a single queue.
  num_tests_run++;
  try {
    order = new Order(false, 20, 120, "#49", undefined);
    let ts_49 = await exchange.addOrder(order);
    let trade_queue = exchange.trade_queue;
    assert.strictEqual(JSON.stringify(trade_queue[0].taker_order), JSON.stringify(new Order(false, 15, 120, "#49", ts_49)));
    assert.strictEqual(JSON.stringify(trade_queue[0].maker_order), JSON.stringify(new Order(true, 15, 120, "#47", ts_47)));
    assert.strictEqual(JSON.stringify(trade_queue[1].taker_order), JSON.stringify(new Order(false, 5, 120, "#49", ts_49)));
    assert.strictEqual(JSON.stringify(trade_queue[1].maker_order), JSON.stringify(new Order(true, 5, 120, "#48", ts_48)));

    assert.strictEqual(JSON.stringify(exchange.db.get(120)[0]), JSON.stringify(new Order(true, 5, 120, "#48", ts_48)));
    assert.strictEqual(JSON.stringify(exchange.db.get(100)[0]), JSON.stringify(new Order(true, 10, 100, "#46", ts_46)));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Sell Order: Test 5");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();


  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_50 = await exchange.addOrder(new Order(true, 10, 100, "#50", undefined));
  let ts_51 = await exchange.addOrder(new Order(true, 15, 120, "#51", undefined));
  let ts_52 = await exchange.addOrder(new Order(true, 10, 120, "#52", undefined));
  let ts_53 = await exchange.addOrder(new Order(true, 10, 120, "#53", undefined));

  // Test the case that a taker order fully depletes an entire maker order queue exactly.
  num_tests_run++;
  try {
    order = new Order(false, 35, 120, "#54", undefined);
    let ts_54 = await exchange.addOrder(order);
    let trade_queue = exchange.trade_queue;
    assert.strictEqual(JSON.stringify(trade_queue[0].taker_order), JSON.stringify(new Order(false, 15, 120, "#54", ts_54)));
    assert.strictEqual(JSON.stringify(trade_queue[0].maker_order), JSON.stringify(new Order(true, 15, 120, "#51", ts_51)));

    assert.strictEqual(JSON.stringify(trade_queue[1].taker_order), JSON.stringify(new Order(false, 10, 120, "#54", ts_54)));
    assert.strictEqual(JSON.stringify(trade_queue[1].maker_order), JSON.stringify(new Order(true, 10, 120, "#52", ts_52)));

    assert.strictEqual(JSON.stringify(trade_queue[2].taker_order), JSON.stringify(new Order(false, 10, 120, "#54", ts_54)));
    assert.strictEqual(JSON.stringify(trade_queue[2].maker_order), JSON.stringify(new Order(true, 10, 120, "#53", ts_53)));

    assert.strictEqual(JSON.stringify(exchange.db.get(100)[0]), JSON.stringify(new Order(true, 10, 100, "#50", ts_50)));
    assert.strictEqual(exchange.db.get(120).length, 0);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Sell Order: Test 6");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();


  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_55 = await exchange.addOrder(new Order(true, 10, 100, "#55", undefined));
  let ts_56 = await exchange.addOrder(new Order(true, 10, 110, "#56", undefined));
  let ts_57 = await exchange.addOrder(new Order(true, 20, 120, "#57", undefined));

  // Test the case that a taker order depletes several maker order queues
  // and partially depletes the last queue.
  num_tests_run++;
  try {
    order = new Order(false, 35, 100, "#58", undefined);
    let ts_58 = await exchange.addOrder(order);
    let trade_queue = exchange.trade_queue;
    assert.strictEqual(JSON.stringify(trade_queue[0].taker_order), JSON.stringify(new Order(false, 20, 120, "#58", ts_58)));
    assert.strictEqual(JSON.stringify(trade_queue[0].maker_order), JSON.stringify(new Order(true, 20, 120, "#57", ts_57)));
    assert.strictEqual(JSON.stringify(trade_queue[1].taker_order), JSON.stringify(new Order(false, 10, 110, "#58", ts_58)));
    assert.strictEqual(JSON.stringify(trade_queue[1].maker_order), JSON.stringify(new Order(true, 10, 110, "#56", ts_56)));
    assert.strictEqual(JSON.stringify(trade_queue[2].taker_order), JSON.stringify(new Order(false, 5, 100, "#58", ts_58)));
    assert.strictEqual(JSON.stringify(trade_queue[2].maker_order), JSON.stringify(new Order(true, 5, 100, "#55", ts_55)));

    assert.strictEqual(JSON.stringify(exchange.db.get(100)[0]), JSON.stringify(new Order(true, 5, 100, "#55", ts_55)));
    assert.strictEqual(exchange.db.get(110).length, 0);
    assert.strictEqual(exchange.db.get(120).length, 0);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Sell Order: Test 7");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();


  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_59 = await exchange.addOrder(new Order(true, 10, 100, "#59", undefined));
  let ts_60 = await exchange.addOrder(new Order(true, 10, 110, "#60", undefined));
  let ts_61 = await exchange.addOrder(new Order(true, 20, 120, "#61", undefined));

  // Test the case that one taker order depletes all the maker orders exactly.
  num_tests_run++;
  try {
    order = new Order(false, 40, 100, "#62", undefined);
    let ts_62 = await exchange.addOrder(order);
    let trade_queue = exchange.trade_queue;
    assert.strictEqual(JSON.stringify(trade_queue[0].taker_order), JSON.stringify(new Order(false, 20, 120, "#62", ts_62)));
    assert.strictEqual(JSON.stringify(trade_queue[0].maker_order), JSON.stringify(new Order(true, 20, 120, "#61", ts_61)));
    assert.strictEqual(JSON.stringify(trade_queue[1].taker_order), JSON.stringify(new Order(false, 10, 110, "#62", ts_62)));
    assert.strictEqual(JSON.stringify(trade_queue[1].maker_order), JSON.stringify(new Order(true, 10, 110, "#60", ts_60)));
    assert.strictEqual(JSON.stringify(trade_queue[2].taker_order), JSON.stringify(new Order(false, 10, 100, "#62", ts_62)));
    assert.strictEqual(JSON.stringify(trade_queue[2].maker_order), JSON.stringify(new Order(true, 10, 100, "#59", ts_59)));

    assert.strictEqual(exchange.db.get(100).length, 0);
    assert.strictEqual(exchange.db.get(110).length, 0);
    assert.strictEqual(exchange.db.get(120).length, 0);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Sell Order: Test 8");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_63 = await exchange.addOrder(new Order(true, 10, 100, "#63", undefined));
  let ts_64 = await exchange.addOrder(new Order(true, 10, 110, "#64", undefined));
  let ts_65 = await exchange.addOrder(new Order(true, 20, 120, "#65", undefined));

  // Test the case that a taker order depletes all the maker orders
  // with some taker orders unfilled.
  num_tests_run++;
  try {
    order = new Order(false, 50, 100, "#66", undefined);
    let ts_66 = await exchange.addOrder(order);
    let trade_queue = exchange.trade_queue;
    assert.strictEqual(JSON.stringify(trade_queue[0].taker_order), JSON.stringify(new Order(false, 20, 120, "#66", ts_66)));
    assert.strictEqual(JSON.stringify(trade_queue[0].maker_order), JSON.stringify(new Order(true, 20, 120, "#65", ts_65)));
    assert.strictEqual(JSON.stringify(trade_queue[1].taker_order), JSON.stringify(new Order(false, 10, 110, "#66", ts_66)));
    assert.strictEqual(JSON.stringify(trade_queue[1].maker_order), JSON.stringify(new Order(true, 10, 110, "#64", ts_64)));
    assert.strictEqual(JSON.stringify(trade_queue[2].taker_order), JSON.stringify(new Order(false, 10, 100, "#66", ts_66)));
    assert.strictEqual(JSON.stringify(trade_queue[2].maker_order), JSON.stringify(new Order(true, 10, 100, "#63", ts_63)));

    assert.strictEqual(exchange.db.get(120).length, 0);
    assert.strictEqual(exchange.db.get(110).length, 0);
    assert.strictEqual(JSON.stringify(exchange.db.get(100)[0]), JSON.stringify(new Order(false, 10, 100, "#66", ts_66)));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Sell Order: Test 9");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_67 = await exchange.addOrder(new Order(true, 10, 100, "#67", undefined));
  let ts_68 = await exchange.addOrder(new Order(true, 10, 110, "#68", undefined));

  // Test the best bid changes after depletion.
  num_tests_run++;
  try {
    order = new Order(false, 10, 110, "#69", undefined);
    let ts_69 = await exchange.addOrder(order);
    assert.strictEqual(exchange.db.get("metadata").best_bid, 100);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: matchOrder, Sell Order: Test 10");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();

  if (num_tests_passed === num_tests_run) {
    console.log("ALL " + num_tests_run + " matchOrder TESTS in Sell Order PASSED!");
  } else {
    console.log("NOT ALL matchOrder TESTS in Sell Order PASSED!");
    console.log(num_tests_passed + " out of " + num_tests_run + " tests passed.");
  }


  // Tests for getTradeHistoryPerUser

  num_tests_failed = 0;
  num_tests_run = 0;
  num_tests_passed = 0;

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_70 = await exchange.addOrder(new Order(true, 10, 100, "#70", undefined));
  let ts_71 = await exchange.addOrder(new Order(false, 10, 100, "#71", undefined));

  // Test that can retrieve single past trade
  num_tests_run++;
  try {
    await exchange.addTradeToTradeHistory(await exchange.popNextTrade());
    let hist = exchange.getTradeHistoryPerUser("#70");
    assert.strictEqual(hist.length, 1);
    hist[0].timestamp = undefined;
    assert.strictEqual(
      JSON.stringify(new Order(true, 10, 100, "#70", undefined)),
      JSON.stringify(hist[0]));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: getTradeHistoryPerUser: Test 1");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();


  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_72 = await exchange.addOrder(new Order(true, 5, 100, "#72", undefined));
  let ts_72_2 = await exchange.addOrder(new Order(true, 4, 100, "#72", undefined));
  let ts_73 = await exchange.addOrder(new Order(false, 10, 100, "#73", undefined));

  // Test that can retrieve multiple past trades, in chronological order
  num_tests_run++;
  try {
    await exchange.addTradeToTradeHistory(await exchange.popNextTrade());
    await exchange.addTradeToTradeHistory(await exchange.popNextTrade());
    let hist = exchange.getTradeHistoryPerUser("#72");
    assert.strictEqual(hist.length, 2);
    hist[0].timestamp = undefined;
    hist[1].timestamp = undefined;
    assert.strictEqual(
      JSON.stringify(new Order(true, 4, 100, "#72", undefined)),
      JSON.stringify(hist[0]));
    assert.strictEqual(
      JSON.stringify(new Order(true, 5, 100, "#72", undefined)),
      JSON.stringify(hist[1]));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: getTradeHistoryPerUser: Test 2");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();


  if (num_tests_passed === num_tests_run) {
    console.log("ALL " + num_tests_run + " getTradeHistoryPerUser TESTS PASSED!");
  } else {
    console.log("NOT ALL getTradeHistoryPerUser TESTS PASSED!");
    console.log(num_tests_passed + " out of " + num_tests_run + " tests passed.");
  }

  // Tests for getPendingOrdersPerUser

  num_tests_failed = 0;
  num_tests_run = 0;
  num_tests_passed = 0;

  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_74 = await exchange.addOrder(new Order(true, 10, 100, "#74", undefined));

  // Test that can retrieve single pending order
  num_tests_run++;
  try {
    let orders = exchange.getPendingOrdersPerUser("#74");
    assert.strictEqual(orders.length, 1);
    orders[0].timestamp = undefined;
    assert.strictEqual(
      JSON.stringify(new Order(true, 10, 100, "#74", undefined)),
      JSON.stringify(orders[0]));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: getPendingOrdersPerUser: Test 1");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();


  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_75 = await exchange.addOrder(new Order(true, 10, 100, "#75", undefined));
  let ts_75_2 = await exchange.addOrder(new Order(true, 20, 100, "#75", undefined));

  // Test that can retrieve multiple pending orders
  num_tests_run++;
  try {
    let orders = exchange.getPendingOrdersPerUser("#75");
    assert.strictEqual(orders.length, 2);
    orders[0].timestamp = undefined;
    orders[1].timestamp = undefined;
    assert.strictEqual(
      JSON.stringify(new Order(true, 10, 100, "#75", undefined)),
      JSON.stringify(orders[1]));
    assert.strictEqual(
      JSON.stringify(new Order(true, 20, 100, "#75", undefined)),
      JSON.stringify(orders[0]));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: getPendingOrdersPerUser: Test 2");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();


  exchange = new TradingPairExchange('test-db', ipfs, 1);
  await exchange.init();

  let ts_76 = await exchange.addOrder(new Order(true, 10, 100, "#76", undefined));
  let ts_76_2 = await exchange.addOrder(new Order(true, 20, 100, "#76", undefined));

  // Test that cancelled orders are removed from pending orders
  num_tests_run++;
  try {
    await exchange.cancelOrder(new Order(true, 20, 100, "#76", ts_76_2));
    let orders = exchange.getPendingOrdersPerUser("#76");
    assert.strictEqual(orders.length, 1);
    orders[0].timestamp = undefined;
    assert.strictEqual(
      JSON.stringify(new Order(true, 10, 100, "#76", undefined)),
      JSON.stringify(orders[0]));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: getPendingOrdersPerUser: Test 3");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  exchange.db.close();


  if (num_tests_passed === num_tests_run) {
    console.log("ALL " + num_tests_run + " getPendingOrdersPerUser TESTS PASSED!");
  } else {
    console.log("NOT ALL getPendingOrdersPerUser TESTS PASSED!");
    console.log(num_tests_passed + " out of " + num_tests_run + " tests passed.");
  }

})
