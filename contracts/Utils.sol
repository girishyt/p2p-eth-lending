//SPDX-License-Identifier: MIT
pragma solidity 0.6.0;

contract Utils {
    address public admin;
    uint256 public tokenPrice;
    uint256 public conversionRate;
    mapping(string => address) public tokenAddresses;

    constructor(uint _conversionRate) public {
        admin = msg.sender;
        conversionRate = _conversionRate;
    }

    modifier onlyAdmin(){
        require(msg.sender == admin,"Only Admins can change..");
        _;
    }

    function setTokenPrice(uint256 _tokenPrice) external onlyAdmin returns(uint _tPrice) {
        tokenPrice = _tokenPrice;
        return tokenPrice;
    }
    function setConversionRate(uint256 _conversionRate) external onlyAdmin returns(uint _cRate){
        conversionRate = _conversionRate;
        return conversionRate;
    }

    //Token Address Setters and Getters
    function setContractAddress(string memory contractName, address addr) public {
        tokenAddresses[contractName] = addr;
    }
    function getContractAddress(string memory contractName) public view returns(address addr) {
        return tokenAddresses[contractName];
    }
}