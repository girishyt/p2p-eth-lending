import { Injectable } from '@angular/core';
import {default as Web3} from "web3";
import * as TruffleContract from 'truffle-contract';

declare let require: any;
declare let window: any;
let masterContractABI = require('../../../build/contracts/MasterContract.json');
let utilsContractABI = require('../../../build/contracts/Utils.json');
let investmentContractABI = require('../../../build/contracts/Investment.json');
let loanContractABI = require('../../../build/contracts/Loan.json');
let tokenContractABI = require('../../../build/contracts/P2PToken.json');

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public web3Provider: any;
  public web3: any;

  public contracts = {
    masterContract: undefined,
    utilContract: undefined,
    investmentContract:undefined,
    loanContract:undefined,
    tokenContract:undefined
  }

  constructor() { }

  async initializeWeb3(){
    //Get Web3 Instance
    this.web3 = await this.getWeb3Instance();
    //Create instances of all the needed contracts.
    await this.setMasterContract();
    await this.setUtilsContract();
    await this.setInvestmentContract();
    await this.setLoanContract();
    await this.setTokenContract();
  }

  //Method to set contracts.tokenSaleContract
  async setMasterContract(){
    try{
      let networkId = await this.web3.eth.net.getId();
      let deployedNetwork = masterContractABI.networks[networkId];
      let masterInstance = new this.web3.eth.Contract(masterContractABI.abi,deployedNetwork.address);
      masterInstance.setProvider(this.web3Provider);
      this.contracts.masterContract = masterInstance;
      console.log('Master Contract Set.');
    }
    catch(error){
      console.error(error);
    }
  }

   //Method to set contracts.tokenSaleContract
   async setUtilsContract(){
    try{
      let networkId = await this.web3.eth.net.getId();
      let deployedNetwork = utilsContractABI.networks[networkId];
      let utilsInstance = new this.web3.eth.Contract(utilsContractABI.abi,deployedNetwork.address);
      utilsInstance.setProvider(this.web3Provider);
      this.contracts.utilContract = utilsInstance;
      console.log('Utils Contract Set.');
    }
    catch(error){
      console.error(error);
    }
  }

  async setInvestmentContract(){
    try{
      let investmentContractAddress = await this.contracts.utilContract.methods.getContractAddress('Investment').call();
      let investmentInstance = new this.web3.eth.Contract(investmentContractABI.abi,investmentContractAddress);
      investmentInstance.setProvider(this.web3Provider);
      this.contracts.investmentContract = investmentInstance;
      console.log('Investment Contract Set.');
    }
    catch(error){
      console.error(error);
    }
  }

  async setLoanContract(){
    try{
      let loanContractAddress = await this.contracts.utilContract.methods.getContractAddress('Loan').call();
      let loanInstance = new this.web3.eth.Contract(loanContractABI.abi,loanContractAddress);
      loanInstance.setProvider(this.web3Provider);
      this.contracts.loanContract = loanInstance;
      console.log('Loan Contract Set.');
    }
    catch(error){
      console.error(error);
    }
  }

  async setTokenContract(){
    try{
      let tokenContractAddress = await this.contracts.utilContract.methods.getContractAddress('P2PToken').call();
      console.log(tokenContractAddress);
      if(!tokenContractAddress.toString().startsWith('0x00000000')){
        let tokenInstance = new this.web3.eth.Contract(tokenContractABI.abi,tokenContractAddress);
        tokenInstance.setProvider(this.web3Provider);
        this.contracts.tokenContract = tokenInstance;
        console.log('Token Contract Set.');
        console.log(this.contracts.tokenContract);
      }
    }
    catch(error){
      console.error(error);
    }
  }

  async getTokenBalance(account:any){
    let tokenBalance;
    try{
      tokenBalance = await this.contracts.tokenContract.methods.getTokenBalance().call({from:account});
    }
    catch(error){
      console.error(error);
    }
    return tokenBalance;
  }

async getWeb3Instance(){
  return new Promise(async (resolve, reject) => {
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
}

 //Add all other methods to interact with Contract here.
async getAccountDetails(){
  try{
    let account = await this.web3.eth.getCoinbase();
    console.log(account);
    try{
      let balance = await this.web3.eth.getBalance(account);
      console.log(balance);
      return {'from':account,'balance':this.web3.utils.fromWei(balance,"ether")};
    }
    catch(error){
      console.log(error);
    }
  }
  catch(error){
    console.error(error);
  }
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

}
