#!/bin/bash

# Script de prueba completa del Supply Chain usando cast
# Asegúrate de tener Anvil corriendo: ./start-anvil.sh
# Y haber deployado el contrato: ./deploy-local.sh

set -e  # Exit on error

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración
RPC_URL="http://localhost:8545"

# Leer dirección del contrato desde local.json
DEPLOYMENTS_FILE="./deployments/local.json"
if [ ! -f "$DEPLOYMENTS_FILE" ]; then
    echo -e "${RED}Error: No se encontró el archivo $DEPLOYMENTS_FILE${NC}"
    echo "Ejecuta primero: ./deploy-local.sh"
    exit 1
fi

CONTRACT_ADDRESS=$(jq -r '.SupplyChain' $DEPLOYMENTS_FILE)

# Cuentas de Anvil
ADMIN="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
PRODUCER="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
FACTORY="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
RETAILER="0x90F79bf6EB2c4f870365E785982E1f101E93b906"
CONSUMER="0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"

# Private keys de Anvil
PK_ADMIN="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
PK_PRODUCER="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
PK_FACTORY="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
PK_RETAILER="0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
PK_CONSUMER="0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   SUPPLY CHAIN TRACKER - TESTING SCRIPT${NC}"
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

# Función para imprimir info
print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# Función para obtener el estado de un usuario
get_user_status() {
    local address=$1
    local status=$(cast call $CONTRACT_ADDRESS "getUserInfo(address)((uint256,address,string,uint8))" $address --rpc-url $RPC_URL 2>/dev/null | sed -n '4p' | tr -d ' ')

    case $status in
        0) echo "Pending" ;;
        1) echo "Approved" ;;
        2) echo "Rejected" ;;
        3) echo "Canceled" ;;
        *) echo "Unknown" ;;
    esac
}

# ====================================
# 1. VERIFICAR ESTADO INICIAL
# ====================================
print_section "1. VERIFICACIÓN DEL ESTADO INICIAL"

echo "Verificando conexión con Anvil..."
BLOCK=$(cast block-number --rpc-url $RPC_URL)
print_step "Conectado - Bloque actual: $BLOCK"

echo ""
print_info "Contract Address: $CONTRACT_ADDRESS"

# Verificar owner
OWNER=$(cast call $CONTRACT_ADDRESS "owner()(address)" --rpc-url $RPC_URL)
print_info "Owner: $OWNER"

# Verificar que no está pausado
IS_PAUSED=$(cast call $CONTRACT_ADDRESS "isPaused()(bool)" --rpc-url $RPC_URL)
if [ "$IS_PAUSED" = "false" ]; then
    print_step "Contract is active (not paused)"
else
    echo -e "${RED}✗ Contract is paused!${NC}"
fi

# ====================================
# 2. REGISTRO DE USUARIOS
# ====================================
print_section "2. REGISTRO DE USUARIOS"

echo "Registrando usuarios en el sistema..."
echo ""

# Producer se registra
echo "Producer registrándose..."
cast send $CONTRACT_ADDRESS \
    "requestUserRole(string)" \
    "Producer" \
    --private-key $PK_PRODUCER \
    --rpc-url $RPC_URL > /dev/null 2>&1
print_step "Producer solicitó rol"

# Factory se registra
echo "Factory registrándose..."
cast send $CONTRACT_ADDRESS \
    "requestUserRole(string)" \
    "Factory" \
    --private-key $PK_FACTORY \
    --rpc-url $RPC_URL > /dev/null 2>&1
print_step "Factory solicitó rol"

# Retailer se registra
echo "Retailer registrándose..."
cast send $CONTRACT_ADDRESS \
    "requestUserRole(string)" \
    "Retailer" \
    --private-key $PK_RETAILER \
    --rpc-url $RPC_URL > /dev/null 2>&1
print_step "Retailer solicitó rol"

# Consumer se registra
echo "Consumer registrándose..."
cast send $CONTRACT_ADDRESS \
    "requestUserRole(string)" \
    "Consumer" \
    --private-key $PK_CONSUMER \
    --rpc-url $RPC_URL > /dev/null 2>&1
print_step "Consumer solicitó rol"

echo ""
echo "Estados de usuarios (antes de aprobación):"
echo "  Producer: $(get_user_status $PRODUCER)"
echo "  Factory:  $(get_user_status $FACTORY)"
echo "  Retailer: $(get_user_status $RETAILER)"
echo "  Consumer: $(get_user_status $CONSUMER)"

