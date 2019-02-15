"use strict"

let ob_functions = require('./ob_functions');
let addOrder = ob_functions.addOrder;
let cancelOrder = ob_functions.cancelOrder;
let Order = ob_functions.Order;
let depleteOrder = ob_functions.depleteOrder;

const assert = require('assert');
const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');


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

  // Create OrbitDB instance
  let orbitdb = new OrbitDB(ipfs);
  let db = await orbitdb.keyvalue('test-database-1');

  await db.put("metadata", {
    best_bid: undefined,
    best_ask: undefined,
    tick_size: 1,
    worst_bid: undefined,
    worst_ask: undefined,
  });

  // Test that retrieved metadata is as expected
  num_tests_run++;
  try {
    let result = db.get("metadata");
    assert.strictEqual(JSON.stringify(result), JSON.stringify({
      best_bid: undefined,
      best_ask: undefined,
      tick_size: 1,
      worst_bid: undefined,
      worst_ask: undefined,
    }));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder: Test 1");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  await addOrder(db, new Order(true, 100, 20, "A", undefined));

  // Test that length of queue at key 20 is 1, after putting a single order into it
  num_tests_run++;
  try {
    assert.strictEqual(db.get(20).length, 1);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder: Test 2");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test that object we can fetch the object we just put in, as expected
  num_tests_run++;
  try {
    let result = db.get(20)[0];
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
    
  await addOrder(db, new Order(true, 50, 20, "B", undefined));
  
  // Test that orders are in correct place in queue, for same key (20)
  num_tests_run++;
  try {
    let result_a = db.get(20)[0];
    let result_b = db.get(20)[1];
    assert.strictEqual(result_a.user, "A");
    assert.strictEqual(result_b.user, "B");
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder: Test 4");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  await addOrder(db, new Order(true, 50, 30, "C", undefined));

  // Test that best_bid in metadata gets updated when adding new best bid order
  num_tests_run++;
  try {
    assert.strictEqual(db.get("metadata").best_bid, 30);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder: Test 5");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  await addOrder(db, new Order(false, 50, 60, "D", undefined));

  // Test that best_ask in metadata gets updated when adding new best ask order
  num_tests_run++;
  try {
    assert.strictEqual(db.get("metadata").best_ask, 60);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder: Test 6");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  await addOrder(db, new Order(false, 50, 100, "E", undefined));

  // Test that worst_ask in metadata gets updated when adding new worst ask order
  num_tests_run++;
  try {
    assert.strictEqual(db.get("metadata").worst_ask, 100);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: addOrder: Test 7");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  await addOrder(db, new Order(true, 50, 10, "F", undefined));

  // Test that worst_bid in metadata gets updated when adding new worst bid order
  num_tests_run++;
  try {
    assert.strictEqual(db.get("metadata").worst_bid, 10);
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

  db.close();


  // TEST: cancelOrder

  num_tests_failed = 0;
  num_tests_run = 0;
  num_tests_passed = 0;

  // Create OrbitDB instance
  orbitdb = new OrbitDB(ipfs);
  db = await orbitdb.keyvalue('test-database-2');

  await db.put("metadata", {
    best_bid: undefined,
    best_ask: undefined,
    tick_size: 1,
    worst_bid: undefined,
    worst_ask: undefined
  });

  let ts_a = await addOrder(db, new Order(true, 100, 20, "A", undefined));
  let ts_b = await addOrder(db, new Order(true, 50, 20, "B", undefined));

  // Test cancelling orders within same queue, queue length changes
  num_tests_run++;
  try {
    await cancelOrder(db, new Order(true, 100, 20, "A", ts_a));
    assert.strictEqual(db.get(20).length, 1);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 1");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  let ts_c = await addOrder(db, new Order(true, 100, 20, "C", undefined));

  // Test cancelling orders within same queue, correct order gets cancelled
  num_tests_run++;
  try {
    await cancelOrder(db, new Order(true, 50, 20, "B", ts_b));
    assert.strictEqual(db.get(20)[0].user, "C");
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 2");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test cancel last order in queue, queue becomes empty
  num_tests_run++;
  try {
    await cancelOrder(db, new Order(true, 100, 20, "C", ts_c));
    assert.strictEqual(db.get(20).length, 0);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 3");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  let ts_d = await addOrder(db, new Order(true, 100, 20, "D", undefined));
  let ts_e = await addOrder(db, new Order(true, 100, 30, "E", undefined));

  // Test best bid changes when deleting best bid order
  num_tests_run++;
  try {
    await cancelOrder(db, new Order(true, 100, 30, "E", ts_e));
    assert.strictEqual(db.get("metadata").best_bid, 20);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 4");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  let ts_f = await addOrder(db, new Order(true, 100, 25, "F", undefined));

  // Test worst bid changes when deleting worst bid order
  num_tests_run++;
  try {
    await cancelOrder(db, new Order(true, 100, 20, "D", ts_d));
    assert.strictEqual(db.get("metadata").worst_bid, 25);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 5");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  let ts_g = await addOrder(db, new Order(false, 50, 80, "G", undefined));
  let ts_h = await addOrder(db, new Order(false, 50, 100, "H", undefined));

  // Test best ask changes when deleting best ask order
  num_tests_run++;
  try {
    await cancelOrder(db, new Order(false, 50, 80, "G", ts_g));
    assert.strictEqual(db.get("metadata").best_ask, 100);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 6");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  let ts_i = await addOrder(db, new Order(false, 50, 120, "I", undefined));

  // Test worst ask changes when deleting worst ask order
  num_tests_run++;
  try {
    await cancelOrder(db, new Order(false, 50, 120, "I", ts_i));
    assert.strictEqual(db.get("metadata").worst_ask, 100);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: cancelOrder: Test 7");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test cancelling non-existent order
  num_tests_run++;
  try {
  	await cancelOrder(db, new Order(false, 233, 89, "J", ts_i)).catch(
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

  db.close();


  // TEST: depleteOrder

  num_tests_failed = 0;
  num_tests_run = 0;
  num_tests_passed = 0;

  // Create OrbitDB instance
  orbitdb = new OrbitDB(ipfs);
  db = await orbitdb.keyvalue('test-database-2');

  await db.put("metadata", {
    best_bid: undefined,
    best_ask: undefined,
    tick_size: 1,
    worst_bid: undefined,
    worst_ask: undefined
  });

  let ts_k = await addOrder(db, new Order(true, 50, 100, "K", undefined));

  // Test normal behaviour for depleting order
  num_tests_run++;
  try {
    await depleteOrder(db, new Order(true, 50, 100, "K", ts_k), 20)
    assert.strictEqual(db.get(100)[0].amount, 30);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log("FAILED: depleteOrder: Test 1");
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test attempting to deplete too much from order raises error
  num_tests_run++;
  try {
  	await depleteOrder(db, new Order(true, 50, 100, "K", ts_k), 60).catch(
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
  	await depleteOrder(db, new Order(true, 50, 100, "K", ts_k), 50).catch(
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

  db.close();
})
