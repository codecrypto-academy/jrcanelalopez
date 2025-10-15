// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DAOToken.sol";
import "../src/CodeCryptoDAOGovernor.sol";
import "../src/ProposalImplementation.sol";
import "../src/ProposalFactory.sol";
import "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title DeployDAO
 * @notice Script para desplegar todos los contratos del DAO en orden correcto
 *
 * Orden de deployment:
 * 1. DAOToken (el token de gobernanza)
 * 2. TimelockController (para el delay de ejecución)
 * 3. CodeCryptoDAOGovernor (el contrato principal de gobernanza)
 * 4. ProposalImplementation (template para propuestas)
 * 5. ProposalFactory (factory para crear propuestas)
 * 6. Configuración de roles y permisos
 * 7. (Opcional) Crear shareholders iniciales
 *
 * Uso:
 * forge script script/DeployDAO.s.sol:DeployDAO --rpc-url <your_rpc_url> --broadcast --verify
 *
 * Para testnet (Sepolia):
 * forge script script/DeployDAO.s.sol:DeployDAO --rpc-url $SEPOLIA_RPC_URL --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
 *
 * Para deployment local (Anvil):
 * forge script script/DeployDAO.s.sol:DeployDAO --rpc-url http://localhost:8545 --broadcast
 */
contract DeployDAO is Script {
    // Contratos desplegados
    DAOToken public token;
    TimelockController public timelock;
    CodeCryptoDAOGovernor public governor;
    ProposalImplementation public proposalImplementation;
    ProposalFactory public factory;

    // Parámetros configurables
    uint256 public constant MIN_DELAY = 2 days; // Timelock delay

    // Addresses de shareholders iniciales (configurable)
    address[] public initialShareholders;
    uint256[] public initialShares;

    function setUp() public {
        // Configurar shareholders iniciales (EDITAR SEGÚN NECESIDAD)
        // Por defecto, asignar tokens al deployer para testing
        // initialShareholders.push(msg.sender);
        // initialShares.push(1_000_000 * 10**18);
    }

    function run() public {
        // Obtener private key del deployer desde variables de entorno
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("===========================================");
        console.log("Deploying CodeCrypto DAO...");
        console.log("Deployer:", deployer);
        console.log("===========================================");

        vm.startBroadcast(deployerPrivateKey);

        // ==================== PASO 1: Deploy DAOToken ====================
        console.log("\n1. Deploying DAOToken...");
        token = new DAOToken(deployer);
        console.log("   DAOToken deployed at:", address(token));
        console.log("   Token name:", token.name());
        console.log("   Token symbol:", token.symbol());

        // ==================== PASO 2: Deploy TimelockController ====================
        console.log("\n2. Deploying TimelockController...");

        // Configurar roles para el Timelock
        address[] memory proposers = new address[](1);
        proposers[0] = address(0); // Será configurado después con el Governor

        address[] memory executors = new address[](1);
        executors[0] = address(0); // Cualquiera puede ejecutar propuestas aprobadas

        timelock = new TimelockController(
            MIN_DELAY,
            proposers,
            executors,
            deployer // Admin temporal
        );
        console.log("   TimelockController deployed at:", address(timelock));
        console.log("   Min delay:", timelock.getMinDelay(), "seconds");

        // ==================== PASO 3: Deploy CodeCryptoDAOGovernor ====================
        console.log("\n3. Deploying CodeCryptoDAOGovernor...");
        governor = new CodeCryptoDAOGovernor(token, timelock);
        console.log("   Governor deployed at:", address(governor));
        console.log("   Governor name:", governor.name());
        console.log("   Voting delay:", governor.votingDelay(), "blocks");
        console.log("   Voting period:", governor.votingPeriod(), "blocks");
        console.log(
            "   Proposal threshold:",
            governor.proposalThreshold() / 10 ** 18,
            "tokens"
        );

        // ==================== PASO 4: Deploy ProposalImplementation ====================
        console.log("\n4. Deploying ProposalImplementation (template)...");
        proposalImplementation = new ProposalImplementation();
        console.log(
            "   ProposalImplementation deployed at:",
            address(proposalImplementation)
        );

        // ==================== PASO 5: Deploy ProposalFactory ====================
        console.log("\n5. Deploying ProposalFactory...");
        factory = new ProposalFactory(
            address(proposalImplementation),
            deployer
        );
        console.log("   ProposalFactory deployed at:", address(factory));

        // Configurar el Governor en el Factory
        factory.setGovernor(address(governor));
        console.log("   Governor set in factory");

        // ==================== PASO 6: Configurar Roles del Timelock ====================
        console.log("\n6. Configuring Timelock roles...");

        bytes32 proposerRole = timelock.PROPOSER_ROLE();
        bytes32 executorRole = timelock.EXECUTOR_ROLE();
        bytes32 adminRole = timelock.DEFAULT_ADMIN_ROLE();

        // Dar rol de proposer al Governor
        timelock.grantRole(proposerRole, address(governor));
        console.log("   PROPOSER_ROLE granted to Governor");

        // Dar rol de executor al Governor
        timelock.grantRole(executorRole, address(governor));
        console.log("   EXECUTOR_ROLE granted to Governor");

        // IMPORTANTE: Revocar el rol de admin del deployer
        // Esto hace que el Timelock sea completamente autónomo
        timelock.revokeRole(adminRole, deployer);
        console.log(
            "   ADMIN_ROLE revoked from deployer (DAO is now autonomous)"
        );

        // ==================== PASO 7: (Opcional) Crear Shareholders Iniciales ====================
        if (initialShareholders.length > 0) {
            console.log("\n7. Creating initial shareholders...");
            require(
                initialShareholders.length == initialShares.length,
                "Shareholders and shares length mismatch"
            );

            for (uint256 i = 0; i < initialShareholders.length; i++) {
                token.createShareholder(
                    initialShareholders[i],
                    initialShares[i]
                );
                console.log("   Created shareholder:", initialShareholders[i]);
                console.log("   Shares:", initialShares[i] / 10 ** 18);
            }

            console.log(
                "   Total supply:",
                token.totalSupply() / 10 ** 18,
                "tokens"
            );
        } else {
            console.log("\n7. No initial shareholders configured");
            console.log(
                "   Use DAOToken.createShareholder() to add shareholders"
            );
        }

        // ==================== PASO 8: Transferir Ownership del Token ====================
        console.log("\n8. Transferring token ownership...");
        // OPCIÓN A: Transferir al Timelock (recomendado para producción)
        token.transferOwnership(address(timelock));
        console.log("   Token ownership transferred to Timelock");
        console.log(
            "   Only DAO governance can create/remove shareholders now"
        );

        // OPCIÓN B: Dejar en el deployer temporalmente para testing
        // console.log("   Token ownership remains with deployer for testing");

        vm.stopBroadcast();

        // ==================== RESUMEN ====================
        console.log("\n===========================================");
        console.log("DEPLOYMENT SUMMARY");
        console.log("===========================================");
        console.log("DAOToken:                ", address(token));
        console.log("TimelockController:      ", address(timelock));
        console.log("CodeCryptoDAOGovernor:   ", address(governor));
        console.log(
            "ProposalImplementation:  ",
            address(proposalImplementation)
        );
        console.log("ProposalFactory:         ", address(factory));
        console.log("===========================================");
        console.log("\nNEXT STEPS:");
        console.log("1. Verify contracts on Etherscan (if mainnet/testnet)");
        console.log(
            "2. Create initial shareholders: token.createShareholder()"
        );
        console.log("3. Shareholders must delegate votes: token.delegate()");
        console.log("4. Create first proposal: governor.propose()");
        console.log("5. Vote on proposals: governor.castVote()");
        console.log("===========================================");

        // Guardar direcciones en archivo JSON para el frontend
        _saveDeploymentAddresses();
    }

    /**
     * @notice Guarda las direcciones de los contratos desplegados
     * @dev Útil para integración con frontend
     */
    function _saveDeploymentAddresses() internal {
        string memory json = "deployment";

        vm.serializeAddress(json, "DAOToken", address(token));
        vm.serializeAddress(json, "TimelockController", address(timelock));
        vm.serializeAddress(json, "CodeCryptoDAOGovernor", address(governor));
        vm.serializeAddress(
            json,
            "ProposalImplementation",
            address(proposalImplementation)
        );
        string memory finalJson = vm.serializeAddress(
            json,
            "ProposalFactory",
            address(factory)
        );

        // Guardar en archivo
        string memory outputPath = "./deployments/addresses.json";
        vm.writeJson(finalJson, outputPath);

        console.log("\nContract addresses saved to:", outputPath);
    }
}
