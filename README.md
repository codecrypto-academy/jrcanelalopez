# 📄 Document Registry on Ethereum Blockchain

Una aplicación completa de gestión de documentos en la blockchain de Ethereum que combina almacenamiento on-chain (blockchain) y off-chain (filesystem local).

## 🏗️ Arquitectura del Sistema

```
Usuario
  ↓
Off-chain Application (React)
  ↓
  ├─→ Hash File (SHA-256)
  ├─→ On-chain Application (Smart Contract)
  └─→ Database Filesystem (LocalStorage)
```

## 📁 Estructura del Proyecto

```
web3-ethereum_as_database/
├── on-chain application/
│   └── DocumentRegistry.sol       # Smart contract en Solidity
├── off-chain application/
│   ├── src/
│   │   ├── App.js                # Aplicación React principal
│   │   ├── App.css               # Estilos
│   │   ├── services/
│   │   │   ├── blockchainService.js    # Interacción con blockchain
│   │   │   └── fileSystemService.js    # Gestión de archivos
│   │   └── utils/
│   │       └── documentHash.js         # Cálculo de hashes
│   ├── public/
│   └── package.json
├── database filesystem/          # Almacenamiento de archivos
├── script/
│   └── Deploy.s.sol             # Script de deployment
└── foundry.toml                 # Configuración de Foundry
```

## 🚀 Instalación y Configuración

### 1. Prerequisitos

- Node.js v16+ y npm
- Foundry (forge, anvil)
- Git

### 2. Instalar Foundry (si no está instalado)

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 3. Inicializar el proyecto

```bash
cd web3-ethereum_as_database

# Inicializar Foundry
forge install foundry-rs/forge-std

# Instalar dependencias de React
cd "off-chain application"
npm install
```

## 🔧 Uso del Sistema

### Paso 1: Iniciar Anvil (Red Local)

En una terminal, ejecuta:

```bash
anvil
```

Esto iniciará un nodo local de Ethereum en:

- **URL**: http://127.0.0.1:8545
- **Chain ID**: 31337

Verás 10 cuentas con 10,000 ETH cada una. Guarda la primera cuenta y su private key:

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Paso 2: Desplegar el Smart Contract

En otra terminal:

```bash
# Desde la raíz del proyecto
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast

# O más simple
forge create on-chain\ application/DocumentRegistry.sol:DocumentRegistry --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**IMPORTANTE**: Guarda la dirección del contrato desplegado. Ejemplo:

```
Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Paso 3: Iniciar la Aplicación React

```bash
cd "off-chain application"
npm start
```

La aplicación se abrirá en http://localhost:3000

### Paso 4: Usar la Aplicación

1. **Conectar a Blockchain**

   - Click en "Conectar a Anvil Local"
   - Se conectará automáticamente con la primera cuenta de Anvil

2. **Inicializar Contrato**

   - Pega la dirección del contrato desplegado
   - Click en "Inicializar Contrato"

3. **Subir Documento**

   - Click en "Seleccionar archivo"
   - Elige un PDF u otro archivo
   - Click en "Subir a Blockchain"

   El sistema automáticamente:

   - ✅ Calcula el hash SHA-256 del archivo
   - ✅ Genera un ID único
   - ✅ Guarda el archivo en el filesystem local
   - ✅ Registra el hash y metadata en la blockchain

4. **Ver Documentos**
   - Verás todos tus documentos registrados
   - Puedes descargarlos
   - Ver detalles completos
   - Verificar integridad

## 🔐 Características del Sistema

### On-chain (Blockchain)

- ✅ ID único del documento
- ✅ Hash SHA-256 del documento
- ✅ Path del archivo en filesystem
- ✅ Dirección del propietario
- ✅ Timestamp de creación
- ✅ Verificación de integridad

### Off-chain (Aplicación)

- ✅ Interfaz React moderna
- ✅ Cálculo automático de hashes
- ✅ Almacenamiento local de archivos
- ✅ Gestión de documentos (CRUD)
- ✅ Descarga de archivos
- ✅ Estadísticas en tiempo real

## 📊 Funciones del Smart Contract

```solidity
// Guardar documento
storeDocument(documentId, documentHash, path)

// Actualizar documento
updateDocument(documentId, newHash, newPath)

// Obtener documento completo
getDocument(documentId) → (id, hash, path, owner, timestamp)

// Obtener solo el hash
getDocumentHash(documentId) → hash

// Verificar hash
verifyDocumentHash(documentId, hash) → bool

// Obtener documentos del usuario
getUserDocuments(userAddress) → documentIds[]

// Total de documentos
getTotalDocuments() → uint256
```

## 🔍 Verificación de Documentos

El sistema permite verificar la integridad de documentos:

1. La aplicación calcula el hash del documento al subirlo
2. El hash se guarda en la blockchain (inmutable)
3. Al verificar, se recalcula el hash y se compara
4. Si coinciden → ✅ Documento auténtico
5. Si no coinciden → ❌ Documento modificado

## 🧪 Testing

### Compilar contrato

```bash
forge build
```

### Verificar contrato

```bash
forge test -vvv
```

## 🌐 Configuración de Red

### Anvil Local (Desarrollo)

```javascript
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency: ETH
```

### Agregar a MetaMask

1. Abrir MetaMask
2. Agregar red manualmente
3. Configurar con los datos de Anvil
4. Importar cuenta usando la private key de Anvil

## 📝 Flujo de Trabajo Completo

```
1. Usuario selecciona archivo
   ↓
2. App calcula SHA-256 hash
   ↓
3. Genera ID único (hash del hash + timestamp + filename)
   ↓
4. Guarda archivo en localStorage (simula filesystem)
   ↓
5. Envía transacción a blockchain con:
   - documentId
   - documentHash
   - path
   ↓
6. Smart contract almacena metadata
   ↓
7. Evento emitido: DocumentStored
   ↓
8. App actualiza UI con nuevo documento
```

## 🛠️ Tecnologías Utilizadas

- **Blockchain**: Ethereum (Anvil local)
- **Smart Contract**: Solidity ^0.8.0
- **Framework**: Foundry (Forge, Anvil)
- **Frontend**: React 18
- **Web3 Libraries**: Ethers.js v6
- **Hashing**: CryptoJS (SHA-256)
- **Storage**: LocalStorage (simula filesystem)

## ⚠️ Consideraciones de Producción

Este proyecto es educativo. Para producción considera:

1. **Backend real**: Reemplazar localStorage por servidor con filesystem real
2. **IPFS**: Para almacenamiento descentralizado de archivos
3. **Gas optimization**: Optimizar costos del smart contract
4. **Seguridad**: Auditoría del contrato
5. **Escalabilidad**: Layer 2 solutions o sidechains
6. **Cifrado**: Cifrar archivos antes de almacenar

## 📚 Recursos Adicionales

- [Foundry Book](https://book.getfoundry.sh/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [React Documentation](https://react.dev/)

## 🤝 Contribuir

Este es un proyecto educativo. ¡Las contribuciones son bienvenidas!

## 📄 Licencia

MIT

---

**Desarrollado para aprender sobre integración de blockchain con aplicaciones web**
