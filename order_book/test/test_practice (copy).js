'use strict'

const assert = require('assert')

const OrbitDB = require('orbit-db');
const IPFS = require('ipfs');

const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  }
}

describe(`orbit-db - practice tests`, function() {
  let ipfs;

  before(async () => {
    ipfs = new IPFS(ipfsOptions);
  })

  it('put', async () => {
    ipfs.on('ready', async () => {

      let orbitdb = new OrbitDB(ipfs);
      let db = await orbitdb.keyvalue('test-db-1');

      await db.put('key1', 'a')
      const value = db.get('key1')
      assert.equal(value, 'a')

      db.close();

    });
  })

  it('put-2', async () => {
    ipfs.on('ready', async () => {

      let orbitdb = new OrbitDB(ipfs);
      let db = await orbitdb.keyvalue('test-db-2');

      await db.put('key1', 'a')
      const value = db.get('key1')
      assert.equal(value, 'b')

      db.close();

    });    
  })
  
});