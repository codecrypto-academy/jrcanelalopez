# Kafka - Event Bus

Bus de eventos para la comunicación entre el off-chain monitor y los backend services.

## 🚀 Inicio Rápido

```bash
# Arrancar todo el stack de Kafka
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar todo
docker-compose down
```

## 📋 Topics Creados

El contenedor `kafka-init` crea automáticamente 7 topics:

1. `cosecha-event` - Eventos de cosecha (2 tokens COSECHA → trigger ALMACEN)
2. `almacen-event` - Eventos de almacenamiento (2 ALMACEN → trigger MOLIENDA)
3. `molienda-event` - Eventos de molienda (2 MOLIENDA → trigger HORNEADO)
4. `horneado-event` - Eventos de horneado (2 HORNEADO → trigger EMBALAJE)
5. `embalaje-event` - Eventos de embalaje (2 EMBALAJE → trigger DISTRIBUCION)
6. `distribucion-event` - Eventos de distribución (2 DISTRIBUCION → trigger VENTA)
7. `venta-event` - Eventos de venta (producto final)

## 🔍 Kafka UI

Interfaz web para monitorizar Kafka en tiempo real:

- **URL**: http://localhost:8080
- **Funcionalidades**:
  - Ver topics y mensajes
  - Ver consumers activos
  - Inspeccionar offsets
  - Producir mensajes de prueba

## 🏗️ Arquitectura

```
┌─────────────────┐
│ Off-Chain       │
│ Monitor         │────┐
└─────────────────┘    │
                       ▼
           ┌────────────────────┐
           │   Kafka Broker     │
           │  (localhost:9092)  │
           └────────────────────┘
                 │        │
       ┌─────────┴────┐   │
       ▼              ▼   ▼
┌──────────┐   ┌──────────┐   ┌─────────┐
│ Cosecha  │   │ Almacén  │...│  Venta  │
│ Service  │   │ Service  │   │ Service │
└──────────┘   └──────────┘   └─────────┘
```

## 📦 Servicios Docker

### Zookeeper

- **Puerto**: 2181
- **Función**: Coordinación de Kafka

### Kafka

- **Puerto**: 9092 (PLAINTEXT_HOST)
- **Puerto interno**: 29092 (PLAINTEXT)
- **Función**: Message broker principal

### Kafka UI

- **Puerto**: 8080
- **Función**: Web UI para gestión y monitorización

### Kafka Init

- **Función**: Inicialización automática de topics
- **Nota**: Se ejecuta una vez y termina

## 🔧 Comandos Útiles

### Listar Topics

```bash
docker exec -it kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --list
```

### Ver Mensajes de un Topic

```bash
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic cosecha-event \
  --from-beginning
```

### Producir Mensaje de Prueba

```bash
docker exec -it kafka kafka-console-producer \
  --bootstrap-server localhost:9092 \
  --topic cosecha-event

# Escribe el mensaje en formato JSON:
{"tokenId1": 1, "tokenId2": 2, "timestamp": 1234567890}
```

### Ver Consumer Groups

```bash
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --list
```

### Ver Detalles de un Consumer Group

```bash
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group almacen-consumer \
  --describe
```

## 📊 Formato de Mensajes

Todos los eventos siguen este formato JSON:

```json
{
  "tokenId1": 123,
  "tokenId2": 456,
  "tokenType": "COSECHA",
  "timestamp": 1699123456789,
  "metadata": {
    "producer": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  }
}
```

## 🐛 Troubleshooting

### Error: Cannot connect to Kafka

```bash
# Verificar que Kafka está corriendo
docker-compose ps

# Ver logs de Kafka
docker-compose logs kafka

# Reiniciar Kafka
docker-compose restart kafka
```

### Topics no creados

```bash
# Re-ejecutar el init container
docker-compose up kafka-init

# O crearlos manualmente
docker exec -it kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --create \
  --topic cosecha-event \
  --replication-factor 1 \
  --partitions 1
```

### Puertos ocupados

Si el puerto 9092 u 8080 están ocupados:

```bash
# Cambiar en docker-compose.yml
ports:
  - "9093:9092"  # Para Kafka
  - "8081:8080"  # Para Kafka UI
```

## 🔐 Seguridad

**NOTA**: Esta configuración es para desarrollo local. NO usar en producción sin:

- Autenticación (SASL)
- Encriptación (TLS/SSL)
- ACLs para topics
- Network policies

## 📚 Integración con Aplicación

### Off-Chain Monitor (Producer)

```javascript
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "off-chain-monitor",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
await producer.connect();

await producer.send({
  topic: "cosecha-event",
  messages: [
    {
      value: JSON.stringify({
        tokenId1: 1,
        tokenId2: 2,
        timestamp: Date.now(),
      }),
    },
  ],
});
```

### Backend Service (Consumer)

```javascript
const consumer = kafka.consumer({
  groupId: "almacen-consumer",
});

await consumer.connect();
await consumer.subscribe({
  topic: "cosecha-event",
  fromBeginning: false,
});

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString());
    console.log("Received:", event);
    // Crear token en blockchain...
  },
});
```

## 📝 Variables de Entorno

Todas las configuraciones están en `docker-compose.yml`. No se requieren archivos `.env` adicionales.

## ✅ Health Check

```bash
# Check Kafka health
curl -f http://localhost:8080 || echo "Kafka UI not ready"

# O directamente en Docker
docker-compose ps
```

---

**Mantenido por**: Proyecto Supply Chain Tracking  
**Versión Kafka**: 7.5.0 (Confluent Platform)
