import React, { useState } from "react";

// Simple local wallet generation (NOT FOR PRODUCTION). Demonstrates ethers wallet creation.
import { ethers } from "ethers";

const CreateAccounts = () => {
  const [mnemonic, setMnemonic] = useState(null);
  const [address, setAddress] = useState(null);

  const generate = () => {
    const wallet = ethers.Wallet.createRandom();
    setMnemonic(wallet.mnemonic?.phrase || "(no mnemonic exposed)");
    setAddress(wallet.address);
  };

  return (
    <div>
      <h2>Create Local Wallet</h2>
      <button onClick={generate}>Generate</button>
      {address && (
        <div style={{ marginTop: "1rem" }}>
          <p>
            <strong>Address:</strong> {address}
          </p>
          <p>
            <strong>Mnemonic:</strong> {mnemonic}
          </p>
          <small style={{ color: "orange" }}>
            Do NOT use this mnemonic in production; demo only.
          </small>
        </div>
      )}
    </div>
  );
};

export default CreateAccounts;
