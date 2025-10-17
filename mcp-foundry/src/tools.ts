/**
 * Foundry MCP Tools Definitions
 *
 * Defines all available MCP tools for Foundry
 */

export const TOOLS = [
  // ============================================
  // FORGE TOOLS
  // ============================================
  {
    name: 'forge_build',
    description: 'Compile Solidity smart contracts using Forge',
    inputSchema: {
      type: 'object',
      properties: {
        workingDir: {
          type: 'string',
          description: 'Working directory (defaults to current directory)',
        },
        force: {
          type: 'boolean',
          description: 'Force recompilation (--force flag)',
        },
      },
    },
  },
  {
    name: 'forge_test',
    description: 'Run tests using Forge',
    inputSchema: {
      type: 'object',
      properties: {
        workingDir: {
          type: 'string',
          description: 'Working directory (defaults to current directory)',
        },
        matchTest: {
          type: 'string',
          description: 'Only run tests matching this pattern (--match-test)',
        },
        matchContract: {
          type: 'string',
          description: 'Only run tests in contracts matching this pattern (--match-contract)',
        },
        verbosity: {
          type: 'number',
          description: 'Verbosity level (1-5, where 1=-v, 2=-vv, etc.)',
          minimum: 1,
          maximum: 5,
        },
        gasReport: {
          type: 'boolean',
          description: 'Generate gas report (--gas-report)',
        },
      },
    },
  },
  {
    name: 'forge_coverage',
    description: 'Generate test coverage report',
    inputSchema: {
      type: 'object',
      properties: {
        workingDir: {
          type: 'string',
          description: 'Working directory (defaults to current directory)',
        },
      },
    },
  },
  {
    name: 'forge_script',
    description: 'Run a Solidity script',
    inputSchema: {
      type: 'object',
      properties: {
        scriptPath: {
          type: 'string',
          description: 'Path to the script file (e.g., script/Deploy.s.sol)',
        },
        workingDir: {
          type: 'string',
          description: 'Working directory (defaults to current directory)',
        },
        rpcUrl: {
          type: 'string',
          description: 'RPC URL for the network',
        },
        privateKey: {
          type: 'string',
          description: 'Private key for signing transactions (optional)',
        },
        broadcast: {
          type: 'boolean',
          description: 'Broadcast transactions (--broadcast)',
        },
        verify: {
          type: 'boolean',
          description: 'Verify contracts on Etherscan (--verify)',
        },
      },
      required: ['scriptPath'],
    },
  },
  {
    name: 'forge_clean',
    description: 'Remove build artifacts',
    inputSchema: {
      type: 'object',
      properties: {
        workingDir: {
          type: 'string',
          description: 'Working directory (defaults to current directory)',
        },
      },
    },
  },

  // ============================================
  // CAST TOOLS
  // ============================================
  {
    name: 'cast_call',
    description: 'Call a read-only function on a smart contract',
    inputSchema: {
      type: 'object',
      properties: {
        contractAddress: {
          type: 'string',
          description: 'Contract address (0x...)',
        },
        signature: {
          type: 'string',
          description: 'Function signature (e.g., "balanceOf(address)(uint256)")',
        },
        args: {
          type: 'array',
          items: { type: 'string' },
          description: 'Function arguments',
        },
        rpcUrl: {
          type: 'string',
          description: 'RPC URL',
        },
        blockNumber: {
          type: 'string',
          description: 'Block number (optional, defaults to latest)',
        },
      },
      required: ['contractAddress', 'signature', 'rpcUrl'],
    },
  },
  {
    name: 'cast_send',
    description: 'Send a transaction to a smart contract',
    inputSchema: {
      type: 'object',
      properties: {
        contractAddress: {
          type: 'string',
          description: 'Contract address (0x...)',
        },
        signature: {
          type: 'string',
          description: 'Function signature (e.g., "transfer(address,uint256)")',
        },
        args: {
          type: 'array',
          items: { type: 'string' },
          description: 'Function arguments',
        },
        rpcUrl: {
          type: 'string',
          description: 'RPC URL',
        },
        privateKey: {
          type: 'string',
          description: 'Private key for signing (0x...)',
        },
        value: {
          type: 'string',
          description: 'ETH value to send (optional)',
        },
        gasLimit: {
          type: 'string',
          description: 'Gas limit (optional)',
        },
      },
      required: ['contractAddress', 'signature', 'rpcUrl', 'privateKey'],
    },
  },
  {
    name: 'cast_block_number',
    description: 'Get the current block number',
    inputSchema: {
      type: 'object',
      properties: {
        rpcUrl: {
          type: 'string',
          description: 'RPC URL',
        },
      },
      required: ['rpcUrl'],
    },
  },
  {
    name: 'cast_balance',
    description: 'Get the ETH balance of an address',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Ethereum address (0x...)',
        },
        rpcUrl: {
          type: 'string',
          description: 'RPC URL',
        },
      },
      required: ['address', 'rpcUrl'],
    },
  },
  {
    name: 'cast_chain_id',
    description: 'Get the chain ID',
    inputSchema: {
      type: 'object',
      properties: {
        rpcUrl: {
          type: 'string',
          description: 'RPC URL',
        },
      },
      required: ['rpcUrl'],
    },
  },

  // ============================================
  // ANVIL TOOLS
  // ============================================
  {
    name: 'anvil_start',
    description: 'Start Anvil local blockchain (runs in background)',
    inputSchema: {
      type: 'object',
      properties: {
        port: {
          type: 'number',
          description: 'Port to listen on (default: 8545)',
        },
        chainId: {
          type: 'number',
          description: 'Chain ID (default: 31337)',
        },
        accounts: {
          type: 'number',
          description: 'Number of accounts to generate (default: 10)',
        },
        balance: {
          type: 'number',
          description: 'Balance per account in ETH (default: 10000)',
        },
        blockTime: {
          type: 'number',
          description: 'Block time in seconds (default: instant)',
        },
        fork: {
          type: 'string',
          description: 'Fork from a network (provide RPC URL)',
        },
        forkBlockNumber: {
          type: 'number',
          description: 'Fork from specific block number',
        },
      },
    },
  },
  {
    name: 'anvil_stop',
    description: 'Stop the running Anvil instance',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'anvil_status',
    description: 'Check if Anvil is running and get logs',
    inputSchema: {
      type: 'object',
      properties: {
        lastNLogs: {
          type: 'number',
          description: 'Number of recent log lines to return',
        },
      },
    },
  },
];
