//SPDX-License-Identifier: MIT
pragma solidity 0.6.0;
pragma experimental ABIEncoderV2;

import "./Investment.sol";
import "./Loan.sol";
import "./Utils.sol";
import "./P2PToken.sol";

contract MasterContract{

    Investment private investment;
    Loan private loan;
    Utils private utils;
    P2PToken private token;

    event IntiateTokenTransfer(address to, uint tokenCount);
    event AmountTransferred(address to, uint amount);
    event InvestmentUpdated(address investor,uint loanNumber);
    event LoanAdded(address to);


    //Util Contract needs to be deployed first and its address
    //should be passed to this.
    constructor(address utilsContractAddress) public{
        utils = Utils(utilsContractAddress);
        utils.setContractAddress('Utils',utilsContractAddress);
        //tokenSale = P2PTokenSale(tokeSaleAddress);
        //utils.setContractAddress('P2PTokenSale',tokeSaleAddress);
        investment = new Investment();
        utils.setContractAddress('Investment',address(investment));
        loan = new Loan(utilsContractAddress);
        utils.setContractAddress('Loan',address(loan));
        utils.setContractAddress('MasterContract',address(this));
    }
    /*
    function addInvestment(uint amount, uint tenure, uint roi) external{
        investment.addInvestment(msg.sender,amount,tenure,roi);
    }

    function getMyOpenInvestments() external view returns(Investment.InvestmentDetails[] memory){
        return investment.getMyOpenInvestments(msg.sender);
    }

    function getAllOpenInvestments() external view returns(Investment.InvestmentDetails[] memory){
        return investment.getAllOpenInvestments();
    }
    */

    //Main function to borrow the loan.
    //From the UI, send the address of the investor and the number.
    function borrowLoan(address investor, uint loanNumber) external {
        //Step#1: fetch the loan and check if its open.
        Investment.InvestmentDetails memory inv = investment.getInvestment(investor,loanNumber);
        require(inv.status==Investment.InvestmentStatus.open,"This investment is not open.");
        require(inv.InvstAmount>0,"Loan Amount must be greater than 0");
        require(inv.InvstTenure>0,"Loan Tenure must be greater than 0");
        require(inv.InvestRoi>0,"Loan Rate of Interest must be greater than 0");
        //Step#2: Calculate 150% of the loan amount and check if sender have
        //        enough tokens.
        require(utils.conversionRate()>0,"Conversion Rate is not set.");
        uint tokenCount = getTokenValue(inv.InvstAmount,utils.conversionRate());
        token = P2PToken(utils.getContractAddress('P2PToken'));
        require(token.balanceOf(msg.sender)>tokenCount,"You do not have sufficient number of tokens.");
        emit IntiateTokenTransfer(investor,tokenCount);
        //Step#4: Transfer tokens from sender user account to investor user account.
        //require(token.transfer(investor,tokenCount),"Token transfer failed.");
        //Step#5: Transfer money from investor address to user address.
        //You cant transfer money from this contract. So call Investment contract and pass the address.
        //payable(address(msg.sender)).transfer(inv.InvstAmount);
        investment.transferEther(msg.sender,inv.InvstAmount);
        emit AmountTransferred(msg.sender,inv.InvstAmount);
        //Step#6: Remove the loan from the openLoans and add it to loansInProgress.
        investment.updateInvestment(investor,loanNumber);
        emit InvestmentUpdated(investor,loanNumber);
        //Step#7: Add a new entry in the Loans
        loan.addLoan(msg.sender,investor,inv.InvstAmount,inv.InvstTenure,inv.InvestRoi,tokenCount);
        emit LoanAdded(msg.sender);
    }

    function getTokenValue(uint amount, uint conversionRate) public pure returns (uint z) {
        //Calculate 150% of given amount.
        uint amt = amount+(amount/2);
        //Divide the toal amount by conversion rate to calculate number of token.
        return amt/conversionRate;
    }

    function getTokenCountForInvestment(uint invNum) external view returns(uint tokenCount){
        Investment.InvestmentDetails memory inv = investment.getInvestment(msg.sender,invNum);
        uint tokenC = getTokenValue(inv.InvstAmount,utils.conversionRate());
        return tokenC;
    }

}