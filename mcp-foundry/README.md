# MCP Foundry Server

Model Context Protocol (MCP) server for Foundry CLI tools. This server enables AI assistants like Claude to interact with Foundry's `forge`, `cast`, and `anvil` commands through structured tools.

## Features

### 🔨 Forge Tools
- **forge_build**: Compile Solidity contracts
- **forge_test**: Run tests with various options (match patterns, verbosity, gas reports)
- **forge_coverage**: Generate test coverage reports
- **forge_script**: Execute Solidity scripts (deployment, etc.)
- **forge_clean**: Clean build artifacts

### 🎯 Cast Tools
- **cast_call**: Call read-only contract functions
- **cast_send**: Send transactions to contracts
- **cast_block_number**: Get current block number
- **cast_balance**: Get ETH balance of an address
- **cast_chain_id**: Get the chain ID

### ⚙️ Anvil Tools
- **anvil_start**: Start local Ethereum node (runs in background)
- **anvil_stop**: Stop the running Anvil instance
- **anvil_status**: Check Anvil status and view logs

## Installation

### Prerequisites

- Node.js >= 18.0.0
- Foundry installed and in PATH
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```

### Install from NPM (when published)

```bash
npm install -g @javierruiz/mcp-foundry
```

### Install from Source

```bash
cd mcp-foundry
npm install
npm run build
npm link  # Makes it globally available
```

## Usage

### 1. Configure in Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "foundry": {
      "command": "node",
      "args": [
        "/path/to/mcp-foundry/build/index.js"
      ]
    }
  }
}
```

Or if installed globally via npm:

```json
{
  "mcpServers": {
    "foundry": {
      "command": "mcp-foundry"
    }
  }
}
```

### 2. Restart Claude Desktop

Restart Claude Desktop to load the MCP server.

### 3. Use Foundry Tools in Claude

You can now ask Claude to use Foundry tools:

**Example prompts:**

```
"Compile the smart contracts in the sc/ directory"
→ Uses forge_build

"Run all tests with verbosity level 3"
→ Uses forge_test with verbosity: 3

"Start Anvil on port 8545 with 10 accounts"
→ Uses anvil_start

"Deploy the contract using script/Deploy.s.sol"
→ Uses forge_script

"Get the balance of 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
→ Uses cast_balance
```

## Tool Reference

### forge_build

Compile Solidity smart contracts.

**Parameters:**
- `workingDir` (optional): Working directory
- `force` (optional): Force recompilation

**Example:**
```json
{
  "workingDir": "./sc",
  "force": true
}
```

### forge_test

Run Foundry tests.

**Parameters:**
- `workingDir` (optional): Working directory
- `matchTest` (optional): Pattern to match test names
- `matchContract` (optional): Pattern to match contract names
- `verbosity` (optional): 1-5 (1=-v, 2=-vv, etc.)
- `gasReport` (optional): Generate gas report

**Example:**
```json
{
  "workingDir": "./sc",
  "matchTest": "testTransfer",
  "verbosity": 3
}
```

### forge_script

Execute a Solidity script.

**Parameters:**
- `scriptPath` (required): Path to script file
- `workingDir` (optional): Working directory
- `rpcUrl` (optional): RPC URL
- `privateKey` (optional): Private key for signing
- `broadcast` (optional): Broadcast transactions
- `verify` (optional): Verify on Etherscan

**Example:**
```json
{
  "scriptPath": "script/Deploy.s.sol",
  "rpcUrl": "http://localhost:8545",
  "privateKey": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "broadcast": true
}
```

### cast_call

Call a read-only contract function.

**Parameters:**
- `contractAddress` (required): Contract address
- `signature` (required): Function signature
- `args` (optional): Function arguments
- `rpcUrl` (required): RPC URL
- `blockNumber` (optional): Block number

**Example:**
```json
{
  "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "signature": "balanceOf(address)(uint256)",
  "args": ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
  "rpcUrl": "http://localhost:8545"
}
```

### cast_send

Send a transaction to a contract.

**Parameters:**
- `contractAddress` (required): Contract address
- `signature` (required): Function signature
- `args` (optional): Function arguments
- `rpcUrl` (required): RPC URL
- `privateKey` (required): Private key
- `value` (optional): ETH value to send
- `gasLimit` (optional): Gas limit

