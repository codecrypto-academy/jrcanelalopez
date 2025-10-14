# ALMACEN Service

Servicio que consume eventos de Kafka del topic `cosecha-event` y crea tokens ALMACEN en la blockchain.

## 🎯 Función

- **Consume**: Eventos `cosecha-event` de Kafka (2 tokens COSECHA listos)
- **Procesa**: Crea token ALMACEN usando `createTokenWithParents(tokenId1, tokenId2)`
- **Publica**: Evento `almacen-event` a Kafka para el siguiente servicio (MOLIENDA)

## 🔑 Rol requerido

Este servicio utiliza la cuenta con rol **ALMACENADOR**:

- Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` (Account #2 de Anvil)
- Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

## 📋 Requisitos previos

1. **Anvil** corriendo en `localhost:8545`
2. **Contrato** desplegado en `0x5FbDB2315678afecb367f032d93F642f64180aa3`
3. **Kafka** corriendo en `localhost:9092` (usar `docker compose up -d`)
4. **Off-chain-monitor** corriendo (para generar eventos `cosecha-event`)
5. **COSECHA service** corriendo (para generar tokens COSECHA)

## 🚀 Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar servicio
npm start

# Modo desarrollo (auto-restart)
npm run dev
```

## 🔧 Configuración (.env)

```bash
RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PRIVATE_KEY=0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
KAFKA_BROKER=localhost:9092
```

## 📊 Flujo de trabajo

```
1. Off-chain-monitor detecta 2 tokens COSECHA
   └── Publica mensaje a topic 'cosecha-event':
       {
         tokenId1: 3,
         tokenId2: 4,
         tokenType: "COSECHA",
         targetType: "ALMACEN"
       }

2. ALMACEN service consume el mensaje
   └── Verifica que targetType === "ALMACEN"
   └── Llama a contract.createTokenWithParents(3, 4)
   └── Espera confirmación de transacción

3. Blockchain crea token ALMACEN
   └── Token ID: 5 (ejemplo)
   └── Parents: [3, 4]
   └── Type: ALMACEN (1)

4. ALMACEN service publica evento
   └── Topic: 'almacen-event'
   └── Payload: {tokenId: 5, tokenType: "ALMACEN", targetType: "MOLIENDA"}
```

## 🧪 Testing manual

```bash
# 1. Verificar que el servicio tiene el rol correcto
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "hasRole(bytes32,address)" \
  $(cast keccak "ALMACENADOR") \
  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC \
  --rpc-url http://localhost:8545

# 2. Ver mensajes en Kafka (topic entrada)
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic cosecha-event \
  --from-beginning

# 3. Ver mensajes en Kafka (topic salida)
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic almacen-event \
  --from-beginning

# 4. Consultar metadata de token ALMACEN creado
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "getTokenMetadata(uint256)" \
  5 \
  --rpc-url http://localhost:8545
```

## 📈 Estadísticas

El servicio muestra estadísticas al presionar `Ctrl+C`:

- **Messages consumed**: Mensajes procesados de Kafka
- **Tokens created**: Tokens ALMACEN creados exitosamente
- **Errors**: Errores encontrados
- **Uptime**: Tiempo de ejecución

## ⚠️ Solución de problemas

### Error: "Account does not have ALMACENADOR role"

```bash
# Asignar rol ALMACENADOR
cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "grantRole(bytes32,address)" \
  $(cast keccak "ALMACENADOR") \
  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545
```

### Error: "Kafka broker not available"

```bash
# Verificar Kafka
docker ps | grep kafka

# Reiniciar Kafka
docker compose restart kafka
```

### No recibe mensajes

- Verificar que `off-chain-monitor` está corriendo
- Verificar que `COSECHA service` está generando tokens
- Verificar que hay al menos 2 tokens COSECHA para activar la regla de negocio
