# 📱 Off-Chain Application - Document Registry Frontend

## 📖 Índice

1. [Visión General](#visión-general)
2. [Arquitectura de la Aplicación](#arquitectura-de-la-aplicación)
3. [Servicios (Services)](#servicios-services)
   - [blockchainService.js](#blockchainservicejs)
   - [fileSystemService.js](#filesystemservicejs)
4. [Utilidades (Utils)](#utilidades-utils)
   - [documentHash.js](#documenthashjs)
5. [Componente Principal (App.js)](#componente-principal-appjs)
6. [Flujo de Datos](#flujo-de-datos)
7. [Casos de Uso](#casos-de-uso)

---

## 🎯 Visión General

Esta aplicación React proporciona una interfaz de usuario para interactuar con el smart contract `DocumentRegistry` desplegado en la blockchain de Ethereum (Anvil local). Permite a los usuarios:

- 📤 Subir documentos y registrarlos en blockchain
- 🔍 Verificar la integridad de documentos
- 📥 Descargar documentos almacenados
- 📊 Ver estadísticas y gestionar documentos

### Stack Tecnológico

- **React 18**: Framework de interfaz de usuario
- **Ethers.js v6**: Biblioteca para interactuar con Ethereum
- **CryptoJS**: Cálculo de hashes SHA-256
- **LocalStorage**: Almacenamiento simulado de archivos (navegador)

---

## 🏗️ Arquitectura de la Aplicación

```
off-chain application/
│
├── src/
│   ├── App.js                      # Componente principal (UI + lógica)
│   ├── App.css                     # Estilos
│   │
│   ├── services/                   # Capa de servicios
│   │   ├── blockchainService.js    # Comunicación con smart contract
│   │   └── fileSystemService.js    # Gestión de archivos locales
│   │
│   └── utils/                      # Utilidades
│       └── documentHash.js         # Cálculo de hashes SHA-256
│
└── public/
    └── index.html                  # Punto de entrada HTML
```

### Patrón de Diseño

La aplicación sigue el patrón **"Separation of Concerns"** (Separación de Responsabilidades):

1. **App.js**: Capa de presentación (UI) y orquestación
2. **Services**: Capa de lógica de negocio
3. **Utils**: Funciones auxiliares reutilizables

---

## 🔧 Servicios (Services)

Los servicios son clases singleton que encapsulan la lógica de negocio y proporcionan una API limpia para el componente principal.

### `blockchainService.js`

**Propósito**: Gestionar toda la comunicación con la blockchain de Ethereum y el smart contract.

#### 🔑 Propiedades Principales

```javascript
class BlockchainService {
  provider; // Proveedor de conexión a la blockchain
  signer; // Cuenta que firma transacciones
  contract; // Instancia del contrato inteligente
  contractAddress; // Dirección del contrato desplegado
}
```

#### 📡 Métodos Públicos

##### 1. **`connect()`** - Conectar con MetaMask

```javascript
async connect()
```

- **Propósito**: Conectar la aplicación con MetaMask (wallet del navegador)
- **Flujo**:
  1. Solicita acceso a las cuentas de MetaMask (`eth_requestAccounts`)
  2. Crea un `BrowserProvider` de ethers.js
  3. Obtiene el `signer` (cuenta activa)
  4. Verifica que el usuario esté en la red correcta (Chain ID 31337 = Anvil)
- **Retorna**: Dirección de la cuenta conectada (ej: `0xf39Fd6e...`)
- **Errores**: Lanza error si MetaMask no está instalado o red incorrecta

**Ejemplo de uso**:

```javascript
const address = await blockchainService.connect();
console.log("Conectado con:", address);
```

##### 2. **`connectToAnvil(privateKey?)`** - Conexión directa a Anvil

```javascript
async connectToAnvil(privateKey = null)
```

- **Propósito**: Conectar directamente a Anvil sin MetaMask (modo desarrollo)
- **Parámetros**:
  - `privateKey` (opcional): Clave privada personalizada
  - Si no se proporciona, usa la cuenta #0 de Anvil por defecto
- **Flujo**:
  1. Crea un `JsonRpcProvider` apuntando a `http://127.0.0.1:8545`
  2. Crea un `Wallet` con la clave privada
  3. Conecta el wallet al provider
- **Retorna**: Dirección de la cuenta
- **Clave privada por defecto**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

**Ejemplo de uso**:

```javascript
const address = await blockchainService.connectToAnvil();
// Conectado con: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

##### 3. **`initContract(contractAddress)`** - Inicializar contrato

```javascript
initContract(contractAddress);
```

- **Propósito**: Crear una instancia del contrato para interactuar con él
- **Parámetros**:
  - `contractAddress`: Dirección del contrato desplegado (ej: `0x5FbDB...`)
- **Flujo**:
  1. Verifica que haya un signer conectado
  2. Crea una instancia de `ethers.Contract` con:
     - Dirección del contrato
     - ABI del contrato (interfaz de funciones)
     - Signer (para firmar transacciones)
- **ABI del Contrato**: Define las funciones disponibles:
  ```javascript
  const CONTRACT_ABI = [
    "function storeDocument(string, string, string) public",
    "function getDocument(string) public view returns (...)",
    "function verifyDocumentHash(string, string) public view returns (bool)",
    // ... más funciones
  ];
  ```

**Ejemplo de uso**:

```javascript
blockchainService.initContract("0x5FbDB2315678afecb367f032d93F642f64180aa3");
```

##### 4. **`storeDocument(documentId, documentHash, path)`** - Guardar en blockchain

```javascript
async storeDocument(documentId, documentHash, path)
```

- **Propósito**: Registrar un documento en la blockchain
- **Parámetros**:
  - `documentId`: Identificador único (generado por `generateDocumentId`)
  - `documentHash`: Hash SHA-256 del contenido del archivo
  - `path`: Ruta virtual del archivo
- **Flujo**:
  1. Llama a la función `storeDocument` del smart contract
  2. Envía una transacción (requiere gas)
  3. Espera confirmación con `tx.wait()`
- **Retorna**: Receipt de la transacción (incluye gasUsed, blockNumber, etc.)
- **Costo**: Consume gas (pagado con ETH)

**Ejemplo de uso**:

```javascript
const receipt = await blockchainService.storeDocument(
  "1b5b4e830ece3663",
  "0xabcdef123456789...",
  "../database filesystem/1b5b4e830ece3663/documento.pdf"
);
console.log("Transacción:", receipt.hash);
```

##### 5. **`getDocument(documentId)`** - Obtener documento

```javascript
async getDocument(documentId)
```

- **Propósito**: Recuperar información de un documento desde la blockchain
- **Parámetros**:
  - `documentId`: ID del documento a consultar
- **Flujo**:
  1. Llama a la función `getDocument` del smart contract (solo lectura, sin gas)
  2. Desestructura la tupla retornada: `[docId, hash, path, owner, timestamp]`
  3. Formatea los datos para JavaScript
- **Retorna**: Objeto con información del documento:
  ```javascript
  {
    documentId: "1b5b4e830ece3663",
    documentHash: "0xabcdef...",
    path: "../database filesystem/...",
    owner: "0xf39Fd6e...",
    timestamp: 1697097600,
    createdAt: "12/10/2025, 10:30:00"
  }
  ```

##### 6. **`verifyDocumentHash(documentId, hash)`** - Verificar integridad

```javascript
async verifyDocumentHash(documentId, hash)
```

- **Propósito**: Verificar que el hash de un archivo coincide con el registrado
- **Retorna**: `true` si coincide, `false` si no

##### 7. **`getUserDocuments(userAddress)`** - Listar documentos de usuario

```javascript
async getUserDocuments(userAddress)
```

- **Propósito**: Obtener todos los IDs de documentos de un usuario
- **Retorna**: Array de strings con los IDs
  ```javascript
  ["1b5b4e830ece3663", "2c6c5f941fdg4774", ...]
  ```

##### 8. **`getTotalDocuments()`** - Total de documentos

```javascript
async getTotalDocuments()
```

- **Propósito**: Obtener el contador total de documentos en la blockchain
- **Retorna**: Número total (ej: `5`)

##### 9. **`onDocumentStored(callback)`** - Escuchar eventos

```javascript
onDocumentStored(callback);
```

- **Propósito**: Suscribirse a eventos de almacenamiento de documentos
- **Flujo**:
  1. Escucha el evento `DocumentStored` emitido por el contrato
  2. Ejecuta el callback cuando se registra un nuevo documento
- **Uso**: Actualizar la UI en tiempo real

**Ejemplo de uso**:

```javascript
blockchainService.onDocumentStored((event) => {
  console.log("Nuevo documento:", event.documentId);
  // Actualizar lista de documentos
});
```

---

### `fileSystemService.js`

**Propósito**: Gestionar el almacenamiento local de archivos en el navegador (simulación de filesystem).

⚠️ **IMPORTANTE**: En producción, esto debería ser un backend real o IPFS. LocalStorage tiene un límite de ~5-10MB.

#### 🗄️ Estructura de Almacenamiento

```javascript
// localStorage["document_registry_files"]
{
  "1b5b4e830ece3663": {
    fileName: "contrato.pdf",
    path: "../database filesystem/1b5b4e830ece3663/contrato.pdf",
    base64: "data:application/pdf;base64,JVBERi0xLjQK...", // Archivo completo
    size: 524288,                    // bytes
    type: "application/pdf",
    hash: "0xabcdef123456...",
    uploadedAt: "2025-10-12T10:30:00.000Z"
  },
  // ... más documentos
}

// localStorage["document_registry_metadata"]
{
  "1b5b4e830ece3663": {
    fileName: "contrato.pdf",
    path: "...",
    size: 524288,
    type: "application/pdf",
    hash: "0xabcdef...",
    uploadedAt: "2025-10-12T10:30:00.000Z"
  }
}
```

#### 📁 Métodos Públicos

##### 1. **`saveFile(file, documentId, hash)`** - Guardar archivo

```javascript
async saveFile(file, documentId, hash)
```

- **Propósito**: Almacenar el archivo completo en LocalStorage
- **Parámetros**:
  - `file`: Objeto File de JavaScript (del input type="file")
  - `documentId`: ID único generado
  - `hash`: Hash SHA-256 del archivo
- **Flujo**:
  1. Crea una ruta virtual: `../database filesystem/[documentId]/[nombreArchivo]`
  2. Lee el archivo y lo convierte a **base64** usando `FileReader`
  3. Almacena en LocalStorage junto con metadatos
  4. Guarda metadata separada para consultas rápidas
- **Retorna**: Path del archivo guardado

**¿Por qué base64?**

- LocalStorage solo acepta strings
- base64 codifica datos binarios (PDFs, imágenes) como texto

**Ejemplo de uso**:

```javascript
const file = document.getElementById("fileInput").files[0];
const path = await fileSystemService.saveFile(
  file,
  "1b5b4e830ece3663",
  "0xabcdef..."
);
// Retorna: "../database filesystem/1b5b4e830ece3663/contrato.pdf"
```

##### 2. **`getFile(documentId)`** - Obtener archivo

```javascript
getFile(documentId);
```

- **Propósito**: Recuperar información completa del archivo
- **Retorna**: Objeto con todos los datos (incluido base64)

##### 3. **`downloadFile(documentId)`** - Descargar archivo

```javascript
downloadFile(documentId);
```

- **Propósito**: Permitir al usuario descargar el archivo en su computadora
- **Flujo**:
  1. Obtiene el archivo con `getFile()`
  2. Convierte el string base64 de vuelta a datos binarios
  3. Crea un `Blob` (objeto binario)
  4. Genera una URL temporal del blob
  5. Crea un elemento `<a>` invisible con la URL
  6. Simula un click para descargar
  7. Limpia la URL temporal
- **Resultado**: Se descarga el archivo en la carpeta Downloads del usuario

**Proceso técnico**:

```javascript
// base64 → byteArray → Blob → URL → Download
"data:application/pdf;base64,JVBERi..."
  → [74, 86, 66, 69, ...]  // Array de bytes
  → Blob({ type: "application/pdf" })
  → "blob:http://localhost:3000/abc-123"
  → <a href="blob:..." download="archivo.pdf">
```

##### 4. **`deleteFile(documentId)`** - Eliminar archivo

```javascript
deleteFile(documentId);
```

- **Propósito**: Borrar archivo y metadata de LocalStorage

##### 5. **`fileExists(documentId)`** - Verificar existencia

```javascript
fileExists(documentId);
```

- **Retorna**: `true` si el archivo existe, `false` si no

##### 6. **`getStats()`** - Obtener estadísticas

```javascript
getStats();
```

- **Propósito**: Calcular estadísticas del almacenamiento
- **Retorna**:
  ```javascript
  {
    totalFiles: 3,
    totalSize: 1572864,        // bytes
    totalSizeMB: "1.50",       // MB
    fileTypes: {
      "application/pdf": 2,
      "image/png": 1
    }
  }
  ```

##### 7. **`fileToBase64(file)`** - Convertir a base64

```javascript
async fileToBase64(file)
```

- **Propósito**: Convertir un File a string base64
- **Técnica**: Usa `FileReader.readAsDataURL()`
- **Retorna**: String como `"data:application/pdf;base64,JVBERi0xLjQK..."`

##### 8. **`clearAll()`** - Limpiar todo

```javascript
clearAll();
```

- **Propósito**: Borrar todos los archivos y metadata (¡PELIGROSO!)
- **Uso**: Solo para desarrollo/testing

---

## 🔐 Utilidades (Utils)

### `documentHash.js`

**Propósito**: Funciones criptográficas para calcular y verificar hashes SHA-256 de documentos.

#### 🔑 Funciones Exportadas

##### 1. **`createHash(file)`** - Crear hash SHA-256

```javascript
export const createHash = async(file);
```

- **Propósito**: Calcular el hash SHA-256 de un archivo
- **Parámetros**:
  - `file`: Objeto File de JavaScript
- **Flujo**:
  1. Lee el archivo como `ArrayBuffer` usando `FileReader`
  2. Convierte el buffer a `WordArray` de CryptoJS
  3. Calcula SHA-256 usando CryptoJS
  4. Convierte el hash a formato hexadecimal
- **Retorna**: String hexadecimal de 64 caracteres
  ```javascript
  "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
  ```

**¿Qué es SHA-256?**

- Algoritmo de hashing criptográfico
- Produce un hash único de 256 bits (64 caracteres hex)
- Mismos datos → mismo hash (determinístico)
- Datos diferentes → hashes completamente distintos
- Imposible revertir (one-way function)

**Ejemplo de uso**:

```javascript
const file = document.getElementById("fileInput").files[0];
const hash = await createHash(file);
console.log(hash); // "abcdef123456..."
```

##### 2. **`checkHash(file, expectedHash)`** - Verificar hash

```javascript
export const checkHash = async(file, expectedHash);
```

- **Propósito**: Verificar si el hash de un archivo coincide con un hash esperado
- **Parámetros**:
  - `file`: Archivo a verificar
  - `expectedHash`: Hash registrado en blockchain
- **Flujo**:
  1. Calcula el hash actual del archivo con `createHash()`
  2. Compara con el hash esperado
- **Retorna**: `true` si coincide, `false` si no
- **Uso**: Detectar si un documento fue modificado

**Ejemplo de uso**:

```javascript
const isValid = await checkHash(file, "0xabcdef123...");
if (isValid) {
  console.log("✅ Documento auténtico");
} else {
  console.log("❌ Documento modificado");
}
```

##### 3. **`generateDocumentId(fileName, hash)`** - Generar ID único

```javascript
export const generateDocumentId = (fileName, hash);
```

- **Propósito**: Crear un identificador único para el documento
- **Parámetros**:
  - `fileName`: Nombre del archivo (ej: "contrato.pdf")
  - `hash`: Hash del contenido del archivo
- **Algoritmo**:
  1. Combina: `fileName + hash + timestamp`
  2. Calcula SHA-256 de la combinación
  3. Toma los primeros 16 caracteres del hash
- **Retorna**: String de 16 caracteres
  ```javascript
  "1b5b4e830ece3663";
  ```

**¿Por qué es único?**

- Incluye el timestamp (milisegundos desde 1970)
- Incluye el hash del contenido (único para ese archivo)
- Probabilidad de colisión: prácticamente 0

**Ejemplo de uso**:

```javascript
const docId = generateDocumentId("contrato.pdf", "0xabcdef...");
// "1b5b4e830ece3663"
```

---

## 📱 Componente Principal (App.js)

**Propósito**: Componente React que orquesta toda la lógica de la aplicación y renderiza la UI.

### 📊 Estado de la Aplicación (useState)

```javascript
const [account, setAccount] = useState(""); // Dirección de la cuenta conectada
const [contractAddress, setContractAddress] = useState(""); // Dirección del contrato
const [connected, setConnected] = useState(false); // ¿Contrato inicializado?
const [selectedFile, setSelectedFile] = useState(null); // Archivo seleccionado para subir
const [documents, setDocuments] = useState([]); // Lista de documentos del usuario
const [loading, setLoading] = useState(false); // Estado de carga
const [message, setMessage] = useState(""); // Mensajes para el usuario
const [stats, setStats] = useState({
  // Estadísticas
  totalDocuments: 0,
  totalSize: 0,
});
```

### 🎯 Funciones Principales

#### 1. **`connectBlockchain()`** - Conectar a blockchain

```javascript
const connectBlockchain = async () => {
  setLoading(true);
  setMessage("Conectando a Anvil local...");

  const address = await blockchainService.connectToAnvil();
  setAccount(address);

  setMessage(`Conectado con cuenta: ${address}`);
  setLoading(false);
};
```

- **Flujo**:
  1. Usuario hace click en "Conectar a Anvil Local"
  2. Llama a `blockchainService.connectToAnvil()`
  3. Guarda la dirección de la cuenta en el estado
  4. Muestra mensaje de confirmación

#### 2. **`initializeContract()`** - Inicializar contrato

```javascript
const initializeContract = () => {
  if (!contractAddress) {
    setMessage("Por favor, ingresa la dirección del contrato");
    return;
  }

  blockchainService.initContract(contractAddress);
  setConnected(true);
  setMessage("Contrato inicializado correctamente");
  loadDocuments();
};
```

- **Flujo**:
  1. Usuario pega la dirección del contrato desplegado
  2. Click en "Inicializar Contrato"
  3. Inicializa el contrato con blockchainService
  4. Marca `connected = true`
  5. Carga los documentos del usuario

#### 3. **`uploadDocument()`** - Subir documento (⭐ FUNCIÓN CLAVE)

```javascript
const uploadDocument = async () => {
  setLoading(true);

  // 1. Calcular hash del archivo
  const documentHash = await createHash(selectedFile);

  // 2. Generar ID único
  const documentId = generateDocumentId(selectedFile.name, documentHash);

  // 3. Guardar archivo localmente
  const path = await fileSystemService.saveFile(
    selectedFile,
    documentId,
    documentHash
  );

  // 4. Registrar en blockchain
  await blockchainService.storeDocument(documentId, documentHash, path);

  setMessage(`✅ Documento guardado! ID: ${documentId}`);
  await loadDocuments(); // Recargar lista
};
```

**Este es el flujo completo de subida:**

```
Usuario selecciona archivo
         ↓
1. createHash(file)
   → "0xabcdef123456..."
         ↓
2. generateDocumentId(name, hash)
   → "1b5b4e830ece3663"
         ↓
3. fileSystemService.saveFile(file, id, hash)
   → Guarda en LocalStorage (base64)
   → Retorna path: "../database filesystem/1b5b4e830ece3663/file.pdf"
         ↓
4. blockchainService.storeDocument(id, hash, path)
   → Envía transacción a Ethereum
   → Registra metadata en smart contract
   → Espera confirmación
         ↓
5. loadDocuments()
   → Actualiza lista de documentos en UI
```

#### 4. **`loadDocuments()`** - Cargar documentos del usuario

```javascript
const loadDocuments = async () => {
  setLoading(true);

  // 1. Obtener IDs de documentos del usuario desde blockchain
  const userDocs = await blockchainService.getUserDocuments(account);
  // ["1b5b4e830ece3663", "2c6c5f941fdg4774", ...]

  // 2. Para cada ID, obtener detalles
  const docsDetails = await Promise.all(
    userDocs.map(async (docId) => {
      const doc = await blockchainService.getDocument(docId);
      const metadata = fileSystemService.getMetadata(docId);
      return { ...doc, metadata };
    })
  );

  setDocuments(docsDetails);

  // 3. Actualizar estadísticas
  const total = await blockchainService.getTotalDocuments();
  const fsStats = fileSystemService.getStats();
  setStats({ totalDocuments: total, ...fsStats });
};
```

- **Resultado**: Array de documentos con toda su información

#### 5. **`downloadDocument(documentId)`** - Descargar documento

```javascript
const downloadDocument = (documentId) => {
  fileSystemService.downloadFile(documentId);
  setMessage(`Descargando documento ${documentId}...`);
};
```

- Usuario hace click en "⬇️ Descargar"
- Se descarga el archivo desde LocalStorage

#### 6. **`viewDocumentDetails(documentId)`** - Ver detalles

```javascript
const viewDocumentDetails = async (documentId) => {
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
};
```

---

## 🔄 Flujo de Datos

### Flujo de Subida de Documento

```
┌─────────────┐
│   Usuario   │
│ (selecciona │
│   archivo)  │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────────────────────┐
│              App.js (uploadDocument)             │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. createHash(file) ← documentHash.js           │
│     └→ "0xabcdef123456..."                       │
│                                                  │
│  2. generateDocumentId(name, hash)               │
│     └→ "1b5b4e830ece3663"                        │
│                                                  │
│  3. fileSystemService.saveFile()                 │
│     ├→ Convierte a base64                        │
│     ├→ Guarda en localStorage                    │
│     └→ Retorna path                              │
│                                                  │
│  4. blockchainService.storeDocument()            │
│     ├→ Crea transacción                          │
│     ├→ Firma con private key                     │
│     ├→ Envía a Anvil                             │
│     └→ Espera confirmación                       │
│                                                  │
└──────────────┬───────────────────────────────────┘
               │
               ↓
       ┌───────────────┐
       │   Blockchain  │
       │   (Anvil)     │
       │               │
       │ DocumentStored│
       │     event     │
       └───────┬───────┘
               │
               ↓
       ┌───────────────┐
       │  LocalStorage │
       │               │
       │  Archivo      │
       │  (base64)     │
       └───────────────┘
```

### Flujo de Recuperación de Documento

```
┌─────────────┐
│   Usuario   │
│  (carga la  │
│   página)   │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────────────────────┐
│              App.js (loadDocuments)              │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. blockchainService.getUserDocuments(address)  │
│     └→ ["1b5b...", "2c6c..."]                    │
│                                                  │
│  2. Para cada ID:                                │
│     blockchainService.getDocument(id)            │
│     └→ { documentHash, path, owner, ... }        │
│                                                  │
│  3. fileSystemService.getMetadata(id)            │
│     └→ { fileName, size, type, ... }             │
│                                                  │
│  4. Combinar datos blockchain + localStorage     │
│                                                  │
│  5. Renderizar lista en UI                       │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🎬 Casos de Uso

### Caso 1: Usuario Sube un Documento por Primera Vez

```
Usuario                    App.js                  Services               Blockchain
  │                          │                        │                       │
  ├─ Click "Conectar"  ──→   │                        │                       │
  │                          ├─ connectBlockchain()   │                       │
  │                          │  └─ connectToAnvil() ─→│                       │
  │                          │                        ├─ JsonRpcProvider  ──→ │
  │                          │                        │     + Wallet          │
  │                          │  ←──────────────────── │                       │
  │  ←─ "Conectado: 0xf39"  ─┤                        │                       │
  │                          │                        │                       │
  ├─ Pega dirección contrato│                        │                       │
  ├─ Click "Inicializar" ──→ │                        │                       │
  │                          ├─ initContract(addr)    │                       │
  │                          │  └─ new Contract()  ──→│                       │
  │  ←─ "Contrato OK"  ──────┤                        │                       │
  │                          │                        │                       │
  ├─ Selecciona archivo ──→  │                        │                       │
  ├─ Click "Subir"  ────────→│                        │                       │
  │                          ├─ uploadDocument()      │                       │
  │                          │  ├─ createHash(file)  ─┤                       │
  │                          │  │   └→ "0xabc..."     │                       │
  │                          │  ├─ generateDocumentId()                       │
  │                          │  │   └→ "1b5b..."      │                       │
  │                          │  ├─ saveFile() ───────→│                       │
  │                          │  │   (localStorage)    │                       │
  │                          │  ├─ storeDocument() ──→│                       │
  │                          │  │                     ├─ contract.store... ─→ │
  │                          │  │                     │                  (tx)│
  │                          │  │                     │  ←─ receipt ──────────┤
  │  ←─ "✅ Documento OK!" ──┤  │                     │                       │
```

### Caso 2: Usuario Verifica Integridad de un Documento

```
Usuario                    App.js                  Services               Blockchain
  │                          │                        │                       │
  ├─ Click "ℹ️ Detalles" ──→ │                        │                       │
  │                          ├─ viewDocumentDetails() │                       │
  │                          │  └─ getDocument(id) ──→│                       │
  │                          │                        ├─ contract.get... ───→ │
  │                          │                        │  ←─ {hash, owner...}──┤
  │  ←─ Alert con info  ─────┤                        │                       │
  │                          │                        │                       │
  ├─ Click "⬇️ Descargar" ──→│                        │                       │
  │                          ├─ downloadDocument()    │                       │
  │                          │  └─ downloadFile() ───→│                       │
  │                          │     (localStorage)     │                       │
  │  ←─ Archivo descargado  ─┤                        │                       │
  │                          │                        │                       │
  │ Modifica el archivo      │                        │                       │
  ├─ Intenta verificar ─────→│                        │                       │
  │                          ├─ verifyDocument()      │                       │
  │                          │  ├─ getDocument() ───→ │                       │
  │                          │  │  (hash blockchain)  │                       │
  │                          │  ├─ createHash(file)   │                       │
  │                          │  │  (hash actual)      │                       │
  │                          │  └─ Compara hashes     │                       │
  │  ←─ "❌ Documento       ─┤     (NO coinciden)     │                       │
  │      modificado!"        │                        │                       │
```

---

## 🔐 Seguridad y Consideraciones

### ✅ Puntos Fuertes

1. **Integridad Verificable**: Los hashes en blockchain son inmutables
2. **Prueba de Autoría**: El owner queda registrado permanentemente
3. **Timestamp Confiable**: La blockchain garantiza el orden temporal
4. **Transparencia**: Cualquiera puede verificar los datos on-chain

### ⚠️ Limitaciones Actuales

1. **LocalStorage**:
   - Límite de ~5-10MB
   - No es seguro para datos sensibles
   - Se borra si el usuario limpia el navegador
2. **Sin Encriptación**: Los archivos se guardan sin cifrar

3. **Dependencia de Anvil Local**: Solo funciona en desarrollo

### 🚀 Mejoras Recomendadas para Producción

1. **Usar IPFS** en lugar de LocalStorage:

   ```javascript
   const ipfsHash = await ipfs.add(file);
   await blockchainService.storeDocument(docId, hash, ipfsHash);
   ```

2. **Encriptar Archivos** antes de guardar:

   ```javascript
   const encrypted = await encrypt(file, userPassword);
   await saveFile(encrypted, docId, hash);
   ```

3. **Conectar a Red Real** (Sepolia, Polygon, etc.)

4. **Usar MetaMask** para firmar transacciones

5. **Backend API** para gestión de archivos

---

## 📚 Resumen

### Responsabilidades por Módulo

| Módulo                 | Responsabilidad             | Tecnología       |
| ---------------------- | --------------------------- | ---------------- |
| `App.js`               | UI + Orquestación           | React Hooks      |
| `blockchainService.js` | Comunicación con blockchain | Ethers.js        |
| `fileSystemService.js` | Almacenamiento de archivos  | LocalStorage API |
| `documentHash.js`      | Criptografía (hashes)       | CryptoJS         |

### Flujo Completo de un Documento

```
Archivo Usuario
    ↓
SHA-256 Hash (documentHash.js)
    ↓
ID Único (documentHash.js)
    ↓
Guardar Local (fileSystemService.js)
    ↓
Registrar Blockchain (blockchainService.js)
    ↓
Smart Contract (DocumentRegistry.sol)
```

---

## 🎓 Conceptos Clave

- **Singleton Pattern**: Los servicios son instancias únicas (`export default new ...`)
- **Async/Await**: Todo es asíncrono (blockchain, FileReader, etc.)
- **Separation of Concerns**: Cada módulo tiene una responsabilidad clara
- **Base64 Encoding**: Convierte datos binarios a texto para LocalStorage
- **SHA-256**: Hash criptográfico para verificar integridad
- **Ethers.js Contract**: Abstracción para interactuar con smart contracts
- **React State Management**: `useState` para manejar el estado de la UI

---

**✨ ¡Ahora tienes una comprensión completa de cómo funciona la aplicación!**
