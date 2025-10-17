/**
 * Foundry MCP Server - Type Definitions
 */

export interface FoundryCommand {
  command: string;
  args: string[];
  timeout?: number;
  workingDir?: string;
}

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}

export interface ForgeTestOptions {
  matchTest?: string;
  matchContract?: string;
  verbosity?: number; // -v, -vv, -vvv, -vvvv, -vvvvv
  gasReport?: boolean;
  coverage?: boolean;
}

export interface CastCallOptions {
  contractAddress: string;
  signature: string;
  args?: string[];
  rpcUrl: string;
  blockNumber?: string;
}

export interface CastSendOptions {
  contractAddress: string;
  signature: string;
  args?: string[];
  rpcUrl: string;
  privateKey: string;
  value?: string;
  gasLimit?: string;
}

export interface AnvilConfig {
  port?: number;
  chainId?: number;
  accounts?: number;
  balance?: number;
  blockTime?: number;
  fork?: string;
  forkBlockNumber?: number;
}
