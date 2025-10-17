# Testing Guide - Supply Chain Tracker

Esta guía explica cómo deployar y testear el contrato Supply Chain usando Anvil y cast.

## 📋 Prerequisitos

- Foundry instalado (`forge`, `anvil`, `cast`)
- `jq` instalado (para parsear JSON)
- Terminal Unix/Linux o Git Bash en Windows

```bash
# Verificar instalaciones
forge --version
anvil --version
cast --version
jq --version
```

## 🚀 Quick Start (3 pasos)

### Terminal 1: Iniciar Anvil

```bash
cd sc
./start-anvil.sh
```

Deja esta terminal abierta. Anvil creará 10 cuentas con 10,000 ETH cada una.

### Terminal 2: Deploy y Test

```bash
cd sc

# 1. Deploy el contrato
./deploy-local.sh

# 2. Ejecutar tests completos (recomendado)
./test-supply-chain.sh

# Alternativamente: test rápido (solo lo básico)
./test-quick.sh
```

## 📁 Scripts Disponibles

### `start-anvil.sh`
Inicia una blockchain local de Ethereum con Anvil.

**Configuración:**
- Puerto: 8545
- Chain ID: 31337
- 10 cuentas con 10,000 ETH cada una
- Block time: 1 segundo

**Cuentas predefinidas:**
```
Admin:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Producer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Factory:  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Retailer: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Consumer: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
```

### `deploy-local.sh`
Deploya el contrato `SupplyChain.sol` en Anvil.

**Qué hace:**
1. Verifica conexión con Anvil
2. Compila los contratos con `forge build`
3. Ejecuta el script de deploy `DeployLocal.s.sol`
4. Guarda la dirección del contrato en `./deployments/local.json`

**Output:**
```json
{
  "SupplyChain": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "Owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "ChainId": "31337",
  "Network": "anvil-local",
  "Timestamp": "1729187000",
  "BlockNumber": "1"
}
```

### `test-supply-chain.sh`
Script completo de testing que simula el flujo completo de la supply chain.

**Flujo testeado:**
1. **Verificación inicial**: Estado del contrato, owner, paused
2. **Registro de usuarios**: Producer, Factory, Retailer, Consumer
3. **Aprobación por Admin**: Todos los usuarios aprobados
4. **Creación de materia prima**: Producer crea "Raw Cotton" (1000 unidades)
5. **Producer → Factory**: Transferencia de 500 unidades
6. **Producto derivado**: Factory crea "Cotton Fabric" (250 unidades)
7. **Factory → Retailer**: Transferencia de 100 unidades
8. **Retailer → Consumer**: Transferencia final de 50 unidades
9. **Trazabilidad**: Verifica el rastreo completo del producto
10. **Pausable**: Testa pause/unpause del contrato

**Gas estimado total**: ~2.5M gas para todo el flujo

**Output esperado:**
```
================================================
   SUPPLY CHAIN TRACKER - TESTING SCRIPT
================================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. VERIFICACIÓN DEL ESTADO INICIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Conectado - Bloque actual: 1
ℹ Contract Address: 0x5FbDB2...
ℹ Owner: 0xf39Fd6...
✓ Contract is active (not paused)

...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  RESUMEN DE PRUEBAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Todas las pruebas completadas exitosamente

Flujo completo probado:
  1. ✓ Registro de 4 usuarios
  2. ✓ Aprobación por Admin
  3. ✓ Creación de materia prima
  4. ✓ Transferencia Producer → Factory
  5. ✓ Factory crea producto derivado
  6. ✓ Transferencia Factory → Retailer
  7. ✓ Transferencia Retailer → Consumer
  8. ✓ Trazabilidad completa verificada
  9. ✓ Funcionalidad Pausable testeada

================================================
   Supply Chain funcionando correctamente! 🎉
================================================
```

### `test-quick.sh`
Versión simplificada para testing rápido.

**Qué testea:**
- Registro de usuario (Producer)
- Aprobación por admin
- Creación de token
- Verificación de balance

**Tiempo de ejecución**: ~2-3 segundos

## 🔧 Comandos Cast Útiles

### Verificar estado del contrato

```bash
# Obtener owner
cast call $CONTRACT_ADDRESS "owner()(address)" --rpc-url http://localhost:8545

# Verificar si está pausado
cast call $CONTRACT_ADDRESS "isPaused()(bool)" --rpc-url http://localhost:8545

# Obtener información de usuario
cast call $CONTRACT_ADDRESS \
  "getUserInfo(address)((uint256,address,string,uint8))" \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  --rpc-url http://localhost:8545

# Obtener información de token
cast call $CONTRACT_ADDRESS \
  "getToken(uint256)(uint256,address,string,uint256,string,uint256,uint256)" \
  1 \
  --rpc-url http://localhost:8545

# Verificar balance de token
cast call $CONTRACT_ADDRESS \
  "getTokenBalance(uint256,address)(uint256)" \
  1 \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  --rpc-url http://localhost:8545
```

