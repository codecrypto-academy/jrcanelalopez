// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/DAOToken.sol";

contract DAOTokenTest is Test {
    DAOToken public token;

    address public owner = address(1);
    address public shareholder1 = address(2);
    address public shareholder2 = address(3);
    address public shareholder3 = address(4);
    address public nonShareholder = address(5);

    uint256 constant SHAREHOLDER_AMOUNT = 10_000 * 10 ** 18;

    event ShareholderCreated(address indexed shareholder, uint256 amount);
    event ShareholderRemoved(address indexed shareholder, uint256 amount);

    function setUp() public {
        vm.prank(owner);
        token = new DAOToken(owner);
    }

    /* ========== TOKEN BÁSICO ========== */

    function test_InitialState() public view {
        assertEq(token.name(), "CodeCrypto DAO Token");
        assertEq(token.symbol(), "CCDAO");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), 0); // No hay supply inicial
        assertEq(token.owner(), owner);
    }

    function test_Transfer() public {
        // Primero crear tokens
        vm.prank(owner);
        token.createShareholder(shareholder1, 1000);

        vm.prank(shareholder1);
        token.transfer(shareholder2, 500);

        assertEq(token.balanceOf(shareholder1), 500);
        assertEq(token.balanceOf(shareholder2), 500);
    }

    /* ========== SHAREHOLDER MANAGEMENT ========== */

    function test_CreateShareholder() public {
        vm.startPrank(owner);

        vm.expectEmit(true, false, false, true);
        emit ShareholderCreated(shareholder1, SHAREHOLDER_AMOUNT);

        token.createShareholder(shareholder1, SHAREHOLDER_AMOUNT);

        assertEq(token.balanceOf(shareholder1), SHAREHOLDER_AMOUNT);
        assertEq(token.totalSupply(), SHAREHOLDER_AMOUNT);

        vm.stopPrank();
    }

    function test_CreateMultipleShareholders() public {
        vm.startPrank(owner);

        address[] memory shareholders = new address[](3);
        shareholders[0] = shareholder1;
        shareholders[1] = shareholder2;
        shareholders[2] = shareholder3;

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 5000 * 10 ** 18;
        amounts[1] = 7000 * 10 ** 18;
        amounts[2] = 3000 * 10 ** 18;

        token.createShareholders(shareholders, amounts);

        assertEq(token.balanceOf(shareholder1), amounts[0]);
        assertEq(token.balanceOf(shareholder2), amounts[1]);
        assertEq(token.balanceOf(shareholder3), amounts[2]);

        vm.stopPrank();
    }

    function test_RevertWhen_CreateShareholder_NotOwner() public {
        vm.prank(nonShareholder);
        vm.expectRevert();
        token.createShareholder(shareholder1, SHAREHOLDER_AMOUNT);
    }

    function test_RevertWhen_CreateShareholder_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("DAOToken: invalid shareholder address");
        token.createShareholder(address(0), SHAREHOLDER_AMOUNT);
    }

    function test_RevertWhen_CreateShareholder_ZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert("DAOToken: shares must be greater than 0");
        token.createShareholder(shareholder1, 0);
    }

    function test_RevertWhen_CreateShareholders_ArrayMismatch() public {
        vm.startPrank(owner);

        address[] memory shareholders = new address[](2);
        shareholders[0] = shareholder1;
        shareholders[1] = shareholder2;

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 1000;
        amounts[1] = 2000;
        amounts[2] = 3000;

        vm.expectRevert("DAOToken: arrays length mismatch");
        token.createShareholders(shareholders, amounts);

        vm.stopPrank();
    }

    /* ========== REMOVE SHAREHOLDER ========== */

    function test_RemoveShareholder() public {
        // Primero crear un shareholder
        vm.startPrank(owner);
        token.createShareholder(shareholder1, SHAREHOLDER_AMOUNT);

        uint256 totalSupplyBefore = token.totalSupply();

        vm.expectEmit(true, false, false, true);
        emit ShareholderRemoved(shareholder1, SHAREHOLDER_AMOUNT);

        token.removeShareholder(shareholder1, SHAREHOLDER_AMOUNT);

        assertEq(token.balanceOf(shareholder1), 0);
        assertEq(token.totalSupply(), totalSupplyBefore - SHAREHOLDER_AMOUNT); // Los tokens se queman

        vm.stopPrank();
    }

    function test_RemoveShareholder_Partial() public {
        vm.startPrank(owner);
        token.createShareholder(shareholder1, SHAREHOLDER_AMOUNT);

        uint256 removeAmount = SHAREHOLDER_AMOUNT / 2;
        token.removeShareholder(shareholder1, removeAmount);

        assertEq(
            token.balanceOf(shareholder1),
            SHAREHOLDER_AMOUNT - removeAmount
        );

        vm.stopPrank();
    }

    function test_RevertWhen_RemoveShareholder_NotOwner() public {
        vm.prank(owner);
        token.createShareholder(shareholder1, SHAREHOLDER_AMOUNT);

        vm.prank(nonShareholder);
        vm.expectRevert();
        token.removeShareholder(shareholder1, SHAREHOLDER_AMOUNT);
    }

    function test_RevertWhen_RemoveShareholder_InsufficientBalance() public {
        vm.prank(owner);
        token.createShareholder(shareholder1, SHAREHOLDER_AMOUNT);

        vm.prank(owner);
        vm.expectRevert("DAOToken: insufficient shares");
        token.removeShareholder(shareholder1, SHAREHOLDER_AMOUNT + 1);
    }

    /* ========== VOTING POWER (ERC20Votes) ========== */

    function test_Delegation() public {
        vm.prank(owner);
        token.createShareholder(shareholder1, SHAREHOLDER_AMOUNT);

        // Delegar a sí mismo
        vm.prank(shareholder1);
        token.delegate(shareholder1);

        assertEq(token.getVotes(shareholder1), SHAREHOLDER_AMOUNT);
    }

    function test_DelegateToOther() public {
        vm.prank(owner);
        token.createShareholder(shareholder1, SHAREHOLDER_AMOUNT);

        // shareholder1 delega sus votos a shareholder2
        vm.prank(shareholder1);
        token.delegate(shareholder2);

        assertEq(token.getVotes(shareholder1), 0);
        assertEq(token.getVotes(shareholder2), SHAREHOLDER_AMOUNT);
    }

    function test_VotingPowerBeforeAndAfterTransfer() public {
        vm.prank(owner);
        token.createShareholder(shareholder1, SHAREHOLDER_AMOUNT);

        // Delegar
        vm.prank(shareholder1);
        token.delegate(shareholder1);

        assertEq(token.getVotes(shareholder1), SHAREHOLDER_AMOUNT);

        // Transferir la mitad
        uint256 transferAmount = SHAREHOLDER_AMOUNT / 2;
        vm.prank(shareholder1);
        token.transfer(shareholder2, transferAmount);

        // El poder de voto debe reducirse
        assertEq(
            token.getVotes(shareholder1),
            SHAREHOLDER_AMOUNT - transferAmount
        );
    }

    function test_VotingPowerAccumulation() public {
        vm.startPrank(owner);
        token.createShareholder(shareholder1, SHAREHOLDER_AMOUNT);
        token.createShareholder(shareholder2, SHAREHOLDER_AMOUNT);
        vm.stopPrank();

        // Ambos delegan a shareholder3
        vm.prank(shareholder1);
        token.delegate(shareholder3);

        vm.prank(shareholder2);
        token.delegate(shareholder3);

        // shareholder3 debe tener el poder de voto de ambos
        assertEq(token.getVotes(shareholder3), SHAREHOLDER_AMOUNT * 2);
    }

    /* ========== PERMIT (ERC20Permit) ========== */

    function test_Permit() public {
        uint256 privateKey = 0xA11CE;
        address alice = vm.addr(privateKey);

        vm.prank(owner);
        token.createShareholder(alice, SHAREHOLDER_AMOUNT);

        uint256 deadline = block.timestamp + 1 hours;
        uint256 nonce = token.nonces(alice);

        // Crear firma para permit
        bytes32 structHash = keccak256(
            abi.encode(
                keccak256(
                    "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                ),
                alice,
                shareholder2,
                SHAREHOLDER_AMOUNT,
                nonce,
                deadline
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", token.DOMAIN_SEPARATOR(), structHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);

        // Ejecutar permit
        token.permit(
            alice,
            shareholder2,
            SHAREHOLDER_AMOUNT,
            deadline,
            v,
            r,
            s
        );

        // Verificar allowance
        assertEq(token.allowance(alice, shareholder2), SHAREHOLDER_AMOUNT);
    }

    /* ========== CLOCK MODE ========== */

    function test_ClockMode() public view {
        assertEq(token.CLOCK_MODE(), "mode=timestamp");
    }

    function test_Clock() public {
        uint256 currentTimestamp = block.timestamp;
        assertEq(token.clock(), currentTimestamp);

        vm.warp(block.timestamp + 1 days);
        assertEq(token.clock(), currentTimestamp + 1 days);
    }

    /* ========== EDGE CASES ========== */

    function test_CreateAndRemoveSameShareholder() public {
        vm.startPrank(owner);

        // Crear
        token.createShareholder(shareholder1, SHAREHOLDER_AMOUNT);
        assertEq(token.balanceOf(shareholder1), SHAREHOLDER_AMOUNT);

        // Remover completamente
        token.removeShareholder(shareholder1, SHAREHOLDER_AMOUNT);
        assertEq(token.balanceOf(shareholder1), 0);

        // Crear de nuevo
        token.createShareholder(shareholder1, SHAREHOLDER_AMOUNT * 2);
        assertEq(token.balanceOf(shareholder1), SHAREHOLDER_AMOUNT * 2);

        vm.stopPrank();
    }

    function testFuzz_CreateShareholder(
        address _shareholder,
        uint256 _amount
    ) public {
        vm.assume(_shareholder != address(0));
        vm.assume(_amount > 0 && _amount <= type(uint128).max); // Límite razonable

        vm.prank(owner);
        token.createShareholder(_shareholder, _amount);

        assertEq(token.balanceOf(_shareholder), _amount);
    }
}
