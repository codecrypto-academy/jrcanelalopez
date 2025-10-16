#!/bin/bash
# Hook: user-prompt-submit-tracking
# Trigger: Cada vez que el usuario envía un mensaje
# Acción: Actualiza contador de interacciones en la sesión actual

SESSION_FILE=".claude/sessions/current-session.json"
PROJECT_ROOT="/Users/javierruiz-canela/Documents/codecrypto/web3/Ethereum/solidity/proyectos/web3-98_pfm_traza_2025"

# Crear directorio si no existe
mkdir -p "$PROJECT_ROOT/.claude/sessions"

# Si no existe el archivo de sesión actual, crearlo
if [ ! -f "$PROJECT_ROOT/$SESSION_FILE" ]; then
    cat > "$PROJECT_ROOT/$SESSION_FILE" <<EOF
{
  "session_start": "$(date +%Y-%m-%d\ %H:%M:%S)",
  "interactions": 0,
  "files_created": 0,
  "files_edited": 0,
  "commands_executed": 0
}
EOF
fi

# Incrementar contador de interacciones
CURRENT=$(cat "$PROJECT_ROOT/$SESSION_FILE" | grep -o '"interactions": [0-9]*' | grep -o '[0-9]*')
NEW_COUNT=$((CURRENT + 1))

# Actualizar archivo (simple sed para este caso)
sed -i.bak "s/\"interactions\": $CURRENT/\"interactions\": $NEW_COUNT/" "$PROJECT_ROOT/$SESSION_FILE"
rm -f "$PROJECT_ROOT/$SESSION_FILE.bak"

# Cada 10 interacciones, recordar guardar sesión
if [ $((NEW_COUNT % 10)) -eq 0 ]; then
    echo "💾 [Hook] Llevas $NEW_COUNT interacciones en esta sesión"
    echo "💡 Considera documentar esta sesión pronto"
fi

exit 0
