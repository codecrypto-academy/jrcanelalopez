import { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TokenData } from "../types";
import { TOKEN_TYPE_NAMES, TOKEN_TYPE_COLORS } from "../constants/contract";
import "./TokenStats.css";

interface TokenStatsProps {
  tokens: TokenData[];
}

export const TokenStats = ({ tokens }: TokenStatsProps) => {
  const stats = useMemo(() => {
    const typeCount: Record<number, number> = {};
    const creatorCount: Record<string, number> = {};

    tokens.forEach((token) => {
      typeCount[token.tokenType] = (typeCount[token.tokenType] || 0) + 1;
      creatorCount[token.creator] = (creatorCount[token.creator] || 0) + 1;
    });

    const typeData = Object.entries(typeCount).map(([type, count]) => ({
      name: TOKEN_TYPE_NAMES[Number(type) as keyof typeof TOKEN_TYPE_NAMES],
      value: count,
      color: TOKEN_TYPE_COLORS[Number(type) as keyof typeof TOKEN_TYPE_COLORS],
    }));

    const creatorData = Object.entries(creatorCount)
      .map(([address, count]) => ({
        name: `${address.slice(0, 6)}...${address.slice(-4)}`,
        value: count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return { typeData, creatorData, totalTokens: tokens.length };
  }, [tokens]);

  return (
    <div className="token-stats">
      <h2>📊 Estadísticas del Supply Chain</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalTokens}</div>
            <div className="stat-label">Tokens Totales</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-value">{stats.typeData.length}</div>
            <div className="stat-label">Tipos Activos</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats.creatorData.length}</div>
            <div className="stat-label">Creadores</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>📊 Distribución por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.typeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>👥 Top 10 Creadores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.creatorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#667eea" name="Tokens Creados" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="type-breakdown">
        <h3>📋 Detalle por Tipo de Token</h3>
        <div className="type-list">
          {stats.typeData.map((type) => (
            <div key={type.name} className="type-item">
              <div
                className="type-indicator"
                style={{ backgroundColor: type.color }}
              ></div>
              <div className="type-name">{type.name}</div>
              <div className="type-count">{type.value} tokens</div>
              <div className="type-percentage">
                {((type.value / stats.totalTokens) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
