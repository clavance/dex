var DexToken = artifacts.require("./DexToken.sol");

contract('DexToken', function(accounts) {
	var tokenInstance;

	it('initialises contract with correct values', function() {
		return DexToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name) {
			assert.equal(name, 'Dex Token', 'token initialised with correct name');
			return tokenInstance.symbol();
		}).then(function(symbol) {
			assert.equal(symbol, 'DEX', 'token initialised with correct symbol');
			return tokenInstance.version();
		}).then(function(version) {
			assert.equal(version, 'DEX v1.0', 'token version correct');
		});
	});

	it('allocates initial supply on deployment', function() {
		return DexToken.deployed().then(function(instance) {
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
		return DexToken.deployed().then(function(instance) {
			tokenInstance = instance;
			//test 'require' statement
			//should throw error if sum transferred is larger than sender's balance
			//note 'call' doesn't trigger a transaction, only an inspection
			//only 'transfer' triggers transaction
			return tokenInstance.transfer.call(accounts[1], 10000000000);
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
			//transfer should return boolean value true
			return tokenInstance.transfer.call(accounts[1], 100000, { from: accounts[0]} );
		}).then(function(success) {
			assert.equal(success, true, 'returns true');
			//transfer 100,000 DEX from sender to recipient
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

	it('allows approval of third party for token transfers', function() {
		return DexToken.deployed().then(function(instance) {
			tokenInstance = instance;
			//test 'approve' function with call
			return tokenInstance.approve.call(accounts[1], 100);
		}).then(function(success) {
			assert.equal(success, true, 'returns true');
			//'approve' calls the approve function
			return tokenInstance.approve(accounts[1], 100, { from: accounts[0]});
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Approval', 'should be Approval event');
			assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs account which authorised the the token transfers by third party');
			assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs account which is authorised to transfer the tokens');
			assert.equal(receipt.logs[0].args._value, 100, 'logs transfer amount');
			return tokenInstance.allowance(accounts[0], accounts[1]);
		}).then(function(allowance) {
			assert.equal(allowance, 100, 'stores allowance for third party transfer');
		});
	});

	it('transfers tokens from sender to receiver via approved third party'+
		' updates balances and allowances, and triggers Transfer event', function() {
			return DexToken.deployed().then(function(instance) {
				tokenInstance = instance;
				//sending account
				fromAccount = accounts[2];
				//recipient account
				toAccount =  accounts[3];
				//approved third party's account
				sendingAccount = accounts[4];
				//transfer tokens from main account with all the tokens to fromAccount
				return tokenInstance.transfer(fromAccount, 1000, { from: accounts[0]} );
			}).then(function(receipt) {
				//approve third party 
				return tokenInstance.approve(sendingAccount, 100, { from: fromAccount });
			}).then(function(receipt) {
				//test transfer which is larger than sendingAccount balance
				return tokenInstance.transferFrom(fromAccount, toAccount, 10000, { from: sendingAccount});
				//should return error message since amount is too large
			}).then(assert.fail).catch(function(error) {
				assert(error.message.indexOf('revert') >= 0, 'amount to be transferred is larger than available balance');
				//transfer larger than approved amount
				return tokenInstance.transferFrom(fromAccount, toAccount, 101, { from: sendingAccount});
			}).then(assert.fail).catch(function(error) {
				assert(error.message.indexOf('revert') >= 0, 'amount to be transferred is larger than allowance');
				//test that 99 tokens can be transferred, since < allowance, but only call
				return tokenInstance.transferFrom.call(fromAccount, toAccount, 99, { from: sendingAccount});
				//if successful, must return true
			}).then(function(success) {
				assert.equal(success, true);
				return tokenInstance.transferFrom(fromAccount, toAccount, 80, { from: sendingAccount});
			}).then(function(receipt) {
				assert.equal(receipt.logs.length, 1, 'triggers one event');
				assert.equal(receipt.logs[0].event, 'Transfer', 'should be Transfer event');
				assert.equal(receipt.logs[0].args._from, fromAccount, 'logs account tokens are transferred from');
				assert.equal(receipt.logs[0].args._to, toAccount, 'logs account tokens are transferred to');
				assert.equal(receipt.logs[0].args._value, 80, 'logs transfer amount');
				return tokenInstance.balanceOf(fromAccount);
			}).then(function(balance) {
				assert.equal(balance.toNumber(), 920, 'deducts 80 tokens from sending account');
				return tokenInstance.balanceOf(toAccount);
			}).then(function(balance) {
				assert.equal(balance.toNumber(), 80, 'adds 80 tokens to recieving account');
				return tokenInstance.allowance(fromAccount, sendingAccount);
			}).then(function(allowance) {
				assert.equal(allowance.toNumber(), 20, 'deducts 80 tokens from allowance of 100');
			});
		});
});





































//