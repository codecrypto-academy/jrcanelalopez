// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Contrato Optimizado con YUL
 * @dev Implementación de operaciones optimizadas usando YUL (Yul Intermediate Language)
 * YUL permite escribir código de bajo nivel altamente optimizado para la EVM
 */
contract OptimizedYUL {
    // ===== VARIABLES DE ESTADO =====
    address public owner;
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;
    uint256 public totalSupply;

    // ===== EVENTOS =====
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    // ===== MODIFICADORES =====
    modifier onlyOwner() {
        assembly {
            // Verificar si msg.sender == owner usando YUL
            if iszero(eq(caller(), sload(owner.slot))) {
                // Revert con mensaje de error
                mstore(
                    0x00,
                    0x08c379a000000000000000000000000000000000000000000000000000000000
                )
                mstore(
                    0x20,
                    0x0000002000000000000000000000000000000000000000000000000000000000
                )
                mstore(
                    0x40,
                    0x0000000f4f6e6c79206f776e6572206163636573730000000000000000000000
                )
                mstore(
                    0x60,
                    0x0000000000000000000000000000000000000000000000000000000000000000
                )
                revert(0x00, 0x64)
            }
        }
        _;
    }

    // ===== CONSTRUCTOR =====
    constructor() {
        assembly {
            // Establecer owner = msg.sender de forma optimizada
            sstore(owner.slot, caller())
        }
    }

    // ===== FUNCIONES OPTIMIZADAS CON YUL =====

    /**
     * @dev Suma optimizada usando YUL
     * @param a Primer número
     * @param b Segundo número
     * @return result Resultado de la suma con verificación de overflow
     */
    function safeAdd(
        uint256 a,
        uint256 b
    ) public pure returns (uint256 result) {
        assembly {
            result := add(a, b)
            // Verificar overflow: result >= a
            if lt(result, a) {
                // Overflow detectado
                mstore(
                    0x00,
                    0x08c379a000000000000000000000000000000000000000000000000000000000
                )
                mstore(
                    0x20,
                    0x0000002000000000000000000000000000000000000000000000000000000000
                )
                mstore(
                    0x40,
                    0x0000000d4f766572666c6f77206572726f72000000000000000000000000000000
                )
                revert(0x00, 0x64)
            }
        }
    }

    /**
     * @dev Resta optimizada usando YUL
     * @param a Minuendo
     * @param b Sustraendo
     * @return result Resultado de la resta con verificación de underflow
     */
    function safeSub(
        uint256 a,
        uint256 b
    ) public pure returns (uint256 result) {
        assembly {
            result := sub(a, b)
            // Verificar underflow: a >= b
            if gt(b, a) {
                // Underflow detectado
                mstore(
                    0x00,
                    0x08c379a000000000000000000000000000000000000000000000000000000000
                )
                mstore(
                    0x20,
                    0x0000002000000000000000000000000000000000000000000000000000000000
                )
                mstore(
                    0x40,
                    0x0000000e556e646572666c6f77206572726f7200000000000000000000000000000
                )
                revert(0x00, 0x64)
            }
        }
    }

    /**
     * @dev Multiplicación optimizada usando YUL
     * @param a Factor 1
     * @param b Factor 2
     * @return result Resultado de la multiplicación
     */
    function safeMul(
        uint256 a,
        uint256 b
    ) public pure returns (uint256 result) {
        assembly {
            result := mul(a, b)
            // Verificar overflow solo si a != 0
            if iszero(iszero(a)) {
                if iszero(eq(div(result, a), b)) {
                    // Overflow detectado
                    mstore(
                        0x00,
                        0x08c379a000000000000000000000000000000000000000000000000000000000
                    )
                    mstore(
                        0x20,
                        0x0000002000000000000000000000000000000000000000000000000000000000
                    )
                    mstore(
                        0x40,
                        0x0000000d4f766572666c6f77206572726f72000000000000000000000000000000
                    )
                    revert(0x00, 0x64)
                }
            }
        }
    }

    /**
     * @dev División optimizada usando YUL
     * @param a Dividendo
     * @param b Divisor
     * @return result Resultado de la división
     */
    function safeDiv(
        uint256 a,
        uint256 b
    ) public pure returns (uint256 result) {
        assembly {
            // Verificar división por cero
            if iszero(b) {
                mstore(
                    0x00,
                    0x08c379a000000000000000000000000000000000000000000000000000000000
                )
                mstore(
                    0x20,
                    0x0000002000000000000000000000000000000000000000000000000000000000
                )
                mstore(
                    0x40,
                    0x0000001244697669736f722063616e6e6f74206265207a65726f000000000000
                )
                revert(0x00, 0x64)
            }
            result := div(a, b)
        }
    }

    /**
     * @dev Función de transferencia optimizada con YUL
     * @param to Dirección destino
     * @param amount Cantidad a transferir
     */
    function optimizedTransfer(address to, uint256 amount) external {
        assembly {
            // Obtener caller
            let sender := caller()

            // Verificar que to no sea address(0)
            if iszero(to) {
                mstore(
                    0x00,
                    0x08c379a000000000000000000000000000000000000000000000000000000000
                )
                mstore(
                    0x20,
                    0x0000002000000000000000000000000000000000000000000000000000000000
                )
                mstore(
                    0x40,
                    0x00000013496e76616c69642064657374696e6174696f6e0000000000000000000000
                )
                revert(0x00, 0x64)
            }

            // Calcular slot del balance del sender
            mstore(0x00, sender)
            mstore(0x20, balances.slot)
            let senderBalanceSlot := keccak256(0x00, 0x40)

            // Obtener balance del sender
            let senderBalance := sload(senderBalanceSlot)

            // Verificar balance suficiente
            if lt(senderBalance, amount) {
                mstore(
                    0x00,
                    0x08c379a000000000000000000000000000000000000000000000000000000000
                )
                mstore(
                    0x20,
                    0x0000002000000000000000000000000000000000000000000000000000000000
                )
                mstore(
                    0x40,
                    0x00000013496e73756666696369656e742062616c616e6365000000000000000000
                )
                revert(0x00, 0x64)
            }

            // Calcular nuevo balance del sender
            let newSenderBalance := sub(senderBalance, amount)
            sstore(senderBalanceSlot, newSenderBalance)

            // Calcular slot del balance del receptor
            mstore(0x00, to)
            mstore(0x20, balances.slot)
            let toBalanceSlot := keccak256(0x00, 0x40)

            // Obtener balance del receptor y sumar amount
            let toBalance := sload(toBalanceSlot)
            let newToBalance := add(toBalance, amount)

            // Verificar overflow
            if lt(newToBalance, toBalance) {
                mstore(
                    0x00,
                    0x08c379a000000000000000000000000000000000000000000000000000000000
                )
                mstore(
                    0x20,
                    0x0000002000000000000000000000000000000000000000000000000000000000
                )
                mstore(
                    0x40,
                    0x0000000d4f766572666c6f77206572726f72000000000000000000000000000000
                )
                revert(0x00, 0x64)
            }

            sstore(toBalanceSlot, newToBalance)

            // Emitir evento Transfer
            mstore(0x00, amount)
            log3(
                0x00,
                0x20,
                0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef,
                sender,
                to
            )
        }
    }

    /**
     * @dev Función para obtener balance optimizada con YUL
     * @param account Dirección a consultar
     * @return accountBalance Balance de la cuenta
     */
    function getBalance(
        address account
    ) external view returns (uint256 accountBalance) {
        assembly {
            // Calcular slot del balance
            mstore(0x00, account)
            mstore(0x20, balances.slot)
            let balanceSlot := keccak256(0x00, 0x40)

            // Obtener balance
            accountBalance := sload(balanceSlot)
        }
    }

    /**
     * @dev Función para establecer balance (solo owner) optimizada con YUL
     * @param account Dirección
     * @param amount Nueva cantidad
     */
    function setBalance(address account, uint256 amount) external onlyOwner {
        assembly {
            // Calcular slot del balance
            mstore(0x00, account)
            mstore(0x20, balances.slot)
            let balanceSlot := keccak256(0x00, 0x40)

            // Establecer nuevo balance
            sstore(balanceSlot, amount)
        }
    }

    /**
     * @dev Función de comparación optimizada
     * @param a Primer valor
     * @param b Segundo valor
     * @return isEqual True si son iguales
     * @return isGreater True si a > b
     * @return isLess True si a < b
     */
    function compare(
        uint256 a,
        uint256 b
    ) external pure returns (bool isEqual, bool isGreater, bool isLess) {
        assembly {
            isEqual := eq(a, b)
            isGreater := gt(a, b)
            isLess := lt(a, b)
        }
    }

    /**
     * @dev Función para calcular hash keccak256 optimizada
     * @param data Datos a hashear
     * @return hash Hash resultante
     */
    function calculateHash(
        bytes memory data
    ) external pure returns (bytes32 hash) {
        assembly {
            // data está en memoria, empezando en data + 0x20 (después del length)
            let dataPtr := add(data, 0x20)
            let dataLength := mload(data)
            hash := keccak256(dataPtr, dataLength)
        }
    }

    /**
     * @dev Función de potencia optimizada (a^b)
     * @param base Base
     * @param exponent Exponente
     * @return result Resultado de base^exponent
     */
    function power(
        uint256 base,
        uint256 exponent
    ) external pure returns (uint256 result) {
        assembly {
            result := 1
            for {
                let i := 0
            } lt(i, exponent) {
                i := add(i, 1)
            } {
                result := mul(result, base)
                // Verificar overflow
                if lt(result, base) {
                    mstore(
                        0x00,
                        0x08c379a000000000000000000000000000000000000000000000000000000000
                    )
                    mstore(
                        0x20,
                        0x0000002000000000000000000000000000000000000000000000000000000000
                    )
                    mstore(
                        0x40,
                        0x0000000d4f766572666c6f77206572726f72000000000000000000000000000000
                    )
                    revert(0x00, 0x64)
                }
            }
        }
    }

    /**
     * @dev Función para obtener información del bloque actual
     * @return blockNumber Número del bloque
     * @return blockTimestamp Timestamp del bloque
     * @return blockDifficulty Dificultad del bloque
     * @return blockGasLimit Límite de gas del bloque
     */
    function getBlockInfo()
        external
        view
        returns (
            uint256 blockNumber,
            uint256 blockTimestamp,
            uint256 blockDifficulty,
            uint256 blockGasLimit
        )
    {
        assembly {
            blockNumber := number()
            blockTimestamp := timestamp()
            blockDifficulty := prevrandao() // En Ethereum 2.0+ usa prevrandao en lugar de difficulty
            blockGasLimit := gaslimit()
        }
    }

    /**
     * @dev Función para copiar memoria de forma optimizada
     * @param source Datos fuente
     * @return copied Copia de los datos
     */
    function optimizedMemoryCopy(
        bytes memory source
    ) external pure returns (bytes memory copied) {
        assembly {
            // Obtener la longitud de los datos fuente
            let length := mload(source)

            // Reservar memoria para la copia
            copied := mload(0x40) // Free memory pointer
            mstore(copied, length) // Establecer la longitud

            // Actualizar free memory pointer
            let newFreePtr := add(copied, add(0x20, length))
            mstore(0x40, newFreePtr)

            // Copiar los datos
            let sourcePtr := add(source, 0x20)
            let destPtr := add(copied, 0x20)

            // Copiar en bloques de 32 bytes
            for {
                let i := 0
            } lt(i, length) {
                i := add(i, 0x20)
            } {
                mstore(add(destPtr, i), mload(add(sourcePtr, i)))
            }
        }
    }

    /**
     * @dev Función para verificar si una dirección es un contrato
     * @param account Dirección a verificar
     * @return contractCheck True si es un contrato
     */
    function isContract(
        address account
    ) external view returns (bool contractCheck) {
        assembly {
            contractCheck := gt(extcodesize(account), 0)
        }
    }

    /**
     * @dev Función para obtener el tamaño del código de un contrato
     * @param account Dirección del contrato
     * @return size Tamaño del código
     */
    function getCodeSize(address account) external view returns (uint256 size) {
        assembly {
            size := extcodesize(account)
        }
    }

    // ===== FUNCIONES SIN YUL PARA COMPARACIÓN =====

    /**
     * @dev Suma estándar sin YUL
     * @param a Primer número
     * @param b Segundo número
     * @return Resultado de la suma
     */
    function standardAdd(uint256 a, uint256 b) external pure returns (uint256) {
        require(a + b >= a, "Overflow error");
        return a + b;
    }

    /**
     * @dev Resta estándar sin YUL
     * @param a Minuendo
     * @param b Sustraendo
     * @return Resultado de la resta
     */
    function standardSub(uint256 a, uint256 b) external pure returns (uint256) {
        require(a >= b, "Underflow error");
        return a - b;
    }

    /**
     * @dev Multiplicación estándar sin YUL
     * @param a Factor 1
     * @param b Factor 2
     * @return Resultado de la multiplicación
     */
    function standardMul(uint256 a, uint256 b) external pure returns (uint256) {
        if (a == 0) return 0;
        uint256 result = a * b;
        require(result / a == b, "Overflow error");
        return result;
    }

    /**
     * @dev División estándar sin YUL
     * @param a Dividendo
     * @param b Divisor
     * @return Resultado de la división
     */
    function standardDiv(uint256 a, uint256 b) external pure returns (uint256) {
        require(b != 0, "Divisor cannot be zero");
        return a / b;
    }

    /**
     * @dev Transferencia estándar sin YUL
     * @param to Dirección destino
     * @param amount Cantidad a transferir
     */
    function standardTransfer(address to, uint256 amount) external {
        require(to != address(0), "Invalid destination");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        balances[to] += amount;

        emit Transfer(msg.sender, to, amount);
    }

    /**
     * @dev Obtener balance estándar sin YUL
     * @param account Dirección a consultar
     * @return Balance de la cuenta
     */
    function standardGetBalance(
        address account
    ) external view returns (uint256) {
        return balances[account];
    }

    /**
     * @dev Establecer balance estándar sin YUL (solo owner)
     * @param account Dirección
     * @param amount Nueva cantidad
     */
    function standardSetBalance(address account, uint256 amount) external {
        require(msg.sender == owner, "Only owner access");
        balances[account] = amount;
    }

    /**
     * @dev Comparación estándar sin YUL
     * @param a Primer valor
     * @param b Segundo valor
     * @return isEqual True si son iguales
     * @return isGreater True si a > b
     * @return isLess True si a < b
     */
    function standardCompare(
        uint256 a,
        uint256 b
    ) external pure returns (bool isEqual, bool isGreater, bool isLess) {
        isEqual = (a == b);
        isGreater = (a > b);
        isLess = (a < b);
    }

    /**
     * @dev Hash estándar sin YUL
     * @param data Datos a hashear
     * @return Hash resultante
     */
    function standardCalculateHash(
        bytes memory data
    ) external pure returns (bytes32) {
        return keccak256(data);
    }

    /**
     * @dev Potencia estándar sin YUL (a^b)
     * @param base Base
     * @param exponent Exponente
     * @return Resultado de base^exponent
     */
    function standardPower(
        uint256 base,
        uint256 exponent
    ) external pure returns (uint256) {
        uint256 result = 1;
        for (uint256 i = 0; i < exponent; i++) {
            uint256 newResult = result * base;
            require(newResult >= result, "Overflow error");
            result = newResult;
        }
        return result;
    }

    /**
     * @dev Verificar si es contrato estándar sin YUL
     * @param account Dirección a verificar
     * @return True si es un contrato
     */
    function standardIsContract(address account) external view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    /**
     * @dev Copia de memoria estándar sin YUL
     * @param source Datos fuente
     * @return Copia de los datos
     */
    function standardMemoryCopy(
        bytes memory source
    ) external pure returns (bytes memory) {
        bytes memory copied = new bytes(source.length);
        for (uint256 i = 0; i < source.length; i++) {
            copied[i] = source[i];
        }
        return copied;
    }
}
