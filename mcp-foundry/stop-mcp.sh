#!/bin/bash

# stop-mcp.sh
# Script para detener Claude Desktop y el MCP Inspector

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deteniendo MCP Inspector y Claude Desktop...${NC}"
echo ""

# Detener inspector
if pkill -f "inspector" 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Inspector detenido"
else
  echo "  Inspector no estaba corriendo"
fi

# Detener mcp-foundry
if pkill -f "mcp-foundry" 2>/dev/null; then
  echo -e "${GREEN}✓${NC} mcp-foundry detenido"
else
  echo "  mcp-foundry no estaba corriendo"
fi

# Detener Claude Desktop
if pkill -9 "Claude" 2>/dev/null; then
  echo -e "${GREEN}✓${NC} Claude Desktop detenido"
else
  echo "  Claude Desktop no estaba corriendo"
fi

# Liberar puertos
echo ""
echo -e "${YELLOW}Liberando puertos...${NC}"
lsof -ti:6274 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓${NC} Puerto 6274 liberado" || echo "  Puerto 6274 ya estaba libre"
lsof -ti:6277 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓${NC} Puerto 6277 liberado" || echo "  Puerto 6277 ya estaba libre"

echo ""
echo -e "${GREEN}✓ Todos los procesos detenidos${NC}"
