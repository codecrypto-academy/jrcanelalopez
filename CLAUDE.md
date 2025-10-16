# Supply Chain Tracker - Guía para IA

## Descripción del Proyecto

Supply Chain Tracker es una DApp (Aplicación Descentralizada) educativa para gestionar trazabilidad en cadenas de suministro usando blockchain Ethereum. El sistema tokeniza materias primas y productos, rastreando su movimiento a través de diferentes actores: Producer → Factory → Retailer → Consumer.

## Arquitectura del Proyecto

```
web3-98_pfm_traza_2025/
├── sc/                          # Smart Contracts (Solidity + Foundry)
│   ├── src/
│   │   └── SupplyChain.sol      # Contrato principal
│   ├── script/
│   │   └── Deploy.s.sol         # Script de despliegue
│   ├── test/
│   │   └── SupplyChain.t.sol    # Tests unitarios
│   └── foundry.toml             # Configuración Foundry
│
├── web/                         # Frontend (Next.js + TypeScript)
│   ├── src/
│   │   ├── app/                 # Páginas Next.js App Router
│   │   ├── components/          # Componentes React
│   │   ├── contexts/            # Web3Provider y contextos
│   │   ├── hooks/               # Custom hooks (useWallet)
│   │   ├── lib/                 # Servicios Web3
│   │   └── contracts/           # ABI y configuración
│   └── package.json
│
├── screenshots/                 # Imágenes de referencia
├── README.md                    # Documentación principal
└── CLAUDE.md                    # Este archivo
```

## Stack Tecnológico

### Smart Contracts
- **Lenguaje**: Solidity ^0.8.0
- **Framework**: Foundry (forge, anvil, cast)
- **Testing**: Foundry Test
- **Blockchain Local**: Anvil (localhost:8545, Chain ID: 31337)

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Lenguaje**: TypeScript
- **Web3**: ethers.js v6
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State**: React Context API + localStorage

### Cuentas de Prueba Anvil
```
Admin:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Producer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Factory:  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Retailer: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Consumer: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
```

## Estructura del Smart Contract

### Enums
```solidity
enum UserStatus { Pending, Approved, Rejected, Canceled }
enum TransferStatus { Pending, Accepted, Rejected }
```

### Structs Principales

**Token**: Representa materias primas o productos
- `id`: Identificador único
- `creator`: Dirección del creador
- `name`: Nombre del token
- `totalSupply`: Cantidad total
- `features`: Metadatos JSON
- `parentId`: ID del token padre (0 si es materia prima)
- `dateCreated`: Timestamp de creación
- `balance`: Mapping de balances por dirección

**Transfer**: Gestiona transferencias entre usuarios
- `id`: Identificador único
- `from`: Remitente
- `to`: Destinatario
- `tokenId`: ID del token
- `dateCreated`: Timestamp
- `amount`: Cantidad transferida
- `status`: Estado (Pending/Accepted/Rejected)

**User**: Información de usuarios registrados
- `id`: Identificador único
- `userAddress`: Dirección Ethereum
- `role`: Producer/Factory/Retailer/Consumer
- `status`: Estado de aprobación

### Funciones Principales del Contrato

**Gestión de Usuarios**
- `requestUserRole(string memory role)`: Solicitar registro con rol
- `changeStatusUser(address userAddress, UserStatus newStatus)`: Cambiar estado (solo admin)
- `getUserInfo(address userAddress)`: Obtener información del usuario
- `isAdmin(address userAddress)`: Verificar si es admin

**Gestión de Tokens**
- `createToken(string name, uint totalSupply, string features, uint parentId)`: Crear token
- `getToken(uint tokenId)`: Obtener información del token
- `getTokenBalance(uint tokenId, address userAddress)`: Consultar balance
- `getUserTokens(address userAddress)`: Obtener tokens del usuario

**Gestión de Transferencias**
- `transfer(address to, uint tokenId, uint amount)`: Iniciar transferencia
- `acceptTransfer(uint transferId)`: Aceptar transferencia
- `rejectTransfer(uint transferId)`: Rechazar transferencia
- `getTransfer(uint transferId)`: Obtener información de transferencia
- `getUserTransfers(address userAddress)`: Obtener transferencias del usuario

### Reglas de Negocio (IMPORTANTE)

1. **Flujo de Transferencias** (estrictamente controlado):
   - Producer → Factory (✓)
   - Factory → Retailer (✓)
   - Retailer → Consumer (✓)
   - Consumer NO puede transferir (✗)
   - Cualquier otro flujo está prohibido

2. **Aprobación de Usuarios**:
   - Solo usuarios con status `Approved` pueden operar
   - Solo el `admin` puede cambiar estados de usuarios
   - El admin es quien desplegó el contrato

3. **Creación de Tokens**:
   - Producer: puede crear tokens con `parentId = 0` (materias primas)
   - Factory/Retailer: deben especificar `parentId > 0` (productos derivados)
   - Solo usuarios aprobados pueden crear tokens

