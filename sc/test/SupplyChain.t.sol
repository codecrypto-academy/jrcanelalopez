// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SupplyChain.sol";

/// @title Supply Chain Tracker Tests
/// @notice Comprehensive test suite for SupplyChain contract
contract SupplyChainTest is Test {
    SupplyChain public supplyChain;

    // Test accounts
    address public admin = address(0x1);
    address public producer = address(0x2);
    address public factory = address(0x3);
    address public retailer = address(0x4);
    address public consumer = address(0x5);

    // Events to test
    event TokenCreated(uint256 indexed tokenId, address indexed creator, string name, uint256 totalSupply);
    event TransferRequested(uint256 indexed transferId, address indexed from, address indexed to, uint256 tokenId, uint256 amount);
    event TransferAccepted(uint256 indexed transferId);
    event TransferRejected(uint256 indexed transferId);
    event UserRoleRequested(address indexed user, string role);
    event UserStatusChanged(address indexed user, SupplyChain.UserStatus status);

    function setUp() public {
        // Deploy contract as admin
        vm.prank(admin);
        supplyChain = new SupplyChain();
    }

    // ============ Helper Functions ============

    function _registerAndApprove(address user, string memory role) internal {
        vm.prank(user);
        supplyChain.requestUserRole(role);

        vm.prank(admin);
        supplyChain.changeStatusUser(user, SupplyChain.UserStatus.Approved);
    }

    function _createToken(
        address creator,
        string memory name,
        uint256 supply,
        uint256 parentId
    ) internal returns (uint256) {
        vm.prank(creator);
        return supplyChain.createToken(name, supply, "{}", parentId);
    }

    // ============ User Management Tests ============

    function testUserRegistration() public {
        vm.expectEmit(true, false, false, true);
        emit UserRoleRequested(producer, "Producer");

        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(user.userAddress, producer, "User address should match");
        assertEq(user.role, "Producer", "Role should be Producer");
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Pending), "Status should be Pending");
    }

    function testAdminApproveUser() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        vm.expectEmit(true, false, false, true);
        emit UserStatusChanged(producer, SupplyChain.UserStatus.Approved);

        vm.prank(admin);
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);

        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Approved), "Status should be Approved");
    }

    function testAdminRejectUser() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        vm.prank(admin);
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Rejected);

        SupplyChain.User memory user = supplyChain.getUserInfo(producer);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Rejected), "Status should be Rejected");
    }

    function testOnlyAdminCanChangeStatus() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        // Non-admin tries to approve
        vm.expectRevert(SupplyChain.OnlyAdmin.selector);
        vm.prank(factory);
        supplyChain.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
    }

    function testIsAdmin() public {
        assertTrue(supplyChain.isAdmin(admin), "Admin should be recognized");
        assertFalse(supplyChain.isAdmin(producer), "Producer should not be admin");
    }

    function testInvalidRole() public {
        vm.expectRevert(SupplyChain.InvalidRole.selector);
        vm.prank(producer);
        supplyChain.requestUserRole("InvalidRole");
    }

    function testUserAlreadyRegistered() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");

        vm.expectRevert(SupplyChain.UserAlreadyRegistered.selector);
        vm.prank(producer);
        supplyChain.requestUserRole("Factory");
    }

    // ============ Token Creation Tests ============

    function testCreateTokenByProducer() public {
        _registerAndApprove(producer, "Producer");

        vm.expectEmit(true, true, false, true);
        emit TokenCreated(1, producer, "Raw Cotton", 1000);

        uint256 tokenId = _createToken(producer, "Raw Cotton", 1000, 0);

        assertEq(tokenId, 1, "Token ID should be 1");

        (
            uint256 id,
            address creator,
            string memory name,
            uint256 totalSupply,
            ,
            uint256 parentId,
            uint256 dateCreated
        ) = supplyChain.getToken(tokenId);

        assertEq(id, 1, "Token ID should match");
        assertEq(creator, producer, "Creator should be producer");
        assertEq(name, "Raw Cotton", "Name should match");
        assertEq(totalSupply, 1000, "Supply should be 1000");
        assertEq(parentId, 0, "ParentId should be 0");
        assertGt(dateCreated, 0, "DateCreated should be set");

        uint256 balance = supplyChain.getTokenBalance(tokenId, producer);
        assertEq(balance, 1000, "Producer should have full balance");
    }

    function testCreateTokenByFactory() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");

        uint256 rawMaterialId = _createToken(producer, "Raw Cotton", 1000, 0);

        // Transfer to factory
        vm.prank(producer);
        supplyChain.transfer(factory, rawMaterialId, 500);

        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        // Factory creates product with parent
        uint256 productId = _createToken(factory, "Fabric", 250, rawMaterialId);

        (,,, , , uint256 parentId,) = supplyChain.getToken(productId);
        assertEq(parentId, rawMaterialId, "Parent ID should match raw material");
    }

    function testProducerCannotCreateWithParentId() public {
        _registerAndApprove(producer, "Producer");

        vm.expectRevert(SupplyChain.InvalidParentId.selector);
        _createToken(producer, "Token", 100, 1);
    }

    function testFactoryMustUseParentId() public {
        _registerAndApprove(factory, "Factory");

        vm.expectRevert(SupplyChain.InvalidParentId.selector);
        _createToken(factory, "Product", 100, 0);
    }

    function testUnapprovedUserCannotCreateToken() public {
        vm.prank(producer);
        supplyChain.requestUserRole("Producer");
        // Not approved

        vm.expectRevert(SupplyChain.UserNotApproved.selector);
        _createToken(producer, "Token", 100, 0);
    }

    function testGetUserTokens() public {
        _registerAndApprove(producer, "Producer");

        _createToken(producer, "Token1", 100, 0);
        _createToken(producer, "Token2", 200, 0);

        uint256[] memory tokens = supplyChain.getUserTokens(producer);
        assertEq(tokens.length, 2, "Should have 2 tokens");
        assertEq(tokens[0], 1, "First token ID should be 1");
        assertEq(tokens[1], 2, "Second token ID should be 2");
    }

    // ============ Transfer Tests ============

    function testTransferFromProducerToFactory() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");

        uint256 tokenId = _createToken(producer, "Raw Material", 1000, 0);

        vm.expectEmit(true, true, true, true);
        emit TransferRequested(1, producer, factory, tokenId, 500);

        vm.prank(producer);
        supplyChain.transfer(factory, tokenId, 500);

        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(t.from, producer, "From should be producer");
        assertEq(t.to, factory, "To should be factory");
        assertEq(t.tokenId, tokenId, "Token ID should match");
        assertEq(t.amount, 500, "Amount should be 500");
        assertEq(uint(t.status), uint(SupplyChain.TransferStatus.Pending), "Status should be Pending");
    }

    function testAcceptTransfer() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");

        uint256 tokenId = _createToken(producer, "Raw Material", 1000, 0);

        vm.prank(producer);
        supplyChain.transfer(factory, tokenId, 500);

        vm.expectEmit(true, false, false, false);
        emit TransferAccepted(1);

        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        // Verify balances
        uint256 producerBalance = supplyChain.getTokenBalance(tokenId, producer);
        uint256 factoryBalance = supplyChain.getTokenBalance(tokenId, factory);

        assertEq(producerBalance, 500, "Producer balance should be 500");
        assertEq(factoryBalance, 500, "Factory balance should be 500");

        // Verify status
        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(uint(t.status), uint(SupplyChain.TransferStatus.Accepted), "Status should be Accepted");
    }

    function testRejectTransfer() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");

        uint256 tokenId = _createToken(producer, "Raw Material", 1000, 0);

        vm.prank(producer);
        supplyChain.transfer(factory, tokenId, 500);

        vm.expectEmit(true, false, false, false);
        emit TransferRejected(1);

        vm.prank(factory);
        supplyChain.rejectTransfer(1);

        // Verify balances unchanged
        uint256 producerBalance = supplyChain.getTokenBalance(tokenId, producer);
        uint256 factoryBalance = supplyChain.getTokenBalance(tokenId, factory);

        assertEq(producerBalance, 1000, "Producer balance should be unchanged");
        assertEq(factoryBalance, 0, "Factory balance should be 0");

        SupplyChain.Transfer memory t = supplyChain.getTransfer(1);
        assertEq(uint(t.status), uint(SupplyChain.TransferStatus.Rejected), "Status should be Rejected");
    }

    function testInsufficientBalance() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");

        uint256 tokenId = _createToken(producer, "Raw Material", 1000, 0);

        vm.expectRevert(SupplyChain.InsufficientBalance.selector);
        vm.prank(producer);
        supplyChain.transfer(factory, tokenId, 1500);
    }

    function testInvalidRoleFlow() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(retailer, "Retailer");

        uint256 tokenId = _createToken(producer, "Raw Material", 1000, 0);

        // Producer cannot transfer directly to Retailer
        vm.expectRevert(SupplyChain.InvalidRoleFlow.selector);
        vm.prank(producer);
        supplyChain.transfer(retailer, tokenId, 500);
    }

    function testConsumerCannotTransfer() public {
        _registerAndApprove(retailer, "Retailer");
        _registerAndApprove(consumer, "Consumer");

        // Need to get a token to consumer first (through complete flow)
        // For this test, we'll just verify the role validation
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");

        uint256 rawId = _createToken(producer, "Raw", 1000, 0);

        vm.prank(producer);
        supplyChain.transfer(factory, rawId, 500);

        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        uint256 productId = _createToken(factory, "Product", 250, rawId);

        vm.prank(factory);
        supplyChain.transfer(retailer, productId, 100);

        vm.prank(retailer);
        supplyChain.acceptTransfer(2);

        vm.prank(retailer);
        supplyChain.transfer(consumer, productId, 50);

        vm.prank(consumer);
        supplyChain.acceptTransfer(3);

        // Now consumer has tokens, but cannot transfer
        vm.expectRevert(SupplyChain.InvalidRoleFlow.selector);
        vm.prank(consumer);
        supplyChain.transfer(producer, productId, 10);
    }

    function testTransferToSameAddress() public {
        _registerAndApprove(producer, "Producer");
        uint256 tokenId = _createToken(producer, "Raw", 1000, 0);

        vm.expectRevert(SupplyChain.InvalidAddress.selector);
        vm.prank(producer);
        supplyChain.transfer(producer, tokenId, 100);
    }

    function testGetUserTransfers() public {
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");

        uint256 tokenId = _createToken(producer, "Raw", 1000, 0);

        vm.prank(producer);
        supplyChain.transfer(factory, tokenId, 500);

        uint256[] memory producerTransfers = supplyChain.getUserTransfers(producer);
        uint256[] memory factoryTransfers = supplyChain.getUserTransfers(factory);

        assertEq(producerTransfers.length, 1, "Producer should have 1 transfer");
        assertEq(factoryTransfers.length, 1, "Factory should have 1 transfer");
        assertEq(producerTransfers[0], 1, "Transfer ID should be 1");
    }

    // ============ Complete Flow Test ============

    function testCompleteSupplyChainFlow() public {
        // Register all users
        _registerAndApprove(producer, "Producer");
        _registerAndApprove(factory, "Factory");
        _registerAndApprove(retailer, "Retailer");
        _registerAndApprove(consumer, "Consumer");

        // Producer creates raw material
        uint256 rawId = _createToken(producer, "Raw Cotton", 1000, 0);

        // Producer → Factory
        vm.prank(producer);
        supplyChain.transfer(factory, rawId, 500);
        vm.prank(factory);
        supplyChain.acceptTransfer(1);

        // Factory creates product
        uint256 productId = _createToken(factory, "Fabric", 250, rawId);

        // Factory → Retailer
        vm.prank(factory);
        supplyChain.transfer(retailer, productId, 100);
        vm.prank(retailer);
        supplyChain.acceptTransfer(2);

        // Retailer → Consumer
        vm.prank(retailer);
        supplyChain.transfer(consumer, productId, 50);
        vm.prank(consumer);
        supplyChain.acceptTransfer(3);

        // Verify final balances
        assertEq(supplyChain.getTokenBalance(rawId, producer), 500, "Producer keeps 500 raw");
        assertEq(supplyChain.getTokenBalance(rawId, factory), 500, "Factory has 500 raw");
        assertEq(supplyChain.getTokenBalance(productId, factory), 150, "Factory keeps 150 product");
        assertEq(supplyChain.getTokenBalance(productId, retailer), 50, "Retailer keeps 50 product");
        assertEq(supplyChain.getTokenBalance(productId, consumer), 50, "Consumer has 50 product");

        // Verify traceability
        (,,,,, uint256 parentId,) = supplyChain.getToken(productId);
        assertEq(parentId, rawId, "Product traces back to raw material");
    }
}
