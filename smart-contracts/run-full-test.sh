#!/bin/bash

# Script para ejecutar el test completo del DAO
# Asegúrate de tener Anvil corriendo en otra terminal

set -e

echo "🚀 Iniciando test completo del DAO..."
echo ""

# 1. Desplegar contratos
echo "📦 Paso 1: Desplegando contratos..."
forge script script/DeployDAOLocal.s.sol:DeployDAOLocal \
    --rpc-url http://localhost:8545 \
    --broadcast \
    > /dev/null 2>&1

echo "✅ Contratos desplegados"
echo ""

# 2. Delegar votos
echo "🗳️  Paso 2: Delegando votos..."

# Leer la dirección del token desde local.json
TOKEN_ADDRESS=$(jq -r '.DAOToken' ./deployments/local.json)

# Shareholder 1 (100k tokens)
cast send $TOKEN_ADDRESS \
    "delegate(address)" \
    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
    --rpc-url http://localhost:8545 \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    > /dev/null 2>&1

# Shareholder 2 (100k tokens)
cast send $TOKEN_ADDRESS \
    "delegate(address)" \
    0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
    --rpc-url http://localhost:8545 \
    --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
    > /dev/null 2>&1

# Shareholder 3 (100k tokens)
cast send $TOKEN_ADDRESS \
    "delegate(address)" \
    0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC \
    --rpc-url http://localhost:8545 \
    --private-key 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a \
    > /dev/null 2>&1

echo "✅ Votos delegados para 3 shareholders (300k tokens activos)"
echo ""

# Minar algunos bloques para que los votos delegados se registren
echo "⛏️  Minando bloques y avanzando tiempo para registrar delegaciones..."
# Avanzar 10 segundos en el tiempo
cast rpc evm_increaseTime 10 --rpc-url http://localhost:8545 > /dev/null 2>&1
cast rpc anvil_mine 1 --rpc-url http://localhost:8545 > /dev/null 2>&1
echo "✅ Bloques minados y tiempo avanzado (los votos ya están activos)"
echo ""

# 3. Ejecutar test de propuesta
echo "📋 Paso 3: Ejecutando test de ciclo completo de propuesta..."
echo ""
./test-dao-with-cast.sh