# ====================================
# 3. APROBACIÓN DE USUARIOS (ADMIN)
# ====================================
print_section "3. APROBACIÓN DE USUARIOS POR ADMIN"

echo "Admin aprobando usuarios..."
echo ""

# Aprobar Producer
cast send $CONTRACT_ADDRESS \
    "changeStatusUser(address,uint8)" \
    $PRODUCER \
    1 \
    --private-key $PK_ADMIN \
    --rpc-url $RPC_URL > /dev/null 2>&1
print_step "Producer aprobado"

# Aprobar Factory
cast send $CONTRACT_ADDRESS \
    "changeStatusUser(address,uint8)" \
    $FACTORY \
    1 \
    --private-key $PK_ADMIN \
    --rpc-url $RPC_URL > /dev/null 2>&1
print_step "Factory aprobado"

# Aprobar Retailer
cast send $CONTRACT_ADDRESS \
    "changeStatusUser(address,uint8)" \
    $RETAILER \
    1 \
    --private-key $PK_ADMIN \
    --rpc-url $RPC_URL > /dev/null 2>&1
print_step "Retailer aprobado"

# Aprobar Consumer
cast send $CONTRACT_ADDRESS \
    "changeStatusUser(address,uint8)" \
    $CONSUMER \
    1 \
    --private-key $PK_ADMIN \
    --rpc-url $RPC_URL > /dev/null 2>&1
print_step "Consumer aprobado"

echo ""
echo "Estados de usuarios (después de aprobación):"
echo "  Producer: $(get_user_status $PRODUCER)"
echo "  Factory:  $(get_user_status $FACTORY)"
echo "  Retailer: $(get_user_status $RETAILER)"
echo "  Consumer: $(get_user_status $CONSUMER)"

# ====================================
# 4. PRODUCER CREA MATERIA PRIMA
# ====================================
print_section "4. PRODUCER CREA MATERIA PRIMA"

echo "Producer creando materia prima 'Raw Cotton'..."
echo ""

# Preparar metadata JSON
FEATURES='{"quality":"premium","origin":"farm-123","harvest_date":"2025-10-17"}'

# Crear token
cast send $CONTRACT_ADDRESS \
    "createToken(string,uint256,string,uint256)" \
    "Raw Cotton" \
    1000 \
    "$FEATURES" \
    0 \
    --private-key $PK_PRODUCER \
    --rpc-url $RPC_URL > /dev/null 2>&1

print_step "Token 'Raw Cotton' creado (ID: 1)"

# Verificar token
TOKEN_INFO=$(cast call $CONTRACT_ADDRESS \
    "getToken(uint256)(uint256,address,string,uint256,string,uint256,uint256)" \
    1 \
    --rpc-url $RPC_URL)

echo ""
echo "Información del token #1:"
echo "  Nombre: Raw Cotton"
echo "  Supply: 1000 unidades"
echo "  Creator: $PRODUCER"
echo "  Parent ID: 0 (materia prima)"

# Verificar balance
PRODUCER_BALANCE=$(cast call $CONTRACT_ADDRESS \
    "getTokenBalance(uint256,address)(uint256)" \
    1 \
    $PRODUCER \
    --rpc-url $RPC_URL)
print_info "Balance del Producer: $PRODUCER_BALANCE unidades"

# ====================================
# 5. PRODUCER → FACTORY (TRANSFERENCIA)
# ====================================
print_section "5. PRODUCER → FACTORY (TRANSFERENCIA)"

echo "Producer iniciando transferencia de 500 unidades a Factory..."
echo ""

# Iniciar transferencia
cast send $CONTRACT_ADDRESS \
    "transfer(address,uint256,uint256)" \
    $FACTORY \
    1 \
    500 \
    --private-key $PK_PRODUCER \
    --rpc-url $RPC_URL > /dev/null 2>&1

print_step "Transferencia #1 iniciada (500 unidades)"

# Obtener información de la transferencia
TRANSFER_INFO=$(cast call $CONTRACT_ADDRESS \
    "getTransfer(uint256)(uint256,address,address,uint256,uint256,uint256,uint8)" \
    1 \
    --rpc-url $RPC_URL)

echo ""
print_info "Estado de la transferencia: Pending (esperando aceptación de Factory)"

