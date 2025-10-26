# Troubleshooting - Frontend Supply Chain Tracker

## Error: "circuit breaker is open" de MetaMask

### 🔍 Descripción del Error

```
could not coalesce error (error={ "code": -32603, "message": "Execution prevented because the circuit breaker is open" }
```

Este error aparece cuando MetaMask activa su "circuit breaker" (fusible de protección) después de múltiples intentos fallidos de conectarse al RPC endpoint.

### 🎯 Causa Raíz

El circuit breaker de MetaMask se activa cuando:
1. Anvil no está corriendo cuando intentas conectar
2. Muchas peticiones RPC fallan consecutivamente
3. La red configurada en MetaMask tiene la URL incorrecta
4. Hay un problema temporal de conectividad

### ✅ Solución Paso a Paso

#### 1. Verificar que Anvil esté corriendo

```bash
# Verificar si Anvil está corriendo
pgrep -x anvil

# Verificar que esté en el puerto 8545
lsof -i :8545 | grep LISTEN

# Probar el endpoint directamente
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Debería devolver algo como: {"jsonrpc":"2.0","id":1,"result":"0x87"}
```

Si Anvil NO está corriendo, inícialo:

```bash
cd ../sc
anvil

# O usa el script helper
./start-anvil.sh
```

#### 2. Resetear el Circuit Breaker de MetaMask

**Opción A: Reset suave (recomendado)**

1. Abre MetaMask en tu navegador
2. Haz clic en el icono de red (arriba a la izquierda)
3. Cambia a otra red (por ejemplo, "Ethereum Mainnet")
4. Espera 5 segundos
5. Vuelve a cambiar a "Anvil Local" (o tu red localhost)
6. Recarga la página del frontend (F5)

**Opción B: Reset completo de MetaMask**

⚠️ ADVERTENCIA: Esto cerrará tu sesión en MetaMask. Asegúrate de tener tu frase semilla guardada.

1. Abre MetaMask
2. Ve a Configuración → Avanzado
3. Scroll hasta abajo y haz clic en "Reset Account"
4. Confirma la acción
5. Recarga la página del frontend

**Opción C: Reiniciar la extensión de MetaMask**

1. Abre Chrome/Brave y ve a `chrome://extensions/`
2. Busca MetaMask
3. Haz clic en el botón de "reload" (⟳) de la extensión
4. Recarga la página del frontend

#### 3. Verificar Configuración de la Red en MetaMask

Asegúrate de que la red Anvil esté configurada correctamente:

1. Abre MetaMask
2. Haz clic en el selector de red
3. Si no tienes "Anvil Local", agrégala manualmente:
   - Haz clic en "Add network" → "Add a network manually"
   - Configura:
     - **Network Name**: Anvil Local
     - **RPC URL**: `http://localhost:8545`
     - **Chain ID**: `31337`
     - **Currency Symbol**: ETH
   - Guarda

4. Si ya existe, edítala y verifica que la URL sea exactamente `http://localhost:8545` (sin `/` al final)

#### 4. Probar la Conexión desde el Frontend

1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Console"
3. Pega y ejecuta este código:

```javascript
// Test directo del provider de ethers
const provider = new ethers.BrowserProvider(window.ethereum);
const blockNumber = await provider.getBlockNumber();
console.log("Block number:", blockNumber);
```

Si esto funciona, el problema está resuelto.

### 🔄 Prevención

Para evitar que el circuit breaker se active en el futuro:

1. **Siempre inicia Anvil ANTES de abrir el frontend**
   ```bash
   # En una terminal
   cd sc
   anvil

   # En otra terminal
   cd web
   npm run dev
   ```

2. **Usa el script de inicio completo** (si existe):
   ```bash
   ./start-project.sh  # Inicia Anvil + Frontend en orden
   ```

3. **Si vas a apagar Anvil temporalmente**:
   - Primero cierra el frontend
   - Luego detén Anvil
   - Al reiniciar, hazlo en orden inverso: Anvil primero, frontend después

### 📝 Otros Errores Comunes de Conexión

#### Error: "could not detect network"

**Causa**: Chain ID incorrecto en MetaMask

**Solución**: Verifica que el Chain ID sea exactamente `31337`

#### Error: "network changed"

**Causa**: MetaMask cambió de red mientras la app estaba corriendo

**Solución**: Recarga la página (F5) o implementa un listener de cambio de red

#### Error: "user rejected transaction"

**Causa**: Usuario canceló la transacción en MetaMask

**Solución**: Esto es normal, no requiere acción

### 🛠️ Scripts de Diagnóstico

Crea un script de diagnóstico rápido:

```bash
# diagnose-connection.sh
#!/bin/bash

echo "🔍 Diagnóstico de Conexión Anvil + MetaMask"
echo ""

# 1. Check Anvil
echo "1️⃣ Verificando Anvil..."
if pgrep -x anvil > /dev/null; then
    echo "   ✅ Anvil está corriendo (PID: $(pgrep -x anvil))"
else
    echo "   ❌ Anvil NO está corriendo"
    echo "   → Ejecuta: anvil"
    exit 1
fi

# 2. Check port
echo ""
echo "2️⃣ Verificando puerto 8545..."
if lsof -i :8545 | grep LISTEN > /dev/null; then
    echo "   ✅ Puerto 8545 está abierto"
else
    echo "   ❌ Puerto 8545 NO está abierto"
    exit 1
fi

# 3. Test RPC
echo ""
echo "3️⃣ Probando endpoint RPC..."
RESPONSE=$(curl -s -X POST http://localhost:8545 \
    -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}')

if echo "$RESPONSE" | grep -q '"result"'; then
    BLOCK=$(echo "$RESPONSE" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
    BLOCK_DEC=$((16#${BLOCK#0x}))
    echo "   ✅ RPC funciona correctamente"
    echo "   → Bloque actual: $BLOCK_DEC ($BLOCK)"
else
    echo "   ❌ RPC no responde correctamente"
    echo "   → Respuesta: $RESPONSE"
    exit 1
fi

echo ""
echo "✅ Todo está funcionando correctamente"
echo ""
echo "💡 Si aún tienes problemas, resetea MetaMask:"
echo "   1. MetaMask → Configuración → Avanzado → Reset Account"
echo "   2. O cambia de red y vuelve a Anvil Local"
```

Guarda este script y ejecútalo cuando tengas problemas:

```bash
chmod +x diagnose-connection.sh
./diagnose-connection.sh
```

### 📚 Referencias

- [MetaMask Circuit Breaker Docs](https://docs.metamask.io/guide/common-terms.html#circuit-breaker)
- [Anvil Documentation](https://book.getfoundry.sh/reference/anvil/)
- [ethers.js v6 Error Handling](https://docs.ethers.org/v6/api/providers/#errors)

---

**Última actualización**: 2025-10-26
