export interface TokenInfo {
  id: bigint;
  creator: string;
  tokenType: number;
  parent1: bigint;
  parent2: bigint;
  timestamp: bigint;
}

export interface TokenData extends TokenInfo {
  typeName: string;
  typeEmoji: string;
  color: string;
}

export interface UserAccount {
  address: string;
  role: number;
  roleName: string;
  balance: number;
}

export interface TreeNode {
  id: number;
  tokenType: number;
  typeName: string;
  creator: string;
  timestamp: number;
  parent1: number | null;
  parent2: number | null;
  children?: TreeNode[];
}
