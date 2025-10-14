import { useState } from "react";
import { BlockchainProvider } from "./context/BlockchainContext";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [userRole, setUserRole] = useState("");

  const handleLogin = (address: string, _privateKey: string) => {
    setUserAddress(address);
    // Determinar el rol basado en la dirección
    const roles: Record<string, string> = {
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266": "Owner/Deployer",
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8": "🌾 Agricultor",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC": "📦 Almacenero",
      "0x90F79bf6EB2c4f870365E785982E1f101E93b906": "⚙️ Molinero",
      "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65": "🔥 Horneador",
      "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc": "📦 Embalador",
      "0x976EA74026E726554dB657fA54763abd0C3a0aa9": "🚚 Distribuidor",
      "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955": "💰 Vendedor",
    };
    setUserRole(roles[address] || "Usuario");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserAddress("");
    setUserRole("");
  };

  return (
    <BlockchainProvider>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard
          userAddress={userAddress}
          userRole={userRole}
          onLogout={handleLogout}
        />
      )}
    </BlockchainProvider>
  );
}

export default App;
