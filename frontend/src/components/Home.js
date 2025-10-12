import React from "react";
import { useWallet } from "../context/WalletContext";

const Home = () => {
  const { account, connect, chainId, error } = useWallet();
  return (
    <div>
      <h2>Home</h2>
      {account ? (
        <p>
          Connected: {account} (chain {chainId})
        </p>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};
export default Home;
