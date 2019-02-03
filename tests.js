let ob_functions = require('./ob_functions');
let addOrder = ob_functions.addOrder;
let cancelOrder = ob_functions.cancelOrder;

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
    best_bid: 1,
    best_ask: 1,
    tick_size: 0.01,
  });

  // Test that retrieved metadata is as expected
  num_tests_run++;
  try {
    let result = db.get("metadata");
    assert.strictEqual(JSON.stringify(result), JSON.stringify({
      best_bid: 1,
      best_ask: 1,
      tick_size: 0.01
    }));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  await addOrder(db, true, 100.0, 20, "A");

  // Test that length of queue at key 20 is 1, after putting a single order into it
  num_tests_run++;
  try {
    assert.strictEqual(db.get(20).length, 1);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test that object we can fetch the object we just put in, as expected
  num_tests_run++;
  try {
    let result = db.get(20)[0];
    result.timestamp = "PASS";
    assert.strictEqual(JSON.stringify(result), JSON.stringify({
      is_buy: true,
      amount: 100.0,
      price: 20,
      timestamp: "PASS",
      user: "A"
    }));
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }
    
  await addOrder(db, true, 50.0, 20, "B");
  
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
    best_bid: 1,
    best_ask: 1,
    tick_size: 0.01,
  });

  let ts_a = await addOrder(db, true, 100.0, 20, "A");
  let ts_b = await addOrder(db, true, 50.0, 20, "B");

  // Test cancelling orders within same queue, queue length changes
  num_tests_run++;
  try {
    await cancelOrder(db, 20, "A", ts_a);
    assert.strictEqual(db.get(20).length, 1);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  let ts_c = await addOrder(db, true, 100.0, 20, "C");

  // // Test cancelling orders within same queue, correct order gets cancelled
  num_tests_run++;
  try {
    await cancelOrder(db, 20, "B", ts_b);
    assert.strictEqual(db.get(20)[0].user, "C");
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }

  // Test cancel last order in queue, queue becomes empty
  num_tests_run++;
  try {
    await cancelOrder(db, 20, "C", ts_c);
    assert.strictEqual(db.get(20).length, 0);
    num_tests_passed++;
  } catch (err) {
    num_tests_failed++;
    console.log(err.name, ": ", err.actual, err.operator, err.expected);
  }


  // Test best bid changes when deleting best bid order

  // Test best ask changes when deleting best ask order

  // Test cancelling non-existent order


  // Compute stats of tests that passed/failed
  if (num_tests_passed === num_tests_run) {
    console.log("ALL " + num_tests_run + " cancelOrder TESTS PASSED!");
  } else {
    console.log("NOT ALL cancelOrder TESTS PASSED!");
    console.log(num_tests_passed + " out of " + num_tests_run + " tests passed.");
  }

  db.close();

})
