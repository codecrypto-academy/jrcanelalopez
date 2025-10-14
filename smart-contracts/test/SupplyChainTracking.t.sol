// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SupplyChainTracking.sol";

contract SupplyChainTrackingTest is Test {
    SupplyChainTracking public supplyChain;
    
    address public owner;
    address public agricultor;
    address public almacenador;
    address public molinero;
    
    function setUp() public {
        owner = address(this);
        agricultor = address(0x1);
        almacenador = address(0x2);
        molinero = address(0x3);
        
        supplyChain = new SupplyChainTracking();
        
        // Asignar roles
        supplyChain.assignRole(agricultor, SupplyChainTracking.Role.AGRICULTOR);
        supplyChain.assignRole(almacenador, SupplyChainTracking.Role.ALMACENADOR);
        supplyChain.assignRole(molinero, SupplyChainTracking.Role.MOLINERO);
    }
    
    function testCreateCosechaToken() public {
        vm.prank(agricultor);
        uint256 tokenId = supplyChain.createToken();
        
        assertEq(tokenId, 1);
        assertEq(uint8(supplyChain.tokenType(tokenId)), uint8(SupplyChainTracking.TokenType.COSECHA));
        assertEq(supplyChain.producer(tokenId), agricultor);
        assertEq(supplyChain.parent1(tokenId), 0);
        assertEq(supplyChain.parent2(tokenId), 0);
    }
    
    function testCreateAlmacenToken() public {
        // Crear 2 tokens de cosecha
        vm.startPrank(agricultor);
        uint256 cosecha1 = supplyChain.createToken();
        uint256 cosecha2 = supplyChain.createToken();
        vm.stopPrank();
        
        // Crear token de almacén con los 2 de cosecha
        vm.prank(almacenador);
        uint256 almacen = supplyChain.createTokenWithParents(cosecha1, cosecha2);
        
        assertEq(uint8(supplyChain.tokenType(almacen)), uint8(SupplyChainTracking.TokenType.ALMACEN));
        assertEq(supplyChain.parent1(almacen), cosecha1);
        assertEq(supplyChain.parent2(almacen), cosecha2);
    }
    
    function testCannotCreateWithoutRole() public {
        vm.prank(address(0x999));
        vm.expectRevert("Only AGRICULTOR can create COSECHA");
        supplyChain.createToken();
    }
    
    function testTransferEmitsEvent() public {
        vm.prank(agricultor);
        uint256 tokenId = supplyChain.createToken();
        
        address newOwner = address(0x123);
        
        vm.prank(agricultor);
        vm.expectEmit(true, true, true, true);
        emit SupplyChainTracking.TokenTransferred(tokenId, agricultor, newOwner, block.timestamp);
        supplyChain.transferFrom(agricultor, newOwner, tokenId);
    }
    
    function testGetTokenMetadata() public {
        vm.prank(agricultor);
        uint256 tokenId = supplyChain.createToken();
        
        (
            SupplyChainTracking.TokenType _type,
            address _producer,
            uint256 _parent1,
            uint256 _parent2,
            uint256 _createdAt,
            address _owner
        ) = supplyChain.getTokenMetadata(tokenId);
        
        assertEq(uint8(_type), uint8(SupplyChainTracking.TokenType.COSECHA));
        assertEq(_producer, agricultor);
        assertEq(_parent1, 0);
        assertEq(_parent2, 0);
        assertEq(_owner, agricultor);
    }
}
