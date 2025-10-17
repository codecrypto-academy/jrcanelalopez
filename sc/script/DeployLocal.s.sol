// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SupplyChain.sol";

/// @title Deploy Script for Supply Chain Tracker (Local/Anvil)
/// @notice Deploys the SupplyChain contract and saves deployment info
contract DeployLocal is Script {
    function run() external {
        // Get deployer private key from environment or use Anvil's first account
        uint256 deployerPrivateKey;
        try vm.envUint("PRIVATE_KEY") returns (uint256 pk) {
            deployerPrivateKey = pk;
        } catch {
            // Default to Anvil's first account (admin)
            deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        }

        address deployer = vm.addr(deployerPrivateKey);

        console.log("================================================");
        console.log("  SUPPLY CHAIN TRACKER - LOCAL DEPLOYMENT");
        console.log("================================================");
        console.log("");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance / 1e18, "ETH");
        console.log("");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy SupplyChain contract
        console.log("Deploying SupplyChain contract...");
        SupplyChain supplyChain = new SupplyChain();
        console.log("SupplyChain deployed at:", address(supplyChain));
        console.log("Owner address:", supplyChain.owner());
        console.log("");

        vm.stopBroadcast();

        // Save deployment info to JSON file
        string memory deploymentInfo = string(
            abi.encodePacked(
                '{\n',
                '  "SupplyChain": "', vm.toString(address(supplyChain)), '",\n',
                '  "Owner": "', vm.toString(supplyChain.owner()), '",\n',
                '  "ChainId": "31337",\n',
                '  "Network": "anvil-local",\n',
                '  "Timestamp": "', vm.toString(block.timestamp), '",\n',
                '  "BlockNumber": "', vm.toString(block.number), '"\n',
                '}'
            )
        );

        vm.writeFile("./deployments/local.json", deploymentInfo);
        console.log("Deployment info saved to: ./deployments/local.json");

        console.log("");
        console.log("================================================");
        console.log("  DEPLOYMENT COMPLETE");
        console.log("================================================");
        console.log("");
        console.log("Next steps:");
        console.log("  1. Run: ./deploy-local.sh");
        console.log("  2. Test: ./test-supply-chain.sh");
        console.log("");
    }
}
