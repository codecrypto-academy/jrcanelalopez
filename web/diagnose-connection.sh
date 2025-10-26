#!/bin/bash

# diagnose-connection.sh
# Script para diagnosticar problemas de conexión entre Frontend, MetaMask y Anvil

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔍 Diagnóstico de Conexión Anvil + MetaMask${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# 1. Check Anvil
echo -e "${YELLOW}1️⃣ Verificando Anvil...${NC}"
if pgrep -x anvil > /dev/null; then
    PID=$(pgrep -x anvil)
    echo -e "   ${GREEN}✅ Anvil está corriendo${NC} (PID: $PID)"
else
    echo -e "   ${RED}❌ Anvil NO está corriendo${NC}"
    echo -e "   ${YELLOW}→ Solución: Ejecuta 'anvil' en otra terminal${NC}"
    echo ""
    exit 1
fi

# 2. Check port
echo ""
echo -e "${YELLOW}2️⃣ Verificando puerto 8545...${NC}"
if lsof -i :8545 | grep LISTEN > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Puerto 8545 está abierto${NC}"
else
    echo -e "   ${RED}❌ Puerto 8545 NO está abierto${NC}"
    echo -e "   ${YELLOW}→ Anvil debería estar escuchando en este puerto${NC}"
    echo ""
    exit 1
fi

# 3. Test RPC
echo ""
echo -e "${YELLOW}3️⃣ Probando endpoint RPC...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:8545 \
    -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' 2>/dev/null)

if echo "$RESPONSE" | grep -q '"result"'; then
    BLOCK=$(echo "$RESPONSE" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
    BLOCK_DEC=$((16#${BLOCK#0x}))
    echo -e "   ${GREEN}✅ RPC funciona correctamente${NC}"
    echo -e "   ${BLUE}→ Bloque actual: $BLOCK_DEC ($BLOCK)${NC}"
else
    echo -e "   ${RED}❌ RPC no responde correctamente${NC}"
    echo -e "   ${YELLOW}→ Respuesta: $RESPONSE${NC}"
    echo ""
    exit 1
fi

# 4. Check chain ID
echo ""
echo -e "${YELLOW}4️⃣ Verificando Chain ID...${NC}"
CHAIN_RESPONSE=$(curl -s -X POST http://localhost:8545 \
    -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null)

if echo "$CHAIN_RESPONSE" | grep -q '"result"'; then
    CHAIN_ID=$(echo "$CHAIN_RESPONSE" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
    CHAIN_DEC=$((16#${CHAIN_ID#0x}))

    if [ "$CHAIN_DEC" -eq 31337 ]; then
        echo -e "   ${GREEN}✅ Chain ID correcto: $CHAIN_DEC ($CHAIN_ID)${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Chain ID inesperado: $CHAIN_DEC ($CHAIN_ID)${NC}"
        echo -e "   ${YELLOW}→ Se esperaba: 31337${NC}"
    fi
else
    echo -e "   ${RED}❌ No se pudo obtener Chain ID${NC}"
fi

# 5. Check accounts
echo ""
echo -e "${YELLOW}5️⃣ Verificando cuentas disponibles...${NC}"
ACCOUNTS_RESPONSE=$(curl -s -X POST http://localhost:8545 \
    -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' 2>/dev/null)

if echo "$ACCOUNTS_RESPONSE" | grep -q '"result"'; then
    ACCOUNT_COUNT=$(echo "$ACCOUNTS_RESPONSE" | grep -o '"0x[^"]*"' | wc -l)
    echo -e "   ${GREEN}✅ Cuentas disponibles: $ACCOUNT_COUNT${NC}"

    # Mostrar primera cuenta (admin)
    FIRST_ACCOUNT=$(echo "$ACCOUNTS_RESPONSE" | grep -o '"0x[^"]*"' | head -1 | tr -d '"')
    echo -e "   ${BLUE}→ Cuenta Admin: $FIRST_ACCOUNT${NC}"
else
    echo -e "   ${RED}❌ No se pudieron obtener las cuentas${NC}"
fi

# Final summary
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Todos los checks pasaron correctamente${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}💡 Si aún tienes el error 'circuit breaker is open':${NC}"
echo ""
echo "   ${BLUE}Opción A: Reset suave${NC}"
echo "   1. Abre MetaMask"
echo "   2. Cambia a otra red (Ethereum Mainnet)"
echo "   3. Espera 5 segundos"
echo "   4. Vuelve a 'Anvil Local'"
echo "   5. Recarga la página (F5)"
echo ""
echo "   ${BLUE}Opción B: Reset completo${NC}"
echo "   1. MetaMask → Configuración → Avanzado"
echo "   2. Scroll abajo → 'Reset Account'"
echo "   3. Confirma"
echo "   4. Recarga la página (F5)"
echo ""
echo "   ${BLUE}Opción C: Reiniciar extensión${NC}"
echo "   1. Ve a chrome://extensions/"
echo "   2. Busca MetaMask"
echo "   3. Haz clic en el botón de reload (⟳)"
echo "   4. Recarga la página (F5)"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

exit 0
