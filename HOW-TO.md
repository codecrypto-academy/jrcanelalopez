# Guia Didactica: Redes Privadas con Hyperledger Besu

**Autor:** Javier Ruiz-Canela Lopez
**Email:** jrcanelalopez@gmail.com
**Fecha:** 28 de Octubre, 2025

---

## 1. Introduccion: Que es una Red Besu Privada?

Una red Besu privada es como crear tu propia version de Ethereum, pero completamente controlada por ti y accesible solo para las personas que tu autorices.

Imagina que Ethereum publica es como Internet: cualquiera puede acceder. Una red Besu privada seria como tu propia red interna de oficina: solo los computadores que tu conectes pueden participar.

**Hyperledger Besu** es un software que permite crear estas redes privadas. Es como tener tu propia blockchain personal donde tu decides:
- Quien puede participar
- Como se validan las transacciones
- Que tan rapido se crean los bloques
- Cuanta criptomoneda tiene cada cuenta

### Por que usar una red privada?

**Ventajas:**
- **Control total**: Tu decides las reglas del juego
- **Privacidad**: Solo los participantes autorizados ven las transacciones
- **Velocidad**: Al tener menos nodos, las transacciones son mas rapidas
- **Costos**: No hay tarifas de gas reales (puedes usar ETH de prueba gratis)
- **Testing**: Perfecto para probar aplicaciones sin riesgo

**Casos de uso:**
- Desarrollo y pruebas de smart contracts
- Redes corporativas entre empresas asociadas
- Sistemas de trazabilidad interna
- Ambientes de formacion y educacion

---

## 2. Conceptos Basicos

### Que es Blockchain?

Piensa en blockchain como un libro de contabilidad compartido donde:

```
[BLOQUE 1] -> [BLOQUE 2] -> [BLOQUE 3] -> [BLOQUE 4] ...
    |              |              |             |
  10 trans.      15 trans.      8 trans.    12 trans.
```

- Cada **bloque** es como una pagina del libro
- Cada pagina contiene varias **transacciones** (movimientos de dinero)
- Las paginas estan encadenadas: no puedes arrancar una sin que se note
- Todos tienen una copia del mismo libro

**Ejemplo del mundo real:**

Imagina un grupo de amigos llevando cuenta de quien debe dinero a quien. En lugar de que uno solo lleve las cuentas (y pueda hacer trampa), todos tienen una copia del mismo cuaderno. Cuando alguien hace un pago, todos actualizan su cuaderno. Si alguien intenta modificar su copia, los demas notaran que no coincide.

### Red Publica vs Red Privada

**Red Publica (Ethereum):**
```
     Internet
        |
   [Cualquiera puede unirse]
        |
[Miles de nodos en todo el mundo]
```
- Abierta para todos
- No requiere permiso
- Muy segura pero mas lenta
- Costos reales (gas fees)

**Red Privada (Besu):**
```
   Red Corporativa
        |
  [Solo invitados]
        |
[Pocos nodos controlados]
```
- Cerrada y controlada
- Requiere autorizacion
- Mas rapida y eficiente
- Sin costos reales

### Por que usar Hyperledger Besu?

Besu destaca porque:

1. **Compatible con Ethereum**: Puedes usar las mismas herramientas y contratos
2. **Flexible**: Soporta multiples algoritmos de consenso
3. **Open Source**: Codigo abierto y gratuito
4. **Enterprise Ready**: Preparado para uso empresarial
5. **Bien documentado**: Comunidad activa y soporte

---

## 3. Componentes de una Red Privada

### A. Tipos de Nodos

Una red Besu puede tener diferentes tipos de nodos, cada uno con un proposito especifico:

#### 1. Bootnode (Nodo de Arranque)

**Analogia:** Es como el director de una escuela que da la bienvenida a nuevos estudiantes y les dice donde esta cada salon.

**Funcion:**
- Punto de entrada a la red
- Facilita que los nodos se encuentren entre si
- No participa en la validacion de transacciones
- Siempre debe estar disponible

**Configuracion tipica:**
```
Nombre: bootnode1
IP: 172.30.0.20
Puerto RPC: 8545
Puerto P2P: 30303
```

**Cuando necesitas bootnodes:**
- Minimo 1 bootnode para cualquier red
- 2+ bootnodes para alta disponibilidad en produccion

#### 2. Miner (Minero) - Solo en Consenso Clique

**Analogia:** Es como un notario que certifica y firma documentos oficiales.

**Funcion:**
- Crea nuevos bloques de transacciones
- "Firma" los bloques para validarlos
- Mantiene la blockchain activa
- Requiere una cuenta firmante (signerAccount)

**Configuracion tipica:**
```
Nombre: miner1
IP: 172.30.0.21
Puerto RPC: 8546
Tipo: miner
SignerAddress: 0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9
```

**Regla critica en Clique:**
Cada miner DEBE tener exactamente UN signerAccount asociado. Esta es una regla fundamental que no puede violarse.

#### 3. RPC Node (Nodo de Consulta)

**Analogia:** Es como un asistente de biblioteca que te ayuda a buscar informacion pero no puede modificar los libros.

**Funcion:**
- Proporciona acceso a la blockchain via API
- Responde consultas (balances, transacciones, etc.)
- No crea bloques ni valida
- Punto de conexion para aplicaciones externas

**Configuracion tipica:**
```
Nombre: rpc1
IP: 172.30.0.22
Puerto RPC: 8547
Tipo: rpc
```

**Cuando necesitas RPC nodes:**
- Para cada aplicacion que se conecta a la blockchain
- Para distribuir la carga de consultas
- Para tener redundancia de acceso

