// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "./IERC20.sol"; // Standard ERC20 interface

contract Pool  {
    IERC20 public tokenA;
    IERC20 public tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;
    address public admin;
    event LiquidityProvided(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidityTokens);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidityTokens);
    event Swap(address indexed swapper, address inputToken, uint256 inputAmount, uint256 outputAmount);

    constructor(address _tokenA, address _tokenB, address _admin)  {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        admin = _admin;
    }

    // Provide liquidity in equal value of tokenA and tokenB
    function provideLiquidity(uint256 amountA, uint256 amountB) external returns (uint256 liquidityMinted) {
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");

        // Transfer tokens to the contract
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        if (totalLiquidity == 0) {
            liquidityMinted = amountA;  // initial liquidity minting
        } else {
            liquidityMinted = (amountA * totalLiquidity) / reserveA;
        }

        reserveA += amountA;
        reserveB += amountB;
        totalLiquidity += liquidityMinted;
        liquidity[msg.sender] += liquidityMinted;

        emit LiquidityProvided(msg.sender, amountA, amountB, liquidityMinted);
    }

    // Remove liquidity and get back TokenA and TokenB in proportion
    function removeLiquidity(uint256 liquidityAmount) external returns (uint256 amountA, uint256 amountB) {
        require(liquidity[msg.sender] >= liquidityAmount, "Insufficient liquidity");

        amountA = (liquidityAmount * reserveA) / totalLiquidity;
        amountB = (liquidityAmount * reserveB) / totalLiquidity;

        reserveA -= amountA;
        reserveB -= amountB;
        totalLiquidity -= liquidityAmount;
        liquidity[msg.sender] -= liquidityAmount;

        tokenA.transfer(msg.sender, amountA);
        tokenB.transfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidityAmount);
    }

  function swap(address inputToken, uint256 inputAmount, address recipient, uint256 minAmount) public returns (uint256 outputAmount) {
    require(inputAmount > 0, "Input amount must be greater than 0");
    require(inputToken == address(tokenA) || inputToken == address(tokenB), "Invalid token");
    require(recipient != address(0), "Recipient address cannot be zero address");

    IERC20(inputToken).transferFrom(msg.sender, address(this), inputAmount);

    uint256 fee = (inputAmount * 3) / 1000; // 0.3% fee
    uint256 inputAmountAfterFee = inputAmount - fee;

    if (inputToken == address(tokenA)) {
        // Swap TokenA for TokenB
        uint256 outputAmountB = getSwapAmount(inputAmountAfterFee, inputToken);
        require(outputAmountB >= minAmount, "Receiving amount less than minimum required amount");

        reserveA += inputAmountAfterFee; // Add input token to reserves after fee deduction
        reserveB -= outputAmountB; // Subtract output token from reserves

        tokenB.transfer(recipient, outputAmountB);
        outputAmount = outputAmountB;
        reserveA += fee; // Add the collected fee to the liquidity pool
    } else {
        // Swap TokenB for TokenA
        uint256 outputAmountA = getSwapAmount(inputAmountAfterFee, inputToken);
        require(outputAmountA >= minAmount, "Receiving amount less than minimum required amount");

        reserveB += inputAmountAfterFee; // Add input token to reserves after fee deduction
        reserveA -= outputAmountA; // Subtract output token from reserves

        tokenA.transfer(recipient, outputAmountA);
        outputAmount = outputAmountA;
        reserveB += fee; // Add the collected fee to the liquidity pool
    }

    emit Swap(msg.sender, inputToken, inputAmount, outputAmount);
}

    function getSwapAmount(uint256 inputAmount, address inputToken) public view returns (uint256) {
    uint256 inputReserve;
    uint256 outputReserve;

    if (inputToken == address(tokenA)) {
        inputReserve = reserveA;
        outputReserve = reserveB;
    } else {
        inputReserve = reserveB;
        outputReserve = reserveA;
    }

    // uint256 inputAmountWithFee = inputAmount * 997; // 0.3% fee

    uint256 inputAmountWithFee = inputAmount; // without fees

    uint256 numerator = inputAmountWithFee * outputReserve;
    uint256 denominator = (inputReserve * 1000) + inputAmountWithFee;
    
    return numerator / denominator;
    }

    // Get reserves of TokenA and TokenB
 function getReserves() 
    external 
    view 
    returns (
        address _tokenA, 
        address _tokenB, 
        uint256 _reserveA, 
        uint256 _reserveB
    ) 
{
     return (address(tokenA), address(tokenB), reserveA, reserveB);
}

}