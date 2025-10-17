#!/bin/bash

# Script para iniciar Anvil con configuración para Supply Chain Tracker
# Mantén esta terminal abierta mientras haces las pruebas

echo "================================================"
echo "  Iniciando Anvil para Supply Chain Tracker"
echo "================================================"
echo ""
echo "Configuración:"
echo "  - Puerto: 8545"
echo "  - Chain ID: 31337"
echo "  - 10 cuentas con 10,000 ETH cada una"
echo "  - Block time: 1 segundo"
echo ""
echo "Cuentas disponibles:"
echo "  Admin:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "  Producer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
echo "  Factory:  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
echo "  Retailer: 0x90F79bf6EB2c4f870365E785982E1f101E93b906"
echo "  Consumer: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
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