#### 4. Node / Validator (Nodo Observador/Validador)

**Analogia:** Es como un testigo en un juicio: observa, verifica y puede dar fe de lo que ve.

**Funcion:**
- En IBFT2/QBFT: Valida y vota sobre bloques
- Mantiene copia completa de la blockchain
- Participa en el consenso
- Proporciona redundancia

**Configuracion tipica:**
```
Nombre: validator1
IP: 172.30.0.23
Puerto RPC: 8548
Tipo: node
```

### B. Genesis File (Archivo Genesis)

**Que es?**

El archivo genesis es como el "acta de fundacion" de tu blockchain. Define las reglas iniciales y NO puede modificarse despues de crear la red.

**Analogia:** Es como la constitucion de un pais: establece las reglas fundamentales al inicio y no se puede cambiar facilmente despues.

**Que contiene el genesis?**

```json
{
  "config": {
    "chainId": 1337,              // ID unico de tu red
    "constantinopleBlock": 0,      // Caracteristicas de Ethereum activadas
    "clique": {                    // Configuracion del consenso
      "blockperiodseconds": 5,     // Tiempo entre bloques
      "epochlength": 30000         // Periodo de reorganizacion
    }
  },
  "gasLimit": "0x47E7C4",         // Limite de gas por bloque
  "alloc": {                       // Cuentas con balance inicial
    "0x742d35Cc...": {
      "balance": "1000000000000000000000"  // Balance en wei
    }
  },
  "extraData": "0x000...742d35..."  // Lista de validadores iniciales
}
```

**Informacion clave:**

1. **chainId**: Identifica tu red de forma unica (como el codigo postal de una ciudad)
2. **gasLimit**: Cuantas operaciones caben en un bloque (como la capacidad de un autobus)
3. **alloc**: Cuentas con dinero inicial (como el presupuesto inicial de una empresa)
4. **extraData**: En Clique, lista las direcciones de los mineros autorizados

**Regla de oro:** Una vez creada la red con un genesis, este NO puede modificarse. Si necesitas cambios fundamentales, debes crear una red nueva.

### C. Consenso: Como se Ponen de Acuerdo los Nodos

El consenso es el mecanismo que usan los nodos para ponerse de acuerdo sobre cual es el estado "verdadero" de la blockchain.

#### Clique (Proof of Authority - PoA)

**Analogia del mundo real:**

Imagina un club exclusivo donde solo ciertos miembros tienen llaves. Los miembros se turnan para cerrar la puerta al final del dia (crear un bloque). Si alguien no esta autorizado, su "cierre" no cuenta.

**Como funciona:**

```
Tiempo ->  T0    T1    T2    T3    T4    T5
Turno ->  [A] -> [B] -> [C] -> [A] -> [B] -> [C]
          Miner1 Miner2 Miner3 Miner1 Miner2 Miner3
```

- Los miners se turnan para crear bloques
- Cada miner firma su bloque con su clave privada
- Los demas nodos verifican la firma
- Si la firma es valida, aceptan el bloque

**Ventajas:**
- Muy rapido (bloques cada pocos segundos)
- Bajo consumo de recursos (no hay mineria)
- Predecible y estable
- Perfecto para desarrollo

**Desventajas:**
- Centralizado (solo los miners autorizados)
- Menos seguro que PoW (menos nodos = menos seguridad)

**Configuracion minima:**
- 1 bootnode (para descubrimiento)
- 1 miner (para crear bloques)

**Configuracion recomendada para produccion:**
- 2 bootnodes (redundancia)
- 3-5 miners (tolerancia a fallos)
- N RPC nodes (segun necesidad)

**Regla fundamental de Clique:**

```typescript
// Cada miner necesita exactamente UN signerAccount

// CORRECTO:
signerAccounts: [
  { address: '0x742d35...', weiAmount: '1000...' }
]
nodes: [
  { name: 'miner1', type: 'miner',
    signerAddress: '0x742d35...' }  // Misma direccion
]

// INCORRECTO:
nodes: [
  { name: 'miner1', type: 'miner' }  // Falta signerAddress!
]
```

#### QBFT (Quorum Byzantine Fault Tolerant)

**Analogia del mundo real:**

Imagina un comite de jueces donde se necesita que la mayoria este de acuerdo para tomar una decision. Incluso si algunos jueces son corruptos o estan ausentes, si hay suficientes honestos, la decision sera correcta.

**Como funciona:**

```
Propuesta de Bloque:
Nodo 1 propone: [Bloque X]
    |
    v
Votacion:
[Nodo 1: SI] [Nodo 2: SI] [Nodo 3: SI] [Nodo 4: NO]
    |
    v
Resultado: 75% a favor -> Bloque aceptado
```

1. Un validador propone un bloque
2. Los demas validadores votan
3. Si 2/3 + 1 votan a favor, el bloque se acepta
4. El bloque se añade a la cadena

**Ventajas:**
- Tolerante a fallos bizantinos (algunos nodos pueden fallar o ser maliciosos)
- Mas descentralizado que Clique
- Finalizacion rapida (bloques confirmados rapidamente)
- Enterprise-ready

**Formula de tolerancia:**

```
Nodos necesarios para tolerar F fallos: 3F + 1

Ejemplos:
- Tolerar 1 fallo: 3(1) + 1 = 4 validadores
- Tolerar 2 fallos: 3(2) + 1 = 7 validadores
- Tolerar 3 fallos: 3(3) + 1 = 10 validadores
```

**Configuracion minima:**
- 1 bootnode
- 4 validadores (tolerancia a 1 fallo)

