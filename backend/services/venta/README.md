# VENTA Service - Final Service in Supply Chain

**Service 7 (Final) - End of Event-Driven Chain**

## Overview

This is the **final service** in the blockchain-based supply chain. The VENTA service consumes events from the DISTRIBUCION service and creates final VENTA tokens that represent sold products. Unlike other services, VENTA **does NOT publish** to Kafka because it is the end of the processing chain.

## Logic

The service implements the following transformation logic:

```
2 DISTRIBUCION tokens → 1 VENTA token
```

**Important**: This service only consumes from Kafka and creates blockchain tokens. It does NOT publish events because there are no subsequent services.

## Account Information

- **Role**: VENDEDOR (7)
- **Address**: `0x14dC79964da2C08b23698B3D3cc7Ca32193d9955`
- **Private Key**: `0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356`

## Workflow

1. **Consumes** from Kafka topic: `distribucion-event`
2. **Validates** message is for VENTA service
3. **Creates** VENTA token on blockchain with 2 DISTRIBUCION parents
4. **Logs** completion (no publishing to Kafka)

## Kafka

- **Consumes**: `distribucion-event`
- **Publishes**: None (end of chain)

## Environment Variables

```properties
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PRIVATE_KEY=0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=distribucion-event
```

## Installation

```bash
cd backend/services/venta
npm install
```

## Running the Service

```bash
# Development mode
node index.js

# Background mode
nohup node index.js > venta.log 2>&1 &

# View logs
tail -f venta.log
```

## Integration

This service completes the full supply chain:

```
COSECHA (manual)
    ↓
ALMACEN (service 2)
    ↓
MOLIENDA (service 3)
    ↓
HORNEADO (service 4)
    ↓
EMBALAJE (service 5)
    ↓
DISTRIBUCION (service 6)
    ↓
VENTA (service 7) ← This service [END OF CHAIN]
```

## Token Types

- **Consumes**: DISTRIBUCION (type 5)
- **Produces**: VENTA (type 6) - Final token type
- **No Publishing**: This service does not publish to Kafka

## Monitoring

The service logs:

- Kafka connection status
- Messages received and processed
- Blockchain transactions
- Token creation confirmations
- Statistics (uptime, messages consumed, tokens created, errors)

## Notes

- This is the ONLY service that doesn't publish to Kafka
- Represents the final step in the supply chain (sale)
- Token genealogy can be traced from VENTA back to original COSECHA tokens
- Each VENTA token has 2 DISTRIBUCION parents
