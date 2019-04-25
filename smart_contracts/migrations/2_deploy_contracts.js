var TokenOne = artifacts.require("./TokenOne.sol");
var TokenTwo = artifacts.require("./TokenTwo.sol");
var Exchange = artifacts.require("./Exchange.sol");

module.exports = function(deployer) {
	deployer.deploy(TokenOne);
	deployer.deploy(TokenTwo);
	deployer.deploy(Exchange);
};
