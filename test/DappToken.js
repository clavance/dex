var DappToken = artifacts.require("./DappToken.sol");

contract('DappToken', function(accounts) {
	var tokenInstance;

	it('initialises contract with correct values', function() {
		return DappToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name) {
			assert.equal(name, 'Haha Token', 'token initialised with correct name');
			return tokenInstance.symbol();
		}).then(function(symbol) {
			assert.equal(symbol, 'HAHA', 'token initialised with correct symbol');
			return tokenInstance.version();
		}).then(function(version) {
			assert.equal(version, 'HAHA v1.0', 'token version correct');
		});
	});

	it('allocates initial supply on deployment', function() {
		return DappToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 1000000, 'sets total supply to 1,000,000');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance) {
			assert.equal(adminBalance.toNumber(), 1000000, 'allocates initial supply to admin account address');
		});
	});

	it('transfers tokens from sender to receiver, updates balances and triggers Transfer event', function() {
		return DappToken.deployed().then(function(instance) {
			tokenInstance = instance;
			//test 'require' statement
			//should throw error if sum transferred is larger than sender's balance
			//note 'call' doesn't trigger a transaction, only an inspection
			//'transfer' triggers transaction
			return tokenInstance.transfer.call(accounts[1], 10000000000);
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
			//transfer should return boolean value true
			return tokenInstance.transfer.call(accounts[1], 100000, { from: accounts[0]} );
		}).then(function(success) {
			assert.equal(success, true, 'returns true');
			//transfer 100,000 HAHA from sender to recipient
			return tokenInstance.transfer(accounts[1], 100000, { from: accounts[0] });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be Transfer event');
			assert.equal(receipt.logs[0].args._from, accounts[0], 'logs account tokens are transferred from');
			assert.equal(receipt.logs[0].args._to, accounts[1], 'logs account tokens are transferred to');
			assert.equal(receipt.logs[0].args._value, 100000, 'logs transfer amount');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 100000, 'adds amount to recipient\'s account');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 900000, 'deducts amount from sender\'s account');
		});
	});





})


























//