//SPDX-License-Identifier: MIT

pragma solidity 0.7.0;

contract TestToken {

    address public minter;
  mapping(address => uint) public getBalance;
  uint public totalSupply;

  constructor() public {
    minter = msg.sender;
  }

  function mint(address _to, uint _amount) external {
    require(msg.sender == minter, "not minter");
    getBalance[_to] += _amount;
  }

  function transfer(address _to, uint _value) public returns (bool) {
    require(getBalance[msg.sender] - _value >= 0);
    getBalance[msg.sender] -= _value;
    getBalance[_to] += _value;
    return true;
  }
}