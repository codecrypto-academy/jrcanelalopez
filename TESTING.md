# Guía de Testing - Supply Chain Tracker 2025

**Versión**: 1.0
**Fecha**: Octubre 2025
**Proyecto**: Supply Chain Tracker - Sistema de Trazabilidad Blockchain

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Estructura de Testing](#estructura-de-testing)
3. [Smart Contract Testing](#smart-contract-testing)
4. [Tests de Integración Frontend-Blockchain](#tests-de-integración-frontend-blockchain)
5. [Comandos Rápidos](#comandos-rápidos)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Troubleshooting](#troubleshooting)
8. [Referencias](#referencias)

---

## Introducción

Este proyecto implementa una **estrategia de testing completa** que cubre:

- **Tests Unitarios del Smart Contract** (Foundry)
- **Tests de Integración Smart Contract** (Foundry)
- **Tests de Integración Frontend-Blockchain** (ethers.js + Foundry CLI)
- **Tests Multi-Rol** (Admin, Producer, Factory, Retailer, Consumer)

### Stack de Testing

| Componente | Herramienta | Propósito |
|-----------|-------------|-----------|
| Smart Contract | **Foundry** | Tests unitarios y cobertura |
| Integración Frontend | **ethers.js v6** | Interacción con blockchain |
| CLI Blockchain | **Foundry CLI (cast)** | Comandos directos de blockchain |
| Blockchain Local | **Anvil** | Red de pruebas local |

---

## Estructura de Testing

```
web3-98_pfm_traza_2025/
│
├── sc/                              # Smart Contract Tests
│   ├── test/
│   │   └── SupplyChain.t.sol       # Suite completa de tests
│   ├── test-supply-chain.sh        # Script de tests rápidos
│   └── test-quick.sh               # Tests específicos
│
├── web/                             # Frontend
│   └── test/                        # Tests de Integración
│       ├── test-self-registration.mjs         # Auto-registro con cast
│       ├── test-frontend-flow.mjs             # Flujo frontend completo
│       ├── test-multiple-roles-approval.mjs   # Test múltiples roles
│       └── test-user-rejection.mjs            # Test rechazo usuarios
│
├── .claude/
│   ├── commands/
│   │   ├── test-sc.md              # Comando: Tests SC
│   │   ├── coverage-sc.md          # Comando: Cobertura
│   │   └── create-test.md          # Comando: Crear test
│   └── agents/
│       ├── testing-expert.md       # Agente: Smart Contract Testing
│       └── debug-detective.md      # Agente: Debugging
│
└── TESTING.md                       # Este archivo
```

---

## Smart Contract Testing

### Arquitectura de Tests

Los tests del smart contract están organizados en **categorías**:

1. **Gestión de Usuarios** (7 tests)
   - Registro y aprobación
   - Cambios de estado
   - Validación de permisos

2. **Creación de Tokens** (8 tests)
   - Tokens por cada rol
   - Parent-child relationships
   - Validaciones de negocio

3. **Transferencias** (7 tests)
   - Flujo completo Producer → Consumer
   - Sistema de aprobación
   - Validaciones de roles

4. **Validaciones y Permisos** (6 tests)
   - Control de acceso
   - Reglas de negocio

5. **Casos Edge** (5 tests)
   - Errores esperados
   - Casos límite

**Total**: 22 tests (mínimo requerido)

### Comandos de Testing

#### Ejecutar Todos los Tests

```bash
# Opción 1: Directamente
cd sc
forge test

# Opción 2: Con detalles
forge test -vvv

# Opción 3: Usando slash command
/test-sc
```

#### Tests con Cobertura

```bash
# Generar reporte de cobertura
cd sc
forge coverage

# Usando slash command
/coverage-sc

# Cobertura detallada con lcov
forge coverage --report lcov
```

#### Tests Específicos

```bash
# Test específico por nombre
forge test --match-test testCreateToken -vvv

# Tests de una categoría
forge test --match-contract SupplyChainTest -vvv

# Tests con gas report
forge test --gas-report
```

#### Scripts Personalizados

```bash
# Test rápido del flujo principal
./test-supply-chain.sh

# Tests específicos
./test-quick.sh
```

### Escribir Nuevos Tests

#### Plantilla de Test

```solidity
// test/SupplyChain.t.sol
function testNombreDescriptivo() public {
    // Arrange: Setup del estado inicial
    vm.prank(admin);
    supplyChain.registerUser(producer, "Producer");

    // Act: Ejecutar la acción a testear
    vm.prank(producer);
    uint256 tokenId = supplyChain.createToken(
        "Raw Material",
        1000,
        "{}",
        0
    );

    // Assert: Verificar el resultado
    (uint256 id, address creator, , , , , ) = supplyChain.getToken(tokenId);
    assertEq(id, tokenId);
    assertEq(creator, producer);
}
```

#### Crear Test con Asistencia

```bash
# Usar el comando de Claude
/create-test

# O usar el agente Testing Expert
Usa el agente "Testing Expert" para crear un test que valide...
```

### Cobertura Objetivo

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| **Statements** | > 90% | Verificar con `/coverage-sc` |
| **Branches** | > 85% | Verificar con `/coverage-sc` |
| **Functions** | > 95% | Verificar con `/coverage-sc` |
| **Lines** | > 90% | Verificar con `/coverage-sc` |

### Tests de Seguridad

Ver: [`.claude/agents/security-auditor.md`](.claude/agents/security-auditor.md)

```bash
# Análisis estático con Slither
slither sc/src/SupplyChain.sol

# Review manual de seguridad
/review-contract
```

---

## Tests de Integración Frontend-Blockchain

### Tipos de Tests de Integración

El proyecto incluye **4 tests de integración JavaScript** que verifican la interacción entre el frontend y el smart contract usando **ethers.js** y **Foundry CLI (cast)**.

#### 1. Self-Registration Test

**Archivo**: `web/test/test-self-registration.mjs`

**Tecnología**: Foundry CLI (`cast`)

**Descripción**: Prueba el auto-registro de múltiples usuarios y su aprobación por el admin.

**Flujo**:
1. Verificar que el admin está configurado correctamente
2. Producer, Factory y Retailer se auto-registran vía `requestUserRole()`
3. Admin aprueba a todos los usuarios vía `changeStatusUser()`
4. Verificar que todos tengan estado Approved

**Ejecutar**:
```bash
npm run test:self-registration
```

#### 2. Frontend Flow Test

**Archivo**: `web/test/test-frontend-flow.mjs`

**Tecnología**: ethers.js v6

**Descripción**: Simula el flujo completo de un usuario desde el frontend.

**Flujo**:
1. Usuario no-admin solicita registrarse como Producer
2. Sistema registra al usuario con estado Pending
3. Admin aprueba la solicitud
4. Usuario reconecta y sistema lo reconoce como Producer aprobado

**Ejecutar**:
```bash
npm run test:frontend-flow
```

#### 3. Multiple Roles Test

**Archivo**: `web/test/test-multiple-roles-approval.mjs`

**Tecnología**: ethers.js v6

**Descripción**: Prueba el registro y aprobación de 4 roles simultáneamente.

**Flujo**:
1. Producer, Factory, Retailer y Consumer solicitan registro
2. Admin aprueba a los 4 usuarios
3. Cada usuario reconecta y sistema verifica su rol correcto

**Ejecutar**:
```bash
npm run test:multiple-roles
```

**⚠️ Nota**: Este test requiere que los usuarios no estén previamente registrados. Ejecutar con Anvil limpio.

#### 4. User Rejection Test

**Archivo**: `web/test/test-user-rejection.mjs`

**Tecnología**: ethers.js v6

**Descripción**: Verifica el flujo de rechazo de usuarios por parte del admin.

**Flujo**:
1. Usuario solicita registro
2. Admin rechaza la solicitud (status Rejected)
3. Usuario intenta operar y es bloqueado
4. Verificar que usuario rechazado no puede crear tokens ni transferir

**Ejecutar**:
```bash
npm run test:user-rejection
```

### Setup de Tests de Integración

#### Primera Vez (Setup Completo)

```bash
# 1. Instalar dependencias en el root
npm install

# 2. Instalar dependencias del frontend
cd web
npm install

# 3. Verificar que ethers.js está instalado
npm list ethers
```

#### Requisitos Previos

Antes de ejecutar tests de integración:

```bash
# Terminal 1: Blockchain local
cd sc
anvil

# Terminal 2: Desplegar contrato
cd sc
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# La dirección del contrato desplegado debe ser: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Comandos de Testing de Integración

```bash
# Ejecutar todos los tests (puede tener conflictos por usuarios registrados)
npm test

# Tests individuales (recomendado)
npm run test:self-registration  # Test con cast CLI
npm run test:frontend-flow      # Test flujo frontend
npm run test:multiple-roles     # Test múltiples roles
npm run test:user-rejection     # Test rechazo de usuarios
```

**⚠️ Advertencia**: Ejecutar todos los tests en secuencia puede causar conflictos porque algunos tests registran los mismos usuarios. Se recomienda ejecutarlos individualmente con Anvil limpio.

#### Ejecutar Test Individual con Estado Limpio

```bash
# Terminal 1: Reiniciar Anvil
kill $(lsof -t -i:8545) && cd sc && anvil

# Terminal 2: Redesplegar contrato
cd sc
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# Terminal 3: Ejecutar test
cd ..
npm run test:self-registration
```

### Cuentas de Anvil para Tests

Los tests utilizan las cuentas predeterminadas de Anvil:

**Cuentas Principales**:
- **Admin**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (Account #0)
- **Producer**: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (Account #1)
- **Factory**: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` (Account #2)
- **Retailer**: `0x90F79bf6EB2c4f870365E785982E1f101E93b906` (Account #3)
- **Consumer**: `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` (Account #4)

**Cuentas de Test** (usadas por test-multiple-roles y test-frontend-flow):
- **Account #6**: `0x14dC79964da2C08b23698B3D3cc7Ca32193d9955`
- **Account #7**: `0x976EA74026E726554dB657fA54763abd0C3a0aa9`
- **Account #8**: `0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f`
- **Account #5**: `0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc`

### Debugging Tests de Integración

#### Ver Output Detallado

Los tests ya incluyen output colorizado con información detallada de cada paso.

#### Verificación Manual con cast

Puedes verificar el estado del contrato manualmente:

```bash
# Verificar si un usuario está registrado
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "getUserInfo(address)" \
  0x976EA74026E726554dB657fA54763abd0C3a0aa9 \
  --rpc-url http://localhost:8545

# Verificar si una dirección es admin
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "isAdmin(address)(bool)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url http://localhost:8545

# Ver eventos del contrato
cast logs \
  --address 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "UserRoleRequested(address,string)" \
  --rpc-url http://localhost:8545
```

### Estructura de los Tests

Los tests están escritos en JavaScript modular (`.mjs`) y utilizan:

- **ethers.js v6**: Para interactuar con el smart contract (tests-frontend-flow, test-multiple-roles, test-user-rejection)
- **Foundry CLI (cast)**: Para comandos directos de blockchain (test-self-registration)
- **Node.js**: Como runtime
- **Anvil RPC**: Blockchain local (http://localhost:8545, Chain ID: 31337)

---

## Comandos Rápidos

### Smart Contract

```bash
# Tests básicos
forge test                    # Todos los tests
forge test -vvv              # Con detalles
forge test --gas-report      # Con gas report

# Cobertura
forge coverage               # Reporte de cobertura
forge coverage --report lcov # Formato lcov

# Tests específicos
forge test --match-test testCreateToken -vvv
forge test --match-contract SupplyChainTest

# Slash commands (Claude Code)
/test-sc                     # Ejecutar tests
/coverage-sc                 # Ver cobertura
/create-test                 # Crear nuevo test
```

### Tests de Integración Frontend-Blockchain

```bash
# Ejecutar todos los tests (puede tener conflictos)
npm test

# Tests individuales (recomendado)
npm run test:self-registration  # Auto-registro con cast
npm run test:frontend-flow      # Flujo completo frontend
npm run test:multiple-roles     # Test 4 roles simultáneos
npm run test:user-rejection     # Test rechazo de usuarios

# Debugging manual con cast
cast call <CONTRACT_ADDR> "getUserInfo(address)" <USER_ADDR> --rpc-url http://localhost:8545
cast call <CONTRACT_ADDR> "isAdmin(address)(bool)" <ADMIN_ADDR> --rpc-url http://localhost:8545
cast logs --address <CONTRACT_ADDR> "UserRoleRequested(address,string)" --rpc-url http://localhost:8545
```

### Testing Completo (CI/CD)

```bash
# Script completo para CI
#!/bin/bash
set -e

# 1. Tests del Smart Contract
cd sc
forge test
forge coverage

# 2. Build del Frontend
cd ../web
npm run build

# 3. Tests de Integración (requiere Anvil y contrato desplegado)
cd ..
npm run test:self-registration
npm run test:frontend-flow

echo "✅ Todos los tests pasaron"
```

---

## Mejores Prácticas

### Smart Contract Testing

#### ✅ Hacer

1. **Tests Descriptivos**
   ```solidity
   // ✅ BIEN
   function testProducerCanCreateRawMaterial() public { }

   // ❌ MAL
   function test1() public { }
   ```

2. **Usar vm.prank para cambiar contexto**
   ```solidity
   vm.prank(producer);
   supplyChain.createToken("Token", 100, "{}", 0);
   ```

3. **Verificar eventos**
   ```solidity
   vm.expectEmit(true, true, false, true);
   emit TokenCreated(tokenId, producer, "Token", 100);
   ```

4. **Test de reversiones**
   ```solidity
   vm.expectRevert(SupplyChain.UserNotApproved.selector);
   supplyChain.createToken("Token", 100, "{}", 0);
   ```

#### ❌ No Hacer

1. ❌ Tests sin assertions
2. ❌ Tests que dependen del orden de ejecución
3. ❌ Hardcodear direcciones (usar variables)
4. ❌ Tests sin verificar eventos importantes

### Tests de Integración

#### ✅ Hacer

1. **Ejecutar con Anvil limpio**
   ```bash
   kill $(lsof -t -i:8545) && cd sc && anvil
   ```

2. **Verificar estado antes de test**
   ```javascript
   const userInfo = await contract.getUserInfo(userAddress);
   if (userInfo) {
     console.log('Usuario ya registrado, se reutilizará');
   }
   ```

3. **Usar async/await correctamente**
   ```javascript
   const tx = await contract.requestUserRole('Producer');
   await tx.wait();  // Esperar confirmación
   ```

4. **Manejar errores de contrato**
   ```javascript
   try {
     await contract.requestUserRole('Producer');
   } catch (err) {
     if (err.message.includes('UserAlreadyRegistered')) {
       console.log('Usuario ya existe');
     }
   }
   ```

#### ❌ No Hacer

1. ❌ Ejecutar múltiples tests en secuencia sin limpiar estado
2. ❌ Ignorar confirmaciones de transacciones
3. ❌ Hardcodear direcciones sin verificar
4. ❌ Asumir que el usuario no existe sin verificar

### Cobertura de Tests

#### Objetivo Mínimo

- **Smart Contract**: > 90% cobertura
- **Funciones Críticas**: 100% cobertura
  - `registerUser`
  - `createToken`
  - `transfer`
  - `acceptTransfer`
  - `rejectTransfer`

#### Tests Obligatorios por Función

| Función | Tests Mínimos |
|---------|---------------|
| `registerUser` | 3 (éxito, rechazo, duplicado) |
| `createToken` | 4 (Producer, Factory, Retailer, validaciones) |
| `transfer` | 5 (cada rol, rechazo, validaciones) |
| `acceptTransfer` | 2 (éxito, rechazo) |
| `rejectTransfer` | 1 (éxito) |

---

## Troubleshooting

### Smart Contract Tests

#### Tests Fallan Inconsistentemente

**Síntoma**: Tests pasan a veces, fallan otras veces

**Causa**: Estado compartido entre tests

**Solución**:
```solidity
function setUp() public {
    // Recrear estado limpio antes de cada test
    supplyChain = new SupplyChain();
}
```

#### "Transaction reverted" sin razón

**Síntoma**: Test falla con revert genérico

**Solución**:
```bash
# Ejecutar con máxima verbosidad
forge test -vvvv

# Ver el trace completo
forge test --match-test testFailing -vvvv
```

#### Cobertura Baja

**Síntoma**: Coverage < 90%

**Solución**:
```bash
# Ver qué falta cubrir
forge coverage

# Identificar líneas sin cubrir
forge coverage --report lcov
```

### Tests de Integración

#### "Cannot find module 'ethers'"

**Síntoma**: Error al ejecutar tests de integración

**Solución**:
```bash
# Instalar dependencias
npm install
cd web && npm install
```

#### "Connection refused" o "ECONNREFUSED"

**Síntoma**: Tests no pueden conectar con Anvil

**Verificar**:
```bash
# 1. Anvil está corriendo
lsof -ti:8545  # Debe devolver un PID

# 2. Contrato está desplegado
cast code 0x5FbDB2315678afecb367f032d93F642f64180aa3 --rpc-url http://localhost:8545
```

**Solución**:
```bash
# Terminal 1: Iniciar Anvil
cd sc && anvil

# Terminal 2: Desplegar contrato
cd sc
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# Terminal 3: Ejecutar test
cd ..
npm run test:self-registration
```

#### "execution reverted: UserAlreadyRegistered"

**Síntoma**: Test falla porque el usuario ya está registrado

**Solución**:
```bash
# Reiniciar Anvil para limpiar estado
kill $(lsof -t -i:8545) && cd sc && anvil

# Redesplegar contrato
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `UserDoesNotExist` | Usuario no registrado | Registrar con admin primero |
| `InvalidRoleFlow` | Flujo de roles incorrecto | Verificar Producer→Factory→Retailer→Consumer |
| `InsufficientBalance` | Balance insuficiente | Verificar balance antes de transferir |
| `BAD_DATA` | Contrato no desplegado | Redesplegar con `./deploy-local.sh` |
| `Network timeout` | Anvil no responde | Reiniciar Anvil |

---

## Referencias

### Documentación Interna

- **Smart Contract**: [`sc/src/SupplyChain.sol`](sc/src/SupplyChain.sol)
- **Tests SC**: [`sc/test/SupplyChain.t.sol`](sc/test/SupplyChain.t.sol)
- **Tests Integración**: [`web/test/`](web/test/)
- **Guía Principal**: [`CLAUDE.md`](CLAUDE.md)

### Agentes Especializados

- **Testing Expert**: [`.claude/agents/testing-expert.md`](.claude/agents/testing-expert.md)
- **Security Auditor**: [`.claude/agents/security-auditor.md`](.claude/agents/security-auditor.md)
- **Debug Detective**: [`.claude/agents/debug-detective.md`](.claude/agents/debug-detective.md)

### Comandos Slash

- `/test-sc` - Ejecutar tests del smart contract
- `/coverage-sc` - Ver cobertura de tests
- `/create-test` - Crear un nuevo test
- `/review-contract` - Revisar contrato en busca de mejoras
- `/check-project` - Verificar estado del proyecto completo

### Documentación Externa

- **Foundry Book**: https://book.getfoundry.sh/
- **ethers.js v6**: https://docs.ethers.org/v6/
- **Solidity Testing**: https://docs.soliditylang.org/en/latest/testing.html
- **Anvil**: https://book.getfoundry.sh/anvil/

### Scripts del Proyecto

```bash
# Smart Contract
sc/test-supply-chain.sh      # Tests rápidos
sc/test-quick.sh             # Tests específicos
sc/deploy-local.sh           # Deploy en Anvil
sc/start-anvil.sh            # Iniciar Anvil

# Tests de Integración
npm run test:self-registration  # Test auto-registro
npm run test:frontend-flow      # Test flujo frontend
npm run test:multiple-roles     # Test múltiples roles
npm run test:user-rejection     # Test rechazo usuarios
```

---

## Checklist de Testing

Antes de hacer commit/push, verifica:

### Smart Contract
- [ ] `forge test` pasa todos los tests
- [ ] `forge coverage` > 90%
- [ ] No hay warnings de compilación
- [ ] Tests cubren casos edge
- [ ] Tests cubren reversiones

### Tests de Integración
- [ ] `npm run test:self-registration` pasa
- [ ] `npm run test:frontend-flow` pasa
- [ ] Tests se ejecutan con Anvil limpio
- [ ] Contrato desplegado correctamente
- [ ] No hay tests flakey

### Integración Frontend
- [ ] Anvil corriendo
- [ ] Contrato desplegado en dirección correcta
- [ ] Frontend conecta con MetaMask
- [ ] Flujo completo funciona
- [ ] No hay errores en consola

---

## Contribuir con Tests

### Agregar Test de Smart Contract

1. Editar [`sc/test/SupplyChain.t.sol`](sc/test/SupplyChain.t.sol)
2. Seguir nomenclatura: `testActionRole()`
3. Incluir documentación:
   ```solidity
   /// @notice Test que verifica X comportamiento
   /// @dev Detalles de implementación
   function testProducerCreatesRawMaterial() public {
       // Test implementation
   }
   ```
4. Ejecutar: `forge test -vvv`
5. Verificar cobertura: `forge coverage`

### Agregar Test de Integración

1. Crear archivo en `web/test/` con sufijo `.mjs`
2. Importar ethers.js:
   ```javascript
   import { ethers } from 'ethers';
   import { readFileSync } from 'fs';
   ```
3. Estructurar test:
   ```javascript
   async function runTest() {
     const provider = new ethers.JsonRpcProvider('http://localhost:8545');
     const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
     // Test implementation
   }
   runTest();
   ```
4. Ejecutar: `npm run test:nombre-del-test`

### Template Pull Request

```markdown
## Tests Incluidos

### Smart Contract
- [ ] Nuevos tests agregados en `sc/test/`
- [ ] Cobertura actual: X%
- [ ] Todos los tests pasan

### Tests de Integración
- [ ] Nuevos tests agregados en `web/test/`
- [ ] Tests de integración pasan en local
- [ ] Anvil y contrato desplegado correctamente

### Checklist
- [ ] Tests documentados
- [ ] Sin tests flakey
- [ ] CI/CD pasa
```

---

## Contacto y Soporte

**Documentación del proyecto**: Ver [`README.md`](README.md)

**Dudas sobre testing**:
1. Consultar esta guía
2. Ver agentes especializados en `.claude/agents/`
3. Revisar sesiones anteriores en `.claude/sessions/`
4. Usar comandos slash de Claude Code

---

**Última actualización**: Octubre 2025
**Versión**: 1.0
**Proyecto**: Supply Chain Tracker - PFM Trazabilidad Blockchain

---

## Apéndice: Matriz de Cobertura de Tests

### Smart Contract - SupplyChain.sol

| Función | Tests | Cobertura | Criticidad |
|---------|-------|-----------|------------|
| `registerUser` | 3 | 100% | Alta |
| `requestUserRole` | 2 | 100% | Alta |
| `changeStatusUser` | 3 | 100% | Alta |
| `getUserInfo` | 1 | 100% | Media |
| `isAdmin` | 1 | 100% | Alta |
| `createToken` | 5 | 100% | Alta |
| `getToken` | 1 | 100% | Media |
| `getTokenBalance` | 1 | 100% | Media |
| `getUserTokens` | 1 | 100% | Media |
| `transfer` | 6 | 100% | Alta |
| `acceptTransfer` | 2 | 100% | Alta |
| `rejectTransfer` | 1 | 100% | Alta |
| `getTransfer` | 1 | 100% | Media |
| `getUserTransfers` | 1 | 100% | Media |
| `pause` | 1 | 100% | Alta |
| `unpause` | 1 | 100% | Alta |
| **TOTAL** | **22+** | **>90%** | - |

### Tests de Integración Frontend-Blockchain

| Test | Tecnología | Estado | Archivo |
|------|-----------|--------|---------|
| Self-Registration | cast CLI | ✅ | `test-self-registration.mjs` |
| Frontend Flow | ethers.js | ✅ | `test-frontend-flow.mjs` |
| Multiple Roles | ethers.js | ✅ | `test-multiple-roles-approval.mjs` |
| User Rejection | ethers.js | ✅ | `test-user-rejection.mjs` |
| **TOTAL** | **4** | **✅** | - |

**Nota**: Los tests se ejecutan individualmente con Anvil limpio para evitar conflictos de estado.

---

*Esta guía es un documento vivo que se actualiza con cada sesión de testing.*
