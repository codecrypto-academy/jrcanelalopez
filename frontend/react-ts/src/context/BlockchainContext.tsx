import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI } from "../constants/contract";

interface BlockchainContextType {
  provider: ethers.JsonRpcProvider | null;
  contract: ethers.Contract | null;
  currentAccount: string | null;
  isConnected: boolean;
  error: string | null;
}

const BlockchainContext = createContext<BlockchainContextType>({
  provider: null,
  contract: null,
  currentAccount: null,
  isConnected: false,
  error: null,
});

export const useBlockchain = () => useContext(BlockchainContext);

interface BlockchainProviderProps {
  children: ReactNode;
}

export const BlockchainProvider = ({ children }: BlockchainProviderProps) => {
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeBlockchain();
  }, []);

  const initializeBlockchain = async () => {
    try {
      const rpcUrl = import.meta.env.VITE_RPC_URL || "http://localhost:8545";
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

      if (!contractAddress) {
        throw new Error("Contract address not configured");
      }

      const newProvider = new ethers.JsonRpcProvider(rpcUrl);
      const newContract = new ethers.Contract(
        contractAddress,
        CONTRACT_ABI,
        newProvider
      );

      setProvider(newProvider);
      setContract(newContract);
      setError(null);
    } catch (err) {
      console.error("Error initializing blockchain:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <BlockchainContext.Provider
      value={{
        provider,
        contract,
        currentAccount,
        isConnected: !!provider && !!contract,
        error,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};
