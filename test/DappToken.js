var DappToken = artifacts.require("./DappToken.sol");

contract('DappToken', function(accounts) {
	it('sets the total supply on deployment', function() {
		return DappToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 1000000, 'sets total supply to 1,000,000');
		});
	});
})