import type { TokenData } from "../types";
import "./TokenList.css";

interface TokenListProps {
  tokens: TokenData[];
  onSelectToken: (token: TokenData) => void;
  selectedTokenId?: bigint;
}

export const TokenList = ({
  tokens,
  onSelectToken,
  selectedTokenId,
}: TokenListProps) => {
  // Ordenar tokens por timestamp descendente (más reciente primero)
  const sortedTokens = [...tokens].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp)
  );

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="token-list">
      <h2>📋 Historial de Productos ({tokens.length})</h2>

      {tokens.length === 0 ? (
        <div className="empty-state">
          <p>No hay tokens disponibles</p>
          <p className="empty-hint">
            Los tokens aparecerán aquí cuando se creen
          </p>
        </div>
      ) : (
        <div className="token-cards">
          {sortedTokens.map((token) => (
            <div
              key={token.id.toString()}
              className={`token-card ${
                selectedTokenId === token.id ? "selected" : ""
              }`}
              onClick={() => onSelectToken(token)}
            >
              <div className="token-card-header">
                <span className="token-emoji" style={{ color: token.color }}>
                  {token.typeEmoji}
                </span>
                <div className="token-info">
                  <div className="token-type">{token.typeName}</div>
                  <div className="token-id">Token #{token.id.toString()}</div>
                </div>
              </div>

              <div className="token-card-body">
                <div className="token-detail">
                  <span className="label">Creador:</span>
                  <span className="value">
                    {token.creator.slice(0, 6)}...{token.creator.slice(-4)}
                  </span>
                </div>

                <div className="token-detail">
                  <span className="label">Fecha:</span>
                  <span className="value">{formatDate(token.timestamp)}</span>
                </div>

                {(token.parent1 > 0n || token.parent2 > 0n) && (
                  <div className="token-detail">
                    <span className="label">Padres:</span>
                    <span className="value">
                      {token.parent1 > 0n && `#${token.parent1.toString()}`}
                      {token.parent1 > 0n && token.parent2 > 0n && ", "}
                      {token.parent2 > 0n && `#${token.parent2.toString()}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="token-card-footer">
                <button className="view-details-btn">Ver detalles →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
