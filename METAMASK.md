# Guía de Configuración de MetaMask para Supply Chain Tracker

Esta guía te ayudará a configurar MetaMask para trabajar con el proyecto Supply Chain Tracker en tu blockchain local Anvil.

## 🚀 Inicio Rápido

### Cuentas Pre-configuradas (Listas para usar)

Las siguientes cuentas ya están registradas y aprobadas en el sistema:

```
✅ Admin:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
✅ Producer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
✅ Factory:  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
✅ Retailer: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

### Cuenta para Probar Auto-Registro

```
🆕 Consumer: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
   (No registrada - usa esta para probar el flujo de auto-registro)
```

### Pasos para Probar (3 minutos)

1. **Configurar MetaMask:**
   - Añade red Anvil Local (localhost:8545, Chain ID: 31337)
   - Importa cuenta Consumer con private key: `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`

2. **Probar Auto-Registro:**
   - Abre http://localhost:3001
   - Conecta MetaMask con cuenta Consumer
   - Verás formulario de auto-registro
   - Selecciona rol "Consumer" y envía

3. **Aprobar desde Admin:**
   - Cambia a cuenta Admin en MetaMask
   - Ve a Admin Panel → Users
   - Aprueba la solicitud del Consumer

4. **Verificar Acceso:**
   - Vuelve a cuenta Consumer
   - Deberías ver "Welcome, Consumer!"

---

## Tabla de Contenidos

- [1. Instalación de MetaMask](#1-instalación-de-metamask)
- [2. Configurar Red Anvil Local](#2-configurar-red-anvil-local)
- [3. Importar Cuentas de Prueba](#3-importar-cuentas-de-prueba)
- [4. Flujo de Trabajo Recomendado](#4-flujo-de-trabajo-recomendado)
- [5. Solución de Problemas](#5-solución-de-problemas)

---

## 1. Instalación de MetaMask

Si aún no tienes MetaMask instalado:

1. Ve a [metamask.io](https://metamask.io/)
2. Descarga la extensión para tu navegador (Chrome, Firefox, Brave, Edge)
3. Sigue el asistente de configuración
4. **IMPORTANTE:** Guarda tu frase de recuperación en un lugar seguro

---

## 2. Configurar Red Anvil Local

### Paso 1: Agregar Red Personalizada

1. Abre MetaMask
2. Haz clic en el **selector de red** (arriba, en el centro)
3. Selecciona **"Agregar red"** → **"Agregar una red manualmente"**

### Paso 2: Configurar con estos datos

```
Nombre de red:              Anvil Local
Nueva URL de RPC:           http://localhost:8545
ID de cadena:               31337
Símbolo de moneda:          ETH
URL del explorador:         (dejar vacío)
```

### Paso 3: Guardar

1. Haz clic en **"Guardar"**
2. MetaMask cambiará automáticamente a la red Anvil Local

---

## 3. Importar Cuentas de Prueba

Anvil proporciona 10 cuentas pre-financiadas con 10,000 ETH cada una. A continuación se detallan las 5 principales cuentas según roles del sistema.

### Cómo Importar una Cuenta

1. Abre MetaMask
2. Haz clic en el **icono de cuenta** (arriba derecha)
3. Selecciona **"Importar cuenta"**
4. Pega la **Private Key** correspondiente
5. Haz clic en **"Importar"**
6. **Renombra la cuenta** haciendo clic en los 3 puntos → "Detalles de la cuenta" → editar nombre

---

### 🔴 Cuenta 1: Admin / Owner

**Rol:** Administrador del sistema (puede aprobar/rechazar usuarios)

```
Nombre sugerido: Admin
Address:         0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key:     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Balance:         ~10,000 ETH
```

**Permisos:**
- Aprobar/rechazar solicitudes de usuarios
- Pausar/despausar el contrato
- Es el deployer del contrato (owner)

---

### 🟢 Cuenta 2: Producer

**Rol:** Productor de materias primas

```
Nombre sugerido: Producer
Address:         0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key:     0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Balance:         10,000 ETH
```

**Permisos:**
- Crear tokens con `parentId = 0` (materias primas)
- Transferir únicamente a Factory
- Ejemplos: Algodón, Lana, Cuero, Madera

---

### 🔵 Cuenta 3: Factory

**Rol:** Fábrica que procesa materias primas

```
Nombre sugerido: Factory
Address:         0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key:     0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Balance:         10,000 ETH
```

**Permisos:**
- Recibir materias primas de Producer
- Crear productos derivados (parentId > 0)
- Transferir únicamente a Retailer
- Ejemplos: Tela, Tablas, Productos semi-procesados

---

### 🟡 Cuenta 4: Retailer

**Rol:** Minorista / Distribuidor

```
Nombre sugerido: Retailer
Address:         0x90F79bf6EB2c4f870365E785982E1f101E93b906
Private Key:     0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
Balance:         10,000 ETH
```

**Permisos:**
- Recibir productos de Factory
- Crear productos finales (parentId > 0)
- Transferir únicamente a Consumer
- Ejemplos: Camisas, Muebles, Productos empaquetados

---

### 🟣 Cuenta 5: Consumer

**Rol:** Consumidor final

```
Nombre sugerido: Consumer
Address:         0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
Private Key:     0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba
Balance:         10,000 ETH
```

**Permisos:**
- Recibir productos de Retailer
- **NO puede transferir** (es el final de la cadena)
- Solo puede aceptar/rechazar transferencias

---

### Cuentas Adicionales (6-10)

Si necesitas más cuentas para testing:

**Cuenta 6:**
```
Address:     0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
Private Key: 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e
```

**Cuenta 7:**
```
Address:     0x976EA74026E726554dB657fA54763abd0C3a0aa9
Private Key: 0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356
```

**Cuenta 8:**
```
Address:     0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
Private Key: 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97
```

**Cuenta 9:**
```
Address:     0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f
Private Key: 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6
```

**Cuenta 10:**
```
Address:     0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
Private Key: 0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897
```

---

## 4. Flujo de Trabajo Recomendado

### Paso 1: Registro de Usuarios

**NUEVO:** Los usuarios ahora pueden auto-registrarse y solicitar un rol.

#### Opción A: Auto-Registro (Recomendado para nuevos usuarios)

1. **Usuario** se auto-registra en la web
   - Conecta MetaMask con cualquier cuenta
   - Si no está registrado, verá el formulario de auto-registro
   - Selecciona su rol deseado (Producer/Factory/Retailer/Consumer)
   - Envía la solicitud (queda con estado "Pending")

2. **Admin** aprueba la solicitud
   - Conecta con la cuenta Admin
   - Va al panel `/admin/users`
   - Ve la lista de usuarios pendientes
   - Aprueba o rechaza la solicitud

3. **Usuario** obtiene acceso
   - Una vez aprobado, puede acceder al sistema
   - Recarga la página y verá "Welcome, [Role]!"

#### Opción B: Registro Directo por Admin

1. **Admin** registra usuarios manualmente
   - Conecta con la cuenta Admin en MetaMask
   - Va al panel `/admin/users` (o usa comandos `cast`)
   - Ingresa la dirección Ethereum del usuario
   - Selecciona el rol (Producer/Factory/Retailer/Consumer)
   - Confirma la transacción
   - El usuario queda registrado con estado "Approved" inmediatamente

2. **Usuarios** pueden conectarse directamente
   - Una vez registrados por el admin
   - Simplemente conectan MetaMask
   - Tienen acceso inmediato al sistema

### Paso 2: Flujo de Tokens

```
1. Producer crea materia prima
   └─> Token: "Algodón 100kg"
       parentId: 0

