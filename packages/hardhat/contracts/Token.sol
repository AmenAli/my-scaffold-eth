// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Token is ERC20 {
    
    constructor(string memory name, string memory symbol, address owner) ERC20(name, symbol) {
      _mint(owner, 100**18); 
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function getaddress()view public returns(address){
        return address(this);
    }
}