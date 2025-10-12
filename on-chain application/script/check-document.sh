#!/bin/bash
# Script para consultar documentos en el contrato DocumentRegistry

# Configuración
CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
RPC_URL="http://127.0.0.1:8545"
ANVIL_ACCOUNT_0="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Herramientas de Consulta DocumentRegistry ===${NC}\n"

# Función para obtener información de un documento
get_document() {
    local doc_id=$1
    echo -e "${YELLOW}📄 Obteniendo información del documento: ${doc_id}${NC}"
    
    cast call $CONTRACT_ADDRESS \
        "getDocument(string)(string,string,address,uint256,bool)" \
        "$doc_id" \
        --rpc-url $RPC_URL
    
    echo ""
}

# Función para verificar hash
verify_hash() {
    local doc_id=$1
    local hash=$2
    echo -e "${YELLOW}🔍 Verificando hash del documento: ${doc_id}${NC}"
    
    result=$(cast call $CONTRACT_ADDRESS \
        "verifyDocumentHash(string,string)(bool)" \
        "$doc_id" \
        "$hash" \
        --rpc-url $RPC_URL)
    
    if [ "$result" == "true" ]; then
        echo -e "${GREEN}✅ Hash válido!${NC}"
    else
        echo -e "\033[0;31m❌ Hash NO coincide${NC}"
    fi
    echo ""
}

# Función para verificar si existe un documento
check_exists() {
    local doc_id=$1
    echo -e "${YELLOW}🔎 Verificando existencia del documento: ${doc_id}${NC}"
    
    result=$(cast call $CONTRACT_ADDRESS \
        "documentExists(string)(bool)" \
        "$doc_id" \
        --rpc-url $RPC_URL)
    
    if [ "$result" == "true" ]; then
        echo -e "${GREEN}✅ El documento existe${NC}"
    else
        echo -e "\033[0;31m❌ El documento NO existe${NC}"
    fi
    echo ""
}

# Función para listar documentos de un usuario
list_user_documents() {
    local user_address=${1:-$ANVIL_ACCOUNT_0}
    echo -e "${YELLOW}📋 Documentos del usuario: ${user_address}${NC}"
    
    cast call $CONTRACT_ADDRESS \
        "getUserDocuments(address)(string[])" \
        "$user_address" \
        --rpc-url $RPC_URL
    
    echo ""
}

# Menú interactivo
show_menu() {
    echo -e "${BLUE}Selecciona una opción:${NC}"
    echo "1) Obtener información de un documento (getDocument)"
    echo "2) Verificar hash de un documento"
    echo "3) Verificar si existe un documento"
    echo "4) Listar todos los documentos de un usuario"
    echo "5) Salir"
    echo ""
}

# Si se pasan argumentos, ejecutar directamente
if [ $# -gt 0 ]; then
    case $1 in
        get)
            get_document "$2"
            ;;
        verify)
            verify_hash "$2" "$3"
            ;;
        exists)
            check_exists "$2"
            ;;
        list)
            list_user_documents "$2"
            ;;
        *)
            echo "Uso:"
            echo "  $0 get <document-id>              - Obtener información"
            echo "  $0 verify <document-id> <hash>    - Verificar hash"
            echo "  $0 exists <document-id>           - Verificar existencia"
            echo "  $0 list [address]                 - Listar documentos"
            ;;
    esac
    exit 0
fi

# Modo interactivo
while true; do
    show_menu
    read -p "Opción: " option
    
    case $option in
        1)
            read -p "Introduce el Document ID: " doc_id
            get_document "$doc_id"
            ;;
        2)
            read -p "Introduce el Document ID: " doc_id
            read -p "Introduce el Hash: " hash
            verify_hash "$doc_id" "$hash"
            ;;
        3)
            read -p "Introduce el Document ID: " doc_id
            check_exists "$doc_id"
            ;;
        4)
            read -p "Dirección del usuario [Enter = cuenta Anvil #0]: " user_addr
            list_user_documents "$user_addr"
            ;;
        5)
            echo -e "${GREEN}¡Hasta luego!${NC}"
            exit 0
            ;;
        *)
            echo -e "\033[0;31mOpción inválida${NC}\n"
            ;;
    esac
done
