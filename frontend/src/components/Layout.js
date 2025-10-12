import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";

const shorten = (addr) => {
  if (!addr) return "-";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
};

const Layout = () => {
  const {
    account,
    chainId,
    connect,
    watchAddress,
    setWatchAddress,
    clearWatch,
    activeAddress,
  } = useWallet();
  const [inputAddr, setInputAddr] = React.useState("");

  const submitWatch = (e) => {
    e.preventDefault();
    if (!inputAddr.trim()) return;
    try {
      const norm = ethers.getAddress(inputAddr.trim());
      setWatchAddress(norm);
      setInputAddr("");
    } catch (err) {
      alert("Dirección inválida");
    }
  };
  return (
    <div>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "#101820",
          color: "#fff",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h1 style={{ margin: 0, fontSize: "1.2rem" }}>
            <Link to="/" style={{ color: "#61dafb", textDecoration: "none" }}>
              Code Wallet
            </Link>
          </h1>
          <nav style={{ display: "flex", gap: "10px", fontSize: "0.9rem" }}>
            <Link style={{ color: "#fff" }} to="/">
              Home
            </Link>
            <Link style={{ color: "#fff" }} to="/create">
              Create
            </Link>
            <Link style={{ color: "#fff" }} to="/recover">
              Recover
            </Link>
            <Link style={{ color: "#fff" }} to="/wallet">
              Wallet
            </Link>
          </nav>
        </div>
        <div style={{ fontSize: "0.75rem", textAlign: "right", maxWidth: 280 }}>
          {account ? (
            <div style={{ marginBottom: 4 }}>
              <strong title={activeAddress}>{shorten(activeAddress)}</strong>
              {watchAddress && (
                <span
                  style={{ marginLeft: 6, color: "#ffcc66" }}
                  title="Watch mode"
                >
                  👁️
                </span>
              )}
              <div style={{ opacity: 0.7, fontSize: "0.65rem" }}>
                chain {chainId}
              </div>
            </div>
          ) : (
            <button
              onClick={connect}
              style={{ cursor: "pointer", marginBottom: 6 }}
            >
              Connect
            </button>
          )}
          <form onSubmit={submitWatch} style={{ display: "flex", gap: 4 }}>
            <input
              style={{ flex: 1, fontSize: "0.65rem", padding: 2 }}
              placeholder="Watch address 0x..."
              value={inputAddr}
              onChange={(e) => setInputAddr(e.target.value)}
            />
            <button
              type="submit"
              style={{
                fontSize: "0.6rem",
                cursor: "pointer",
                padding: "2px 6px",
              }}
            >
              Watch
            </button>
          </form>
          {watchAddress && (
            <button
              onClick={clearWatch}
              style={{ marginTop: 4, fontSize: "0.6rem", cursor: "pointer" }}
            >
              Clear watch
            </button>
          )}
        </div>
      </header>
      <main style={{ padding: "16px" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
