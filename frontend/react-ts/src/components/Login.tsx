import { useState } from "react";
import { ROLE_NAMES } from "../constants/contract";
import "./Login.css";

interface LoginProps {
  onLogin: (address: string, privateKey: string) => void;
}

const ACCOUNTS = [
  {
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey:
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    role: 0,
    name: "Owner/Deployer",
  },
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey:
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    role: 1,
    name: "🌾 Agricultor",
  },
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey:
      "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    role: 2,
    name: "📦 Almacenero",
  },
  {
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey:
      "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
    role: 3,
    name: "⚙️ Molinero",
  },
  {
    address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    privateKey:
      "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
    role: 4,
    name: "🔥 Horneador",
  },
  {
    address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    privateKey:
      "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
    role: 5,
    name: "📦 Embalador",
  },
  {
    address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    privateKey:
      "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
    role: 6,
    name: "🚚 Distribuidor",
  },
  {
    address: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    privateKey:
      "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356",
    role: 7,
    name: "💰 Vendedor",
  },
];

export const Login = ({ onLogin }: LoginProps) => {
  const [selectedAccount, setSelectedAccount] = useState<number>(-1);

  const handleLogin = () => {
    if (selectedAccount >= 0) {
      const account = ACCOUNTS[selectedAccount];
      onLogin(account.address, account.privateKey);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🔐 Supply Chain Tracker</h1>
        <p className="login-subtitle">Selecciona tu rol para acceder</p>

        <div className="accounts-grid">
          {ACCOUNTS.map((account, index) => (
            <div
              key={account.address}
              className={`account-card ${
                selectedAccount === index ? "selected" : ""
              }`}
              onClick={() => setSelectedAccount(index)}
            >
              <div className="account-role">{account.name}</div>
              <div className="account-address">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </div>
            </div>
          ))}
        </div>

        <button
          className="login-button"
          onClick={handleLogin}
          disabled={selectedAccount < 0}
        >
          Entrar{" "}
          {selectedAccount >= 0 && `como ${ACCOUNTS[selectedAccount].name}`}
        </button>

        <div className="login-info">
          <p>
            👁️ <strong>Modo Solo Lectura</strong>
          </p>
          <p>Solo puedes visualizar la trazabilidad de tokens</p>
        </div>
      </div>
    </div>
  );
};
