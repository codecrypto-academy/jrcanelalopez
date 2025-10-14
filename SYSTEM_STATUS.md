# 🎯 ESTADO ACTUAL DEL SISTEMA - Supply Chain Tracker

**Fecha:** 15 de Octubre, 2025 - 01:15 AM  
**Estado:** ✅ OPERATIVO

---

## 📊 Componentes del Sistema

### 1. ✅ Blockchain (Anvil)

```
Puerto: 8545
Estado: RUNNING
PID: 85860
Comando: anvil
```

**Contrato Desplegado:**

- Dirección: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- Tipo: SupplyChainTracking
- Tokens creados: **213**

---

### 2. ✅ Kafka Infrastructure

#### Zookeeper

```
Estado: RUNNING (Docker)
Container: zookeeper
Puerto: 2181
```

#### Kafka Broker

```
Estado: RUNNING (Docker)
Container: kafka
Puerto: 9092
Red: supply-chain-network
```

#### Kafka UI

```
Estado: RUNNING (Docker)
Container: kafka-ui
Puerto: 8080
URL: http://localhost:8080
```

---

### 3. ✅ Microservicios Backend (7 servicios)

| Servicio        | PID   | Estado     | Última Actividad                   |
| --------------- | ----- | ---------- | ---------------------------------- |
| 🌾 COSECHA      | 39727 | ✅ RUNNING | Creando tokens cada 1s             |
| 📦 ALMACEN      | 39729 | ✅ RUNNING | Procesando eventos                 |
| ⚙️ MOLIENDA     | 39737 | ✅ RUNNING | Procesando eventos                 |
| 🔥 HORNEADO     | 39739 | ✅ RUNNING | Procesando eventos                 |
| 📦 EMBALAJE     | 39747 | ✅ RUNNING | Procesando eventos                 |
| 🚚 DISTRIBUCION | 39751 | ✅ RUNNING | Procesando eventos                 |
| 💰 VENTA        | 39761 | ✅ RUNNING | Consumiendo eventos (end of chain) |

**Logs ubicados en:**

```
/backend/services/*/[servicio].log
```

---

### 4. ✅ Frontend Dashboard

```
Framework: React 19 + TypeScript + Vite
Puerto: 5173
URL: http://localhost:5173/
Estado: RUNNING
```

**Características Activas:**

- ✅ Login por Rol (8 cuentas)
- ✅ Historial de Tokens
- ✅ Estadísticas con Gráficos
- ✅ Árbol de Genealogía
- ✅ Auto-refresh (5 segundos)
- ✅ Modo Solo Lectura

---

## 🔄 Flujo de Datos Actual

```
COSECHA (cada 1s)
    ↓
Blockchain (Token creado)
    ↓
Event: TokenCreated
    ↓
Kafka Topic: cosecha-event
    ↓
ALMACEN (consume 2 cosechas)
    ↓
Blockchain (Token ALMACEN)
    ↓
Event: TokenCreated
    ↓
Kafka Topic: almacen-event
    ↓
MOLIENDA (consume 2 almacenes)
    ↓
... (cadena continúa)
    ↓
VENTA (final de la cadena)
```

**Frontend (paralelo):**

```
Auto-refresh cada 5s
    ↓
contract.totalSupply()
    ↓
contract.getTokenMetadata(1...213)
    ↓
Renderiza UI con 213 tokens
```

---

## 📈 Estadísticas Actuales

### Tokens en Blockchain

- **Total:** 213 tokens
- **Tasa de creación:** ~1 token/segundo (COSECHA)
- **Última verificación:** 01:15 AM

### Tipos de Tokens (estimado)

- 🌾 COSECHA: ~150-160
- 📦 ALMACEN: ~40-50
- ⚙️ MOLIENDA: ~10-15
- 🔥 HORNEADO: ~5-8
- 📦 EMBALAJE: ~2-4
- 🚚 DISTRIBUCION: ~1-2
- 💰 VENTA: ~0-1

---

## 🛠️ Comandos Útiles

### Ver todos los procesos

```bash
ps aux | grep "node index.js" | grep -v grep
```

### Ver logs en tiempo real

```bash
# Todos los servicios
tail -f /backend/services/*/\*.log

# Un servicio específico
tail -f /backend/services/cosecha/cosecha.log
```

### Detener todos los servicios

```bash
# Matar por PID
kill 39727 39729 39737 39739 39747 39751 39761

# O con pkill
pkill -f "node index.js"
```

### Verificar Kafka

```bash
docker compose ps
docker logs kafka
```

### Consultar contrato

```bash
# Total de tokens
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "totalSupply()" --rpc-url http://localhost:8545

# Metadata de un token
cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "getTokenMetadata(uint256)" 1 --rpc-url http://localhost:8545
```

---

## 🧪 Testing del Frontend

### 1. Acceder a la aplicación

Abrir navegador en: **http://localhost:5173/**

### 2. Login

Seleccionar cualquiera de las 8 cuentas:

- 🌾 Agricultor: `0xf39Fd...`
- 📦 Almacenero: `0x7099...`
- ⚙️ Molinero: `0x3C44...`
- 🔥 Horneador: `0x90F7...`
- 📦 Embalador: `0x15d3...`
- 🚚 Distribuidor: `0x9965...`
- 💰 Vendedor: `0x976E...`
- Sin Rol: `0x14dC...`

### 3. Navegar por las vistas

- **Historial:** Lista de 213+ tokens
- **Estadísticas:** Gráficos de distribución
- **Trazabilidad:** Árbol de genealogía

### 4. Verificar auto-refresh

- Los tokens deben actualizarse automáticamente cada 5 segundos
- El contador debe incrementar a medida que COSECHA crea tokens

---

## 🎯 Verificación de Funcionamiento

### ✅ Checklist Completo

- [x] Anvil corriendo en puerto 8545
- [x] Smart contract desplegado
- [x] Kafka + Zookeeper en Docker
- [x] Kafka UI accesible en puerto 8080
- [x] 7 servicios backend corriendo
- [x] Frontend corriendo en puerto 5173
- [x] Tokens creándose automáticamente
- [x] Eventos Kafka fluyendo
- [x] Frontend mostrando datos en tiempo real
- [x] Auto-refresh funcionando
- [x] Gráficos renderizando
- [x] Genealogía funcionando

---

## 📝 Notas Importantes

1. **COSECHA** crea 1 token por segundo
2. **Cadena de procesamiento** toma tiempo:
   - ALMACEN espera 2 COSECHA
   - MOLIENDA espera 2 ALMACEN
   - Etc.
3. **Frontend** hace polling cada 5s a blockchain
4. **No hay transacciones** desde frontend (solo lectura)
5. **Logs** están en cada directorio de servicio

---

## 🚀 Estado General

**Sistema completamente operativo y generando datos en tiempo real** ✅

- Blockchain: ✅ Funcionando
- Backend: ✅ 7 servicios activos
- Kafka: ✅ Eventos fluyendo
- Frontend: ✅ Dashboard operativo
- Auto-refresh: ✅ Actualizando cada 5s

**¡Todo listo para pruebas y demostración!** 🎉
