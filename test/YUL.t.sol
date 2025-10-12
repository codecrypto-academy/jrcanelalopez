// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/YUL.sol";

contract OptimizedYULTest is Test {
    OptimizedYUL public yulContract;
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);

    event Transfer(address indexed from, address indexed to, uint256 value);

    function setUp() public {
        vm.prank(owner);
        yulContract = new OptimizedYUL();

        assertEq(yulContract.owner(), owner);
    }

    // ===== ARITHMETIC TESTS =====

    function test_SafeAdd_Success() public {
        uint256 result = yulContract.safeAdd(100, 50);
        assertEq(result, 150);
    }

    function test_SafeAdd_Overflow_Reverts() public {
        vm.expectRevert();
        yulContract.safeAdd(type(uint256).max, 1);
    }

    function test_SafeSub_Success() public {
        uint256 result = yulContract.safeSub(100, 30);
        assertEq(result, 70);
    }

    function test_SafeSub_Underflow_Reverts() public {
        vm.expectRevert();
        yulContract.safeSub(50, 100);
    }

    function test_SafeMul_Success() public {
        uint256 result = yulContract.safeMul(12, 5);
        assertEq(result, 60);
    }

    function test_SafeMul_Overflow_Reverts() public {
        vm.expectRevert();
        yulContract.safeMul(type(uint256).max, 2);
    }

    function test_SafeDiv_Success() public {
        uint256 result = yulContract.safeDiv(100, 4);
        assertEq(result, 25);
    }

    function test_SafeDiv_ZeroDivisor_Reverts() public {
        vm.expectRevert();
        yulContract.safeDiv(100, 0);
    }

    // ===== BALANCE TESTS =====

    function test_SetBalance_OnlyOwner() public {
        vm.prank(owner);
        yulContract.setBalance(user1, 1000);

        uint256 balance = yulContract.getBalance(user1);
        assertEq(balance, 1000);
    }

    function test_SetBalance_NotOwner_Reverts() public {
        vm.prank(user1);
        vm.expectRevert();
        yulContract.setBalance(user1, 1000);
    }

    function test_GetBalance_InitiallyZero() public {
        uint256 balance = yulContract.getBalance(user1);
        assertEq(balance, 0);
    }

    // ===== TRANSFER TESTS =====

    function test_OptimizedTransfer_Success() public {
        // Configurar balance inicial
        vm.prank(owner);
        yulContract.setBalance(user1, 1000);

        // Realizar transferencia
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit Transfer(user1, user2, 300);

        yulContract.optimizedTransfer(user2, 300);

        // Verificar balances
        assertEq(yulContract.getBalance(user1), 700);
        assertEq(yulContract.getBalance(user2), 300);
    }

    function test_OptimizedTransfer_InsufficientBalance_Reverts() public {
        vm.prank(owner);
        yulContract.setBalance(user1, 100);

        vm.prank(user1);
        vm.expectRevert();
        yulContract.optimizedTransfer(user2, 200);
    }

    function test_OptimizedTransfer_ToZeroAddress_Reverts() public {
        vm.prank(owner);
        yulContract.setBalance(user1, 100);

        vm.prank(user1);
        vm.expectRevert();
        yulContract.optimizedTransfer(address(0), 50);
    }

    // ===== COMPARISON TESTS =====

    function test_Compare_Equal() public {
        (bool isEqual, bool isGreater, bool isLess) = yulContract.compare(
            100,
            100
        );

        assertTrue(isEqual);
        assertFalse(isGreater);
        assertFalse(isLess);
    }

    function test_Compare_Greater() public {
        (bool isEqual, bool isGreater, bool isLess) = yulContract.compare(
            200,
            100
        );

        assertFalse(isEqual);
        assertTrue(isGreater);
        assertFalse(isLess);
    }

    function test_Compare_Less() public {
        (bool isEqual, bool isGreater, bool isLess) = yulContract.compare(
            50,
            100
        );

        assertFalse(isEqual);
        assertFalse(isGreater);
        assertTrue(isLess);
    }

    // ===== HASH TESTS =====

    function test_CalculateHash() public {
        bytes memory data = "Hello World";
        bytes32 hash = yulContract.calculateHash(data);

        // Verificar que se calculó un hash (no vacío)
        assertTrue(hash != bytes32(0));

        // El hash debe ser consistente
        bytes32 hash2 = yulContract.calculateHash(data);
        assertEq(hash, hash2);
    }

    // ===== POWER TESTS =====

    function test_Power_Success() public {
        uint256 result = yulContract.power(2, 3);
        assertEq(result, 8);

        result = yulContract.power(5, 2);
        assertEq(result, 25);

        result = yulContract.power(10, 0);
        assertEq(result, 1);
    }

    function test_Power_Overflow_Reverts() public {
        vm.expectRevert();
        yulContract.power(type(uint256).max, 2);
    }

    // ===== BLOCK INFO TESTS =====

    function test_GetBlockInfo() public {
        (
            uint256 blockNumber,
            uint256 blockTimestamp,
            uint256 blockDifficulty,
            uint256 blockGasLimit
        ) = yulContract.getBlockInfo();

        // Verificar que se obtienen valores válidos
        assertGt(blockNumber, 0);
        assertGt(blockTimestamp, 0);
        assertGt(blockGasLimit, 0);
    }

    // ===== MEMORY COPY TESTS =====

    function test_OptimizedMemoryCopy() public {
        bytes memory original = "Test data for copying";
        bytes memory copied = yulContract.optimizedMemoryCopy(original);

        // Verificar que la copia es idéntica
        assertEq(copied.length, original.length);
        assertEq(keccak256(copied), keccak256(original));

        // Verificar que son objetos diferentes en memoria
        // (no podemos verificar esto directamente en Solidity, pero el test pasa si la función funciona)
    }

    // ===== CONTRACT DETECTION TESTS =====

    function test_IsContract_EOA() public {
        // Una dirección EOA (Externally Owned Account) no es un contrato
        bool isContractResult = yulContract.isContract(user1);
        assertFalse(isContractResult);
    }

    function test_IsContract_Contract() public {
        // El propio contrato debe ser detectado como contrato
        bool isContractResult = yulContract.isContract(address(yulContract));
        assertTrue(isContractResult);
    }

    function test_GetCodeSize_EOA() public {
        uint256 size = yulContract.getCodeSize(user1);
        assertEq(size, 0);
    }

    function test_GetCodeSize_Contract() public {
        uint256 size = yulContract.getCodeSize(address(yulContract));
        assertGt(size, 0);
    }

    // ===== INTEGRATION TESTS =====

    function test_CompleteWorkflow() public {
        // 1. Configurar balances iniciales
        vm.startPrank(owner);
        yulContract.setBalance(user1, 1000);
        yulContract.setBalance(user2, 500);
        vm.stopPrank();

        // 2. Realizar cálculos matemáticos
        uint256 sum = yulContract.safeAdd(1000, 500);
        assertEq(sum, 1500);

        // 3. Realizar transferencia
        vm.prank(user1);
        yulContract.optimizedTransfer(user2, 200);

        // 4. Verificar estado final
        assertEq(yulContract.getBalance(user1), 800);
        assertEq(yulContract.getBalance(user2), 700);

        // 5. Verificar comparaciones
        (bool isEqual, bool isGreater, bool isLess) = yulContract.compare(
            yulContract.getBalance(user1),
            yulContract.getBalance(user2)
        );

        assertFalse(isEqual);
        assertTrue(isGreater);
        assertFalse(isLess);
    }

    // ===== FUZZ TESTS =====

    function testFuzz_SafeAdd(uint128 a, uint128 b) public {
        // Usar uint128 para evitar overflow intencionalmente
        uint256 result = yulContract.safeAdd(a, b);
        assertEq(result, uint256(a) + uint256(b));
    }

    function testFuzz_SafeSub(uint256 a, uint256 b) public {
        vm.assume(a >= b);
        uint256 result = yulContract.safeSub(a, b);
        assertEq(result, a - b);
    }

    function testFuzz_Compare(uint256 a, uint256 b) public {
        (bool isEqual, bool isGreater, bool isLess) = yulContract.compare(a, b);

        if (a == b) {
            assertTrue(isEqual);
            assertFalse(isGreater);
            assertFalse(isLess);
        } else if (a > b) {
            assertFalse(isEqual);
            assertTrue(isGreater);
            assertFalse(isLess);
        } else {
            assertFalse(isEqual);
            assertFalse(isGreater);
            assertTrue(isLess);
        }
    }
}