4. **Transferencias**:
   - Sistema de aprobación: transferencia queda en estado `Pending`
   - El destinatario debe `acceptTransfer` o `rejectTransfer`
   - Solo se completa si hay balance suficiente
   - No se puede transferir a la misma dirección

## Estructura del Frontend

### Rutas de la Aplicación

- `/` - Landing/Login/Register
  - Si no está conectado: botón conectar MetaMask
  - Si conectado y no registrado: formulario de registro
  - Si registrado pero pendiente: mensaje de espera
  - Si aprobado: bienvenida + acceso a dashboard

- `/dashboard` - Panel principal según rol
- `/tokens` - Lista de tokens del usuario
- `/tokens/create` - Crear nuevo token
- `/tokens/[id]` - Detalles del token
- `/tokens/[id]/transfer` - Transferir token
- `/transfers` - Gestión de transferencias (aceptar/rechazar)
- `/admin` - Panel administración (solo Admin)
- `/admin/users` - Gestión de usuarios (solo Admin)
- `/profile` - Perfil del usuario

### Contextos y Hooks Importantes

**Web3Context** (`contexts/Web3Context.tsx`):
- Gestiona conexión con MetaMask
- Maneja estado global del usuario
- Persistencia en localStorage
- Reconexión automática al recargar
- Escucha eventos de cambio de cuenta/red

**useWallet** (`hooks/useWallet.ts`):
- Hook para consumir Web3Context
- Expone: `account`, `isConnected`, `userInfo`, `connect()`, `disconnect()`

**Web3Service** (`lib/web3.ts`):
- Servicio para interactuar con el contrato
- Maneja conversión de BigInt a Number/String
- Gestiona errores de transacciones
- Proporciona métodos typed para todas las funciones del contrato

### Consideraciones de Next.js 15+

**IMPORTANTE**: Next.js 15 cambió el manejo de params:

```tsx
// ❌ INCORRECTO
function Page({ params }: { params: { id: string } }) {
  const id = params.id; // Error!
}

// ✅ CORRECTO
import { use } from 'react';
function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
}
```

**localStorage**: Solo usar en componentes cliente (`'use client'`)
```tsx
if (typeof window !== 'undefined') {
  localStorage.setItem('key', 'value');
}
```

## Flujos de Trabajo Principales

### 1. Registro de Usuario
1. Usuario conecta MetaMask
2. Selecciona rol (Producer/Factory/Retailer/Consumer)
3. Llama a `requestUserRole(role)`
4. Estado pasa a `Pending`
5. Admin revisa en `/admin/users`
6. Admin aprueba con `changeStatusUser(address, Approved)`
7. Usuario puede operar

### 2. Creación de Token
1. Usuario aprobado va a `/tokens/create`
2. Ingresa: nombre, cantidad, características (JSON)
3. Si es Producer: `parentId = 0`
4. Si es Factory/Retailer: selecciona token padre de su inventario
5. Llama a `createToken(name, totalSupply, features, parentId)`
6. Token creado con balance completo para el creador

### 3. Transferencia
1. Usuario va a `/tokens/[id]/transfer`
2. Selecciona destinatario (validación de rol)
3. Ingresa cantidad
4. Llama a `transfer(to, tokenId, amount)`
5. Transferencia queda en estado `Pending`
6. Destinatario ve transferencia en `/transfers`
7. Destinatario acepta con `acceptTransfer(id)` o rechaza con `rejectTransfer(id)`
8. Si acepta: balances se actualizan, status → `Accepted`

## Tests del Smart Contract

### Categorías de Tests Obligatorios

1. **Gestión de Usuarios** (7 tests):
   - Registro de usuario
   - Aprobación por admin
   - Rechazo por admin
   - Cambios de estado
   - Solo usuarios aprobados pueden operar
   - Obtener información de usuario
   - Verificar admin

2. **Creación de Tokens** (8 tests):
   - Crear token por Producer
   - Crear token por Factory
   - Crear token por Retailer
   - Token con parentId
   - Metadatos del token
   - Balance del token
   - Obtener token
   - Obtener tokens del usuario

3. **Transferencias** (8 tests):
   - Transferencia Producer → Factory
   - Transferencia Factory → Retailer
   - Transferencia Retailer → Consumer
   - Aceptar transferencia
   - Rechazar transferencia
   - Transferencia con balance insuficiente
   - Obtener transferencia
   - Obtener transferencias del usuario

4. **Validaciones y Permisos** (6 tests):
   - Transferencia a rol inválido
   - Usuario no aprobado no puede crear tokens
   - Usuario no aprobado no puede transferir
   - Solo admin puede cambiar estados
   - Consumer no puede transferir
   - Transferencia a misma dirección

5. **Casos Edge** (5 tests):
   - Transferencia de cantidad 0
   - Transferencia de token inexistente
   - Aceptar transferencia inexistente
   - Doble aceptación de transferencia
   - Transferencia después de rechazo