**Example:**
```json
{
  "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "signature": "transfer(address,uint256)",
  "args": ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "100"],
  "rpcUrl": "http://localhost:8545",
  "privateKey": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
}
```

### anvil_start

Start Anvil local blockchain.

**Parameters (all optional):**
- `port`: Port to listen on (default: 8545)
- `chainId`: Chain ID (default: 31337)
- `accounts`: Number of accounts (default: 10)
- `balance`: Balance per account in ETH (default: 10000)
- `blockTime`: Block time in seconds
- `fork`: Fork from a network (provide RPC URL)
- `forkBlockNumber`: Fork from specific block

**Example:**
```json
{
  "port": 8545,
  "chainId": 31337,
  "accounts": 10,
  "balance": 10000,
  "blockTime": 1
}
```

### anvil_status

Check Anvil status and get logs.

**Parameters:**
- `lastNLogs` (optional): Number of recent log lines

**Example:**
```json
{
  "lastNLogs": 50
}
```

## Development

### Project Structure

```
mcp-foundry/
├── src/
│   ├── index.ts              # Main MCP server
│   ├── types.ts              # TypeScript type definitions
│   ├── tools.ts              # MCP tool definitions
│   ├── foundry-executor.ts   # Command execution logic
│   └── tool-handlers.ts      # Tool implementation
├── build/                    # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run watch  # Auto-rebuild on changes
```

### Testing with MCP Inspector

The MCP Inspector is a great tool for testing your server:

```bash
npm run inspector
```

This will start an interactive web UI where you can test all the tools.

## Examples

### Example 1: Complete Development Workflow

```
User: "Start Anvil, compile contracts, run tests, and deploy"

Claude will:
1. anvil_start with default settings
2. forge_build to compile
3. forge_test to run tests
4. forge_script to deploy
```

### Example 2: Check Contract State

```
User: "Check the balance of token ID 1 for address 0xf39..."

Claude will:
1. cast_call with the getTokenBalance function
2. Parse and present the result
```

### Example 3: Interactive Testing

```
User: "Run only the pause tests with maximum verbosity"

Claude will:
1. forge_test with matchTest: "Pause", verbosity: 5
2. Show detailed test output
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Private Keys**: Never use real private keys. This tool is designed for local development with test keys only.

2. **RPC URLs**: Be cautious with public RPC URLs in prompts, as they may be logged.

3. **File System Access**: The server can execute commands in the working directory. Ensure Claude is used in trusted project directories only.

4. **Anvil Background Process**: The server manages an Anvil process. Always stop it with `anvil_stop` or the process will be killed on server exit.

## Troubleshooting

> **📘 Complete Troubleshooting Guide**: See [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) for detailed solutions to common problems, including the `anvil_status` detection issue.

### Quick Fixes

**"Command not found" errors**

Ensure Foundry is installed and in your PATH:
```bash
which forge cast anvil

# If not found, install:
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

**MCP Server not appearing in Claude**

1. Check config path: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Verify build exists: `ls build/index.js`
3. Restart Claude Desktop completely
4. Check logs: Claude Desktop → Help → Show Logs

**anvil_status doesn't detect running Anvil**

This has been fixed in v1.1.0! If you're still experiencing this:
```bash
npm run build  # Recompile
pkill -9 "Claude" && open -a "Claude"  # Restart Claude
```

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md#problema-anvil_status-no-detecta-anvil-corriendo) for details.

**Anvil won't start**

- Check port: `lsof -i :8545`
- Try different port in `anvil_start`
- Verify installation: `anvil --version`

**TypeScript errors**

```bash
npm install && npm run build
```

## Contributing

Contributions are welcome! This MCP server is part of the Supply Chain Tracker educational project.

## License

MIT License - See LICENSE file for details

## Related Projects

- [Foundry](https://github.com/foundry-rs/foundry) - Ethereum development toolkit
- [Model Context Protocol](https://modelcontextprotocol.io/) - Protocol for AI tool integration
- [Supply Chain Tracker](../README.md) - Parent project using this MCP server

## Author

Javier Ruiz-Canela

## Version

1.0.0

---

**Note**: This MCP server is designed for local development and educational purposes. Always use test networks and test private keys.
