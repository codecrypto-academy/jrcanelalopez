# CLAUDE.md - Besu Network Manager

**Autor:** Javier Ruiz-Canela López
**Email:** jrcanelalopez@gmail.com
**Fecha:** 28 de Junio, 2025

_Este proyecto fue desarrollado con la asistencia de GitHub Copilot._

---

## Resumen del Proyecto

**Besu Network Manager** es un proyecto monorepo para gestionar redes privadas de **Hyperledger Besu** (blockchain Ethereum) de forma programática y visual. Incluye una librería TypeScript robusta, scripts shell para deployment rápido, y una aplicación web Next.js moderna con REST API completa.

### Objetivo

Facilitar la creación, configuración y gestión de redes blockchain privadas Besu con soporte para:
- Múltiples mecanismos de consenso (Clique, IBFT2, QBFT)
- Gestión dinámica de nodos
- Configuración flexible de topologías de red
- Validaciones robustas de seguridad
- Interface web intuitiva

## Estructura del Proyecto

```
web2.5-besu-2025/
├── lib/                    # 📚 Librería TypeScript para gestión programática
│   ├── src/
│   │   ├── create-besu-networks.ts     # API principal
│   │   ├── update-besu-networks.ts     # Actualización de redes
│   │   └── utils/                      # Utilidades y validaciones
│   ├── _test_/                         # Tests con Jest
│   ├── examples/                       # Ejemplos de uso
│   └── package.json
│
├── app/                    # 🎨 Aplicación Next.js
│   ├── src/
│   │   ├── app/                        # Next.js App Router
│   │   │   ├── api/networks/          # REST API
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/                 # Componentes React
│   │   ├── lib/                        # Servicios
│   │   └── types/                      # Tipos TypeScript
│   └── package.json
│
├── script/                 # 🚀 Scripts Shell
│   ├── besu.sh                        # Script de deployment
│   └── node_modules/
│
├── .claude/                # 🤖 Configuración Claude Code
│   ├── agents/                        # Agentes especializados
│   ├── commands/                      # Comandos personalizados
│   └── hooks/                         # Hooks de automatización
│
├── CLAUDE.md              # 📖 Este archivo
├── AGENTS.md              # 🤖 Guía de agentes
└── README.md              # 📝 Documentación principal
```

## Stack Tecnológico

### Librería TypeScript (`lib/`)
- **TypeScript** 5.0+ (strict mode)
- **Docker SDK** para gestión de contenedores
- **ethers.js** 6.0+ para operaciones blockchain
- **Jest** para testing unitario e integración
- **Hyperledger Besu** como cliente blockchain

### Aplicación Web (`app/`)
- **Next.js 14** con App Router
- **TypeScript** (strict mode)
- **Tailwind CSS** para diseño responsive
- **React Hook Form** + **Zod** para validación de formularios
- **Heroicons** para iconografía
- REST API con Next.js API Routes

### Scripts Shell (`script/`)
- **Bash** shell scripting
- **Node.js** para generación de claves criptográficas
- **Docker** y **Docker Compose** para orquestación

## Conceptos Clave del Dominio

### 1. Asociación Miners-SignerAccounts ⚠️ CRÍTICO

**Regla fundamental**: En consenso Clique/PoA, cada nodo miner DEBE tener exactamente un signerAccount asociado.

```typescript
// ✅ Configuración CORRECTA
const config: BesuNetworkConfig = {
  signerAccounts: [
    {
      address: '0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9',
      weiAmount: '100000000000000000000000'
    }
  ],
  nodes: [
    {
      name: 'miner1',
      type: 'miner',
      signerAddress: '0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9' // Asociación explícita
    }
  ]
}

// ❌ INCORRECTO - Falta signerAddress
nodes: [
  { name: 'miner1', type: 'miner' } // Error!
]
```

### 2. Tipos de Nodos

