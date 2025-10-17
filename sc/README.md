# Supply Chain Tracker - Smart Contracts

Smart contracts for the Supply Chain Tracker project using Foundry.

## 📋 Quick Start

```bash
# 1. Install dependencies
forge install

# 2. Build contracts
forge build

# 3. Run tests
forge test

# 4. Run tests with gas report
forge test --gas-report
```

## 🧪 Testing & Development

### Running Tests

```bash
# All tests
forge test

# Specific test file
forge test --match-path test/SupplyChain.t.sol

# Specific test function
forge test --match-test testCreateToken

# With verbosity
forge test -vvv

# Gas profiling tests
forge test --match-contract SupplyChainGasReport -vv
```

### Test Coverage

```bash
# Generate coverage report
forge coverage

# HTML coverage report
forge coverage --report lcov
genhtml lcov.info -o coverage/
```

**Current test stats**: 46 tests, all passing ✅
- 34 functional tests
- 10 gas profiling tests
- 2 example tests

## 🚀 Local Deployment & Testing

For local testing with Anvil, we have automated scripts:

### Option 1: Quick Test (Recommended)

```bash
# Terminal 1: Start Anvil
./start-anvil.sh

# Terminal 2: Deploy and test
./deploy-local.sh     # Deploy contract
./test-quick.sh       # Quick test (~3 seconds)
```

### Option 2: Complete Flow Test

```bash
# Terminal 1: Start Anvil
./start-anvil.sh

# Terminal 2: Deploy and full test
./deploy-local.sh          # Deploy contract
./test-supply-chain.sh     # Complete flow test (~30 seconds)
```

### What These Scripts Do

**`start-anvil.sh`**: Starts local blockchain
- 10 accounts with 10,000 ETH each
- Block time: 1 second
- Chain ID: 31337
- Port: 8545

**`deploy-local.sh`**: Deploys contract
- Compiles contracts
- Deploys to Anvil
- Saves deployment info to `./deployments/local.json`

**`test-quick.sh`**: Basic functionality test
- Registers Producer
- Admin approves
- Creates token
- Verifies balance

**`test-supply-chain.sh`**: Complete flow test
- Registers 4 users (Producer, Factory, Retailer, Consumer)
- Admin approves all
- Producer creates raw material
- Complete transfer flow: Producer → Factory → Retailer → Consumer
- Factory creates derived product
- Verifies traceability
- Tests pause/unpause functionality

📖 **See [TESTING.md](./TESTING.md) for detailed testing guide**

## 📝 Contract Overview

### SupplyChain.sol

Main contract implementing the supply chain tracker.

**Key Features**:
- Role-based access control (Producer, Factory, Retailer, Consumer, Admin)
- Token creation with parent tracking
- Transfer approval system
- Pausable for emergencies (OpenZeppelin)
- Owner management (OpenZeppelin)

**Gas Usage** (approximate):
- Deploy: ~3.5M gas
- Register user: ~180k gas
- Approve user: ~74k gas
- Create token: ~286k gas
- Transfer: ~308k gas
- Accept transfer: ~141k gas

## 🔧 Foundry Tools

Foundry consists of:

- **Forge**: Ethereum testing framework
- **Cast**: Swiss army knife for interacting with EVM smart contracts
- **Anvil**: Local Ethereum node
- **Chisel**: Solidity REPL

## 📚 Documentation

- [Foundry Book](https://book.getfoundry.sh/)
- [TESTING.md](./TESTING.md) - Complete testing guide
- [../README.md](../README.md) - Project documentation
- [../CLAUDE.md](../CLAUDE.md) - Technical specifications

## 🏗️ Project Structure

```
sc/
├── src/
│   └── SupplyChain.sol         # Main contract
├── script/
│   ├── Deploy.s.sol            # General deploy script
│   └── DeployLocal.s.sol       # Local/Anvil deploy script
├── test/
│   ├── SupplyChain.t.sol       # Functional tests (34 tests)
│   └── SupplyChainGasReport.t.sol  # Gas profiling (10 tests)
├── deployments/
│   └── local.json              # Local deployment info (generated)
├── start-anvil.sh              # Start local blockchain
├── deploy-local.sh             # Deploy to Anvil
├── test-quick.sh               # Quick functionality test
├── test-supply-chain.sh        # Complete flow test
├── TESTING.md                  # Testing guide
└── README.md                   # This file
```

## 🎯 Common Commands

```bash
# Build
forge build

# Test
forge test
forge test --gas-report
forge test -vvv

# Format code
forge fmt

# Local deployment
./start-anvil.sh        # Terminal 1
./deploy-local.sh       # Terminal 2
./test-supply-chain.sh  # Terminal 2

# Clean
forge clean

# Update dependencies
forge update
```

## 🔐 Security

- Uses OpenZeppelin Ownable and Pausable
- Custom errors for gas efficiency
- Comprehensive test coverage
- Role-based access control
- Transfer approval system

## 📊 Test Results

Latest test run: 46/46 passing ✅

```
Ran 3 test suites: 46 tests passed
  - SupplyChain.t.sol: 34 tests
  - SupplyChainGasReport.t.sol: 10 tests
  - Counter.t.sol: 2 tests
```

---

**Version**: 2.0
**Last updated**: October 17, 2025
**Smart Contract**: SupplyChain.sol v2.0 (with Ownable + Pausable)
