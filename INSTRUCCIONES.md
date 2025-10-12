# 🚀 PASOS PARA EJECUTAR LA APLICACIÓN

## ✅ PASO 1: Iniciar Anvil (Terminal 1)

Abre una terminal y ejecuta:

```bash
anvil
```

**Mantén esta terminal abierta**. Verás algo como:

```
Listening on 127.0.0.1:8545

Available Accounts
==================
(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
...
```

---

## ✅ PASO 2: Desplegar el Contrato (Terminal 2)

Abre una **nueva terminal** y ejecuta:

```bash
cd "/Users/javierruiz-canela/Documents/codecrypto/web3/Ethereum/solidity/proyectos/web3-ethereum_as_database/on-chain application"

forge create src/DocumentRegistry.sol:DocumentRegistry \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**📋 COPIA LA DIRECCIÓN DEL CONTRATO** de la salida:

```
Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
              GUARDA ESTA DIRECCIÓN
```

---

## ✅ PASO 3: Instalar Dependencias de React (Terminal 2)

En la misma terminal:

```bash
cd "/Users/javierruiz-canela/Documents/codecrypto/web3/Ethereum/solidity/proyectos/web3-ethereum_as_database/off-chain application"

npm install
```

---

## ✅ PASO 4: Iniciar la Aplicación React (Terminal 2)

```bash
npm start
```

La aplicación se abrirá automáticamente en: http://localhost:3000

---

## ✅ PASO 5: Usar la Aplicación

1. **Conectar a Blockchain**

   - Click en "Conectar a Anvil Local"
   - Se conectará automáticamente

2. **Inicializar Contrato**

   - Pega la dirección del contrato que copiaste en el Paso 2
   - Click en "Inicializar Contrato"

3. **Subir Documento**

   - Click en "Seleccionar archivo"
   - Elige un archivo PDF u otro
   - Click en "Subir a Blockchain"

   El sistema automáticamente:

   - ✅ Calcula el hash SHA-256
   - ✅ Genera un ID único
   - ✅ Guarda el archivo localmente
   - ✅ Registra en la blockchain

4. **Ver y Gestionar Documentos**
   - Verás todos tus documentos
   - Puedes descargarlos
   - Ver detalles
   - Verificar integridad

---

## 📊 Estado de las Terminales

```
Terminal 1: [ANVIL CORRIENDO]    ← NO CERRAR
Terminal 2: [REACT APP]          ← npm start
```

---

## 🛑 Para Detener

1. En Terminal 2: `Ctrl+C` (detiene React)
2. En Terminal 1: `Ctrl+C` (detiene Anvil)

---

## 🔧 PASO 6 (OPCIONAL): Consultar Documentos desde Línea de Comandos

Puedes usar el script `check-document.sh` para consultar documentos directamente desde la terminal sin usar la interfaz web.

### Modo Interactivo (con menú):

```bash
cd "/Users/javierruiz-canela/Documents/codecrypto/web3/Ethereum/solidity/proyectos/web3-ethereum_as_database/on-chain application/scripts"

./check-document.sh
```

Verás un menú con opciones:

```
1) Obtener información de un documento
2) Verificar hash de un documento
3) Verificar si existe un documento
4) Listar todos los documentos de un usuario
5) Salir
```

### Modo Directo (comandos rápidos):

```bash
# Obtener información completa de un documento
./check-document.sh get "1b5b4e830ece3663"

# Verificar hash de un documento
./check-document.sh verify "1b5b4e830ece3663" "0xabcdef123..."

# Verificar si existe un documento
./check-document.sh exists "1b5b4e830ece3663"

# Listar todos los documentos del usuario
./check-document.sh list "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
```

### Ejemplo de salida:

```
=== Herramientas de Consulta DocumentRegistry ===

📄 Obteniendo información del documento: 1b5b4e830ece3663
Hash:      0x1234567890abcdef...
Path:      ../database filesystem/1b5b4e830ece3663/documento.pdf
Owner:     0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Timestamp: 1697097600
Exists:    true
```

---

## ⚠️ Si algo sale mal

### Error: "Connection refused"

- **Solución**: Asegúrate de que Anvil esté corriendo (Paso 1)

### Error: "Please connect to blockchain first"

- **Solución**: Click en "Conectar a Anvil Local"

### Error: "Contract not initialized"

- **Solución**: Pega la dirección del contrato e inicializa

### No se muestra nada

- **Solución**: Abre las DevTools del navegador (F12) y verifica errores

### Error al ejecutar check-document.sh

- **Solución**: Asegúrate de que el script sea ejecutable:
  ```bash
  chmod +x "on-chain application/scripts/check-document.sh"
  ```

---

## 📝 Información de Conexión

**Anvil Local:**

- URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Cuenta por defecto: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

**React App:**

- URL: `http://localhost:3000`

---

## 🎯 ¡Listo!

Ahora tienes una aplicación completa de gestión de documentos en blockchain funcionando localmente.
