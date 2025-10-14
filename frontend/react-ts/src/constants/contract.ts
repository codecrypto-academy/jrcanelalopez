export const CONTRACT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getTokenMetadata(uint256 tokenId) view returns (uint8 tokenType, address producer, uint256 parent1, uint256 parent2, uint256 createdAt, address currentOwner)",
  "function tokenType(uint256 tokenId) view returns (uint8)",
  "function producer(uint256 tokenId) view returns (address)",
  "function parent1(uint256 tokenId) view returns (uint256)",
  "function parent2(uint256 tokenId) view returns (uint256)",
  "function createdAt(uint256 tokenId) view returns (uint256)",
  "function roles(address account) view returns (uint8)",
  "event TokenCreated(uint256 indexed tokenId, uint8 indexed tokenType, address indexed producer, uint256 parent1, uint256 parent2, uint256 timestamp)",
  "event TokenTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 timestamp)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

export const TokenType = {
  COSECHA: 0,
  ALMACEN: 1,
  MOLIENDA: 2,
  HORNEADO: 3,
  EMBALAJE: 4,
  DISTRIBUCION: 5,
  VENTA: 6
} as const;

export type TokenTypeValue = typeof TokenType[keyof typeof TokenType];

export const Role = {
  NONE: 0,
  AGRICULTOR: 1,
  ALMACENERO: 2,
  MOLINERO: 3,
  HORNEADOR: 4,
  EMBALADOR: 5,
  DISTRIBUIDOR: 6,
  VENDEDOR: 7
} as const;

export type RoleValue = typeof Role[keyof typeof Role];

export const TOKEN_TYPE_NAMES: Record<TokenTypeValue, string> = {
  [TokenType.COSECHA]: "🌾 Cosecha",
  [TokenType.ALMACEN]: "📦 Almacén",
  [TokenType.MOLIENDA]: "⚙️ Molienda",
  [TokenType.HORNEADO]: "🔥 Horneado",
  [TokenType.EMBALAJE]: "📦 Embalaje",
  [TokenType.DISTRIBUCION]: "🚚 Distribución",
  [TokenType.VENTA]: "💰 Venta"
};

export const ROLE_NAMES: Record<RoleValue, string> = {
  [Role.NONE]: "Sin Rol",
  [Role.AGRICULTOR]: "🌾 Agricultor",
  [Role.ALMACENERO]: "📦 Almacenero",
  [Role.MOLINERO]: "⚙️ Molinero",
  [Role.HORNEADOR]: "🔥 Horneador",
  [Role.EMBALADOR]: "📦 Embalador",
  [Role.DISTRIBUIDOR]: "🚚 Distribuidor",
  [Role.VENDEDOR]: "💰 Vendedor"
};

export const TOKEN_TYPE_COLORS: Record<TokenTypeValue, string> = {
  [TokenType.COSECHA]: "#10b981",
  [TokenType.ALMACEN]: "#3b82f6",
  [TokenType.MOLIENDA]: "#8b5cf6",
  [TokenType.HORNEADO]: "#f59e0b",
  [TokenType.EMBALAJE]: "#ef4444",
  [TokenType.DISTRIBUCION]: "#ec4899",
  [TokenType.VENTA]: "#06b6d4"
};
