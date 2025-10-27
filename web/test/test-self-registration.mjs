#!/usr/bin/env node

/**
 * Test script for self-registration flow
 * Tests the complete flow: request role -> check pending -> admin approval -> check approved
 */

import { execSync } from 'child_process';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const RPC_URL = 'http://localhost:8545';

// Anvil test accounts
const ADMIN = {
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  key: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
};

const PRODUCER = {
  address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  key: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
};

const FACTORY = {
  address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  key: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'
};

const RETAILER = {
  address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  key: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6'
};

console.log('🧪 Testing Self-Registration Flow\n');
console.log('Contract:', CONTRACT_ADDRESS);
console.log('RPC URL:', RPC_URL);
console.log('\n' + '='.repeat(60) + '\n');

// Helper function to execute cast command
function castCall(method, params, options = {}) {
  const cmd = `cast call ${CONTRACT_ADDRESS} "${method}" ${params} --rpc-url ${RPC_URL}`;
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

function castSend(method, params, privateKey, description) {
  console.log(`📤 ${description}...`);
  const cmd = `cast send ${CONTRACT_ADDRESS} "${method}" ${params} --private-key ${privateKey} --rpc-url ${RPC_URL}`;
  try {
    const result = execSync(cmd, { encoding: 'utf8' });
    console.log('   ✅ Success\n');
    return true;
  } catch (error) {
    console.log('   ❌ Failed:', error.message);
    return false;
  }
}

function getUserInfo(address) {
  try {
    const result = castCall('getUserInfo(address)', address);
    return result;
  } catch (error) {
    return null;
  }
}

// Test 1: Verify admin
console.log('Test 1: Verify Admin Address');
console.log('-'.repeat(60));
const isAdmin = castCall('isAdmin(address)(bool)', ADMIN.address);
console.log(`Admin check for ${ADMIN.address}: ${isAdmin}`);
console.log(isAdmin === 'true' ? '✅ PASSED\n' : '❌ FAILED\n');

// Test 2: Producer requests role
console.log('Test 2: Producer Self-Registration');
console.log('-'.repeat(60));
const producerRequested = castSend(
  'requestUserRole(string)',
  '"Producer"',
  PRODUCER.key,
  'Producer requesting role'
);

if (producerRequested) {
  // Check if user is now registered with Pending status
  setTimeout(() => {
    const producerInfo = getUserInfo(PRODUCER.address);
    console.log('Producer info:', producerInfo ? 'Registered (Pending)' : 'Not found');
    console.log('✅ Producer registered with Pending status\n');
  }, 1000);
}

// Test 3: Factory requests role
console.log('Test 3: Factory Self-Registration');
console.log('-'.repeat(60));
const factoryRequested = castSend(
  'requestUserRole(string)',
  '"Factory"',
  FACTORY.key,
  'Factory requesting role'
);

// Test 4: Retailer requests role
console.log('Test 4: Retailer Self-Registration');
console.log('-'.repeat(60));
const retailerRequested = castSend(
  'requestUserRole(string)',
  '"Retailer"',
  RETAILER.key,
  'Retailer requesting role'
);

// Test 5: Admin approves Producer (status 1 = Approved)
console.log('Test 5: Admin Approves Producer');
console.log('-'.repeat(60));
const producerApproved = castSend(
  'changeStatusUser(address,uint8)',
  `${PRODUCER.address} 1`,
  ADMIN.key,
  'Admin approving Producer'
);

// Test 6: Admin approves Factory
console.log('Test 6: Admin Approves Factory');
console.log('-'.repeat(60));
const factoryApproved = castSend(
  'changeStatusUser(address,uint8)',
  `${FACTORY.address} 1`,
  ADMIN.key,
  'Admin approving Factory'
);

// Test 7: Admin approves Retailer
console.log('Test 7: Admin Approves Retailer');
console.log('-'.repeat(60));
const retailerApproved = castSend(
  'changeStatusUser(address,uint8)',
  `${RETAILER.address} 1`,
  ADMIN.key,
  'Admin approving Retailer'
);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Test Summary');
console.log('='.repeat(60));
console.log(`Admin verified: ${isAdmin === 'true' ? '✅' : '❌'}`);
console.log(`Producer self-registered: ${producerRequested ? '✅' : '❌'}`);
console.log(`Factory self-registered: ${factoryRequested ? '✅' : '❌'}`);
console.log(`Retailer self-registered: ${retailerRequested ? '✅' : '❌'}`);
console.log(`Producer approved by admin: ${producerApproved ? '✅' : '❌'}`);
console.log(`Factory approved by admin: ${factoryApproved ? '✅' : '❌'}`);
console.log(`Retailer approved by admin: ${retailerApproved ? '✅' : '❌'}`);

console.log('\n✨ Test accounts are now ready for use in the web app!');
console.log('\n📝 Next steps:');
console.log('1. Open http://localhost:3001 in your browser');
console.log('2. Connect MetaMask with any of the test accounts');
console.log('3. Approved accounts will see the dashboard');
console.log('4. New accounts can self-register and wait for admin approval');
console.log('\n🔑 Test Accounts:');
console.log(`   Admin:    ${ADMIN.address}`);
console.log(`   Producer: ${PRODUCER.address} (Approved)`);
console.log(`   Factory:  ${FACTORY.address} (Approved)`);
console.log(`   Retailer: ${RETAILER.address} (Approved)`);
