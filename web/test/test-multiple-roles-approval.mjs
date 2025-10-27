#!/usr/bin/env node

/**
 * Multiple Roles Registration and Approval Test
 *
 * Test Scenario:
 * 1. Four users (Producer, Factory, Retailer, Consumer) request registration
 * 2. Admin approves all four users
 * 3. Each user reconnects and system recognizes them with their assigned roles
 *
 * This test verifies the complete multi-user registration and approval workflow
 * for all roles in the supply chain.
 */

import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const RPC_URL = 'http://localhost:8545';
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Test accounts from Anvil
const ADMIN = {
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  key: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
};

// Using Anvil accounts 5, 6, 7, 8 for testing
const PRODUCER_CANDIDATE = {
  address: '0x976EA74026E726554dB657fA54763abd0C3a0aa9', // Account #7
  key: '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
  role: 'Producer'
};

const FACTORY_CANDIDATE = {
  address: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955', // Account #6
  key: '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
  role: 'Factory'
};

const RETAILER_CANDIDATE = {
  address: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f', // Account #8
  key: '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
  role: 'Retailer'
};

const CONSUMER_CANDIDATE = {
  address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', // Account #5
  key: '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  role: 'Consumer'
};

const CANDIDATES = [PRODUCER_CANDIDATE, FACTORY_CANDIDATE, RETAILER_CANDIDATE, CONSUMER_CANDIDATE];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.bright}${colors.blue}━━━ Step ${step}: ${message}${colors.reset}`);
}

function logSuccess(message) {
  log('✅', message, colors.green);
}

function logError(message) {
  log('❌', message, colors.red);
}

function logInfo(message) {
  log('ℹ️ ', message, colors.cyan);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main test function
async function runTest() {
  console.log('\n' + '═'.repeat(80));
  console.log(`${colors.bright}${colors.cyan}  Multiple Roles Registration and Approval Test${colors.reset}`);
  console.log(`${colors.cyan}  Producer + Factory + Retailer + Consumer → Admin Approval → System Recognition${colors.reset}`);
  console.log('═'.repeat(80) + '\n');

  logInfo(`Contract: ${CONTRACT_ADDRESS}`);
  logInfo(`RPC URL: ${RPC_URL}`);
  logInfo(`Admin: ${ADMIN.address}`);
  logInfo(`Testing ${CANDIDATES.length} users: Producer, Factory, Retailer, Consumer`);

  let provider, adminSigner, contract;
  const userSigners = {};

  try {
    // Setup provider and signers
    logStep(0, 'Setup Web3 Connection');
    provider = new ethers.JsonRpcProvider(RPC_URL);
    adminSigner = new ethers.Wallet(ADMIN.key, provider);

    // Create signers for each candidate
    for (const candidate of CANDIDATES) {
      userSigners[candidate.role] = new ethers.Wallet(candidate.key, provider);
    }

    // Load ABI
    const abiPath = join(__dirname, '..', 'contracts', 'SupplyChain.json');
    const abi = JSON.parse(readFileSync(abiPath, 'utf8'));

    contract = new ethers.Contract(CONTRACT_ADDRESS, abi, adminSigner);

    logSuccess('Connected to blockchain');
    logSuccess(`Created ${Object.keys(userSigners).length} user signers`);

    // Verify admin
    const isAdmin = await contract.isAdmin(ADMIN.address);
    if (!isAdmin) {
      throw new Error('Admin verification failed');
    }
    logSuccess(`Admin verified: ${ADMIN.address}`);

    // ========================================
    // STEP 1: All users request registration
    // ========================================
    logStep(1, 'Users Request Registration');

    for (const candidate of CANDIDATES) {
      logInfo(`${candidate.role} (${candidate.address.slice(0, 10)}...) requesting role...`);

      const userContract = contract.connect(userSigners[candidate.role]);

      try {
        const tx = await userContract.requestUserRole(candidate.role);
        await tx.wait();
        logSuccess(`${candidate.role} registration requested (tx: ${tx.hash.slice(0, 10)}...)`);
      } catch (err) {
        // User might already be registered, check status
        if (err.message?.includes('UserAlreadyRegistered')) {
          logInfo(`${candidate.role} already registered, checking status...`);
          const userInfo = await contract.getUserInfo(candidate.address);
          logInfo(`Current status: ${Number(userInfo[3])} (${userInfo[2]})`);
        } else {
          throw err;
        }
      }
    }

    logSuccess('All users requested registration');

    // Small delay to ensure blockchain state is updated
    await sleep(500);

    // Verify all users are Pending
    logInfo('Verifying registration status...');
    for (const candidate of CANDIDATES) {
      try {
        const userInfo = await contract.getUserInfo(candidate.address);
        const status = Number(userInfo[3]);
        const role = userInfo[2];

        if (role !== candidate.role) {
          throw new Error(`Role mismatch for ${candidate.address}: expected ${candidate.role}, got ${role}`);
        }

        logSuccess(`${candidate.role}: Registered with status ${status} (${status === 0 ? 'Pending' : status === 1 ? 'Approved' : 'Other'})`);
      } catch (err) {
        if (err.message?.includes('UserDoesNotExist')) {
          throw new Error(`${candidate.role} registration failed - user not found in contract`);
        }
        throw err;
      }
    }

    // ========================================
    // STEP 2: Admin approves all users
    // ========================================
    logStep(2, 'Admin Approves All Users');

    for (const candidate of CANDIDATES) {
      logInfo(`Admin approving ${candidate.role}...`);

      const approveTx = await contract.changeStatusUser(candidate.address, 1); // 1 = Approved
      await approveTx.wait();

      logSuccess(`${candidate.role} approved (tx: ${approveTx.hash.slice(0, 10)}...)`);

      // Small delay to ensure nonce is updated for next transaction
      await sleep(200);
    }

    logSuccess('All users approved by admin');

    // ========================================
    // STEP 3: Users reconnect and verify recognition
    // ========================================
    logStep(3, 'Users Reconnect - System Recognition Test');

    logInfo('Simulating user reconnections and verifying role recognition...');

    const results = [];

    for (const candidate of CANDIDATES) {
      logInfo(`\nTesting ${candidate.role} reconnection...`);

      const userContract = contract.connect(userSigners[candidate.role]);
      const userInfo = await userContract.getUserInfo(candidate.address);

      const id = Number(userInfo[0]);
      const address = userInfo[1];
      const role = userInfo[2];
      const status = Number(userInfo[3]);

      console.log(`   ${colors.cyan}User Info:${colors.reset}`);
      console.log(`   ID:      ${id}`);
      console.log(`   Address: ${address}`);
      console.log(`   Role:    ${role}`);
      console.log(`   Status:  ${status} (${status === 1 ? 'Approved ✓' : 'Not Approved ✗'})`);

      // Verify
      if (role !== candidate.role) {
        throw new Error(`System should recognize ${candidate.address} as ${candidate.role}, got ${role}`);
      }

      if (status !== 1) {
        throw new Error(`${candidate.role} should have Approved status (1), got ${status}`);
      }

      if (address.toLowerCase() !== candidate.address.toLowerCase()) {
        throw new Error('Address mismatch');
      }

      logSuccess(`${candidate.role} correctly recognized ✓`);

      results.push({
        role: candidate.role,
        address: candidate.address,
        status: 'Approved',
        verified: true
      });
    }

    // ========================================
    // TEST SUMMARY
    // ========================================
    console.log('\n' + '═'.repeat(80));
    console.log(`${colors.bright}${colors.green}  ✅ ALL TESTS PASSED${colors.reset}`);
    console.log('═'.repeat(80) + '\n');

    console.log('Test Flow Summary:');
    console.log('  1. ✅ Producer, Factory, Retailer, and Consumer requested their roles');
    console.log('  2. ✅ Admin approved all four users');
    console.log('  3. ✅ All users reconnected and were recognized with correct roles');

    console.log('\n' + colors.cyan + 'Verification Results:' + colors.reset);
    for (const result of results) {
      console.log(`  • ${result.role.padEnd(10)} ${result.address} → ${result.status} ✓`);
    }

    console.log('\n' + colors.green + '🎉 Multi-user registration test completed successfully!' + colors.reset + '\n');

    process.exit(0);

  } catch (error) {
    console.log('\n' + '═'.repeat(80));
    console.log(`${colors.bright}${colors.red}  ❌ TEST FAILED${colors.reset}`);
    console.log('═'.repeat(80) + '\n');

    logError('Error: ' + error.message);

    if (error.stack) {
      console.log('\n' + colors.red + 'Stack trace:' + colors.reset);
      console.log(error.stack);
    }

    console.log('\n' + colors.yellow + 'Troubleshooting:' + colors.reset);
    console.log('  1. Ensure Anvil is running: anvil');
    console.log('  2. Ensure contract is deployed at: ' + CONTRACT_ADDRESS);
    console.log('  3. Verify RPC URL is accessible: ' + RPC_URL);
    console.log('  4. Check that test accounts have ETH');

    process.exit(1);
  }
}

// Run the test
runTest().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
