# Guía Rápida: Playwright E2E Expert Agent

## 🎯 Propósito

El **Playwright E2E Expert** es tu especialista en resolver problemas de tests E2E con Playwright y Synpress para DApps Web3. Este agente contiene todo el conocimiento adquirido sobre:

- Configuración de Synpress v4
- Resolución de errores de cache de wallets
- Setup multi-wallet para testing
- Debugging de tests E2E complejos
- Integración MetaMask + Blockchain + Frontend

## 🚀 Cómo Usar Este Agente

### Sintaxis

```
Usa el agente "Playwright E2E Expert" para [TU_PROBLEMA_O_TAREA]
```

### Ejemplos de Uso

#### 1. Configurar Tests E2E desde Cero

```
Usa el agente "Playwright E2E Expert" para configurar tests E2E
con Synpress para mi DApp. Necesito testear flujos con 3 wallets
diferentes (Admin, User1, User2)
```

**El agente te ayudará con:**
- Instalación de Playwright y Synpress
- Crear archivos wallet-setup correctamente
- Configurar playwright.config.ts
- Crear el primer test funcional

#### 2. Resolver Error "Cache does not exist"

```
Usa el agente "Playwright E2E Expert" para resolver el error
"Cache for 771c1929db3cac884545 does not exist" en mis tests
```

**El agente:**
- Diagnosticará el problema específico
- Te dará comandos exactos para solucionarlo
- Verificará que la solución funcione

#### 3. Crear Tests Multi-Wallet

```
Usa el agente "Playwright E2E Expert" para crear un test que simule
el flujo completo: Producer crea token → Factory lo procesa →
Retailer lo distribuye → Consumer lo recibe
```

**El agente creará:**
- 4 wallet setup files
- Test con los 4 roles interactuando
- Verificaciones de estado en cada paso

#### 4. Debugging de Tests Fallidos

```
Usa el agente "Playwright E2E Expert" para debuggear por qué
mi test de transferencia falla con "Transaction reverted"
```

**El agente analizará:**
- Logs de Playwright
- Estado del contrato
- Configuración de red
- Secuencia de transacciones

#### 5. Optimizar Tests E2E

```
Usa el agente "Playwright E2E Expert" para optimizar mis tests E2E
que tardan 5 minutos en ejecutarse
```

**El agente sugerirá:**
- Reutilización de caches
- Paralelización segura
- Reducción de timeouts
- Mejores prácticas

## 🔍 Qué Sabe Este Agente

### Conocimiento Técnico
- ✅ Synpress v4 arquitectura y API
- ✅ Playwright fixtures y configuración
- ✅ MetaMask extension testing
- ✅ Wallet setup files y cache system
- ✅ Testing con Anvil/Hardhat
- ✅ Debugging con headed mode, traces, videos
- ✅ Multi-wallet testing patterns

### Errores Comunes que Resuelve
- ❌ "Cache does not exist"
- ❌ "Playwright not found"
- ❌ "Extension not loading"
- ❌ "Transaction reverted"
- ❌ "Network not configured"
- ❌ "Wallet setup files must end with .setup.ts"

### Scripts y Comandos
- Comandos de instalación de Playwright
- Scripts de creación de cache
- Configuraciones de playwright.config.ts
- Setup de wallets con seed phrases y private keys
- Testing patterns para Web3

## 📋 Checklist de Troubleshooting

Cuando uses este agente, él verificará automáticamente:

1. ✅ ¿Está Anvil/Hardhat corriendo?
2. ✅ ¿Está el contrato desplegado?
3. ✅ ¿Playwright está instalado correctamente?
4. ✅ ¿Existen los caches de wallets?
5. ✅ ¿Los archivos de setup están bien nombrados?
6. ✅ ¿El frontend está corriendo?
7. ✅ ¿La configuración de red es correcta?

## 🎓 Lecciones Aprendidas (Esta Sesión)

### Problema 1: Cache Creation Failure
**Error**: `Cache for 771c1929db3cac884545 does not exist`

**Causa**: Playwright no instalado en los node_modules internos de Synpress

