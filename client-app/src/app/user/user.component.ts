import { Component, OnInit } from '@angular/core';
import { FormControl,FormGroup,FormBuilder} from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],

})
export class UserComponent implements OnInit {

  investorForm = new FormGroup({
    amount:new FormControl(),
    tenure: new FormControl(),
    interest: new FormControl() 
  });

  accountAddress : any;
  accountBalance: number;
  tokenBalance: number = 0;
  public web3: any;
  myInvestments:any;
  myLoans:any;
  availableLoans:any;

  //To handle multiple events triggering issue.
  tokenTransferEventTriggered:boolean=false;
  investmentAddedEventTriggered:boolean=false;
  transferEventTriggered:boolean=false;
  emiPaidEventTriggered:boolean=false;
  loanClosedEventTriggered:boolean=false;
  approvalEventTriggered:boolean=false;


  constructor(
    private formBuilder: FormBuilder,
    public userService: UserService) { 
   
  }

  async getAccountDetails(){
    console.log('Inside getAccountDetails');
    try{
      await this.userService.initializeWeb3();
      //Wait for web3 instance to be initialized before calling getAccountDetails.
      let response = await this.userService.getAccountDetails();
      this.accountAddress = response["from"];
      this.accountBalance = response["balance"];
    }
    catch(error){
      console.log(error);
    }
  }

  async ngOnInit(){
    await this.initialize();
    this.createInvestorForm();
    this.getMyInvestments();
    this.getAllInvestments();
    this.getMyLoans();
    //this.getOpenInvestments();
    this.addEventListeners();

  }

  createInvestorForm(){
    this.investorForm = this.formBuilder.group({
      amount:'',
      tenure:'',
      interest:''
    });
  }

  initiateTokenTransfer(to,count){
    try{
      this.userService.contracts.tokenContract.methods.transfer(to,count).
      send({from:this.accountAddress});
    }
    catch(error){
      console.error(error);
    }
  }

  payEMI(loanNumber,emiAmountInWei){
    try{
      //Not converting to wei here as we have not converted to ether in template.
      this.userService.contracts.loanContract.methods.payEMI(loanNumber)
      .send({from:this.accountAddress,value:emiAmountInWei});
    }
    catch(error){
      console.error(error);
    }
  }

  addEventListeners(){
   
    let investmentAdded = this.userService.contracts.investmentContract.events.InvestmentAdded();
    investmentAdded.on('data', async (response)=>{
      if(!this.investmentAddedEventTriggered){
        this.investmentAddedEventTriggered=true;
        console.log('InvestmentAdded Event');
        console.log(response);
        //Get the token count.
        let tokensCount = await this.userService.contracts.masterContract.methods.
        getTokenCountForInvestment(response.returnValues.investmentNumber)
        .call({from:this.accountAddress});

        //Ask for transfer approval
        await this.userService.contracts.tokenContract.methods.
        approve(this.userService.contracts.loanContract._address,tokensCount).
        send({from:this.accountAddress});
      }
      else{
        console.log('InvestmentAdded Event - Already triggered.');
        console.log('Ignoring it');
      }

    })
    .on('error',(err)=>{
      console.log(err);
    });

    let intiateTokenTransfer = this.userService.contracts.masterContract.events.IntiateTokenTransfer();
    intiateTokenTransfer.on('data', (response)=>{
      if(!this.tokenTransferEventTriggered){
        this.tokenTransferEventTriggered = true;
        console.log('IntiateTokenTransfer Event');
        console.log(response);
        this.initiateTokenTransfer(response.returnValues.to,response.returnValues.tokenCount);
      }
      else{
        console.log('IntiateTokenTransfer Already triggered. Ignoring the duplicates.')
      }
    })
    .on('error',(err)=>{
      console.log(err);
    });
    this.userService.contracts.masterContract.events.AmountTransferred()
    .on('data', (response)=>{
      console.log('AmountTransferred Event');
      console.log(response);

    })
    .on('error',(err)=>{
      console.log(err);
    });

    this.userService.contracts.masterContract.events.InvestmentUpdated()
    .on('data', (response)=>{
      console.log('InvestmentUpdated Event');
      console.log(response);
    })
    .on('error',(err)=>{
      console.log(err);
    });

    this.userService.contracts.masterContract.events.LoanAdded()
    .on('data', (response)=>{
      console.log('LoanAdded Event');
      console.log(response);
    })
    .on('error',(err)=>{
      console.log(err);
    });

    this.userService.contracts.tokenContract.events.Transfer()
    .on('data',(response)=>{
      if(!this.transferEventTriggered){
        this.transferEventTriggered = true;
        console.log('Transfer Event');
        console.log(response);
        //this.reloadPage();
      }
      else{
        console.log('Transfer Already triggered. Ignoring the duplicates.')
      }
    }).
    on('error',(err)=>{
      console.error(err);
    });

    this.userService.contracts.tokenContract.events.Approval()
    .on('data',(response)=>{
      if(!this.approvalEventTriggered){
        this.approvalEventTriggered = true;
        console.log('Approval Event');
        console.log(response);
        this.reloadPage();
      }
      else{
        console.log('Approval Already triggered. Ignoring the duplicates.')
      }
    }).
    on('error',(err)=>{
      console.error(err);
    });

    //PayEMI Event
    this.userService.contracts.loanContract.events.EMIPaid()
    .on('data',(response)=>{
      if(!this.emiPaidEventTriggered){
        this.emiPaidEventTriggered = true;
        console.log('EMIPaid Event');
        console.log(response);
        this.reloadPage();
      }
      else{
        console.log('EMIPaid Already triggered. Ignoring the duplicates.')
      }
    }).
    on('error',(err)=>{
      console.error(err);
    });

    //Loan Closed Event
    this.userService.contracts.loanContract.events.LoanClosed()
    .on('data',(response)=>{
      if(!this.loanClosedEventTriggered){
        this.loanClosedEventTriggered = true;
        console.log('LoanClosed Event');
        console.log(response);
        console.log(response.returnValues.loanNum);
        console.log(response.returnValues.stakedTokens);
        console.log(response.returnValues.investor);
        this.transferTokensBack(response.returnValues.investor,response.returnValues.stakedTokens);
      }
      else{
        console.log('LoanClosed Already triggered. Ignoring the duplicates.')
      }
    }).
    on('error',(err)=>{
      console.error(err);
    });
  }

