// Types for Besu network management

// ============================================
// RE-EXPORT tipos de la librería (source of truth)
// ============================================
// NOTA: Estos tipos están comentados temporalmente hasta que la librería esté compilada
// Una vez compilada, descomentar y eliminar las definiciones duplicadas abajo

/*
export type {
  BesuNetworkConfig,
  SignerAccount,
  BesuNodeDefinition,
  BesuNetworkCreateOptions,
} from 'besu-network-lib';
*/

// ============================================
// TIPOS TEMPORALES (hasta que librería esté compilada)
// ============================================
// TODO: Eliminar estos cuando la librería compile correctamente
// y descomentar los re-exports de arriba

export interface BesuNetworkConfig {
  name: string;
  chainId: number;
  subnet: string;
  consensus: 'clique' | 'ibft2' | 'qbft';
  gasLimit: string;
  blockTime?: number;
  signerAccounts?: SignerAccount[];
  accounts?: Array<{ address: string; weiAmount: string }>;
}

export interface SignerAccount {
  address: string;
  weiAmount: string;
  minerNode?: string; // Asociación con nodo miner
}

export interface BesuNodeDefinition {
  name: string;
  ip?: string;
  rpcPort: number;
  p2pPort?: number; // ✅ OPCIONAL como en librería
  type: 'bootnode' | 'miner' | 'rpc' | 'node'; // ✅ Usar 'node' en lugar de 'validator'
  signerAddress?: string; // Para miners en consenso Clique
}

export interface BesuNetworkCreateOptions {
  nodes: BesuNodeDefinition[];
  initialBalance?: string;
  autoResolveSubnetConflicts?: boolean;
  autoGenerateSignerAccounts?: boolean; // ✅ Agregado
}

// ============================================
// TIPOS ESPECÍFICOS DE LA UI/APP
// ============================================

export interface BesuNetwork {
  id: string;
  config: BesuNetworkConfig;
  nodes: BesuNodeDefinition[];
  status: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface NetworkConnectivity {
  nodeName: string;
  isActive: boolean;
  blockNumber?: number;
  peerCount?: number;
  error?: string;
}

export interface CreateNetworkRequest {
  config: BesuNetworkConfig;
  nodes: BesuNodeDefinition[];
}

export interface UpdateNetworkRequest {
  config?: Partial<BesuNetworkConfig>;
  nodes?: BesuNodeDefinition[];
}

export interface NetworkListResponse {
  networks: BesuNetwork[];
  total: number;
}

export interface NetworkResponse {
  network: BesuNetwork;
  connectivity?: NetworkConnectivity[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types for the UI
export interface NetworkFormData {
  name: string;
  chainId: number;
  consensus: 'clique' | 'ibft2' | 'qbft';
  gasLimit: string;
  blockTime: number;
  subnet?: string;
  signerAccounts: {
    address: string;
    ethAmount: string; // User-friendly ETH amount
  }[];
  nodes: {
    name: string;
    type: 'bootnode' | 'miner' | 'rpc' | 'node';
    rpcPort: number;
    p2pPort?: number; // ✅ OPCIONAL
    ip?: string;
    signerAddress?: string; // Para miners
  }[];
}

// Network status and operations
export type NetworkOperation = 'start' | 'stop' | 'restart' | 'delete';

export interface NetworkOperationResponse {
  success: boolean;
  operation: NetworkOperation;
  networkId: string;
  message?: string;
  error?: string;
}
