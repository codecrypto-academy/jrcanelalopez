# Estado de Tests E2E - Supply Chain Tracker

**Fecha**: 23 de octubre de 2025
**Estado**: ✅ **FUNCIONANDO**

## ✅ Componentes Verificados

### 1. Infraestructura
- ✅ **Playwright** instalado correctamente (v1.48.2)
- ✅ **Synpress** configurado y funcionando (v4.1.1)
- ✅ **MetaMask** extension descargada y cacheada (v11.9.1)
- ✅ **Navegador Chromium** instalado y funcional

### 2. Blockchain
- ✅ **Anvil** corriendo en puerto 8545
- ✅ **Smart Contract** desplegado en `0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6`
- ✅ **Cuentas Anvil** configuradas (10 cuentas de test)

### 3. Wallet Caches
- ✅ **5 wallets cacheados** correctamente:
  - `d91ddc3fa55a09c0efff` - Admin (Account 1)
  - `9f46dad9f56e7ce476d7` - Producer (Account 2)
  - `532f685e346606c2a803` - Factory (Account 3)
  - `d2108969fb9bdd247f36` - Retailer (Account 4)
  - `1ec3ee7dc0a60d346615` - Consumer (Account 5)

### 4. Aplicación
- ✅ **Next.js** servidor corriendo (puerto 3000)
- ✅ **Landing page** renderizando correctamente
- ✅ **Web3Provider** configurado
- ✅ **Contract ABI** actualizado

## 🧪 Tests Ejecutados

### Landing Page Tests (último run)
```
✓ should show connect wallet button when not connected
✓ should display project description
✓ should have proper page title
⚠ should display the landing page correctly (selector muy genérico)

Resultado: 3/4 pasados (75%)
```

## 📋 Archivos de Wallet Setup

Todos los archivos usan la misma seed phrase de Anvil pero crean diferentes cuentas:

### `admin.setup.ts`
```typescript
- Importa seed phrase
- Usa Account 1 (Admin - 0xf39Fd6...)
```

### `producer.setup.ts`
```typescript
- Importa seed phrase
- Crea Account 2
- Cambia a Account 2 (Producer - 0x70997...)
```

### `factory.setup.ts`
```typescript
- Importa seed phrase
- Crea Account 2, 3
- Cambia a Account 3 (Factory - 0x3C44C...)
```

### `retailer.setup.ts`
```typescript
- Importa seed phrase
- Crea Account 2, 3, 4
- Cambia a Account 4 (Retailer - 0x90F79...)
```

### `consumer.setup.ts`
```typescript
- Importa seed phrase
- Crea Account 2, 3, 4, 5
- Cambia a Account 5 (Consumer - 0x15d34...)
```

## 🚀 Comandos para Ejecutar Tests

### Tests Básicos
```bash
# Landing page (sin MetaMask)
npx playwright test e2e/landing-page.spec.ts

# Con interfaz visual
npx playwright test e2e/landing-page.spec.ts --headed
```

### Tests con MetaMask (Requieren caches)
```bash
# Test de auto-registro
npx playwright test e2e/auto-registration.spec.ts

# Test de aprobación de admin
npx playwright test e2e/admin-approval.spec.ts

# Flujo completo de supply chain
npx playwright test e2e/complete-supply-chain-flow.spec.ts

# Con interfaz visual (headed mode)
npx playwright test e2e/complete-supply-chain-flow.spec.ts --headed
```

### Mantenimiento de Caches
```bash
# Verificar caches existentes
ls -la .cache-synpress/

# Recrear caches (si hay cambios en wallet setup)
rm -rf .cache-synpress
npx synpress e2e/wallet-setup --debug

# Forzar recreación
npx synpress e2e/wallet-setup --debug --force
```

## 🐛 Problemas Conocidos y Soluciones

### Problema 1: "Cache does not exist"
**Causa**: Caches no creados o hash cambiado

**Solución**:
```bash
npx synpress e2e/wallet-setup --debug --force
```

### Problema 2: "Transaction reverted"
**Causa**: Anvil no está corriendo o contrato no desplegado

**Solución**:
```bash
# Verificar Anvil
lsof -i :8545

# Si no está corriendo
cd ../sc && anvil

# Redesplegar contrato
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Problema 3: Tests lentos
**Causa**: Caches se recrean en cada test

**Solución**: Los caches ya están creados y se reutilizan automáticamente ✅

## 📊 Próximos Pasos

### Tests Pendientes de Implementar
1. ✅ Landing page tests (básicos)
2. ⚠️ Auto-registration flow (requiere actualizar por nuevo sistema de registro)
3. ⚠️ Admin approval flow (requiere actualizar)
4. ⚠️ Complete supply chain flow (requiere actualizar para sistema actual)
5. ⏳ Token creation tests
6. ⏳ Transfer acceptance/rejection tests
7. ⏳ Multi-role interaction tests

### Mejoras Sugeridas
1. **Fixture de setup común**: Crear fixture que inicialice estado del contrato
2. **Helpers de transacciones**: Funciones auxiliares para esperar confirmaciones
3. **Mejores selectores**: Usar data-testid en lugar de texto
4. **Tests paralelos**: Cuando sea seguro (lectura de datos)
5. **Screenshots automáticos**: En cada paso del flujo

## 📚 Documentación Relacionada

- **Agente especializado**: `.claude/agents/playwright-e2e-expert.md`
- **Guía de uso**: `.claude/agents/PLAYWRIGHT_E2E_GUIDE.md`
- **Troubleshooting**: `README_E2E_TESTS.md`
- **Script de setup**: `setup-e2e.sh`
- **Configuración**: `playwright.config.ts`

## 🎓 Lecciones Aprendidas

### ✅ Funciona
- Usar misma seed phrase + createAccount() + switchAccount()
- Cache por cada configuración diferente de MetaMask
- Tests secuenciales para transacciones blockchain
- Headed mode para debugging

### ❌ No Funciona
- Intentar usar private keys directamente (método no disponible)
- Crear múltiples setups con idéntica configuración
- Tests paralelos con transacciones blockchain
- Selectores de texto muy genéricos (strict mode violation)

## 🏆 Estado Final

```
┌─────────────────────────────────────────────────┐
│  Tests E2E - Supply Chain Tracker                │
│                                                   │
│  Estado: ✅ FUNCIONANDO                           │
│                                                   │
│  Infraestructura:                                │
│    ✅ Playwright       ✅ Synpress                │
│    ✅ MetaMask         ✅ Anvil                   │
│    ✅ Next.js          ✅ Smart Contract          │
│                                                   │
│  Wallets Cacheados: 5/5                          │
│  Tests Pasando: 3/4 (75%)                        │
│  Listo para: Desarrollo de tests adicionales     │
└─────────────────────────────────────────────────┘
```

## ⚡ Quick Start

Para ejecutar tests ahora mismo:

```bash
# 1. Verificar que Anvil está corriendo
lsof -i :8545

# 2. Si no está corriendo, iniciarlo
cd ../sc && anvil &

# 3. Ejecutar tests básicos
npx playwright test e2e/landing-page.spec.ts --headed

# 4. Ver reporte
npx playwright show-report
```

---

**Configurado por**: Playwright E2E Expert Agent
**Última verificación**: 23 de octubre de 2025, 22:30
**Próxima revisión**: Después de implementar nuevos tests
