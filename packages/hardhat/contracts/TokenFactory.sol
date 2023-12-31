// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./Token.sol";

contract TokenFactory {
address[] public Tokenlist;

Token public token;
    function CreateToken(string memory name, string memory symbol) public returns(address){
        token= new Token(name,symbol,msg.sender);
       Tokenlist.push(token.getaddress());
       return token.getaddress();
    }

    function getToken() view public returns(address[] memory ){
     return Tokenlist;
    }
}