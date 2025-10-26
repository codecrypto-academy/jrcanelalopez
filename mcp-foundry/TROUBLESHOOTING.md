# Troubleshooting - mcp-foundry

## Problema: `anvil_status` No Detecta Anvil Corriendo

### 🔍 Descripción del Problema

Cuando ejecutas `anvil_status` en el MCP Inspector o desde Claude Desktop, devuelve "❌ Anvil is not running" aunque Anvil esté realmente corriendo en tu sistema.

### 🎯 Causa Raíz

El servidor MCP solo podía detectar Anvil si **fue iniciado por el propio MCP** usando la herramienta `anvil_start`. Si iniciaste Anvil manualmente (por ejemplo, con `anvil`, `./start-anvil.sh`, o desde otra terminal), el MCP no lo sabía porque solo verificaba su estado interno en memoria.

**Código original** (`foundry-executor.ts:182-184`):
```typescript
isAnvilRunning(): boolean {
  return this.anvilProcess !== null && !this.anvilProcess.killed;
}
```

Este código solo verificaba si había un proceso `anvilProcess` rastreado en memoria del MCP, no si Anvil estaba realmente corriendo en el sistema.

### ✅ Solución Implementada

Mejoramos el executor para que detecte Anvil tanto si fue iniciado por el MCP como si fue iniciado externamente.

#### 1. **Detección Mejorada** (`isAnvilRunning`)

```typescript
isAnvilRunning(): boolean {
  // First check if we have a tracked process
  if (this.anvilProcess !== null && !this.anvilProcess.killed) {
    return true;
  }

  // If not tracked, check if anvil is running in the system
  try {
    const { execSync } = require('child_process');
    const result = execSync('pgrep -x anvil', { encoding: 'utf-8' }).trim();
    return result.length > 0;
  } catch (error) {
    // pgrep returns non-zero exit code if no process found
    return false;
  }
}
```

**Qué hace**:
- Primero verifica el proceso rastreado internamente
- Si no hay proceso rastreado, usa `pgrep` para buscar cualquier proceso `anvil` en el sistema
- Devuelve `true` si encuentra Anvil corriendo de cualquier manera

#### 2. **Logs Informativos** (`getAnvilLogs`)

```typescript
getAnvilLogs(lastN?: number): string {
  // If we have tracked logs, return them
  if (this.anvilLogs.length > 0) {
    if (lastN) {
      return this.anvilLogs.slice(-lastN).join('\n');
    }
    return this.anvilLogs.join('\n');
  }

  // If Anvil is running but not tracked, get process info
  try {
    const { execSync } = require('child_process');
    const pid = execSync('pgrep -x anvil', { encoding: 'utf-8' }).trim();

    if (pid) {
      const psOutput = execSync(`ps -p ${pid} -o command=`, { encoding: 'utf-8' }).trim();
      return `Anvil is running (PID: ${pid})\nCommand: ${psOutput}\n\nNote: Anvil was started outside of MCP, so detailed logs are not available.\nUse 'anvil_stop' to stop it, or start Anvil with 'anvil_start' to capture logs.`;
    }
  } catch (error) {
    // Ignore error
  }

  return 'No logs available';
}
```

**Qué hace**:
- Devuelve logs completos si Anvil fue iniciado por MCP
- Si Anvil fue iniciado externamente, muestra PID y comando usado para iniciarlo
- Informa al usuario que los logs detallados no están disponibles para procesos externos

#### 3. **Stop Mejorado** (`stopAnvil`)

