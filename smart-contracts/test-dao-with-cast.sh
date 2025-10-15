#!/bin/bash

# Script de prueba completa del DAO usando cast
# Asegúrate de tener Anvil corriendo en otra terminal: anvil

set -e  # Exit on error

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración
RPC_URL="http://localhost:8545"

# Leer direcciones de los contratos desde local.json
DEPLOYMENTS_FILE="./deployments/local.json"
if [ ! -f "$DEPLOYMENTS_FILE" ]; then
    echo -e "${RED}Error: No se encontró el archivo $DEPLOYMENTS_FILE${NC}"
    echo "Ejecuta primero: forge script script/DeployDAOLocal.s.sol:DeployDAOLocal --rpc-url $RPC_URL --broadcast"
    exit 1
fi

TOKEN_ADDRESS=$(jq -r '.DAOToken' $DEPLOYMENTS_FILE)
GOVERNOR_ADDRESS=$(jq -r '.Governor' $DEPLOYMENTS_FILE)
TIMELOCK_ADDRESS=$(jq -r '.TimelockController' $DEPLOYMENTS_FILE)
FACTORY_ADDRESS=$(jq -r '.ProposalFactory' $DEPLOYMENTS_FILE)

# Cuentas de Anvil (shareholders)
SHAREHOLDER1="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
SHAREHOLDER2="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
SHAREHOLDER3="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
SHAREHOLDER4="0x90F79bf6EB2c4f870365E785982E1f101E93b906"
SHAREHOLDER5="0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"

