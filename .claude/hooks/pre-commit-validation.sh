#!/bin/bash
# Hook: pre-commit-validation.sh
# Se ejecuta antes de crear un commit
# Propósito: Validar que el código esté listo para commit

set -e

echo "🔍 Validaciones pre-commit..."

# 1. Verificar que no hay archivos sensibles
echo "🔒 Verificando archivos sensibles..."

SENSITIVE_FILES=$(git diff --cached --name-only | grep -E '\.env$|\.env\.local$|/keys/|\.key$|\.pem$|besu-data/|networks/' || true)

if [ -n "$SENSITIVE_FILES" ]; then
    echo "❌ ERROR: Intentando commitear archivos sensibles:"
    echo "$SENSITIVE_FILES"
    echo ""
    echo "💡 Estos archivos deberían estar en .gitignore"
    exit 1
fi

echo "✅ No hay archivos sensibles"

# 2. Verificar TypeScript
echo ""
echo "📘 Verificando tipos TypeScript..."

HAS_TS_FILES=$(git diff --cached --name-only | grep -E '\.tsx?$' || true)

if [ -n "$HAS_TS_FILES" ]; then
    if [[ "$HAS_TS_FILES" == *"/lib/"* ]]; then
        echo "🔍 Verificando lib/..."
        (cd lib && npx tsc --noEmit) || {
            echo "❌ Errores de tipos en lib/"
            echo "💡 Ejecuta /type-check para ver los errores"
            exit 1
        }
    fi

    if [[ "$HAS_TS_FILES" == *"/app/"* ]]; then
        echo "🔍 Verificando app/..."
        (cd app && npm run type-check) || {
            echo "❌ Errores de tipos en app/"
            echo "💡 Ejecuta /type-check para ver los errores"
            exit 1
        }
    fi

    echo "✅ Tipos correctos"
fi

# 3. Verificar que no hay node_modules/
echo ""
echo "📦 Verificando node_modules..."

NODE_MODULES=$(git diff --cached --name-only | grep 'node_modules/' || true)

if [ -n "$NODE_MODULES" ]; then
    echo "❌ ERROR: Intentando commitear node_modules/"
    echo "💡 Añade node_modules/ a .gitignore"
    exit 1
fi

echo "✅ No hay node_modules/"

# 4. Todo OK
echo ""
echo "✅ Todas las validaciones pasaron"
echo "💚 Listo para commit"

exit 0
