#!/bin/bash

# restart-mcp.sh
# Script para reiniciar Claude Desktop y el MCP Inspector

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  MCP Foundry - Restart Script${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# 1. Detener procesos existentes
echo -e "${YELLOW}[1/4]${NC} Deteniendo procesos existentes..."
pkill -f "inspector" 2>/dev/null || true
pkill -f "mcp-foundry" 2>/dev/null || true
pkill -9 "Claude" 2>/dev/null || true
sleep 2
echo -e "${GREEN}✓${NC} Procesos detenidos"
echo ""

# 2. Limpiar puertos
echo -e "${YELLOW}[2/4]${NC} Liberando puertos 6274 y 6277..."
lsof -ti:6274 | xargs kill -9 2>/dev/null || true
lsof -ti:6277 | xargs kill -9 2>/dev/null || true
sleep 1
echo -e "${GREEN}✓${NC} Puertos liberados"
echo ""

# 3. Recompilar MCP (opcional)
if [ "$1" == "--build" ] || [ "$1" == "-b" ]; then
  echo -e "${YELLOW}[3/4]${NC} Recompilando mcp-foundry..."
  npm run build > /dev/null 2>&1
  echo -e "${GREEN}✓${NC} Compilación completada"
  echo ""
else
  echo -e "${YELLOW}[3/4]${NC} Omitiendo compilación (usa --build para forzar)"
  echo ""
fi

# 4. Iniciar MCP Inspector en background
echo -e "${YELLOW}[4/4]${NC} Iniciando MCP Inspector..."

# Crear archivo temporal para capturar output
TEMP_OUTPUT=$(mktemp)

# Iniciar inspector en background y capturar output
npm run inspector > "$TEMP_OUTPUT" 2>&1 &
INSPECTOR_PID=$!

# Esperar a que el inspector se inicie (máximo 10 segundos)
MAX_WAIT=10
COUNTER=0
while [ $COUNTER -lt $MAX_WAIT ]; do
  if grep -q "MCP Inspector is up and running" "$TEMP_OUTPUT" 2>/dev/null; then
    break
  fi
  sleep 1
  COUNTER=$((COUNTER + 1))
done

# Verificar si se inició correctamente
if ! grep -q "MCP Inspector is up and running" "$TEMP_OUTPUT" 2>/dev/null; then
  echo -e "${RED}✗${NC} Error al iniciar el inspector"
  cat "$TEMP_OUTPUT"
  rm "$TEMP_OUTPUT"
  exit 1
fi

# Extraer token de autenticación
AUTH_TOKEN=$(grep -o 'MCP_PROXY_AUTH_TOKEN=[a-f0-9]*' "$TEMP_OUTPUT" | head -1 | cut -d'=' -f2)
PORT=$(grep -o 'localhost:[0-9]*/?MCP_PROXY_AUTH_TOKEN' "$TEMP_OUTPUT" | head -1 | cut -d':' -f2 | cut -d'/' -f1)

if [ -z "$AUTH_TOKEN" ]; then
  echo -e "${RED}✗${NC} No se pudo obtener el token de autenticación"
  cat "$TEMP_OUTPUT"
  rm "$TEMP_OUTPUT"
  exit 1
fi

# Construir URL completa
INSPECTOR_URL="http://localhost:${PORT:-6274}/?MCP_PROXY_AUTH_TOKEN=${AUTH_TOKEN}"

echo -e "${GREEN}✓${NC} MCP Inspector iniciado (PID: $INSPECTOR_PID)"
echo ""

# Limpiar archivo temporal
rm "$TEMP_OUTPUT"

# Mostrar información
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ MCP Inspector está corriendo${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}PID del Inspector:${NC} $INSPECTOR_PID"
echo -e "${YELLOW}Puerto:${NC} ${PORT:-6274}"
echo ""
echo -e "${GREEN}🌐 URL del Inspector:${NC}"
echo ""
echo -e "${BLUE}$INSPECTOR_URL${NC}"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Reiniciar Claude Desktop (opcional)
if [ "$2" == "--claude" ] || [ "$2" == "-c" ] || [ "$1" == "--claude" ] || [ "$1" == "-c" ]; then
  echo -e "${YELLOW}[Bonus]${NC} Iniciando Claude Desktop..."
  open -a "Claude" 2>/dev/null && echo -e "${GREEN}✓${NC} Claude Desktop iniciado" || echo -e "${YELLOW}⚠${NC} Claude Desktop no encontrado"
  echo ""
fi

# Instrucciones
echo -e "${YELLOW}Instrucciones:${NC}"
echo "  • Copia la URL de arriba y ábrela en tu navegador"
echo "  • El inspector quedará corriendo en background"
echo "  • Para detenerlo: pkill -f inspector"
echo ""

# Mostrar logs en tiempo real (opcional)
if [ "$3" == "--logs" ] || [ "$3" == "-l" ] || [ "$2" == "--logs" ] || [ "$2" == "-l" ] || [ "$1" == "--logs" ] || [ "$1" == "-l" ]; then
  echo -e "${YELLOW}Mostrando logs en tiempo real (Ctrl+C para salir):${NC}"
  echo ""
  tail -f ~/Library/Logs/Claude/mcp*.log 2>/dev/null || echo "No hay logs disponibles"
fi

exit 0
