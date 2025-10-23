// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SupplyChain.sol";

/// @title Supply Chain Gas Report Tests
/// @notice Detailed gas measurement tests for SupplyChain contract operations
/// @dev Run with: forge test --match-contract SupplyChainGasReport --gas-report
contract SupplyChainGasReport is Test {
    SupplyChain public supplyChain;

    // Test accounts
    address public admin = address(0x1);
    address public producer = address(0x2);
    address public factory = address(0x3);
    address public retailer = address(0x4);
    address public consumer = address(0x5);

    // Gas tracking
    struct GasSnapshot {
        uint256 gasStart;
        uint256 gasUsed;
        string operation;
    }

    GasSnapshot[] public gasSnapshots;

    function setUp() public {
        // Deploy contract as admin
        vm.prank(admin);
        supplyChain = new SupplyChain();

        console.log("\n==================================================");
        console.log("      SUPPLY CHAIN GAS CONSUMPTION REPORT");
        console.log("==================================================\n");
    }

    // ============ Helper Functions ============

    function _startGas(string memory operation) internal {
        uint256 gasStart = gasleft();
        gasSnapshots.push(GasSnapshot({
            gasStart: gasStart,
            gasUsed: 0,
            operation: operation
        }));
    }

    function _endGas() internal {
        uint256 gasEnd = gasleft();
        uint256 index = gasSnapshots.length - 1;
        gasSnapshots[index].gasUsed = gasSnapshots[index].gasStart - gasEnd;

        // Log gas usage
        console.log("Operation:", gasSnapshots[index].operation);
        console.log("Gas Used: ", gasSnapshots[index].gasUsed);
        console.log("--------------------------------------------------");
    }

    function _registerAndApprove(address user, string memory role) internal {
        vm.prank(admin);
        supplyChain.registerUser(user, role);
    }

    // ============ User Management Gas Tests ============

    function testGas_UserRegistration() public {
        console.log("\n[USER MANAGEMENT]");

        _startGas("registerUser(Producer)");
        vm.prank(admin);
        supplyChain.registerUser(producer, "Producer");
        _endGas();

        _startGas("changeStatusUser(Reject)");
        vm.prank(admin);
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Rejected);
        _endGas();

        _startGas("getUserInfo()");
        supplyChain.getUserInfo(producer);
        _endGas();

        _startGas("isAdmin()");
        supplyChain.isAdmin(admin);
        _endGas();
    }

    function testGas_MultipleUserRegistrations() public {
        console.log("\n[BATCH USER REGISTRATION]");

        _startGas("Register Producer");
        vm.prank(admin);
        supplyChain.registerUser(producer, "Producer");
        _endGas();

        _startGas("Register Factory");
        vm.prank(admin);
        supplyChain.registerUser(factory, "Factory");
        _endGas();

        _startGas("Register Retailer");
        vm.prank(admin);
        supplyChain.registerUser(retailer, "Retailer");
        _endGas();

        _startGas("Register Consumer");
        vm.prank(admin);
        supplyChain.registerUser(consumer, "Consumer");
        _endGas();
    }

    // ============ Token Creation Gas Tests ============

    function testGas_TokenCreation() public {
        console.log("\n[TOKEN CREATION]");

        _registerAndApprove(producer, "Producer");

        _startGas("createToken(small supply: 100)");
        vm.prank(producer);
        supplyChain.createToken("Small Batch", 100, '{"type":"raw"}', 0);
        _endGas();

        _startGas("createToken(medium supply: 1000)");
        vm.prank(producer);
        supplyChain.createToken("Medium Batch", 1000, '{"type":"raw"}', 0);
        _endGas();

        _startGas("createToken(large supply: 10000)");
        vm.prank(producer);
        supplyChain.createToken("Large Batch", 10000, '{"type":"raw","quality":"premium"}', 0);
        _endGas();

        _startGas("getToken()");
        supplyChain.getToken(1);
        _endGas();

        _startGas("getTokenBalance()");
        supplyChain.getTokenBalance(1, producer);
        _endGas();

        _startGas("getUserTokens()");
        supplyChain.getUserTokens(producer);
        _endGas();
    }

    function testGas_TokenWithParent() public {
        console.log("\n[TOKEN WITH PARENT (Factory Product)]");

        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");

        // Create raw material
        vm.prank(producer);
        uint256 rawId = supplyChain.createToken("Raw Cotton", 1000, '{"type":"raw"}', 0);

        // Transfer to factory
        vm.prank(producer);
        supplyChain.transfer(factory, rawId, 500);

        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        _startGas("createToken(with parent)");
        vm.prank(factory);
        supplyChain.createToken("Cotton Fabric", 250, '{"type":"processed","parent":"Raw Cotton"}', rawId);
        _endGas();
    }

    // ============ Transfer Gas Tests ============

    function testGas_CompleteTransferFlow() public {
        console.log("\n[TRANSFER FLOW]");

        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");

        vm.prank(producer);
        uint256 tokenId = supplyChain.createToken("Raw Material", 1000, '{}', 0);

        _startGas("transfer(initiate)");
        vm.prank(producer);
        supplyChain.transfer(factory, tokenId, 500);
        _endGas();

        _startGas("acceptTransfer()");
        vm.prank(factory);
        supplyChain.acceptTransfer(1);
        _endGas();

        _startGas("getTransfer()");
        supplyChain.getTransfer(1);
        _endGas();

        _startGas("getUserTransfers()");
        supplyChain.getUserTransfers(producer);
        _endGas();
    }

    function testGas_RejectTransfer() public {
        console.log("\n[REJECT TRANSFER]");

        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");

        vm.prank(producer);
        uint256 tokenId = supplyChain.createToken("Raw Material", 1000, '{}', 0);

        vm.prank(producer);
        supplyChain.transfer(factory, tokenId, 500);

        _startGas("rejectTransfer()");
        vm.prank(factory);
        supplyChain.rejectTransfer(1);
        _endGas();
    }

    // ============ Pause/Unpause Gas Tests ============

    function testGas_PauseUnpause() public {
        console.log("\n[PAUSE/UNPAUSE]");

        _startGas("pause()");
        vm.prank(admin);
        supplyChain.pause();
        _endGas();

        _startGas("isPaused()");
        supplyChain.isPaused();
        _endGas();

        _startGas("unpause()");
        vm.prank(admin);
        supplyChain.unpause();
        _endGas();
    }

    // ============ Complete Supply Chain Flow Gas Test ============

    function testGas_CompleteSupplyChainFlow() public {
        console.log("\n[COMPLETE SUPPLY CHAIN FLOW]");

        // Setup all users
        _startGas("Setup: Register and approve 4 users");
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        _registerAndApprove(retailer, "Retailer");
        _registerAndApprove(consumer, "Consumer");
        _endGas();

        // Producer creates raw material
        _startGas("Step 1: Producer creates raw material");
        vm.prank(producer);
        uint256 rawId = supplyChain.createToken("Raw Cotton", 1000, '{"quality":"premium"}', 0);
        _endGas();

        // Producer → Factory
        _startGas("Step 2: Producer initiates transfer to Factory");
        vm.prank(producer);
        supplyChain.transfer(factory, rawId, 500);
        _endGas();

        _startGas("Step 3: Factory accepts transfer");
        vm.prank(factory);
        supplyChain.acceptTransfer(1);
        _endGas();

        // Factory creates product
        _startGas("Step 4: Factory creates product from raw material");
        vm.prank(factory);
        uint256 productId = supplyChain.createToken("Cotton Fabric", 250, '{"parent":"Raw Cotton"}', rawId);
        _endGas();

        // Factory → Retailer
        _startGas("Step 5: Factory initiates transfer to Retailer");
        vm.prank(factory);
        supplyChain.transfer(retailer, productId, 100);
        _endGas();

        _startGas("Step 6: Retailer accepts transfer");
        vm.prank(retailer);
        supplyChain.acceptTransfer(2);
        _endGas();

        // Retailer → Consumer
        _startGas("Step 7: Retailer initiates transfer to Consumer");
        vm.prank(retailer);
        supplyChain.transfer(consumer, productId, 50);
        _endGas();

        _startGas("Step 8: Consumer accepts transfer");
        vm.prank(consumer);
        supplyChain.acceptTransfer(3);
        _endGas();

        // Verify traceability (read operations)
        _startGas("Step 9: Verify product traceability");
        supplyChain.getToken(productId);
        supplyChain.getToken(rawId);
        supplyChain.getTokenBalance(productId, consumer);
        _endGas();

        console.log("\n==================================================");
        console.log("              END OF GAS REPORT");
        console.log("==================================================\n");
    }

    // ============ Gas Comparison Tests ============

    function testGas_CompareTransferSizes() public {
        console.log("\n[TRANSFER SIZE COMPARISON]");

        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");

        vm.prank(producer);
        uint256 tokenId = supplyChain.createToken("Raw", 10000, '{}', 0);

        _startGas("Transfer 100 units");
        vm.prank(producer);
        supplyChain.transfer(factory, tokenId, 100);
        _endGas();

        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        _startGas("Transfer 1000 units");
        vm.prank(producer);
        supplyChain.transfer(factory, tokenId, 1000);
        _endGas();

        vm.prank(factory);
        supplyChain.acceptTransfer(2);

        _startGas("Transfer 5000 units");
        vm.prank(producer);
        supplyChain.transfer(factory, tokenId, 5000);
        _endGas();
    }

    function testGas_CompareMetadataSizes() public {
        console.log("\n[METADATA SIZE COMPARISON]");

        _registerAndApprove(producer, "Producer");

        _startGas("Small metadata (10 bytes)");
        vm.prank(producer);
        supplyChain.createToken("Token1", 100, '{"a":"b"}', 0);
        _endGas();

        _startGas("Medium metadata (50 bytes)");
        vm.prank(producer);
        supplyChain.createToken("Token2", 100, '{"type":"raw","quality":"premium","origin":"farm"}', 0);
        _endGas();

        _startGas("Large metadata (150 bytes)");
        vm.prank(producer);
        supplyChain.createToken("Token3", 100, '{"type":"raw","quality":"premium","origin":"farm","certifications":["organic","fair-trade"],"harvest_date":"2025-01-01","batch":"ABC123"}', 0);
        _endGas();
    }
}