**Configuracion recomendada:**
- 2 bootnodes
- 7 validadores (tolerancia a 2 fallos)
- N RPC nodes

#### IBFT2 (Istanbul Byzantine Fault Tolerant 2.0)

**Similitud con QBFT:** Es muy parecido a QBFT pero con algunas diferencias tecnicas en el protocolo de consenso.

**Cuando usar cada uno:**

| Caracteristica | Clique | QBFT | IBFT2 |
|---------------|--------|------|-------|
| Velocidad | Muy rapido | Rapido | Rapido |
| Tolerancia a fallos | Baja | Alta | Alta |
| Nodos minimos | 2 (1 boot + 1 miner) | 5 (1 boot + 4 val) | 5 (1 boot + 4 val) |
| Complejidad | Baja | Media | Media |
| Uso recomendado | Desarrollo/Testing | Produccion | Produccion |

### D. Cuentas y Balances

#### Tipos de Cuentas

**1. Cuentas Normales (Accounts)**

Son cuentas que simplemente tienen un balance inicial:

```typescript
accounts: [
  {
    address: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
    weiAmount: '1000000000000000000000'  // 1000 ETH
  }
]
```

**Uso:**
- Cuentas de usuario
- Fondos para aplicaciones
- Cuentas de prueba

**2. Cuentas Firmantes (SignerAccounts)**

Son cuentas especiales que firman bloques en consenso Clique:

```typescript
signerAccounts: [
  {
    address: '0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9',
    weiAmount: '100000000000000000000000',  // 100,000 ETH
    minerNode: 'miner1'  // Nodo asociado
  }
]
```

**Caracteristicas:**
- Tienen clave privada generada automaticamente
- Se asocian a un nodo miner especifico
- Firman bloques criptograficamente
- Necesitan balance para pagar gas

#### Formato de Cantidades (Wei)

Ethereum usa "wei" como unidad minima (como los centavos son a los euros):

```
1 ETH = 1,000,000,000,000,000,000 wei (18 ceros)

Ejemplos:
- 1 ETH     = 1000000000000000000 wei
- 0.1 ETH   = 100000000000000000 wei
- 1000 ETH  = 1000000000000000000000 wei
```

**Conversion rapida:**

```typescript
// De ETH a Wei
function ethToWei(eth: string): string {
  return (parseFloat(eth) * 1e18).toString();
}

ethToWei("1.5")    // "1500000000000000000"
ethToWei("1000")   // "1000000000000000000000"
```

---

## 4. Como Funciona (Paso a Paso)

Veamos como se crea y opera una red Besu desde cero:

### Paso 1: Definir la Configuracion de Red

```typescript
const config = {
  name: 'mi-primera-red',          // Nombre descriptivo
  chainId: 1337,                    // ID unico
  subnet: '172.30.0.0/16',         // Rango de IPs internas
  consensus: 'clique',              // Algoritmo de consenso
  gasLimit: '0x1fffffffffffff',    // Limite de gas
  blockTime: 5,                     // Segundos entre bloques

  // Cuenta firmante para el miner
  signerAccounts: [
    {
      address: '0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9',
      weiAmount: '100000000000000000000000'
    }
  ]
};
```

### Paso 2: Definir la Topologia de Nodos

```typescript
const nodos = [
  // Bootnode: Punto de entrada
  {
    name: 'bootnode1',
    ip: '172.30.0.20',
    rpcPort: 8545,
    type: 'bootnode'
  },

  // Miner: Crea los bloques
  {
    name: 'miner1',
    ip: '172.30.0.21',
    rpcPort: 8546,
    type: 'miner',
    signerAddress: '0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9'
  },

  // RPC: Acceso para aplicaciones
  {
    name: 'rpc1',
    ip: '172.30.0.22',
    rpcPort: 8547,
    type: 'rpc'
  }
];
```

### Paso 3: Generacion Automatica de Infraestructura

Cuando ejecutas `network.create()`, esto es lo que sucede internamente:

```
1. Validar configuracion
   |
   v
2. Generar claves criptograficas
   - Clave privada para cada signerAccount
   - Par de claves para cada nodo (enode)
   |
   v
3. Crear archivo genesis.json
   - Configurar consenso
   - Asignar balances iniciales
   - Listar validadores autorizados
   |
   v
4. Generar archivos de configuracion
   - config.toml para cada nodo
   - Parametros de red especificos
   |
   v
5. Crear red Docker
   - Red virtual con subnet especificado
   - Aislamiento de la red
   |
   v
6. Preparar volumenes
   - Directorios para datos de cada nodo
   - Archivos de configuracion montados
```

### Paso 4: Inicio de la Red

```typescript
await network.start();
```

**Secuencia de inicio:**

```
T=0s: Iniciar contenedores Docker
      [bootnode1] [miner1] [rpc1]

T=5s: Bootnode establece identidad
      bootnode1: enode://abc123...@172.30.0.20:30303

T=10s: Nodos se conectan al bootnode
       miner1 -> busca peers via bootnode1
       rpc1   -> busca peers via bootnode1

T=15s: Descubrimiento de peers
       [bootnode1] <-> [miner1] <-> [rpc1]

T=20s: Sincronizacion inicial
       Todos los nodos tienen genesis block

T=25s: Miner comienza a producir bloques
       Bloque 1 -> Bloque 2 -> Bloque 3 ...

T=30s: Red completamente operativa
```

### Paso 5: Como se Producen los Bloques

En consenso **Clique**:

