// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "./IERC20.sol";
import {Pool} from "./pool.sol";

contract Router {
    address public admin;

    constructor() {
        admin = msg.sender;
    }

    // Dynamic multi-hop swap function
    function multiHopSwap(
        address tokenIn,           // Initial input token
        uint256 amountIn,          // Amount of the initial input token
        uint256 minimumOutAmount,  // Minimum acceptable final output amount
        address tokenOut,          // Final token to be received
        address recipient,         // Recipient of the final token
        address[] memory poolAddresses // Array of pool addresses for each swap
    ) external returns (uint256 finalOutputAmount) {
        require(poolAddresses.length > 0, "No pool addresses provided");
        require(amountIn > 0, "Input amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient");

        uint256 currentAmount = amountIn;
        address currentToken = tokenIn;

        // Transfer the initial input token to the contract
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        // Perform swaps through each pool
        for (uint256 i = 0; i < poolAddresses.length; i++) {
            Pool pool = Pool(poolAddresses[i]);
            
            // Get the token pair for the pool (Assuming pool has tokenA and tokenB)
            address tokenA = address(pool.tokenA());
            address tokenB = address(pool.tokenB());

            // Determine which token is the next output token
            address nextToken = currentToken == tokenA ? tokenB : tokenA;

            // Approve the pool to use the current token
            IERC20(currentToken).approve(poolAddresses[i], currentAmount);

            // Perform the swap in the pool contract
            currentAmount = pool.swap(currentToken, currentAmount, address(this), 0); // No min out for each hop

            // Update the current token to the next token for the next hop
            currentToken = nextToken;
        }

        // Ensure that the final token is the expected output token
        require(currentToken == tokenOut, "Final token does not match the desired output token");

        // Check if the swap meets the minimum output amount
        require(currentAmount >= minimumOutAmount, "Insufficient output amount");

        // After the last swap, transfer the output token to the recipient
        IERC20(tokenOut).transfer(recipient, currentAmount);
        finalOutputAmount = currentAmount;

        return finalOutputAmount;
    }
}
