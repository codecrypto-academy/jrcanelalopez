# 🌾 Servicio COSECHA

Servicio que auto-genera tokens COSECHA cada segundo en la blockchain.

## 🎯 Función

Este servicio es **especial** porque:

- **NO consume eventos de Kafka** (a diferencia de los otros 6 servicios)
- **Auto-genera tokens** automáticamente cada 1 segundo
- Usa la cuenta **AGRICULTOR** (Anvil account 1)
- Crea tokens de tipo **COSECHA** sin padres

## 🚀 Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` (ya está configurado por defecto):

```bash
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PRIVATE_KEY=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
INTERVAL=1000  # 1 segundo
```

### 3. Asegurar pre-requisitos

Antes de arrancar el servicio, asegúrate de que:

✅ **Anvil está corriendo**:

```bash
# En otro terminal
anvil
```

✅ **Contrato deployado**:

```
Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 4. Arrancar servicio

```bash
npm start
```

## 📊 Output Esperado

```
🌾 Starting COSECHA Service...
📡 RPC URL: http://localhost:8545
📝 Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
⏱️  Interval: 1000ms (1s per token)

🔑 Wallet Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
💰 Balance: 10000.0 ETH

✅ Ready to start creating COSECHA tokens!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2024-10-14T20:00:00.000Z] 🌱 Creating COSECHA token...
   📤 Transaction sent: 0x1234...
   ✅ Token created successfully!
   🆔 Token ID: 1
   ⛽ Gas used: 144160
   📊 Total tokens created: 1

[2024-10-14T20:00:01.000Z] 🌱 Creating COSECHA token...
   📤 Transaction sent: 0x5678...
   ✅ Token created successfully!
   🆔 Token ID: 2
   ⛽ Gas used: 144160
   📊 Total tokens created: 2

...
```

## 🔍 Verificar Tokens Creados

### Ver token por ID

```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "getTokenMetadata(uint256)" \
  1 \
  --rpc-url http://localhost:8545
```

### Ver owner del token

```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "ownerOf(uint256)" \
  1 \
  --rpc-url http://localhost:8545
```

Resultado esperado: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (AGRICULTOR)

## ⚙️ Configuración

### Cambiar intervalo

Editar `INTERVAL` en `.env`:

```bash
INTERVAL=2000  # 2 segundos por token
INTERVAL=5000  # 5 segundos por token
```

## 🛑 Parar el Servicio

```bash
# Ctrl+C en el terminal donde está corriendo

# Salida al parar:
🛑 Shutting down COSECHA service...
📊 Final stats:
   Total tokens created: 42
   Last token ID: 42

✅ Service stopped
```

## 📊 Stats

El servicio mantiene estadísticas en memoria:

- `tokensCreated`: Total de tokens creados
- `lastTokenId`: ID del último token creado

## 🔐 Cuenta Utilizada

| Propiedad       | Valor                                                                |
| --------------- | -------------------------------------------------------------------- |
| Rol             | AGRICULTOR                                                           |
| Address         | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`                         |
| Private Key     | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| Balance inicial | 10,000 ETH (Anvil)                                                   |

**⚠️ NOTA**: Esta private key es SOLO para desarrollo local con Anvil. NUNCA usar en producción.

## 🐛 Troubleshooting

### Error: Wallet no tiene rol AGRICULTOR

```
❌ Contract reverted. Possible reasons:
   - Wallet no tiene rol AGRICULTOR
```

**Solución**: Verificar que el contrato fue deployado correctamente y que la cuenta tiene el rol asignado:

```bash
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "roles(address)" \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  --rpc-url http://localhost:8545
```

Debe retornar `0` (Role.AGRICULTOR)

### Error: Connection refused

```
Error: error sending request for url (http://localhost:8545/)
```

**Solución**: Anvil no está corriendo. Arrancar en otro terminal:

```bash
anvil
```

### Error: Wallet sin fondos

```
❌ Wallet sin fondos. No se pueden enviar transacciones.
```

**Solución**: Esto no debería pasar con Anvil (todas las cuentas tienen 10,000 ETH). Verificar que estás conectado a Anvil y no a otra red.

## 📈 Flujo Completo

```
1. Servicio COSECHA arranca
              ↓
2. Cada 1 segundo llama a contract.createToken()
              ↓
3. Token COSECHA guardado en blockchain
              ↓
4. Off-Chain Monitor detecta el evento
              ↓
5. Cuando hay 2 tokens COSECHA → publica a Kafka
              ↓
6. Servicio ALMACEN consume el evento (próximo a implementar)
```

## 🎯 Siguiente Paso

Una vez que este servicio esté corriendo y generando tokens, implementaremos el **Servicio ALMACEN** que:

- Consume eventos `cosecha-event` de Kafka
- Crea tokens ALMACEN con 2 padres COSECHA
- Usa la cuenta ALMACENADOR (Anvil account 2)

---

**Estado**: ✅ Implementado y listo para usar  
**Dependencias**: Anvil + Contrato deployado  
**Next**: Servicio ALMACEN (consumer de Kafka)
