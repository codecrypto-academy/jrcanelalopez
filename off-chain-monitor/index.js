const { ethers } = require("ethers");
const { Kafka } = require("kafkajs");
require("dotenv").config();

// Configuración
const RPC_URL = process.env.RPC_URL || "http://localhost:8545";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL) || 1000; // 1 segundo

// Token Types enum (debe coincidir con el smart contract)
const TokenType = {
  COSECHA: 0,
  ALMACEN: 1,
  MOLIENDA: 2,
  HORNEADO: 3,
  EMBALAJE: 4,
  DISTRIBUCION: 5,
  VENTA: 6,
};

// ABI mínima necesaria para leer eventos y metadatos
const CONTRACT_ABI = [
  "event TokenCreated(uint256 indexed tokenId, uint8 indexed tokenType, address indexed producer, uint256 parent1, uint256 parent2, uint256 timestamp)",
  "function getTokenMetadata(uint256 tokenId) view returns (uint8 tokenType, address producer, uint256 parent1, uint256 parent2, uint256 createdAt)",
];

// Estado en memoria: tokens detectados por tipo
const tokensByType = {
  [TokenType.COSECHA]: [],
  [TokenType.ALMACEN]: [],
  [TokenType.MOLIENDA]: [],
  [TokenType.HORNEADO]: [],
  [TokenType.EMBALAJE]: [],
  [TokenType.DISTRIBUCION]: [],
  [TokenType.VENTA]: [],
};

// Configurar Kafka
const kafka = new Kafka({
  clientId: "off-chain-monitor",
  brokers: [KAFKA_BROKER],
});

const producer = kafka.producer();

// Inicializar
async function init() {
  console.log("🚀 Starting Off-Chain Monitor...");
  console.log(`📡 RPC URL: ${RPC_URL}`);
  console.log(`📝 Contract: ${CONTRACT_ADDRESS}`);
  console.log(`📨 Kafka Broker: ${KAFKA_BROKER}`);
  console.log(`⏱️  Poll Interval: ${POLL_INTERVAL}ms\n`);

  if (!CONTRACT_ADDRESS) {
    console.error("❌ CONTRACT_ADDRESS not set in .env");
    process.exit(1);
  }

  // Conectar a Kafka
  await producer.connect();
  console.log("✅ Connected to Kafka\n");

  // Conectar a blockchain
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );

  // Obtener último bloque procesado
  let lastBlockProcessed = await provider.getBlockNumber();
  console.log(`📦 Starting from block: ${lastBlockProcessed}\n`);

  // Polling loop
  setInterval(async () => {
    try {
      const currentBlock = await provider.getBlockNumber();

      if (currentBlock > lastBlockProcessed) {
        console.log(
          `🔍 Checking blocks ${lastBlockProcessed + 1} to ${currentBlock}...`
        );

        // Filtrar eventos TokenCreated
        const filter = contract.filters.TokenCreated();
        const events = await contract.queryFilter(
          filter,
          lastBlockProcessed + 1,
          currentBlock
        );

        if (events.length > 0) {
          console.log(`📢 Found ${events.length} new TokenCreated events`);

          for (const event of events) {
            await processTokenCreated(event);
          }

          // Aplicar reglas de negocio
          await applyBusinessRules();
        }

        lastBlockProcessed = currentBlock;
      }
    } catch (error) {
      console.error("❌ Error in polling loop:", error.message);
    }
  }, POLL_INTERVAL);
}

// Procesar evento TokenCreated
async function processTokenCreated(log) {
  try {
    // Crear interface para parsear manualmente
    const iface = new ethers.Interface(CONTRACT_ABI);

    // Parsear el log manualmente
    const parsed = iface.parseLog({
      topics: log.topics,
      data: log.data,
    });

    // Los argumentos parseados están en parsed.args
    // Recordar: indexed params están en topics, non-indexed en data
    // event TokenCreated(uint256 indexed tokenId, uint8 indexed tokenType, address indexed producer, uint256 parent1, uint256 parent2, uint256 timestamp)
    const tokenId = parsed.args.tokenId || parsed.args[0];
    const tokenType = parsed.args.tokenType || parsed.args[1];
    const producer = parsed.args.producer || parsed.args[2];
    const parent1 = parsed.args.parent1 || parsed.args[3];
    const parent2 = parsed.args.parent2 || parsed.args[4];
    const timestamp = parsed.args.timestamp || parsed.args[5];

    console.log(`\n🆕 New Token Created:`);
    console.log(`   Token ID: ${tokenId}`);
    console.log(`   Type: ${getTokenTypeName(tokenType)}`);
    console.log(`   Producer: ${producer}`);
    console.log(`   Parents: [${parent1}, ${parent2}]`);
    console.log(
      `   Timestamp: ${new Date(Number(timestamp) * 1000).toISOString()}`
    );

    // Guardar en estado
    const typeNumber = Number(tokenType);
    if (!tokensByType[typeNumber].includes(Number(tokenId))) {
      tokensByType[typeNumber].push(Number(tokenId));
      console.log(
        `   ✅ Added to ${getTokenTypeName(typeNumber)} pool (total: ${
          tokensByType[typeNumber].length
        })`
      );
    }
  } catch (error) {
    console.error("❌ Error processing TokenCreated event:", error.message);
  }
}

