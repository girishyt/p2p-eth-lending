import { Injectable } from '@angular/core';
import {default as Web3} from "web3";

declare let require: any;
declare let window: any;
let utilsContractABI = require('../../../build/contracts/Utils.json');
let tokenSaleContractABI = require('../../../build/contracts/P2PTokenSale.json');
let tokenContractABI = require('../../../build/contracts/P2PToken.json');

@Injectable({
  providedIn: 'root'
})
export class TokenService {


  public web3Provider: any;
  public web3: any;
  private tokenSaleStarted: boolean;
  
  public contracts = {
    tokenSaleContract: undefined,
    utilContract: undefined,
    tokenContract:undefined
  }

  constructor() { }

  async initializeWeb3(){
    //Get Web3 Instance
    this.web3 = await this.getWeb3Instance();
    //Create instances of all the needed contracts.
    await this.setTokenSaleContract();
    await this.setUtilsContract();
  }

  //Method to set contracts.tokenSaleContract
  async setTokenSaleContract(){
    try{
      let networkId = await this.web3.eth.net.getId();
      let deployedNetwork = tokenSaleContractABI.networks[networkId];
      let tokenSaleInstance = new this.web3.eth.Contract(tokenSaleContractABI.abi,deployedNetwork.address);
      tokenSaleInstance.setProvider(this.web3Provider);
      this.contracts.tokenSaleContract = tokenSaleInstance;
      console.log('Token Sale Contract Set.');
    }
    catch(error){
      console.error(error);
    }
  }

  async getSaleStarted(){
    let status;
    try{
      status = await this.contracts.tokenSaleContract.methods.saleStarted().call();
    }
    catch(error){
      console.error(error);
    }
    return status;
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

  //Method to set contracts.tokenContract
  async setUtilsContract(){
    try{
      let networkId = await this.web3.eth.net.getId();
      let deployedNetwork = utilsContractABI.networks[networkId];
      let utilsInstance = new this.web3.eth.Contract(utilsContractABI.abi,deployedNetwork.address);
      utilsInstance.setProvider(this.web3Provider);
      this.contracts.utilContract = utilsInstance;
      console.log(' Utils Contract Set.');
    }
    catch(error){
      console.log(error);
    }
  }

  //Method to set contracts.tokenContract
  async setTokenContract(){
    try{
      console.log('Inside setTokenContract');
      let tokenContractAddress = await this.contracts.utilContract.methods.getContractAddress('P2PToken').call();
      console.log('Token Address - '+tokenContractAddress);
      let tokenInstance = new this.web3.eth.Contract(tokenContractABI.abi,tokenContractAddress);
      tokenInstance.setProvider(this.web3Provider);
      this.contracts.tokenContract = tokenInstance;
    }
    catch(error){
      console.log(error);
    }
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

//This is the first method to be called.
async beginSale(account:any){
  try{
    await this.contracts.tokenSaleContract.methods.beginSale().send({from:account});
  }
  catch(error){
    console.error(error);
  }
  
}

}