| Tipo | Propósito | Requiere SignerAccount |
|------|-----------|------------------------|
| **bootnode** | Descubrimiento y bootstrap de red | No |
| **miner** | Generación de bloques (Clique) | Sí |
| **rpc** | Endpoint JSON-RPC para aplicaciones | No |
| **node** | Observador/Validator (IBFT2/QBFT) | Depende del consenso |

### 3. Mecanismos de Consenso

- **Clique**: Proof of Authority - Desarrollo/Testing
  - Mínimo: 1 bootnode + 1 miner
  - Requiere signerAccounts para miners

- **IBFT2**: Istanbul Byzantine Fault Tolerant - Producción
  - Mínimo: 1 bootnode + 4 validadores

- **QBFT**: Quorum Byzantine Fault Tolerant - Enterprise
  - Similar a IBFT2 con mejoras

### 4. Validaciones Robustas

El proyecto implementa validaciones estrictas que **NO deben omitirse**:

#### Puertos
```typescript
// ✅ VÁLIDO - Puertos no consecutivos para miners
{ name: 'miner1', rpcPort: 8546, type: 'miner' }
{ name: 'miner2', rpcPort: 8550, type: 'miner' } // +4, no consecutivo

// ❌ INVÁLIDO - Puertos consecutivos
{ name: 'miner1', rpcPort: 8546, type: 'miner' }
{ name: 'miner2', rpcPort: 8547, type: 'miner' } // Error!
```

#### IPs
```typescript
// Subnet: 172.30.0.0/16
// ✅ VÁLIDAS: 172.30.0.20, 172.30.1.100, 172.30.255.254
// ❌ INVÁLIDAS:
//    - 172.30.0.0 (dirección de red)
//    - 172.30.255.255 (broadcast)
//    - 172.30.0.1 (gateway típico)
//    - 192.168.1.1 (fuera de subnet)
```

## Comandos Disponibles

### Librería (`lib/`)

```bash
# Instalación
npm install

# Tests (IMPORTANTE: Solo individuales)
npm test _test_/besu.test.ts
npm test -- --testNamePattern="Basic Network Creation"

# Ejemplos
npm run example:simple
npm run example:advanced

# Limpieza
npm run cleanup-networks
```

### Aplicación (`app/`)

```bash
# Instalación
npm install

# Desarrollo
npm run dev              # http://localhost:3000

# Build y producción
npm run build
npm run start

# Validación
npm run lint
npm run type-check
```

### Scripts (`script/`)

```bash
# Desplegar red completa
chmod +x besu.sh
./besu.sh

# Verificar conectividad
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  -H "Content-Type: application/json" http://localhost:8888

# Limpiar recursos
docker rm -f $(docker ps -aq --filter "label=network=besu-network")
docker network rm besu-network
```

## Reglas para Agentes IA

### 1. Testing SIEMPRE Individual ⚠️

**NUNCA ejecutar tests en paralelo**. Los tests crean redes Docker reales con recursos exclusivos.

```bash
# ❌ PROHIBIDO
npm test

# ✅ CORRECTO
npm test _test_/besu.test.ts
npm test -- --testNamePattern="specific test name"
```

**Razón**: Conflictos de puertos, subnets y contenedores Docker.

### 2. Respetar Validaciones

**NO** comentar, omitir o modificar las validaciones del código. Son críticas para:
- Prevenir conflictos de red Docker
- Asegurar topología válida de blockchain
- Evitar errores en runtime

### 3. Genesis Inmutable

El archivo `genesis.json` es **inmutable** después de creación:

```typescript
// ✅ PERMITIDO - Actualizar configuración de red
await updateNetworkConfig(network, {
  subnet: '172.60.0.0/16',
  gasLimit: '0x5F5E100',
  blockTime: 15
});

// ✅ PERMITIDO - Actualizar cuentas
await network.updateNetworkAccounts({
  signerAccount: { address: '0x...', weiAmount: '...' }
});

// ❌ PROHIBIDO - Modificar genesis directamente
// Requiere crear nueva red
```

### 4. Gestión de Docker