**Solución**:
```bash
# Opción 1: Instalar en el directorio correcto
cd node_modules/@synthetixio/synpress/node_modules/@synthetixio/synpress-cache
npx playwright install chromium

# Opción 2: Script automatizado
bash setup-e2e.sh
```

### Problema 2: Wrong File in wallet-setup/
**Error**: `All wallet setup files must end with .setup.{ts,js,mjs}`

**Causa**: Archivo adicional en `e2e/wallet-setup/` que no es un setup

**Solución**:
- Solo archivos `.setup.ts` en ese directorio
- Mover otros archivos fuera (ej: `setup-wallets.spec.ts` → `e2e/setup-wallets.spec.ts`)

### Problema 3: Hash Mismatch
**Error**: Cache hash diferente al esperado

**Solución**:
```bash
# Limpiar y recrear
rm -rf .cache-synpress
npx synpress e2e/wallet-setup --debug --force
```

## 🛠️ Recursos Creados

Durante esta sesión se crearon:

1. **`web/setup-e2e.sh`** - Script automatizado de instalación
2. **`web/README_E2E_TESTS.md`** - Documentación de troubleshooting
3. **`web/e2e/wallet-setup/*.setup.ts`** - 5 wallet setups configurados
4. **`.claude/agents/playwright-e2e-expert.md`** - Este agente
5. **Scripts en package.json**:
   - `test:e2e:setup` - Ejecuta setup completo
   - `test:e2e:cache` - Solo crea caches
   - `test:e2e:flow` - Ejecuta tests de flujo completo

## 💡 Mejores Prácticas

### ✅ Hacer

1. **Siempre crear caches antes de tests**
   ```bash
   npm run test:e2e:setup  # Primera vez
   npm run test:e2e:flow   # Ejecutar tests
   ```

2. **Usar --debug para troubleshooting**
   ```bash
   npx synpress e2e/wallet-setup --debug
   ```

3. **Mantener wallet-setup/ limpio**
   - Solo archivos `.setup.ts`
   - Nombres descriptivos (admin.setup.ts, producer.setup.ts)

4. **Tests secuenciales para blockchain**
   ```typescript
   test.describe.configure({ mode: 'serial' });
   ```

### ❌ No Hacer

1. ❌ No poner tests en `e2e/wallet-setup/`
2. ❌ No correr tests sin crear caches primero
3. ❌ No olvidar verificar que Anvil esté corriendo
4. ❌ No ignorar errores de cache (no se auto-resuelven)

## 🔗 Referencias Rápidas

- **Synpress Docs**: https://docs.synpress.io
- **Playwright Docs**: https://playwright.dev
- **Web3 Testing Guide**: `web/README_E2E_TESTS.md`
- **Setup Script**: `web/setup-e2e.sh`
- **Este Agente**: `.claude/agents/playwright-e2e-expert.md`

## 📞 Cuándo NO Usar Este Agente

Este agente es específico para **tests E2E con navegador**. NO uses este agente para:

- ❌ Tests unitarios del smart contract → Usa **Testing Expert**
- ❌ Tests de integración sin navegador → Usa **Frontend Testing Expert**
- ❌ Desarrollo de frontend → Usa **Frontend Expert**
- ❌ Debugging del smart contract → Usa **Debug Detective**
- ❌ Configuración de Foundry → Usa **Deploy Manager**

## 🎯 Resultado Esperado

Después de usar este agente exitosamente:

- ✅ Caches creados en `.cache-synpress/`
- ✅ Tests E2E ejecutándose sin errores
- ✅ MetaMask conectándose correctamente
- ✅ Transacciones confirmándose en tests
- ✅ Flujos multi-wallet funcionando

## 📝 Template de Consulta

```
Usa el agente "Playwright E2E Expert" para:

**Problema/Tarea**: [Describe qué necesitas]

**Contexto**:
- Proyecto: [DApp Web3 / Supply Chain / etc]
- Stack: [Next.js, Anvil, Foundry, etc]
- Error (si aplica): [Mensaje de error completo]

**Objetivo**: [Qué quieres lograr]
```

---

**Última actualización**: 23 de octubre de 2025
**Versión**: 1.0
**Agente creado en sesión**: Session 2025-10-23 con resolución de cache issues
