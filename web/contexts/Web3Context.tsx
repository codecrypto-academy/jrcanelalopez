'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers, BrowserProvider, Contract, Signer } from 'ethers';
import SupplyChainArtifact from '@/contracts/SupplyChain.json';

// User info from smart contract
export interface UserInfo {
  id: number;
  userAddress: string;
  role: string;
  status: number; // 0: Pending, 1: Approved, 2: Rejected, 3: Canceled
}

// User status enum (matches Solidity)
export enum UserStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Canceled = 3,
}

interface Web3ContextType {
  // Wallet state
  account: string | null;
  isConnected: boolean;
  chainId: number | null;

  // User state
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;

  // Contract instances
  provider: BrowserProvider | null;
  signer: Signer | null;
  contract: Contract | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshUserInfo: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Contract address from deployment (update after deploying to Anvil)
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const EXPECTED_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337'); // Anvil default

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  // Fetch user info from contract
  const fetchUserInfo = async (address: string, contractInstance: Contract): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // First, check if address is admin
      const isAdminResult = await contractInstance.isAdmin(address);

      if (isAdminResult) {
        // Admin case: create special UserInfo for admin
        const adminInfo: UserInfo = {
          id: 0, // Special ID for admin
          userAddress: address,
          role: 'Admin',
          status: UserStatus.Approved, // Admin is always approved
        };

        setUserInfo(adminInfo);

        // Store in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('userInfo', JSON.stringify(adminInfo));
        }
      } else {
        // Regular user case: call getUserInfo from contract
        const result = await contractInstance.getUserInfo(address);

        // Convert BigInt values to numbers/strings
        const userInfoData: UserInfo = {
          id: Number(result[0]),
          userAddress: result[1],
          role: result[2],
          status: Number(result[3]),
        };

        setUserInfo(userInfoData);

        // Store in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('userInfo', JSON.stringify(userInfoData));
        }
      }
    } catch (err: any) {
      // User not registered yet - this is expected for new users
      if (err.message?.includes('UserDoesNotExist') || err.message?.includes('User does not exist') || err.code === 'BAD_DATA') {
        setUserInfo(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userInfo');
        }
      } else {
        console.error('Error fetching user info:', err);
        setError(err.message || 'Failed to fetch user info');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Connect wallet
  const connect = async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed. Please install it to continue.');
      return;
    }

    if (!CONTRACT_ADDRESS) {
      setError('Contract address not configured. Please check .env.local');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const selectedAccount = accounts[0];

      // Get provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();

      // Get chain ID
      const network = await web3Provider.getNetwork();
      const currentChainId = Number(network.chainId);

      // Check if on correct network
      if (currentChainId !== EXPECTED_CHAIN_ID) {
        setError(`Please switch to network with Chain ID ${EXPECTED_CHAIN_ID} (Anvil Local)`);
        setIsLoading(false);
        return;
      }

      // Initialize contract
      // Ensure ABI is valid
      if (!SupplyChainArtifact || !Array.isArray(SupplyChainArtifact)) {
        throw new Error('Invalid contract ABI. Please regenerate SupplyChain.json');
      }

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        SupplyChainArtifact,
        web3Signer
      );

      // Update state
      setAccount(selectedAccount);
      setChainId(currentChainId);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(contractInstance);

      // Store account in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('connectedAccount', selectedAccount);
      }

      // Fetch user info
      await fetchUserInfo(selectedAccount, contractInstance);

    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAccount(null);
    setChainId(null);
    setUserInfo(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setError(null);

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('connectedAccount');
      localStorage.removeItem('userInfo');
    }
  };

  // Refresh user info
  const refreshUserInfo = async () => {
    if (account && contract) {
      await fetchUserInfo(account, contract);
    }
  };

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (!isMetaMaskInstalled) return;

      const savedAccount = typeof window !== 'undefined'
        ? localStorage.getItem('connectedAccount')
        : null;

      if (savedAccount) {
        try {
          // Check if account is still connected
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.includes(savedAccount)) {
            await connect();
          } else {
            // Clear stale data
            disconnect();
          }
        } catch (err) {
          console.error('Auto-connect failed:', err);
          disconnect();
        }
      }
    };

    autoConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected all accounts
        disconnect();
      } else if (accounts[0] !== account) {
        // User switched account
        window.location.reload(); // Simple approach: reload page
      }
    };

    const handleChainChanged = () => {
      // Reload page on chain change (recommended by MetaMask)
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, isMetaMaskInstalled]);

  const value: Web3ContextType = {
    account,
    isConnected: !!account,
    chainId,
    userInfo,
    isLoading,
    error,
    provider,
    signer,
    contract,
    connect,
    disconnect,
    refreshUserInfo,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

// Custom hook to use Web3Context
export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
