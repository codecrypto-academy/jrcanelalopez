require("dotenv").config();
const ethers = require("ethers");

const CONTRACT_ABI = [
  "function createToken() external returns (uint256)",
  "function getTokenInfo(uint256 tokenId) external view returns (tuple(uint256 id, address creator, uint8 tokenType, uint256 parent1, uint256 parent2, uint256 timestamp))"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

  console.log("🌾 Creating 8 COSECHA tokens to test full chain...\n");

  for (let i = 0; i < 8; i++) {
    console.log(`Creating COSECHA token ${i + 1}/8...`);
    const tx = await contract.createToken();
    const receipt = await tx.wait();
    console.log(`  ✅ Transaction confirmed: ${tx.hash}`);
    
    // Wait a bit between creations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log("\n✅ All COSECHA tokens created!");
  console.log("\nNow wait for the services to process them:");
  console.log("  - 8 COSECHA → 4 ALMACEN → 2 MOLIENDA → 1 HORNEADO");
  console.log("  - Wait for 2 HORNEADO to create 1 EMBALAJE");
  console.log("  - Wait for 2 EMBALAJE to create 1 DISTRIBUCION");
  console.log("  - Wait for 2 DISTRIBUCION to create 1 VENTA");
  console.log("\nMonitor the service logs to see the progression!");
}

main().catch(console.error);
