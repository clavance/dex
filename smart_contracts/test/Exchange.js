var Exchange = artifacts.require("./Exchange.sol");

contract('Exchange', function(accounts) {
	var exchangeInstance;
	var buyer = accounts[1];
	var orbitPrice = 100; //price of ORB in DEX
	var _numberOfTokens = 1000; //number of ORB 

	it('constructor initialises with correct initial values', function() {
		return Exchange.deployed().then(function(instance) {
			exchangeInstance = instance;
			return exchangeInstance.address
		}).then(function(address) {
			//test covers constructor
			assert.notEqual(address, '0xA', 'has contract address');
			return exchangeInstance.orbitContract();
		}).then(function(address) {
			assert.notEqual(address, '0xA', 'has token contract address');
			return exchangeInstance.dexContract();
		}).then(function(address) {
			assert.notEqual(address, '0xA', 'has token contract address');
			return exchangeInstance.orbitPrice();
		}).then(function(price) {
			assert.equal(price, orbitPrice, 'orbit price is correct');
		});
	});

	it('allows the transfer of tokens', function() {
		return Exchange.deployed().then(function(instance){
			exchangeInstance = instance;
			var value = _numberOfTokens * orbitPrice;
			return exchangeInstance.transferTokens(_numberOfTokens, { from: buyer, value: value });
		}).then(function(receipt) {
			return exchangeInstance.tokensSold();
		}).then(function(amount) {
			assert.equal(amount, _numberOfTokens, 'number of tokens sold = number bought');
		});
	});
});