```typescript
stopAnvil(): CommandResult {
  // First try to stop tracked process
  if (this.anvilProcess) {
    this.anvilProcess.kill('SIGTERM');
    this.anvilProcess = null;
    this.anvilLogs = [];

    return {
      success: true,
      output: 'Anvil stopped successfully (MCP-managed process)',
      exitCode: 0,
    };
  }

  // If not tracked, try to stop any running anvil process
  try {
    const { execSync } = require('child_process');
    const pid = execSync('pgrep -x anvil', { encoding: 'utf-8' }).trim();

    if (pid) {
      execSync(`kill -TERM ${pid}`);
      return {
        success: true,
        output: `Anvil stopped successfully (PID: ${pid})\nNote: Anvil was started outside of MCP`,
        exitCode: 0,
      };
    }
  } catch (error) {
    // Ignore error - process might not exist
  }

  return {
    success: false,
    output: '',
    error: 'Anvil is not running',
    exitCode: -1,
  };
}
```

**Qué hace**:
- Puede detener tanto procesos MCP-managed como externos
- Proporciona feedback claro sobre qué tipo de proceso detuvo

### 🚀 Cómo Aplicar la Solución

```bash
# 1. Los cambios ya están en el código fuente (foundry-executor.ts)
# 2. Recompilar el proyecto
cd mcp-foundry
npm run build

# 3. Reiniciar el inspector (si lo estás usando)
pkill -f "inspector" && npm run inspector

# 4. O reiniciar Claude Desktop (si usas la app GUI)
pkill -9 "Claude" && open -a "Claude"
```

### 📊 Antes vs Después

#### Antes:
```bash
# Iniciar Anvil manualmente
$ anvil

# En MCP Inspector, llamar a anvil_status
❌ Anvil is not running
```

#### Después:
```bash
# Iniciar Anvil manualmente
$ anvil

# En MCP Inspector, llamar a anvil_status
✅ Anvil is running

Recent logs:
Anvil is running (PID: 57347)
Command: anvil --port 8545 --chain-id 31337 --accounts 10 --balance 10000 --block-time 1 --gas-limit 30000000

Note: Anvil was started outside of MCP, so detailed logs are not available.
Use 'anvil_stop' to stop it, or start Anvil with 'anvil_start' to capture logs.
```

### 🎯 Beneficios

1. ✅ **Detección universal**: Detecta Anvil sin importar cómo fue iniciado
2. ✅ **Información clara**: Indica si el proceso es MCP-managed o externo
3. ✅ **Control completo**: Puede detener cualquier instancia de Anvil
4. ✅ **Backward compatible**: Sigue funcionando igual para procesos MCP-managed
5. ✅ **Mejor UX**: El usuario no necesita recordar cómo inició Anvil

### 🐛 Limitaciones Conocidas

1. **Logs externos no disponibles**: Si Anvil fue iniciado externamente, no podemos capturar sus logs en tiempo real
2. **Solo funciona en Unix-like systems**: Usa `pgrep` y `ps`, que son comandos de sistemas Unix/Linux/macOS
3. **Nombres de proceso**: Asume que el proceso se llama exactamente "anvil" (el comando `pgrep -x` busca coincidencia exacta)

### 💡 Mejoras Futuras Posibles

1. Detectar múltiples instancias de Anvil corriendo en diferentes puertos
2. Soporte para Windows (usar `tasklist` o similares)
3. Capturar logs de procesos externos usando otras técnicas
4. Mostrar configuración detectada (puerto, chain ID, etc.) de procesos externos

---

## Otros Problemas Comunes

### Error EPIPE en Inspector

**Síntoma**: El inspector muestra error `EPIPE` o "Not connected"

**Causa**: Cerraste la pestaña del navegador mientras el servidor seguía corriendo

**Solución**:
```bash
pkill -f "inspector"
npm run inspector
```

Y **NO cierres la pestaña del navegador** mientras uses el inspector.

### Inspector no abre en el navegador

**Síntoma**: El inspector dice que abrirá el navegador pero no lo hace

**Solución**: Copia manualmente la URL mostrada en la terminal:
```
http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=<token>
```

### Puerto ocupado

**Síntoma**: Error "EADDRINUSE: address already in use"

**Solución**:
```bash
# Encontrar proceso usando el puerto
lsof -i :6274
lsof -i :6277

# Matar procesos
kill -9 <PID>
```

---

**Fecha de actualización**: 2025-10-26
**Versión**: 1.1.0
