# Frontend - Supply Chain Tracker Dashboard

## 📊 Descripción

Dashboard interactivo en modo **solo lectura** para visualizar la trazabilidad de productos en blockchain. Permite explorar el historial completo de tokens, ver estadísticas y analizar genealogías de productos.

## ✨ Características

### 🔐 Login por Rol
- **8 cuentas predefinidas** (cuentas de prueba de Anvil)
- Cada cuenta tiene un rol específico del smart contract
- Interfaz visual con emojis y nombres de roles
- Modo solo lectura (sin transacciones)

### 📜 Historial Completo
- Lista de todos los tokens creados en blockchain
- Ordenado por fecha de creación (más recientes primero)
- Información detallada de cada token:
  - ID y tipo de token
  - Creador (dirección)
  - Timestamp de creación
  - Tokens padre (genealogía)
- Selección para ver detalles completos

### 📈 Gráficos Estadísticos
- **Tarjetas de resumen:**
  - Total de tokens creados
  - Tipos de tokens activos
  - Número de creadores únicos

- **Gráfico circular (Pie Chart):**
  - Distribución de tokens por tipo
  - Porcentajes visuales

- **Gráfico de barras (Bar Chart):**
  - Top 10 creadores más activos
  - Comparación de actividad

- **Desglose por tipo:**
  - Lista detallada con colores
  - Conteo y porcentajes

### 🌳 Trazabilidad (Genealogía)
- **Visualización en árbol** de la cadena de suministro
- **Dos modos de vista:**
  - **Origen (Padres):** Muestra los ancestros del token seleccionado
  - **Descendientes:** Muestra los tokens hijos creados a partir del seleccionado
- Colores distintivos por tipo de token
- Estructura jerárquica con niveles visuales

## 🛠️ Tecnologías

- **React 19.1.1** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **ethers.js v6** - Blockchain interaction
- **Recharts** - Data visualization
- **CSS Modules** - Component styling

## 📦 Instalación

\`\`\`bash
# Navegar al directorio del frontend
cd frontend/react-ts

# Instalar dependencias
npm install

# Copiar archivo de configuración (si no existe)
cp .env.example .env
\`\`\`

## ⚙️ Configuración

Editar el archivo \`.env\`:

\`\`\`env
VITE_RPC_URL=http://localhost:8545
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
\`\`\`

**Variables:**
- \`VITE_RPC_URL\`: URL del nodo RPC de Anvil
- \`VITE_CONTRACT_ADDRESS\`: Dirección del contrato TrackingChain desplegado

## 🚀 Uso

### Iniciar servidor de desarrollo

\`\`\`bash
npm run dev
\`\`\`

El servidor estará disponible en: **http://localhost:5173/**

### Otros comandos

\`\`\`bash
# Compilar para producción
npm run build

# Vista previa del build
npm run preview

# Linter
npm run lint
\`\`\`

## �� Cuentas de Prueba

Las 8 cuentas predefinidas de Anvil con sus roles:

| Dirección | Rol | Emoji |
|-----------|-----|-------|
| \`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\` | 🌾 Agricultor | AGRICULTOR |
| \`0x70997970C51812dc3A010C7d01b50e0d17dc79C8\` | 📦 Almacenero | ALMACENERO |
| \`0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC\` | ⚙️ Molinero | MOLINERO |
| \`0x90F79bf6EB2c4f870365E785982E1f101E93b906\` | 🔥 Horneador | HORNEADOR |
| \`0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65\` | 📦 Embalador | EMBALADOR |
| \`0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc\` | 🚚 Distribuidor | DISTRIBUIDOR |
| \`0x976EA74026E726554dB657fA54763abd0C3a0aa9\` | 💰 Vendedor | VENDEDOR |
| \`0x14dC79964da2C08b23698B3D3cc7Ca32193d9955\` | Sin Rol | NONE |

## 📐 Arquitectura

\`\`\`
src/
├── components/          # Componentes React
│   ├── Login.tsx       # Selector de cuentas
│   ├── Dashboard.tsx   # Contenedor principal
│   ├── TokenList.tsx   # Lista de tokens
│   ├── TokenDetails.tsx # Detalles del token
│   ├── TokenStats.tsx  # Estadísticas y gráficos
│   └── TokenGenealogy.tsx # Árbol de genealogía
├── context/            # React Context
│   └── BlockchainContext.tsx # Provider de blockchain
├── hooks/              # Custom hooks
│   └── useTokens.ts    # Hook para obtener tokens
├── constants/          # Constantes
│   └── contract.ts     # ABI, enums, colores
├── types/              # TypeScript types
│   └── index.ts        # Interfaces
├── App.tsx             # Componente raíz
├── App.css             # Estilos globales
├── index.tsx           # Entry point
└── index.css           # CSS reset
\`\`\`

## 🎨 Diseño

- **Tema:** Gradiente púrpura (\`#667eea\` → \`#764ba2\`)
- **Colores por tipo de token:**
  - 🌾 Cosecha: Verde (\`#10b981\`)
  - 📦 Almacén: Azul (\`#3b82f6\`)
  - ⚙️ Molienda: Púrpura (\`#8b5cf6\`)
  - 🔥 Horneado: Naranja (\`#f59e0b\`)
  - 📦 Embalaje: Rojo (\`#ef4444\`)
  - 🚚 Distribución: Rosa (\`#ec4899\`)
  - 💰 Venta: Cyan (\`#06b6d4\`)

## 🔄 Flujo de Datos

1. **BlockchainContext** inicializa \`ethers.JsonRpcProvider\` y el contrato
2. **useTokens** hook consulta \`getAllTokens()\` del contrato
3. Auto-refresh cada 5 segundos para actualizaciones en tiempo real
4. Componentes reciben datos mediante Context API
5. Sin transacciones (modo solo lectura)

## 🧪 Testing Local

### Prerequisitos

1. **Anvil corriendo** en puerto 8545
2. **Smart contract desplegado** en la dirección configurada
3. **Servicios backend** generando tokens (opcional)

### Pasos

1. Iniciar Anvil:
\`\`\`bash
anvil
\`\`\`

2. Desplegar contrato (si no está desplegado):
\`\`\`bash
cd smart-contracts
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
\`\`\`

3. Iniciar frontend:
\`\`\`bash
cd frontend/react-ts
npm run dev
\`\`\`

4. Abrir navegador en \`http://localhost:5173\`

5. Seleccionar una cuenta y explorar:
   - **Historial:** Ver tokens existentes
   - **Estadísticas:** Gráficos de distribución
   - **Trazabilidad:** Árbol de genealogía

## 📝 Notas

- **Solo lectura:** No se ejecutan transacciones, solo consultas
- **Auto-refresh:** Datos actualizados cada 5 segundos
- **Responsive:** Funciona en desktop y móvil
- **TypeScript:** Type safety completa
- **Performante:** Optimizado con React hooks

## 🐛 Troubleshooting

### Error: "Cannot connect to RPC"
- Verificar que Anvil esté corriendo
- Comprobar la URL en \`.env\`

### Error: "Contract not found"
- Verificar que el contrato esté desplegado
- Comprobar la dirección en \`.env\`

### No aparecen tokens
- Crear tokens usando los servicios backend
- Verificar que los servicios estén corriendo
- Comprobar logs de Kafka y servicios

### Gráficos no se renderizan
- Verificar que \`recharts\` esté instalado
- Limpiar cache: \`rm -rf node_modules && npm install\`

## 📚 Referencias

- [React Documentation](https://react.dev/)
- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [Recharts Documentation](https://recharts.org/)
- [Vite Documentation](https://vitejs.dev/)
