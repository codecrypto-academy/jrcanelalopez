# Testing Guide - Supply Chain Tracker

## Frontend Integration Tests

Este proyecto incluye tests de integración end-to-end para verificar el flujo completo del frontend con el smart contract.

### Tests Disponibles

#### 1. Frontend Flow Test (`test-frontend-flow.mjs`)

**Descripción**: Prueba el flujo completo de auto-registro de un usuario no-admin.

**Escenario de Prueba**:
1. Una cuenta que NO es admin solicita registrarse como Producer
2. El admin aprueba la solicitud
3. Cuando la cuenta vuelve a conectarse, el sistema la reconoce como Producer aprobado

**Comando**:
```bash
npm run test:frontend-flow
```

**Salida Esperada**:
```
✅ ALL TESTS PASSED

Test Flow Summary:
  1. ✅ Non-admin user requested Producer role via requestUserRole()
  2. ✅ Admin approved registration via changeStatusUser()
  3. ✅ User reconnects and system recognizes them as Producer with Approved status
```

**Cuenta Utilizada**:
- **Candidato a Producer**: Account 7 de Anvil
  - Address: `0x976EA74026E726554dB657fA54763abd0C3a0aa9`
  - Private Key: `0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356`

#### 2. Self-Registration Test (`test-self-registration.mjs`)

**Descripción**: Prueba múltiples auto-registros y aprobaciones por parte del admin.

**Escenario de Prueba**:
1. Producer, Factory y Retailer se auto-registran
2. Admin aprueba a todos
3. Verifica que todos queden con estado Approved

**Comando**:
```bash
npm run test:self-registration
```

**Salida Esperada**:
```
✅ Producer self-registered
✅ Factory self-registered
✅ Retailer self-registered
✅ Producer approved by admin
✅ Factory approved by admin
✅ Retailer approved by admin
```

## Requisitos Previos

### 1. Anvil Corriendo

Asegúrate de que Anvil esté corriendo en el puerto 8545:

```bash
# Terminal 1: Iniciar Anvil
anvil
```

### 2. Contrato Desplegado

El contrato debe estar desplegado en Anvil:

```bash
# Terminal 2: Desplegar contrato
cd sc
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Copiar la dirección del contrato desplegado
# Actualizar web/.env.local con la nueva dirección
```

### 3. Variables de Entorno

Verifica que `web/.env.local` tenga la dirección correcta del contrato:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

## Ejecutar Todos los Tests

```bash
# Ejecutar todos los tests del proyecto
npm test

# O ejecutarlos individualmente
npm run test:frontend-flow      # Test de flujo completo
npm run test:self-registration  # Test de auto-registro múltiple
```

## Estructura de un Test

Los tests están escritos en JavaScript modular (`.mjs`) y utilizan:

- **ethers.js v6**: Para interactuar con el smart contract
- **Node.js**: Como runtime
- **Anvil RPC**: Blockchain local para pruebas

### Ejemplo de Test

```javascript
import { ethers } from 'ethers';

// Setup
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

// Test
const tx = await contract.requestUserRole('Producer');
await tx.wait();

const userInfo = await contract.getUserInfo(userAddress);
assert(userInfo.role === 'Producer');
```

## Verificación Manual

Si los tests automáticos fallan, puedes verificar manualmente con `cast`:

### Verificar Usuario Registrado

```bash
cast call $CONTRACT_ADDRESS \
  "getUserInfo(address)" \
  0x976EA74026E726554dB657fA54763abd0C3a0aa9 \
  --rpc-url http://localhost:8545
```

### Verificar Admin

```bash
cast call $CONTRACT_ADDRESS \
  "isAdmin(address)(bool)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url http://localhost:8545
```

### Ver Eventos del Contrato

```bash
cast logs \
  --address $CONTRACT_ADDRESS \
  "UserRoleRequested(address,string)" \
  --rpc-url http://localhost:8545
```

## Troubleshooting

### Error: "Cannot find module 'ethers'"

```bash
# Instalar dependencias en el root del proyecto
npm install
```

### Error: "execution reverted: UserDoesNotExist"

**Causa**: El usuario aún no está registrado en el contrato

**Solución**: El test se encarga de registrar al usuario automáticamente. Si persiste, verifica que el contrato esté desplegado correctamente.

### Error: "Connection refused"

**Causa**: Anvil no está corriendo

**Solución**:
```bash
# Iniciar Anvil en otra terminal
anvil
```

### Error: "Contract not deployed"

**Causa**: La dirección del contrato en el test no coincide con el contrato desplegado

**Solución**:
1. Verifica la dirección en `web/.env.local`
2. Actualiza `CONTRACT_ADDRESS` en el test si es necesario
3. Redesplegar si es necesario

## Tests del Smart Contract (Foundry)

Además de los tests de integración frontend, el proyecto tiene tests unitarios del smart contract:

```bash
cd sc

# Ejecutar tests del contrato
forge test

# Con trazas detalladas
forge test -vvv

# Test específico
forge test --match-test testCreateToken

# Cobertura
forge coverage
```

### Tests Obligatorios del Contrato

El smart contract debe pasar al menos 43 tests cubriendo:

1. **Gestión de Usuarios** (7 tests)
2. **Creación de Tokens** (8 tests)
3. **Transferencias** (8 tests)
4. **Validaciones y Permisos** (6 tests)
5. **Casos Edge** (5 tests)
6. **Eventos** (6 tests)
7. **Flujos Completos** (3 tests)

## Continuous Integration (CI)

Para configurar CI/CD, añade estos pasos a tu pipeline:

```yaml
# Ejemplo para GitHub Actions
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Start Anvil
        run: anvil &

      - name: Deploy contract
        run: |
          cd sc
          forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

      - name: Run Smart Contract Tests
        run: |
          cd sc
          forge test

      - name: Run Frontend Integration Tests
        run: |
          npm run test:frontend-flow
          npm run test:self-registration
```

## Métricas de Calidad

### Cobertura Mínima

- **Smart Contract**: 80% de cobertura de líneas
- **Frontend Integration**: Todos los flujos principales cubiertos

### Criterios de Aprobación

✅ Todos los tests deben pasar
✅ Sin errores de compilación
✅ Sin warnings críticos
✅ Cobertura mínima alcanzada

## Próximos Tests a Implementar

- [ ] Test de creación de tokens por Producer
- [ ] Test de flujo completo de transferencias (Producer → Factory → Retailer → Consumer)
- [ ] Test de rechazo de transferencias
- [ ] Test de validación de flujo de roles
- [ ] Test de pausado del contrato por admin
- [ ] Tests E2E con Playwright + MetaMask
- [ ] Tests de performance con múltiples usuarios concurrentes

## Referencias

- [Documentación de ethers.js](https://docs.ethers.org/v6/)
- [Foundry Testing](https://book.getfoundry.sh/forge/tests)
- [Anvil Local Node](https://book.getfoundry.sh/anvil/)
- [Testing Smart Contracts](https://ethereum.org/en/developers/docs/smart-contracts/testing/)

---

**Última actualización**: 2025-10-22
**Versión**: 1.0
