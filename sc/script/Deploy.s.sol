// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SupplyChain.sol";

/// @title Deploy Script for Supply Chain Tracker
/// @notice Deploys the SupplyChain contract
contract DeployScript is Script {
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy SupplyChain contract
        SupplyChain supplyChain = new SupplyChain();

        // Log deployment address
        console.log("SupplyChain deployed at:", address(supplyChain));
        console.log("Admin address:", supplyChain.admin());

        vm.stopBroadcast();
    }
}