### Interactuar manualmente

```bash
# Registrar usuario
cast send $CONTRACT_ADDRESS \
  "requestUserRole(string)" \
  "Producer" \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://localhost:8545

# Aprobar usuario (como admin)
cast send $CONTRACT_ADDRESS \
  "changeStatusUser(address,uint8)" \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  1 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545

# Crear token
cast send $CONTRACT_ADDRESS \
  "createToken(string,uint256,string,uint256)" \
  "My Token" \
  1000 \
  '{"key":"value"}' \
  0 \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://localhost:8545

# Transferir tokens
cast send $CONTRACT_ADDRESS \
  "transfer(address,uint256,uint256)" \
  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC \
  1 \
  500 \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://localhost:8545

# Aceptar transferencia
cast send $CONTRACT_ADDRESS \
  "acceptTransfer(uint256)" \
  1 \
  --private-key 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a \
  --rpc-url http://localhost:8545

# Pausar contrato (solo owner)
cast send $CONTRACT_ADDRESS \
  "pause()" \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545

# Despausar contrato (solo owner)
cast send $CONTRACT_ADDRESS \
  "unpause()" \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545
```

## 🎯 Casos de Prueba Cubiertos

### Gestión de Usuarios
- [x] Registro con rol válido
- [x] Registro con rol inválido (debe fallar)
- [x] Usuario duplicado (debe fallar)
- [x] Aprobación por admin
- [x] Rechazo por admin
- [x] Solo admin puede cambiar status

### Tokens
- [x] Producer crea token sin parentId
- [x] Factory crea token con parentId válido
- [x] Producer no puede crear con parentId (debe fallar)
- [x] Factory debe usar parentId (debe fallar si es 0)
- [x] Usuarios no aprobados no pueden crear tokens

### Transferencias
- [x] Producer → Factory (flujo válido)
- [x] Factory → Retailer (flujo válido)
- [x] Retailer → Consumer (flujo válido)
- [x] Producer → Retailer (debe fallar - flujo inválido)
- [x] Consumer → cualquiera (debe fallar)
- [x] Aceptar transferencia
- [x] Rechazar transferencia
- [x] Balance insuficiente (debe fallar)
- [x] Transferencia a sí mismo (debe fallar)

### Pausable
- [x] Solo owner puede pausar
- [x] Solo owner puede despausar
- [x] Operaciones bloqueadas cuando pausado
- [x] Lecturas funcionan cuando pausado

### Trazabilidad
- [x] Rastrear producto desde consumer hasta origen
- [x] Verificar parent IDs correctos
- [x] Historial de transferencias

## 📊 Mediciones de Gas

Operaciones principales (aproximadas):

| Operación | Gas Usado | Notas |
|-----------|-----------|-------|
| Deploy contract | ~3.5M | Una sola vez |
| requestUserRole() | ~180k | Primera vez ~180k, después ~147k |
| changeStatusUser() | ~74k | - |
| createToken() sin parent | ~286k | - |
| createToken() con parent | ~324k | - |
| transfer() | ~308k | Inicia transferencia |
| acceptTransfer() | ~141k | Primera aceptación |
| rejectTransfer() | ~94k | - |
| pause() | ~88k | - |
| unpause() | ~52k | - |

**Flujo completo Producer→Consumer**: ~2.8M gas

## ⚠️ Troubleshooting

### Error: "No se puede conectar con Anvil"
**Solución**: Asegúrate de tener Anvil corriendo en otra terminal:
```bash
./start-anvil.sh
```

### Error: "No se encontró el archivo local.json"
**Solución**: Deploy el contrato primero:
```bash
./deploy-local.sh
```

### Error: "Transaction reverted"
**Causas comunes**:
1. Usuario no aprobado → Verificar con `getUserInfo()`
2. Flujo de roles incorrecto → Verificar Producer→Factory→Retailer→Consumer
3. Balance insuficiente → Verificar con `getTokenBalance()`
4. Contrato pausado → Verificar con `isPaused()`

### Error: "command not found: jq"
**Solución**: Instalar jq:
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Windows (Git Bash)
# Descargar desde https://stedolan.github.io/jq/download/
```

## 🔄 Resetear y empezar de nuevo

```bash
# 1. Detener Anvil (Ctrl+C en la terminal donde corre)

# 2. Limpiar archivos de deploy
rm -rf deployments/

# 3. Reiniciar Anvil
./start-anvil.sh

# 4. Deploy de nuevo
./deploy-local.sh

# 5. Testear
./test-supply-chain.sh
```

## 📚 Referencias

- [Foundry Book](https://book.getfoundry.sh/)
- [Cast Reference](https://book.getfoundry.sh/reference/cast/)
- [Anvil Reference](https://book.getfoundry.sh/reference/anvil/)
- [README.md](../README.md) - Documentación principal del proyecto
- [CLAUDE.md](../CLAUDE.md) - Especificaciones técnicas

---

**Última actualización**: 17 de octubre de 2025
