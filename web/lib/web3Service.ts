import { Contract } from 'ethers';
import { UserStatus } from '@/contexts/Web3Context';

/**
 * Token data from smart contract
 */
export interface Token {
  id: number;
  creator: string;
  name: string;
  totalSupply: number;
  features: string;
  parentId: number;
  dateCreated: number;
}

/**
 * Transfer data from smart contract
 */
export interface Transfer {
  id: number;
  from: string;
  to: string;
  tokenId: number;
  dateCreated: number;
  amount: number;
  status: TransferStatus;
}

/**
 * Transfer status enum (matches Solidity)
 */
export enum TransferStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
}

/**
 * Web3 Service
 * All contract interactions with proper type conversion
 */
export class Web3Service {
  private contract: Contract;

  constructor(contract: Contract) {
    this.contract = contract;
  }

  // ============ USER MANAGEMENT ============

  /**
   * Request user role registration
   * @param role - Producer, Factory, Retailer, or Consumer
   */
  async requestUserRole(role: string): Promise<void> {
    const tx = await this.contract.requestUserRole(role);
    await tx.wait();
  }

  /**
   * Change user status (admin only)
   * @param userAddress - Address of user to update
   * @param newStatus - New status (Pending, Approved, Rejected, Canceled)
   */
  async changeStatusUser(userAddress: string, newStatus: UserStatus): Promise<void> {
    const tx = await this.contract.changeStatusUser(userAddress, newStatus);
    await tx.wait();
  }

  /**
   * Check if address is admin
   * @param address - Address to check
   */
  async isAdmin(address: string): Promise<boolean> {
    return await this.contract.isAdmin(address);
  }

  // ============ TOKEN MANAGEMENT ============

  /**
   * Create a new token
   * @param name - Token name
   * @param totalSupply - Total supply
   * @param features - JSON string with metadata
   * @param parentId - Parent token ID (0 for raw materials)
   */
  async createToken(
    name: string,
    totalSupply: number,
    features: string,
    parentId: number
  ): Promise<void> {
    const tx = await this.contract.createToken(name, totalSupply, features, parentId);
    await tx.wait();
  }

  /**
   * Get token information
   * @param tokenId - Token ID
   */
  async getToken(tokenId: number): Promise<Token> {
    const result = await this.contract.getToken(tokenId);

    return {
      id: Number(result[0]),
      creator: result[1],
      name: result[2],
      totalSupply: Number(result[3]),
      features: result[4],
      parentId: Number(result[5]),
      dateCreated: Number(result[6]),
    };
  }

  /**
   * Get token balance for an address
   * @param tokenId - Token ID
   * @param userAddress - User address
   */
  async getTokenBalance(tokenId: number, userAddress: string): Promise<number> {
    const balance = await this.contract.getTokenBalance(tokenId, userAddress);
    return Number(balance);
  }

  /**
   * Get all tokens owned by a user
   * @param userAddress - User address
   */
  async getUserTokens(userAddress: string): Promise<number[]> {
    const tokenIds = await this.contract.getUserTokens(userAddress);
    return tokenIds.map((id: bigint) => Number(id));
  }

  // ============ TRANSFER MANAGEMENT ============

  /**
   * Initiate a transfer
   * @param to - Recipient address
   * @param tokenId - Token ID
   * @param amount - Amount to transfer
   */
  async transfer(to: string, tokenId: number, amount: number): Promise<void> {
    const tx = await this.contract.transfer(to, tokenId, amount);
    await tx.wait();
  }

  /**
   * Accept a transfer
   * @param transferId - Transfer ID
   */
  async acceptTransfer(transferId: number): Promise<void> {
    const tx = await this.contract.acceptTransfer(transferId);
    await tx.wait();
  }

  /**
   * Reject a transfer
   * @param transferId - Transfer ID
   */
  async rejectTransfer(transferId: number): Promise<void> {
    const tx = await this.contract.rejectTransfer(transferId);
    await tx.wait();
  }

  /**
   * Get transfer information
   * @param transferId - Transfer ID
   */
  async getTransfer(transferId: number): Promise<Transfer> {
    const result = await this.contract.getTransfer(transferId);

    return {
      id: Number(result[0]),
      from: result[1],
      to: result[2],
      tokenId: Number(result[3]),
      dateCreated: Number(result[4]),
      amount: Number(result[5]),
      status: Number(result[6]) as TransferStatus,
    };
  }

  /**
   * Get all transfers for a user (sent or received)
   * @param userAddress - User address
   */
  async getUserTransfers(userAddress: string): Promise<number[]> {
    const transferIds = await this.contract.getUserTransfers(userAddress);
    return transferIds.map((id: bigint) => Number(id));
  }

  // ============ UTILITIES ============

  /**
   * Get contract pause status
   */
  async isPaused(): Promise<boolean> {
    return await this.contract.paused();
  }

  /**
   * Parse features JSON safely
   * @param featuresJson - JSON string from token
   */
  static parseFeatures(featuresJson: string): Record<string, any> {
    try {
      return JSON.parse(featuresJson);
    } catch {
      return {};
    }
  }

  /**
   * Stringify features for token creation
   * @param features - Features object
   */
  static stringifyFeatures(features: Record<string, any>): string {
    return JSON.stringify(features);
  }

  /**
   * Format timestamp to date string
   * @param timestamp - Unix timestamp
   */
  static formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  /**
   * Get transfer status label
   * @param status - Transfer status enum value
   */
  static getTransferStatusLabel(status: TransferStatus): string {
    switch (status) {
      case TransferStatus.Pending:
        return 'Pending';
      case TransferStatus.Accepted:
        return 'Accepted';
      case TransferStatus.Rejected:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get transfer status color for UI
   * @param status - Transfer status enum value
   */
  static getTransferStatusColor(status: TransferStatus): string {
    switch (status) {
      case TransferStatus.Pending:
        return 'yellow';
      case TransferStatus.Accepted:
        return 'green';
      case TransferStatus.Rejected:
        return 'red';
      default:
        return 'gray';
    }
  }
}

/**
 * Error handler for contract calls
 * @param error - Error from contract call
 */
export function handleContractError(error: any): string {
  // Extract readable error message
  if (error.reason) {
    return error.reason;
  }

  if (error.message) {
    // Extract revert reason from error message
    const match = error.message.match(/reverted with reason string '(.+?)'/);
    if (match) {
      return match[1];
    }

    // Check for common errors
    if (error.message.includes('user rejected')) {
      return 'Transaction rejected by user';
    }

    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }

    if (error.message.includes('execution reverted')) {
      return 'Transaction reverted - check contract conditions';
    }

    return error.message;
  }

  return 'Unknown error occurred';
}
