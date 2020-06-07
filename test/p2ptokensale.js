const P2PTokenSale = artifacts.require("P2PTokenSale");
const P2PToken = artifacts.require("P2PToken");
const Utils = artifacts.require("Utils");
let tokenContractAddress;
contract("P2PTokenSale", accounts=>{
    
 /*
    it("Begin Sale by Non-Admins", async()=>{
        var instance = await P2PTokenSale.deployed();
        try{
            await instance.beginSale({from:accounts[9]});
        }
        catch(error){
            assert(true);
        }
    });

    it("Begin Token Sale",async ()=>{
        var instance = await P2PTokenSale.deployed();
        instance.contract.events.SaleStarted()
        .on('data',(response)=>{
            var tokenCount = response.returnValues.availableTokens;
            assert.equal(tokenCount,1000000,"Invalid Total Supply.");
        }).
        on('error',(err)=>{
            console.error(err);
        });
        await instance.beginSale({from:accounts[0]});
    });

    it("Initial Token Balance before purchase", async()=>{
        var instance = await P2PTokenSale.deployed();
        var tokens = await instance.getTokenCount(accounts[1]);
        assert.equal(tokens,0,"Initial Token count should be zero.");
    });

    it("Buy Tokens",async ()=>{
        var instance = await P2PTokenSale.deployed();
        var tokensToBuy = 1000;
        instance.contract.events.TokenPurchased()
        .on('data',(response)=>{
            var address = response.returnValues._buyer;
            var tokenCount = response.returnValues._amount;
            assert.equal(tokenCount,1000000,"Invalid Number of tokens bought.");
            assert.equal(address,accounts[1],"Token transferred to wrong address.")
        }).
        on('error',(err)=>{
            console.error(err);
        });
        await instance.buyTokens(tokensToBuy,{from:accounts[1],value:5000});
    });

    it("Token Balance after purchase", async()=>{
        var instance = await P2PTokenSale.deployed();
        var tokens = await instance.getTokenCount(accounts[1]);
        assert.equal(tokens,1000,"Bought token count not matching.");
    });

    it("Buy Tokens - Pass less Ether", async()=>{
        var instance = await P2PTokenSale.deployed();
        var tokensToBuy = 1000;
        try{
            await instance.buyTokens(tokensToBuy,{from:accounts[1],value:4999});
        }
        catch(error){
            assert(true);
            //console.log(error);
        }
    });
    */
});


contract("P2PToken", accounts=>{

    it("Begin Sale by Non-Admins", async()=>{
        var instance = await P2PTokenSale.deployed();
        try{
            await instance.beginSale({from:accounts[9]});
            assert(false,"Non Admins should not be able to start the sale.")  
        }
        catch(error){
            assert(true);
            //console.log(error); 
        }
        
    });
    
    it("Begin Token Sale",async ()=>{
        var instance = await P2PTokenSale.deployed();
        instance.contract.events.SaleStarted()
        .on('data',(response)=>{
            var tokenCount = response.returnValues.availableTokens;
            assert.equal(tokenCount,1000000,"Invalid Total Supply.");
        }).
        on('error',(err)=>{
            console.error(err);
        });
        await instance.beginSale({from:accounts[0]});
    });

    it("P2PToken Address should be set",async ()=>{
        var instance = await Utils.deployed();
        tokenContractAddress = await instance.getContractAddress.call('P2PToken',{from:accounts[9]});
        assert.notEqual(tokenContractAddress.toString(),'0x0000000000000000000000000000000000000000',"Incorrect Contract Address");
    });

    it("Initial Token Balance before purchase", async()=>{
        var instance = await P2PTokenSale.deployed();
        var tokens = await instance.getTokenCount(accounts[1]);
        assert.equal(tokens,0,"Initial Token count should be zero.");
    });

    it("Buy Tokens",async ()=>{
        var instance = await P2PTokenSale.deployed();
        var tokensToBuy = 1000;
        instance.contract.events.TokenPurchased()
        .on('data',(response)=>{
            var address = response.returnValues._buyer;
            var tokenCount = response.returnValues._amount;
            assert.equal(tokenCount,tokensToBuy,"Invalid Number of tokens bought.");
            assert.equal(address,accounts[1],"Token transferred to wrong address.")
        }).
        on('error',(err)=>{
            console.error(err);
        });
        await instance.buyTokens(tokensToBuy,{from:accounts[1],value:1000000000000000000});
    });

    it("Token Balance after purchase", async()=>{
        var instance = await P2PTokenSale.deployed();
        var tokens = await instance.getTokenCount(accounts[1]);
        assert.equal(tokens,1000,"Bought token count not matching.");
    });

    it("Buy Tokens - Pass less Ether", async()=>{
        var instance = await P2PTokenSale.deployed();
        var tokensToBuy = 1000;
        try{
            await instance.buyTokens(tokensToBuy,{from:accounts[1],value:100000000000000000});
            assert(false,"You should not be able to buy tokens with less ethers");
        }
        catch(error){
            assert(true);
            //console.log(error);
        }
    });

    it("Initial Token Balance before transfer", async()=>{
        var instance = await P2PToken.at(tokenContractAddress);
        var tokens = await instance.getTokenBalance({from:accounts[2]});
        assert.equal(tokens,0,"Initial Token count should be zero.");
    });

    it("Transfer Tokens",async ()=>{
        var instance = await P2PToken.at(tokenContractAddress);
        var tokensToTransfer = 1000;
        instance.contract.events.Transfer()
        .on('data',(response)=>{
            var from = response.returnValues._from;
            var to = response.returnValues._to;
            var tokenCount = response.returnValues._value;
            assert.equal(from,accounts[1],"Incorrect from address.");
            assert.equal(to,accounts[2],"Incorrect to address.");
            assert.equal(tokenCount,tokensToTransfer,"Invalid Number of tokens transferred.");
        }).
        on('error',(err)=>{
            console.error(err);
        });
        await instance.transfer(accounts[2],tokensToTransfer,{from:accounts[1]});
    });

    it("Token Balance after transfer", async()=>{
        var instance = await P2PToken.at(tokenContractAddress);
        var tokens = await instance.getTokenBalance({from:accounts[2]});
        assert.equal(tokens,1000,"Incorrect Number of tokens after transfer.");
    });

    it("Transfer Tokens - Insufficient Number of Tokens", async()=>{
        var instance = await P2PToken.at(tokenContractAddress);
        var tokensToTransfer = 1000;
        try{
            await instance.transfer(accounts[2],tokensToTransfer,{from:accounts[1]});
            assert(fail,"Token transfer should not be successfull.");
        }
        catch(error){
            assert(true);
            //console.log(error);
        }
    });

});