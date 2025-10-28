#!/bin/bash
# Hook: after-bash-docker.sh
# Se ejecuta después de comandos Docker
# Propósito: Mostrar estado actualizado de contenedores Besu

set -e

COMMAND="$1"

# Solo procesar comandos Docker relevantes
if [[ ! "$COMMAND" =~ docker ]]; then
    exit 0
fi

# Ignorar comandos de consulta (ps, logs, inspect)
if [[ "$COMMAND" =~ (ps|logs|inspect|version) ]]; then
    exit 0
fi

echo ""
echo "🐳 Estado actualizado de Docker Besu:"

# Mostrar contenedores Besu
CONTAINERS=$(docker ps -a --filter "label=project=besu-network-manager" --format "{{.Names}}" 2>/dev/null | wc -l)

if [ "$CONTAINERS" -gt 0 ]; then
    echo "📦 Contenedores activos: $CONTAINERS"
    docker ps --filter "label=project=besu-network-manager" --format "table {{.Names}}\t{{.Status}}" 2>/dev/null
else
    echo "✅ No hay contenedores Besu activos"
fi

# Mostrar redes
NETWORKS=$(docker network ls --filter "label=project=besu-network-manager" --format "{{.Name}}" 2>/dev/null | wc -l)
echo ""
echo "🌐 Redes Docker: $NETWORKS"

exit 0
