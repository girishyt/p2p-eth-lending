//SPDX-License-Identifier: MIT
pragma solidity 0.6.0;
pragma experimental ABIEncoderV2;

import "./P2PToken.sol";
import "./Utils.sol";

contract Loan{
    enum LoanStatus{open, closed}

    //Struct to store the details of investment
    struct LoanDetails{
        LoanStatus status;
        uint loanAmount;
        uint loanTenure;
        uint loanRoi; //rate of interest
        uint emiAmount; //Monthly EMI amount
        uint paidEmiCount;
        uint loanNumber; //To uniquely indentify the investments of a user.
        address investor;
        uint stakedTokens;
    }

    Utils private utils;
    P2PToken private token;

    LoanDetails[] public openLoans;

    mapping(address=>uint[]) public openLoansMapping;

    event EMIPaid(uint loanNum, uint emiAmount);
    event LoanClosed(uint loanNum, uint stakedTokens, address investor);

    
    constructor(address utilsContractAddress) public{
        utils = Utils(utilsContractAddress);
    }
    
    function addLoan(address requester, address investor, uint amount, uint tenure, uint roi, uint tokens) public {
        uint loanNumber = openLoansMapping[requester].length+1;
        uint emiAmount = calculateTotalPayable(amount,tenure,roi)/tenure;
        LoanDetails memory loan = LoanDetails(LoanStatus.open,amount,tenure,roi,emiAmount,0,loanNumber,investor,tokens);
        openLoans.push(loan);
        uint index = openLoans.length-1;
        openLoansMapping[requester].push(index);
    }

    function calculateTotalPayable(uint amount, uint tenure, uint roi) internal pure returns(uint total){
        uint interest = (amount*tenure*roi)/100;
        return amount+interest;
    }
    function getMyOpenLoans() external view returns(LoanDetails[] memory){
        uint loanLength = openLoansMapping[msg.sender].length;
        LoanDetails[] memory loan = new LoanDetails[](loanLength);
        for(uint i = 0; i<loanLength; i++){
            uint index = openLoansMapping[msg.sender][i];
            //Do not check for condition here. It will be handled in client side.
            //if(openLoans[index].status == LoanStatus.open){
                loan[i] = openLoans[index];
            //}
        }
        return loan;
    }
    function payEMI(uint loanNum) external payable{
        //Get the loan.
        int256 ind = -1;
        uint loanLength = openLoansMapping[msg.sender].length;
        for(uint i = 0; i<loanLength; i++){
            uint256 index = openLoansMapping[msg.sender][i];
            if(openLoans[index].loanNumber == loanNum){
                ind = int256(index);
                break;
            }
        }
        //Moving the logic out of loop as the we are transfering ether.
        if(ind > -1){
            uint256 index = uint256(ind);
            require(openLoans[index].status == LoanStatus.open,"Loan is already closed.");
            require(openLoans[index].emiAmount == msg.value,"Incorrect EMI Ammount passed.");
            openLoans[index].paidEmiCount += 1;
            //After testing above. Add code to transfer msg.value to investor's address.
            payable(openLoans[index].investor).transfer(msg.value);
            //If above logic fails, Store all ethers at Loan and send all at once when loan closed.
            //Check if all EMIs are paid. If yes, Close the loan.
            if(openLoans[index].loanTenure == openLoans[index].paidEmiCount){
                openLoans[index].status = LoanStatus.closed;
                emit LoanClosed(loanNum,openLoans[index].stakedTokens,openLoans[index].investor);
            }
            else{
                emit EMIPaid(loanNum,msg.value);
            }
        }
    }

    function payTokensBack(address from, address to, uint tokens) external {
        token = P2PToken(utils.getContractAddress('P2PToken'));
        token.transferFrom(from,to,tokens);
    }

    function closeLoan(uint loanNum) external{
        uint loanLength = openLoansMapping[msg.sender].length;
        for(uint i = 0; i<loanLength; i++){
            uint index = openLoansMapping[msg.sender][i];
            if(openLoans[index].loanNumber == loanNum){
                require(openLoans[index].loanTenure == openLoans[index].paidEmiCount,"EMI is not completely paid.");
                openLoans[index].status = LoanStatus.closed;
                emit LoanClosed(loanNum,openLoans[index].stakedTokens,openLoans[index].investor);
            }
        }
    }
    function getAllOpenLoans() external view returns(LoanDetails[] memory){
        return openLoans;
    }
    function getContractBalance() external view returns(uint balance){
        return address(this).balance;
    }
}