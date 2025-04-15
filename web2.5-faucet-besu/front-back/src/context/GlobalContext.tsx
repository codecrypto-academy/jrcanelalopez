"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { Ethereum } from "@metamask/providers"; // Install @metamask/providers for type safety

interface GlobalContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const GlobalContext = createContext<GlobalContextType>({
  account: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export function useGlobal() {
  return useContext(GlobalContext);
}

interface GlobalProviderProps {
  children: ReactNode;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    const ethereum = window.ethereum as Ethereum | undefined;

    if (!ethereum) {
      console.error("MetaMask is not installed. Please install MetaMask.");
      return;
    }

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        console.error("No accounts found.");
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  useEffect(() => {
    const ethereum = window.ethereum as Ethereum | undefined;

    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] || null);
    };

    ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  const contextValue = useMemo(
    () => ({ account, connectWallet, disconnectWallet }),
    [account]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
}
