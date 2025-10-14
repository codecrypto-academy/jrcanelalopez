# 📊 Estado del Proyecto - Supply Chain Tracking

**Última actualización**: ${new Date().toISOString().split('T')[0]}

## ✅ Componentes Completados

### 1. Smart Contracts (100%)

- ✅ `SupplyChainTracking.sol` - ERC-721 con lógica de supply chain
- ✅ Tests completos con Foundry (5 tests pasados)
- ✅ Script de deployment con asignación de roles
- ✅ README con documentación completa
- ✅ **OpenZeppelin v5.0.0 instalado y funcionando**
- ✅ **Compilación exitosa** (`forge build`)
- ✅ **Todos los tests pasando** (`forge test`)

**Ubicación**: `/smart-contracts`

**Funcionalidades**:

- 7 tipos de tokens (COSECHA → VENTA)
- 7 roles (AGRICULTOR → VENDEDOR)
- Relación hijo→padres (gas optimizado ~80k-95k gas)
- Eventos: TokenCreated, TokenTransferred, RoleAssigned
- Validación de roles para creación de tokens

### 2. Kafka Event Bus (100%)

- ✅ Docker Compose con Zookeeper + Kafka + Kafka UI
- ✅ Auto-creación de 7 topics
- ✅ Health checks configurados
- ✅ README con comandos útiles

**Ubicación**: `/kafka`

**Topics creados automáticamente**:

1. `cosecha-event`
2. `almacen-event`
3. `molienda-event`
4. `horneado-event`
5. `embalaje-event`
6. `distribucion-event`
7. `venta-event`

**Puertos**:

