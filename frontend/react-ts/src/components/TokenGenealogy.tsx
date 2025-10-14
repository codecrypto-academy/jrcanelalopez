import { useState, useMemo } from "react";
import type { TokenData } from "../types";
import "./TokenGenealogy.css";

interface TokenGenealogyProps {
  tokens: TokenData[];
}

interface TreeNode {
  token: TokenData;
  children: TreeNode[];
  level: number;
}

export const TokenGenealogy = ({ tokens }: TokenGenealogyProps) => {
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"forward" | "backward">("forward");

  const tokenMap = useMemo(() => {
    const map = new Map<string, TokenData>();
    tokens.forEach((token) => {
      map.set(token.id.toString(), token);
    });
    return map;
  }, [tokens]);

  const buildForwardTree = (tokenId: string, level = 0): TreeNode | null => {
    const token = tokenMap.get(tokenId);
    if (!token) return null;

    // Buscar hijos (tokens que tienen este como padre)
    const children: TreeNode[] = [];
    tokens.forEach((t) => {
      if (
        t.parent1.toString() === tokenId ||
        t.parent2.toString() === tokenId
      ) {
        const childNode = buildForwardTree(t.id.toString(), level + 1);
        if (childNode) children.push(childNode);
      }
    });

    return { token, children, level };
  };

  const buildBackwardTree = (tokenId: string, level = 0): TreeNode | null => {
    const token = tokenMap.get(tokenId);
    if (!token) return null;

    const children: TreeNode[] = [];

    // Agregar padres como "hijos" en el árbol inverso
    if (token.parent1 > 0n) {
      const parent1Node = buildBackwardTree(
        token.parent1.toString(),
        level + 1
      );
      if (parent1Node) children.push(parent1Node);
    }

    if (token.parent2 > 0n) {
      const parent2Node = buildBackwardTree(
        token.parent2.toString(),
        level + 1
      );
      if (parent2Node) children.push(parent2Node);
    }

    return { token, children, level };
  };

  const tree = useMemo(() => {
    if (!selectedTokenId) return null;
    return viewMode === "forward"
      ? buildForwardTree(selectedTokenId)
      : buildBackwardTree(selectedTokenId);
  }, [selectedTokenId, viewMode, tokens]);

  const renderTreeNode = (node: TreeNode, isLast = false) => {
    return (
      <div key={node.token.id.toString()} className="tree-node">
        <div className="node-content">
          <div
            className="node-card"
            style={{ borderLeftColor: node.token.color }}
          >
            <span className="node-emoji" style={{ color: node.token.color }}>
              {node.token.typeEmoji}
            </span>
            <div className="node-info">
              <div className="node-type">{node.token.typeName}</div>
              <div className="node-id">#{node.token.id.toString()}</div>
              <div className="node-creator">
                {node.token.creator.slice(0, 6)}...
                {node.token.creator.slice(-4)}
              </div>
            </div>
          </div>
        </div>

        {node.children.length > 0 && (
          <div className="node-children">
            {node.children.map((child, idx) =>
              renderTreeNode(child, idx === node.children.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="token-genealogy">
      <h2>🌳 Trazabilidad de Tokens</h2>

      <div className="genealogy-controls">
        <div className="control-group">
          <label>Seleccionar Token:</label>
          <select
            value={selectedTokenId}
            onChange={(e) => setSelectedTokenId(e.target.value)}
            className="token-select"
          >
            <option value="">-- Seleccionar un token --</option>
            {tokens.map((token) => (
              <option key={token.id.toString()} value={token.id.toString()}>
                {token.typeEmoji} Token #{token.id.toString()} -{" "}
                {token.typeName}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Vista:</label>
          <div className="view-mode-buttons">
            <button
              className={`mode-button ${
                viewMode === "backward" ? "active" : ""
              }`}
              onClick={() => setViewMode("backward")}
            >
              ⬆️ Origen (Padres)
            </button>
            <button
              className={`mode-button ${
                viewMode === "forward" ? "active" : ""
              }`}
              onClick={() => setViewMode("forward")}
            >
              ⬇️ Descendientes
            </button>
          </div>
        </div>
      </div>

      <div className="genealogy-content">
        {!selectedTokenId ? (
          <div className="empty-genealogy">
            <p>🌳 Selecciona un token para ver su trazabilidad</p>
            <p className="empty-hint">
              {viewMode === "forward"
                ? "Verás todos los tokens descendientes"
                : "Verás el origen y los padres del token"}
            </p>
          </div>
        ) : tree ? (
          <div className="tree-container">
            <div className="tree-header">
              <h3>
                {viewMode === "forward"
                  ? "📉 Descendientes del Token"
                  : "📈 Origen del Token"}
              </h3>
            </div>
            <div className="tree-view">{renderTreeNode(tree)}</div>
          </div>
        ) : (
          <div className="empty-genealogy">
            <p>❌ Token no encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};
