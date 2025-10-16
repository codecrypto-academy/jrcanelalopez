#!/bin/bash
# Hook: after-task-complete
# Trigger: Después de completar una tarea con el agente Task
# Acción: Sugiere siguiente paso y actualiza progreso

TASK_DESCRIPTION="$1"
TASK_RESULT="$2"

echo "✅ [Hook] Tarea completada: $TASK_DESCRIPTION"

# Sugerencias según tipo de tarea
if [[ "$TASK_DESCRIPTION" == *"test"* ]] || [[ "$TASK_DESCRIPTION" == *"Test"* ]]; then
    echo "💡 Próximo paso: Verificar que todos los tests pasen con forge test"
    echo "💡 Considera: forge coverage para ver cobertura"

elif [[ "$TASK_DESCRIPTION" == *"contract"* ]] || [[ "$TASK_DESCRIPTION" == *"Contract"* ]]; then
    echo "💡 Próximo paso: Escribir tests para el contrato"
    echo "💡 Luego: Desplegar en Anvil local"

elif [[ "$TASK_DESCRIPTION" == *"frontend"* ]] || [[ "$TASK_DESCRIPTION" == *"Frontend"* ]]; then
    echo "💡 Próximo paso: Verificar build con npm run build"
    echo "💡 Luego: Probar en desarrollo con npm run dev"

elif [[ "$TASK_DESCRIPTION" == *"deploy"* ]] || [[ "$TASK_DESCRIPTION" == *"Deploy"* ]]; then
    echo "💡 Próximo paso: Actualizar web/src/contracts/config.ts"
    echo "💡 Luego: Generar ABI con el comando /generate-abi"
fi

# Recordar documentar
echo "📝 Recuerda: Documenta esta tarea en la sesión actual"

exit 0