```
Ciclo de produccion de bloques:

1. Miner recoge transacciones pendientes
   [TX1, TX2, TX3, TX4, TX5] -> Pool

2. Miner crea un bloque candidato
   Bloque N = {
     numero: N,
     transacciones: [TX1, TX2, TX3],
     timestamp: ahora,
     parentHash: hash(Bloque N-1)
   }

3. Miner firma el bloque
   Firma = sign(Bloque N, clave_privada_miner)

4. Miner propaga el bloque
   [miner1] --broadcast--> [bootnode1, rpc1]

5. Otros nodos validan el bloque
   - Verificar firma: valid(Firma, address_miner)?
   - Verificar hash: hash(Bloque N) correcto?
   - Verificar transacciones: validas?

6. Nodos aceptan el bloque
   [Blockchain] <- Agregar Bloque N

7. Esperar blockTime segundos
   sleep(5 segundos)

8. Repetir desde paso 1
```

En consenso **QBFT**:

```
Ciclo de produccion (mas complejo):

1. Validador propone bloque
   Validator1: "Propongo Bloque N con [TX1, TX2, TX3]"

2. Pre-votacion (Pre-Prepare)
   Validator1 -> [Validator2, Validator3, Validator4]

3. Votacion (Prepare)
   Validator2: "OK, acepto propuesta"
   Validator3: "OK, acepto propuesta"
   Validator4: "OK, acepto propuesta"

4. Contar votos
   Total: 4 votos, necesarios: 3 (2/3 + 1)
   Resultado: Aceptado (4 >= 3)

5. Confirmacion (Commit)
   Todos los validadores: "Committing Bloque N"

6. Bloque añadido
   [Blockchain] <- Bloque N (finalizado)

7. Siguiente ronda
   Validator2 es el siguiente proposer
```

### Paso 6: Como se Validan las Transacciones

```
Usuario envia transaccion:

1. Crear transaccion
   TX = {
     from: '0xAAA...',
     to: '0xBBB...',
     value: 10 ETH,
     gasLimit: 21000,
     nonce: 5
   }

2. Firmar con clave privada
   TX_signed = sign(TX, clave_privada_usuario)

3. Enviar a un nodo RPC
   curl -X POST http://localhost:8547/
        -d '{"method": "eth_sendRawTransaction", ...}'

4. Nodo valida transaccion
   - Saldo suficiente? balance(0xAAA) >= 10 ETH
   - Nonce correcto? nonce == nonce_esperado
   - Firma valida? verify(TX_signed, 0xAAA)
   - Gas suficiente? gasLimit >= gas_necesario

5. Agregar a pool de transacciones
   [Pool de TX] <- TX_signed

6. Miner incluye TX en proximo bloque
   Bloque N+1 = [..., TX_signed, ...]

7. Bloque se propaga y acepta
   TX confirmada en Bloque N+1

8. Estado se actualiza
   balance(0xAAA) -= 10 ETH
   balance(0xBBB) += 10 ETH
```

---

## 5. Consenso Explicado con Analogias

### Clique: El Sistema de Turnos Rotativos

**Analogia:**

Imagina una oficina con una maquina de cafe que debe ser limpiada cada hora. Hay 3 empleados responsables (miners) que se turnan:

```
9:00 AM -> Juan limpia la maquina    (Miner 1 crea bloque)
10:00 AM -> Maria limpia la maquina  (Miner 2 crea bloque)
11:00 AM -> Pedro limpia la maquina  (Miner 3 crea bloque)
12:00 PM -> Juan limpia la maquina   (Miner 1 crea bloque)
...y asi sucesivamente
```

**Caracteristicas:**

- Solo los empleados autorizados pueden limpiar (solo miners autorizados)
- Cada uno firma un registro al terminar (firma criptografica)
- Si alguien no puede, otro debe hacerlo (tolerancia a fallos basica)
- Es rapido y predecible

**Ventajas:**
- Muy rapido
- Simple de entender y configurar
- Bajo consumo de recursos

**Desventajas:**
- Si todos los miners fallan, la red se detiene
- Centralizado (pocos miners controlados)

### QBFT: La Votacion por Mayoria

**Analogia:**

Imagina un jurado de 7 personas que debe decidir si aceptar o rechazar una propuesta:

```
Juez principal propone: "Aceptemos el documento X"

Votacion:
[Juez 1: A favor]  [Juez 2: A favor]  [Juez 3: A favor]
[Juez 4: A favor]  [Juez 5: En contra] [Juez 6: A favor]
[Juez 7: Ausente]

Resultado: 5 de 7 votan a favor (71%)
Necesario: 2/3 = 4.66... -> Se necesitan 5 votos
Conclusion: Propuesta ACEPTADA
```

**Caracteristicas:**

- Se necesita 2/3 + 1 de votos para aprobar
- Puede tolerar hasta 1/3 de nodos maliciosos o caidos
- Mas descentralizado que Clique
- Confirmacion rapida y definitiva

**Formula magica:**

```
Para tolerar F nodos malos: necesitas 3F + 1 nodos totales

Ejemplos:
- Quieres tolerar 1 nodo malo -> necesitas 4 nodos (3*1 + 1)
- Quieres tolerar 2 nodos malos -> necesitas 7 nodos (3*2 + 1)
- Quieres tolerar 3 nodos malos -> necesitas 10 nodos (3*3 + 1)
```

**Ventajas:**
- Tolerante a fallos bizantinos
- Finalizacion rapida
- Mas seguro que Clique

**Desventajas:**
- Mas complejo de configurar
- Necesita mas nodos (minimo 4)
- Mas overhead de comunicacion

### Cuando Usar Cada Uno

