#!/usr/bin/env node

/**
 * User Rejection Flow Test
 *
 * Test Scenario:
 * 1. User requests Producer role
 * 2. Admin REJECTS the user registration (status = 2)
 * 3. User reconnects and sees Rejected status
 *
 * This test verifies the rejection workflow and that rejected users
 * are properly identified when they reconnect to the application.
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

// Using Anvil Account #9 for testing rejection flow
const REJECTED_USER = {
  address: '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', // Account #9
  key: '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
  role: 'Producer'
};

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

function logWarning(message) {
  log('⚠️ ', message, colors.yellow);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main test function
async function runTest() {
  console.log('\n' + '═'.repeat(80));
  console.log(`${colors.bright}${colors.cyan}  User Rejection Flow Test${colors.reset}`);
  console.log(`${colors.cyan}  User Requests Role → Admin Rejects → User Sees Rejection${colors.reset}`);
  console.log('═'.repeat(80) + '\n');

  logInfo(`Contract: ${CONTRACT_ADDRESS}`);
  logInfo(`RPC URL: ${RPC_URL}`);
  logInfo(`Admin: ${ADMIN.address}`);
  logInfo(`Rejected User: ${REJECTED_USER.address}`);
  logInfo(`Requested Role: ${REJECTED_USER.role}`);

  let provider, adminSigner, userSigner, contract;

  try {
    // Setup provider and signers
    logStep(0, 'Setup Web3 Connection');
    provider = new ethers.JsonRpcProvider(RPC_URL);
    adminSigner = new ethers.Wallet(ADMIN.key, provider);
    userSigner = new ethers.Wallet(REJECTED_USER.key, provider);

    // Load ABI
    const abiPath = join(__dirname, '..', 'contracts', 'SupplyChain.json');
    const abi = JSON.parse(readFileSync(abiPath, 'utf8'));

    contract = new ethers.Contract(CONTRACT_ADDRESS, abi, adminSigner);

    logSuccess('Connected to blockchain');
    logSuccess(`Admin signer created: ${ADMIN.address.slice(0, 10)}...`);
    logSuccess(`User signer created: ${REJECTED_USER.address.slice(0, 10)}...`);

    // Verify admin
    const isAdmin = await contract.isAdmin(ADMIN.address);
    if (!isAdmin) {
      throw new Error('Admin verification failed');
    }
    logSuccess(`Admin verified: ${ADMIN.address}`);

    // ========================================
    // STEP 1: User requests role
    // ========================================
    logStep(1, 'User Requests Producer Role');

    logInfo(`User (${REJECTED_USER.address.slice(0, 10)}...) requesting ${REJECTED_USER.role} role...`);

    const userContract = contract.connect(userSigner);

    try {
      const requestTx = await userContract.requestUserRole(REJECTED_USER.role);
      await requestTx.wait();
      logSuccess(`Role request submitted (tx: ${requestTx.hash.slice(0, 10)}...)`);
    } catch (err) {
      // User might already be registered, check status
      if (err.message?.includes('UserAlreadyRegistered')) {
        logInfo('User already registered, checking current status...');
        const userInfo = await contract.getUserInfo(REJECTED_USER.address);
        const currentStatus = Number(userInfo[3]);
        logInfo(`Current status: ${currentStatus} (${currentStatus === 0 ? 'Pending' : currentStatus === 1 ? 'Approved' : currentStatus === 2 ? 'Rejected' : 'Canceled'})`);

        // If already rejected, we can skip to step 3
        if (currentStatus === 2) {
          logWarning('User is already in Rejected state. Skipping to verification step.');
        }
      } else {
        throw err;
      }
    }

    // Small delay to ensure blockchain state is updated
    await sleep(500);

    // Verify user is registered with Pending status (or already Rejected)
    logInfo('Verifying registration status...');
    let userInfo = await contract.getUserInfo(REJECTED_USER.address);
    let status = Number(userInfo[3]);
    let role = userInfo[2];

    if (role !== REJECTED_USER.role) {
      throw new Error(`Role mismatch: expected ${REJECTED_USER.role}, got ${role}`);
    }

    if (status === 0) {
      logSuccess(`User registered with Pending status (0)`);
    } else if (status === 2) {
      logWarning(`User already has Rejected status (2)`);
    } else {
      throw new Error(`Unexpected status: ${status}. Expected Pending (0) or Rejected (2).`);
    }

    // ========================================
    // STEP 2: Admin REJECTS user
    // ========================================
    logStep(2, 'Admin Rejects User Registration');

    if (status !== 2) {
      logInfo(`Admin rejecting user ${REJECTED_USER.address.slice(0, 10)}...`);

      const rejectTx = await contract.changeStatusUser(REJECTED_USER.address, 2); // 2 = Rejected
      await rejectTx.wait();

      logSuccess(`User rejected by admin (tx: ${rejectTx.hash.slice(0, 10)}...)`);
    } else {
      logInfo('User is already rejected, skipping rejection step');
    }

    // Small delay
    await sleep(500);

    // Verify user is now rejected
    userInfo = await contract.getUserInfo(REJECTED_USER.address);
    status = Number(userInfo[3]);

    if (status !== 2) {
      throw new Error(`Status should be Rejected (2), but got ${status}`);
    }

    logSuccess(`User status confirmed: Rejected (2)`);

    // ========================================
    // STEP 3: User reconnects and sees rejection
    // ========================================
    logStep(3, 'User Reconnects - Verification of Rejection');

    logInfo('Simulating user reconnection and checking their status...');

    // User checks their own info (simulating frontend reconnection)
    const reconnectedUserContract = contract.connect(userSigner);
    const reconnectedUserInfo = await reconnectedUserContract.getUserInfo(REJECTED_USER.address);

    const id = Number(reconnectedUserInfo[0]);
    const address = reconnectedUserInfo[1];
    const userRole = reconnectedUserInfo[2];
    const userStatus = Number(reconnectedUserInfo[3]);

    console.log(`\n   ${colors.cyan}User Info After Reconnection:${colors.reset}`);
    console.log(`   ID:      ${id}`);
    console.log(`   Address: ${address}`);
    console.log(`   Role:    ${userRole}`);
    console.log(`   Status:  ${userStatus} (${userStatus === 2 ? colors.red + 'Rejected ✗' + colors.reset : 'Not Rejected'})`);

    // Verify rejection
    if (userStatus !== 2) {
      throw new Error(`User should have Rejected status (2), got ${userStatus}`);
    }

    if (userRole !== REJECTED_USER.role) {
      throw new Error(`Role should be ${REJECTED_USER.role}, got ${userRole}`);
    }

    if (address.toLowerCase() !== REJECTED_USER.address.toLowerCase()) {
      throw new Error('Address mismatch');
    }

    logSuccess(`User correctly identified as REJECTED ✗`);

    // ========================================
    // STEP 4: Verify rejected user CANNOT operate
    // ========================================
    logStep(4, 'Verify Rejected User Cannot Perform Actions');

    logInfo('Attempting to create a token as rejected user (should FAIL)...');

    try {
      const createTokenTx = await reconnectedUserContract.createToken(
        'Test Token',
        100,
        '{"type": "test"}',
        0
      );
      await createTokenTx.wait();

      // If we reach here, the test should fail
      throw new Error('Rejected user should NOT be able to create tokens!');
    } catch (err) {
      if (err.message?.includes('UserNotApproved') || err.message?.includes('execution reverted')) {
        logSuccess('Rejected user correctly BLOCKED from creating tokens ✓');
      } else {
        throw err;
      }
    }

    // ========================================
    // TEST SUMMARY
    // ========================================
    console.log('\n' + '═'.repeat(80));
    console.log(`${colors.bright}${colors.green}  ✅ ALL TESTS PASSED${colors.reset}`);
    console.log('═'.repeat(80) + '\n');

    console.log('Test Flow Summary:');
    console.log('  1. ✅ User requested Producer role');
    console.log('  2. ✅ Admin rejected the user registration');
    console.log('  3. ✅ User reconnected and saw Rejected status');
    console.log('  4. ✅ Rejected user was blocked from performing actions');

    console.log('\n' + colors.cyan + 'Rejection Verification Results:' + colors.reset);
    console.log(`  • User:    ${REJECTED_USER.address}`);
    console.log(`  • Role:    ${REJECTED_USER.role}`);
    console.log(`  • Status:  ${colors.red}Rejected ✗${colors.reset}`);
    console.log(`  • Can Operate: ${colors.red}NO${colors.reset}`);

    console.log('\n' + colors.green + '🎉 User rejection flow test completed successfully!' + colors.reset + '\n');

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