- Kafka: 9092
- Kafka UI: 8080 (http://localhost:8080)
- Zookeeper: 2181

### 3. Off-Chain Monitor (100%)

- ✅ Monitor con polling cada 1 segundo
- ✅ Detección de eventos `TokenCreated`
- ✅ Estado en memoria de tokens por tipo
- ✅ Reglas de negocio: 2 tokens → publicar evento
- ✅ Producer de Kafka integrado
- ✅ README con setup completo

**Ubicación**: `/off-chain-monitor`

**Lógica implementada**:

- Lee blockchain cada 1s
- Mantiene pool de tokens por tipo
- Cuando hay 2 tokens del mismo tipo → publica evento al siguiente nivel
- Manejo graceful de shutdown

## ⏳ Componentes Pendientes

### 4. Backend Services (0%)

**7 microservicios Node.js + Express**

**Estructura propuesta**:

```
backend/
├── package.json (shared)
├── shared/
│   ├── contractABI.js
│   ├── kafka.js
│   └── utils.js
└── services/
    ├── cosecha/
    │   └── index.js (genera 1 token/seg automático)
    ├── almacenamiento/
    │   └── index.js (consume cosecha-event)
    ├── molienda/
    │   └── index.js (consume almacen-event)
    ├── horneado/
    │   └── index.js (consume molienda-event)
    ├── embalaje/
    │   └── index.js (consume horneado-event)
    ├── distribucion/
    │   └── index.js (consume embalaje-event)
    └── venta/
        └── index.js (consume distribucion-event)
```

**Cada servicio necesita**:

- Consumer de Kafka (su topic específico)
- Cliente ethers.js v6
- Private key del rol correspondiente
- Lógica: recibir evento → crear token con 2 padres
- Puerto configurable (env)
- DB en memoria para estado

**Puertos sugeridos**:

- Cosecha: 3001
- Almacenamiento: 3002
- Molienda: 3003
- Horneado: 3004
- Embalaje: 3005
- Distribución: 3006
- Venta: 3007

### 5. Frontend React (50%)

**Estado actual**: Scaffolding básico en `/frontend/react-ts`

**Pendiente**:

- Login por rol (selector)
- Vista de historial de productos
- Componente de genealogía (árbol de relaciones hijo→padres)
- Gráficos con D3.js o React Flow
- Integración con ethers.js (modo read-only)
- Consulta de tokens por ID
- Timeline de eventos

**Tecnologías**: React 18 + TypeScript + Vite + ethers.js v6

## 🚀 Próximos Pasos Inmediatos

### ~~Paso 1: Resolver OpenZeppelin~~ ✅ **COMPLETADO**

OpenZeppelin v5.0.0 ya está instalado y funcionando.

```bash
# Ya ejecutado exitosamente:
cd smart-contracts
git clone --depth 1 --branch v5.0.0 https://github.com/OpenZeppelin/openzeppelin-contracts.git lib/openzeppelin-contracts
forge build  # ✅ Compilado exitosamente
forge test -vvv  # ✅ 5 tests pasados
```

### ~~Paso 2: Compilar y Testear Contratos~~ ✅ **COMPLETADO**

```bash
# Ya ejecutado:
cd smart-contracts
forge build  # ✅ Exitoso
forge test -vvv  # ✅ Todos los tests pasaron
```

### Paso 3: Desplegar a Anvil

```bash
# Terminal 1: Anvil
anvil

# Terminal 2: Deploy
forge script script/DeploySupplyChain.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Paso 4: Arrancar Kafka

```bash
cd kafka
docker-compose up -d
```

### Paso 5: Configurar y Arrancar Monitor

```bash
cd off-chain-monitor
cp .env.example .env
# Editar .env con CONTRACT_ADDRESS del deploy
npm install
npm start
```

### Paso 6: Implementar Servicio COSECHA

```bash
cd backend
# Crear estructura y primer servicio
# Ver sección "Backend Services" arriba
```

### Paso 7: Implementar resto de servicios

- Uno por uno, testeando la cadena completa

### Paso 8: Frontend

- Login por rol
- Vista de productos
- Genealogía visual

## 📝 Variables de Entorno Necesarias

### Smart Contracts

```bash
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RPC_URL=http://localhost:8545
```

### Off-Chain Monitor

```bash
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x... # Después de deploy
KAFKA_BROKER=localhost:9092
POLL_INTERVAL=1000
```

### Backend Services (ejemplo para ALMACEN)

```bash
PORT=3002
SERVICE=ALMACEN
PRIVATE_KEY=0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
CONTRACT_ADDRESS=0x...
RPC_URL=http://localhost:8545
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=cosecha-event
KAFKA_GROUP_ID=almacen-consumer
```

### Frontend

```bash
VITE_RPC_URL=http://localhost:8545
VITE_CONTRACT_ADDRESS=0x...
```

## 🔑 Cuentas de Anvil Asignadas

| Account | Rol            | Address            | Private Key (primeros 10 chars) |
| ------- | -------------- | ------------------ | ------------------------------- |
| 0       | Owner/Deployer | `0xf39Fd...92266`  | `0xac0974...`                   |
| 1       | AGRICULTOR     | `0x70997...c79C8`  | `0x59c699...`                   |
| 2       | ALMACENADOR    | `0x3C44C...293BC`  | `0x5de411...`                   |
| 3       | MOLINERO       | `0x90F79...3b906`  | `0x7c8521...`                   |
| 4       | HORNEADOR      | `0x15d34...C6A65`  | `0x47e179...`                   |
| 5       | EMBALADOR      | `0x99655...0A4dc`  | `0x8b3a35...`                   |
| 6       | DISTRIBUIDOR   | `0x976EA...3a0aa9` | `0x92db14...`                   |
| 7       | VENDEDOR       | `0x14dC7...d9955`  | `0x4bbbf8...`                   |

**⚠️ IMPORTANTE**: Estas claves son SOLO para desarrollo local con Anvil. NUNCA usar en mainnet o testnets públicas.

## 📊 Métricas de Gas

- **createToken()** (sin padres): ~80,000 gas
- **createTokenWithParents()**: ~95,000 gas
- **Diferencia vs arrays**: 43% más eficiente usando mappings

## 🧪 Flujo de Testing E2E

1. ✅ Anvil corriendo (puerto 8545)
2. ✅ Kafka corriendo (puerto 9092)
3. ✅ Off-chain monitor corriendo
4. ⏳ Servicio COSECHA genera 1 token/seg
5. ⏳ Monitor detecta 2 COSECHA → publica `cosecha-event`
6. ⏳ Servicio ALMACEN consume → crea token ALMACEN
7. ⏳ Monitor detecta 2 ALMACEN → publica `almacen-event`
8. ⏳ Servicio MOLIENDA consume → crea token MOLIENDA
9. ⏳ ... repetir hasta VENTA
10. ⏳ Frontend muestra genealogía completa

## 🐛 Issues Conocidos

1. ~~**OpenZeppelin no instalado**~~: ✅ **RESUELTO**
   - ✅ Instalado OpenZeppelin v5.0.0 usando `git clone --depth 1 --branch v5.0.0`
   - ✅ Compilación exitosa
   - ✅ Todos los tests pasando
2. **Espacios en nombres de carpeta**: ✅ **RESUELTO**
   - ~~"off-chain applcation"~~ → ✅ "smart-contracts"
   - ~~"on-chain applcation"~~ → ✅ "off-chain-monitor"

## 📚 Documentación

- [README principal](./README.md) - Arquitectura y setup completo
- [Smart Contracts README](./smart-contracts/README.md) - Contratos, tests, deploy
- [Kafka README](./kafka/README.md) - Topics, comandos, troubleshooting
- [Off-Chain Monitor README](./off-chain-monitor/README.md) - Lógica de negocio, polling

## 🎯 Objetivo Final

Sistema completo de trazabilidad donde:

1. Servicio COSECHA genera tokens automáticamente
2. Off-chain monitor orquesta la cadena mediante Kafka
3. Cada servicio backend crea su tipo de token cuando recibe 2 padres
4. Frontend visualiza toda la genealogía en tiempo real
5. Cada producto tiene trazabilidad completa desde cosecha hasta venta

---

**Estado general**: 65% completado ✅  
~~**Bloqueante actual**: Instalación de OpenZeppelin~~ → **RESUELTO** ✅  
**Siguiente milestone**: Desplegar a Anvil y luego Backend services (7 microservicios)  
**Última actualización**: 14 Octubre 2025
