//SPDX-License-Identifier: MIT
pragma solidity 0.6.0;

import "./P2PToken.sol";
import "./Utils.sol";

contract P2PTokenSale {
    address payable public admin ;
    P2PToken private tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;
    uint256 public totalSupply;
    bool public saleStarted = false;

    event TokenPurchased(address _buyer, uint256 _amount);
    event SaleStarted(uint256 availableTokens);

    Utils private utils;

    constructor(uint256 _totalSupply,uint256 _tokenPrice,address utilsContractAddress) public {
        admin = msg.sender;
        totalSupply = _totalSupply;
        tokenPrice = _tokenPrice;
        utils = Utils(utilsContractAddress);
        utils.setContractAddress('P2PTokenSale',address(this));
    }
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x,"Error in multiply");
    }
    function beginSale() external returns(bool result){
        require(msg.sender == admin,"You are not an Admin to begin the sale");
        require(!saleStarted,"Sale already started. You can't start it again.");
        saleStarted = true;
        tokenContract = new P2PToken(totalSupply);
        utils.setContractAddress('P2PToken',address(tokenContract));
        emit SaleStarted(totalSupply);
        return true;
    }
    function buyTokens(uint256 _numberOfTokens) external payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice),"Insufficient Balance");
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens,"Not Many Tokens available.");
        require(tokenContract.transfer(msg.sender, _numberOfTokens),"Transaction Failed.");
        tokensSold += _numberOfTokens;
        emit TokenPurchased(msg.sender, _numberOfTokens);
    }
    function endSale() external {
        require(msg.sender == admin,"You are not an Admin to end the sale");
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))),"Transaction Failed.");
        //At the end. Transfer all etheres to admin.
        admin.transfer(address(this).balance);
    }
    function getContractBalance() external view returns(uint256){
        return address(this).balance;
    }
    function getTokenCount(address _account) external view returns(uint256 count){
        return tokenContract.balanceOf(_account);
    }
}