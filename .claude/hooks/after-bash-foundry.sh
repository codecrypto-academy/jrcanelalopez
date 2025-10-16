#!/bin/bash
# Hook: after-bash-foundry
# Trigger: Después de ejecutar comandos forge/anvil/cast
# Acción: Valida resultado y sugiere próximos pasos

COMMAND="$1"
EXIT_CODE="$2"

# Solo ejecutar para comandos de Foundry
if [[ "$COMMAND" == *"forge"* ]] || [[ "$COMMAND" == *"anvil"* ]] || [[ "$COMMAND" == *"cast"* ]]; then

    # forge build
    if [[ "$COMMAND" == *"forge build"* ]]; then
        if [ "$EXIT_CODE" -eq 0 ]; then
            echo "✅ [Hook] Compilación exitosa"
            echo "💡 Próximos pasos: forge test (ejecutar tests)"
        else
            echo "❌ [Hook] Compilación fallida"
            echo "💡 Revisa los errores de Solidity arriba"
        fi
    fi

    # forge test
    if [[ "$COMMAND" == *"forge test"* ]]; then
        if [ "$EXIT_CODE" -eq 0 ]; then
            echo "✅ [Hook] Tests pasaron correctamente"
            echo "💡 Próximos pasos: forge coverage (ver cobertura) o implementar frontend"
        else
            echo "❌ [Hook] Tests fallaron"
            echo "💡 Usa 'forge test -vvv' para ver detalles"
        fi
    fi

    # forge script (deploy)
    if [[ "$COMMAND" == *"forge script"* ]] && [[ "$COMMAND" == *"--broadcast"* ]]; then
        if [ "$EXIT_CODE" -eq 0 ]; then
            echo "✅ [Hook] Contrato desplegado exitosamente"
            echo "💡 Recuerda actualizar web/src/contracts/config.ts con la nueva dirección"
        else
            echo "❌ [Hook] Deploy fallido"
            echo "💡 Verifica que Anvil esté corriendo: anvil"
        fi
    fi

    # anvil
    if [[ "$COMMAND" == *"anvil"* ]]; then
        echo "🔗 [Hook] Blockchain local iniciada"
        echo "💡 Cuentas disponibles para importar en MetaMask:"
        echo "   Admin:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        echo "   Producer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
        echo "   Factory:  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    fi

fi

exit 0
