const Investment = artifacts.require("Investment");
const Utils = artifacts.require("Utils");
let investContractAddress;
contract("Utils", accounts=>{
    it("Investment Address should be set",async ()=>{
        var instance = await Utils.deployed();
        investContractAddress = await instance.getContractAddress.call('Investment',{from:accounts[9]});
        assert.notEqual(investContractAddress.toString(),'0x0000000000000000000000000000000000000000',"Incorrect Contract Address");
    });
    
});

contract("Investment", accounts=>{
    it("Check Investment Initial Balance", async ()=>{
        var instance = await Investment.at(investContractAddress);
        var balance = await instance.getContractBalance.call();
        assert.equal(balance,0,"Initial Balance should be 0.");
    });

    it("Add First Investment", async()=>{
        var instance = await Investment.at(investContractAddress);
        //Listen for the events.
        instance.contract.events.InvestmentAdded()
        .on('data',(response)=>{
            var invNum = response.returnValues.investmentNumber;
            assert.equal(invNum,1,"Invalid Investment Number");
        }).
        on('error',(err)=>{
            console.error(err);
        });
        await instance.addInvestment(100000,12,2,{from:accounts[1],value:100000});
    });

    it("Add Second Investment", async()=>{
        var instance = await Investment.at(investContractAddress);
        //Listen for the events.
        instance.contract.events.InvestmentAdded()
        .on('data',(response)=>{
            var invNum = response.returnValues.investmentNumber;
            assert.equal(invNum,2,"Invalid Investment Number");
        }).
        on('error',(err)=>{
            console.error(err);
        });
        await instance.addInvestment(200000,24,4,{from:accounts[1],value:200000});
    });

    it("Check Investment Initial Balance After Adding Investments.", async ()=>{
        var instance = await Investment.at(investContractAddress);
        var balance = await instance.getContractBalance.call();
        assert.equal(balance,300000,"Incorrect Balance.");
    });

    it("Add Third Investment. Pass less amount.", async()=>{
        var instance = await Investment.at(investContractAddress);
        try{
            await instance.addInvestment(300000,36,6,{from:accounts[1],value:200000});
            assert(false,"Invest should not get added since the ether sent is less.");
        }
        catch(error){
            assert(true);
            //console.log(error);
        }        
    });

});
