#!/bin/bash

# Script para deployar SupplyChain en Anvil local
# Asegúrate de tener Anvil corriendo: ./start-anvil.sh

set -e  # Exit on error

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración
RPC_URL="http://localhost:8545"

# Private key del admin (primera cuenta de Anvil)
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  SUPPLY CHAIN TRACKER - DEPLOYMENT${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Verificar que Anvil esté corriendo
echo "Verificando conexión con Anvil..."
if ! cast block-number --rpc-url $RPC_URL > /dev/null 2>&1; then
    echo -e "${RED}Error: No se puede conectar con Anvil en $RPC_URL${NC}"
    echo "Ejecuta primero: ./start-anvil.sh"
    exit 1
fi

BLOCK=$(cast block-number --rpc-url $RPC_URL)
echo -e "${GREEN}✓${NC} Conectado - Bloque actual: $BLOCK"
echo ""

# Crear directorio deployments si no existe
mkdir -p ./deployments

# Compilar contratos
echo "Compilando contratos..."
forge build > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Contratos compilados"
echo ""

# Deployar
echo "Deployando SupplyChain contract..."
echo ""

forge script script/DeployLocal.s.sol:DeployLocal \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --legacy

echo ""
echo -e "${GREEN}✓${NC} Deployment completado"
echo ""

# Leer información del deployment
if [ -f "./deployments/local.json" ]; then
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  DEPLOYMENT INFO${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
    cat ./deployments/local.json
    echo ""
    echo -e "${BLUE}================================================${NC}"
    echo ""

    CONTRACT_ADDRESS=$(jq -r '.SupplyChain' ./deployments/local.json)
    echo -e "${GREEN}Contract deployed at: $CONTRACT_ADDRESS${NC}"
    echo ""
    echo "Para interactuar con el contrato:"
    echo "  ./test-supply-chain.sh"
else
    echo -e "${YELLOW}Warning: No se creó el archivo deployments/local.json${NC}"
fi

echo ""
echo -e "${GREEN}Deployment exitoso! 🎉${NC}"
echo ""