  transferTokensBack(from,value){
    try{
      this.userService.contracts.loanContract.methods.payTokensBack(from,this.accountAddress,value)
      .send({from:this.accountAddress});
    }
    catch(error){
      console.error(error);
    }
  }

  async initialize(){
    await this.getAccountDetails();
    if(this.userService.contracts.tokenContract!=undefined){
      this.tokenBalance = await this.userService.getTokenBalance(this.accountAddress);
      console.log('Token Balance - '+this.tokenBalance);
    }
    else{
      console.log('Token Contract is not nitialized yet.');
    }

  }

  async reloadPage(){
    window.location.reload();
  }

  async getMyInvestments(){
    try{
      let investments = await this.userService.contracts.investmentContract.methods.getAllMyInvestments().
      call({from:this.accountAddress});
      this.myInvestments = investments;
    }
    catch(error){
      console.error(error);
    }
  }

  async getMyLoans(){
    try{
      let loans = await this.userService.contracts.loanContract.methods.getMyOpenLoans().
      call({from:this.accountAddress});
      this.myLoans = loans;
    }
    catch(error){
      console.error(error);
    }
  }

  //These investments are shown as loans available for borrowing.
  async getAllInvestments(){
    try{
      let investments = await this.userService.contracts.investmentContract.methods.getAllInvestments().
      call({from:this.accountAddress});
      let loans:any[] = [];
      for(var i=0;i<investments.length;i++){
        let strct = investments[i];
        if(strct["status"]==0 && 
        this.accountAddress.toString().toUpperCase()!==strct["Investor"].toString().toUpperCase()){
          loans.push({
            status: strct["status"],
            InvstAmount:strct["InvstAmount"],
            InvstTenure:strct["InvstTenure"],
            InvestRoi:strct["InvestRoi"],
            InvestmentNumber:strct["InvestmentNumber"],
            Investor:strct["Investor"]});
        }
      }
      this.availableLoans = loans;
      console.log(this.availableLoans);
    }
    catch(error){
      console.log(error);
    }
  }

  async borrowLoan(investorAddress:any,loanNumber:any){
    try{
      this.userService.contracts.masterContract.methods.borrowLoan(investorAddress,loanNumber)
      .send({from:this.accountAddress});
    }
    catch(error){
      console.error(error);
    }
  }

  addInvestment(investorFormData:any){
    try{
      var amount = investorFormData["amount"];
      var tenure = investorFormData["tenure"];
      var interest = investorFormData["interest"];
      var amountInWei = this.userService.web3.utils.toWei(amount.toString(),'ether');
      this.userService.contracts.investmentContract.methods.addInvestment(amountInWei,tenure,interest)
      .send({from:this.accountAddress,value:amountInWei});
    }
    catch(error){
      console.error(error);
    }
  }
}