**Usa Clique si:**
- Estas en desarrollo/testing
- Necesitas maxima velocidad
- Confias en todos los nodos
- Quieres simplicidad
- Red pequeña (1-5 nodos)

**Usa QBFT si:**
- Estas en produccion
- Necesitas tolerancia a fallos
- No confias al 100% en todos los nodos
- Quieres descentralizacion
- Red mediana/grande (7+ nodos)

**Tabla comparativa:**

| Criterio | Clique | QBFT |
|----------|--------|------|
| Velocidad de bloques | 1-5 segundos | 2-10 segundos |
| Nodos minimos | 1 miner + 1 bootnode | 4 validadores + 1 bootnode |
| Tolerancia a fallos | Baja | Alta (1/3 nodos) |
| Complejidad setup | Baja | Media |
| Uso CPU/RAM | Bajo | Medio |
| Seguridad | Media | Alta |
| Ambiente | Desarrollo | Produccion |

---

## 6. Ejemplos Practicos

### Ejemplo 1: Red de Desarrollo Simple

**Objetivo:** Crear la red mas simple posible para desarrollo local.

**Topologia:**
```
[bootnode1] <--> [miner1]
   (8545)         (8546)
```

**Configuracion:**

```typescript
const config = {
  name: 'dev-network',
  chainId: 1337,
  subnet: '172.20.0.0/16',
  consensus: 'clique',
  gasLimit: '0x1fffffffffffff',
  blockTime: 5,

  signerAccounts: [
    {
      address: '0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9',
      weiAmount: '100000000000000000000000'  // 100,000 ETH
    }
  ]
};

const network = new BesuNetwork(config);

await network.create({
  nodes: [
    {
      name: 'bootnode1',
      ip: '172.20.0.10',
      rpcPort: 8545,
      type: 'bootnode'
    },
    {
      name: 'miner1',
      ip: '172.20.0.11',
      rpcPort: 8546,
      type: 'miner',
      signerAddress: '0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9'
    }
  ],
  autoResolveSubnetConflicts: true
});

await network.start();
```

**Uso:**
- Conecta tu app en http://localhost:8545 o http://localhost:8546
- Usa la cuenta `0x742d35...` para enviar transacciones
- Bloques se crean cada 5 segundos automaticamente

### Ejemplo 2: Red de Produccion

**Objetivo:** Red robusta para ambiente de produccion con alta disponibilidad.

**Topologia:**
```
        [bootnode1]
        /    |     \
       /     |      \
  [miner1] [miner2] [miner3]
       \     |      /
        \    |     /
      [rpc1] [rpc2] [rpc3]
```

**Configuracion:**

```typescript
const prodConfig = {
  name: 'production-network',
  chainId: 2024,
  subnet: '172.50.0.0/16',
  consensus: 'clique',
  gasLimit: '0x1fffffffffffff',
  blockTime: 3,  // Bloques mas rapidos

  signerAccounts: [
    {
      address: '0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9',
      weiAmount: '100000000000000000000000'
    },
    {
      address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
      weiAmount: '100000000000000000000000'
    },
    {
      address: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
      weiAmount: '100000000000000000000000'
    }
  ]
};

const network = new BesuNetwork(prodConfig);

await network.create({
  nodes: [
    // Bootnodes para redundancia
    {
      name: 'bootnode1',
      ip: '172.50.0.10',
      rpcPort: 8545,
      type: 'bootnode'
    },
    {
      name: 'bootnode2',
      ip: '172.50.0.11',
      rpcPort: 8555,
      type: 'bootnode'
    },

    // Miners para crear bloques
    {
      name: 'miner1',
      ip: '172.50.0.20',
      rpcPort: 8546,
      type: 'miner',
      signerAddress: '0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9'
    },
    {
      name: 'miner2',
      ip: '172.50.0.21',
      rpcPort: 8547,
      type: 'miner',
      signerAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
    },
    {
      name: 'miner3',
      ip: '172.50.0.22',
      rpcPort: 8548,
      type: 'miner',
      signerAddress: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0'
    },

    // RPC nodes para aplicaciones
    {
      name: 'rpc1',
      ip: '172.50.0.30',
      rpcPort: 8549,
      type: 'rpc'
    },
    {
      name: 'rpc2',
      ip: '172.50.0.31',
      rpcPort: 8550,
      type: 'rpc'
    },
    {
      name: 'rpc3',
      ip: '172.50.0.32',
      rpcPort: 8551,
      type: 'rpc'
    }
  ],
  autoResolveSubnetConflicts: true
});

await network.start();
```

**Ventajas de esta configuracion:**

- **Alta disponibilidad**: Si un bootnode falla, el otro sigue funcionando
- **Tolerancia a fallos**: Si un miner falla, los otros 2 continuan
- **Balanceo de carga**: 3 RPC nodes distribuyen las consultas
- **Redundancia**: Multiples puntos de acceso

### Ejemplo 3: Red QBFT con Validadores

**Objetivo:** Red con consenso bizantino tolerante para maxima seguridad.

**Configuracion:**

