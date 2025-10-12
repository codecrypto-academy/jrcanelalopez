import React from "react";
import { useWallet } from "../context/WalletContext";

const WalletView = () => {
  const {
    activeAddress,
    account,
    tokens,
    nfts,
    nativeBalance,
    loading,
    refresh,
  } = useWallet();
  return (
    <div>
      <h2>Wallet</h2>
      {!account && !activeAddress && <p>Connect your wallet on Home first.</p>}
      {activeAddress && (
        <>
          <button onClick={refresh} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <small style={{ marginLeft: "8px", opacity: 0.7 }}>
            Actualiza los datos on-chain
          </small>
          <section style={{ marginTop: "1rem" }}>
            <h3>Native Balance</h3>
            {nativeBalance ? (
              <pre style={{ background: "#f5f5f5", padding: "8px" }}>
                {JSON.stringify(nativeBalance, null, 2)}
              </pre>
            ) : (
              <p>—</p>
            )}
          </section>
          <section>
            <h3>Tokens</h3>
            {tokens.length === 0 ? (
              <p>No tokens</p>
            ) : (
              <table
                border={1}
                cellPadding={4}
                style={{ borderCollapse: "collapse" }}
              >
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Balance (raw)</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((t, i) => (
                    <tr key={i}>
                      <td>{t.symbol || "-"}</td>
                      <td>{t.name || "-"}</td>
                      <td>{t.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
          <section>
            <h3>NFTs</h3>
            {!nfts || !nfts.result || nfts.result.length === 0 ? (
              <p>No NFTs</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))",
                  gap: "12px",
                }}
              >
                {nfts.result.map((n, i) => (
                  <div
                    key={i}
                    style={{ border: "1px solid #ccc", padding: "6px" }}
                  >
                    <div style={{ fontSize: "0.8rem", wordBreak: "break-all" }}>
                      {n.token_address}
                    </div>
                    <strong>{n.name || n.symbol || "NFT"}</strong>
                    <div>ID: {n.token_id}</div>
                    {n.media && n.media.original_media_url && (
                      <img
                        alt="media"
                        src={n.media.original_media_url}
                        style={{ maxWidth: "100%" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default WalletView;
