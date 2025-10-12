import React, { useState } from "react";
import { ethers } from "ethers";

const RecoverAccounts = () => {
  const [mnemonic, setMnemonic] = useState("");
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);

  const recover = () => {
    try {
      const wallet = ethers.Wallet.fromPhrase(mnemonic.trim());
      setAddress(wallet.address);
      setError(null);
    } catch (e) {
      setAddress(null);
      setError("Invalid mnemonic");
    }
  };

  return (
    <div>
      <h2>Recover Account</h2>
      <textarea
        rows={3}
        style={{ width: "100%" }}
        value={mnemonic}
        onChange={(e) => setMnemonic(e.target.value)}
        placeholder="Enter mnemonic phrase"
      />
      <button onClick={recover} style={{ marginTop: "0.5rem" }}>
        Recover
      </button>
      {address && (
        <p>
          <strong>Recovered Address:</strong> {address}
        </p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default RecoverAccounts;