```typescript
// Verificar Docker ejecutándose
const isRunning = await checkDockerRunning();

// Auto-resolución de conflictos (RECOMENDADO)
await network.create({
  nodes: [...],
  autoResolveSubnetConflicts: true
});
```

### 5. Nomenclatura y Estilo

- **Nombres de nodos**: lowercase, guiones, descriptivos
  - ✅ `bootnode1`, `miner-primary`, `rpc-node`
  - ❌ `Node1`, `MINER`, `rpc_node`

- **IPs**: Dentro de subnet, secuenciales cuando posible
  - ✅ `172.30.0.20`, `172.30.0.21`, `172.30.0.22`
  - ❌ `172.30.0.20`, `172.30.5.100`, `172.30.0.22`

- **Puertos RPC**: Rango 8545-9999
  - ✅ `8545`, `8546`, `8548`, `8550` (espaciados)
  - ❌ `8000`, `3000`, `80`

## Patrones de Código Comunes

### 1. Crear Red Básica

```typescript
import { BesuNetwork, BesuNetworkConfig } from './src/create-besu-networks';

const config: BesuNetworkConfig = {
  name: 'my-besu-network',
  chainId: 1337,
  subnet: '172.30.0.0/16',
  consensus: 'clique',
  gasLimit: '0x47E7C4',
  blockTime: 5,
  signerAccounts: [
    {
      address: '0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9',
      weiAmount: '100000000000000000000000'
    }
  ]
};

const network = new BesuNetwork(config);

await network.create({
  nodes: [
    {
      name: 'bootnode1',
      ip: '172.30.0.20',
      rpcPort: 8545,
      type: 'bootnode'
    },
    {
      name: 'miner1',
      ip: '172.30.0.21',
      rpcPort: 8546,
      type: 'miner',
      signerAddress: '0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9'
    }
  ],
  autoResolveSubnetConflicts: true
});

await network.start();
```

### 2. Agregar Nodos Dinámicamente

```typescript
// Agregar nodo RPC
await network.addNode({
  name: 'rpc1',
  ip: '172.30.0.22',
  rpcPort: 8547,
  type: 'rpc'
});

// Remover nodo
await network.removeNode('rpc1');
```

### 3. Actualizar Configuración

```typescript
import { updateNetworkConfig } from './src/update-besu-networks';

// Cambiar subnet (requiere nuevas IPs)
await updateNetworkConfig(network, {
  subnet: '172.60.0.0/16',
  nodes: [
    { name: 'bootnode1', ip: '172.60.0.20' },
    { name: 'miner1', ip: '172.60.0.21' }
  ]
});
```

### 4. Financiar Cuentas

```typescript
// Desde mnemonic
await network.fundMnemonic(
  'test test test test test test test test test test test junk',
  '10',  // 10 ETH por cuenta
  5      // 5 cuentas (índices 0-4)
);

// Verificar balance
const balance = await network.getBalance(
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  'http://localhost:8545'
);
console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
```

## API REST (Aplicación)

### Endpoints Disponibles

#### Networks
```bash
GET    /api/networks              # Listar todas las redes
POST   /api/networks              # Crear nueva red
GET    /api/networks/[id]         # Obtener red específica
PUT    /api/networks/[id]         # Actualizar red
DELETE /api/networks/[id]         # Eliminar red
POST   /api/networks/[id]/start   # Iniciar red
POST   /api/networks/[id]/stop    # Detener red
```

#### Cleanup
```bash
POST   /api/cleanup               # Limpiar todas las redes
```

### Ejemplo de Request

```bash
# Crear red
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-network",
    "chainId": 1337,
    "consensus": "clique",
    "gasLimit": "0x1fffffffffffff",
    "blockTime": 5,
    "subnet": "172.20.0.0/16",
    "signerAccounts": [
      {
        "address": "0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9",
        "weiAmount": "1000000000000000000000"
      }
    ]
  }'
```

## Debugging y Troubleshooting

### Docker

