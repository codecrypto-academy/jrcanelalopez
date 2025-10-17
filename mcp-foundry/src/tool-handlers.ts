/**
 * Foundry MCP Tool Handlers
 *
 * Implements the logic for each MCP tool
 */

import { FoundryExecutor } from './foundry-executor.js';
import { CommandResult } from './types.js';

export class ToolHandlers {
  constructor(private executor: FoundryExecutor) {}

  // ============================================
  // FORGE HANDLERS
  // ============================================

  async handleForgeBuild(args: any): Promise<string> {
    const cmdArgs = ['build'];
    if (args.force) {
      cmdArgs.push('--force');
    }

    const result = await this.executor.executeCommand({
      command: 'forge',
      args: cmdArgs,
      workingDir: args.workingDir,
      timeout: 180000, // 3 minutes
    });

    return this.formatResult('forge build', result);
  }

  async handleForgeTest(args: any): Promise<string> {
    const cmdArgs = ['test'];

    if (args.matchTest) {
      cmdArgs.push('--match-test', args.matchTest);
    }
    if (args.matchContract) {
      cmdArgs.push('--match-contract', args.matchContract);
    }
    if (args.verbosity) {
      cmdArgs.push('-' + 'v'.repeat(args.verbosity));
    }
    if (args.gasReport) {
      cmdArgs.push('--gas-report');
    }

    const result = await this.executor.executeCommand({
      command: 'forge',
      args: cmdArgs,
      workingDir: args.workingDir,
      timeout: 300000, // 5 minutes
    });

    return this.formatResult('forge test', result);
  }

  async handleForgeCoverage(args: any): Promise<string> {
    const result = await this.executor.executeCommand({
      command: 'forge',
      args: ['coverage'],
      workingDir: args.workingDir,
      timeout: 300000, // 5 minutes
    });

    return this.formatResult('forge coverage', result);
  }

  async handleForgeScript(args: any): Promise<string> {
    const cmdArgs = ['script', args.scriptPath];

    if (args.rpcUrl) {
      cmdArgs.push('--rpc-url', args.rpcUrl);
    }
    if (args.privateKey) {
      cmdArgs.push('--private-key', args.privateKey);
    }
    if (args.broadcast) {
      cmdArgs.push('--broadcast');
    }
    if (args.verify) {
      cmdArgs.push('--verify');
    }

    const result = await this.executor.executeCommand({
      command: 'forge',
      args: cmdArgs,
      workingDir: args.workingDir,
      timeout: 300000, // 5 minutes
    });

    return this.formatResult('forge script', result);
  }

  async handleForgeClean(args: any): Promise<string> {
    const result = await this.executor.executeCommand({
      command: 'forge',
      args: ['clean'],
      workingDir: args.workingDir,
    });

    return this.formatResult('forge clean', result);
  }

  // ============================================
  // CAST HANDLERS
  // ============================================

  async handleCastCall(args: any): Promise<string> {
    const cmdArgs = [
      'call',
      args.contractAddress,
      args.signature,
      ...(args.args || []),
      '--rpc-url',
      args.rpcUrl,
    ];

    if (args.blockNumber) {
      cmdArgs.push('--block', args.blockNumber);
    }

    const result = await this.executor.executeCommand({
      command: 'cast',
      args: cmdArgs,
      timeout: 30000,
    });

    return this.formatResult('cast call', result);
  }

  async handleCastSend(args: any): Promise<string> {
    const cmdArgs = [
      'send',
      args.contractAddress,
      args.signature,
      ...(args.args || []),
      '--rpc-url',
      args.rpcUrl,
      '--private-key',
      args.privateKey,
    ];

    if (args.value) {
      cmdArgs.push('--value', args.value);
    }
    if (args.gasLimit) {
      cmdArgs.push('--gas-limit', args.gasLimit);
    }

    const result = await this.executor.executeCommand({
      command: 'cast',
      args: cmdArgs,
      timeout: 60000, // 1 minute
    });

    return this.formatResult('cast send', result);
  }

  async handleCastBlockNumber(args: any): Promise<string> {
    const result = await this.executor.executeCommand({
      command: 'cast',
      args: ['block-number', '--rpc-url', args.rpcUrl],
      timeout: 10000,
    });

    return this.formatResult('cast block-number', result);
  }

  async handleCastBalance(args: any): Promise<string> {
    const result = await this.executor.executeCommand({
      command: 'cast',
      args: ['balance', args.address, '--rpc-url', args.rpcUrl],
      timeout: 10000,
    });

    return this.formatResult('cast balance', result);
  }

  async handleCastChainId(args: any): Promise<string> {
    const result = await this.executor.executeCommand({
      command: 'cast',
      args: ['chain-id', '--rpc-url', args.rpcUrl],
      timeout: 10000,
    });

    return this.formatResult('cast chain-id', result);
  }

  // ============================================
  // ANVIL HANDLERS
  // ============================================

  async handleAnvilStart(args: any): Promise<string> {
    const cmdArgs: string[] = [];

    if (args.port) {
      cmdArgs.push('--port', args.port.toString());
    }
    if (args.chainId) {
      cmdArgs.push('--chain-id', args.chainId.toString());
    }
    if (args.accounts) {
      cmdArgs.push('--accounts', args.accounts.toString());
    }
    if (args.balance) {
      cmdArgs.push('--balance', args.balance.toString());
    }
    if (args.blockTime) {
      cmdArgs.push('--block-time', args.blockTime.toString());
    }
    if (args.fork) {
      cmdArgs.push('--fork-url', args.fork);
    }
    if (args.forkBlockNumber) {
      cmdArgs.push('--fork-block-number', args.forkBlockNumber.toString());
    }

    const result = await this.executor.startAnvil(cmdArgs);

    if (result.success) {
      return `✅ Anvil started successfully!\n\n${result.output}\n\nAnvil is now running in the background. Use anvil_status to check logs or anvil_stop to stop it.`;
    } else {
      return `❌ Failed to start Anvil:\n${result.error}\n\nOutput:\n${result.output}`;
    }
  }

  handleAnvilStop(): string {
    const result = this.executor.stopAnvil();

    if (result.success) {
      return `✅ ${result.output}`;
    } else {
      return `❌ ${result.error}`;
    }
  }

  handleAnvilStatus(args: any): string {
    const isRunning = this.executor.isAnvilRunning();

    if (!isRunning) {
      return '❌ Anvil is not running';
    }

    const logs = this.executor.getAnvilLogs(args.lastNLogs);
    return `✅ Anvil is running\n\nRecent logs:\n${logs}`;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private formatResult(command: string, result: CommandResult): string {
    if (result.success) {
      let output = `✅ ${command} completed successfully\n\n`;
      if (result.output) {
        output += `Output:\n${result.output}`;
      }
      return output;
    } else {
      let output = `❌ ${command} failed (exit code: ${result.exitCode})\n\n`;
      if (result.error) {
        output += `Error:\n${result.error}\n\n`;
      }
      if (result.output) {
        output += `Output:\n${result.output}`;
      }
      return output;
    }
  }
}
