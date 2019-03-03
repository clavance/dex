var OrbitToken = artifacts.require("./OrbitToken.sol");
var DexToken = artifacts.require("./DexToken.sol");
var Exchange = artifacts.require("./Exchange.sol");

module.exports = function(deployer) {
  deployer.deploy(DexToken, 1000000);
  deployer.deploy(OrbitToken, 1000000).then(function() {
  	// pass addresses of both OrbitToken and DexToken contracts into Exchange constructor
  	// pass price of ORB in DEX in constructor
  	var orbitPrice = 100;
  	return deployer.deploy(Exchange, OrbitToken.address, DexToken.address, orbitPrice);
  });
};
