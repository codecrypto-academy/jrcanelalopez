// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SupplyChainTracking
 * @dev Tracking de cadena de suministro optimizado para gas
 * Cada token guarda sus 2 padres (relación inversa hijo→padres)
 */
contract SupplyChainTracking is ERC721, Ownable {
    
    // Tipos de tokens en la cadena de suministro
    enum TokenType { 
        COSECHA,        // 0 - Agricultor
        ALMACEN,        // 1 - Almacenador (2 cosechas)
        MOLIENDA,       // 2 - Molinero (2 almacenes)
        HORNEADO,       // 3 - Horneador (2 moliendas)
        EMBALAJE,       // 4 - Embalador (2 horneados)
        DISTRIBUCION,   // 5 - Distribuidor (2 embalajes)
        VENTA          // 6 - Vendedor (2 distribuciones)
    }
    
    // Roles de usuarios
    enum Role { 
        NONE,           // 0
        AGRICULTOR,     // 1
        ALMACENADOR,    // 2
        MOLINERO,       // 3
        HORNEADOR,      // 4
        EMBALADOR,      // 5
        DISTRIBUIDOR,   // 6
        VENDEDOR        // 7
    }
    
    // Mappings optimizados para bajo consumo de gas
    mapping(uint256 => TokenType) public tokenType;
    mapping(uint256 => address) public producer;
    mapping(uint256 => uint256) public parent1;  // Primer token padre
    mapping(uint256 => uint256) public parent2;  // Segundo token padre
    mapping(uint256 => uint256) public createdAt;
    mapping(address => Role) public roles;
    
    uint256 private _tokenIdCounter;
    
    // Eventos para tracking off-chain
    event TokenCreated(
        uint256 indexed tokenId,
        TokenType indexed tokenType,
        address indexed producer,
        uint256 parent1,
        uint256 parent2,
        uint256 timestamp
    );
    
    event TokenTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    event RoleAssigned(
        address indexed account,
        Role indexed role,
        uint256 timestamp
    );
    
    constructor() ERC721("SupplyChainToken", "SCT") Ownable(msg.sender) {}
    
    /**
     * @dev Asignar rol a una dirección (solo owner)
     */
    function assignRole(address account, Role role) external onlyOwner {
        roles[account] = role;
        emit RoleAssigned(account, role, block.timestamp);
    }
    
    /**
     * @dev Asignar roles en batch
     */
    function assignRoleBatch(address[] calldata accounts, Role[] calldata _roles) external onlyOwner {
        require(accounts.length == _roles.length, "Arrays length mismatch");
        for (uint256 i = 0; i < accounts.length; i++) {
            roles[accounts[i]] = _roles[i];
            emit RoleAssigned(accounts[i], _roles[i], block.timestamp);
        }
    }
    
    /**
     * @dev Crear token (sin padres) - Solo para COSECHA
     * Gas optimizado: ~80,000 gas
     */
    function createToken() external returns (uint256) {
        require(roles[msg.sender] == Role.AGRICULTOR, "Only AGRICULTOR can create COSECHA");
        
        uint256 tokenId = ++_tokenIdCounter;
        
        _safeMint(msg.sender, tokenId);
        tokenType[tokenId] = TokenType.COSECHA;
        producer[tokenId] = msg.sender;
        // parent1 y parent2 quedan en 0 (sin padres)
        createdAt[tokenId] = block.timestamp;
        
        emit TokenCreated(
            tokenId,
            TokenType.COSECHA,
            msg.sender,
            0,
            0,
            block.timestamp
        );
        
        return tokenId;
    }
    
    /**
     * @dev Crear token con 2 padres (resto de la cadena)
     * Gas optimizado: ~95,000 gas
     */
    function createTokenWithParents(
        uint256 _parent1,
        uint256 _parent2
    ) external returns (uint256) {
        require(_parent1 != 0 && _parent2 != 0, "Parents required");
        require(_exists(_parent1) && _exists(_parent2), "Parent tokens must exist");
        
        // Validar que los padres sean del tipo correcto
        TokenType parentType = tokenType[_parent1];
        require(tokenType[_parent2] == parentType, "Parents must be same type");
        
        // Calcular el tipo del nuevo token
        TokenType newType = TokenType(uint8(parentType) + 1);
        require(uint8(newType) <= uint8(TokenType.VENTA), "Invalid token type");
        
        // Validar que el caller tenga el rol correcto
        require(canCreateTokenType(msg.sender, newType), "Unauthorized role");
        
        uint256 tokenId = ++_tokenIdCounter;
        
        _safeMint(msg.sender, tokenId);
        tokenType[tokenId] = newType;
        producer[tokenId] = msg.sender;
        parent1[tokenId] = _parent1;
        parent2[tokenId] = _parent2;
        createdAt[tokenId] = block.timestamp;
        
        emit TokenCreated(
            tokenId,
            newType,
            msg.sender,
            _parent1,
            _parent2,
            block.timestamp
        );
        
        return tokenId;
    }
    
    /**
     * @dev Verificar si una dirección puede crear un tipo de token
     */
    function canCreateTokenType(address account, TokenType _type) public view returns (bool) {
        Role role = roles[account];
        
        if (_type == TokenType.COSECHA) return role == Role.AGRICULTOR;
        if (_type == TokenType.ALMACEN) return role == Role.ALMACENADOR;
        if (_type == TokenType.MOLIENDA) return role == Role.MOLINERO;
        if (_type == TokenType.HORNEADO) return role == Role.HORNEADOR;
        if (_type == TokenType.EMBALAJE) return role == Role.EMBALADOR;
        if (_type == TokenType.DISTRIBUCION) return role == Role.DISTRIBUIDOR;
        if (_type == TokenType.VENTA) return role == Role.VENDEDOR;
        
        return false;
    }
    
    /**
     * @dev Override de transferFrom para emitir evento personalizado
     */
    function transferFrom(address from, address to, uint256 tokenId) public override {
        super.transferFrom(from, to, tokenId);
        emit TokenTransferred(tokenId, from, to, block.timestamp);
    }
    
    /**
     * @dev Override de safeTransferFrom para emitir evento personalizado
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        super.safeTransferFrom(from, to, tokenId, data);
        emit TokenTransferred(tokenId, from, to, block.timestamp);
    }
    
    /**
     * @dev Obtener metadata completa de un token
     */
    function getTokenMetadata(uint256 tokenId) external view returns (
        TokenType _tokenType,
        address _producer,
        uint256 _parent1,
        uint256 _parent2,
        uint256 _createdAt,
        address _currentOwner
    ) {
        require(_exists(tokenId), "Token does not exist");
        
        return (
            tokenType[tokenId],
            producer[tokenId],
            parent1[tokenId],
            parent2[tokenId],
            createdAt[tokenId],
            ownerOf(tokenId)
        );
    }
    
    /**
     * @dev Verificar si un token existe
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    /**
     * @dev Obtener contador de tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Obtener genealogía completa de un token (recursivo hasta raíz)
     * Nota: Usar off-chain para árboles grandes (gas intensivo)
     */
    function getAncestry(uint256 tokenId) external view returns (
        uint256[] memory ancestors
    ) {
        require(_exists(tokenId), "Token does not exist");
        
        // Contar ancestros
        uint256 count = _countAncestors(tokenId);
        ancestors = new uint256[](count);
        
        // Llenar array recursivamente
        _fillAncestors(tokenId, ancestors, 0);
        
        return ancestors;
    }
    
    function _countAncestors(uint256 tokenId) private view returns (uint256) {
        uint256 p1 = parent1[tokenId];
        uint256 p2 = parent2[tokenId];
        
        if (p1 == 0 && p2 == 0) return 0;
        
        uint256 count = 0;
        if (p1 != 0) count += 1 + _countAncestors(p1);
        if (p2 != 0) count += 1 + _countAncestors(p2);
        
        return count;
    }
    
    function _fillAncestors(uint256 tokenId, uint256[] memory ancestors, uint256 index) private view returns (uint256) {
        uint256 p1 = parent1[tokenId];
        uint256 p2 = parent2[tokenId];
        
        if (p1 != 0) {
            ancestors[index++] = p1;
            index = _fillAncestors(p1, ancestors, index);
        }
        
        if (p2 != 0) {
            ancestors[index++] = p2;
            index = _fillAncestors(p2, ancestors, index);
        }
        
        return index;
    }
}