```typescript
const qbftConfig = {
  name: 'secure-network',
  chainId: 3000,
  subnet: '172.60.0.0/16',
  consensus: 'qbft',  // Consenso QBFT
  gasLimit: '0x1fffffffffffff',
  blockTime: 5
};

const network = new BesuNetwork(qbftConfig);

await network.create({
  nodes: [
    // Bootnode
    {
      name: 'bootnode1',
      ip: '172.60.0.10',
      rpcPort: 8545,
      type: 'bootnode'
    },

    // 4 validadores (minimo para QBFT)
    {
      name: 'validator1',
      ip: '172.60.0.20',
      rpcPort: 8546,
      type: 'node'
    },
    {
      name: 'validator2',
      ip: '172.60.0.21',
      rpcPort: 8547,
      type: 'node'
    },
    {
      name: 'validator3',
      ip: '172.60.0.22',
      rpcPort: 8548,
      type: 'node'
    },
    {
      name: 'validator4',
      ip: '172.60.0.23',
      rpcPort: 8549,
      type: 'node'
    },

    // RPC nodes
    {
      name: 'rpc1',
      ip: '172.60.0.30',
      rpcPort: 8550,
      type: 'rpc'
    }
  ],
  autoResolveSubnetConflicts: true
});

await network.start();
```

**Tolerancia:** Esta red puede tolerar que 1 validador falle o sea malicioso y seguira funcionando.

---

## 7. Preguntas Frecuentes (FAQ)

### Cuantos nodos necesito?

**Respuesta:** Depende del consenso y tus necesidades.

**Minimo absoluto:**
- Clique: 1 bootnode + 1 miner
- QBFT: 1 bootnode + 4 validadores

**Recomendado para desarrollo:**
- 1 bootnode + 1-2 miners + 1 RPC

**Recomendado para produccion:**
- 2 bootnodes + 3-5 miners/validadores + 2+ RPC nodes

### Que es un signerAccount?

**Respuesta:** Es una cuenta especial que tiene permiso para firmar bloques en consenso Clique.

**Analogia:** Piensa en un signerAccount como una licencia de notario. Solo quienes tienen esta licencia pueden certificar documentos oficiales (firmar bloques).

**Caracteristicas:**
- Tiene una clave privada generada automaticamente
- Se asocia a un nodo miner especifico
- Firma criptograficamente cada bloque que crea
- Necesita balance ETH para pagar gas (aunque en red privada no es critico)

**Ejemplo:**

```typescript
signerAccounts: [
  {
    address: '0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9',
    weiAmount: '100000000000000000000000'
  }
]

// Este signerAccount se asocia a un miner:
nodes: [
  {
    name: 'miner1',
    type: 'miner',
    signerAddress: '0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9'  // Misma direccion
  }
]
```

### Que es extraData?

**Respuesta:** Es un campo especial en el genesis block que lista los validadores autorizados inicialmente.

**Formato en Clique:**
```
0x + [32 bytes de padding] + [direcciones de validadores] + [65 bytes de firma]

Ejemplo:
0x0000000000000000000000000000000000000000000000000000000000000000
  742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9
  0000000000000000000000000000000000000000000000000000000000000000
  00000000000000000000000000000000000000000000000000000000000000
  0000000000000000000000000000000000000000000000000000000000000000
  00
```

**Nota:** Este campo es generado automaticamente por la libreria, no necesitas crearlo manualmente.

### Como agrego mas validadores?

**Respuesta:** Depende si la red ya esta corriendo o no.

**Opcion 1: Antes de iniciar la red**

Simplemente agrega mas nodos al crear la red:

```typescript
await network.create({
  nodes: [
    { name: 'bootnode1', ... },
    { name: 'miner1', ..., signerAddress: '0xAAA...' },
    { name: 'miner2', ..., signerAddress: '0xBBB...' },  // Nuevo miner
    { name: 'miner3', ..., signerAddress: '0xCCC...' }   // Otro nuevo miner
  ]
});
```

**Opcion 2: Con la red ya corriendo**

Usa el metodo `addNode()`:

```typescript
await network.addNode({
  name: 'miner4',
  ip: '172.50.0.25',
  rpcPort: 8560,
  type: 'miner',
  signerAddress: '0xDDD...'  // Nueva cuenta firmante
});
```

**Importante:** En Clique, cada nuevo miner necesita su propio signerAccount unico.

### Que pasa si un nodo se cae?

**Respuesta:** Depende del tipo de nodo y cuantos tienes.

**Bootnode se cae:**
- Si tienes solo 1: Nuevos nodos no pueden unirse (pero los existentes siguen funcionando)
- Si tienes 2+: El otro bootnode toma el relevo, sin impacto

**Miner se cae (Clique):**
- Con 1 miner: La red se detiene (no se crean mas bloques)
- Con 2+ miners: Los otros miners continuan, turno del caido se omite

**RPC node se cae:**
- Sin impacto en la blockchain
- Aplicaciones conectadas a ese RPC deben conectarse a otro

**Validator se cae (QBFT):**
- Con 4 validadores (minimo): Red se detiene si 2 o mas caen
- Con 7 validadores: Red tolera hasta 2 caidas
- Con 10 validadores: Red tolera hasta 3 caidas

**Formula QBFT:**
```
Validadores necesarios = 2/3 + 1 del total

Ejemplos:
- 4 validadores: necesitas 3 activos (tolera 1 caida)
- 7 validadores: necesitas 5 activos (tolera 2 caidas)
- 10 validadores: necesitas 7 activos (tolera 3 caidas)
```

### Puedo cambiar el genesis despues de crear la red?

**Respuesta:** NO. El genesis es inmutable.

**Analogia:** El genesis es como la fecha de nacimiento de una persona: no puedes cambiarla una vez que existe.

**Que SI puedes cambiar sin tocar genesis:**
- Subnet de la red
- IPs de los nodos
- Puertos RPC
- Cuentas y balances (via configuracion, no genesis)
- Gas limit y block time (via actualizacion de config)

