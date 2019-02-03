const addOrder = require('./ob_functions');
const assert = require('assert');
const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');


let num_tests_failed = 0;
let num_tests_run = 0;
let num_tests_passed = 0;

const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  }
}

let db;

// Create IPFS instance
const ipfs = new IPFS(ipfsOptions);


ipfs.on('ready', async () => {
  // Create OrbitDB instance
  const orbitdb = new OrbitDB(ipfs)

  db = await orbitdb.keyvalue('test-database-1')

  await db.put("metadata", {
    best_bid: 1,
    best_ask: 1,
    tick_size: 0.01,
  })

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
    console.log("ALL " + num_tests_run + " TESTS PASSED!")
  } else {
    console.log("NOT ALL TESTS PASSED!")
    console.log(num_tests_passed + " out of " + num_tests_run + " tests passed.")

  }

  db.close();

})
