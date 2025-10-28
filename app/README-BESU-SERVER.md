# Besu Network Manager - Arquitectura con Servidor Standalone

## Problema Resuelto

Las redes Besu no se creaban desde el frontend porque Next.js API Routes **bloquea silenciosamente** las llamadas a `child_process.execSync()`, que la librería Besu usa para ejecutar comandos Docker.

## Solución: Servidor Node.js Standalone

### Arquitectura

```
┌─────────────────────────┐
│   Usuario (Browser)     │
└───────────┬─────────────┘
            │ HTTP
            ↓
┌─────────────────────────┐
│   Next.js Frontend      │
│   (Port 3000)           │
│   - UI Components       │
│   - React              │
└───────────┬─────────────┘
            │ HTTP (fetch)
            ↓
┌─────────────────────────┐
│   Next.js API Routes    │
│   (Port 3000)           │
│   - Validaciones        │
│   - Proxy/Forwarding    │
└───────────┬─────────────┘
            │ HTTP (fetch)
            ↓
┌─────────────────────────┐
│   Besu Server           │
│   (Port 3001)           │
│   - Express.js          │
│   - BesuNetwork lib     │
│   - execSync ✅         │
└───────────┬─────────────┘
            │ execSync
            ↓
┌─────────────────────────┐
│   Docker Engine         │
│   - Containers          │
│   - Networks            │
│   - Volumes             │
└─────────────────────────┘
```

## Uso

### 1. Iniciar Ambos Servidores

```bash
# Opción A: Con un solo comando (Recomendado)
npm run dev:full

# Opción B: Separados (para debugging)
# Terminal 1: Servidor Besu
npm run besu-server

# Terminal 2: Next.js
npm run dev
```

### 2. Acceder a las Aplicaciones

- **Frontend**: http://localhost:3000
- **Besu Server**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### 3. Crear una Red Besu

#### Desde el Frontend (UI)
1. Abrir http://localhost:3000
2. Click en "New Network"
3. Llenar formulario
4. Click en "Create Network"
5. Ver contenedores Docker creándose en tiempo real

#### Desde la API (CLI)

```bash
curl -X POST http://localhost:3000/api/networks \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "name": "my-network",
      "chainId": 1337,
      "consensus": "clique",
      "gasLimit": "0x47E7C4",
      "blockTime": 5,
      "subnet": "172.30.0.0/16",
      "signerAccounts": [{
        "address": "0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9",
        "weiAmount": "1000000000000000000000"
      }]
    },
    "nodes": [
      {
        "name": "bootnode1",
        "ip": "172.30.0.20",
        "rpcPort": 8545,
        "p2pPort": 30303,
        "type": "bootnode"
      },
      {
        "name": "miner1",
        "ip": "172.30.0.21",
        "rpcPort": 8546,
        "p2pPort": 30304,
        "type": "miner"
      }
    ]
  }'
```

#### Directamente al Servidor Besu

```bash
curl -X POST http://localhost:3001/networks \
  -H "Content-Type: application/json" \
  -d '{ ... mismo payload ... }'
```

## API del Servidor Besu

### Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check del servidor |
| POST | `/networks` | Crear y iniciar nueva red |
| GET | `/networks` | Listar todas las redes |
| GET | `/networks/:id` | Obtener red específica |
| POST | `/networks/:id/start` | Iniciar red detenida |
| POST | `/networks/:id/stop` | Detener red |
| DELETE | `/networks/:id` | Eliminar red (containers + files) |
| POST | `/cleanup` | Limpiar todas las redes |

### Ejemplos de Respuestas

#### Health Check
```json
{
  "status": "ok",
  "service": "besu-server",
  "networks": 2
}
```

#### Network Created
```json
{
  "success": true,
  "data": {
    "networkId": "besu-1761643723983-dl8mkf",
    "minerSignerAssociations": [
      {
        "minerName": "miner1",
        "signerAccount": {
          "address": "0xd7a5ab239f5274c06c40ea574aca33b670ce69bf",
          "weiAmount": "1000000000000000000000",
          "minerNode": "miner1"
        },
        "keys": {
          "privateKey": "5598a5cd...",
          "publicKey": "04a23907f7...",
          "address": "0xd7a5ab239f5274c06c40ea574aca33b670ce69bf",
          "enode": "enode://a23907f7...@127.0.0.1:30303"
        }
      }
    ]
  },
  "message": "Network created and started successfully"
}
```

## Archivos Importantes

### Servidor Besu
- `besu-server.js` - Servidor Express standalone
- `besu-server.log` - Logs del servidor (si se configura)