**Que NO puedes cambiar (requiere nueva red):**
- ChainId
- Algoritmo de consenso (Clique -> QBFT)
- Validadores iniciales en extraData
- Configuracion fundamental del consenso

**Como hacer cambios:**

```typescript
// Cambios permitidos (sin afectar genesis)
await updateNetworkConfig(network, {
  subnet: '172.70.0.0/16',      // OK
  gasLimit: '0x5F5E100',         // OK
  blockTime: 10,                 // OK
  nodes: [                       // OK
    { name: 'bootnode1', ip: '172.70.0.10' },
    { name: 'miner1', ip: '172.70.0.11' }
  ]
});

// Cambio NO permitido (requiere nueva red)
// No existe updateConsensus() - tendrias que crear red nueva
```

### Como verifico que mi red esta funcionando?

**Respuesta:** Usa comandos curl para consultar la API JSON-RPC.

**1. Verificar numero de bloque:**

```bash
curl -X POST \
  http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }'

# Respuesta esperada:
# {"jsonrpc":"2.0","id":1,"result":"0x1a"}  (26 en decimal)
```

**2. Verificar numero de peers (nodos conectados):**

```bash
curl -X POST \
  http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "net_peerCount",
    "params": [],
    "id": 1
  }'

# Respuesta esperada:
# {"jsonrpc":"2.0","id":1,"result":"0x2"}  (2 peers conectados)
```

**3. Verificar balance de una cuenta:**

```bash
curl -X POST \
  http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9", "latest"],
    "id": 1
  }'

# Respuesta esperada:
# {"jsonrpc":"2.0","id":1,"result":"0x152d02c7e14af6800000"}  (en wei)
```

**4. Usando la libreria (TypeScript):**

```typescript
// Obtener info de la red
const info = await network.getNetworkInfo('http://localhost:8545');
console.log('Network info:', info);

// Verificar conectividad de nodos
const connectivity = await network.getNetworkConnectivity();
console.log('Node connectivity:', connectivity);

// Verificar balance
const balance = await network.getBalance(
  '0x742d35Cc6354C6532C4c0a1b9AAB6ff119B4a4B9',
  'http://localhost:8545'
);
console.log('Balance:', ethers.formatEther(balance), 'ETH');
```

### Como financio cuentas de prueba?

**Respuesta:** Usa la funcion `fundMnemonic()` para derivar cuentas y financiarlas automaticamente.

```typescript
// Financiar 5 cuentas con 10 ETH cada una
await network.fundMnemonic(
  'test test test test test test test test test test test junk',
  '10',    // 10 ETH por cuenta
  5,       // 5 cuentas
  'http://localhost:8545'  // URL del RPC
);
```

**Cuentas derivadas de ese mnemonic:**

```
Cuenta 0 (m/44'/60'/0'/0/0): 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Cuenta 1 (m/44'/60'/0'/0/1): 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Cuenta 2 (m/44'/60'/0'/0/2): 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Cuenta 3 (m/44'/60'/0'/0/3): 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
Cuenta 4 (m/44'/60'/0'/0/4): 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
```

**La funcion automaticamente:**
- Verifica que el miner tenga fondos suficientes
- Estima el costo de gas
- Envia transacciones de financiacion
- Espera confirmacion de cada transaccion
- Detecta cuentas ya financiadas (skip)

### Puedo usar MetaMask con mi red privada?

**Respuesta:** Si, absolutamente.

**Pasos:**

1. Abre MetaMask
2. Click en el selector de red (arriba)
3. Click en "Agregar red" o "Add Network"
4. Agregar red personalizada:

```
Nombre de la red: Mi Red Besu
Nueva URL de RPC: http://localhost:8545
ID de cadena: 1337 (tu chainId)
Simbolo de moneda: ETH
```

5. Guardar
6. Importar cuenta (si tienes la clave privada):
   - Click en el icono de cuenta
   - "Importar cuenta"
   - Pegar clave privada del signerAccount o cuenta derivada

**Ahora puedes usar MetaMask normalmente con tu red privada.**

### Como limpio mi red si algo sale mal?

**Respuesta:** Usa comandos de limpieza Docker y/o la funcion `destroy()`.

**Opcion 1: Desde la libreria**

```typescript
// Destruir red especifica
await network.destroy();

// O destruir por nombre
await BesuNetwork.destroyNetworkByName('mi-red-besu');
```

**Opcion 2: Comandos Docker manuales**

```bash
# Parar todos los contenedores Besu
docker stop $(docker ps -q --filter "label=network=mi-red-besu")

# Eliminar todos los contenedores Besu
docker rm $(docker ps -aq --filter "label=network=mi-red-besu")

# Eliminar la red Docker
docker network rm mi-red-besu

# Limpieza general de Docker
docker container prune -f
docker network prune -f
docker volume prune -f
```

**Opcion 3: Script de limpieza total**

```bash
# Si usas el proyecto
cd lib
npm run cleanup-networks
```

---

## 8. Glosario de Terminos

### A

**Account (Cuenta)**
Una entidad en la blockchain con una direccion unica y un balance. Puede enviar y recibir transacciones.

**Address (Direccion)**
Identificador unico de una cuenta, representado en formato hexadecimal (ej: `0x742d35...`). Como una direccion de correo electronico pero para blockchain.

**Alloc**
Seccion en el genesis que especifica las cuentas con balance inicial.

### B

**Balance**
Cantidad de ETH (o wei) que posee una cuenta.

**Block (Bloque)**
Conjunto de transacciones agrupadas y validadas. Como una pagina en un libro de contabilidad.

**Blockchain**
Cadena de bloques enlazados criptograficamente. El "libro mayor" distribuido.

