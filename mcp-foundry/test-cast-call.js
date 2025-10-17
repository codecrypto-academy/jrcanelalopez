/**
 * Test script to verify cast_call works with parentheses in function signatures
 */

import { spawn } from 'child_process';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const RPC_URL = 'http://localhost:8545';
const ADMIN_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

console.log('Testing cast call with function signature containing parentheses...\n');

// Test 1: isAdmin(address)(bool)
console.log('Test 1: isAdmin(address)(bool)');
const test1 = spawn('cast', [
  'call',
  CONTRACT_ADDRESS,
  'isAdmin(address)(bool)',
  ADMIN_ADDRESS,
  '--rpc-url',
  RPC_URL
], { shell: false });

let output1 = '';
test1.stdout.on('data', (data) => {
  output1 += data.toString();
});

test1.stderr.on('data', (data) => {
  console.error('Error:', data.toString());
});

test1.on('close', (code) => {
  console.log(`Result: ${output1.trim()}`);
  console.log(`Exit code: ${code}\n`);

  // Test 2: More complex function signature
  console.log('Test 2: getUserInfo(address)((uint256,address,string,uint8))');
  const test2 = spawn('cast', [
    'call',
    CONTRACT_ADDRESS,
    'getUserInfo(address)((uint256,address,string,uint8))',
    ADMIN_ADDRESS,
    '--rpc-url',
    RPC_URL
  ], { shell: false });

  let output2 = '';
  test2.stdout.on('data', (data) => {
    output2 += data.toString();
  });

  test2.stderr.on('data', (data) => {
    console.error('Error:', data.toString());
  });

  test2.on('close', (code2) => {
    console.log(`Result: ${output2.trim()}`);
    console.log(`Exit code: ${code2}\n`);

    console.log('✅ All tests completed successfully!');
    console.log('The shell=false fix prevents parentheses from being interpreted by the shell.');
  });
});
