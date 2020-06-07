import { Injectable } from '@angular/core';
import {default as Web3} from "web3";
import * as TruffleContract from 'truffle-contract';

declare let require: any;
declare let window: any;
let utilsContractABI = require('../../../build/contracts/Utils.json');
let tokenSaleContractABI = require('../../../build/contracts/P2PTokenSale.json');


@Injectable({
  providedIn: 'root'
})
export class EthConnectService {

  public web3Provider: any;
  private contracts :{};
  public web3: any;
  private tokenSaleInstance: any;

  tokenSaleStarted: boolean;

  constructor() {
    /*
    if(typeof window.web3 !== 'undefined'){
      this.web3Provider = window.web3.currentProvider;
      console.log("not undefined");
    }
    else{
      this.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      console.log("undefined. Connecting to local");
    }
    window.web3 = new Web3(this.web3Provider);*/
    //window.web3.eth.defaultAccount = window.web3.eth.accounts[0]
    //window.web3.eth.personal.unlockAccount(window.web3.eth.defaultAccount)
    //window.ethereum.enable();
    //window.web3.eth.defaultAccount = window.web3.eth.accounts[0];
    /*
    this.getWeb3Instance().then((_web3)=>{
      console.log('Got Web3 Instance.');
      this.web3 = _web3;
    }).catch((err)=>{
      console.log(err);
    });
    */


   }

   async initializeWeb3(){
     this.web3 = await this.getWeb3Instance();
   }

   async getWeb3Instance(){
    return new Promise((resolve, reject) => {
      // Wait for loading completion to avoid race conditions with web3 injection timing.
      window.addEventListener("load", async () => {
        if (window.ethereum) {
          console.log('Modern dapp browser');
          const web3 = new Web3(window.ethereum);
          try {
            // Request account access if needed
            await window.ethereum.enable();
            // Acccounts now exposed
            resolve(web3);
            this.web3Provider = window.ethereum;
          } catch (error) {
            reject(error);
          }
        }
        else if (window.web3) {
          console.log('Legacy dapp browser');
          // Use Mist/MetaMask's provider.
          const web3 = window.web3;
          this.web3Provider = window.web3.currentProvider;
          console.log("Injected web3 detected.");
          resolve(web3);
        }
        // Fallback to localhost; use dev console port by default...
        else {
          console.log(process.env.PUBLIC_URL)
          const provider = new Web3.providers.HttpProvider(
            "http://127.0.0.1:7545"
          );
          const web3 = new Web3(provider);
          this.web3Provider = provider;
          console.log("No web3 instance injected, using Local web3.");
          resolve(web3);
        }
      });
   });
  }

   //Add all other methods to interact with Contract here.
   getAccountDetails(){
     return new Promise((resolve, reject)=>{
      this.web3.eth.getCoinbase((err,account)=>{
        console.log(account);
        console.log(err);
        if(err === null){
          this.web3.eth.getBalance(account,(err,balance)=>{
            if(err === null){
              return resolve({'from':account,'balance':this.web3.utils.fromWei(balance,"ether")});
            }
            else{
              return reject("error!");
            }
          });
        }
      })
     });
   }

   sampleFunc(){
     console.log('Sample Function');
   }


   addInvestment(account:any,amount:any, tenure:any, interest:any){
    console.log(amount+','+tenure+','+interest);
    return new Promise((resolve,reject)=>{
      let masterContract = TruffleContract(utilsContractABI);
      masterContract.setProvider(this.web3Provider);
      //Use below for Truffle and Ganache.
      masterContract.deployed().then((instance)=>{
      //Use below for any test networks.
      //Get the address and fetch the contract using contract.at('address')
      //masterContract.at('0x57a4Ad821ad8dc4850d7A062557a931B71E35c3C').then((instance)=>{
        return instance.addInvestment(amount,tenure,interest,{from:account});
      }).then((response:any)=>{
        if(response){
          //console.log(status);
          resolve({response:response});
        }
      }).catch((error:any)=>{
        console.log(error);
        reject('Error');
      });
    });
   }

   getInvestments(account:any){
    return new Promise((resolve,reject)=>{
      let masterContract = TruffleContract(utilsContractABI);
      masterContract.setProvider(this.web3Provider);
      masterContract.deployed().then((instance:any)=>{
        return instance.getMyOpenInvestments({from:account});
      }).then((response:any)=>{
        if(response){
          resolve({response:response});
        }
      }).catch((error:any)=>{
        console.log(error);
        reject(error);
      });
    });
   }

  getOpenInvestments(account:any){
    return new Promise((resolve,reject)=>{
      let masterContract = TruffleContract(utilsContractABI);
      masterContract.setProvider(this.web3Provider);
      masterContract.deployed().then((instance:any)=>{
        return instance.getMyOpenInvestments({from:account});
      }).then((response:any)=>{
        if(response){
          resolve({response:response});
        }
      }).catch((error:any)=>{
        console.log(error);
        reject(error);
      });
    });
  }

  //This is the first method to be called.
  async beginSale(account:any){
      try{
        let networkId = await this.web3.eth.net.getId();
        let deployedNetwork = tokenSaleContractABI.networks[networkId];
        console.log('networkId-'+networkId);
        console.log('deployedNetwork');
        console.log(deployedNetwork);
        console.log(deployedNetwork.address);
        this.tokenSaleInstance = new this.web3.eth.Contract(tokenSaleContractABI.abi,deployedNetwork.address);
    
        this.tokenSaleInstance.setProvider(this.web3Provider);
        await this.tokenSaleInstance.methods.beginSale().send({from:account});
      }
      catch(error){
        console.error(error);
      }
      
  }


}
