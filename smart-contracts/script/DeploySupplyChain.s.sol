// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SupplyChainTracking.sol";

contract DeploySupplyChain is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        SupplyChainTracking supplyChain = new SupplyChainTracking();
        
        console.log("SupplyChainTracking deployed at:", address(supplyChain));
        
        // Asignar roles iniciales (usar las direcciones de Anvil)
        // Anvil account 0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Deployer/Owner)
        // Anvil account 1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Agricultor)
        // Anvil account 2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (Almacenador)
        // Anvil account 3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906 (Molinero)
        // Anvil account 4: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 (Horneador)
        // Anvil account 5: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc (Embalador)
        // Anvil account 6: 0x976EA74026E726554dB657fA54763abd0C3a0aa9 (Distribuidor)
        // Anvil account 7: 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955 (Vendedor)
        
        supplyChain.assignRole(
            0x70997970C51812dc3A010C7d01b50e0d17dc79C8,
            SupplyChainTracking.Role.AGRICULTOR
        );
        console.log("AGRICULTOR role assigned to:", 0x70997970C51812dc3A010C7d01b50e0d17dc79C8);
        
        supplyChain.assignRole(
            0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,
            SupplyChainTracking.Role.ALMACENADOR
        );
        console.log("ALMACENADOR role assigned to:", 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC);
        
        supplyChain.assignRole(
            0x90F79bf6EB2c4f870365E785982E1f101E93b906,
            SupplyChainTracking.Role.MOLINERO
        );
        console.log("MOLINERO role assigned to:", 0x90F79bf6EB2c4f870365E785982E1f101E93b906);
        
        supplyChain.assignRole(
            0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65,
            SupplyChainTracking.Role.HORNEADOR
        );
        console.log("HORNEADOR role assigned to:", 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65);
        
        supplyChain.assignRole(
            0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc,
            SupplyChainTracking.Role.EMBALADOR
        );
        console.log("EMBALADOR role assigned to:", 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc);
        
        supplyChain.assignRole(
            0x976EA74026E726554dB657fA54763abd0C3a0aa9,
            SupplyChainTracking.Role.DISTRIBUIDOR
        );
        console.log("DISTRIBUIDOR role assigned to:", 0x976EA74026E726554dB657fA54763abd0C3a0aa9);
        
        supplyChain.assignRole(
            0x14dC79964da2C08b23698B3D3cc7Ca32193d9955,
            SupplyChainTracking.Role.VENDEDOR
        );
        console.log("VENDEDOR role assigned to:", 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955);
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Summary ===");
        console.log("Contract Address:", address(supplyChain));
        console.log("Total Supply:", supplyChain.totalSupply());
        console.log("Owner:", supplyChain.owner());
    }
}