6. **Eventos** (6 tests):
   - Evento de registro de usuario
   - Evento de cambio de estado
   - Evento de creación de token
   - Evento de transferencia iniciada
   - Evento de transferencia aceptada
   - Evento de transferencia rechazada

7. **Flujos Completos** (3 tests):
   - Flujo completo de la cadena de suministro
   - Múltiples tokens
   - Trazabilidad completa

**TOTAL: 43 tests mínimos**

### Ejecutar Tests
```bash
cd sc
forge test              # Todos los tests
forge test -vvv         # Con trazas
forge test --match-test testCreateToken  # Test específico
forge coverage          # Cobertura
```

## Comandos Útiles

### Smart Contracts
```bash
cd sc
forge build                    # Compilar
forge test                     # Ejecutar tests
forge test -vvv               # Tests con trazas detalladas
forge coverage                # Cobertura de tests
anvil                         # Blockchain local

# Deploy en Anvil
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

### Frontend
```bash
cd web
npm install               # Instalar dependencias
npm run dev              # Desarrollo (http://localhost:3000)
npm run build            # Build de producción
npm run lint             # Linting
```

### Foundry CLI útiles
```bash
cast call <CONTRACT_ADDR> "getUserInfo(address)(uint256,address,string,uint8)" <USER_ADDR> --rpc-url http://localhost:8545
cast send <CONTRACT_ADDR> "requestUserRole(string)" "Producer" --private-key <KEY> --rpc-url http://localhost:8545
```

## Errores Comunes y Soluciones

### Smart Contract
- **"Transaction reverted"**: Usuario no aprobado o permisos insuficientes
- **"Contract not deployed"**: Verificar que Anvil esté corriendo y redesplegar
- **Test falla**: Revisar trazas con `forge test -vvvv`

### Frontend
- **"MetaMask not detected"**: Instalar extensión de navegador
- **"Wrong network"**: Configurar red Anvil en MetaMask (Chain ID: 31337)
- **"localStorage is not defined"**: Usar solo en cliente (`typeof window !== 'undefined'`)
- **Params error Next.js 15**: Usar `use(params)` en lugar de acceso directo
- **BigInt serialization**: Convertir BigInt a String antes de enviar a componentes

### Web3
- **Conversion errors**: Siempre convertir BigInt a Number o String
- **Transaction fails**: Verificar que el usuario tenga ETH en Anvil
- **Stale data**: Refrescar estado después de transacciones exitosas

## Objetivos de Aprendizaje

Al completar este proyecto se aprende:
- ✅ Programación de Smart Contracts en Solidity
- ✅ Testing exhaustivo con Foundry
- ✅ Desarrollo de DApps con Next.js
- ✅ Integración Web3 con ethers.js
- ✅ Gestión de roles y permisos en blockchain
- ✅ Sistema de tokens personalizados
- ✅ Flujos de aprobación descentralizados
- ✅ Trazabilidad en blockchain
- ✅ UI/UX para aplicaciones crypto

## Criterios de Calidad

### Mínimo para Aprobar (6/10)
- Smart contract deployado con tests básicos pasando
- Frontend conectando con MetaMask
- Al menos 3 páginas principales funcionando
- Flujo básico de registro y tokens operativo

### Excelente (10/10)
- TODOS los tests pasando (43+)
- Todas las páginas implementadas
- Flujo completo Producer→Consumer funcionando
- UI/UX pulida y responsive
- Manejo robusto de errores
- Código limpio y bien documentado
- Video demo de máximo 5 minutos

## Notas Importantes para la IA

1. **SIEMPRE ejecutar tests** después de cambios en el smart contract
2. **Validar tipos TypeScript** antes de sugerir código frontend
3. **Recordar el flujo de roles**: Producer → Factory → Retailer → Consumer
4. **No permitir operaciones sin aprobación** del admin
5. **Convertir BigInt** antes de usar en React components
6. **Usar 'use client'** en componentes que usan localStorage o hooks
7. **Next.js 15+**: params son Promise, usar `use(params)`
8. **Tests primero**: Si el test pasa pero el frontend falla, el problema está en la integración Web3

## Objetivos Relacionados con IA

1. Uso de la Inteligencia Artificial para el desarrollo del proyecto
2. Retrospectiva del uso de la IA (archivo IA.md):
   - IAs utilizadas
   - Tiempo consumido (smart contract vs frontend)
   - Errores más habituales analizando chats
   - Archivos de los chats de IA
3. Construcción de un MCP que envuelva los CLI de foundry (anvil, cast, forge)
4. Opcional: Manejo del contrato inteligente en la aplicación con IA

## Referencias Rápidas

- Documentación Solidity: https://docs.soliditylang.org/
- Foundry Book: https://book.getfoundry.sh/
- Next.js Docs: https://nextjs.org/docs
- Ethers.js v6: https://docs.ethers.org/v6/
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/

---

**Última actualización**: 2025-10-16
**Versión**: 1.0
