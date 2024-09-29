// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "./dex/IERC20.sol"; // Import the ERC20 interface;

contract SimpleBridge {
    address public admin;  // The address of the admin (deployer) who can release tokens
    mapping(string => bool) public processed;

event Lock(address indexed user, uint256 amountIn, address tokenIn, string destChainId, string destToken, string recipients);

    event Release(address indexed user, uint256 amountOut, address tokenOut);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can execute this");
        _;
    }

    constructor() {
        admin = msg.sender; // Set the contract deployer as the admin
    }

    // Function for users to lock tokens in the bridge
    function lock(address token, uint256 amountIn, string calldata destChainId, string calldata destToken, string calldata recipients) external {
        require(amountIn > 0, "Amount must be greater than 0");

        // Transfer tokens from the user to the bridge contract
        require(admin != address(0), "Set the admin ");
        IERC20(token).transferFrom(msg.sender, admin, amountIn);

        // Emit an event with all the necessary information
        emit Lock(msg.sender, amountIn, token, destChainId, destToken, recipients);
    }

    // Admin-only function to release tokens to a user
    function release(address tokenOut, address user, uint256 amountOut, string calldata lockHash) external onlyAdmin {
        require(amountOut > 0, "Amount must be greater than 0");    
        require(!processed[lockHash], "Hash already processed");
        processed[lockHash] = true;

        // Transfer tokens from the admin (the bridge wallet) to the user
        IERC20(tokenOut).transferFrom(admin , user, amountOut);

        // Emit the Released event
        emit Release(user, amountOut, tokenOut);
    }

    // Allows the admin to change the admin address if needed
    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "New admin address cannot be zero address");
        admin = newAdmin;
    }
}
