import "./App.css";
import CreateAccounts from "./components/CreateAccounts";
import Home from "./components/Home";
import RecoverAccounts from "./components/RecoverAccounts";
import WalletView from "./components/WalletView";
import Layout from "./components/Layout";
import { WalletProvider } from "./context/WalletContext";
import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <WalletProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateAccounts />} />
          <Route path="/recover" element={<RecoverAccounts />} />
          <Route path="/wallet" element={<WalletView />} />
        </Route>
      </Routes>
    </WalletProvider>
  );
};

export default App;