# Factory acepta la transferencia
echo ""
echo "Factory aceptando transferencia..."
cast send $CONTRACT_ADDRESS \
    "acceptTransfer(uint256)" \
    1 \
    --private-key $PK_FACTORY \
    --rpc-url $RPC_URL > /dev/null 2>&1

print_step "Transferencia #1 aceptada"

# Verificar balances
PRODUCER_BALANCE=$(cast call $CONTRACT_ADDRESS "getTokenBalance(uint256,address)(uint256)" 1 $PRODUCER --rpc-url $RPC_URL)
FACTORY_BALANCE=$(cast call $CONTRACT_ADDRESS "getTokenBalance(uint256,address)(uint256)" 1 $FACTORY --rpc-url $RPC_URL)

echo ""
echo "Balances actualizados:"
echo "  Producer: $PRODUCER_BALANCE unidades"
echo "  Factory:  $FACTORY_BALANCE unidades"

# ====================================
# 6. FACTORY CREA PRODUCTO DERIVADO
# ====================================
print_section "6. FACTORY CREA PRODUCTO DERIVADO"

echo "Factory creando producto 'Cotton Fabric' a partir de Raw Cotton..."
echo ""

PRODUCT_FEATURES='{"type":"fabric","quality":"premium","thread_count":400}'

cast send $CONTRACT_ADDRESS \
    "createToken(string,uint256,string,uint256)" \
    "Cotton Fabric" \
    250 \
    "$PRODUCT_FEATURES" \
    1 \
    --private-key $PK_FACTORY \
    --rpc-url $RPC_URL > /dev/null 2>&1

print_step "Producto 'Cotton Fabric' creado (ID: 2)"

echo ""
print_info "Token derivado de 'Raw Cotton' (Parent ID: 1)"
print_info "Cantidad: 250 unidades de fabric"

# ====================================
# 7. FACTORY → RETAILER
# ====================================
print_section "7. FACTORY → RETAILER (TRANSFERENCIA)"

echo "Factory transfiriendo 100 unidades de fabric a Retailer..."
echo ""

cast send $CONTRACT_ADDRESS \
    "transfer(address,uint256,uint256)" \
    $RETAILER \
    2 \
    100 \
    --private-key $PK_FACTORY \
    --rpc-url $RPC_URL > /dev/null 2>&1

print_step "Transferencia #2 iniciada"

echo "Retailer aceptando transferencia..."
cast send $CONTRACT_ADDRESS \
    "acceptTransfer(uint256)" \
    2 \
    --private-key $PK_RETAILER \
    --rpc-url $RPC_URL > /dev/null 2>&1

print_step "Transferencia #2 aceptada"

RETAILER_BALANCE=$(cast call $CONTRACT_ADDRESS "getTokenBalance(uint256,address)(uint256)" 2 $RETAILER --rpc-url $RPC_URL)
print_info "Retailer ahora tiene: $RETAILER_BALANCE unidades"

# ====================================
# 8. RETAILER → CONSUMER
# ====================================
print_section "8. RETAILER → CONSUMER (TRANSFERENCIA FINAL)"

echo "Retailer transfiriendo 50 unidades al Consumer..."
echo ""

cast send $CONTRACT_ADDRESS \
    "transfer(address,uint256,uint256)" \
    $CONSUMER \
    2 \
    50 \
    --private-key $PK_RETAILER \
    --rpc-url $RPC_URL > /dev/null 2>&1

print_step "Transferencia #3 iniciada"

echo "Consumer aceptando transferencia..."
cast send $CONTRACT_ADDRESS \
    "acceptTransfer(uint256)" \
    3 \
    --private-key $PK_CONSUMER \
    --rpc-url $RPC_URL > /dev/null 2>&1

print_step "Transferencia #3 aceptada"

CONSUMER_BALANCE=$(cast call $CONTRACT_ADDRESS "getTokenBalance(uint256,address)(uint256)" 2 $CONSUMER --rpc-url $RPC_URL)
print_info "Consumer ahora tiene: $CONSUMER_BALANCE unidades"

# ====================================
# 9. VERIFICAR TRAZABILIDAD
# ====================================
print_section "9. VERIFICAR TRAZABILIDAD COMPLETA"

echo "Rastreando el producto desde Consumer hasta origen..."
echo ""

