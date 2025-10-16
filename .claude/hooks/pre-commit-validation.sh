#!/bin/bash
# Hook: pre-commit-validation
# Trigger: Antes de hacer commit (si se configura como git hook también)
# Acción: Valida que tests pasen y código compile

echo "🔍 [Hook] Validación pre-commit..."

# Validar Smart Contract si existe
if [ -d "sc" ]; then
    echo "📋 Validando Smart Contract..."

    cd sc || exit 1

    # Compilar
    if ! forge build 2>/dev/null; then
        echo "❌ [Hook] El contrato no compila"
        echo "No se puede hacer commit con código que no compila"
        exit 1
    fi

    # Ejecutar tests
    if ! forge test 2>/dev/null; then
        echo "❌ [Hook] Los tests fallan"
        echo "No se puede hacer commit con tests fallidos"
        exit 1
    fi

    echo "✅ Smart Contract válido"
    cd ..
fi

# Validar Frontend si existe
if [ -d "web" ]; then
    echo "📋 Validando Frontend..."

    cd web || exit 1

    # TypeScript check (si existe tsconfig.json)
    if [ -f "tsconfig.json" ]; then
        if ! npm run build 2>/dev/null; then
            echo "⚠️  [Hook] El frontend tiene errores de build"
            echo "Considera revisar antes de commitear"
            # No bloqueamos, solo advertimos
        else
            echo "✅ Frontend válido"
        fi
    fi

    cd ..
fi

echo "✅ [Hook] Validación completada"
exit 0
