#!/bin/bash
# Hook: after-write-solidity
# Trigger: Después de crear archivos .sol
# Acción: Compila y muestra estructura del contrato

FILE_PATH="$1"

# Solo ejecutar para archivos .sol nuevos
if [[ "$FILE_PATH" == *.sol ]]; then
    echo "📝 [Hook] Nuevo contrato Solidity creado: $(basename "$FILE_PATH")"

    # Si está en sc/src/, compilar
    if [[ "$FILE_PATH" == *"/sc/src/"* ]]; then
        cd "$(dirname "$FILE_PATH")/../../" || exit 1

        echo "🔨 [Hook] Compilando nuevo contrato..."
        if forge build 2>/dev/null; then
            echo "✅ [Hook] Compilación exitosa"

            # Mostrar información del contrato
            echo "📊 [Hook] Estructura del contrato:"
            grep -E "(contract|function|event|struct|enum|mapping)" "$FILE_PATH" | head -20

        else
            echo "❌ [Hook] Error en la compilación inicial"
            exit 1
        fi
    fi

    # Si es un test, sugerir ejecutarlo
    if [[ "$FILE_PATH" == *".t.sol" ]]; then
        echo "🧪 [Hook] Test creado. Para ejecutar: cd sc && forge test"
    fi
fi

exit 0
