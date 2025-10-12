import { ethers } from "ethers";

// ABI del contrato DocumentRegistry
const CONTRACT_ABI = [
  "function storeDocument(string memory _documentId, string memory _documentHash, string memory _path) public",
  "function updateDocument(string memory _documentId, string memory _newHash, string memory _newPath) public",
  "function getDocumentHash(string memory _documentId) public view returns (string memory)",
  "function getDocumentPath(string memory _documentId) public view returns (string memory)",
  "function getDocument(string memory _documentId) public view returns (string memory documentId, string memory documentHash, string memory path, address owner, uint256 timestamp)",
  "function documentExists(string memory _documentId) public view returns (bool)",
  "function verifyDocumentHash(string memory _documentId, string memory _hash) public view returns (bool)",
  "function getUserDocuments(address _user) public view returns (string[] memory)",
  "function getTotalDocuments() public view returns (uint256)",
  "function getAllDocumentIds() public view returns (string[] memory)",
  "event DocumentStored(string indexed documentId, string documentHash, string path, address indexed owner, uint256 timestamp)",
  "event DocumentUpdated(string indexed documentId, string newHash, string newPath, uint256 timestamp)",
];

// Configuración de Anvil local
const ANVIL_RPC_URL = "http://127.0.0.1:8545";
const CHAIN_ID = 31337;

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = null;
  }

  /**
   * Conectar con MetaMask o proveedor Web3
   */
  async connect() {
    try {
      if (window.ethereum) {
        // Conectar con MetaMask
        await window.ethereum.request({ method: "eth_requestAccounts" });
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();

        // Verificar que estamos en la red correcta (Anvil local)
        const network = await this.provider.getNetwork();
        if (Number(network.chainId) !== CHAIN_ID) {
          throw new Error(
            `Please connect to Anvil local network (Chain ID: ${CHAIN_ID})`
          );
        }

        return await this.signer.getAddress();
      } else {
        throw new Error("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting to blockchain:", error);
      throw error;
    }
  }

  /**
   * Conectar directamente a Anvil sin MetaMask (para desarrollo)
   */
  async connectToAnvil(privateKey = null) {
    try {
      this.provider = new ethers.JsonRpcProvider(ANVIL_RPC_URL);

      if (privateKey) {
        this.signer = new ethers.Wallet(privateKey, this.provider);
      } else {
        // Usar la primera cuenta de Anvil por defecto
        const defaultPrivateKey =
          "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
        this.signer = new ethers.Wallet(defaultPrivateKey, this.provider);
      }

      return await this.signer.getAddress();
    } catch (error) {
      console.error("Error connecting to Anvil:", error);
      throw error;
    }
  }

  /**
   * Inicializar el contrato
   */
  initContract(contractAddress) {
    if (!this.signer) {
      throw new Error("Please connect to blockchain first");
    }

    this.contractAddress = contractAddress;
    this.contract = new ethers.Contract(
      contractAddress,
      CONTRACT_ABI,
      this.signer
    );
    return this.contract;
  }

  /**
   * Guardar documento en la blockchain
   */
  async storeDocument(documentId, documentHash, path) {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      const tx = await this.contract.storeDocument(
        documentId,
        documentHash,
        path
      );
      const receipt = await tx.wait();

      console.log("Document stored on blockchain:", receipt);
      return receipt;
    } catch (error) {
      console.error("Error storing document:", error);
      throw error;
    }
  }

  /**
   * Actualizar documento en la blockchain
   */
  async updateDocument(documentId, newHash, newPath) {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      const tx = await this.contract.updateDocument(
        documentId,
        newHash,
        newPath
      );
      const receipt = await tx.wait();

      console.log("Document updated on blockchain:", receipt);
      return receipt;
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  }

  /**
   * Obtener información de un documento
   */
  async getDocument(documentId) {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      const [docId, hash, path, owner, timestamp] =
        await this.contract.getDocument(documentId);

      return {
        documentId: docId,
        documentHash: hash,
        path: path,
        owner: owner,
        timestamp: Number(timestamp),
        createdAt: new Date(Number(timestamp) * 1000).toLocaleString(),
      };
    } catch (error) {
      console.error("Error getting document:", error);
      throw error;
    }
  }

  /**
   * Verificar si un documento existe
   */
  async documentExists(documentId) {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      return await this.contract.documentExists(documentId);
    } catch (error) {
      console.error("Error checking document existence:", error);
      throw error;
    }
  }

  /**
   * Verificar hash de un documento
   */
  async verifyDocumentHash(documentId, hash) {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      return await this.contract.verifyDocumentHash(documentId, hash);
    } catch (error) {
      console.error("Error verifying document hash:", error);
      throw error;
    }
  }

  /**
   * Obtener todos los documentos de un usuario
   */
  async getUserDocuments(userAddress) {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      return await this.contract.getUserDocuments(userAddress);
    } catch (error) {
      console.error("Error getting user documents:", error);
      throw error;
    }
  }

  /**
   * Obtener total de documentos
   */
  async getTotalDocuments() {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      const total = await this.contract.getTotalDocuments();
      return Number(total);
    } catch (error) {
      console.error("Error getting total documents:", error);
      throw error;
    }
  }

  /**
   * Obtener todos los IDs de documentos
   */
  async getAllDocumentIds() {
    try {
      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      return await this.contract.getAllDocumentIds();
    } catch (error) {
      console.error("Error getting all document IDs:", error);
      throw error;
    }
  }

  /**
   * Escuchar eventos de almacenamiento de documentos
   */
  onDocumentStored(callback) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    this.contract.on(
      "DocumentStored",
      (documentId, documentHash, path, owner, timestamp, event) => {
        callback({
          documentId,
          documentHash,
          path,
          owner,
          timestamp: Number(timestamp),
          transactionHash: event.log.transactionHash,
        });
      }
    );
  }

  /**
   * Desconectar listeners
   */
  disconnect() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

export default new BlockchainService();
