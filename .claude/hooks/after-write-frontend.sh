#!/bin/bash
# Hook: after-write-frontend
# Trigger: Después de crear archivos .tsx o .ts en web/
# Acción: Valida TypeScript y sugiere próximos pasos

FILE_PATH="$1"

# Solo ejecutar para archivos TypeScript en web/
if [[ "$FILE_PATH" == *"/web/"* ]] && ([[ "$FILE_PATH" == *.tsx ]] || [[ "$FILE_PATH" == *.ts ]]); then
    FILE_NAME=$(basename "$FILE_PATH")
    echo "⚛️  [Hook] Archivo frontend creado: $FILE_NAME"

    # Detectar tipo de archivo
    if [[ "$FILE_PATH" == *"/app/"*"/page.tsx" ]]; then
        echo "📄 [Hook] Nueva página Next.js detectada"
        ROUTE=$(dirname "$FILE_PATH" | sed 's/.*\/app//')
        if [ "$ROUTE" = "" ]; then ROUTE="/"; fi
        echo "🔗 Ruta: $ROUTE"

    elif [[ "$FILE_PATH" == *"/components/"* ]]; then
        echo "🧩 [Hook] Nuevo componente React detectado"

    elif [[ "$FILE_PATH" == *"/hooks/"* ]]; then
        echo "🪝 [Hook] Nuevo hook personalizado detectado"

    elif [[ "$FILE_PATH" == *"/contexts/"* ]]; then
        echo "🌐 [Hook] Nuevo contexto React detectado"

    elif [[ "$FILE_PATH" == *"/lib/"* ]]; then
        echo "📚 [Hook] Nuevo servicio/librería detectada"
    fi

    # Sugerencias según el tipo
    if [[ "$FILE_PATH" == *"Web3"* ]] || [[ "$FILE_PATH" == *"web3"* ]]; then
        echo "💡 Recuerda: Web3 requiere 'use client' en Next.js"
        echo "💡 Convierte BigInt a String antes de pasar a componentes"
    fi

    if [[ "$FILE_PATH" == *"Context"* ]]; then
        echo "💡 No olvides agregar el Provider en layout.tsx"
    fi
fi

exit 0
