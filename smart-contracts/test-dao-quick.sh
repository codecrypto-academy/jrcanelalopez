#!/bin/bash

# Test rápido del DAO - Versión simplificada
# Este script avanza el tiempo en lugar de minar bloques individuales

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuración
RPC_URL="http://localhost:8545"

# Leer direcciones desde local.json
TOKEN_ADDRESS=$(jq -r '.DAOToken' ./deployments/local.json)
GOVERNOR_ADDRESS=$(jq -r '.Governor' ./deployments/local.json)
TIMELOCK_ADDRESS=$(jq -r '.TimelockController' ./deployments/local.json)

# Shareholders
SHAREHOLDER1="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
SHAREHOLDER2="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
SHAREHOLDER3="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"

# Private keys
PK1="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
PK2="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
PK3="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   TEST RÁPIDO DAO - CODECRYPTO${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# 0. FINANCIAR EL TIMELOCK
echo -e "${YELLOW}━━━ 0. PREPARACIÓN ━━━${NC}"
echo "Enviando 2 ETH al Timelock para financiar propuestas..."
cast send $TIMELOCK_ADDRESS --value 2ether \
    --private-key $PK1 --rpc-url $RPC_URL > /dev/null 2>&1
TIMELOCK_BALANCE=$(cast balance $TIMELOCK_ADDRESS --rpc-url $RPC_URL)
echo -e "${GREEN}✓${NC} Timelock financiado: $(cast to-unit "$TIMELOCK_BALANCE" ether) ETH"
echo ""

# 1. CREAR PROPUESTA
echo -e "${YELLOW}━━━ 1. CREAR PROPUESTA ━━━${NC}"

TARGETS="[$SHAREHOLDER2]"
VALUES="[1000000000000000000]"
CALLDATAS="[0x]"
DESCRIPTION="Test: Transferir 1 ETH a Shareholder2"

echo "Creando propuesta..."
cast send $GOVERNOR_ADDRESS \
    "propose(address[],uint256[],bytes[],string)" \
    "$TARGETS" "$VALUES" "$CALLDATAS" "$DESCRIPTION" \
    --private-key $PK1 --rpc-url $RPC_URL > /dev/null 2>&1

PROPOSAL_ID=$(cast keccak \
    $(cast abi-encode "f(address[],uint256[],bytes[],bytes32)" "$TARGETS" "$VALUES" "$CALLDATAS" $(cast keccak "$DESCRIPTION")))

echo -e "${GREEN}✓${NC} Propuesta creada: $PROPOSAL_ID"

# Avanzar tiempo para activar la propuesta (votingDelay = 1 bloque)
cast rpc evm_increaseTime 15 --rpc-url $RPC_URL > /dev/null 2>&1
cast rpc anvil_mine 2 --rpc-url $RPC_URL > /dev/null 2>&1

STATE=$(cast call $GOVERNOR_ADDRESS "state(uint256)(uint8)" $PROPOSAL_ID --rpc-url $RPC_URL)
echo "Estado: $STATE (1=Active)"

# 2. VOTAR
echo ""
echo -e "${YELLOW}━━━ 2. VOTACIÓN ━━━${NC}"

echo "Shareholder 1 votando A FAVOR..."
cast send $GOVERNOR_ADDRESS "castVote(uint256,uint8)" $PROPOSAL_ID 1 \
    --private-key $PK1 --rpc-url $RPC_URL > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Voto registrado"

echo "Shareholder 2 votando A FAVOR..."
cast send $GOVERNOR_ADDRESS "castVote(uint256,uint8)" $PROPOSAL_ID 1 \
    --private-key $PK2 --rpc-url $RPC_URL > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Voto registrado"

echo "Shareholder 3 votando EN CONTRA..."
cast send $GOVERNOR_ADDRESS "castVote(uint256,uint8)" $PROPOSAL_ID 0 \
    --private-key $PK3 --rpc-url $RPC_URL > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Voto registrado"

# 3. FINALIZAR VOTACIÓN
echo ""
echo -e "${YELLOW}━━━ 3. FINALIZAR VOTACIÓN ━━━${NC}"

echo "Avanzando tiempo (7 días = 604800 segundos)..."
# votingPeriod = 50400 bloques * 12s = 604800s = 7 días
# Solo avanzamos el tiempo, minamos pocos bloques
cast rpc evm_increaseTime 604800 --rpc-url $RPC_URL > /dev/null 2>&1
cast rpc anvil_mine 10 --rpc-url $RPC_URL > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Tiempo avanzado"

STATE=$(cast call $GOVERNOR_ADDRESS "state(uint256)(uint8)" $PROPOSAL_ID --rpc-url $RPC_URL)
echo "Estado después de votación: $STATE (4=Succeeded)"

if [ "$STATE" != "4" ]; then
    echo -e "${RED}✗ Error: Propuesta no fue aprobada. Estado: $STATE${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Propuesta APROBADA"

# 4. QUEUE
echo ""
echo -e "${YELLOW}━━━ 4. QUEUE EN TIMELOCK ━━━${NC}"

echo "Enviando propuesta al Timelock..."
cast send $GOVERNOR_ADDRESS \
    "queue(address[],uint256[],bytes[],bytes32)" \
    "$TARGETS" "$VALUES" "$CALLDATAS" $(cast keccak "$DESCRIPTION") \
    --private-key $PK1 --rpc-url $RPC_URL > /dev/null 2>&1

STATE=$(cast call $GOVERNOR_ADDRESS "state(uint256)(uint8)" $PROPOSAL_ID --rpc-url $RPC_URL)
echo -e "${GREEN}✓${NC} En cola. Estado: $STATE (5=Queued)"

# 5. EJECUTAR
echo ""
echo -e "${YELLOW}━━━ 5. EJECUTAR PROPUESTA ━━━${NC}"

echo "Esperando delay del Timelock (1 minuto = 60s) + buffer..."
# Avanzar 70 segundos para asegurarnos de pasar el delay
cast rpc evm_increaseTime 70 --rpc-url $RPC_URL > /dev/null 2>&1
cast rpc anvil_mine 1 --rpc-url $RPC_URL > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Delay completado"

echo "Balance Shareholder2 ANTES:"
BALANCE_BEFORE=$(cast balance $SHAREHOLDER2 --rpc-url $RPC_URL)
echo "  $(cast to-unit "$BALANCE_BEFORE" ether) ETH"

echo "Ejecutando propuesta..."
cast send $GOVERNOR_ADDRESS \
    "execute(address[],uint256[],bytes[],bytes32)" \
    "$TARGETS" "$VALUES" "$CALLDATAS" $(cast keccak "$DESCRIPTION") \
    --private-key $PK1 --rpc-url $RPC_URL > /dev/null 2>&1

STATE=$(cast call $GOVERNOR_ADDRESS "state(uint256)(uint8)" $PROPOSAL_ID --rpc-url $RPC_URL)
echo -e "${GREEN}✓${NC} Ejecutada. Estado: $STATE (7=Executed)"

echo ""
echo "Balance Shareholder2 DESPUÉS:"
BALANCE_AFTER=$(cast balance $SHAREHOLDER2 --rpc-url $RPC_URL)
echo "  $(cast to-unit "$BALANCE_AFTER" ether) ETH"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✓ TEST COMPLETO EXITOSO${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
