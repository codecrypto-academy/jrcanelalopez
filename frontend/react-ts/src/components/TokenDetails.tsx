import type { TokenData } from "../types";
import "./TokenDetails.css";

interface TokenDetailsProps {
  token: TokenData;
}

export const TokenDetails = ({ token }: TokenDetailsProps) => {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString("es-ES", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="token-details">
      <div className="details-header" style={{ borderColor: token.color }}>
        <span className="details-emoji" style={{ color: token.color }}>
          {token.typeEmoji}
        </span>
        <div>
          <h2>{token.typeName}</h2>
          <p className="details-subtitle">Token #{token.id.toString()}</p>
        </div>
      </div>

      <div className="details-body">
        <div className="detail-section">
          <h3>🔍 Información General</h3>

          <div className="detail-row">
            <span className="detail-label">ID del Token:</span>
            <span className="detail-value code">#{token.id.toString()}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Tipo de Token:</span>
            <span
              className="detail-value"
              style={{ color: token.color, fontWeight: 600 }}
            >
              {token.typeName}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Creado por:</span>
            <span className="detail-value code">{token.creator}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Fecha de Creación:</span>
            <span className="detail-value">{formatDate(token.timestamp)}</span>
          </div>
        </div>

        {(token.parent1 > 0n || token.parent2 > 0n) && (
          <div className="detail-section">
            <h3>👨‍👩‍👦 Genealogía</h3>

            {token.parent1 > 0n && (
              <div className="detail-row">
                <span className="detail-label">Padre 1:</span>
                <span className="detail-value code">
                  Token #{token.parent1.toString()}
                </span>
              </div>
            )}

            {token.parent2 > 0n && (
              <div className="detail-row">
                <span className="detail-label">Padre 2:</span>
                <span className="detail-value code">
                  Token #{token.parent2.toString()}
                </span>
              </div>
            )}

            <div className="genealogy-note">
              <p>
                💡 Este token fue creado a partir de{" "}
                {token.parent1 > 0n && token.parent2 > 0n
                  ? "2 tokens padre"
                  : "1 token padre"}
              </p>
            </div>
          </div>
        )}

        <div className="detail-section">
          <h3>🔗 Datos en Blockchain</h3>

          <div className="blockchain-info">
            <p>Este token está registrado permanentemente en la blockchain</p>
            <ul>
              <li>✅ Inmutable</li>
              <li>✅ Trazabilidad completa</li>
              <li>✅ Transparente</li>
              <li>✅ Verificable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
