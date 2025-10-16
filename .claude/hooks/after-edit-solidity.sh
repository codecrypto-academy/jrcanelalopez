#!/bin/bash
# Hook: after-edit-solidity
# Trigger: Después de editar archivos .sol
# Acción: Compila automáticamente con forge build

FILE_PATH="$1"

# Solo ejecutar para archivos .sol en sc/src/
if [[ "$FILE_PATH" == *"/sc/src/"*.sol ]]; then
    echo "🔨 [Hook] Compilando contrato modificado..."

    # Cambiar al directorio sc
    cd "$(dirname "$FILE_PATH")/../../" || exit 1

    # Compilar con forge
    if forge build 2>/dev/null; then
        echo "✅ [Hook] Compilación exitosa"

        # Mostrar warnings si los hay
        forge build 2>&1 | grep -i "warning" && echo "⚠️  Hay warnings en el código"

    else
        echo "❌ [Hook] Error en la compilación"
        echo "Revisa los errores con: cd sc && forge build"
        exit 1
    fi
fi

exit 0
