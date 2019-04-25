const Exchange = artifacts.require("./Exchange.sol");
const IERC20 = artifacts.require("./IERC20.sol");

contract('Exchange', function(accounts) {
  var ex;
  var address;

  // beforeEach('set up contract for each test', async () => {
  // 	ex = await Exchange.new();
  // });

  it('sets an owner', async () => {
  	var [firstAccount] = accounts;
  	ex = await Exchange.new();
  	assert.equal(await ex.owner.call(), firstAccount);
  });

  it('initialises the deployer as the owner', async () => {
  	return Exchange.deployed().then(function(instance) {
  		ex = instance;
  		return ex.owner();
  	}).then(function(result) {
  		assert.equal(result, accounts[0], 'getOwner function works correctly');
  	});
  });

  it('setOwner function triggers SetOwner event', function() {
  	return Exchange.deployed().then(function(instance) {
  		ex = instance;
  		return ex.setOwner(accounts[1]);
  	}).then(function(set) {
  		assert.equal(set.logs.length, 1, 'triggers one event');
  		assert.equal(set.logs[0].event, 'SetOwner', 'SetOwner event triggered');
  		return ex.owner();
  	}).then(function(get) {
  		assert.equal(get, accounts[1], 'sets the newOwner correctly');
  	});
  });

  // it('depositToken reverts if not transferFrom between msg.sender and Exchange', function() {
  // 	return Exchange.deployed().then(function(instance) {
  // 		ex = instance;
  // 		token = accounts[2];
  // 		sender = accounts[3];
  // 		return ex.depositToken(token, 100);
  // 	}).then(assert.fail).catch(function(error) {
  // 		assert(error.message.indexOf('revert') >= 0, 'depositToken not from msg.sender to Exchange');
  // 	})
  // })

  it('depositToken function triggers Deposit event', function() {
  	return Exchange.deployed().then(function(instance) {
  		ex = instance;
  		token = accounts[2];
  		return ex.depositToken(token, 100);
  	}).then(function(deposit) {
  		assert.equal(deposit.logs.length, 1, 'triggers one event');
  		assert.equal(deposit.logs[0].event, 'Deposit', 'Deposit event triggered');
  	})
  })

  it('withdrawToken function triggers Withdraw event', function() {
  	return Exchange.deployed().then(function(instance) {
  		ex = instance;
  		token = accounts[2];
  		return ex.withdrawToken(token, 100);
  	}).then(function(withdraw) {
  		assert.equal(withdraw.logs.length, 1, 'triggers one event');
  		assert.equal(withdraw.logs[0].event, 'Withdraw', 'Withdraw event triggered');
  		return ex.withdrawToken(token, 100);
  	}).then(function(success) {
  		assert.equal(success, true, 'returns true');
  	})
  })



});










































//