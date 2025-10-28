#!/bin/bash
# Hook: after-edit-typescript.sh
# Se ejecuta después de editar archivos TypeScript (.ts, .tsx)
# Propósito: Verificar tipos automáticamente

set -e

# Obtener el archivo editado
FILE="$1"

# Solo procesar archivos .ts o .tsx
if [[ ! "$FILE" =~ \.(ts|tsx)$ ]]; then
    exit 0
fi

echo "📘 Verificando tipos TypeScript después de editar $FILE..."

# Determinar en qué parte del proyecto estamos
if [[ "$FILE" == *"/lib/"* ]]; then
    echo "🔍 Verificando tipos en lib/..."
    cd lib && npx tsc --noEmit && echo "✅ Tipos correctos en lib/" || echo "⚠️  Errores de tipos en lib/"
elif [[ "$FILE" == *"/app/"* ]]; then
    echo "🔍 Verificando tipos en app/..."
    cd app && npm run type-check && echo "✅ Tipos correctos en app/" || echo "⚠️  Errores de tipos en app/"
fi

exit 0
