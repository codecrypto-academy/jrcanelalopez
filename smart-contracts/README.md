# Supply Chain Tracking - Smart Contracts

Smart contracts para tracking de cadena de suministro con ERC-721.

## 🏗️ Arquitectura

- **ERC-721**: Cada token es un NFT único que representa un lote en la cadena
- **Relación hijo→padres**: Cada token guarda sus 2 tokens padre (gas optimizado)
- **7 Tipos de tokens**: COSECHA → ALMACEN → MOLIENDA → HORNEADO → EMBALAJE → DISTRIBUCION → VENTA
- **7 Roles**: AGRICULTOR, ALMACENADOR, MOLINERO, HORNEADOR, EMBALADOR, DISTRIBUIDOR, VENDEDOR

## 📦 Instalación

```bash
# Instalar dependencias de OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts
```

## 🧪 Testing

```bash
# Ejecutar tests
forge test

# Con verbosidad
forge test -vvv

# Test específico
forge test --match-test testCreateCosechaToken
```

## 🚀 Deployment en Anvil

### 1. Arrancar Anvil

```bash
anvil
```

### 2. Deploy del contrato

```bash
# Configurar private key (Anvil account 0)
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Deploy
forge script script/DeploySupplyChain.s.sol:DeploySupplyChain --rpc-url http://localhost:8545 --broadcast
```

### 3. Verificar deployment

El contrato quedará desplegado con:
- **Owner**: Account 0 (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
- **Roles asignados** a las cuentas de Anvil 1-7

## 📝 Cuentas de Anvil

| Account | Address | Role | Private Key |
|---------|---------|------|-------------|
| 0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | Owner/Deployer | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | AGRICULTOR | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| 2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | ALMACENADOR | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |
| 3 | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | MOLINERO | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` |
| 4 | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | HORNEADOR | `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a` |
| 5 | `0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc` | EMBALADOR | `0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba` |
| 6 | `0x976EA74026E726554dB657fA54763abd0C3a0aa9` | DISTRIBUIDOR | `0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e` |
| 7 | `0x14dC79964da2C08b23698B3D3cc7Ca32193d9955` | VENDEDOR | `0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356` |

## 🔍 Interactuar con el contrato

```bash
# Obtener dirección del contrato desplegado
CONTRACT_ADDRESS=$(cat broadcast/DeploySupplyChain.s.sol/31337/run-latest.json | jq -r '.transactions[0].contractAddress')

# Ver total supply
cast call $CONTRACT_ADDRESS "totalSupply()" --rpc-url http://localhost:8545

# Crear token COSECHA (desde account 1 - AGRICULTOR)
cast send $CONTRACT_ADDRESS "createToken()" \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://localhost:8545

# Ver metadata de token
cast call $CONTRACT_ADDRESS "getTokenMetadata(uint256)" 1 --rpc-url http://localhost:8545
```

## 📊 Eventos

El contrato emite 3 tipos de eventos:

### TokenCreated
```solidity
event TokenCreated(
    uint256 indexed tokenId,
    TokenType indexed tokenType,
    address indexed producer,
    uint256 parent1,
    uint256 parent2,
    uint256 timestamp
);
```

### TokenTransferred
```solidity
event TokenTransferred(
    uint256 indexed tokenId,
    address indexed from,
    address indexed to,
    uint256 timestamp
);
```

### RoleAssigned
```solidity
event RoleAssigned(
    address indexed account,
    Role indexed role,
    uint256 timestamp
);
```

## ⛽ Gas Optimization

- **createToken()**: ~80,000 gas
- **createTokenWithParents()**: ~95,000 gas
- **transferFrom()**: ~50,000 gas
- **Eventos**: ~3,000-5,000 gas adicional

**Total para crear token con padres + eventos**: ~100,000 gas (~$0.30 a 30 gwei)

## 🔐 Seguridad

- ✅ Solo el owner puede asignar roles
- ✅ Solo el rol correcto puede crear cada tipo de token
- ✅ Validación de existencia de tokens padre
- ✅ Los padres deben ser del mismo tipo
- ✅ OpenZeppelin contracts (audited)

## 📖 API Reference

### Funciones principales

#### `createToken() → uint256`
Crea token COSECHA (sin padres). Solo AGRICULTOR.

#### `createTokenWithParents(uint256 parent1, uint256 parent2) → uint256`
Crea token con 2 padres. Valida rol y tipo de padres.

#### `getTokenMetadata(uint256 tokenId) → (TokenType, address, uint256, uint256, uint256, address)`
Obtiene metadata completa de un token.

#### `getAncestry(uint256 tokenId) → uint256[]`
Obtiene array de todos los ancestros (recursivo).

#### `assignRole(address account, Role role)`
Asigna rol a una cuenta (solo owner).

## 📁 Estructura de archivos

```
off-chain application/
├── src/
│   └── SupplyChainTracking.sol  # Smart contract principal
├── script/
│   └── DeploySupplyChain.s.sol  # Script de deployment
├── test/
│   └── SupplyChainTracking.t.sol # Tests
└── foundry.toml                  # Configuración Foundry
```
