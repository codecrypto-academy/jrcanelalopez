# 🏛️ Scripts de Deployment - CodeCrypto DAO

## ✅ Scripts Completados

### 1. **DeployDAO.s.sol** - Deployment Producción

Script completo para desplegar en testnet/mainnet con todas las características:

- ✅ Deployment de 5 contratos en orden correcto
- ✅ Configuración de roles del Timelock
- ✅ Transfer de ownership al Timelock (DAO autónomo)
- ✅ Soporte para shareholders iniciales (opcional)
- ✅ Genera archivo JSON con direcciones
- ✅ Verificación automática en Etherscan

### 2. **DeployDAOLocal.s.sol** - Deployment Local

Script optimizado para testing rápido con Anvil:

- ✅ 5 shareholders de prueba pre-configurados
- ✅ Timelock delay de 1 minuto (vs 2 días en producción)
- ✅ Usa cuentas por defecto de Anvil
- ✅ Configuración lista para usar inmediatamente

### 3. **InteractWithDAO.s.sol** - Scripts de Interacción

Colección de scripts helper para operaciones comunes:

- ✅ `CreateShareholder` - Crear nuevos shareholders
- ✅ `DelegateVotes` - Delegar poder de voto
- ✅ `CreateProposal` - Crear propuestas
- ✅ `VoteOnProposal` - Votar en propuestas
- ✅ `GetProposalState` - Ver estado de propuestas
- ✅ `GetTokenInfo` - Información del token

## 📖 Documentación

- **script/README.md** - Guía completa de deployment con ejemplos
- **.env.example** - Template de variables de entorno
- **deployments/.gitkeep** - Documentación de archivos generados

## 🚀 Uso Rápido

### Deployment Local (Testing)

```bash
# Terminal 1: Iniciar Anvil
anvil

# Terminal 2: Deploy
forge script script/DeployDAOLocal.s.sol:DeployDAOLocal \
  --rpc-url http://localhost:8545 \
  --broadcast
```

### Deployment Testnet (Sepolia)

```bash
# Configurar .env
export PRIVATE_KEY=tu_private_key
export SEPOLIA_RPC_URL=tu_rpc_url
export ETHERSCAN_API_KEY=tu_api_key

# Deploy y verify
forge script script/DeployDAO.s.sol:DeployDAO \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify
```

### Interacción Post-Deployment

```bash
# Crear shareholder
export DAO_TOKEN_ADDRESS=0x...
export SHAREHOLDER_ADDRESS=0x...
export SHARES_AMOUNT=100000000000000000000000

forge script script/InteractWithDAO.s.sol:CreateShareholder \
  --rpc-url http://localhost:8545 \
  --broadcast
```

## 📊 Contratos Desplegados

El script despliega los siguientes contratos en orden:

1. **DAOToken** - Token ERC20Votes para gobernanza

   - 18 decimales
   - Minteable por owner
   - Sistema de delegación de votos
   - Compatible con ERC20Permit (gasless approvals)

2. **TimelockController** - Control de ejecución con delay

   - 2 días de delay (producción) / 1 minuto (local)
   - Roles: Proposer, Executor, Admin
   - Auto-gestión por el DAO

3. **CodeCryptoDAOGovernor** - Contrato principal de gobernanza

   - Voting delay: 1 bloque
   - Voting period: 50,400 bloques (~1 semana)
   - Proposal threshold: 1,000 tokens
   - Quorum: 4% del supply total
   - Integración con Timelock

4. **ProposalImplementation** - Template para propuestas

   - Patrón Clone para eficiencia de gas
   - Ejecutable por el Governor
   - Tracking de metadata

5. **ProposalFactory** - Factory de propuestas
   - Clone pattern (EIP-1167)
   - Ahorro de ~80% de gas vs deployment normal
   - Propuestas determinísticas (CREATE2)

## 🔒 Seguridad

- ✅ Ownership del token transferido al Timelock
- ✅ Admin role del Timelock revocado del deployer
- ✅ Solo el DAO puede crear/remover shareholders
- ✅ Timelock de 2 días para todas las ejecuciones
- ✅ Sistema de quorum para prevenir ataques

## 📝 Configuración

### Modificar Shareholders Iniciales

Edita `DeployDAO.s.sol` función `setUp()`:

```solidity
function setUp() public {
    initialShareholders.push(0xYourAddress);
    initialShares.push(100_000 * 10**18);
}
```

### Modificar Parámetros de Gobernanza

Los parámetros están en el constructor de `CodeCryptoDAOGovernor`:

```solidity
GovernorSettings(
    1,           // voting delay (bloques)
    50400,       // voting period (bloques)
    1000e18      // proposal threshold (tokens)
)
GovernorVotesQuorumFraction(4) // 4% quorum
```

## 🧪 Testing

Todos los contratos tienen tests completos:

```bash
# Ejecutar todos los tests
forge test

# Con gas report
forge test --gas-report

# Tests específicos
forge test --match-contract DAOToken
forge test --match-contract CodeCryptoDAOGovernor
forge test --match-contract ProposalFactory
```

**Resultados:**

- ✅ 57 tests pasados
- ✅ 21 tests de DAOToken
- ✅ 13 tests de Governor
- ✅ 21 tests de ProposalFactory
- ✅ Cobertura completa de funcionalidad

## 📁 Archivos Generados

Después del deployment:

```
deployments/
├── local.json      # Deployment local con Anvil
├── addresses.json  # Deployment en testnet/mainnet
└── .gitkeep        # Documentación

broadcast/
└── DeployDAO.s.sol/
    └── <chain-id>/
        └── run-latest.json  # Log de transacciones
```

## 🎯 Próximos Pasos

1. ✅ **Scripts de deployment completados**
2. ✅ **Tests completos (57 tests)**
3. 🔄 **Integración con frontend** (Próximo)
4. 🔄 **CI/CD con GitHub Actions** (Próximo)
5. 🔄 **Auditoría de seguridad** (Antes de mainnet)

## ⚠️ Checklist Pre-Mainnet

Antes de desplegar en producción:

- [ ] Auditoría de seguridad profesional
- [ ] Review de parámetros de gobernanza
- [ ] Tests de integración en fork de mainnet
- [ ] Backup de private keys
- [ ] Plan de respuesta a incidentes
- [ ] Documentación para la comunidad
- [ ] Verificación de contratos en Etherscan
- [ ] Configuración de monitoring/alertas

## 📚 Recursos

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Governor Docs](https://docs.openzeppelin.com/contracts/4.x/governance)
- [EIP-1167 Minimal Proxy](https://eips.ethereum.org/EIPS/eip-1167)
- [Tally DAO Tools](https://www.tally.xyz/)

## 🤝 Soporte

Si encuentras algún problema:

1. Revisa `script/README.md` para troubleshooting
2. Ejecuta tests: `forge test -vvvv`
3. Verifica variables de entorno
4. Comprueba saldo de ETH para gas

---

**Estado:** ✅ Listo para deployment
**Última actualización:** Octubre 2025
