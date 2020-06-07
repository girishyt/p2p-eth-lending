import { Component, OnInit } from '@angular/core';
import { FormControl,FormGroup,FormBuilder} from '@angular/forms';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-token-sale',
  templateUrl: './token-sale.component.html',
  styleUrls: ['./token-sale.component.css']
})
export class TokenSaleComponent implements OnInit {

  accountAddress : any;
  accountBalance: number;
  tokenBalance: number = 0;
  tokenSaleStarted: boolean = false;

  tokenTransferForm = new FormGroup({
    transferTo:new FormControl(),
    NumOfTokens: new FormControl()
  });

  tokenPurchaseForm = new FormGroup({
    NumOfTokens: new FormControl(),
    EtherToBePaid: new FormControl({disabled:true})
  });

  constructor(private formBuilder: FormBuilder,private tokenService: TokenService) { 
  
  }

  async ngOnInit() {
    await this.intiateSaleContract();
    this.createTokenTransferForm();
    this.createTokenPurchaseForm();
  }

  async reloadPage(){
    window.location.reload();
  }

  createTokenTransferForm(){
    this.tokenTransferForm = this.formBuilder.group({
      transferTo:'',
      NumOfTokens:''
    });
  }

  createTokenPurchaseForm(){
    this.tokenPurchaseForm = this.formBuilder.group({
      NumOfTokens:'',
      EtherToBePaid:''
    });

  }

  async onSubmit(tokenTransferFormData){
    var transferTo = tokenTransferFormData["transferTo"];
    var NumOfTokens = tokenTransferFormData["NumOfTokens"];
    console.log(transferTo);
    console.log(NumOfTokens);
    await this.tokenService.contracts.tokenContract.methods.transfer(transferTo,NumOfTokens).
    send({from:this.accountAddress});
  }

  async onFocusOut(){
    let tokenPrice = await this.tokenService.contracts.tokenSaleContract.methods.tokenPrice().call();
    let tokens = this.tokenPurchaseForm.controls.NumOfTokens.value;
    console.log(tokenPrice);
    console.log(tokens);
    //Fetch values in Wei, Convert and show it in Ethers in UI.
    var ethersToBePaidInEth = this.tokenService.web3.utils.fromWei((tokens*tokenPrice).toString(),'ether');
    this.tokenPurchaseForm.controls.EtherToBePaid.setValue(ethersToBePaidInEth);
  }

  async onSubmitPurchase(tokenPurchaseForm){
    var NumOfTokens = tokenPurchaseForm["NumOfTokens"];
    var EtherToBePaid = tokenPurchaseForm["EtherToBePaid"];
    console.log(NumOfTokens);
    console.log(EtherToBePaid);
    //Convert the Ether to Wei before calling function.
    var ethersToBePaidInWei = this.tokenService.web3.utils.toWei(EtherToBePaid,'ether');
    this.tokenService.contracts.tokenSaleContract.methods.buyTokens(NumOfTokens)
    .send({from:this.accountAddress,value:ethersToBePaidInWei});
  }


  async intiateSaleContract(){
    await this.getAccountDetails();
    let saleStarted = await this.tokenService.getSaleStarted();
    if(saleStarted){
      console.log('Sale started');
      this.tokenSaleStarted = true;
      //Begin Sale will create the instance of P2PToken. Fetch it and set it to the contracts object.
      await this.tokenService.setTokenContract();
      await this.tokenContractEventListeners();
      this.tokenBalance = await this.tokenService.getTokenBalance(this.accountAddress);
      console.log('Token Balance - '+this.tokenBalance);
    }
    else{
      console.log('Sale not started');
    }
    //Listen to tokenSale event.
    this.tokenService.contracts.tokenSaleContract.events.SaleStarted()
    .on('data', async (response)=>{
      console.log('Event Response');
      console.log(response);
      await this.reloadPage();
    })
    .on('error',(err)=>{
      console.log(err);
    });

    this.tokenService.contracts.tokenSaleContract.events.TokenPurchased()
    .on('data', async (response)=>{
      console.log('Event Response');
      console.log(response);
      await this.reloadPage();
    })
    .on('error',(err)=>{
      console.log(err);
    });

  }

  async tokenContractEventListeners(){
    //Logic to listen to Token Transactions.
    this.tokenService.contracts.tokenContract.events.Transfer()
    .on('data',async (response)=>{
      console.log('Event Response');
      console.log(response);
      await this.reloadPage();
    })
    .on('error',(err)=>{
      console.log(err);
    });

    this.tokenService.contracts.tokenContract.events.Approval()
    .on('data',async (response)=>{
      console.log('Event Response');
      console.log(response);
      await this.reloadPage();
    })
    .on('error',(err)=>{
      console.log(err);
    });


  }

  async beginSale(){
    console.log("BeginSale Called.");
    console.log('address ->'+this.accountAddress);
    try{
      await this.tokenService.beginSale(this.accountAddress);
      //Add
    }
    catch(error){
      console.error(error);
    }
  }

  async getAccountDetails(){
    console.log('Inside getAccountDetails');
    try{
      await this.tokenService.initializeWeb3();
      //Wait for web3 instance to be initialized before calling getAccountDetails.
      let response = await this.tokenService.getAccountDetails();
      this.accountAddress = response["from"];
      this.accountBalance = response["balance"];
    }
    catch(error){
      console.log(error);
    }
  }

}
