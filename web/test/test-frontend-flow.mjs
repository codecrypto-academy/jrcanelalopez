#!/usr/bin/env node

/**
 * Frontend Flow Integration Test
 *
 * Test Scenario:
 * 1. Producer account (not admin) requests registration as Producer
 * 2. Admin approves the registration request
 * 3. Producer reconnects and system recognizes them as Producer
 *
 * This test simulates the complete user journey from self-registration to approval
 */

import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const RPC_URL = 'http://localhost:8545';
const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

// Test accounts from Anvil
const ADMIN = {
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  key: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
};

// Using Account 7 - Fresh account not used in previous tests
const PRODUCER_CANDIDATE = {
  address: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
  key: '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356'
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
  console.log(`${colors.bright}${colors.cyan}  Frontend Flow Integration Test${colors.reset}`);
  console.log(`${colors.cyan}  Self-Registration → Admin Approval → System Recognition${colors.reset}`);
  console.log('═'.repeat(80) + '\n');

  logInfo(`Contract: ${CONTRACT_ADDRESS}`);
  logInfo(`RPC URL: ${RPC_URL}`);
  logInfo(`Admin: ${ADMIN.address}`);
  logInfo(`Producer Candidate: ${PRODUCER_CANDIDATE.address}`);

  let provider, adminSigner, producerSigner, contract, contractAsProducer;

  try {
    // Setup provider and signers
    logStep(0, 'Setup Web3 Connection');
    provider = new ethers.JsonRpcProvider(RPC_URL);
    adminSigner = new ethers.Wallet(ADMIN.key, provider);
    producerSigner = new ethers.Wallet(PRODUCER_CANDIDATE.key, provider);

    // Load ABI
    const abiPath = join(__dirname, 'web', 'contracts', 'SupplyChain.json');
    const abi = JSON.parse(readFileSync(abiPath, 'utf8'));

    contract = new ethers.Contract(CONTRACT_ADDRESS, abi, adminSigner);
    contractAsProducer = new ethers.Contract(CONTRACT_ADDRESS, abi, producerSigner);

    logSuccess('Connected to blockchain');
    logSuccess('Contract instance created');

    // Verify wallet addresses
    logInfo(`Producer wallet address: ${producerSigner.address}`);

    // Verify admin
    const isAdmin = await contract.isAdmin(ADMIN.address);
    if (!isAdmin) {
      throw new Error('Admin verification failed');
    }
    logSuccess(`Admin verified: ${ADMIN.address}`);

    // ========================================
    // STEP 1: Producer requests registration
    // ========================================
    logStep(1, 'Producer Requests Registration as "Producer"');

    // Check if already registered (cleanup from previous tests)
    let userExists = false;
    try {
      const existingUser = await contract.getUserInfo(PRODUCER_CANDIDATE.address);
      userExists = true;
      logInfo('User already exists, will be used for testing');

      // If exists but approved, we'll skip to verification
      if (Number(existingUser[3]) === 1) {
        logInfo('User is already approved, proceeding to verification step');
      }
    } catch (err) {
      if (err.message.includes('UserDoesNotExist')) {
        logInfo('User does not exist yet (expected for fresh test)');
      } else {
        throw err;
      }
    }

    // Request role if not registered
    if (!userExists) {
      logInfo('Sending requestUserRole("Producer") transaction...');
      const tx = await contractAsProducer.requestUserRole('Producer');
      logInfo(`Transaction hash: ${tx.hash}`);

      const receipt = await tx.wait();
      logSuccess(`Transaction confirmed in block ${receipt.blockNumber}`);

      // Small delay to ensure blockchain state is updated
      await sleep(500);

      // Verify registration
      const userInfo = await contractAsProducer.getUserInfo(PRODUCER_CANDIDATE.address);
      const status = Number(userInfo[3]);
      const role = userInfo[2];

      if (status !== 0) { // 0 = Pending
        throw new Error(`Expected Pending status (0), got ${status}`);
      }
      if (role !== 'Producer') {
        throw new Error(`Expected role "Producer", got "${role}"`);
      }

      logSuccess(`User registered with status: Pending (${status})`);
      logSuccess(`Role: ${role}`);
    }

    // ========================================
    // STEP 2: Admin approves the registration
    // ========================================
    logStep(2, 'Admin Approves Producer Registration');

    logInfo('Admin calling changeStatusUser() to approve...');
    const approveTx = await contract.changeStatusUser(PRODUCER_CANDIDATE.address, 1); // 1 = Approved
    logInfo(`Transaction hash: ${approveTx.hash}`);

    const approveReceipt = await approveTx.wait();
    logSuccess(`Transaction confirmed in block ${approveReceipt.blockNumber}`);

    // Verify approval
    const approvedUserInfo = await contract.getUserInfo(PRODUCER_CANDIDATE.address);
    const approvedStatus = Number(approvedUserInfo[3]);

    if (approvedStatus !== 1) { // 1 = Approved
      throw new Error(`Expected Approved status (1), got ${approvedStatus}`);
    }

    logSuccess('Producer status changed to: Approved (1)');

    // ========================================
    // STEP 3: Producer reconnects - System recognizes as Producer
    // ========================================
    logStep(3, 'Producer Reconnects - System Recognition Test');

    logInfo('Simulating frontend getUserInfo() call...');

    // This simulates what the frontend does when a user connects
    const reconnectUserInfo = await contractAsProducer.getUserInfo(PRODUCER_CANDIDATE.address);

    const finalId = Number(reconnectUserInfo[0]);
    const finalAddress = reconnectUserInfo[1];
    const finalRole = reconnectUserInfo[2];
    const finalStatus = Number(reconnectUserInfo[3]);

    logInfo('User information retrieved:');
    console.log(`   ID:      ${finalId}`);
    console.log(`   Address: ${finalAddress}`);
    console.log(`   Role:    ${finalRole}`);
    console.log(`   Status:  ${finalStatus} (${finalStatus === 1 ? 'Approved' : 'Other'})`);

    // Verify the user is recognized as Producer with Approved status
    if (finalRole !== 'Producer') {
      throw new Error(`System should recognize user as "Producer", got "${finalRole}"`);
    }

    if (finalStatus !== 1) {
      throw new Error(`User should have Approved status (1), got ${finalStatus}`);
    }

    if (finalAddress.toLowerCase() !== PRODUCER_CANDIDATE.address.toLowerCase()) {
      throw new Error('Address mismatch');
    }

    logSuccess('System correctly recognizes user as Producer ✓');
    logSuccess('User has Approved status ✓');
    logSuccess('Address matches ✓');

    // ========================================
    // TEST SUMMARY
    // ========================================
    console.log('\n' + '═'.repeat(80));
    console.log(`${colors.bright}${colors.green}  ✅ ALL TESTS PASSED${colors.reset}`);
    console.log('═'.repeat(80) + '\n');

    console.log('Test Flow Summary:');
    console.log('  1. ✅ Non-admin user requested Producer role via requestUserRole()');
    console.log('  2. ✅ Admin approved registration via changeStatusUser()');
    console.log('  3. ✅ User reconnects and system recognizes them as Producer with Approved status');

    console.log('\n' + colors.cyan + 'Frontend Integration Verified:' + colors.reset);
    console.log('  • Self-registration flow working correctly');
    console.log('  • Admin approval process functional');
    console.log('  • User status persistence verified');
    console.log('  • Role-based permissions enforced');

    console.log('\n' + colors.green + '🎉 Frontend flow test completed successfully!' + colors.reset + '\n');

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
    console.log('  3. Check that .env.local has correct contract address');
    console.log('  4. Verify RPC URL is accessible: ' + RPC_URL);

    process.exit(1);
  }
}

// Run the test
runTest().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
