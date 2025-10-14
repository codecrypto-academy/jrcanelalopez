require("dotenv").config({ path: __dirname + "/.env" });
const { ethers } = require("ethers");
const { Kafka } = require("kafkajs");

// Configuración
const RPC_URL = process.env.RPC_URL || "http://localhost:8545";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";

// ABI del contrato (solo las funciones necesarias)
const CONTRACT_ABI = [
  "function createTokenWithParents(uint256 parent1, uint256 parent2) returns (uint256)",
  "function getTokenMetadata(uint256 tokenId) view returns (uint8 tokenType, address producer, uint256 parent1, uint256 parent2, uint256 createdAt)",
  "function canCreateTokenType(address account, uint8 tokenType) view returns (bool)",
  "function roles(address account) view returns (uint8)",
  "event TokenCreated(uint256 indexed tokenId, uint8 indexed tokenType, address indexed producer, uint256 parent1, uint256 parent2, uint256 timestamp)",
];

// Tipos de tokens
const TokenType = {
  COSECHA: 0,
  ALMACEN: 1,
  MOLIENDA: 2,
  HORNEADO: 3,
  EMBALAJE: 4,
  DISTRIBUCION: 5,
  VENTA: 6,
};

// Roles
const Role = {
  NONE: 0,
  AGRICULTOR: 1,
  ALMACENADOR: 2,
  MOLINERO: 3,
  HORNEADOR: 4,
  EMBALADOR: 5,
  DISTRIBUIDOR: 6,
  VENDEDOR: 7,
};

// Configurar Kafka (solo consumer, no producer - es el servicio final)
const kafka = new Kafka({
  clientId: "venta-service",
  brokers: [KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "venta-group" });

// Estadísticas
let stats = {
  messagesConsumed: 0,
  tokensCreated: 0,
  errors: 0,
  startTime: Date.now(),
};

// Provider y contrato
let provider;
let contract;
let wallet;

// Inicializar conexión blockchain
async function initBlockchain() {
  console.log("🔗 Connecting to blockchain...");
  console.log(`📡 RPC URL: ${RPC_URL}`);
  console.log(`📝 Contract: ${CONTRACT_ADDRESS}\n`);

  provider = new ethers.JsonRpcProvider(RPC_URL);
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

  // Verificar que la cuenta tiene el rol VENDEDOR
  const accountRole = await contract.roles(wallet.address);
  if (Number(accountRole) !== Role.VENDEDOR) {
    throw new Error(
      `❌ Account ${wallet.address} does not have VENDEDOR role (has role ${accountRole})`
    );
  }

  const balance = await provider.getBalance(wallet.address);
  console.log(`✅ Connected as VENDEDOR`);
  console.log(`   Address: ${wallet.address}`);
  console.log(`   Balance: ${ethers.formatEther(balance)} ETH\n`);
}

// Procesar mensaje de Kafka
async function processMessage(message) {
  try {
    const payload = JSON.parse(message.value.toString());
    console.log(`\n📨 New message received:`);
    console.log(`   Token 1: ${payload.tokenId1}`);
    console.log(`   Token 2: ${payload.tokenId2}`);
    console.log(`   Type: ${payload.tokenType}`);
    console.log(`   Target: ${payload.targetType}`);

    stats.messagesConsumed++;

    // Verificar que es para VENTA
    if (payload.targetType !== "VENTA") {
      console.log(`⚠️  Skipping - target is ${payload.targetType}, not VENTA`);
      return;
    }

    // Crear token VENTA con los dos tokens DISTRIBUCION como padres
    console.log(
      `\n💰 Creating VENTA token with parents [${payload.tokenId1}, ${payload.tokenId2}]...`
    );

    const tx = await contract.createTokenWithParents(
      payload.tokenId1,
      payload.tokenId2
    );
    console.log(`   Transaction sent: ${tx.hash}`);
    console.log(`   Waiting for confirmation...`);

    const receipt = await tx.wait();
    console.log(`   ✅ Transaction confirmed in block ${receipt.blockNumber}`);

    // Buscar el evento TokenCreated en los logs
    const tokenCreatedEvent = receipt.logs.find((log) => {
      try {
        const parsed = contract.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });
        return parsed && parsed.name === "TokenCreated";
      } catch {
        return false;
      }
    });

    if (tokenCreatedEvent) {
      const parsed = contract.interface.parseLog({
        topics: tokenCreatedEvent.topics,
        data: tokenCreatedEvent.data,
      });
      const newTokenId = parsed.args.tokenId || parsed.args[0];

      console.log(`\n🎉 VENTA token created successfully!`);
      console.log(`   Token ID: ${newTokenId}`);
      console.log(`   Parent 1: ${payload.tokenId1}`);
      console.log(`   Parent 2: ${payload.tokenId2}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`   ✅ Final token in supply chain - No further processing`);

      stats.tokensCreated++;

      // No publicar - VENTA es el servicio final
    } else {
      console.log("⚠️  TokenCreated event not found in receipt");
    }
  } catch (error) {
    stats.errors++;
    console.error(`\n❌ Error processing message:`, error.message);
    if (error.reason) console.error(`   Reason: ${error.reason}`);
  }
}

// VENTA es el servicio final - No publica eventos a Kafka

// Mostrar estadísticas
function showStats() {
  const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
  console.log(`\n📊 Statistics:`);
  console.log(`   Messages consumed: ${stats.messagesConsumed}`);
  console.log(`   Tokens created: ${stats.tokensCreated}`);
  console.log(`   Errors: ${stats.errors}`);
  console.log(`   Uptime: ${uptime}s`);
}

// Manejador de señales
process.on("SIGINT", async () => {
  console.log("\n\n🛑 Shutting down gracefully...");
  showStats();

  await consumer.disconnect();
  console.log("👋 Goodbye!\n");
  process.exit(0);
});

// Main
async function main() {
  console.log("🚀 Starting VENTA Service (Final Service)...\n");

  try {
    // Inicializar blockchain
    await initBlockchain();

    // Conectar a Kafka (solo consumer)
    console.log("📨 Connecting to Kafka...");
    await consumer.connect();
    console.log(`✅ Connected to Kafka broker: ${KAFKA_BROKER}\n`);

    // Suscribirse al topic
    await consumer.subscribe({
      topic: process.env.KAFKA_TOPIC || "distribucion-event",
      fromBeginning: false, // Solo nuevos mensajes
    });
    console.log(
      `👂 Subscribed to topic: ${
        process.env.KAFKA_TOPIC || "distribucion-event"
      }\n`
    );
    console.log("⏳ Waiting for messages...\n");

    // Ejecutar consumer
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await processMessage(message);
      },
    });
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  }
}

// Ejecutar
main();
