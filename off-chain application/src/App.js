import React, { useState, useEffect } from "react";
import "./App.css";
import blockchainService from "./services/blockchainService";
import fileSystemService from "./services/fileSystemService";
import {
  createHash,
  generateDocumentId,
  checkHash,
} from "./utils/documentHash";

function App() {
  const [account, setAccount] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [connected, setConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({ totalDocuments: 0, totalSize: 0 });

  // Conectar a la blockchain
  const connectBlockchain = async () => {
    try {
      setLoading(true);
      setMessage("Conectando a Anvil local...");

      // Conectar a Anvil directamente
      const address = await blockchainService.connectToAnvil();
      setAccount(address);

      setMessage(`Conectado con cuenta: ${address}`);
      setLoading(false);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  // Inicializar contrato
  const initializeContract = () => {
    if (!contractAddress) {
      setMessage("Por favor, ingresa la dirección del contrato");
      return;
    }

    try {
      blockchainService.initContract(contractAddress);
      setConnected(true);
      setMessage("Contrato inicializado correctamente");
      loadDocuments();
    } catch (error) {
      setMessage(`Error al inicializar contrato: ${error.message}`);
    }
  };

  // Cargar documentos del usuario
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const userDocs = await blockchainService.getUserDocuments(account);

      const docsDetails = await Promise.all(
        userDocs.map(async (docId) => {
          try {
            const doc = await blockchainService.getDocument(docId);
            const metadata = fileSystemService.getMetadata(docId);
            return { ...doc, metadata };
          } catch (error) {
            console.error(`Error loading document ${docId}:`, error);
            return null;
          }
        })
      );

      setDocuments(docsDetails.filter((doc) => doc !== null));

      // Actualizar estadísticas
      const total = await blockchainService.getTotalDocuments();
      const fsStats = fileSystemService.getStats();
      setStats({ totalDocuments: total, ...fsStats });

      setLoading(false);
    } catch (error) {
      console.error("Error loading documents:", error);
      setLoading(false);
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage(
        `Archivo seleccionado: ${file.name} (${(file.size / 1024).toFixed(
          2
        )} KB)`
      );
    }
  };

  // Subir documento
  const uploadDocument = async () => {
    if (!selectedFile) {
      setMessage("Por favor, selecciona un archivo");
      return;
    }

    if (!connected) {
      setMessage("Por favor, inicializa el contrato primero");
      return;
    }

    try {
      setLoading(true);
      setMessage("Calculando hash del documento...");

      // 1. Calcular hash del archivo
      const documentHash = await createHash(selectedFile);
      console.log("Document hash:", documentHash);

      // 2. Generar ID único del documento
      const documentId = generateDocumentId(selectedFile.name, documentHash);
      console.log("Document ID:", documentId);

      // 3. Guardar archivo en filesystem
      setMessage("Guardando archivo en filesystem...");
      const path = await fileSystemService.saveFile(
        selectedFile,
        documentId,
        documentHash
      );
      console.log("File saved at:", path);

      // 4. Guardar en blockchain
      setMessage("Guardando en blockchain...");
      await blockchainService.storeDocument(documentId, documentHash, path);

      setMessage(`✅ Documento guardado exitosamente! ID: ${documentId}`);
      setSelectedFile(null);

      // Recargar documentos
      await loadDocuments();

      setLoading(false);
    } catch (error) {
      console.error("Error uploading document:", error);
      setMessage(`❌ Error: ${error.message}`);
      setLoading(false);
    }
  };

  // Verificar documento
  const verifyDocument = async (documentId, file) => {
    try {
      setLoading(true);
      setMessage("Verificando documento...");

      // Obtener hash de la blockchain
      const blockchainDoc = await blockchainService.getDocument(documentId);

      // Calcular hash del archivo actual
      const currentHash = await createHash(file);

      // Comparar hashes
      const isValid = currentHash === blockchainDoc.documentHash;

      if (isValid) {
        setMessage(
          `✅ Documento verificado! El hash coincide con la blockchain.`
        );
      } else {
        setMessage(
          `❌ Advertencia: El documento ha sido modificado. El hash no coincide.`
        );
      }

      setLoading(false);
      return isValid;
    } catch (error) {
      console.error("Error verifying document:", error);
      setMessage(`❌ Error verificando: ${error.message}`);
      setLoading(false);
      return false;
    }
  };

  // Descargar documento
  const downloadDocument = (documentId) => {
    try {
      fileSystemService.downloadFile(documentId);
      setMessage(`Descargando documento ${documentId}...`);
    } catch (error) {
      setMessage(`Error descargando: ${error.message}`);
    }
  };

  // Ver detalles de documento
  const viewDocumentDetails = async (documentId) => {
    try {
      const doc = await blockchainService.getDocument(documentId);
      const details = `
📄 Detalles del Documento:
━━━━━━━━━━━━━━━━━━━━━━━━━
ID: ${doc.documentId}
Hash: ${doc.documentHash}
Path: ${doc.path}
Owner: ${doc.owner}
Creado: ${doc.createdAt}
      `;
      alert(details);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📄 Document Registry on Ethereum</h1>
        <p>Gestión de Documentos en Blockchain</p>
      </header>

      <div className="container">
        {/* Sección de Conexión */}
        <div className="section connection-section">
          <h2>🔗 Conexión</h2>

          {!account ? (
            <button
              onClick={connectBlockchain}
              disabled={loading}
              className="btn btn-primary"
            >
              Conectar a Anvil Local
            </button>
          ) : (
            <div className="connected-info">
              <p>
                ✅ Conectado: <code>{account}</code>
              </p>

              {!connected && (
                <div className="contract-input">
                  <input
                    type="text"
                    placeholder="Dirección del contrato (0x...)"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    className="input-field"
                  />
                  <button
                    onClick={initializeContract}
                    className="btn btn-secondary"
                  >
                    Inicializar Contrato
                  </button>
                </div>
              )}

              {connected && (
                <p>
                  ✅ Contrato: <code>{contractAddress}</code>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sección de Upload */}
        {connected && (
          <div className="section upload-section">
            <h2>📤 Subir Documento</h2>

            <div className="file-input-container">
              <input
                type="file"
                onChange={handleFileSelect}
                className="file-input"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="file-label">
                {selectedFile ? selectedFile.name : "Seleccionar archivo"}
              </label>
            </div>

            {selectedFile && (
              <button
                onClick={uploadDocument}
                disabled={loading}
                className="btn btn-success"
              >
                Subir a Blockchain
              </button>
            )}
          </div>
        )}

        {/* Mensajes */}
        {message && (
          <div
            className={`message ${
              message.includes("Error") || message.includes("❌")
                ? "error"
                : "success"
            }`}
          >
            {message}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Procesando...</p>
          </div>
        )}

        {/* Estadísticas */}
        {connected && (
          <div className="section stats-section">
            <h2>📊 Estadísticas</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{stats.totalDocuments}</h3>
                <p>Documentos en Blockchain</p>
              </div>
              <div className="stat-card">
                <h3>{stats.totalFiles || 0}</h3>
                <p>Archivos Locales</p>
              </div>
              <div className="stat-card">
                <h3>{stats.totalSizeMB || 0} MB</h3>
                <p>Almacenamiento Usado</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Documentos */}
        {connected && documents.length > 0 && (
          <div className="section documents-section">
            <h2>📋 Mis Documentos</h2>
            <button
              onClick={loadDocuments}
              className="btn btn-secondary"
              disabled={loading}
            >
              🔄 Actualizar
            </button>

            <div className="documents-list">
              {documents.map((doc) => (
                <div key={doc.documentId} className="document-card">
                  <div className="document-header">
                    <h3>{doc.metadata?.fileName || "Documento"}</h3>
                    <span className="document-id">ID: {doc.documentId}</span>
                  </div>

                  <div className="document-info">
                    <p>
                      <strong>Hash:</strong>{" "}
                      <code>{doc.documentHash.substring(0, 20)}...</code>
                    </p>
                    <p>
                      <strong>Creado:</strong> {doc.createdAt}
                    </p>
                    <p>
                      <strong>Tamaño:</strong>{" "}
                      {doc.metadata
                        ? (doc.metadata.size / 1024).toFixed(2)
                        : "0"}{" "}
                      KB
                    </p>
                  </div>

                  <div className="document-actions">
                    <button
                      onClick={() => downloadDocument(doc.documentId)}
                      className="btn btn-small"
                    >
                      ⬇️ Descargar
                    </button>
                    <button
                      onClick={() => viewDocumentDetails(doc.documentId)}
                      className="btn btn-small"
                    >
                      ℹ️ Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información de Anvil */}
        <div className="section info-section">
          <h2>ℹ️ Configuración de Anvil</h2>
          <div className="info-grid">
            <div>
              <strong>RPC URL:</strong> http://127.0.0.1:8545
            </div>
            <div>
              <strong>Chain ID:</strong> 31337
            </div>
            <div>
              <strong>Network:</strong> Anvil Local
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>Ethereum as Database - Document Registry System</p>
        <p>Powered by Solidity, React, Ethers.js & Anvil</p>
      </footer>
    </div>
  );
}

export default App;
