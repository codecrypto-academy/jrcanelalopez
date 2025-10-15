# Guía Rápida de Pruebas del DAO

## Paso 1: Arrancar Anvil

En una terminal, ejecuta:

```bash
anvil
```

Deja esta terminal abierta. Anvil estará corriendo en `http://localhost:8545`.

## Paso 2: Desplegar Contratos

En **otra terminal**, desde el directorio `smart-contracts`:

```bash
cd smart-contracts
forge script script/DeployDAOLocal.s.sol:DeployDAOLocal --rpc-url http://localhost:8545 --broadcast -vvv
```

Esto desplegará todos los contratos y creará 5 shareholders automáticamente.

## Paso 3: Ejecutar Pruebas con Cast

Copia y ejecuta estos comandos uno por uno:

### 3.1 Configurar Variables

```bash
# Direcciones de contratos (ajustar según tu deployment)
TOKEN="0x5FbDB2315678afecb367f032d93F642f64180aa3"
GOVERNOR="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
TIMELOCK="0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

# Cuentas de Anvil
ACCOUNT0="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
ACCOUNT1="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
ACCOUNT2="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"

# Private Keys
PK0="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
PK1="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
PK2="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"

RPC="http://localhost:8545"
```

### 3.2 Verificar Balances

```bash
echo "=== Verificando Token Balances ==="
cast call $TOKEN "balanceOf(address)(uint256)" $ACCOUNT0 --rpc-url $RPC | cast --to-unit ether
cast call $TOKEN "balanceOf(address)(uint256)" $ACCOUNT1 --rpc-url $RPC | cast --to-unit ether
cast call $TOKEN "balanceOf(address)(uint256)" $ACCOUNT2 --rpc-url $RPC | cast --to-unit ether
```

### 3.3 Verificar Voting Power

```bash
echo "=== Verificando Voting Power ==="
cast call $TOKEN "getVotes(address)(uint256)" $ACCOUNT0 --rpc-url $RPC | cast --to-unit ether
cast call $TOKEN "getVotes(address)(uint256)" $ACCOUNT1 --rpc-url $RPC | cast --to-unit ether
cast call $TOKEN "getVotes(address)(uint256)" $ACCOUNT2 --rpc-url $RPC | cast --to-unit ether
```

### 3.4 Crear una Propuesta

```bash
echo "=== Creando Propuesta ==="

# Crear propuesta para transferir 1 ETH a ACCOUNT1
cast send $GOVERNOR \
  "propose(address[],uint256[],bytes[],string)" \
  "[$ACCOUNT1]" \
  "[1000000000000000000]" \
  "[0x]" \
  "Propuesta #1: Transferir 1 ETH para gastos operativos" \
  --private-key $PK0 \
  --rpc-url $RPC
```

Para obtener el PROPOSAL_ID del log, ejecuta:

```bash
# Obtener el último log
cast logs --from-block latest --rpc-url $RPC
```

O calcúlalo manualmente:

```bash
# Calcular proposal ID
DESCRIPTION="Propuesta #1: Transferir 1 ETH para gastos operativos"
DESCRIPTION_HASH=$(cast keccak "$DESCRIPTION")
PROPOSAL_ID=$(cast call $GOVERNOR \
  "hashProposal(address[],uint256[],bytes[],bytes32)(uint256)" \
  "[$ACCOUNT1]" \
  "[1000000000000000000]" \
  "[0x]" \
  "$DESCRIPTION_HASH" \
  --rpc-url $RPC)

echo "Proposal ID: $PROPOSAL_ID"
```

### 3.5 Esperar y Verificar Estado

```bash
# Minar bloques para que la propuesta pase a Active
cast rpc anvil_mine 2 --rpc-url $RPC

# Ver estado (0=Pending, 1=Active, 2=Canceled, 3=Defeated, 4=Succeeded, 7=Executed)
cast call $GOVERNOR "state(uint256)(uint8)" $PROPOSAL_ID --rpc-url $RPC
```

### 3.6 Votar

```bash
echo "=== Votando en la Propuesta ==="

# Account 0 vota A FAVOR (1)
cast send $GOVERNOR "castVote(uint256,uint8)" $PROPOSAL_ID 1 \
  --private-key $PK0 --rpc-url $RPC

# Account 1 vota A FAVOR (1)
cast send $GOVERNOR "castVote(uint256,uint8)" $PROPOSAL_ID 1 \
  --private-key $PK1 --rpc-url $RPC

# Account 2 vota EN CONTRA (0)
cast send $GOVERNOR "castVote(uint256,uint8)" $PROPOSAL_ID 0 \
  --private-key $PK2 --rpc-url $RPC
```