// Aplicar reglas de negocio: 2 tokens padre → publicar evento
async function applyBusinessRules() {
  // Regla 1: 2 COSECHA → almacen-event
  if (tokensByType[TokenType.COSECHA].length >= 2) {
    const [token1, token2] = tokensByType[TokenType.COSECHA].splice(0, 2);
    await publishEvent("cosecha-event", {
      tokenId1: token1,
      tokenId2: token2,
      tokenType: "COSECHA",
      targetType: "ALMACEN",
      timestamp: Date.now(),
    });
  }

  // Regla 2: 2 ALMACEN → molienda-event
  if (tokensByType[TokenType.ALMACEN].length >= 2) {
    const [token1, token2] = tokensByType[TokenType.ALMACEN].splice(0, 2);
    await publishEvent("almacen-event", {
      tokenId1: token1,
      tokenId2: token2,
      tokenType: "ALMACEN",
      targetType: "MOLIENDA",
      timestamp: Date.now(),
    });
  }

  // Regla 3: 2 MOLIENDA → horneado-event
  if (tokensByType[TokenType.MOLIENDA].length >= 2) {
    const [token1, token2] = tokensByType[TokenType.MOLIENDA].splice(0, 2);
    await publishEvent("molienda-event", {
      tokenId1: token1,
      tokenId2: token2,
      tokenType: "MOLIENDA",
      targetType: "HORNEADO",
      timestamp: Date.now(),
    });
  }

  // Regla 4: 2 HORNEADO → embalaje-event
  if (tokensByType[TokenType.HORNEADO].length >= 2) {
    const [token1, token2] = tokensByType[TokenType.HORNEADO].splice(0, 2);
    await publishEvent("horneado-event", {
      tokenId1: token1,
      tokenId2: token2,
      tokenType: "HORNEADO",
      targetType: "EMBALAJE",
      timestamp: Date.now(),
    });
  }

  // Regla 5: 2 EMBALAJE → distribucion-event
  if (tokensByType[TokenType.EMBALAJE].length >= 2) {
    const [token1, token2] = tokensByType[TokenType.EMBALAJE].splice(0, 2);
    await publishEvent("embalaje-event", {
      tokenId1: token1,
      tokenId2: token2,
      tokenType: "EMBALAJE",
      targetType: "DISTRIBUCION",
      timestamp: Date.now(),
    });
  }

  // Regla 6: 2 DISTRIBUCION → venta-event
  if (tokensByType[TokenType.DISTRIBUCION].length >= 2) {
    const [token1, token2] = tokensByType[TokenType.DISTRIBUCION].splice(0, 2);
    await publishEvent("distribucion-event", {
      tokenId1: token1,
      tokenId2: token2,
      tokenType: "DISTRIBUCION",
      targetType: "VENTA",
      timestamp: Date.now(),
    });
  }
}

// Publicar evento a Kafka
async function publishEvent(topic, payload) {
  try {
    await producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(payload),
        },
      ],
    });

    console.log(`\n📤 Published to Kafka:`);
    console.log(`   Topic: ${topic}`);
    console.log(`   Payload:`, payload);
  } catch (error) {
    console.error(`❌ Error publishing to Kafka (${topic}):`, error.message);
  }
}

// Helper: nombre del tipo de token
function getTokenTypeName(typeNumber) {
  const names = [
    "COSECHA",
    "ALMACEN",
    "MOLIENDA",
    "HORNEADO",
    "EMBALAJE",
    "DISTRIBUCION",
    "VENTA",
  ];
  return names[Number(typeNumber)] || "UNKNOWN";
}

// Manejar shutdown gracefully
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  await producer.disconnect();
  console.log("✅ Disconnected from Kafka");
  process.exit(0);
});

// Iniciar
init().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