### Next.js
- `src/app/api/networks/route.ts` - Proxy hacia Besu server
- `src/app/api/networks/[id]/route.ts` - Operaciones sobre red específica
- `src/app/api/networks/[id]/start/route.ts` - Iniciar red
- `src/app/api/networks/[id]/stop/route.ts` - Detener red
- `src/app/api/cleanup/route.ts` - Limpieza

### Configuración
- `package.json` - Scripts de inicio
- `networks/` - Directorio de configuraciones de red
- `networks/networks-store.json` - Storage local

## Gestión de Redes

### Ver Redes Activas

```bash
# Listar todas las redes
curl http://localhost:3001/networks

# Ver red específica
curl http://localhost:3001/networks/besu-1234567890-abc123
```

### Gestionar una Red

```bash
# Detener red
curl -X POST http://localhost:3001/networks/besu-1234567890-abc123/stop

# Iniciar red
curl -X POST http://localhost:3001/networks/besu-1234567890-abc123/start

# Eliminar red
curl -X DELETE http://localhost:3001/networks/besu-1234567890-abc123
```

### Limpiar Todo

```bash
# Limpiar todas las redes
curl -X POST http://localhost:3001/cleanup
```

## Docker

### Ver Contenedores Besu

```bash
# Todos los contenedores Besu
docker ps --filter "name=besu"

# Contenedores de una red específica
docker ps --filter "name=besu-1234567890"

# Logs de un nodo
docker logs besu-1234567890-abc123-bootnode1
```

### Verificar Redes Docker

```bash
# Listar redes Docker de Besu
docker network ls --filter "name=besu"

# Inspeccionar red específica
docker network inspect besu-1234567890-abc123
```

### Limpiar Manualmente

```bash
# Detener todos los contenedores Besu
docker stop $(docker ps -q --filter "name=besu")

# Eliminar todos los contenedores Besu
docker rm -f $(docker ps -aq --filter "name=besu")

# Eliminar redes Docker
docker network prune -f
```

## Debugging

### Logs del Servidor Besu

```bash
# Ver logs en tiempo real
tail -f logs/besu-server.log  # Si se configura logging

# O consultar la consola donde se ejecutó
npm run besu-server
```

### Verificar Conectividad

```bash
# Verificar que Besu server esté corriendo
curl http://localhost:3001/health

# Verificar que Next.js esté corriendo
curl http://localhost:3000/api/networks
```

### Problemas Comunes

#### Error: "Besu server unavailable"
```bash
# Verificar que el servidor esté corriendo
curl http://localhost:3001/health

# Si no responde, iniciarlo
npm run besu-server
```

#### Error: "Port 3001 already in use"
```bash
# Encontrar proceso usando el puerto
lsof -i :3001

# Matar proceso
kill -9 <PID>

# O usar otro puerto (configurar BESU_SERVER_URL)
PORT=3002 npm run besu-server
```

#### Error: "Docker daemon not running"
```bash
# Verificar Docker
docker info

# Iniciar Docker Desktop
open -a Docker
```

## Configuración Avanzada

### Variables de Entorno

```bash
# .env.local
BESU_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Puerto Personalizado

```javascript
// besu-server.js (línea 10)
const PORT = process.env.PORT || 3001;
```

### Logging Avanzado

```javascript
// Agregar winston o similar
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'besu-server.log' })
  ]
});
```

## Producción

### Despliegue Recomendado

1. **Besu Server**: Servidor dedicado o contenedor Docker
2. **Next.js**: Vercel, Netlify, o servidor Node.js
3. **Docker**: Servidor separado con recursos suficientes

### Configuración para Producción

```bash
# Iniciar en producción
npm run build
npm run start:full
```

### Consideraciones de Seguridad

1. **Autenticación**: Agregar JWT o similar para proteger endpoints
2. **Rate Limiting**: Limitar creación de redes por IP
3. **CORS**: Configurar orígenes permitidos
4. **Firewall**: Bloquear puerto 3001 externamente (solo acceso interno)

## Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `next dev --turbopack` | Iniciar Next.js en desarrollo |
| `besu-server` | `node besu-server.js` | Iniciar servidor Besu |
| `dev:full` | `concurrently ...` | Iniciar ambos servidores |
| `build` | `next build` | Build de producción |
| `start` | `next start` | Next.js en producción |
| `start:full` | `concurrently ...` | Ambos servidores en producción |

## Soporte

Para reportar issues o solicitar features:
- GitHub Issues: [repositorio]
- Email: jrcanelalopez@gmail.com

---

**Versión**: 1.0
**Fecha**: 28 de Octubre 2025
**Autor**: Javier Ruiz-Canela López
