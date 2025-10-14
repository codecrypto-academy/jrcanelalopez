const { ethers } = require("ethers");
require("dotenv").config();

// Configuración
const RPC_URL = process.env.RPC_URL || "http://localhost:8545";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INTERVAL = parseInt(process.env.INTERVAL) || 1000; // 1 segundo por defecto

// ABI del contrato
const CONTRACT_ABI = require("../../shared/contractABI");

// Validar configuración
if (!CONTRACT_ADDRESS) {
  console.error("❌ CONTRACT_ADDRESS no configurado en .env");
  process.exit(1);
}

if (!PRIVATE_KEY) {
  console.error("❌ PRIVATE_KEY no configurado en .env");
  process.exit(1);
}

// Estado en memoria
let tokensCreated = 0;
let lastTokenId = 0;
let isCreating = false;

// Inicializar
async function init() {
  console.log("🌾 Starting COSECHA Service...");
  console.log(`📡 RPC URL: ${RPC_URL}`);
  console.log(`📝 Contract: ${CONTRACT_ADDRESS}`);
  console.log(`⏱️  Interval: ${INTERVAL}ms (${INTERVAL / 1000}s per token)\n`);

  // Conectar a blockchain
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

  console.log(`🔑 Wallet Address: ${wallet.address}`);

  // Verificar balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  if (balance === 0n) {
    console.error("❌ Wallet sin fondos. No se pueden enviar transacciones.");
    process.exit(1);
  }

  console.log("✅ Ready to start creating COSECHA tokens!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Loop principal: crear token cada X segundos
  setInterval(async () => {
    if (isCreating) {
      console.log("⏳ Previous transaction still pending, skipping...");
      return;
    }

    try {
      isCreating = true;
      await createCosechaToken(contract);
    } catch (error) {
      console.error("❌ Error creating token:", error.message);
    } finally {
      isCreating = false;
    }
  }, INTERVAL);
}

// Crear un token COSECHA
async function createCosechaToken(contract) {
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] 🌱 Creating COSECHA token...`);

  try {
    // Llamar a createToken() (sin padres)
    const tx = await contract.createToken();
    console.log(`   📤 Transaction sent: ${tx.hash}`);

    // Esperar confirmación
    const receipt = await tx.wait();

    // Extraer tokenId del evento
    const event = receipt.logs.find((log) => {
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

    if (event) {
      const parsed = contract.interface.parseLog({
        topics: event.topics,
        data: event.data,
      });
      lastTokenId = Number(parsed.args.tokenId);
      tokensCreated++;

      console.log(`   ✅ Token created successfully!`);
      console.log(`   🆔 Token ID: ${lastTokenId}`);
      console.log(`   ⛽ Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`   📊 Total tokens created: ${tokensCreated}`);
    } else {
      console.log(`   ✅ Transaction confirmed (no event found)`);
    }

    console.log("");
  } catch (error) {
    if (error.code === "CALL_EXCEPTION") {
      console.error("   ❌ Contract reverted. Possible reasons:");
      console.error("      - Wallet no tiene rol AGRICULTOR");
      console.error("      - Contrato pausado");
    } else {
      console.error("   ❌ Error:", error.message);
    }
    console.log("");
  }
}

// Manejar shutdown gracefully
process.on("SIGINT", () => {
  console.log("\n\n🛑 Shutting down COSECHA service...");
  console.log(`📊 Final stats:`);
  console.log(`   Total tokens created: ${tokensCreated}`);
  console.log(`   Last token ID: ${lastTokenId}`);
  console.log("\n✅ Service stopped\n");
  process.exit(0);
});

// Manejar errores no capturados
process.on("unhandledRejection", (error) => {
  console.error("\n❌ Unhandled rejection:", error);
});

// Iniciar servicio
init().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
