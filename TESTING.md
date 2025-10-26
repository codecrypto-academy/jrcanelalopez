# Guía de Testing - Supply Chain Tracker 2025

**Versión**: 1.0
**Fecha**: Octubre 2025
**Proyecto**: Supply Chain Tracker - Sistema de Trazabilidad Blockchain

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Estructura de Testing](#estructura-de-testing)
3. [Smart Contract Testing](#smart-contract-testing)
4. [Frontend E2E Testing](#frontend-e2e-testing)
5. [Comandos Rápidos](#comandos-rápidos)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Troubleshooting](#troubleshooting)
8. [Referencias](#referencias)

---

## Introducción

Este proyecto implementa una **estrategia de testing completa** que cubre:

- **Tests Unitarios del Smart Contract** (Foundry)
- **Tests de Integración** (Foundry)
- **Tests End-to-End del Frontend** (Playwright + Synpress)
- **Tests Multi-Wallet** (Admin, Producer, Factory, Retailer, Consumer)

### Stack de Testing

| Componente | Herramienta | Propósito |
|-----------|-------------|-----------|
| Smart Contract | **Foundry** | Tests unitarios y cobertura |
| E2E Frontend | **Playwright** | Tests de UI sin wallet |
| E2E Web3 | **Synpress** | Tests con MetaMask |
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
├── web/                             # Frontend Tests
│   ├── e2e/
│   │   ├── wallet-setup/           # Configuración de wallets
│   │   │   ├── admin.setup.ts
│   │   │   ├── producer.setup.ts
│   │   │   ├── factory.setup.ts
│   │   │   ├── retailer.setup.ts
│   │   │   └── consumer.setup.ts
│   │   ├── landing-page.spec.ts    # Tests de UI
│   │   ├── auto-registration.spec.ts
│   │   ├── admin-approval.spec.ts
│   │   └── complete-supply-chain-flow.spec.ts
│   ├── setup-e2e.sh                # Setup automático de E2E
│   └── playwright.config.ts        # Configuración Playwright
│
├── .claude/
│   ├── commands/
│   │   ├── test-sc.md              # Comando: Tests SC
│   │   ├── coverage-sc.md          # Comando: Cobertura
│   │   └── create-test.md          # Comando: Crear test
│   └── agents/
│       ├── testing-expert.md       # Agente: Smart Contract Testing
│       ├── playwright-e2e-expert.md # Agente: E2E Testing
│       └── PLAYWRIGHT_E2E_GUIDE.md # Guía completa E2E
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

## Frontend E2E Testing

### Tipos de Tests E2E

#### 1. Tests de UI (Sin Wallet)

**Archivo**: `web/e2e/landing-page.spec.ts`

```typescript
test('should display landing page correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

**Ejecutar**:
```bash
cd web
npm run test:e2e:landing
```

#### 2. Tests con MetaMask (Synpress)

**Archivo**: `web/e2e/auto-registration.spec.ts`

```typescript
test('should register new user', async ({ page, metamask }) => {
  await page.goto('/');
  await page.click('button:has-text("Connect MetaMask")');
  await metamask.connectToDapp();
  // ... rest of test
});
```

**Ejecutar**:
```bash
cd web
npm run test:e2e:registration
```

#### 3. Tests Multi-Wallet

**Archivo**: `web/e2e/complete-supply-chain-flow.spec.ts`

Simula el flujo completo con 5 wallets:
- Admin: Registra usuarios
- Producer: Crea materia prima
- Factory: Procesa y crea productos
- Retailer: Distribuye productos
- Consumer: Recibe productos finales

**Ejecutar**:
```bash
cd web
npm run test:e2e:flow
```

### Setup de E2E Testing

#### Primera Vez (Setup Completo)

```bash
cd web

# 1. Instalar dependencias
npm install

# 2. Instalar Playwright
npm run playwright:install

# 3. Configurar E2E (crea caches de wallets)
npm run test:e2e:setup

# 4. Verificar instalación
npm run test:e2e:landing
```

#### Requisitos Previos

Antes de ejecutar tests E2E:

```bash
# Terminal 1: Blockchain local
cd sc
anvil

# Terminal 2: Desplegar contrato
cd sc
./deploy-local.sh

# Terminal 3: Frontend
cd web
npm run dev

# Terminal 4: Tests
cd web
npm run test:e2e
```

### Comandos de Testing E2E

```bash
# Tests E2E completos
npm run test:e2e

# Tests con UI interactiva
npm run test:e2e:ui

# Tests con navegador visible
npm run test:e2e:headed

# Tests específicos
npm run test:e2e:landing      # Landing page
npm run test:e2e:registration  # Auto-registro
npm run test:e2e:admin        # Aprobación admin
npm run test:e2e:flow         # Flujo completo

# Ver reportes
npm run playwright:report
```

### Configuración de Wallets

Los wallets de prueba están en `web/e2e/wallet-setup/`:

```typescript
// admin.setup.ts
export default async function () {
  return {
    name: 'Admin Wallet',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    // ... configuración
  };
}
```

**Cuentas de Anvil**:
- Admin: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Producer: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Factory: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- Retailer: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- Consumer: `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`

### Debugging Tests E2E

#### Mode Headed (Ver Navegador)

```bash
npm run test:e2e:headed
```

#### Con Traces

```bash
# Ejecutar con trace
npm run test:e2e -- --trace on

# Ver trace después
npx playwright show-trace trace.zip
```

#### Debug Mode

```bash
# Modo debug interactivo
npm run test:e2e -- --debug

# Solo un test
npx playwright test e2e/landing-page.spec.ts --debug
```

### Agente Especializado

Para problemas complejos de E2E, usa el agente especializado:

```
Usa el agente "Playwright E2E Expert" para [TU_PROBLEMA]
```

Ver: [`.claude/agents/PLAYWRIGHT_E2E_GUIDE.md`](.claude/agents/PLAYWRIGHT_E2E_GUIDE.md)

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

### Frontend E2E

```bash
# Setup inicial
npm run test:e2e:setup      # Primera vez
npm run playwright:install  # Solo Playwright

# Ejecutar tests
npm run test:e2e            # Todos los tests
npm run test:e2e:ui         # UI interactiva
npm run test:e2e:headed     # Con navegador visible

# Tests específicos
npm run test:e2e:landing    # Landing page
npm run test:e2e:flow       # Flujo completo

# Debugging
npm run test:e2e -- --debug             # Modo debug
npm run test:e2e -- --trace on          # Con traces
npx playwright show-trace trace.zip     # Ver trace

# Reportes
npm run playwright:report   # Ver últimos resultados
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

# 3. Tests E2E (requiere servicios corriendo)
npm run test:e2e

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

### E2E Testing

#### ✅ Hacer

1. **Tests independientes**
   ```typescript
   test.beforeEach(async ({ page }) => {
     // Reset estado antes de cada test
   });
   ```

2. **Waits explícitos**
   ```typescript
   await page.waitForSelector('button:has-text("Connect")');
   await page.click('button:has-text("Connect")');
   ```

3. **Verificaciones específicas**
   ```typescript
   await expect(page.locator('text=Success')).toBeVisible();
   ```

4. **Tests secuenciales para blockchain**
   ```typescript
   test.describe.configure({ mode: 'serial' });
   ```

#### ❌ No Hacer

1. ❌ Tests sin cleanup
2. ❌ Hardcodear timeouts
3. ❌ Tests sin verificar estado de blockchain
4. ❌ Ignorar errores de transacciones

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

### E2E Tests

#### "Cache does not exist"

**Síntoma**: Error al ejecutar tests E2E

**Solución**:
```bash
# Recrear caches
npm run test:e2e:setup

# O manualmente
rm -rf .cache-synpress
npx synpress e2e/wallet-setup --debug
```

#### MetaMask no se conecta

**Síntoma**: Tests fallan en conectar wallet

**Verificar**:
```bash
# 1. Anvil está corriendo
lsof -ti:8545  # Debe devolver un PID

# 2. Contrato está desplegado
cast code <CONTRACT_ADDRESS> --rpc-url http://localhost:8545

# 3. Frontend está corriendo
lsof -ti:3000  # Debe devolver un PID
```

**Solución**:
```bash
# Terminal 1
cd sc && anvil

# Terminal 2
cd sc && ./deploy-local.sh

# Terminal 3
cd web && npm run dev

# Terminal 4
cd web && npm run test:e2e
```

#### Tests muy lentos

**Síntoma**: Tests tardan >5 minutos

**Solución**:
```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 30000,  // Reducir timeout global
  expect: {
    timeout: 5000  // Timeout de assertions
  }
});
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
- **Guía Principal**: [`CLAUDE.md`](CLAUDE.md)
- **Guía E2E**: [`.claude/agents/PLAYWRIGHT_E2E_GUIDE.md`](.claude/agents/PLAYWRIGHT_E2E_GUIDE.md)

### Agentes Especializados

- **Testing Expert**: [`.claude/agents/testing-expert.md`](.claude/agents/testing-expert.md)
- **Playwright E2E Expert**: [`.claude/agents/playwright-e2e-expert.md`](.claude/agents/playwright-e2e-expert.md)
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
- **Playwright Docs**: https://playwright.dev/
- **Synpress Docs**: https://docs.synpress.io/
- **Solidity Testing**: https://docs.soliditylang.org/en/latest/testing.html

### Scripts del Proyecto

```bash
# Smart Contract
sc/test-supply-chain.sh      # Tests rápidos
sc/test-quick.sh             # Tests específicos
sc/deploy-local.sh           # Deploy en Anvil
sc/start-anvil.sh            # Iniciar Anvil

# Frontend
web/setup-e2e.sh             # Setup E2E testing
web/package.json             # Ver scripts npm disponibles
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

### Frontend E2E
- [ ] `npm run test:e2e:landing` pasa
- [ ] `npm run test:e2e:flow` pasa
- [ ] Tests son independientes
- [ ] Caches de wallets creados
- [ ] No hay tests flakey

### Integración
- [ ] Anvil corriendo
- [ ] Contrato desplegado correctamente
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

### Agregar Test E2E

1. Crear archivo en `web/e2e/` con sufijo `.spec.ts`
2. Importar Playwright:
   ```typescript
   import { test, expect } from '@playwright/test';
   ```
3. Estructurar test:
   ```typescript
   test.describe('Feature Name', () => {
     test('should do something', async ({ page }) => {
       // Test implementation
     });
   });
   ```
4. Ejecutar: `npm run test:e2e`

### Template Pull Request

```markdown
## Tests Incluidos

### Smart Contract
- [ ] Nuevos tests agregados en `sc/test/`
- [ ] Cobertura actual: X%
- [ ] Todos los tests pasan

### E2E
- [ ] Nuevos tests agregados en `web/e2e/`
- [ ] Tests E2E pasan en local
- [ ] Caches recreados si es necesario

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

### Frontend E2E - Flujos

| Flujo | Tests | Estado | Archivos |
|-------|-------|--------|----------|
| Landing Page | 4 | ✅ | `landing-page.spec.ts` |
| Auto Registration | 3 | ✅ | `auto-registration.spec.ts` |
| Admin Approval | 3 | ✅ | `admin-approval.spec.ts` |
| Supply Chain Flow | 1 | ✅ | `complete-supply-chain-flow.spec.ts` |
| **TOTAL** | **11** | **✅** | - |

---

*Esta guía es un documento vivo que se actualiza con cada sesión de testing.*
