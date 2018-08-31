var Migrations = artifacts.require("./Migrations.sol");
var GGToken = artifacts.require("./GGToken.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(GGToken);
};
