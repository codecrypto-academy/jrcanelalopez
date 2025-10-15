# 🏛️ Cómo Funciona un DAO - Guía Completa

## 📚 Índice

1. [¿Qué es un DAO?](#qué-es-un-dao)
2. [Componentes del Sistema](#componentes-del-sistema)
3. [Ciclo de Vida de una Propuesta](#ciclo-de-vida-de-una-propuesta)
4. [Roles y Actores](#roles-y-actores)
5. [Sistema de Votación](#sistema-de-votación)
6. [Ejecución de Propuestas](#ejecución-de-propuestas)
7. [Ejemplo Práctico Completo](#ejemplo-práctico-completo)

---

## 🤔 ¿Qué es un DAO?

**DAO = Decentralized Autonomous Organization (Organización Autónoma Descentralizada)**

### Concepto

Un DAO es una organización que opera según reglas codificadas en smart contracts, sin necesidad de una autoridad central. Las decisiones se toman democráticamente por los miembros que poseen tokens de gobernanza.

### Analogía Simple

Imagina una empresa donde:

- ✅ **No hay CEO ni directiva** - Las decisiones se toman por votación
- ✅ **Las acciones son tokens** - Quien tiene tokens, tiene poder de voto
- ✅ **Las reglas son código** - Smart contracts ejecutan automáticamente las decisiones
- ✅ **Todo es transparente** - Todas las votaciones son públicas en la blockchain

### En Nuestro DAO

```
CodeCrypto DAO = Organización para gestionar fondos y tomar decisiones colectivas
├── 550,000 tokens totales
├── 5 shareholders iniciales
├── Sistema de votación on-chain
└── Timelock para seguridad
```

---

## 🧩 Componentes del Sistema

### 1. **DAOToken (ERC20Votes)** 📜

**¿Qué es?** El token de gobernanza del DAO.

**Función:**

- Es como una "acción" de la empresa
- Cada token = 1 voto potencial
- Se pueden transferir entre usuarios
- Se deben "delegar" para activar el poder de voto

**Características:**

```solidity
Total Supply: 550,000 tokens
Decimales: 18 (como ETH)
1 token completo = 1,000,000,000,000,000,000 wei
```

**Operaciones principales:**

- `createShareholder()` - Crear nuevo miembro con tokens
- `delegate()` - Activar poder de voto
- `getVotes()` - Ver cuántos votos tiene alguien
- `transfer()` - Transferir tokens

**Ejemplo Real:**

```
Shareholder 1: 100,000 tokens
Shareholder 4: 200,000 tokens (tiene el doble de poder de voto)
```

---

### 2. **Shareholders (Accionistas)** 👥

**¿Quiénes son?** Las personas/direcciones que poseen tokens del DAO.

**En nuestro DAO:**

```
Shareholder 1: 0xf39...2266 - 100,000 tokens (18.18%)
Shareholder 2: 0x709...79C8 - 100,000 tokens (18.18%)
Shareholder 3: 0x3C4...93BC - 100,000 tokens (18.18%)
Shareholder 4: 0x90F...3b906 - 200,000 tokens (36.36%) ⭐ Mayor poder
Shareholder 5: 0x15d...6A65 - 50,000 tokens (9.09%)
```

**Derechos:**

- ✅ Votar en propuestas
- ✅ Crear propuestas (si tienen >1,000 tokens)
- ✅ Delegar su voto a otros
- ✅ Transferir sus tokens

**Importante:** Los tokens NO dan voto automáticamente - hay que delegarlos primero.

---

### 3. **Governor (Gobernador)** 🎯

**¿Qué es?** El cerebro del DAO - gestiona propuestas y votaciones.

**Función:**
Es como un "sistema electoral automatizado" que:

1. Recibe propuestas
2. Gestiona votaciones
3. Cuenta votos
4. Determina si una propuesta pasa o no
5. Envía propuestas aprobadas al Timelock

**Parámetros de Configuración:**

```javascript
Voting Delay: 1 bloque
// Tiempo de espera antes de que comience la votación
// Evita votaciones sorpresa

Voting Period: 50,400 bloques (~1 semana en Ethereum)
// Cuánto tiempo está abierta la votación
// En Anvil (testing) cada bloque es instantáneo

Proposal Threshold: 1,000 tokens
// Mínimo de tokens para crear propuesta
// Evita spam de propuestas

Quorum: 4% del total supply = 22,000 votos
// Mínimo de participación para que sea válida
// Si no se alcanza, la propuesta falla
```

**Estados de una Propuesta:**

```
0 = Pending      - Esperando inicio de votación
1 = Active       - Votación en curso
2 = Canceled     - Cancelada
3 = Defeated     - Rechazada (más votos en contra o no alcanzó quorum)
4 = Succeeded    - Aprobada (tiene mayoría y quorum)
5 = Queued       - En cola en el Timelock
6 = Expired      - Expiró sin ejecutarse
7 = Executed     - Ejecutada exitosamente
```

---

### 4. **Timelock (Candado de Tiempo)** ⏱️

**¿Qué es?** Un sistema de seguridad que retrasa la ejecución de propuestas aprobadas.

**¿Por qué existe?**
Imagina que se aprueba una propuesta maliciosa (robar fondos). El Timelock da tiempo a:

- 🚨 Detectar el problema
- 🛡️ Tomar medidas (hacer fork, alertar)
- 🏃 Salir del DAO si no estás de acuerdo

**Configuración:**

```
Producción: 2 días de delay
Local (Anvil): 1 minuto de delay (para testing)
```

**Flujo:**

```
Propuesta Aprobada → Queue (Timelock) → Espera 2 días → Execute
```

**Roles del Timelock:**

- `PROPOSER_ROLE` - Quién puede poner propuestas en cola (el Governor)
- `EXECUTOR_ROLE` - Quién puede ejecutar (el Governor)
- `ADMIN_ROLE` - Se revoca al deployer (el DAO se auto-gestiona)

---

### 5. **ProposalFactory** 🏭

**¿Qué es?** Una fábrica para crear propuestas complejas de forma eficiente.

**Función:**
Usa el patrón "Clone" (EIP-1167) para crear propuestas:

- ✅ Ahorra ~80% de gas vs deployment normal
- ✅ Cada propuesta es un contrato independiente
- ✅ Todas comparten la misma lógica

**Cuándo se usa:**
Para propuestas complejas con múltiples acciones y seguimiento de estado.

---

## 🔄 Ciclo de Vida de una Propuesta

### **FASE 1: Creación** 📝

**¿Quién puede crear?**
Cualquier shareholder con ≥1,000 tokens delegados.

**¿Qué se necesita?**

```solidity
propose(
  address[] targets,    // Contratos a llamar
  uint256[] values,     // ETH a enviar a cada uno
  bytes[] calldatas,    // Funciones a ejecutar
  string description    // Descripción de la propuesta
)
```

**Ejemplo: Transferir 0.1 ETH**

```javascript
targets = [0x15d3...6A65]              // Destinatario
values = [100000000000000000]          // 0.1 ETH en wei
calldatas = [0x]                       // Sin función (transferencia simple)
description = "Propuesta #1: Bonus shareholder 5"
```

**Resultado:**

- Se genera un `proposalId` único
- Estado inicial: `Pending` (0)
- Se emite evento `ProposalCreated`

---

### **FASE 2: Voting Delay** ⏳

**Duración:** 1 bloque

**¿Por qué?**
Da tiempo a los shareholders para:

- Ver la propuesta
- Analizar el código
- Prepararse para votar

**Estado:** `Pending` (0)

---

### **FASE 3: Votación Activa** 🗳️

**Duración:** 50,400 bloques (~1 semana)

**Estado:** `Active` (1)

**¿Cómo se vota?**

```solidity
castVote(proposalId, support)

support:
  0 = Against (En contra)
  1 = For (A favor)
  2 = Abstain (Abstención)
```

**Reglas de Votación:**

1. **Un voto por shareholder** - No se puede votar dos veces
2. **Peso = Tokens delegados** - Más tokens = más poder
3. **Snapshot en el momento de creación** - Los tokens comprados después no cuentan
4. **Votos son públicos** - Transparencia total

**Ejemplo:**

```
Shareholder 1: Vota "For" con 100,000 tokens
Shareholder 4: Vota "For" con 200,000 tokens
Total: 300,000 votos a favor
```

**Durante este periodo puedes:**

- ✅ Votar
- ✅ Cambiar tu voto (no implementado por defecto)
- ✅ Ver resultados parciales
- ❌ Ejecutar la propuesta

---

### **FASE 4: Fin de Votación - Evaluación** 📊

**El Governor evalúa:**

#### 1. **¿Se alcanzó el Quorum?**

```javascript
Votos_A_Favor + Abstenciones >= 22,000 tokens (4%)

Ejemplo:
For: 300,000 ✅
Abstain: 0
Total participación: 300,000 > 22,000 ✅ QUORUM ALCANZADO
```

#### 2. **¿Hay mayoría a favor?**

```javascript
Votos_A_Favor > Votos_En_Contra

Ejemplo:
For: 300,000
Against: 0
300,000 > 0 ✅ MAYORÍA A FAVOR
```

#### **Resultados Posibles:**

**✅ SUCCEEDED (4) - Aprobada**

```
✅ Quorum alcanzado
✅ Más votos a favor que en contra
→ Puede ir al Timelock
```

**❌ DEFEATED (3) - Rechazada**

```
Razones:
- ❌ No alcanzó quorum
- ❌ Más votos en contra que a favor
- ❌ Empate (se necesita mayoría estricta)
→ La propuesta muere aquí
```

---

### **FASE 5: Queue (En Cola)** 🎯

**Solo si está SUCCEEDED**

**¿Qué pasa?**

```solidity
queue(targets, values, calldatas, descriptionHash)
```

La propuesta se registra en el Timelock con:

- ✅ Timestamp de cuando se puso en cola
- ✅ Delay de 2 días (producción) o 1 minuto (local)
- ✅ Hash de la propuesta para verificación

**Estado:** `Queued` (5)

**Durante el delay:**

- ⏱️ Se debe esperar el tiempo configurado
- 🚨 La comunidad puede detectar problemas
- 🛡️ Hay tiempo para reaccionar si es maliciosa

---

### **FASE 6: Ejecución** ⚡

**Después del delay:**

```solidity
execute(targets, values, calldatas, descriptionHash)
```

**¿Qué ocurre?**

1. Timelock verifica que pasó el delay
2. Timelock verifica que la propuesta es la correcta (hash)
3. Se ejecutan las acciones:
   ```
   Para cada target[i]:
     - Se envía values[i] ETH
     - Se ejecuta calldatas[i]
   ```

**Ejemplo de nuestra propuesta:**

```javascript
target[0] = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
value[0] = 0.1 ETH
calldata[0] = 0x (transferencia simple)

Resultado:
→ Timelock transfiere 0.1 ETH a Shareholder 5
```

**Estado final:** `Executed` (7)

**Posibles errores:**

- ❌ Timelock no tiene suficiente ETH
- ❌ El contrato target rechaza la llamada
- ❌ Gas insuficiente
  → La propuesta falla pero no se puede volver a ejecutar

---

## 👥 Roles y Actores

### **1. Shareholders (Accionistas)**

**Responsabilidades:**

- 📖 Leer y entender propuestas
- 🗳️ Votar informadamente
- 💬 Participar en discusiones
- 🎯 Proponer mejoras

**Poder:**

```
Poder de voto = Tokens delegados al momento del snapshot

Ejemplo:
Alice: 50,000 tokens → 50,000 votos
Bob: 100,000 tokens → 100,000 votos (doble poder que Alice)
```

---

### **2. Governor (Sistema)**

**Responsabilidades:**

- ✅ Validar requisitos (threshold, quorum)
- ✅ Gestionar estados de propuestas
- ✅ Contar votos correctamente
- ✅ Interactuar con Timelock

**NO puede:**

- ❌ Censurar propuestas
- ❌ Cambiar resultados
- ❌ Ejecutar sin quorum/mayoría

---

### **3. Timelock (Guardián)**

**Responsabilidades:**

- ⏱️ Aplicar delay de seguridad
- 🔒 Custodiar fondos del DAO
- ✅ Ejecutar solo propuestas aprobadas
- 🛡️ Proteger contra ataques

**Poderes:**

- 💰 Controla la tesorería del DAO
- 🎯 Única entidad que puede ejecutar propuestas
- 🔑 Owner del DAOToken

---

### **4. ProposalFactory (Opcional)**

**Responsabilidades:**

- 🏭 Crear propuestas complejas eficientemente
- 📊 Tracking de propuestas
- 💾 Storage de metadata

---

## 🗳️ Sistema de Votación

### **Delegación de Votos**

**¿Por qué es necesaria?**
Los tokens NO dan voto automáticamente. Hay que "activarlos".

**¿Cómo funciona?**

```solidity
// Delegar a ti mismo (lo más común)
token.delegate(miDireccion)

// Delegar a otra persona (voto por representante)
token.delegate(direccionRepresentante)
```

**Efecto:**

```javascript
ANTES de delegar:
token.balanceOf(Alice) = 100,000
token.getVotes(Alice) = 0  ❌ No puede votar

DESPUÉS de delegar a sí misma:
token.balanceOf(Alice) = 100,000
token.getVotes(Alice) = 100,000  ✅ Puede votar
```

**Casos de uso:**

1. **Self-delegation:** "Yo quiero votar con mis tokens"
2. **Delegation to representative:** "Confío en Bob, que vote por mí"
3. **Split delegation:** No soportado por defecto (todos los tokens van juntos)

---

### **Snapshot de Votos**

**Concepto clave:** El poder de voto se "congela" al crear la propuesta.

**¿Por qué?**
Evita manipulación:

```
❌ SIN snapshot:
1. Se crea propuesta
2. Alguien compra 1 millón de tokens
3. Vota y controla el resultado
4. Vende los tokens
→ MANIPULACIÓN

✅ CON snapshot:
1. Se crea propuesta en bloque 100
2. Solo cuentan tokens delegados en bloque 100
3. Tokens comprados después no cuentan
→ SEGURO
```

---

### **Tipos de Voto**

```javascript
0 = Against (En contra)
  - Cuenta como oposición activa
  - Afecta el resultado

1 = For (A favor)
  - Apoya la propuesta
  - Cuenta para quorum

2 = Abstain (Abstención)
  - "No tengo opinión fuerte"
  - Cuenta para quorum (participación)
  - NO afecta el resultado (ni a favor ni en contra)
```

**Ejemplo de cálculo:**

```
Total supply: 550,000 tokens
Quorum needed: 22,000 tokens (4%)

Votación:
For: 250,000
Against: 50,000
Abstain: 150,000

Análisis:
✅ Participación = 250k + 50k + 150k = 450,000 > 22,000 quorum
✅ Mayoría = 250,000 (For) > 50,000 (Against)
→ PROPUESTA APROBADA
```

---

### **¿Quién Gana?**

**Regla simple:**

```
Propuesta APROBADA si:
  ✅ (For + Abstain) >= Quorum
  Y
  ✅ For > Against
```

**Casos especiales:**

**Empate:**

```
For: 100,000
Against: 100,000
→ RECHAZADA (se necesita mayoría estricta)
```

**Mayoría pero sin quorum:**

```
Quorum: 22,000
For: 15,000
Against: 0
→ RECHAZADA (no alcanza quorum)
```

**Abstenciones masivas:**

```
For: 20,000
Against: 0
Abstain: 200,000
→ APROBADA (quorum se alcanza con abstenciones)
```

---

## ⚙️ Ejecución de Propuestas

### **¿Qué puede hacer una propuesta?**

**1. Transferir ETH**

```javascript
targets: [0x123...]
values: [1000000000000000000]  // 1 ETH
calldatas: [0x]

Resultado: Envía 1 ETH a 0x123...
```

**2. Llamar función en contrato**

```javascript
targets: [tokenAddress]
values: [0]
calldatas: [encodedFunction("mint(address,uint256)", receiver, amount)]

Resultado: Mintea tokens nuevos
```

**3. Acciones múltiples**

```javascript
targets: [tokenAddress, recipientAddress]
values: [0, 500000000000000000]  // 0.5 ETH
calldatas: [
  encodedFunction("burn(uint256)", 1000),
  0x
]

Resultado:
1. Quema 1000 tokens
2. Envía 0.5 ETH a recipient
```

**4. Cambiar parámetros del DAO**

```javascript
targets: [governorAddress]
values: [0]
calldatas: [encodedFunction("setVotingDelay(uint256)", 7200)]

Resultado: Cambia el voting delay
```

---

### **Seguridad en la Ejecución**

**Timelock verifica:**

```
✅ ¿La propuesta fue aprobada?
✅ ¿Pasó el delay requerido?
✅ ¿El hash de la propuesta es correcto?
✅ ¿No ha expirado (30 días)?
✅ ¿No fue ejecutada ya?
```

**Si todo está bien:**

```javascript
for (i = 0; i < targets.length; i++) {
  targets[i].call{value: values[i]}(calldatas[i])
}
```

---

## 📖 Ejemplo Práctico Completo

### **Escenario: Pagar bonus a un shareholder**

#### **PASO 0: Estado Inicial**

```
Timelock balance: 1 ETH
Shareholder 5 balance: 10 ETH
Total supply: 550,000 tokens
```

#### **PASO 1: Preparación**

```bash
# Shareholder 1 delega sus votos
cast send <TOKEN> "delegate(address)" <SHAREHOLDER_1> \
  --private-key <KEY_1>

# Resultado:
Shareholder 1 voting power: 0 → 100,000 ✅
```

#### **PASO 2: Creación de Propuesta**

```bash
# Shareholder 1 crea propuesta
cast send <GOVERNOR> "propose(...)" \
  "[<SHAREHOLDER_5>]" \
  "[100000000000000000]" \  # 0.1 ETH
  "[0x]" \
  "Bonus para Shareholder 5"

# Resultado:
Proposal ID: 0xcf55...8f538
Estado: Pending (0)
Bloque actual: 100
```

#### **PASO 3: Voting Delay**

```bash
# Esperar 1 bloque
cast rpc anvil_mine 1

# Resultado:
Bloque actual: 101
Estado: Active (1) ✅
```

#### **PASO 4: Votación**

```bash
# Shareholder 1 vota a favor
cast send <GOVERNOR> "castVote(uint256,uint8)" \
  <PROPOSAL_ID> 1 --private-key <KEY_1>

# Shareholder 4 también vota a favor
cast send <GOVERNOR> "castVote(uint256,uint8)" \
  <PROPOSAL_ID> 1 --private-key <KEY_4>

# Resultado:
For: 300,000 votos (100k + 200k)
Against: 0
Abstain: 0
```

#### **PASO 5: Consultar Votos**

```bash
cast call <GOVERNOR> "proposalVotes(uint256)" <PROPOSAL_ID>

# Resultado decodificado:
againstVotes: 0
forVotes: 300,000,000,000,000,000,000,000 (300k tokens)
abstainVotes: 0

# Análisis:
✅ Quorum: 300,000 > 22,000 (13.6x el mínimo)
✅ Mayoría: 300,000 > 0
```

#### **PASO 6: Cerrar Votación**

```bash
# Avanzar 50,400 bloques
cast rpc anvil_mine 50401

# Verificar estado
cast call <GOVERNOR> "state(uint256)" <PROPOSAL_ID>

# Resultado:
Estado: 4 (Succeeded) ✅
```

#### **PASO 7: Queue en Timelock**

```bash
cast send <GOVERNOR> "queue(...)" \
  "[<SHAREHOLDER_5>]" \
  "[100000000000000000]" \
  "[0x]" \
  <DESCRIPTION_HASH>

# Resultado:
Estado: Queued (5)
Execution time: Now + 1 minute
```

#### **PASO 8: Esperar Delay**

```bash
# En local: esperar 1 minuto
sleep 61

# O avanzar tiempo en Anvil
cast rpc evm_increaseTime 61
cast rpc anvil_mine 1
```

#### **PASO 9: Ejecutar**

```bash
cast send <GOVERNOR> "execute(...)" \
  "[<SHAREHOLDER_5>]" \
  "[100000000000000000]" \
  "[0x]" \
  <DESCRIPTION_HASH>

# Resultado:
Estado: Executed (7) ✅
Evento: ProposalExecuted emitido
```

#### **PASO 10: Verificar Resultado**

```bash
# Balance de Shareholder 5
cast balance <SHAREHOLDER_5>

# Resultado:
ANTES: 10 ETH
DESPUÉS: 10.1 ETH ✅

# Balance del Timelock
cast balance <TIMELOCK>

# Resultado:
ANTES: 1 ETH
DESPUÉS: 0.9 ETH ✅
```

---

## 🎯 Puntos Clave para Recordar

### **1. Tokens ≠ Votos Automáticos**

```
❌ Tener tokens
✅ Tener tokens + Delegarlos = Poder de voto
```

### **2. El Snapshot es Crítico**

```
Solo cuentan tokens delegados ANTES de crear la propuesta
```

### **3. Quorum es Participación Mínima**

```
No basta con votos a favor
Debe haber suficiente participación total
```

### **4. Timelock es Seguridad**

```
Delay obligatorio antes de ejecutar
Tiempo para reaccionar a propuestas maliciosas
```

### **5. Propuestas son Código**

```
Una propuesta puede hacer CUALQUIER cosa que el Timelock pueda hacer
Es crítico revisar el código antes de votar
```

---

## 📚 Glosario

| Término         | Significado                               |
| --------------- | ----------------------------------------- |
| **DAO**         | Organización gobernada por código y votos |
| **Shareholder** | Poseedor de tokens del DAO                |
| **Governor**    | Contrato que gestiona propuestas y votos  |
| **Timelock**    | Delay de seguridad antes de ejecutar      |
| **Proposal**    | Sugerencia de acción para el DAO          |
| **Quorum**      | Participación mínima requerida            |
| **Threshold**   | Tokens mínimos para crear propuesta       |
| **Delegation**  | Asignar poder de voto                     |
| **Snapshot**    | Foto del estado en un bloque específico   |
| **Execute**     | Llevar a cabo una propuesta aprobada      |

---

## 🔗 Recursos Adicionales

- [OpenZeppelin Governor Docs](https://docs.openzeppelin.com/contracts/4.x/governance)
- [EIP-20: Token Standard](https://eips.ethereum.org/EIPS/eip-20)
- [EIP-2612: Permit](https://eips.ethereum.org/EIPS/eip-2612)
- [Compound Governance](https://compound.finance/governance)
- [Tally - Governance UI](https://www.tally.xyz/)

---

**💡 Próximo paso:** Experimenta creando propuestas reales en Anvil con el script `test-dao-with-cast.sh`
