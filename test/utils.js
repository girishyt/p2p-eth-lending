const Utils = artifacts.require("Utils");
const Investment = artifacts.require("Investment");
contract("Utils", accounts=>{
    it("ConversionRate should be set by only admins.",async ()=>{
        var instance = await Utils.deployed();
        var convRate = await instance.setConversionRate.call(5,{from:accounts[0]});
        assert.equal(convRate,5,"Conversion Rate not matching.");
    });

    it("TokenPrice should be set by only admins.",async ()=>{
        var instance = await Utils.deployed();
        var tokenPrice = await instance.setTokenPrice.call(5,{from:accounts[0]});
        assert.equal(tokenPrice,5,"Token Price not matching.");
    });
    
});