```bash
# Ver contenedores Besu
docker ps --filter "label=network=<network-name>"

# Logs de nodo
docker logs besu-<network-name>-<node-name>

# Entrar a contenedor
docker exec -it besu-<network-name>-<node-name> /bin/sh

# Limpiar todo
docker container prune -f
docker network prune -f
docker volume prune -f
```

### Verificar Red

```bash
# Info de red
curl -X POST --data '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}' \
  -H "Content-Type: application/json" http://localhost:8545

# Peer count
curl -X POST --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
  -H "Content-Type: application/json" http://localhost:8545

# Número de bloque
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  -H "Content-Type: application/json" http://localhost:8545
```

### Código TypeScript

```typescript
// Conectividad de nodos
const connectivity = await network.getNetworkConnectivity();
console.log('Connectivity:', connectivity);

// Info de red
const info = await network.getNetworkInfo('http://localhost:8545');
console.log('Network Info:', info);

// Configuración de todos los nodos
const configs = network.getAllNodeConfigs();
configs.forEach(config => {
  console.log(`${config.name}: ${config.rpcUrl}`);
});
```

## Errores Comunes y Soluciones

### Error: "Port already in use"
```bash
# Encontrar proceso usando puerto
lsof -i :8545

# Limpiar contenedores
docker rm -f $(docker ps -aq --filter "label=network=<name>")
```

### Error: "Subnet conflicts"
```typescript
// Usar auto-resolución
await network.create({
  nodes: [...],
  autoResolveSubnetConflicts: true  // ✅
});
```

### Error: "Miner without signerAccount"
```typescript
// Verificar asociación explícita
const config = {
  signerAccounts: [
    { address: '0x...', weiAmount: '...' }
  ],
  nodes: [
    {
      name: 'miner1',
      type: 'miner',
      signerAddress: '0x...'  // ✅ Mismo address
    }
  ]
};
```

### Tests fallando
```bash
# Limpiar Docker antes de tests
npm run cleanup-networks

# Ejecutar test individual
npm test _test_/besu.test.ts

# Con verbose
npm test -- --testNamePattern="test name" --verbose
```

## Workflows Recomendados

### Workflow 1: Desarrollo de Nueva Funcionalidad
```
1. [TypeScript Expert] Implementa función en lib/
2. [Testing Expert] Escribe tests unitarios
3. [Docker Expert] Valida operaciones Docker
4. [Documentation Writer] Documenta API
```

### Workflow 2: Nueva Página Frontend
```
1. [Frontend Expert] Crea página Next.js
2. [API Expert] Implementa endpoints REST
3. [Frontend Expert] Integra con API
4. [Documentation Writer] Documenta UI
```

### Workflow 3: Nueva Validación
```
1. [Security Expert] Identifica caso edge
2. [TypeScript Expert] Implementa validación
3. [Testing Expert] Escribe tests de validación
4. [Documentation Writer] Documenta en CLAUDE.md
```

## Integración con Agentes

Ver [AGENTS.md](./AGENTS.md) para:
- Lista completa de agentes disponibles
- Capacidades de cada agente
- Ejemplos de uso
- Workflows predefinidos

## Referencias Útiles

### Documentación Oficial
- [Hyperledger Besu Docs](https://besu.hyperledger.org/)
- [Clique Consensus Spec](https://github.com/ethereum/EIPs/issues/225)
- [Next.js Documentation](https://nextjs.org/docs)
- [Docker SDK](https://docs.docker.com/engine/api/sdk/)
- [ethers.js v6](https://docs.ethers.org/v6/)

### Archivos Clave del Proyecto
- `lib/README.md` - Documentación completa de la librería
- `app/README.md` - Documentación de la aplicación
- `script/README.md` - Guía de scripts
- `lib/examples/README.md` - Ejemplos validados

## Contacto

**Desarrollador**: Javier Ruiz-Canela López
**Email**: jrcanelalopez@gmail.com

---

**Versión**: 1.0
**Última actualización**: 28 de Junio, 2025
**Proyecto**: Besu Network Manager
