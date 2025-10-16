#!/bin/bash
# Hook: after-edit-test
# Trigger: Después de editar archivos .t.sol
# Acción: Ejecuta tests automáticamente

FILE_PATH="$1"

# Solo ejecutar para archivos de test
if [[ "$FILE_PATH" == *".t.sol" ]]; then
    echo "🧪 [Hook] Test modificado, ejecutando tests..."

    # Cambiar al directorio sc
    cd "$(dirname "$FILE_PATH")/../../" || exit 1

    # Compilar primero
    if ! forge build 2>/dev/null; then
        echo "❌ [Hook] Error en la compilación, tests no ejecutados"
        exit 1
    fi

    # Ejecutar tests
    echo "▶️  [Hook] Ejecutando forge test..."
    TEST_OUTPUT=$(forge test 2>&1)

    # Mostrar resumen
    echo "$TEST_OUTPUT" | tail -5

    # Verificar si pasaron todos los tests
    if echo "$TEST_OUTPUT" | grep -q "FAILED"; then
        echo "❌ [Hook] Algunos tests fallaron"
        echo "Ver detalles con: cd sc && forge test -vvv"
        exit 1
    else
        echo "✅ [Hook] Todos los tests pasaron"
    fi
fi

exit 0
