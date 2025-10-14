# DISTRIBUCION Service

## Description

This microservice consumes `embalaje-event` messages from Kafka and creates DISTRIBUCION tokens on the blockchain.

## Logic

- Consumes two EMBALAJE tokens (tokenId1, tokenId2)
- Creates one DISTRIBUCION token with both EMBALAJE tokens as parents
- Publishes `distribucion-event` for the next service (VENTA)

## Kafka

- **Consumes**: `embalaje-event`
- **Publishes**: `distribucion-event`

## Environment Variables

```properties
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=<contract_address>
PRIVATE_KEY=<distribuidor_private_key>
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=embalaje-event
```

## Usage

```bash
npm install
npm start
```
