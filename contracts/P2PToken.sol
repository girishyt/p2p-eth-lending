//SPDX-License-Identifier: MIT
pragma solidity 0.6.0;

contract P2PToken{
    string public name = "P2P Token";
    string public symbol = "P2P";
    string public standard = "V1.0";
    uint256 public totalSupply;
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    modifier validDestination(address to){
        require(to != address(0x0),"You can not transfer tokens to 0x0 address.");
        require(to != address(this),"You can not transfer tokens to token smart contract.");
        _;
    }
    constructor(uint256 _initialSupply) public{
        balanceOf[msg.sender] = _initialSupply;
    }
    //Function to transfer tokens.
    //msg.sender will be EOA if directly called.
    //msg.sender will be the TokenSaleContract when called for initial buy.
    function transfer(address _to, uint256 _value) external validDestination(_to) returns(bool success){
        require(balanceOf[msg.sender] >= _value,'You have insufficietn number of tokens.');
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender,_to,_value);
        return true;
    }
    //Function to add approvers(CryptoCurrency Exchanges) with limit to transfer tokens on behalf of EOAs.
    function approve(address _spender, uint256 _value) external returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    //This function is mostly called from a CryptoCurrency Exchanges to transfer tokens from an EOA account
    //which has provided the approval the Exchangers to transfer tokens on behalf of them.
    function transferFrom(address _from, address _to, uint256 _value) external validDestination(_to) returns (bool success) {
        require(_value <= balanceOf[_from],"Insufficient Balance.");
        require(_value <= allowance[_from][msg.sender],"Insufficient Allowance Amount.");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
    //Uitl function to fetch the balance ether.
    function getContractBalance() external view returns(uint256){
        return address(this).balance;
    }
    function getTokenBalance() external view returns(uint256){
        return balanceOf[msg.sender];
    }
}