// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DocumentRegistry
 * @dev Contrato para registrar documentos en la blockchain de Ethereum
 * Almacena el hash del documento, path y usuario que lo guardó
 */
contract DocumentRegistry {
    struct Document {
        string documentId; // ID único del documento
        string documentHash; // Hash del documento (SHA-256)
        string path; // Path donde se guarda el documento
        address owner; // Usuario que guardó el documento
        uint256 timestamp; // Timestamp de cuando se guardó
        bool exists; // Flag para verificar existencia
    }

    // Mapping de documentId => Document
    mapping(string => Document) private documents;

    // Array para llevar registro de todos los documentIds
    string[] private documentIds;

    // Mapping de address => array de documentIds del usuario
    mapping(address => string[]) private userDocuments;

    // Eventos
    event DocumentStored(
        string indexed documentId,
        string documentHash,
        string path,
        address indexed owner,
        uint256 timestamp
    );

    event DocumentUpdated(
        string indexed documentId,
        string newHash,
        string newPath,
        uint256 timestamp
    );

    /**
     * @dev Guardar un nuevo documento en la blockchain
     * @param _documentId ID único del documento
     * @param _documentHash Hash del documento
     * @param _path Path del documento en el filesystem
     */
    function storeDocument(
        string memory _documentId,
        string memory _documentHash,
        string memory _path
    ) public {
        require(bytes(_documentId).length > 0, "Document ID cannot be empty");
        require(
            bytes(_documentHash).length > 0,
            "Document hash cannot be empty"
        );
        require(bytes(_path).length > 0, "Path cannot be empty");
        require(!documents[_documentId].exists, "Document already exists");

        documents[_documentId] = Document({
            documentId: _documentId,
            documentHash: _documentHash,
            path: _path,
            owner: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        documentIds.push(_documentId);
        userDocuments[msg.sender].push(_documentId);

        emit DocumentStored(
            _documentId,
            _documentHash,
            _path,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Actualizar hash y path de un documento existente
     * @param _documentId ID del documento a actualizar
     * @param _newHash Nuevo hash del documento
     * @param _newPath Nuevo path del documento
     */
    function updateDocument(
        string memory _documentId,
        string memory _newHash,
        string memory _newPath
    ) public {
        require(documents[_documentId].exists, "Document does not exist");
        require(
            documents[_documentId].owner == msg.sender,
            "Only owner can update"
        );

        documents[_documentId].documentHash = _newHash;
        documents[_documentId].path = _newPath;
        documents[_documentId].timestamp = block.timestamp;

        emit DocumentUpdated(_documentId, _newHash, _newPath, block.timestamp);
    }

    /**
     * @dev Obtener el hash de un documento
     * @param _documentId ID del documento
     * @return Hash del documento
     */
    function getDocumentHash(
        string memory _documentId
    ) public view returns (string memory) {
        require(documents[_documentId].exists, "Document does not exist");
        return documents[_documentId].documentHash;
    }

    /**
     * @dev Obtener el path de un documento
     * @param _documentId ID del documento
     * @return Path del documento
     */
    function getDocumentPath(
        string memory _documentId
    ) public view returns (string memory) {
        require(documents[_documentId].exists, "Document does not exist");
        return documents[_documentId].path;
    }

    /**
     * @dev Obtener información completa de un documento
     * @param _documentId ID del documento
     * @return documentId ID del documento
     * @return documentHash Hash del documento
     * @return path Path del documento
     * @return owner Propietario del documento
     * @return timestamp Timestamp de creación
     */
    function getDocument(
        string memory _documentId
    )
        public
        view
        returns (
            string memory documentId,
            string memory documentHash,
            string memory path,
            address owner,
            uint256 timestamp
        )
    {
        require(documents[_documentId].exists, "Document does not exist");

        Document memory doc = documents[_documentId];
        return (
            doc.documentId,
            doc.documentHash,
            doc.path,
            doc.owner,
            doc.timestamp
        );
    }

    /**
     * @dev Verificar si un documento existe
     * @param _documentId ID del documento
     * @return true si existe, false si no
     */
    function documentExists(
        string memory _documentId
    ) public view returns (bool) {
        return documents[_documentId].exists;
    }

    /**
     * @dev Verificar el hash de un documento
     * @param _documentId ID del documento
     * @param _hash Hash a verificar
     * @return true si el hash coincide, false si no
     */
    function verifyDocumentHash(
        string memory _documentId,
        string memory _hash
    ) public view returns (bool) {
        require(documents[_documentId].exists, "Document does not exist");
        return
            keccak256(bytes(documents[_documentId].documentHash)) ==
            keccak256(bytes(_hash));
    }

    /**
     * @dev Obtener todos los documentos de un usuario
     * @param _user Dirección del usuario
     * @return Array de IDs de documentos
     */
    function getUserDocuments(
        address _user
    ) public view returns (string[] memory) {
        return userDocuments[_user];
    }

    /**
     * @dev Obtener total de documentos registrados
     * @return Número total de documentos
     */
    function getTotalDocuments() public view returns (uint256) {
        return documentIds.length;
    }

    /**
     * @dev Obtener todos los IDs de documentos
     * @return Array con todos los IDs
     */
    function getAllDocumentIds() public view returns (string[] memory) {
        return documentIds;
    }
}