**Block Time**
Tiempo promedio entre la creacion de bloques consecutivos (ej: 5 segundos).

**Bootnode**
Nodo especial que facilita el descubrimiento de otros nodos en la red. Como un directorio telefonico.

**Byzantine Fault Tolerance (BFT)**
Capacidad de un sistema para funcionar correctamente incluso si algunos nodos son maliciosos o fallan.

### C

**ChainId**
Identificador numerico unico de una blockchain. Previene transacciones entre redes diferentes.

**Clique**
Algoritmo de consenso Proof of Authority (PoA) usado en redes privadas Ethereum. Basado en turnos rotativos de validadores autorizados.

**Consensus (Consenso)**
Mecanismo mediante el cual los nodos se ponen de acuerdo sobre el estado de la blockchain.

**Container (Contenedor)**
Instancia aislada de software ejecutandose en Docker. Cada nodo Besu corre en su propio contenedor.

### D

**Docker**
Plataforma para ejecutar aplicaciones en contenedores aislados.

**Docker Network**
Red virtual que conecta contenedores Docker entre si.

### E

**Enode**
Identificador unico de un nodo en la red P2P (ej: `enode://abc123...@172.30.0.20:30303`).

**ETH**
Unidad de cuenta en Ethereum. 1 ETH = 1,000,000,000,000,000,000 wei.

**ExtraData**
Campo en el genesis block que contiene datos adicionales. En Clique, lista los validadores autorizados inicialmente.

### G

**Gas**
Unidad de medida del costo computacional de operaciones en Ethereum. Como los litros de gasolina para un coche.

**Gas Limit**
Cantidad maxima de gas que puede usarse en un bloque o transaccion.

**Genesis Block**
Primer bloque de una blockchain. Define la configuracion inicial inmutable.

**Genesis File**
Archivo JSON que especifica la configuracion del genesis block.

### H

**Hash**
Resultado de una funcion criptografica que convierte datos en un identificador unico de longitud fija (ej: `0xabc123...`).

**Hexadecimal**
Sistema de numeracion base-16 (0-9, A-F). Usado extensamente en blockchain (ej: `0x1a2b3c`).

### I

**IBFT2 (Istanbul Byzantine Fault Tolerant 2.0)**
Algoritmo de consenso tolerante a fallas bizantinas usado en redes privadas Ethereum.

**IP Address**
Direccion de red que identifica un nodo (ej: `172.30.0.20`).

### J

**JSON-RPC**
Protocolo de comunicacion usado para interactuar con nodos Besu via HTTP.

### M

**Miner**
Nodo que crea y firma nuevos bloques en consenso Clique.

**Mnemonic**
Frase de recuperacion de 12-24 palabras que genera deterministicamente claves privadas.

### N

**Node (Nodo)**
Instancia individual de software Besu que participa en la red blockchain.

**Nonce**
Numero secuencial asociado a una cuenta que previene ataques de replay. Se incrementa con cada transaccion.

### P

**P2P (Peer-to-Peer)**
Comunicacion directa entre nodos sin intermediarios.

**P2P Port**
Puerto usado para comunicacion entre nodos (por defecto: 30303).

**Peer**
Otro nodo en la red con el que un nodo esta conectado.

**Private Key (Clave Privada)**
Clave secreta usada para firmar transacciones. Debe mantenerse privada.

**Proof of Authority (PoA)**
Mecanismo de consenso donde validadores autorizados se turnan para crear bloques.

**Public Key (Clave Publica)**
Clave derivada de la clave privada, usada para verificar firmas.

### Q

**QBFT (Quorum Byzantine Fault Tolerant)**
Algoritmo de consenso tolerante a fallas bizantinas usado en redes privadas. Version mejorada de IBFT2.

### R

**RPC (Remote Procedure Call)**
Mecanismo para ejecutar funciones en un sistema remoto.

**RPC Node**
Nodo que proporciona acceso a la blockchain via API JSON-RPC.

**RPC Port**
Puerto usado para comunicacion JSON-RPC (ej: 8545).

### S

**Signature (Firma)**
Prueba criptografica de que un mensaje fue creado por el poseedor de una clave privada especifica.

**SignerAccount**
Cuenta especial con clave privada usada para firmar bloques en consenso Clique.

**Smart Contract**
Programa ejecutable almacenado en la blockchain.

**Subnet**
Rango de direcciones IP (ej: `172.30.0.0/16`).

### T

**Transaction (Transaccion)**
Operacion que modifica el estado de la blockchain (transferencia de fondos, ejecucion de contrato, etc.).

**TOML**
Formato de archivo de configuracion usado por Besu.

### V

**Validator (Validador)**
Nodo autorizado para participar en el consenso y validar bloques.

### W

**Wei**
Unidad minima de ETH. 1 ETH = 10^18 wei. Como los centavos son al euro.

**Wallet**
Software para gestionar claves privadas y firmar transacciones (ej: MetaMask).

---

## Recursos Adicionales

### Documentacion Oficial

- **Hyperledger Besu**: https://besu.hyperledger.org/
- **Ethereum**: https://ethereum.org/
- **Docker**: https://docs.docker.com/

### Archivos del Proyecto

- `lib/README.md` - Documentacion completa de la libreria
- `CLAUDE.md` - Guia para agentes IA
- `examples/` - Ejemplos de codigo funcionales

### Contacto

**Desarrollador**: Javier Ruiz-Canela Lopez
**Email**: jrcanelalopez@gmail.com

---

**Ultima actualizacion:** 28 de Octubre, 2025
**Version:** 1.0
