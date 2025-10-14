// ABI del contrato SupplyChainTracking
// Solo incluimos las funciones que necesitamos en los servicios

module.exports = [
  // Función para crear token sin padres (solo AGRICULTOR)
  "function createToken() returns (uint256)",

  // Función para crear token con 2 padres (resto de roles)
  "function createTokenWithParents(uint256 parent1, uint256 parent2) returns (uint256)",

  // Función para obtener metadata de un token
  "function getTokenMetadata(uint256 tokenId) view returns (uint8 tokenType, address producer, uint256 parent1, uint256 parent2, uint256 createdAt)",

  // Función para obtener el owner de un token
  "function ownerOf(uint256 tokenId) view returns (address)",

  // Evento TokenCreated
  "event TokenCreated(uint256 indexed tokenId, uint8 tokenType, address indexed producer, uint256 parent1, uint256 parent2, uint256 timestamp)",

  // Evento TokenTransferred
  "event TokenTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 timestamp)",
];
