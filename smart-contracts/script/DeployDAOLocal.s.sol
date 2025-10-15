// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DAOToken.sol";
import "../src/CodeCryptoDAOGovernorV2.sol";
import "../src/ProposalImplementation.sol";
import "../src/ProposalFactory.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title DeployDAOLocal
 * @notice Script optimizado para deployment local con Anvil
 * @dev Incluye shareholders de prueba y configuración simplificada
 *
 * Uso:
 * 1. Iniciar Anvil: anvil
 * 2. Deploy: forge script script/DeployDAOLocal.s.sol:DeployDAOLocal --rpc-url http://localhost:8545 --broadcast
 *
 * Características:
 * - Crea 5 shareholders de prueba automáticamente
 * - Delega votos automáticamente
 * - Configuración lista para testing inmediato
 * - Usa CodeCryptoDAOGovernorV2 (optimizado < 24KB)
 */
contract DeployDAOLocal is Script {
    // Contratos
    DAOToken public token;
    TimelockController public timelock;
    CodeCryptoDAOGovernorV2 public governor;
    ProposalImplementation public proposalImplementation;
    ProposalFactory public factory;

    // Configuración para testing local
    uint256 public constant MIN_DELAY = 1 minutes; // Delay corto para testing

    // Shareholders de prueba (usar las cuentas por defecto de Anvil)
    address public shareholder1 = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266; // Anvil account 0
    address public shareholder2 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; // Anvil account 1
    address public shareholder3 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC; // Anvil account 2
    address public shareholder4 = 0x90F79bf6EB2c4f870365E785982E1f101E93b906; // Anvil account 3
    address public shareholder5 = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65; // Anvil account 4

    function run() public {
        // Usar la cuenta 0 de Anvil como deployer
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address deployer = vm.addr(deployerPrivateKey);

        console.log("===========================================");
        console.log("LOCAL DEPLOYMENT - CodeCrypto DAO");
        console.log("===========================================");
        console.log("Network: Anvil (localhost:8545)");
        console.log("Deployer:", deployer);
        console.log("===========================================");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy DAOToken
        console.log("\n[1/8] Deploying DAOToken...");
        token = new DAOToken(deployer);
        console.log("      Deployed at:", address(token));

        // 2. Deploy TimelockController
        console.log("\n[2/8] Deploying TimelockController...");
        address[] memory proposers = new address[](1);
        proposers[0] = address(0);
        address[] memory executors = new address[](1);
        executors[0] = address(0);

        timelock = new TimelockController(
            MIN_DELAY,
            proposers,
            executors,
            deployer
        );
        console.log("      Deployed at:", address(timelock));

        // 3. Deploy Governor V2 (optimizado)
        console.log("\n[3/8] Deploying Governor V2 (optimized)...");
        governor = new CodeCryptoDAOGovernorV2(token, timelock);
        console.log("      Deployed at:", address(governor));

        // 4. Deploy ProposalImplementation
        console.log("\n[4/8] Deploying ProposalImplementation...");
        proposalImplementation = new ProposalImplementation();
        console.log("      Deployed at:", address(proposalImplementation));

        // 5. Deploy ProposalFactory
        console.log("\n[5/8] Deploying ProposalFactory...");
        factory = new ProposalFactory(
            address(proposalImplementation),
            deployer
        );
        factory.setGovernor(address(governor));
        console.log("      Deployed at:", address(factory));

        // 6. Configurar Timelock
        console.log("\n[6/8] Configuring Timelock...");
        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        timelock.grantRole(timelock.EXECUTOR_ROLE(), address(governor));
        timelock.revokeRole(timelock.DEFAULT_ADMIN_ROLE(), deployer);
        console.log("      Roles configured");

        // 7. Crear shareholders de prueba
        console.log("\n[7/8] Creating test shareholders...");
        uint256 shares = 100_000 * 10 ** 18; // 100k tokens cada uno

        token.createShareholder(shareholder1, shares);
        console.log(
            "      Created shareholder 1:",
            shareholder1,
            "- 100k tokens"
        );

        token.createShareholder(shareholder2, shares);
        console.log(
            "      Created shareholder 2:",
            shareholder2,
            "- 100k tokens"
        );

        token.createShareholder(shareholder3, shares);
        console.log(
            "      Created shareholder 3:",
            shareholder3,
            "- 100k tokens"
        );

        token.createShareholder(shareholder4, shares * 2); // Este tiene más poder
        console.log(
            "      Created shareholder 4:",
            shareholder4,
            "- 200k tokens"
        );

        token.createShareholder(shareholder5, shares / 2);
        console.log(
            "      Created shareholder 5:",
            shareholder5,
            "- 50k tokens"
        );

        console.log(
            "      Total supply:",
            token.totalSupply() / 10 ** 18,
            "tokens"
        );

        // 8. Transferir ownership
        console.log("\n[8/8] Transferring ownership...");
        token.transferOwnership(address(timelock));
        console.log("      Token ownership -> Timelock");

        vm.stopBroadcast();

        // Resumen
        console.log("\n===========================================");
        console.log("DEPLOYMENT COMPLETE!");
        console.log("===========================================");
        console.log("\nContract Addresses:");
        console.log("-------------------------------------------");
        console.log("DAOToken:              ", address(token));
        console.log("TimelockController:    ", address(timelock));
        console.log("Governor:              ", address(governor));
        console.log("ProposalImplementation:", address(proposalImplementation));
        console.log("ProposalFactory:       ", address(factory));
        console.log("\nShareholders:");
        console.log("-------------------------------------------");
        console.log("1.", shareholder1, "- 100k tokens");
        console.log("2.", shareholder2, "- 100k tokens");
        console.log("3.", shareholder3, "- 100k tokens");
        console.log("4.", shareholder4, "- 200k tokens");
        console.log("5.", shareholder5, "- 50k tokens");
        console.log("\nGovernance Parameters:");
        console.log("-------------------------------------------");
        console.log("Voting Delay:       1 block");
        console.log("Voting Period:      50400 blocks (~1 week)");
        console.log("Proposal Threshold: 1000 tokens");
        console.log("Quorum:             4% of total supply");
        console.log("Timelock Delay:     1 minute");
        console.log("\nNext Steps:");
        console.log("-------------------------------------------");
        console.log("1. Shareholders need to delegate votes:");
        console.log(
            "   cast send",
            address(token),
            '"delegate(address)" <YOUR_ADDRESS>'
        );
        console.log("\n2. Create a proposal:");
        console.log("   Use governor.propose() function");
        console.log("\n3. Vote on proposals:");
        console.log("   Use governor.castVote() function");
        console.log("===========================================");

        // Guardar direcciones
        _saveDeployment();
    }

    function _saveDeployment() internal {
        string memory json = "deployment";

        vm.serializeAddress(json, "DAOToken", address(token));
        vm.serializeAddress(json, "TimelockController", address(timelock));
        vm.serializeAddress(json, "Governor", address(governor));
        vm.serializeAddress(
            json,
            "ProposalImplementation",
            address(proposalImplementation)
        );
        vm.serializeAddress(json, "ProposalFactory", address(factory));

        // Shareholders
        vm.serializeAddress(json, "Shareholder1", shareholder1);
        vm.serializeAddress(json, "Shareholder2", shareholder2);
        vm.serializeAddress(json, "Shareholder3", shareholder3);
        vm.serializeAddress(json, "Shareholder4", shareholder4);

        string memory finalJson = vm.serializeAddress(
            json,
            "Shareholder5",
            shareholder5
        );

        vm.writeJson(finalJson, "./deployments/local.json");
        console.log("\nAddresses saved to: ./deployments/local.json");
    }
}
