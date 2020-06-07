const Utils = artifacts.require("Utils");
const MasterContract = artifacts.require("MasterContract");
//No need to deploy P2PToken. It will deployed and new instance will be created from
//P2PTokenSale.
//const P2PToken = artifacts.require("P2PToken");
const P2PTokenSale = artifacts.require("P2PTokenSale");
//const tokenInitialSupply = 0;
//Total of 1 crore tokens.
const saleTotalSupply = 10000000;
//1 Token is value is 1 finney (1^15)
const saleTokenPrice = 1000000000000000;

//1 Token is value is 1 finney (1^15)
const conversionRate = 1000000000000000;
module.exports = function(deployer) {
  deployer.deploy(Utils,conversionRate).then(()=>{
    return deployer.deploy(P2PTokenSale,saleTotalSupply,saleTokenPrice,Utils.address).then(()=>{
      return deployer.deploy(MasterContract,Utils.address);
    });
  });
};

