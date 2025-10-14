# Off-Chain Monitor

Monitor que lee la blockchain cada 1 segundo, detecta eventos `TokenCreated` y publica eventos a Kafka según reglas de negocio.

## 🎯 Función

El monitor implementa la lógica de negocio:

- Cuando detecta **2 tokens del mismo tipo** → publica evento para crear el siguiente tipo
- Mantiene estado en memoria de tokens detectados por tipo
- Publica eventos a Kafka para que los servicios backend los consuman

## 📊 Flujo

```
Blockchain (Anvil)
    ↓ (polling cada 1s)
Off-Chain Monitor
    ↓ (detecta 2 tokens COSECHA)
Kafka Topic: cosecha-event
    ↓
Servicio Almacén (consume evento)
    ↓
Crea token ALMACEN en blockchain
    ↓ (loop continues)
...
```

## 🚀 Setup

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Editar `.env` con la dirección del contrato deployado:

```bash
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x... # Dirección del contrato después de deploy
KAFKA_BROKER=localhost:9092
POLL_INTERVAL=1000
```

### 3. Asegurar que Kafka está corriendo

```bash
cd ../kafka
docker-compose up -d
```

### 4. Asegurar que Anvil está corriendo

```bash
anvil
```

### 5. Deploy del Smart Contract

```bash
cd ../smart-contracts
forge script script/DeploySupplyChain.s.sol --rpc-url http://localhost:8545 --broadcast
```

### 6. Arrancar Monitor

```bash
npm start
```

## 📝 Reglas de Negocio Implementadas

| Cuando hay...    | Publica a...         | Para crear...    |
| ---------------- | -------------------- | ---------------- |
| 2 × COSECHA      | `cosecha-event`      | 1 × ALMACEN      |
| 2 × ALMACEN      | `almacen-event`      | 1 × MOLIENDA     |
| 2 × MOLIENDA     | `molienda-event`     | 1 × HORNEADO     |
| 2 × HORNEADO     | `horneado-event`     | 1 × EMBALAJE     |
| 2 × EMBALAJE     | `embalaje-event`     | 1 × DISTRIBUCION |
| 2 × DISTRIBUCION | `distribucion-event` | 1 × VENTA        |

## 📤 Formato de Eventos Publicados

```json
{
  "tokenId1": 123,
  "tokenId2": 456,
  "tokenType": "COSECHA",
  "targetType": "ALMACEN",
  "timestamp": 1699123456789
}
```

## 🔍 Logs de Ejemplo

```
🚀 Starting Off-Chain Monitor...
📡 RPC URL: http://localhost:8545
📝 Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
📨 Kafka Broker: localhost:9092
⏱️  Poll Interval: 1000ms

✅ Connected to Kafka

📦 Starting from block: 1

🔍 Checking blocks 2 to 5...
📢 Found 2 new TokenCreated events

🆕 New Token Created:
   Token ID: 1
   Type: COSECHA
   Producer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
   Parents: [0, 0]
   Timestamp: 2024-01-15T10:30:00.000Z
   ✅ Added to COSECHA pool (total: 1)

🆕 New Token Created:
   Token ID: 2
   Type: COSECHA
   Producer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
   Parents: [0, 0]
   Timestamp: 2024-01-15T10:30:01.000Z
   ✅ Added to COSECHA pool (total: 2)

📤 Published to Kafka:
   Topic: cosecha-event
   Payload: {
     tokenId1: 1,
     tokenId2: 2,
     tokenType: 'COSECHA',
     targetType: 'ALMACEN',
     timestamp: 1699123456789
   }
```

## 🛠️ Comandos de Desarrollo

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start
```

## 🐛 Troubleshooting

### Error: Cannot connect to RPC

```bash
# Verificar que Anvil está corriendo
ps aux | grep anvil

# O arrancarlo
anvil
```

### Error: Cannot connect to Kafka

```bash
# Verificar que Kafka está corriendo
cd ../kafka
docker-compose ps

# O arrancarlo
docker-compose up -d
```

### No detecta eventos

1. Verificar que `CONTRACT_ADDRESS` en `.env` es correcto
2. Verificar que el servicio COSECHA está generando tokens
3. Ver logs detallados del monitor

### Eventos duplicados

El monitor usa un array en memoria que se va vaciando cuando publica eventos. Si reinicias el monitor, volverá a procesar tokens desde el último bloque. Para evitarlo:

- Implementar persistencia de `lastBlockProcessed` en archivo o DB
- O usar `fromBeginning: false` en los consumidores de Kafka

## 📊 Estado en Memoria

El monitor mantiene en memoria los tokens detectados:

```javascript
tokensByType = {
  0: [1, 2], // COSECHA: token IDs 1 y 2
  1: [], // ALMACEN: vacío
  2: [], // MOLIENDA: vacío
  // ...
};
```

Cuando hay 2 tokens, se extraen (`splice`) y se publica el evento.

## 🔐 Seguridad

- **No requiere private key** (solo lee blockchain)
- **No ejecuta transacciones**
- **Solo publica eventos a Kafka**

## 📈 Métricas

Para monitorizar el monitor:

```bash
# Ver mensajes en tiempo real en Kafka UI
http://localhost:8080

# O desde consola
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic cosecha-event \
  --from-beginning
```

## 🔄 Flujo Completo

1. **Blockchain**: Servicio COSECHA crea tokens
2. **Monitor detecta**: Polling cada 1s encuentra TokenCreated events
3. **Monitor aplica regla**: 2 COSECHA → publica a `cosecha-event`
4. **Kafka entrega**: Evento llega a servicio ALMACEN
5. **Servicio ALMACEN**: Consume evento y crea token ALMACEN
6. **Loop**: Monitor detecta nuevo ALMACEN y repite proceso

---

**Siguiente paso**: Implementar los 7 backend services que consumen estos eventos