2. Producer → Factory (transferencia)
   └─> Factory acepta transferencia

3. Factory crea producto derivado
   └─> Token: "Tela de Algodón 50m"
       parentId: 1 (token del algodón)

4. Factory → Retailer (transferencia)
   └─> Retailer acepta transferencia

5. Retailer crea producto final
   └─> Token: "Camisa de Algodón"
       parentId: 2 (token de la tela)

6. Retailer → Consumer (transferencia)
   └─> Consumer acepta transferencia

✅ Trazabilidad completa: Camisa → Tela → Algodón
```

### Comandos para Gestión de Usuarios (desde terminal)

Si el panel de admin no está disponible, usa estos comandos desde la terminal:

```bash
cd sc

# Obtén la dirección del contrato desde web/.env.local
CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# Registrar Producer
cast send $CONTRACT_ADDRESS \
  "registerUser(address,string)" \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  "Producer" \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545

# Registrar Factory
cast send $CONTRACT_ADDRESS \
  "registerUser(address,string)" \
  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC \
  "Factory" \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545

# Registrar Retailer
cast send $CONTRACT_ADDRESS \
  "registerUser(address,string)" \
  0x90F79bf6EB2c4f870365E785982E1f101E93b906 \
  "Retailer" \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545

# Registrar Consumer
cast send $CONTRACT_ADDRESS \
  "registerUser(address,string)" \
  0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 \
  "Consumer" \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545