### 3.7 Ver Resultados de Votación

```bash
cast call $GOVERNOR "proposalVotes(uint256)(uint256,uint256,uint256)" $PROPOSAL_ID --rpc-url $RPC
```

### 3.8 Finalizar Votación

```bash
# Avanzar bloques (voting period)
cast rpc anvil_mine 60 --rpc-url $RPC

# Verificar que la propuesta fue aprobada (estado = 4)
cast call $GOVERNOR "state(uint256)(uint8)" $PROPOSAL_ID --rpc-url $RPC
```

### 3.9 Queue en Timelock

```bash
echo "=== Queue en Timelock ==="

cast send $GOVERNOR \
  "queue(address[],uint256[],bytes[],bytes32)" \
  "[$ACCOUNT1]" \
  "[1000000000000000000]" \
  "[0x]" \
  "$DESCRIPTION_HASH" \
  --private-key $PK0 \
  --rpc-url $RPC

# Verificar estado (5=Queued)
cast call $GOVERNOR "state(uint256)(uint8)" $PROPOSAL_ID --rpc-url $RPC
```

### 3.10 Esperar Timelock Delay

```bash
# Avanzar tiempo 61 segundos
cast rpc evm_increaseTime 61 --rpc-url $RPC
cast rpc anvil_mine 1 --rpc-url $RPC
```

### 3.11 Ejecutar Propuesta

```bash
echo "=== Ejecutando Propuesta ==="

# Primero, enviar ETH al Timelock
cast send $TIMELOCK --value 2ether --private-key $PK0 --rpc-url $RPC

# Ver balance antes
echo "Balance de ACCOUNT1 antes:"
cast balance $ACCOUNT1 --rpc-url $RPC | cast --to-unit ether

# Ejecutar propuesta
cast send $GOVERNOR \
  "execute(address[],uint256[],bytes[],bytes32)" \
  "[$ACCOUNT1]" \
  "[1000000000000000000]" \
  "[0x]" \
  "$DESCRIPTION_HASH" \
  --private-key $PK0 \
  --rpc-url $RPC

# Ver balance después
echo "Balance de ACCOUNT1 después:"
cast balance $ACCOUNT1 --rpc-url $RPC | cast --to-unit ether

# Verificar estado (7=Executed)
cast call $GOVERNOR "state(uint256)(uint8)" $PROPOSAL_ID --rpc-url $RPC
```

## Comandos Útiles

### Ver eventos de una transacción

```bash
cast receipt <TX_HASH> --rpc-url $RPC
```

### Ver código de un contrato

```bash
cast code <ADDRESS> --rpc-url $RPC
```

### Llamar función view

```bash
cast call <ADDRESS> "functionName()(returnType)" --rpc-url $RPC
```

### Enviar transacción

```bash
cast send <ADDRESS> "functionName(params)" <ARGS> --private-key <PK> --rpc-url $RPC
```

## Solución de Problemas

### "Governor: vote not currently active"

- La propuesta está en Pending, espera 1-2 bloques con `cast rpc anvil_mine 2`

### "Governor: proposal not successful"

- No se alcanzó el quorum o los votos a favor no superaron los en contra
- Verifica los resultados con `proposalVotes`

### "Timelock: operation is not ready"

- No ha pasado el delay mínimo (1 minuto)
- Usa `cast rpc evm_increaseTime 61` para avanzar el tiempo

### "Timelock: insufficient balance"

- El Timelock no tiene fondos
- Envía ETH con `cast send $TIMELOCK --value 2ether --private-key $PK0`

## Resumen del Flujo

1. ✅ Deploy contratos
2. ✅ Verificar balances y voting power
3. ✅ Crear propuesta
4. ✅ Esperar votation delay (1-2 bloques)
5. ✅ Votar (múltiples accounts)
6. ✅ Esperar voting period (~60 bloques para test)
7. ✅ Queue en Timelock
8. ✅ Esperar timelock delay (61 segundos)
9. ✅ Ejecutar propuesta
10. ✅ Verificar transferencia de fondos

¡Felicidades! 🎉 Has probado todo el flujo del DAO.