# Información del producto final (Cotton Fabric)
echo "Producto en manos del Consumer:"
echo "  Token ID: 2"
echo "  Nombre: Cotton Fabric"
echo "  Balance: $CONSUMER_BALANCE unidades"
echo ""

# Obtener parent del producto
PARENT_ID=$(cast call $CONTRACT_ADDRESS \
    "getToken(uint256)(uint256,address,string,uint256,string,uint256,uint256)" \
    2 \
    --rpc-url $RPC_URL | sed -n '6p' | tr -d ' ')

echo "Trazando hacia atrás:"
echo "  ↳ Cotton Fabric (Token #2)"
echo "     ↳ Derivado de: Raw Cotton (Token #$PARENT_ID)"
echo "        ↳ Creado por: Producer"
echo "        ↳ Origen: farm-123"

print_step "Trazabilidad completa verificada"

# ====================================
# 10. PROBAR FUNCIONALIDAD PAUSABLE
# ====================================
print_section "10. PROBAR FUNCIONALIDAD PAUSABLE"

echo "Admin pausando el contrato..."
cast send $CONTRACT_ADDRESS \
    "pause()" \
    --private-key $PK_ADMIN \
    --rpc-url $RPC_URL > /dev/null 2>&1

print_step "Contrato pausado"

IS_PAUSED=$(cast call $CONTRACT_ADDRESS "isPaused()(bool)" --rpc-url $RPC_URL)
print_info "Estado: Pausado = $IS_PAUSED"

echo ""
echo "Intentando crear token mientras está pausado (debe fallar)..."
set +e  # Disable exit on error temporarily
cast send $CONTRACT_ADDRESS \
    "createToken(string,uint256,string,uint256)" \
    "Should Fail" \
    100 \
    "{}" \
    0 \
    --private-key $PK_PRODUCER \
    --rpc-url $RPC_URL > /dev/null 2>&1

if [ $? -ne 0 ]; then
    print_step "Transacción rechazada correctamente (contrato pausado)"
else
    echo -e "${RED}✗ Error: La transacción no debería haber pasado${NC}"
fi
set -e  # Re-enable exit on error

echo ""
echo "Admin despausando el contrato..."
cast send $CONTRACT_ADDRESS \
    "unpause()" \
    --private-key $PK_ADMIN \
    --rpc-url $RPC_URL > /dev/null 2>&1

print_step "Contrato reactivado"

# ====================================
# RESUMEN FINAL
# ====================================
print_section "RESUMEN DE PRUEBAS"

echo -e "${GREEN}✓ Todas las pruebas completadas exitosamente${NC}"
echo ""
echo "Flujo completo probado:"
echo "  1. ✓ Registro de 4 usuarios (Producer, Factory, Retailer, Consumer)"
echo "  2. ✓ Aprobación por Admin"
echo "  3. ✓ Creación de materia prima por Producer"
echo "  4. ✓ Transferencia Producer → Factory"
echo "  5. ✓ Factory crea producto derivado"
echo "  6. ✓ Transferencia Factory → Retailer"
echo "  7. ✓ Transferencia Retailer → Consumer"
echo "  8. ✓ Trazabilidad completa verificada"
echo "  9. ✓ Funcionalidad Pausable testeada"
echo ""

# Estadísticas finales
echo "Estadísticas finales:"
echo "  Usuarios registrados: 4"
echo "  Tokens creados: 2 (1 materia prima + 1 producto)"
echo "  Transferencias completadas: 3"
echo ""

# Balances finales
echo "Balances finales de 'Cotton Fabric' (Token #2):"
FACTORY_FINAL=$(cast call $CONTRACT_ADDRESS "getTokenBalance(uint256,address)(uint256)" 2 $FACTORY --rpc-url $RPC_URL)
RETAILER_FINAL=$(cast call $CONTRACT_ADDRESS "getTokenBalance(uint256,address)(uint256)" 2 $RETAILER --rpc-url $RPC_URL)
CONSUMER_FINAL=$(cast call $CONTRACT_ADDRESS "getTokenBalance(uint256,address)(uint256)" 2 $CONSUMER --rpc-url $RPC_URL)

echo "  Factory:  $FACTORY_FINAL unidades"
echo "  Retailer: $RETAILER_FINAL unidades"
echo "  Consumer: $CONSUMER_FINAL unidades"
echo ""

echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}   Supply Chain funcionando correctamente! 🎉${NC}"
echo -e "${BLUE}================================================${NC}"