```

**Estados de usuario:**
- `0` = Pending (esperando aprobación del admin - usado en auto-registro)
- `1` = Approved (puede operar en el sistema)
- `2` = Rejected (rechazado por el admin)
- `3` = Canceled (usuario canceló su solicitud)

**Para aprobar un usuario pendiente:**
```bash
# Aprobar (cambiar status a 1 = Approved)
cast send $CONTRACT_ADDRESS \
  "changeStatusUser(address,uint8)" \
  0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 \
  1 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --rpc-url http://localhost:8545
```

---

## 5. Solución de Problemas

### Error: "MetaMask is not installed"

**Solución:** Instala la extensión de MetaMask desde [metamask.io](https://metamask.io/)

---

### Error: "Please switch to network with Chain ID 31337"

**Causas posibles:**

1. **MetaMask no está en la red Anvil Local**
   - Verifica que seleccionaste "Anvil Local" en el selector de redes

2. **Anvil no está corriendo**
   ```bash
   # Verifica si Anvil está corriendo
   lsof -i :8545

   # Si no está corriendo, inícialo
   anvil
   ```

3. **Configuración incorrecta de la red**
   - Verifica que el Chain ID sea exactamente `31337`
   - Verifica que la RPC URL sea `http://localhost:8545`

---

### Error: "Transaction failed" o "Insufficient funds"

**Causas posibles:**

1. **Cuenta sin fondos**
   - Las cuentas de Anvil vienen con 10,000 ETH
   - Si reiniciaste Anvil, las cuentas se resetean

2. **Usuario no aprobado**
   - Verifica que el admin haya aprobado tu usuario
   - Estado debe ser "Approved" (1)

3. **Violación del flujo de roles**
   - Producer solo puede transferir a Factory
   - Factory solo puede transferir a Retailer
   - Retailer solo puede transferir a Consumer
   - Consumer NO puede transferir

---

### Error: "Contract not deployed"

**Solución:**

1. Verifica que Anvil esté corriendo
2. Verifica la dirección del contrato en `.env.local`
3. Si reiniciaste Anvil, redesplegar el contrato:

```bash
cd sc
forge script script/DeployLocal.s.sol --rpc-url http://localhost:8545 --broadcast

# Copia la nueva dirección y actualiza web/.env.local
```

---

### La transacción se queda "pendiente" indefinidamente

**Solución:**

1. **Resetear nonce de MetaMask:**
   - Configuración → Avanzado → "Borrar datos de actividad"
   - Esto resetea el nonce de las transacciones

2. **Reiniciar Anvil:**
   - Detén Anvil (Ctrl+C)
   - Reinicia: `anvil`
   - Redesplegar contrato
   - Resetear nonce en MetaMask

---

### No aparece el saldo de ETH

**Solución:**

1. Asegúrate de estar en la red "Anvil Local"
2. Si reiniciaste Anvil, los balances se resetean a 10,000 ETH
3. Intenta cambiar de cuenta y volver

---

### Error: "UserDoesNotExist"

**Explicación:** El usuario no se ha registrado en el sistema

**Solución:**
1. Conecta MetaMask
2. Selecciona un rol
3. Envía la solicitud de registro
4. Espera la aprobación del admin

---

## Notas Importantes de Seguridad

⚠️ **ADVERTENCIA:** Las private keys mostradas aquí son **SOLO PARA DESARROLLO LOCAL**.

**NUNCA** uses estas cuentas en:
- Redes de prueba públicas (Sepolia, Goerli)
- Mainnet de Ethereum
- Cualquier red donde tengas fondos reales

Estas claves son públicas y conocidas por todos los usuarios de Anvil.

---

## Recursos Adicionales

- [Documentación de MetaMask](https://docs.metamask.io/)
- [Foundry Book - Anvil](https://book.getfoundry.sh/anvil/)
- [Guía del Proyecto (CLAUDE.md)](./CLAUDE.md)
- [README Principal](./README.md)

---

**Última actualización:** 2025-10-20
