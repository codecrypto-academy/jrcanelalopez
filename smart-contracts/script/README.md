# Deployment Guide - CodeCrypto DAO

Este directorio contiene los scripts de deployment para el DAO de CodeCrypto.

## 📋 Requisitos Previos

- Foundry instalado (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- Node.js v18+ (para el frontend)
- Cuenta con ETH para gas fees (mainnet/testnet)

## 🚀 Deployment Options

### 1. Local Deployment (Anvil)

Perfecto para desarrollo y testing local.

```bash
# Terminal 1: Iniciar Anvil
anvil

# Terminal 2: Deploy
forge script script/DeployDAOLocal.s.sol:DeployDAOLocal \
  --rpc-url http://localhost:8545 \
  --broadcast

# Las direcciones se guardarán en ./deployments/local.json
```

**Características:**

- ✅ 5 shareholders de prueba pre-configurados
- ✅ Timelock delay de 1 minuto (para testing rápido)
- ✅ Usa las cuentas por defecto de Anvil
- ✅ Listo para testing inmediato

### 2. Testnet Deployment (Sepolia)

Para testing en red pública antes de mainnet.

```bash
# 1. Configurar variables de entorno
export PRIVATE_KEY=tu_private_key_aqui
export SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
export ETHERSCAN_API_KEY=tu_etherscan_api_key

# 2. Deploy y verify
forge script script/DeployDAO.s.sol:DeployDAO \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Las direcciones se guardarán en ./deployments/addresses.json
```

**Nota:** Asegúrate de tener Sepolia ETH en tu wallet. Puedes obtenerlo en:

- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### 3. Mainnet Deployment

⚠️ **IMPORTANTE:** Revisar y auditar todo antes de desplegar en mainnet.

```bash
# 1. Configurar variables de entorno
export PRIVATE_KEY=tu_private_key_aqui
export MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
export ETHERSCAN_API_KEY=tu_etherscan_api_key

# 2. Dry run (simulación sin broadcast)
forge script script/DeployDAO.s.sol:DeployDAO \
  --rpc-url $MAINNET_RPC_URL

# 3. Si todo se ve bien, deploy real
forge script script/DeployDAO.s.sol:DeployDAO \
  --rpc-url $MAINNET_RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Las direcciones se guardarán en ./deployments/addresses.json
```

## 📝 Configuración de Shareholders Iniciales

Si quieres agregar shareholders iniciales durante el deployment, edita `DeployDAO.s.sol`:

```solidity
function setUp() public {
    // Agregar shareholders iniciales
    initialShareholders.push(0xYourAddress1);
    initialShares.push(100_000 * 10**18); // 100k tokens

    initialShareholders.push(0xYourAddress2);
    initialShares.push(200_000 * 10**18); // 200k tokens
}
```

## 🔒 Seguridad

### Variables de Entorno

**NUNCA** commitees tu private key. Usa un archivo `.env`:

```bash
# .env (agregado a .gitignore)
PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://...
MAINNET_RPC_URL=https://...
ETHERSCAN_API_KEY=...
```

Luego carga las variables:

```bash
source .env
```

### Verificación de Contratos

Los scripts automáticamente verifican los contratos en Etherscan si usas el flag `--verify`.

Verificación manual:

```bash
forge verify-contract \
  --chain-id 11155111 \
  --num-of-optimizations 200 \
  --constructor-args $(cast abi-encode "constructor(address)" "0xTokenAddress") \
  0xYourContractAddress \
  src/YourContract.sol:YourContract \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

## 📊 Estructura de Deployment

El script despliega los contratos en este orden:

1. **DAOToken** - Token ERC20Votes para gobernanza
2. **TimelockController** - Delay de 2 días para ejecución
3. **CodeCryptoDAOGovernor** - Contrato principal de gobernanza
4. **ProposalImplementation** - Template para propuestas
5. **ProposalFactory** - Factory para crear propuestas
6. **Configuración de roles** - Permisos del Timelock
7. **(Opcional) Shareholders iniciales** - Si están configurados
8. **Transfer de ownership** - Token → Timelock

## 🎯 Post-Deployment

Después del deployment:

### 1. Verificar Deployment

```bash
# Ver saldo del token
cast call <TOKEN_ADDRESS> "totalSupply()(uint256)"

# Ver owner del token
cast call <TOKEN_ADDRESS> "owner()(address)"

# Ver configuración del Governor
cast call <GOVERNOR_ADDRESS> "votingDelay()(uint256)"
cast call <GOVERNOR_ADDRESS> "votingPeriod()(uint256)"
cast call <GOVERNOR_ADDRESS> "proposalThreshold()(uint256)"
```

### 2. Crear Shareholders (si no se hizo en deployment)

```bash
# Como owner del token (antes de transferir al Timelock)
cast send <TOKEN_ADDRESS> \
  "createShareholder(address,uint256)" \
  <SHAREHOLDER_ADDRESS> \
  100000000000000000000000 \
  --private-key $PRIVATE_KEY
```

### 3. Delegar Votos

Los shareholders DEBEN delegar sus votos para que cuenten:

```bash
cast send <TOKEN_ADDRESS> \
  "delegate(address)" \
  <YOUR_ADDRESS> \
  --private-key $PRIVATE_KEY
```

### 4. Crear Primera Propuesta

```bash
# Ejemplo: transferir 1 ETH
cast send <GOVERNOR_ADDRESS> \
  "proposeTransfer(address,uint256,string)" \
  <RECIPIENT> \
  1000000000000000000 \
  "Transfer 1 ETH to recipient" \
  --private-key $PRIVATE_KEY
```

## 🧪 Testing del Deployment

Después de deployar localmente, puedes ejecutar tests de integración:

```bash
# Test completo del deployment
forge test --match-contract Integration -vvv

# Test de un flujo específico
forge test --match-test testFullGovernanceFlow -vvvv
```

## 📁 Archivos Generados

Después del deployment se generan:

- `deployments/addresses.json` - Direcciones de los contratos
- `deployments/local.json` - Direcciones + shareholders (solo local)
- `broadcast/` - Logs de transacciones de Foundry

## 🔧 Troubleshooting

### Error: "Insufficient funds"

- Asegúrate de tener ETH en tu wallet
- Verifica el gas price y límite

### Error: "Nonce too low"

- Resetea el nonce: `cast nonce <YOUR_ADDRESS> --rpc-url <RPC_URL>`

### Error: "Contract verification failed"

- Verifica manualmente con los comandos anteriores
- Asegúrate de usar el mismo compilador y optimización

### Deployment muy lento

- Aumenta el gas price: `--gas-price 50000000000` (50 gwei)
- Usa un RPC más rápido

## 📚 Recursos

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Governor](https://docs.openzeppelin.com/contracts/4.x/governance)
- [Etherscan API](https://docs.etherscan.io/)

## ⚠️ Checklist Pre-Mainnet

Antes de desplegar en mainnet:

- [ ] Auditoría de seguridad completa
- [ ] Tests de integración pasados
- [ ] Verificación de parámetros de gobernanza
- [ ] Backup de private keys
- [ ] Configuración de shareholders inicial verificada
- [ ] Simulación de deployment en fork de mainnet
- [ ] Plan de respuesta a incidentes
- [ ] Documentación completa para la comunidad
