var OrbitToken = artifacts.require("./OrbitToken.sol");

module.exports = function(deployer) {
  deployer.deploy(OrbitToken, 1000000);
};
