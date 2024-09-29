// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "contract/token/ERC20/CorssCToken.sol";  // Import the abstract OmniERC20 contract

contract tokenLaunch is CrossCToken {

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply,
        address minterAddress,
        bool ismainChain
    ) CrossCToken(name_, symbol_) {
        // Mint initial supply to the deployer (you can change this as needed)
        if(ismainChain== true){
        _mint(minterAddress, initialSupply);
        }
        else {
              _mint(address(this), initialSupply);
        }
    }

    // Public mint function, callable by the owner (if you wish to allow minting after deployment)
    function mint(address account, uint256 value) public {
        // Add your own access control here, e.g., onlyOwner modifier
        _mint(account, value);
    }

    // Internal mint function
    function _mint(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(address(0), account, value);
    }
}
