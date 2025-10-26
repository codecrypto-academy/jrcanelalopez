/**
 * Foundry Command Executor
 *
 * Handles execution of forge, cast, and anvil commands
 */

import { spawn, execSync, ChildProcess } from 'child_process';
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
    // First try to stop tracked process
    if (this.anvilProcess) {
      this.anvilProcess.kill('SIGTERM');
      this.anvilProcess = null;
      this.anvilLogs = [];

      return {
        success: true,
        output: 'Anvil stopped successfully (MCP-managed process)',
        exitCode: 0,
      };
    }

    // If not tracked, try to stop any running anvil process
    try {
      const pid = execSync('pgrep -x anvil', { encoding: 'utf-8' }).trim();

      if (pid) {
        execSync(`kill -TERM ${pid}`);
        return {
          success: true,
          output: `Anvil stopped successfully (PID: ${pid})\nNote: Anvil was started outside of MCP`,
          exitCode: 0,
        };
      }
    } catch (error) {
      // Ignore error - process might not exist
    }

    return {
      success: false,
      output: '',
      error: 'Anvil is not running',
      exitCode: -1,
    };
  }

  /**
   * Check if Anvil is running
   */
  isAnvilRunning(): boolean {
    // First check if we have a tracked process
    if (this.anvilProcess !== null && !this.anvilProcess.killed) {
      return true;
    }

    // If not tracked, check if anvil is running in the system
    try {
      const result = execSync('pgrep -x anvil', { encoding: 'utf-8' }).trim();
      return result.length > 0;
    } catch (error) {
      // pgrep returns non-zero exit code if no process found
      return false;
    }
  }

  /**
   * Get Anvil logs
   */
  getAnvilLogs(lastN?: number): string {
    // If we have tracked logs, return them
    if (this.anvilLogs.length > 0) {
      if (lastN) {
        return this.anvilLogs.slice(-lastN).join('\n');
      }
      return this.anvilLogs.join('\n');
    }

    // If Anvil is running but not tracked, get process info
    try {
      const pid = execSync('pgrep -x anvil', { encoding: 'utf-8' }).trim();

      if (pid) {
        const psOutput = execSync(`ps -p ${pid} -o command=`, { encoding: 'utf-8' }).trim();
        return `Anvil is running (PID: ${pid})\nCommand: ${psOutput}\n\nNote: Anvil was started outside of MCP, so detailed logs are not available.\nUse 'anvil_stop' to stop it, or start Anvil with 'anvil_start' to capture logs.`;
      }
    } catch (error) {
      // Ignore error
    }

    return 'No logs available';
  }
}
