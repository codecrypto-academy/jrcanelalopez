# Supply Chain Tracking - Proyecto Completo

Sistema de trazabilidad de cadena de suministro usando blockchain, microservicios y eventos.

## 📁 Estructura del Proyecto

```
web3-tracking-chain/
├── smart-contracts/        # Contratos inteligentes (Foundry + ERC-721)
├── backend/               # 7 Microservicios Node.js
├── off-chain-monitor/     # Monitor que lee blockchain → Kafka
├── frontend/              # React + TypeScript (consulta y visualización)
└── kafka/                 # Bus de eventos (Docker Compose)
```

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│         FRONTEND (React + TypeScript + ethers.js)          │
│  - Login por rol                                           │
│  - Historial completo de productos                        │
│  - Gráficos de trazabilidad                               │
│  - Modo solo lectura                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                BLOCKCHAIN (Anvil - Foundry)                 │
│  Smart Contract: SupplyChainTracking.sol (ERC-721)        │
│  - 7 tipos de tokens (COSECHA → VENTA)                    │
│  - 7 roles (AGRICULTOR → VENDEDOR)                        │
│  - Relación hijo→padres (gas optimizado)                  │
│  - Eventos: TokenCreated, TokenTransferred                 │
└─────────────────────────────────────────────────────────────┘
         ↑                                           ↓
    (escribe)                               (lee cada 1s)
         |                                           |
┌────────────────────┐                   ┌─────────────────────┐
│ BACKEND SERVICES   │                   │ OFF-CHAIN MONITOR   │
│ (7 microservicios) │                   │  - Lee blockchain   │
│ Node.js + Express  │                   │  - Detecta tokens   │
│ DB en memoria      │                   │  - Escribe Kafka    │
│ Puerto configurable│←─────────Kafka────│  - Reglas negocio:  │
│                    │                   │    2 tokens padre   │
│ 1. Cosecha         │                   │    → 1 token hijo   │
│ 2. Almacenamiento  │                   └─────────────────────┘
│ 3. Molienda        │
│ 4. Horneado        │
│ 5. Embalaje        │
│ 6. Distribución    │
│ 7. Venta           │
└────────────────────┘
         ↑
         │ (consume eventos)
         │
┌────────────────────┐
│   KAFKA (Docker)   │
│  Topics:           │
│  - cosecha-event   │
│  - almacen-event   │
│  - molienda-event  │
│  - horneado-event  │
│  - embalaje-event  │
│  - dist-event      │
│  - venta-event     │
└────────────────────┘
```

## 🚀 Setup Completo

### 1. Blockchain (Anvil)

```bash
# Terminal 1: Arrancar Anvil
anvil
```

### 2. Smart Contracts

```bash
cd smart-contracts

# Instalar dependencias
forge install OpenZeppelin/openzeppelin-contracts

# Compilar
forge build

# Tests
forge test -vvv

# Deploy
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
forge script script/DeploySupplyChain.s.sol:DeploySupplyChain \
  --rpc-url http://localhost:8545 \
  --broadcast
```

### 3. Kafka (Docker)

```bash
# Terminal 2
cd kafka
docker-compose up
```

### 4. Off-Chain Monitor

```bash
# Terminal 3
cd off-chain-monitor
npm install
npm start
```

### 5. Backend Services

```bash
# Terminal 4-10 (7 servicios)
cd backend

# Servicio Cosecha (puerto 3001)
PORT=3001 SERVICE=COSECHA npm start

# Servicio Almacén (puerto 3002)
PORT=3002 SERVICE=ALMACEN npm start

# ... y así con los demás
```

### 6. Frontend

```bash
# Terminal 11
cd frontend/react-ts
npm install
npm run dev
```

## 📊 Flujo de Datos

1. **Generación automática**: Servicio COSECHA genera 1 token/segundo
2. **Monitor detecta**: Off-chain lee eventos `TokenCreated`
3. **Regla de negocio**: Cuando hay 2 tokens COSECHA → produce `cosecha-event`
4. **Kafka entrega**: El evento llega al servicio ALMACÉN
5. **Creación**: Servicio ALMACÉN crea token con 2 padres COSECHA
6. **Repetir**: El ciclo continúa hasta VENTA

## 🔑 Cuentas de Anvil

| Rol            | Address                                      | Private Key    |
| -------------- | -------------------------------------------- | -------------- |
| Owner/Deployer | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974...`  |
| AGRICULTOR     | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995...` |
| ALMACENADOR    | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111...` |
| MOLINERO       | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c85211...` |
| HORNEADOR      | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `0x47e179e...` |
| EMBALADOR      | `0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc` | `0x8b3a350...` |
| DISTRIBUIDOR   | `0x976EA74026E726554dB657fA54763abd0C3a0aa9` | `0x92db14e...` |
| VENDEDOR       | `0x14dC79964da2C08b23698B3D3cc7Ca32193d9955` | `0x4bbbf85...` |

## 🔍 Verificación

```bash
# Ver eventos en tiempo real
cast logs --address <CONTRACT_ADDRESS> --rpc-url http://localhost:8545

# Ver token específico
cast call <CONTRACT_ADDRESS> "getTokenMetadata(uint256)" <TOKEN_ID> \
  --rpc-url http://localhost:8545

# Ver genealogía
cast call <CONTRACT_ADDRESS> "getAncestry(uint256)" <TOKEN_ID> \
  --rpc-url http://localhost:8545
```

## 📝 Variables de Entorno

### Smart Contracts

```bash
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RPC_URL=http://localhost:8545
```

### Backend Services

```bash
PORT=3001                    # Puerto del servicio
SERVICE=COSECHA              # Tipo de servicio
PRIVATE_KEY=0x...            # Clave del rol correspondiente
CONTRACT_ADDRESS=0x...       # Dirección del contrato
KAFKA_BROKER=localhost:9092
```

### Off-Chain Monitor

```bash
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x...
KAFKA_BROKER=localhost:9092
POLL_INTERVAL=1000          # 1 segundo
```

### Frontend

```bash
VITE_RPC_URL=http://localhost:8545
VITE_CONTRACT_ADDRESS=0x...
```

## 🧪 Testing End-to-End

1. Arrancar Anvil y desplegar contrato
2. Arrancar Kafka
3. Arrancar Off-Chain Monitor
4. Arrancar servicio COSECHA (auto-genera tokens)
5. Ver logs del monitor (detecta 2 tokens)
6. Arrancar servicio ALMACÉN
7. Ver que se crea token ALMACÉN
8. Repetir con siguiente nivel...

## 📦 Tecnologías

- **Blockchain**: Solidity 0.8.20, Foundry, Anvil, OpenZeppelin
- **Backend**: Node.js, Express, ethers.js v6
- **Event Bus**: Apache Kafka (Docker)
- **Testing**: Forge (Foundry), Jest (Backend)

---

**Nota**: Este proyecto está en desarrollo activo. Cada componente tiene su propio README con instrucciones detalladas
