#!/bin/bash

# Script de prueba rápida - versión simplificada
# Prueba las funciones básicas del Supply Chain

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

RPC_URL="http://localhost:8545"
CONTRACT_ADDRESS=$(jq -r '.SupplyChain' ./deployments/local.json 2>/dev/null || echo "")

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "Error: Deploy the contract first with ./deploy-local.sh"
    exit 1
fi

# Cuentas
ADMIN="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
PRODUCER="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

PK_ADMIN="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
PK_PRODUCER="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"

echo -e "${BLUE}Quick Test - Supply Chain Tracker${NC}"
echo ""

# 1. Register producer
echo "1. Registering Producer..."
cast send $CONTRACT_ADDRESS \
    "requestUserRole(string)" "Producer" \
    --private-key $PK_PRODUCER \
    --rpc-url $RPC_URL > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Producer registered"

# 2. Approve producer
echo "2. Approving Producer..."
cast send $CONTRACT_ADDRESS \
    "changeStatusUser(address,uint8)" $PRODUCER 1 \
    --private-key $PK_ADMIN \
    --rpc-url $RPC_URL > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Producer approved"

# 3. Create token
echo "3. Creating token..."
cast send $CONTRACT_ADDRESS \
    "createToken(string,uint256,string,uint256)" \
    "Raw Material" 1000 "{}" 0 \
    --private-key $PK_PRODUCER \
    --rpc-url $RPC_URL > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Token created"

# 4. Check balance
BALANCE=$(cast call $CONTRACT_ADDRESS \
    "getTokenBalance(uint256,address)(uint256)" \
    1 $PRODUCER \
    --rpc-url $RPC_URL)
echo "4. Producer balance: $BALANCE units"

echo ""
echo -e "${GREEN}Quick test completed successfully! ✓${NC}"
