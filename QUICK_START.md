# 🚀 Quick Start Guide - Supply Chain Tracking

Guía rápida para arrancar todo el sistema end-to-end.

## ✅ Pre-requisitos

- [x] Foundry instalado (forge, anvil, cast)
- [x] Node.js v18+ y npm
- [x] Docker y Docker Compose
- [x] Git

## 📦 Estado Actual del Proyecto

### ✅ Completados (75%)

1. **Smart Contracts** ✅

   - Compilados y testeados
   - Deployados a Anvil
   - Address: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

2. **Kafka** ✅

   - Docker Compose configurado
   - 7 topics creados automáticamente

3. **Off-Chain Monitor** ✅
   - Código implementado
   - Configurado con contract address

### ⏳ Pendientes (25%)

4. **Backend Services** (0%)

   - 7 microservicios Node.js

5. **Frontend** (50%)
   - Scaffolding básico listo
   - Falta implementación

---

## 🎯 Arrancar Sistema Completo

### Terminal 1: Blockchain (Anvil)

```bash
# Desde el root del proyecto
anvil
```

**Salida esperada**:

```
Listening on 127.0.0.1:8545
```

El contrato ya está deployado en: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

---

### Terminal 2: Kafka

```bash
cd kafka
docker-compose up
```

**Verificar** en http://localhost:8080 (Kafka UI)

---

### Terminal 3: Off-Chain Monitor

```bash
cd off-chain-monitor

# Instalar dependencias (primera vez)
npm install

# Arrancar
npm start
```

**Salida esperada**:

```
🚀 Starting Off-Chain Monitor...
📡 RPC URL: http://localhost:8545
📝 Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ Connected to Kafka
📦 Starting from block: X
```

---

## 🧪 Test Manual - Crear Tokens

### 1. Crear un token COSECHA (como Agricultor)

```bash
# Usar la cuenta 1 de Anvil (Agricultor)
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "createToken()" \
  --rpc-url http://localhost:8545 \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**Verificar** en los logs del off-chain monitor:

```
🆕 New Token Created:
   Token ID: 1
   Type: COSECHA
   Producer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

### 2. Crear otro token COSECHA

```bash
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "createToken()" \
  --rpc-url http://localhost:8545 \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**El monitor debería detectar** 2 tokens COSECHA y publicar a Kafka:

```
📤 Published to Kafka:
   Topic: cosecha-event
   Payload: { tokenId1: 1, tokenId2: 2, ... }
```

### 3. Ver el evento en Kafka UI

1. Abrir http://localhost:8080
2. Ir a Topics → `cosecha-event`
3. Ver el mensaje publicado

---

## 🔍 Comandos Útiles

### Ver token por ID

```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "getTokenMetadata(uint256)" \
  1 \
  --rpc-url http://localhost:8545
```

### Ver owner de un token

```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "ownerOf(uint256)" \
  1 \
  --rpc-url http://localhost:8545
```

### Ver rol de una cuenta

```bash
# Ejemplo: verificar que 0x70997970... es AGRICULTOR (0)
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "roles(address)" \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  --rpc-url http://localhost:8545
```

### Ver eventos en tiempo real

```bash
cast logs \
  --address 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  --rpc-url http://localhost:8545 \
  --follow
```

---

## 📊 Flujo Actual (Sin Backend Services)

```
1. Usuario crea token COSECHA manualmente (con cast)
                    ↓
2. Token se guarda en blockchain (Anvil)
                    ↓
3. Off-Chain Monitor detecta el token (polling cada 1s)
                    ↓
4. Monitor mantiene estado en memoria
                    ↓
5. Cuando hay 2 tokens COSECHA → publica a Kafka
                    ↓
6. ⏳ Backend Service ALMACEN (PENDIENTE) consumiría el evento
                    ↓
7. ⏳ Crearía token ALMACEN con los 2 padres COSECHA
```

---

## 🎯 Próximo Paso: Backend Services

### Servicio COSECHA (auto-generador)

Este será especial porque **NO consume Kafka**, sino que **genera automáticamente** 1 token/segundo.

```javascript
// backend/services/cosecha/index.js
setInterval(async () => {
  const tx = await contract.createToken();
  console.log("Token COSECHA creado:", tx.hash);
}, 1000); // Cada 1 segundo
```

### Servicios ALMACEN, MOLIENDA, etc. (consumidores)

Estos **consumen eventos de Kafka** y **crean tokens** cuando reciben 2 padres.

```javascript
// backend/services/almacenamiento/index.js
consumer.run({
  eachMessage: async ({ message }) => {
    const { tokenId1, tokenId2 } = JSON.parse(message.value);
    const tx = await contract.createTokenWithParents(tokenId1, tokenId2);
    console.log("Token ALMACEN creado:", tx.hash);
  },
});
```

---

## 📝 Cuentas de Anvil (Recordatorio)

| Account | Rol          | Private Key (primeros 20 chars) |
| ------- | ------------ | ------------------------------- |
| 0       | Owner        | `0xac0974bec39a17e36b...`       |
| 1       | AGRICULTOR   | `0x59c6995e998f97a5a0...`       |
| 2       | ALMACENADOR  | `0x5de4111afa1a4b9490...`       |
| 3       | MOLINERO     | `0x7c852118294e51e653...`       |
| 4       | HORNEADOR    | `0x47e179ec197488593b...`       |
| 5       | EMBALADOR    | `0x8b3a350cf5c34c9194...`       |
| 6       | DISTRIBUIDOR | `0x92db14e403b83dfe3d...`       |
| 7       | VENDEDOR     | `0x4bbbf85ce3377467af...`       |

---

## 🐛 Troubleshooting

### Anvil no arranca

```bash
# Matar procesos en puerto 8545
lsof -ti:8545 | xargs kill -9
anvil
```

### Kafka no arranca

```bash
cd kafka
docker-compose down
docker-compose up
```

### Monitor no conecta

Verificar que `CONTRACT_ADDRESS` en `off-chain-monitor/.env` es correcto:

```
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

## ✅ Checklist de Verificación

- [ ] Anvil corriendo en puerto 8545
- [ ] Contrato deployado (verificar con `cast call`)
- [ ] Kafka corriendo (verificar http://localhost:8080)
- [ ] 7 topics creados en Kafka
- [ ] Off-chain monitor corriendo y conectado
- [ ] Puedo crear tokens con `cast send`
- [ ] Monitor detecta los tokens creados
- [ ] Monitor publica a Kafka cuando hay 2 tokens

---

**Estado**: ✅ Blockchain, Kafka y Monitor operativos  
**Siguiente**: Implementar Backend Services (7 microservicios)  
**Progreso**: 75% completo
