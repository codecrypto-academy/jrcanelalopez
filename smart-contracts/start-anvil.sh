#!/bin/bash

# Script para iniciar Anvil con configuración para el DAO
# Mantén esta terminal abierta mientras haces las pruebas

echo "================================================"
echo "   Iniciando Anvil para CodeCrypto DAO"
echo "================================================"
echo ""
echo "Configuración:"
echo "  - Puerto: 8545"
echo "  - Chain ID: 31337"
echo "  - 10 cuentas con 10,000 ETH cada una"
echo "  - Block time: 1 segundo"
echo ""
echo "Presiona Ctrl+C para detener Anvil"
echo ""
echo "================================================"
echo ""

anvil \
    --port 8545 \
    --chain-id 31337 \
    --accounts 10 \
    --balance 10000 \
    --block-time 1 \
    --gas-limit 30000000
