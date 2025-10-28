#!/bin/bash
# Hook: user-prompt-submit-tracking.sh
# Se ejecuta cuando el usuario envía un prompt
# Propósito: Tracking simple de uso (opcional)

# Este hook es opcional y puede usarse para métricas básicas

PROMPT="$1"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Crear directorio de logs si no existe
mkdir -p .claude/logs

# Log simple (opcional, comentar si no se desea)
# echo "[$TIMESTAMP] Prompt enviado" >> .claude/logs/usage.log

# No hacer nada más, solo dejar que el sistema continúe
exit 0
