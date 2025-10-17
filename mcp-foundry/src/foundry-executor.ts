/**
 * Foundry Command Executor
 *
 * Handles execution of forge, cast, and anvil commands
 */

import { spawn, ChildProcess } from 'child_process';
import { FoundryCommand, CommandResult } from './types.js';

export class FoundryExecutor {
  private anvilProcess: ChildProcess | null = null;
  private anvilLogs: string[] = [];

  /**
   * Execute a foundry command and return the result
   */
  async executeCommand(cmd: FoundryCommand): Promise<CommandResult> {
    return new Promise((resolve) => {
      const timeout = cmd.timeout || 900000; // 15 minutes default (increased from 2 minutes)
      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const childProcess = spawn(cmd.command, cmd.args, {
        cwd: cmd.workingDir || process.cwd(),
        shell: false, // Changed from true to false to prevent shell interpretation of arguments
      });

      // Set timeout
      const timer = setTimeout(() => {
        timedOut = true;
        childProcess.kill('SIGTERM');
      }, timeout);

      childProcess.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      childProcess.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      childProcess.on('close', (code: number | null) => {
        clearTimeout(timer);

        if (timedOut) {
          resolve({
            success: false,
            output: stdout,
            error: `Command timed out after ${timeout}ms`,
            exitCode: -1,
          });
        } else {
          resolve({
            success: code === 0,
            output: stdout,
            error: stderr || undefined,
            exitCode: code || 0,
          });
        }
      });

      childProcess.on('error', (error: Error) => {
        clearTimeout(timer);
        resolve({
          success: false,
          output: '',
          error: error.message,
          exitCode: -1,
        });
      });
    });
  }

  /**
   * Start Anvil in background
   */
  async startAnvil(args: string[] = []): Promise<CommandResult> {
    if (this.anvilProcess) {
      return {
        success: false,
        output: '',
        error: 'Anvil is already running',
        exitCode: -1,
      };
    }

    return new Promise((resolve) => {
      this.anvilLogs = [];
      let initialized = false;

      this.anvilProcess = spawn('anvil', args, {
        shell: false, // Changed from true to false to prevent shell interpretation of arguments
      });

      // Capture logs
      this.anvilProcess.stdout?.on('data', (data: Buffer) => {
        const log = data.toString();
        this.anvilLogs.push(log);

        // Anvil is ready when we see "Listening on"
        if (!initialized && log.includes('Listening on')) {
          initialized = true;
          resolve({
            success: true,
            output: log,
            exitCode: 0,
          });
        }
      });

      this.anvilProcess.stderr?.on('data', (data: Buffer) => {
        const log = data.toString();
        this.anvilLogs.push(`[ERROR] ${log}`);
      });

      this.anvilProcess.on('close', (code: number | null) => {
        this.anvilProcess = null;
        if (!initialized) {
          resolve({
            success: false,
            output: this.anvilLogs.join('\n'),
            error: `Anvil exited with code ${code}`,
            exitCode: code || -1,
          });
        }
      });

      this.anvilProcess.on('error', (error: Error) => {
        this.anvilProcess = null;
        if (!initialized) {
          resolve({
            success: false,
            output: '',
            error: error.message,
            exitCode: -1,
          });
        }
      });

      // Timeout if not initialized after 10 seconds
      setTimeout(() => {
        if (!initialized) {
          this.stopAnvil();
          resolve({
            success: false,
            output: this.anvilLogs.join('\n'),
            error: 'Anvil failed to start within 10 seconds',
            exitCode: -1,
          });
        }
      }, 10000);
    });
  }

  /**
   * Stop Anvil if running
   */
  stopAnvil(): CommandResult {
    if (!this.anvilProcess) {
      return {
        success: false,
        output: '',
        error: 'Anvil is not running',
        exitCode: -1,
      };
    }

    this.anvilProcess.kill('SIGTERM');
    this.anvilProcess = null;

    return {
      success: true,
      output: 'Anvil stopped successfully',
      exitCode: 0,
    };
  }

  /**
   * Check if Anvil is running
   */
  isAnvilRunning(): boolean {
    return this.anvilProcess !== null && !this.anvilProcess.killed;
  }

  /**
   * Get Anvil logs
   */
  getAnvilLogs(lastN?: number): string {
    if (lastN) {
      return this.anvilLogs.slice(-lastN).join('\n');
    }
    return this.anvilLogs.join('\n');
  }
}
