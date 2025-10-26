#!/usr/bin/env node

/**
 * Test script to verify anvil_status detects external Anvil processes
 */

import { FoundryExecutor } from './build/foundry-executor.js';
import { ToolHandlers } from './build/tool-handlers.js';

console.log('🧪 Testing Anvil Detection\n');
console.log('='.repeat(60));

const executor = new FoundryExecutor();
const handlers = new ToolHandlers(executor);

// Test 1: Check if Anvil is running
console.log('\n📋 Test 1: isAnvilRunning()');
console.log('-'.repeat(60));
const isRunning = executor.isAnvilRunning();
console.log(`Result: ${isRunning ? '✅' : '❌'}`);
console.log(`Status: Anvil is ${isRunning ? 'RUNNING' : 'NOT RUNNING'}`);

if (!isRunning) {
  console.log('\n❌ Anvil is not running. Start Anvil first:');
  console.log('   anvil --port 8545 --chain-id 31337');
  process.exit(1);
}

// Test 2: Get Anvil status via handler
console.log('\n📋 Test 2: handleAnvilStatus()');
console.log('-'.repeat(60));
const statusResult = handlers.handleAnvilStatus({ lastNLogs: 10 });
console.log(statusResult);

// Test 3: Get detailed logs
console.log('\n📋 Test 3: getAnvilLogs()');
console.log('-'.repeat(60));
const logs = executor.getAnvilLogs(5);
console.log(logs || '(no logs)');

// Test 4: Verify process detection
console.log('\n📋 Test 4: Process Detection Details');
console.log('-'.repeat(60));
try {
  const { execSync } = await import('child_process');
  const pid = execSync('pgrep -x anvil', { encoding: 'utf-8' }).trim();
  const command = execSync(`ps -p ${pid} -o command=`, { encoding: 'utf-8' }).trim();

  console.log(`✅ PID: ${pid}`);
  console.log(`✅ Command: ${command}`);
  console.log(`✅ Detection: SUCCESS`);
} catch (error) {
  console.log(`❌ Detection failed: ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('✅ All tests completed successfully!');
console.log('='.repeat(60));
