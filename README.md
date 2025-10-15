# CodeCrypto DAO

Sistema completo de gobernanza descentralizada (DAO) construido con Solidity, OpenZeppelin Governor.

## 🎯 Características

### Smart Contracts (Blockchain)

- **DAOToken** - Token ERC20 con capacidades de votación (ERC20Votes)
- **CodeCryptoDAOGovernor** - Sistema de gobernanza completo con:
  - Creación de propuestas
  - Sistema de votación (a favor, en contra, abstención)
  - Timelock para ejecución segura
  - Quorum del 4%
  - Voting period de ~1 semana
- **ProposalFactory** - Patrón Factory para crear propuestas proxy dinámicamente
- **ProposalImplementation** - Implementación de propuestas con sistema de votación propio

### Off-chain Application

- Procesamiento de firmas
- Votación off-chain
- Ejecución de propuestas

## 📁 Estructura del Proyecto

```
web3-dao/
├── smart-contracts/          # Contratos Solidity + Foundry
│   ├── src/                  # Código fuente de contratos
│   │   ├── DAOToken.sol
│   │   ├── CodeCryptoDAOGovernor.sol
│   │   ├── CodeCryptoDAOGovernorV2.sol
│   │   ├── ProposalFactory.sol
│   │   └── ProposalImplementation.sol
│   ├── script/               # Scripts de deployment
│   ├── test/                 # Tests unitarios
│   └── deployments/          # Direcciones de contratos desplegados
└── docs/                     # Documentación
```

## 🚀 Instalación y Setup

### Prerrequisitos

- Node.js 18+
- Foundry (forge, cast, anvil)
- Git

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd web3-dao

# Instalar dependencias de smart contracts
cd smart-contracts
forge install

# Instalar dependencias de la app
cd ../app/my-app
npm install
```

## 🧪 Testing con Foundry

### 1. Tests Unitarios

```bash
cd smart-contracts
forge test
```

### 2. Tests con Coverage

```bash
forge coverage
```

### 3. Tests Interactivos con Cast

Ver la guía completa: [`QUICK-TEST-GUIDE.md`](smart-contracts/QUICK-TEST-GUIDE.md)

#### Pasos rápidos:

```bash
# Terminal 1: Arrancar Anvil
anvil

# Terminal 2: Desplegar contratos
cd smart-contracts
forge script script/DeployDAOLocal.s.sol:DeployDAOLocal --rpc-url http://localhost:8545 --broadcast

# Seguir la guía para probar el flujo completo
```

### 4. Script Automatizado de Pruebas

Ejecuta todas las pruebas automáticamente:

```bash
cd smart-contracts
./test-dao-with-cast.sh
```

Este script prueba:

- ✅ Verificación del estado inicial
- ✅ Creación de propuestas
- ✅ Votación de múltiples shareholders
- ✅ Aprobación de propuestas
- ✅ Queue en Timelock
- ✅ Ejecución de propuestas
- ✅ Sistema de Proposal Factory

## 📝 Flujo Completo de una Propuesta

1. **Crear Propuesta**

   - Cualquier holder con suficientes tokens puede crear una propuesta
   - Se especifica: destino, monto, función a ejecutar, descripción

2. **Voting Delay** (1 bloque)

   - Periodo corto antes de que empiece la votación
   - Permite que los holders se preparen

3. **Voting Period** (~1 semana)

   - Los holders votan: A favor (1), En contra (0), Abstención (2)
   - Se requiere quorum del 4% del supply

4. **Propuesta Aprobada** (si tiene votos suficientes)

   - Estado cambia a "Succeeded"

5. **Queue en Timelock** (2 días de delay)

   - Periodo de seguridad antes de ejecución
   - Permite reaccionar ante propuestas maliciosas

6. **Ejecutar Propuesta**
   - Después del delay, cualquiera puede ejecutar
   - Se transfieren fondos o se ejecuta la lógica programada

## 🔑 Cuentas de Prueba (Anvil)

| Shareholder   | Tokens | Address        |
| ------------- | ------ | -------------- |
| Shareholder 1 | 1000   | 0xf39F...2266  |
| Shareholder 2 | 2000   | 0x7099...c79C8 |
| Shareholder 3 | 1500   | 0x3C44...293BC |
| Shareholder 4 | 1000   | 0x90F7...3b906 |
| Shareholder 5 | 500    | 0x15d3...C6A65 |

**Total Supply**: 6000 tokens  
**Quorum**: 240 tokens (4%)

## 📊 Parámetros de Gobernanza

- **Voting Delay**: 1 bloque
- **Voting Period**: 50400 bloques (~1 semana con bloques de 12s)
- **Proposal Threshold**: 1000 tokens (mínimo para crear propuestas)
- **Quorum**: 4% del total supply
- **Timelock Delay**: 2 días (en producción), 1 minuto (en local)

## 🏗️ Arquitectura de Contratos

### DAOToken

Token ERC20 con extensiones:

- `ERC20Votes`: Sistema de delegación y checkpoints
- `ERC20Permit`: Firmas gasless (EIP-2612)
- `Ownable`: Control de minting

### CodeCryptoDAOGovernor

Sistema de gobernanza basado en OpenZeppelin Governor:

- `GovernorSettings`: Configuración de parámetros
- `GovernorCountingSimple`: Sistema de votación simple
- `GovernorVotes`: Integración con tokens de votación
- `GovernorVotesQuorumFraction`: Quorum basado en porcentaje
- `GovernorTimelockControl`: Ejecución con delay de seguridad

### ProposalFactory

Patrón Factory para crear propuestas dinámicas:

- Usa clones mínimos (EIP-1167) para eficiencia en gas
- Cada propuesta es un contrato independiente
- Permite propuestas complejas con lógica propia

## 🔐 Seguridad

- ✅ Contratos auditados de OpenZeppelin
- ✅ Timelock para prevenir ejecuciones maliciosas
- ✅ Sistema de roles y permisos
- ✅ Tests exhaustivos con Foundry
- ✅ Quorum para validez de propuestas

## 📚 Documentación Adicional

- [Guía de Deployment](smart-contracts/DEPLOYMENT.md)
- [Guía de Testing Rápido](smart-contracts/QUICK-TEST-GUIDE.md)
- [Guía de Testing Completa](smart-contracts/TESTING-GUIDE.md)

## 🛠️ Comandos Útiles

### Smart Contracts

```bash
# Compilar
forge build

# Tests
forge test

# Coverage
forge coverage

# Deploy local
forge script script/DeployDAOLocal.s.sol --rpc-url http://localhost:8545 --broadcast

# Verificar contrato
forge verify-contract <ADDRESS> <CONTRACT> --chain sepolia
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 🌟 Próximos Pasos

- [ ] Completar integración con frontend Next.js
- [ ] Implementar firmas off-chain (EIP-712)
- [ ] Sistema de delegación de votos en UI
- [ ] Dashboard con estadísticas del DAO
- [ ] Integración con IPFS para almacenar propuestas
- [ ] Deploy en testnet (Sepolia)
- [ ] Deploy en mainnet

## 📧 Contacto

CodeCrypto - [@codecrypto](https://twitter.com/codecrypto)

Project Link: [https://github.com/codecrypto/web3-dao](https://github.com/codecrypto/web3-dao)
