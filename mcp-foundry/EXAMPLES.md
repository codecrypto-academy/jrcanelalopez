# MCP Foundry - Usage Examples

This document provides practical examples of using the MCP Foundry server with Claude Desktop.

## Table of Contents

1. [Basic Workflow](#basic-workflow)
2. [Smart Contract Development](#smart-contract-development)
3. [Testing Scenarios](#testing-scenarios)
4. [Deployment Scripts](#deployment-scripts)
5. [Contract Interaction](#contract-interaction)
6. [Advanced Workflows](#advanced-workflows)

---

## Basic Workflow

### Example 1: Start Local Blockchain

**Prompt to Claude:**
```
Start Anvil on port 8545 with 10 accounts and 10000 ETH each
```

**What Claude will do:**
```json
Tool: anvil_start
{
  "port": 8545,
  "accounts": 10,
  "balance": 10000
}
```

**Expected Output:**
```
✅ Anvil started successfully!

Available Accounts
==================
(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
(1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...

Listening on 127.0.0.1:8545
```

### Example 2: Compile Contracts

**Prompt:**
```
Compile the smart contracts in the sc/ directory
```

**Tool Call:**
```json
Tool: forge_build
{
  "workingDir": "./sc"
}
```

**Expected Output:**
```
✅ forge build completed successfully

[⠊] Compiling...
[⠒] Compiling 1 files with 0.8.30
[⠢] Solc 0.8.30 finished in 1.23s
Compiler run successful!
```

---

## Smart Contract Development

### Example 3: Run All Tests

**Prompt:**
```
Run all tests in the sc/ directory with verbosity level 2
```

**Tool Call:**
```json
Tool: forge_test
{
  "workingDir": "./sc",
  "verbosity": 2
}
```

### Example 4: Run Specific Tests

**Prompt:**
```
Run only the tests related to transfers with maximum verbosity
```

**Tool Call:**
```json
Tool: forge_test
{
  "workingDir": "./sc",
  "matchTest": "Transfer",
  "verbosity": 5
}
```

### Example 5: Generate Test Coverage

**Prompt:**
```
Generate a test coverage report for the smart contracts
```

**Tool Call:**
```json
Tool: forge_coverage
{
  "workingDir": "./sc"
}
```

### Example 6: Run Tests with Gas Report

**Prompt:**
```
Run all tests and generate a gas usage report
```

**Tool Call:**
```json
Tool: forge_test
{
  "workingDir": "./sc",
  "gasReport": true
}
```

---

## Testing Scenarios

### Example 7: Test-Driven Development

**Conversation with Claude:**

**You:** "I'm working on the SupplyChain contract. First compile it, then run tests, and show me which tests are failing."

**Claude will:**
1. `forge_build` in sc/ directory
2. `forge_test` with verbosity 2
3. Parse output and identify failing tests
4. Suggest fixes based on error messages

### Example 8: Specific Test Contract

**Prompt:**
```
Run only the SupplyChainTest contract tests
```

**Tool Call:**
```json
Tool: forge_test
{
  "workingDir": "./sc",
  "matchContract": "SupplyChainTest"
}
```

---

## Deployment Scripts

### Example 9: Deploy to Anvil

**Prompt:**
```
Deploy the contract to Anvil using script/DeployLocal.s.sol
```

**Tool Call:**
```json
Tool: forge_script
{
  "scriptPath": "script/DeployLocal.s.sol",
  "workingDir": "./sc",
  "rpcUrl": "http://localhost:8545",
  "privateKey": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "broadcast": true
}
```

### Example 10: Deploy to Testnet

**Prompt:**
```
Deploy to Sepolia testnet with verification
```

**Tool Call:**
```json
Tool: forge_script
{
  "scriptPath": "script/Deploy.s.sol",
  "workingDir": "./sc",
  "rpcUrl": "https://sepolia.infura.io/v3/YOUR_KEY",
  "privateKey": "0x...",
  "broadcast": true,
  "verify": true
}
```

---

## Contract Interaction

### Example 11: Read Contract State

**Prompt:**
```
Call getUserInfo on contract 0x5FbDB2315678afecb367f032d93F642f64180aa3
for address 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 on Anvil
```

**Tool Call:**
```json
Tool: cast_call
{
  "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "signature": "getUserInfo(address)((uint256,address,string,uint8))",
  "args": ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"],
  "rpcUrl": "http://localhost:8545"
}
```

### Example 12: Send Transaction

**Prompt:**
```
Register a Producer using requestUserRole function
```

**Tool Call:**
```json
Tool: cast_send
{
  "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "signature": "requestUserRole(string)",
  "args": ["Producer"],
  "rpcUrl": "http://localhost:8545",
  "privateKey": "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
}
```

### Example 13: Check Block Number

**Prompt:**
```
What's the current block number on Anvil?
```

**Tool Call:**
```json
Tool: cast_block_number
{
  "rpcUrl": "http://localhost:8545"
}
```

### Example 14: Check Balance

**Prompt:**
```
Check the ETH balance of the admin account
```

**Tool Call:**
```json
Tool: cast_balance
{
  "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "rpcUrl": "http://localhost:8545"
}
```

---

## Advanced Workflows

### Example 15: Complete Development Cycle

**Prompt:**
```
I'm starting fresh. Please:
1. Start Anvil
2. Compile the contracts
3. Run all tests
4. If tests pass, deploy the contract
5. Give me the deployed contract address
```

**Claude's Workflow:**
1. `anvil_start` - Start local blockchain
2. `anvil_status` - Confirm it's running
3. `forge_build` - Compile contracts
4. `forge_test` - Run tests
5. If successful: `forge_script` - Deploy
6. Parse deployment output for contract address
7. Present summary to user

### Example 16: Debug Failed Tests

**Prompt:**
```
Run the testTransfer test with maximum verbosity and help me understand why it's failing
```

**Claude's Workflow:**
1. `forge_test` with matchTest="testTransfer", verbosity=5
2. Analyze stack traces and revert reasons
3. Suggest potential fixes
4. Offer to check related contract code

### Example 17: Gas Optimization Analysis

**Prompt:**
```
Run tests with gas report and identify the most expensive operations
```

**Claude's Workflow:**
1. `forge_test` with gasReport=true
2. Parse gas usage data
3. Identify top 5 most expensive operations
4. Suggest optimization strategies

### Example 18: Continuous Integration Simulation

**Prompt:**
```
Simulate a CI pipeline: clean, build, test, coverage
```

**Claude's Workflow:**
1. `forge_clean` - Clean build artifacts
2. `forge_build` - Fresh compilation
3. `forge_test` - Run test suite
4. `forge_coverage` - Generate coverage
5. Report on each step with pass/fail status

### Example 19: Fork Mainnet Testing

**Prompt:**
```
Start Anvil forked from Ethereum mainnet at block 18000000
```

**Tool Call:**
```json
Tool: anvil_start
{
  "fork": "https://mainnet.infura.io/v3/YOUR_KEY",
  "forkBlockNumber": 18000000,
  "port": 8545
}
```

### Example 20: Interactive Contract Testing

**User:** "I want to test the complete supply chain flow interactively"

**Claude's Approach:**
1. Check if Anvil is running (`anvil_status`)
2. Get deployed contract address (from user or deployment info)
3. Step-by-step execution:
   - `cast_send` - Register Producer
   - `cast_send` - Admin approves Producer
   - `cast_send` - Producer creates token
   - `cast_call` - Verify token balance
   - `cast_send` - Transfer to Factory
   - Continue through the entire flow
4. Verify each step before proceeding to next

---

## Common Patterns

### Pattern 1: Safe Deployment

```
1. forge_build - Compile
2. forge_test - Verify tests pass
3. forge_script without broadcast - Dry run
4. Review gas estimates
5. forge_script with broadcast - Deploy
```

### Pattern 2: Debug Loop

```
1. forge_test with specific test
2. Analyze failure
3. (User edits code)
4. forge_build
5. Repeat step 1
```

### Pattern 3: Pre-Deployment Checklist

```
1. forge_clean
2. forge_build - Fresh compile
3. forge_test - All tests
4. forge_coverage - Check coverage
5. forge_test --gas-report - Optimize gas
6. forge_script - Deploy
```

---

## Tips for Working with Claude

### Good Prompts

✅ "Compile and test the SupplyChain contract"
✅ "Check if Anvil is running, if not start it"
✅ "Deploy using DeployLocal script and show me the contract address"
✅ "Run tests matching 'Pause' with high verbosity"

### Less Effective Prompts

❌ "Do something with Foundry"
❌ "Test it" (ambiguous)
❌ "Make it work" (not specific)

### Best Practices

1. **Be Specific**: Mention exact file paths, test names, or contract addresses
2. **Provide Context**: Tell Claude what you're trying to accomplish
3. **Sequential Workflows**: For complex tasks, break them into steps
4. **Error Recovery**: If something fails, Claude can analyze and suggest fixes
5. **Verify State**: Ask Claude to check Anvil status or test results before proceeding

---

## Troubleshooting Examples

### Anvil Won't Start

**Prompt:**
```
Anvil failed to start. Can you check if it's already running and try on a different port?
```

**Claude will:**
1. `anvil_status` - Check current status
2. If running: `anvil_stop` - Stop existing instance
3. `anvil_start` with alternative port

### Tests Failing Unexpectedly

**Prompt:**
```
Tests are failing. Can you:
1. Show me the test output with maximum verbosity
2. Check if the contracts compiled successfully
3. Verify Anvil is running
```

**Claude's Diagnostic Steps:**
1. `forge_test` with verbosity=5
2. `forge_build` to check compilation
3. `anvil_status` to verify blockchain
4. Analyze outputs and suggest fixes

---

## Next Steps

After mastering these examples:

1. Integrate MCP Foundry into your development workflow
2. Combine with other MCP servers for enhanced capabilities
3. Create custom scripts that leverage multiple tools
4. Automate repetitive tasks through Claude

For more information, see [README.md](README.md).
