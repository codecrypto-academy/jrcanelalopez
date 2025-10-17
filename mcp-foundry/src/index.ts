#!/usr/bin/env node

/**
 * Foundry MCP Server
 *
 * Model Context Protocol server for Foundry CLI tools (anvil, cast, forge)
 * Allows AI assistants to interact with Foundry through structured tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { TOOLS } from './tools.js';
import { FoundryExecutor } from './foundry-executor.js';
import { ToolHandlers } from './tool-handlers.js';

// Initialize
const executor = new FoundryExecutor();
const handlers = new ToolHandlers(executor);

// Create MCP server
const server = new Server(
  {
    name: 'mcp-foundry',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: string;

    switch (name) {
      // Forge tools
      case 'forge_build':
        result = await handlers.handleForgeBuild(args);
        break;
      case 'forge_test':
        result = await handlers.handleForgeTest(args);
        break;
      case 'forge_coverage':
        result = await handlers.handleForgeCoverage(args);
        break;
      case 'forge_script':
        result = await handlers.handleForgeScript(args);
        break;
      case 'forge_clean':
        result = await handlers.handleForgeClean(args);
        break;

      // Cast tools
      case 'cast_call':
        result = await handlers.handleCastCall(args);
        break;
      case 'cast_send':
        result = await handlers.handleCastSend(args);
        break;
      case 'cast_block_number':
        result = await handlers.handleCastBlockNumber(args);
        break;
      case 'cast_balance':
        result = await handlers.handleCastBalance(args);
        break;
      case 'cast_chain_id':
        result = await handlers.handleCastChainId(args);
        break;

      // Anvil tools
      case 'anvil_start':
        result = await handlers.handleAnvilStart(args);
        break;
      case 'anvil_stop':
        result = handlers.handleAnvilStop();
        break;
      case 'anvil_status':
        result = handlers.handleAnvilStatus(args);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Handle server errors
server.onerror = (error) => {
  console.error('[MCP Error]', error);
};

// Handle process termination
process.on('SIGINT', async () => {
  // Stop anvil if running
  if (executor.isAnvilRunning()) {
    executor.stopAnvil();
  }
  await server.close();
  process.exit(0);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Foundry MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