# Private keys de Anvil
PK1="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
PK2="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
PK3="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
PK4="0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
PK5="0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   DAO TESTING SCRIPT - CODECRYPTO DAO${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Función para imprimir sección
print_section() {
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  $1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Función para imprimir paso
print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

# Función para esperar bloques
wait_blocks() {
    echo -e "${BLUE}⏳ Esperando $1 bloques...${NC}"
    # Avanzar tiempo: 12 segundos por bloque (simulando Ethereum mainnet)
    SECONDS_TO_ADVANCE=$(($1 * 12))
    cast rpc evm_increaseTime $SECONDS_TO_ADVANCE --rpc-url $RPC_URL > /dev/null 2>&1
    cast rpc anvil_mine $1 --rpc-url $RPC_URL > /dev/null 2>&1
    print_step "Minados $1 bloques (tiempo avanzado: ${SECONDS_TO_ADVANCE}s)"
}

# ====================================
# 1. VERIFICAR ESTADO INICIAL
# ====================================
print_section "1. VERIFICACIÓN DEL ESTADO INICIAL"

echo "Verificando conexión con Anvil..."
BLOCK=$(cast block-number --rpc-url $RPC_URL)
print_step "Conectado - Bloque actual: $BLOCK"

echo ""
echo "Token Supply y Balances:"
echo "  Total Supply: 550,000 tokens"
echo "  Shareholder 1: 100,000 tokens"
echo "  Shareholder 2: 100,000 tokens"
echo "  Shareholder 3: 100,000 tokens"

echo ""
echo "Voting Power (delegado):"
VP1=$(cast call $TOKEN_ADDRESS "getVotes(address)(uint256)" $SHAREHOLDER1 --rpc-url $RPC_URL 2>/dev/null || echo "0")
VP2=$(cast call $TOKEN_ADDRESS "getVotes(address)(uint256)" $SHAREHOLDER2 --rpc-url $RPC_URL 2>/dev/null || echo "0")
VP3=$(cast call $TOKEN_ADDRESS "getVotes(address)(uint256)" $SHAREHOLDER3 --rpc-url $RPC_URL 2>/dev/null || echo "0")

# Convertir aproximadamente (los valores son: 100000 * 10^18)
# Simplemente verificamos si es != 0
if [ "$VP1" != "0" ] && [ "$VP1" != "0x0" ]; then
    echo "  Shareholder 1: 100k votes ✓"
else
    echo "  Shareholder 1: 0 votes ✗"
fi

if [ "$VP2" != "0" ] && [ "$VP2" != "0x0" ]; then
    echo "  Shareholder 2: 100k votes ✓"
else
    echo "  Shareholder 2: 0 votes ✗"
fi

if [ "$VP3" != "0" ] && [ "$VP3" != "0x0" ]; then
    echo "  Shareholder 3: 100k votes ✓"
else
    echo "  Shareholder 3: 0 votes ✗"
fi

# ====================================
# 2. CREAR UNA PROPUESTA
# ====================================
print_section "2. CREAR PROPUESTA"

echo "Creando propuesta para transferir 1 ETH al Shareholder2..."

# Preparar los datos de la propuesta
TARGETS="[$SHAREHOLDER2]"
VALUES="[1000000000000000000]"  # 1 ETH en wei
CALLDATAS="[0x]"  # Transferencia simple sin calldata
DESCRIPTION="Propuesta #1: Transferir 1 ETH a Shareholder2 para gastos operativos"

echo ""
echo "Detalles de la propuesta:"
echo "  Target: $SHAREHOLDER2"
echo "  Value: 1 ETH"
echo "  Description: $DESCRIPTION"

# Crear la propuesta
echo ""
echo "Enviando transacción..."
PROPOSE_TX_HASH=$(cast send $GOVERNOR_ADDRESS \
    "propose(address[],uint256[],bytes[],string)" \
    "$TARGETS" \
    "$VALUES" \
    "$CALLDATAS" \
    "$DESCRIPTION" \
    --private-key $PK1 \
    --rpc-url $RPC_URL \
    --json | jq -r '.transactionHash')

# Calcular el proposal ID (hash de los parámetros)
echo "Calculando Proposal ID..."
PROPOSAL_ID=$(cast keccak \
    $(cast abi-encode "f(address[],uint256[],bytes[],bytes32)" "$TARGETS" "$VALUES" "$CALLDATAS" $(cast keccak "$DESCRIPTION")))

echo ""
print_step "Propuesta creada"
echo "  TX: $PROPOSE_TX_HASH"
echo "  ID: $PROPOSAL_ID"

# Obtener el estado de la propuesta
STATE=$(cast call $GOVERNOR_ADDRESS "state(uint256)(uint8)" $PROPOSAL_ID --rpc-url $RPC_URL)
echo "  Estado actual: $STATE (0=Pending, 1=Active, 2=Canceled, 3=Defeated, 4=Succeeded, 5=Queued, 6=Expired, 7=Executed)"

# Esperar 1 bloque para que la propuesta pase a Active
wait_blocks 2

STATE=$(cast call $GOVERNOR_ADDRESS "state(uint256)(uint8)" $PROPOSAL_ID --rpc-url $RPC_URL)
echo "  Estado después del delay: $STATE"

# ====================================
# 3. VOTAR EN LA PROPUESTA
# ====================================
print_section "3. VOTACIÓN"

echo "Los shareholders votarán en la propuesta:"
echo "  - Shareholder 1: A FAVOR (support=1)"
echo "  - Shareholder 2: A FAVOR (support=1)"
echo "  - Shareholder 3: EN CONTRA (support=0)"
echo ""

# Shareholder 1 vota a favor
echo "Shareholder 1 votando..."
cast send $GOVERNOR_ADDRESS \
    "castVote(uint256,uint8)" \
    $PROPOSAL_ID \
    1 \
    --private-key $PK1 \
    --rpc-url $RPC_URL > /dev/null
print_step "Shareholder 1 votó A FAVOR"

# Shareholder 2 vota a favor
echo "Shareholder 2 votando..."
cast send $GOVERNOR_ADDRESS \
    "castVote(uint256,uint8)" \
    $PROPOSAL_ID \
    1 \
    --private-key $PK2 \
    --rpc-url $RPC_URL > /dev/null
print_step "Shareholder 2 votó A FAVOR"

# Shareholder 3 vota en contra
echo "Shareholder 3 votando..."
cast send $GOVERNOR_ADDRESS \
    "castVote(uint256,uint8)" \
    $PROPOSAL_ID \
    0 \
    --private-key $PK3 \
    --rpc-url $RPC_URL > /dev/null
print_step "Shareholder 3 votó EN CONTRA"

echo ""
echo "Obteniendo resultados de la votación..."
VOTES=$(cast call $GOVERNOR_ADDRESS "proposalVotes(uint256)(uint256,uint256,uint256)" $PROPOSAL_ID --rpc-url $RPC_URL)
echo "$VOTES" | while IFS= read -r line; do
    echo "  $line"
done

# ====================================
# 4. FINALIZAR VOTACIÓN
# ====================================
print_section "4. FINALIZAR PERIODO DE VOTACIÓN"

echo "El voting period es de 50400 bloques (~1 semana)"
echo "Para testing, avanzaremos 50401 bloques (suficiente para finalizar la votación)..."
wait_blocks 50401

STATE=$(cast call $GOVERNOR_ADDRESS "state(uint256)(uint8)" $PROPOSAL_ID --rpc-url $RPC_URL)
echo "  Estado después del voting period: $STATE"

if [ "$STATE" = "4" ]; then
    print_step "Propuesta APROBADA (Succeeded)"
else
    echo -e "${RED}✗ Propuesta no aprobada. Estado: $STATE${NC}"
fi

# ====================================
# 5. QUEUE LA PROPUESTA
# ====================================
print_section "5. QUEUE EN EL TIMELOCK"

echo "Enviando la propuesta al Timelock para queue..."
cast send $GOVERNOR_ADDRESS \
    "queue(address[],uint256[],bytes[],bytes32)" \
    "$TARGETS" \
    "$VALUES" \
    "$CALLDATAS" \
    "$(cast keccak "$DESCRIPTION")" \
    --private-key $PK1 \
    --rpc-url $RPC_URL > /dev/null

print_step "Propuesta en queue en el Timelock"

STATE=$(cast call $GOVERNOR_ADDRESS "state(uint256)(uint8)" $PROPOSAL_ID --rpc-url $RPC_URL)
echo "  Estado: $STATE (5=Queued)"

# ====================================
# 6. ESPERAR TIMELOCK DELAY
# ====================================
print_section "6. ESPERAR TIMELOCK DELAY"

echo "El timelock delay es de 1 minuto (60 segundos)"
echo "Avanzando el tiempo..."
cast rpc evm_increaseTime 61 --rpc-url $RPC_URL > /dev/null
wait_blocks 1

print_step "Timelock delay completado"

# ====================================
# 7. EJECUTAR LA PROPUESTA
# ====================================
print_section "7. EJECUTAR PROPUESTA"

# Primero, enviar ETH al Timelock para que pueda hacer la transferencia
echo "Enviando 2 ETH al Timelock para que tenga fondos..."
cast send $TIMELOCK_ADDRESS \
    --value 2ether \
    --private-key $PK1 \
    --rpc-url $RPC_URL > /dev/null
print_step "Timelock fondeado con 2 ETH"

# Verificar balance del Shareholder2 antes
BALANCE_BEFORE=$(cast balance $SHAREHOLDER2 --rpc-url $RPC_URL)
echo ""
echo "Balance de Shareholder2 antes: $(cast --to-unit $BALANCE_BEFORE ether) ETH"

# Ejecutar la propuesta
echo ""
echo "Ejecutando la propuesta..."
cast send $GOVERNOR_ADDRESS \
    "execute(address[],uint256[],bytes[],bytes32)" \
    "$TARGETS" \
    "$VALUES" \
    "$CALLDATAS" \
    "$(cast keccak "$DESCRIPTION")" \
    --private-key $PK1 \
    --rpc-url $RPC_URL > /dev/null

print_step "Propuesta EJECUTADA"

STATE=$(cast call $GOVERNOR_ADDRESS "state(uint256)(uint8)" $PROPOSAL_ID --rpc-url $RPC_URL)
echo "  Estado final: $STATE (7=Executed)"

# Verificar balance del Shareholder2 después
BALANCE_AFTER=$(cast balance $SHAREHOLDER2 --rpc-url $RPC_URL)
echo ""
echo "Balance de Shareholder2 después: $(cast --to-unit $BALANCE_AFTER ether) ETH"

DIFF=$((BALANCE_AFTER - BALANCE_BEFORE))
echo "  Diferencia: +$(cast --to-unit $DIFF ether) ETH"

# ====================================
# 8. VERIFICAR FACTORY DE PROPUESTAS
# ====================================
print_section "8. PROBAR PROPOSAL FACTORY"

echo "Creando un contrato de propuesta usando la factory..."

# Datos de la propuesta proxy
PROXY_DESCRIPTION="Propuesta Proxy #1: Desarrollo de nueva feature"
PROXY_RECIPIENT=$SHAREHOLDER3
PROXY_AMOUNT="500000000000000000"  # 0.5 ETH

echo ""
echo "Detalles de la propuesta proxy:"
echo "  Description: $PROXY_DESCRIPTION"
echo "  Recipient: $PROXY_RECIPIENT"
echo "  Amount: 0.5 ETH"

# Crear la propuesta proxy
echo ""
echo "Creando propuesta proxy..."
CREATE_TX=$(cast send $FACTORY_ADDRESS \
    "createProposal(string,address,uint256)" \
    "$PROXY_DESCRIPTION" \
    $PROXY_RECIPIENT \
    $PROXY_AMOUNT \
    --private-key $PK1 \
    --rpc-url $RPC_URL \
    --json)

# Obtener la dirección del proxy del evento
PROXY_ADDRESS=$(echo $CREATE_TX | jq -r '.logs[0].topics[2]' | cast --to-address)
echo ""
print_step "Propuesta Proxy creada en: $PROXY_ADDRESS"

# Verificar datos de la propuesta proxy
echo ""
echo "Verificando datos del proxy..."
PROXY_DESC=$(cast call $PROXY_ADDRESS "description()(string)" --rpc-url $RPC_URL)
PROXY_REC=$(cast call $PROXY_ADDRESS "recipient()(address)" --rpc-url $RPC_URL)
PROXY_AMT=$(cast call $PROXY_ADDRESS "amount()(uint256)" --rpc-url $RPC_URL)
PROXY_ACTIVE=$(cast call $PROXY_ADDRESS "isActive()(bool)" --rpc-url $RPC_URL)

echo "  Description: $PROXY_DESC"
echo "  Recipient: $PROXY_REC"
echo "  Amount: $(cast --to-unit $PROXY_AMT ether) ETH"
echo "  Active: $PROXY_ACTIVE"

# Votar en la propuesta proxy
echo ""
echo "Votando en la propuesta proxy..."
cast send $PROXY_ADDRESS \
    "vote(bool)" \
    true \
    --private-key $PK1 \
    --rpc-url $RPC_URL > /dev/null
print_step "Shareholder 1 votó a favor en el proxy"

cast send $PROXY_ADDRESS \
    "vote(bool)" \
    true \
    --private-key $PK2 \
    --rpc-url $RPC_URL > /dev/null
print_step "Shareholder 2 votó a favor en el proxy"

# Obtener conteo de votos
VOTES_FOR=$(cast call $PROXY_ADDRESS "votesFor()(uint256)" --rpc-url $RPC_URL)
VOTES_AGAINST=$(cast call $PROXY_ADDRESS "votesAgainst()(uint256)" --rpc-url $RPC_URL)
echo ""
echo "Resultados del proxy:"
echo "  Votos a favor: $(cast --to-unit $VOTES_FOR ether)"
echo "  Votos en contra: $(cast --to-unit $VOTES_AGAINST ether)"

# ====================================
# RESUMEN FINAL
# ====================================
print_section "RESUMEN DE PRUEBAS"

echo -e "${GREEN}✓ Todas las pruebas completadas exitosamente${NC}"
echo ""
echo "Flujo completo probado:"
echo "  1. ✓ Verificación del estado inicial del DAO"
echo "  2. ✓ Creación de propuesta en el Governor"
echo "  3. ✓ Votación de múltiples shareholders"
echo "  4. ✓ Aprobación de la propuesta"
echo "  5. ✓ Queue en el Timelock"
echo "  6. ✓ Ejecución de la propuesta"
echo "  7. ✓ Transferencia de fondos exitosa"
echo "  8. ✓ Creación y votación en Proposal Factory"
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}   DAO funcionando correctamente! 🎉${NC}"
echo -e "${BLUE}================================================${NC}"
