import { useState } from "react";
import type { TokenData } from "../types";
import { useTokens } from "../hooks/useTokens";
import { TokenList } from "./TokenList";
import { TokenDetails } from "./TokenDetails";
import { TokenStats } from "./TokenStats";
import { TokenGenealogy } from "./TokenGenealogy";
import "./Dashboard.css";

interface DashboardProps {
  userAddress: string;
  userRole: string;
  onLogout: () => void;
}

export const Dashboard = ({
  userAddress,
  userRole,
  onLogout,
}: DashboardProps) => {
  const { tokens, loading, error, fetchTokens } = useTokens();
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [activeView, setActiveView] = useState<"list" | "stats" | "genealogy">(
    "list"
  );

  const handleRefresh = () => {
    fetchTokens();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🔗 Supply Chain Tracker</h1>
          <div className="user-info">
            <span className="user-role">{userRole}</span>
            <span className="user-address">
              {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </span>
            <button
              className="refresh-button"
              onClick={handleRefresh}
              title="Actualizar datos"
            >
              🔄 Actualizar
            </button>
            <button className="logout-button" onClick={onLogout}>
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-nav">
        <button
          className={`nav-button ${activeView === "list" ? "active" : ""}`}
          onClick={() => setActiveView("list")}
        >
          📋 Historial de Productos
        </button>
        <button
          className={`nav-button ${activeView === "stats" ? "active" : ""}`}
          onClick={() => setActiveView("stats")}
        >
          📊 Estadísticas
        </button>
        <button
          className={`nav-button ${activeView === "genealogy" ? "active" : ""}`}
          onClick={() => setActiveView("genealogy")}
        >
          🌳 Trazabilidad
        </button>
      </div>

      <div className="dashboard-content">
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando tokens...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p>❌ Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {activeView === "list" && (
              <div className="view-container">
                <div className="tokens-section">
                  <TokenList
                    tokens={tokens}
                    onSelectToken={setSelectedToken}
                    selectedTokenId={selectedToken?.id}
                  />
                </div>
                {selectedToken && (
                  <div className="details-section">
                    <TokenDetails token={selectedToken} />
                  </div>
                )}
              </div>
            )}

            {activeView === "stats" && (
              <div className="stats-container">
                <TokenStats tokens={tokens} />
              </div>
            )}

            {activeView === "genealogy" && (
              <div className="genealogy-container">
                <TokenGenealogy tokens={tokens} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
