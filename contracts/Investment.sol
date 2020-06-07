//SPDX-License-Identifier: MIT
pragma solidity 0.6.0;
pragma experimental ABIEncoderV2;

import "./P2PToken.sol";
import "./Utils.sol";

contract Investment{
    enum InvestmentStatus{open, borrowed, error}

    //Struct to store the details of investment
    struct InvestmentDetails {
        InvestmentStatus status;
        uint InvstAmount;
        uint InvstTenure;
        uint InvestRoi; //rate of interest
        uint InvestmentNumber; //To uniquely indentify the investments of a user.
        address Investor;
    }

    Utils private utils;
    P2PToken private token;

    InvestmentDetails[] public openInvestments;

    mapping(address=>uint[]) public openInvestmentsMapping;

    event InvestmentAdded(uint investmentNumber);

    function addInvestment(uint amount, uint tenure, uint roi) external payable {
        /*
        InvestmentDetails memory tempInvst = InvestmentDetails(InvestmentStatus.open,amount,tenure,roi,true);
        allInvestments[msg.sender].push(tempInvst);
        */
        //Check if the user has sufficient balance to add the investment.
        require(msg.value==amount,"Ether amount passed should be equal to the Investment amount.");
        uint investmentNumber = openInvestmentsMapping[msg.sender].length+1;
        InvestmentDetails memory it = InvestmentDetails(InvestmentStatus.open,amount,tenure,roi,investmentNumber,msg.sender);
        openInvestments.push(it);
        uint index = openInvestments.length-1;
        openInvestmentsMapping[msg.sender].push(index);
        emit InvestmentAdded(investmentNumber);
        //Transfer the amount to Investment Contract.
        //We dont need to transfer explicitly. It will be added to contract automatically.
        //payable(address(this)).transfer(msg.value);
    }

    function getMyOpenInvestments() external view returns(InvestmentDetails[] memory){
        uint invstLength = openInvestmentsMapping[msg.sender].length;
        InvestmentDetails[] memory invt = new InvestmentDetails[](invstLength);
        for(uint i = 0; i<invstLength; i++){
            uint index = openInvestmentsMapping[msg.sender][i];
            if(openInvestments[index].status == InvestmentStatus.open){
                invt[i] = openInvestments[index];
            }
        }
        return invt;
    }

    function getAllMyInvestments() external view returns(InvestmentDetails[] memory){
        uint invstLength = openInvestmentsMapping[msg.sender].length;
        InvestmentDetails[] memory invt = new InvestmentDetails[](invstLength);
        for(uint i = 0; i<invstLength; i++){
            uint index = openInvestmentsMapping[msg.sender][i];
            invt[i] = openInvestments[index];
        }
        return invt;
    }

    function getAllInvestments() external view returns(InvestmentDetails[] memory){
        return openInvestments;
    }

    function getInvestment(address investor, uint loanNumber) public view returns(InvestmentDetails memory){
        uint invstLength = openInvestmentsMapping[investor].length;
        for(uint i = 0; i<invstLength; i++){
            uint index = openInvestmentsMapping[investor][i];
            if(openInvestments[index].InvestmentNumber==loanNumber){
                return openInvestments[index];
            }
        }
        return InvestmentDetails(InvestmentStatus.error,0,0,0,0,address(0x00));
    }

    function transferEther(address _to, uint amount) public {
        //Send Ether from Investment Contract to borrower.
        payable(_to).transfer(amount);
    }

    function updateInvestment(address investor, uint loanNumber) public{
        uint invstLength = openInvestmentsMapping[investor].length;
        for(uint i = 0; i<invstLength; i++){
            uint index = openInvestmentsMapping[investor][i];
            if(openInvestments[index].InvestmentNumber==loanNumber){
                openInvestments[index].status = InvestmentStatus.borrowed;
                break;
            }
        }
    }
    function getContractBalance() external view returns(uint bal){
        return payable(address(this)).balance;
    }
}