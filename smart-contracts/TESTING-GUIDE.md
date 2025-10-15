# Guía de Pruebas Completas del DAO

Esta guía te permitirá realizar pruebas completas del sistema DAO usando `cast` y `anvil`.

## Prerrequisitos

- Foundry instalado (forge, cast, anvil)
- Terminal con bash/zsh

## Paso 1: Arrancar Anvil

En una terminal, ejecuta:

```bash
cd smart-contracts
chmod +x start-anvil.sh
./start-anvil.sh
```

Esto iniciará Anvil en el puerto 8545 con 10 cuentas pre-fondeadas. **Deja esta terminal abierta**.

## Paso 2: Desplegar los Contratos

En otra terminal, despliega el DAO:

```bash
cd smart-contracts
forge script script/DeployDAOLocal.s.sol:DeployDAOLocal --rpc-url http://localhost:8545 --broadcast
```

Esto creará:

- DAOToken con 5 shareholders
- Governor (sistema de gobernanza)
- Timelock (delay de ejecución)
- ProposalFactory (crear propuestas proxy)

Las direcciones se guardarán en `deployments/local.json`.

## Paso 3: Ejecutar las Pruebas

En la misma terminal, ejecuta el script de pruebas:

```bash
chmod +x test-dao-with-cast.sh
./test-dao-with-cast.sh
```

## ¿Qué Prueba el Script?

El script realiza un flujo completo de una propuesta DAO:

### 1. Verificación Inicial

- Conecta con Anvil
- Verifica balances de tokens
- Verifica voting power de shareholders

### 2. Crear Propuesta

- Crea una propuesta para transferir 1 ETH al Shareholder 2
- Obtiene el ID de la propuesta
- Verifica el estado (Pending → Active)

### 3. Votación

- Shareholder 1 vota A FAVOR (1000 tokens)
- Shareholder 2 vota A FAVOR (2000 tokens)
- Shareholder 3 vota EN CONTRA (1500 tokens)
- Muestra los resultados de la votación

### 4. Finalizar Votación

- Avanza 50 bloques para simular el periodo de votación
- Verifica que la propuesta fue aprobada (Succeeded)

### 5. Queue en Timelock

- Envía la propuesta al Timelock
- Cambia el estado a Queued

### 6. Esperar Delay

- Avanza el tiempo 61 segundos (timelock delay = 1 minuto)
- Permite que la propuesta sea ejecutable

### 7. Ejecutar Propuesta

- Fondea el Timelock con ETH
- Ejecuta la propuesta
- Verifica que el Shareholder 2 recibió 1 ETH
- Estado final: Executed

### 8. Proposal Factory

- Crea una propuesta usando el sistema de proxies
- Vota en la propuesta proxy
- Verifica los resultados

## Cuentas de Anvil

El script usa las cuentas por defecto de Anvil:

| Shareholder | Dirección      | Private Key   | Tokens |
| ----------- | -------------- | ------------- | ------ |
| 1           | 0xf39F...2266  | 0xac09...ff80 | 1000   |
| 2           | 0x7099...c79C8 | 0x59c6...690d | 2000   |
| 3           | 0x3C44...293BC | 0x5de4...365a | 1500   |
| 4           | 0x90F7...3b906 | 0x7c85...07a6 | 1000   |
| 5           | 0x15d3...C6A65 | 0x47e1...926a | 500    |

## Comandos Cast Útiles

### Ver estado de propuesta

```bash
cast call 0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE "state(uint256)(uint8)" <PROPOSAL_ID> --rpc-url http://localhost:8545
```

Estados:

- 0 = Pending
- 1 = Active
- 2 = Canceled
- 3 = Defeated
- 4 = Succeeded
- 5 = Queued
- 6 = Expired
- 7 = Executed

### Ver balance de tokens

```bash
cast call 0x0B306BF915C4d645ff596e518fAf3F9669b97016 "balanceOf(address)(uint256)" <ADDRESS> --rpc-url http://localhost:8545
```

### Ver voting power

```bash
cast call 0x0B306BF915C4d645ff596e518fAf3F9669b97016 "getVotes(address)(uint256)" <ADDRESS> --rpc-url http://localhost:8545
```

### Ver resultados de votación

```bash
cast call 0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE "proposalVotes(uint256)(uint256,uint256,uint256)" <PROPOSAL_ID> --rpc-url http://localhost:8545
```

Devuelve: (votosEnContra, votosAFavor, abstenciones)

### Avanzar bloques manualmente

```bash
cast rpc anvil_mine 10 --rpc-url http://localhost:8545
```

### Avanzar tiempo manualmente

```bash
cast rpc evm_increaseTime 3600 --rpc-url http://localhost:8545
```

## Pruebas Manuales Adicionales

### Crear otra propuesta

```bash
# Preparar datos
GOVERNOR="0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE"
TARGET="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"  # Shareholder2
VALUE="500000000000000000"  # 0.5 ETH
PK1="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

# Crear propuesta
cast send $GOVERNOR \
    "propose(address[],uint256[],bytes[],string)(uint256)" \
    "[$TARGET]" \
    "[$VALUE]" \
    "[0x]" \
    "Propuesta #2: Otra transferencia" \
    --private-key $PK1 \
    --rpc-url http://localhost:8545
```

### Cancelar una propuesta

```bash
cast send $GOVERNOR \
    "cancel(address[],uint256[],bytes[],bytes32)" \
    "[$TARGET]" \
    "[$VALUE]" \
    "[0x]" \
    "$(cast keccak 'Descripción de la propuesta')" \
    --private-key $PK1 \
    --rpc-url http://localhost:8545
```

## Troubleshooting

### "execution reverted"

- Verifica que Anvil esté corriendo
- Asegúrate de usar las direcciones correctas de `deployments/local.json`
- Verifica que la cuenta tenga fondos y tokens

### "Governor: vote not currently active"

- La propuesta está en estado Pending, espera 1-2 bloques
- O el voting period ya terminó

### "Timelock: operation is not ready"

- No ha pasado suficiente tiempo (min delay = 1 minuto)
- Usa `cast rpc evm_increaseTime 61` para avanzar el tiempo

### "Timelock: insufficient balance"

- El Timelock no tiene fondos para ejecutar la propuesta
- Envía ETH al Timelock antes de ejecutar

## Limpiar y Reiniciar

Para reiniciar las pruebas desde cero:

1. Detén Anvil (Ctrl+C)
2. Vuelve a arrancar Anvil con `./start-anvil.sh`
3. Re-despliega los contratos
4. Ejecuta las pruebas de nuevo

## Próximos Pasos

- Integrar con el frontend Next.js
- Implementar firmas offchain con EIP-712
- Añadir eventos y logs más detallados
- Implementar sistema de delegación de votos
- Añadir snapshots de voting power
