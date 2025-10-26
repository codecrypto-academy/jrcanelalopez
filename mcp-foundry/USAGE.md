# Guía de Uso: mcp-foundry

## ¿Qué es mcp-foundry?

**mcp-foundry** es un servidor MCP (Model Context Protocol) que permite a Claude Code interactuar directamente con las herramientas de Foundry (forge, cast, anvil) sin necesidad de usar comandos bash.

## Verificar que mcp-foundry está funcionando

### 1. Revisar configuración

Tu configuración en `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "foundry": {
      "command": "node",
      "args": [
        "/Users/javierruiz-canela/Documents/codecrypto/web3/Ethereum/solidity/proyectos/web3-98_pfm_traza_2025/mcp-foundry/build/index.js"
      ]
    }
  }
}
```

### 2. Verificar logs

Monitorear logs en tiempo real:

```bash
tail -f ~/Library/Logs/Claude/mcp-server-foundry.log
```

Si ves "Foundry MCP Server running on stdio" sin errores EPIPE, el servidor está funcionando correctamente.

### 3. Reiniciar Claude Code

Después de cualquier cambio en el código o configuración:

```bash
# macOS
pkill -9 "Claude" && open -a "Claude"
```

## Herramientas Disponibles

### 🔨 FORGE Tools

#### `forge_build`

Compilar smart contracts

**Parámetros**:

- `workingDir` (opcional): Directorio de trabajo
- `force` (opcional): Forzar recompilación

**Ejemplo de uso en Claude Code**:

```
"Compila el smart contract en sc/ usando forge_build"
```

#### `forge_test`

Ejecutar tests

**Parámetros**:

- `workingDir` (opcional): Directorio de trabajo
- `matchTest` (opcional): Filtrar por nombre de test
- `matchContract` (opcional): Filtrar por contrato
- `verbosity` (opcional): Nivel de verbosidad (1-5)
- `gasReport` (opcional): Generar reporte de gas

**Ejemplo**:

```
"Ejecuta los tests del contrato usando forge_test con verbosity 3"
```

#### `forge_coverage`

Generar reporte de cobertura

**Parámetros**:

- `workingDir` (opcional): Directorio de trabajo

**Ejemplo**:

```
"Genera un reporte de cobertura con forge_coverage"
```

#### `forge_script`

Ejecutar script de Solidity

**Parámetros**:

- `scriptPath` (requerido): Ruta al script
- `workingDir` (opcional): Directorio de trabajo
- `rpcUrl` (opcional): URL del RPC
- `privateKey` (opcional): Clave privada
- `broadcast` (opcional): Broadcast de transacciones
- `verify` (opcional): Verificar en Etherscan

**Ejemplo**:

```
"Ejecuta el script de deploy con forge_script en Anvil local"
```

#### `forge_clean`

Eliminar artefactos de compilación

**Parámetros**:

- `workingDir` (opcional): Directorio de trabajo

**Ejemplo**:

```
"Limpia los artefactos de build con forge_clean"
```

---

### ⚡ CAST Tools

#### `cast_call`

Llamar función de solo lectura

**Parámetros**:

- `contractAddress` (requerido): Dirección del contrato
- `signature` (requerido): Firma de la función
- `args` (opcional): Argumentos
- `rpcUrl` (requerido): URL del RPC
- `blockNumber` (opcional): Número de bloque

**Ejemplo**:

```
"Usa cast_call para consultar getUserInfo(address) en el contrato 0x..."
```

#### `cast_send`

Enviar transacción

**Parámetros**:

- `contractAddress` (requerido): Dirección del contrato
- `signature` (requerido): Firma de la función
- `args` (opcional): Argumentos
- `rpcUrl` (requerido): URL del RPC
- `privateKey` (requerido): Clave privada
- `value` (opcional): ETH a enviar
- `gasLimit` (opcional): Límite de gas

**Ejemplo**:

```
"Envía una transacción con cast_send para registrar un usuario"
```

#### `cast_block_number`

Obtener número de bloque actual

**Parámetros**:

- `rpcUrl` (requerido): URL del RPC

**Ejemplo**:

```
"¿Cuál es el número de bloque actual en Anvil?"
```

#### `cast_balance`

Consultar balance de ETH

**Parámetros**:

- `address` (requerido): Dirección a consultar
- `rpcUrl` (requerido): URL del RPC

**Ejemplo**:

```
"Verifica el balance de la cuenta admin en Anvil"
```

#### `cast_chain_id`

Obtener Chain ID

**Parámetros**:

- `rpcUrl` (requerido): URL del RPC

**Ejemplo**:

```
"¿Cuál es el chain ID de Anvil?"
```

---

### 🔗 ANVIL Tools

#### `anvil_start`

Iniciar blockchain local

**Parámetros**:

- `port` (opcional): Puerto (default: 8545)
- `chainId` (opcional): Chain ID (default: 31337)
- `accounts` (opcional): Número de cuentas (default: 10)
- `balance` (opcional): Balance por cuenta en ETH (default: 10000)
- `blockTime` (opcional): Tiempo de bloque en segundos
- `fork` (opcional): URL del RPC para fork
- `forkBlockNumber` (opcional): Bloque desde el cual hacer fork

**Ejemplo**:

```
"Inicia Anvil con anvil_start en el puerto 8545"
```

#### `anvil_stop`

Detener Anvil

**Sin parámetros**

**Ejemplo**:

```
"Detén el proceso de Anvil con anvil_stop"
```

#### `anvil_status`

Verificar estado de Anvil

**Parámetros**:

- `lastNLogs` (opcional): Número de líneas de log a mostrar

**Ejemplo**:

```
"Verifica el estado de Anvil con anvil_status"
```

---

## Ventajas de usar MCP vs Bash

### ❌ Sin MCP (usando Bash)

```
"Ejecuta forge test en el directorio sc/"
```

→ Claude usa Bash tool: `cd sc && forge test`

### ✅ Con MCP (usando forge_test)

```
"Ejecuta los tests con forge_test"
```

→ Claude usa herramienta dedicada con validación de parámetros

**Beneficios**:

- ✅ Parámetros tipados y validados
- ✅ Mejor manejo de errores
- ✅ Resultados estructurados
- ✅ No requiere cambiar de directorio
- ✅ Gestión automática de procesos (Anvil en background)
- ✅ Más fácil de usar para la IA

---

## Solución de Problemas

### Error EPIPE

Si ves errores `EPIPE` en los logs:

1. **Recompila el proyecto**:

   ```bash
   cd mcp-foundry && npm run build
   ```

2. **Reinicia Claude Code**:

   ```bash
   pkill -9 "Claude" && open -a "Claude"
   pkill -f "inspector" && pkill -f "mcp-foundry" && sleep 2 && echo "Procesos
      limpiados"
   ```

3. **Verifica los logs**:
   ```bash
   tail -f ~/Library/Logs/Claude/mcp-server-foundry.log
   ```

### Servidor no se inicia

1. **Verifica que Node.js está instalado**:

   ```bash
   node --version  # Debe ser v18+
   ```

2. **Verifica que el build existe**:

   ```bash
   ls -la ~/Documents/codecrypto/web3/Ethereum/solidity/proyectos/web3-98_pfm_traza_2025/mcp-foundry/build/index.js
   ```

3. **Compila el proyecto**:
   ```bash
   cd ~/Documents/codecrypto/web3/Ethereum/solidity/proyectos/web3-98_pfm_traza_2025/mcp-foundry
   npm install
   npm run build
   ```

### Herramientas no aparecen

Si las herramientas MCP no aparecen en Claude Code:

1. Verifica que el servidor está configurado correctamente en `claude_desktop_config.json`
2. Reinicia Claude Code completamente
3. Revisa los logs para errores
4. Asegúrate de que no hay conflictos de puerto (especialmente con Anvil)

---

## Ejemplos de Uso Completo

### Flujo de desarrollo típico

```
1. "Inicia Anvil local con anvil_start"
2. "Compila el contrato con forge_build en sc/"
3. "Ejecuta los tests con forge_test y verbosity 2"
4. "Despliega el contrato usando forge_script con el script Deploy.s.sol"
5. "Verifica que el contrato está desplegado con cast_call"
6. "Consulta el balance del admin con cast_balance"
```

### Testing workflow

```
1. "Ejecuta los tests relacionados con transfers usando forge_test con matchTest='Transfer'"
2. "Genera un reporte de cobertura con forge_coverage"
3. "Si la cobertura es baja, ejecuta tests con gas report"
```

### Debugging workflow

```
1. "Verifica el estado de Anvil con anvil_status"
2. "Obtén el número de bloque actual con cast_block_number"
3. "Consulta el estado del contrato con cast_call"
4. "Si hay errores, limpia y recompila con forge_clean y forge_build"
```

---

## Recursos Adicionales

- [Foundry Book](https://book.getfoundry.sh/)
- [MCP Protocol Spec](https://spec.modelcontextprotocol.io/)
- [Claude Code Docs](https://docs.claude.com/claude-code)

---

**Última actualización**: 2025-10-26
**Versión**: 1.0.0
