import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ethers } from "ethers";
import { getWalletData } from "../services/api";

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [nativeBalance, setNativeBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Optional address to "watch" (no signing, solo lectura)
  const [watchAddress, setWatchAddress] = useState(null);

  // Dirección efectiva que se usa para cargar datos
  const activeAddress = watchAddress || account;

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("No wallet provider (MetaMask) found");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const chain = await window.ethereum.request({ method: "eth_chainId" });
      setAccount(ethers.getAddress(accounts[0]));
      setChainId(chain);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!activeAddress || !chainId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getWalletData(activeAddress, chainId);
      setTokens(data.tokens || []);
      setNfts(data.nfts || []);
      setNativeBalance(data.nativeBalance || null);
    } catch (e) {
      setError(e.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  }, [activeAddress, chainId]);

  useEffect(() => {
    if (activeAddress && chainId) refresh();
  }, [activeAddress, chainId, refresh]);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accs) => {
      if (accs.length === 0) {
        setAccount(null);
        setTokens([]);
        setNfts([]);
        setNativeBalance(null);
      } else setAccount(ethers.getAddress(accs[0]));
    };
    const handleChainChanged = (ch) => {
      setChainId(ch);
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        tokens,
        nfts,
        nativeBalance,
        loading,
        error,
        connect,
        refresh,
        // Nuevos helpers de "watch mode"
        watchAddress,
        setWatchAddress, // establecer manualmente dirección observada
        activeAddress,
        clearWatch: () => setWatchAddress(null),
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
