// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/DocumentRegistry.sol";

contract DeployDocumentRegistry is Script {
    function run() external returns (DocumentRegistry) {
        // Obtener private key desde variables de entorno o usar la de test
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(
                0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
            )
        );

        vm.startBroadcast(deployerPrivateKey);

        DocumentRegistry registry = new DocumentRegistry();

        console.log("DocumentRegistry deployed at:", address(registry));

        vm.stopBroadcast();

        return registry;
    }
}
