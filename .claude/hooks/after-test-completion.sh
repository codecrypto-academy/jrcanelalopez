#!/bin/bash
# Hook: after-test-completion.sh
# Se ejecuta después de completar tests
# Propósito: Limpiar recursos Docker si los tests fallaron

set -e

TEST_RESULT="$1"  # "success" o "failure"
TEST_FILE="$2"

echo ""
echo "🧪 Test completado: $TEST_FILE"

if [ "$TEST_RESULT" = "failure" ]; then
    echo "❌ Tests fallaron"
    echo ""
    echo "💡 Sugerencia: Si hay problemas con Docker, ejecuta:"
    echo "   /cleanup-networks"
    echo ""

    # Preguntar si quiere limpiar automáticamente
    read -p "¿Quieres limpiar redes Docker ahora? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🧹 Limpiando redes Docker..."
        docker rm -f $(docker ps -aq --filter "label=project=besu-network-manager") 2>/dev/null || true
        docker network prune -f 2>/dev/null || true
        echo "✅ Limpieza completada"
    fi
else
    echo "✅ Tests pasaron exitosamente"

    # Mostrar si hay contenedores que limpiar
    CONTAINERS=$(docker ps -a --filter "label=project=besu-network-manager" --format "{{.Names}}" 2>/dev/null | wc -l)
    if [ "$CONTAINERS" -gt 0 ]; then
        echo ""
        echo "💡 Hay $CONTAINERS contenedores Besu activos"
        echo "   Considera ejecutar /cleanup-networks si no los necesitas"
    fi
fi

exit 0
