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
 * Token data with balance included
 */
export interface TokenInfo extends Token {
  balance: string;
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
 * Transfer data with readable status
 */
export interface TransferInfo extends Transfer {
  id: string;
  status: string;
  amount: string;
  tokenId: string;
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
   * Request a role in the system (self-registration)
   * @param role - Producer, Factory, Retailer, or Consumer
   */
  async requestUserRole(role: string): Promise<void> {
    const tx = await this.contract.requestUserRole(role);
    await tx.wait();
  }

  /**
   * Register a new user in the system (admin only)
   * @param userAddress - Address of user to register
   * @param role - Producer, Factory, Retailer, or Consumer
   */
  async registerUser(userAddress: string, role: string): Promise<void> {
    const tx = await this.contract.registerUser(userAddress, role);
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

  /**
   * Get all registered users (for admin panel)
   * Note: This requires iterating through user IDs
   * @param maxUserId - Maximum user ID to check (from contract's nextUserId)
   */
  async getAllUsers(maxUserId: number): Promise<Array<{id: number, userAddress: string, role: string, status: number}>> {
    const users = [];

    for (let i = 1; i < maxUserId; i++) {
      try {
        const user = await this.contract.users(i);
        users.push({
          id: Number(user[0]),
          userAddress: user[1],
          role: user[2],
          status: Number(user[3]),
        });
      } catch (err) {
        // User ID doesn't exist, skip
        continue;
      }
    }

    return users;
  }

  /**
   * Get next user ID from contract
   */
  async getNextUserId(): Promise<number> {
    const nextId = await this.contract.nextUserId();
    return Number(nextId);
  }

  /**
   * Get all users with a specific role and Approved status
   * @param role - Role to filter by (Producer, Factory, Retailer, Consumer)
   */
  async getUsersByRole(role: string): Promise<Array<{address: string, role: string}>> {
    const nextUserId = await this.getNextUserId();
    const users = [];

    for (let i = 1; i < nextUserId; i++) {
      try {
        const user = await this.contract.users(i);
        const userRole = user[2];
        const userStatus = Number(user[3]);
        const userAddress = user[1];

        // Only include Approved users (status = 1) with matching role
        if (userRole === role && userStatus === 1) {
          users.push({
            address: userAddress,
            role: userRole,
          });
        }
      } catch (err) {
        // User ID doesn't exist, skip
        continue;
      }
    }

    return users;
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
   * @param userAddress - Optional user address to include balance
   */
  async getToken(tokenId: number, userAddress?: string): Promise<Token | TokenInfo> {
    const result = await this.contract.getToken(tokenId);

    const token: Token = {
      id: Number(result[0]),
      creator: result[1],
      name: result[2],
      totalSupply: Number(result[3]),
      features: result[4],
      parentId: Number(result[5]),
      dateCreated: Number(result[6]),
    };

    // If user address provided, include balance
    if (userAddress) {
      const balance = await this.getTokenBalance(tokenId, userAddress);
      return {
        ...token,
        balance: balance.toString(),
      } as TokenInfo;
    }

    return token;
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
   * Get all token IDs owned by a user
   * @param userAddress - User address
   */
  async getUserTokenIds(userAddress: string): Promise<number[]> {
    const tokenIds = await this.contract.getUserTokens(userAddress);
    return tokenIds.map((id: bigint) => Number(id));
  }

  /**
   * Get all tokens owned by a user with full information
   * @param userAddress - User address
   */
  async getUserTokens(userAddress: string): Promise<TokenInfo[]> {
    const tokenIds = await this.getUserTokenIds(userAddress);
    const tokens: TokenInfo[] = [];

    for (const tokenId of tokenIds) {
      try {
        const tokenData = await this.getToken(tokenId, userAddress) as TokenInfo;
        tokens.push(tokenData);
      } catch (err) {
        console.error(`Error loading token ${tokenId}:`, err);
        // Skip tokens that can't be loaded
        continue;
      }
    }

    return tokens;
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
   * Get all transfer IDs for a user (sent or received)
   * @param userAddress - User address
   */
  async getUserTransferIds(userAddress: string): Promise<number[]> {
    const transferIds = await this.contract.getUserTransfers(userAddress);
    return transferIds.map((id: bigint) => Number(id));
  }

  /**
   * Get all transfers for a user with full information
   * @param userAddress - User address
   */
  async getUserTransfers(userAddress: string): Promise<TransferInfo[]> {
    const transferIds = await this.getUserTransferIds(userAddress);
    const transfers: TransferInfo[] = [];

    for (const transferId of transferIds) {
      try {
        const transferData = await this.getTransfer(transferId);

        // Convert to readable format
        const statusLabel = Web3Service.getTransferStatusLabel(transferData.status);

        transfers.push({
          id: transferData.id.toString(),
          from: transferData.from,
          to: transferData.to,
          tokenId: transferData.tokenId.toString(),
          dateCreated: transferData.dateCreated,
          amount: transferData.amount.toString(),
          status: statusLabel,
        });
      } catch (err) {
        console.error(`Error loading transfer ${transferId}:`, err);
        // Skip transfers that can't be loaded
        continue;
      }
    }

    return transfers;
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
