### Configuración de la red Ethereum

#### Requisitos de la versión

Este proceso es compatible únicamente con la versión `1.13` de Geth. Asegúrate de tener instalada esta versión antes de continuar. Puedes verificar la versión instalada ejecutando el siguiente comando:

```bash
geth version
```

Si no tienes la versión correcta, descárgala desde la [página oficial de Geth](https://geth.ethereum.org/downloads/).

#### Creación de cuentas

Se han creado las siguientes cuentas para los nodos:

| Nodo   | Dirección Pública                            | Archivo de Clave Secreta                                                                       |
| ------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Nodo 1 | `0x330F9A8AB840Be595eC34c221e643395955Dc8aa` | `nodo1/keystore/UTC--2025-05-01T18-50-11.265631000Z--330f9a8ab840be595ec34c221e643395955dc8aa` |
| Nodo 2 | `0x669f2fF7036Ac5DFa2b6eaaF38F6696A958b4F16` | `nodo2/keystore/UTC--2025-05-01T18-51-28.774187000Z--669f2ff7036ac5dfa2b6eaaf38f6696a958b4f16` |
| Nodo 3 | `0x494fdad1e41e83338176291dCe2301eEeaa0009E` | `nodo3/keystore/UTC--2025-05-01T18-51-36.647102000Z--494fdad1e41e83338176291dce2301eeeaa0009e` |
| Nodo 4 | `0x5167bD270912cf97640bBF16a591ADF7d328EDD3` | `nodo4/keystore/UTC--2025-05-04T10-19-19.415451000Z--5167bd270912cf97640bbf16a591adf7d328edd3` |

Para crear una nueva cuenta en Geth, utiliza el siguiente comando:

```bash
geth account new --datadir=nodoX --password pwd.txt
```

Reemplaza `nodoX` con el directorio de datos del nodo correspondiente. Este comando generará una nueva dirección pública y un archivo de clave secreta asociado. Asegúrate de guardar la contraseña utilizada para proteger la cuenta, ya que será necesaria para desbloquearla más adelante.

#### Archivo `genesis.json`

El archivo `genesis.json` define la configuración inicial de la red Ethereum. Asegúrate de que el archivo esté correctamente configurado antes de inicializar los nodos.

#### Inicialización de los nodos

Para asociar el archivo `genesis.json` con los nodos, ejecuta los siguientes comandos:

```bash
rm -rf nodo1/geth
rm -rf nodo2/geth
rm -rf nodo3/geth
rm -rf nodo4/geth

geth init --datadir=nodo1 --state.scheme=hash genesis.json
geth init --datadir=nodo2 --state.scheme=hash genesis.json
geth init --datadir=nodo3 --state.scheme=hash genesis.json
geth init --datadir=nodo4 --state.scheme=hash genesis.json
```

#### Ejecución de los nodos

Ejecuta los siguientes comandos para inicializar y arrancar cada nodo:

- **Nodo 1**:

```bash
geth --datadir nodo1 \
--syncmode full \
--http \
--http.api admin,eth,miner,net,txpool,personal,web3 \
--http.port 8546 \
--allow-insecure-unlock \
--unlock "0x330f9a8ab840be595ec34c221e643395955dc8aa" \
--password pwd.txt \
--port 30034 \
--bootnodes "enode://d7f5f6bd7cb1fba6f61963e76b23009977d1046a9544472a471ca6af732f19c559d53e662460278abc33c6e4599bf56ad8cb8728270fdf9a6cd395c6a14e7545@127.0.0.1:30034" \
--mine \
--miner.etherbase 0x330f9a8ab840be595ec34c221e643395955dc8aa
```

- **Nodo 2**:

```bash
geth --datadir nodo2 \
--syncmode full \
--http \
--http.api admin,debug,web3,eth,txpool,clique,miner,net,personal \
--http.port 8547 \
--allow-insecure-unlock \
--unlock "0x669f2ff7036ac5dfa2b6eaaf38f6696a958b4f16" \
--password pwd.txt \
--port 30035 \
--bootnodes "enode://d7f5f6bd7cb1fba6f61963e76b23009977d1046a9544472a471ca6af732f19c559d53e662460278abc33c6e4599bf56ad8cb8728270fdf9a6cd395c6a14e7545@127.0.0.1:30034" \
--mine \
--miner.etherbase 0x669f2ff7036ac5dfa2b6eaaf38f6696a958b4f16 \
--authrpc.port 8552 \
--ipcpath "\\.\pipe\geth2.ipc"
```

- **Nodo 3**:

```bash
geth --datadir nodo3 \
--syncmode full \
--http \
--http.api admin,debug,web3,eth,txpool,clique,miner,net,personal \
--http.port 8548 \
--allow-insecure-unlock \
--unlock "0x494fdad1e41e83338176291dce2301eeeaa0009e" \
--password pwd.txt \
--port 30036 \
--bootnodes "enode://d7f5f6bd7cb1fba6f61963e76b23009977d1046a9544472a471ca6af732f19c559d53e662460278abc33c6e4599bf56ad8cb8728270fdf9a6cd395c6a14e7545@127.0.0.1:30034" \
--mine \
--miner.etherbase 0x494fdad1e41e83338176291dce2301eeeaa0009e \
--authrpc.port 8553 \
--ipcpath "\\.\pipe\geth3.ipc"
```

- **Nodo 4**:

```bash
geth --datadir nodo4 \
--syncmode full \
--http \
--http.api admin,debug,web3,eth,txpool,clique,miner,net,personal \
--http.port 8549 \
--allow-insecure-unlock \
--unlock "0x5167bD270912cf97640bBF16a591ADF7d328EDD3" \
--password pwd.txt \
--port 30037 \
--bootnodes "enode://d7f5f6bd7cb1fba6f61963e76b23009977d1046a9544472a471ca6af732f19c559d53e662460278abc33c6e4599bf56ad8cb8728270fdf9a6cd395c6a14e7545@127.0.0.1:30034" \
--mine \
--miner.etherbase 0x5167bD270912cf97640bBF16a591ADF7d328EDD3 \
--authrpc.port 8554 \
--ipcpath "\\.\pipe\geth4.ipc"
```

#### Significado de los principales parámetros

| Parámetro                 | Descripción                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `--datadir`               | Especifica el directorio de datos donde se almacenan los datos del nodo.             |
| `--syncmode`              | Define el modo de sincronización del nodo (`full`, `fast`, `light`).                 |
| `--http`                  | Habilita la interfaz HTTP para interactuar con el nodo.                              |
| `--http.api`              | Lista de APIs habilitadas para la interfaz HTTP.                                     |
| `--http.port`             | Puerto en el que se expone la interfaz HTTP.                                         |
| `--allow-insecure-unlock` | Permite desbloquear cuentas de forma insegura (útil solo en entornos de desarrollo). |
| `--unlock`                | Dirección de la cuenta que se desbloqueará automáticamente al iniciar el nodo.       |
| `--password`              | Archivo que contiene la contraseña para desbloquear la cuenta especificada.          |
| `--port`                  | Puerto utilizado para la comunicación entre nodos (P2P).                             |
| `--bootnodes`             | Lista de nodos iniciales para conectarse a la red.                                   |
| `--mine`                  | Habilita la minería en el nodo.                                                      |
| `--miner.etherbase`       | Dirección de la cuenta que recibirá las recompensas de minería.                      |
| `--authrpc.port`          | Puerto para la comunicación RPC autenticada.                                         |
| `--ipcpath`               | Ruta del archivo IPC para la comunicación local con el nodo.                         |

#### Comandos de la consola de Ethereum

A continuación, se presentan algunos comandos básicos que puedes ejecutar en la consola de Ethereum para interactuar con los nodos:

```bash
# Conectar a un nodo
geth attach http://HOST_NODO:PUERTO_NODO
```

- **Información del nodo**:

  ```javascript
  admin.nodeInfo;
  ```

- **Número del bloque actual**:

  ```javascript
  eth.blockNumber;
  ```

- **Ver cuentas disponibles**:

  ```javascript
  eth.accounts;
  ```

- **Consultar el balance de una cuenta**:

  ```javascript
  eth.getBalance("DIRECCION_CUENTA");
  ```

- **Enviar una transacción**:

  ```javascript
  eth.sendTransaction({
    from: "DIRECCION_ORIGEN",
    to: "DIRECCION_DESTINO",
    value: web3.toWei(VALOR_EN_ETHER, "ether"),
  });
  ```

### Notas adicionales

- Reemplaza `HOST_NODO` y `PUERTO_NODO` con la dirección y puerto del nodo al que deseas conectarte.
- Asegúrate de que las direcciones y contraseñas sean correctas para evitar errores.
- Consulta la [documentación oficial de Geth](https://geth.ethereum.org/docs/) para más detalles sobre los comandos disponibles.

### Notas

- Asegúrate de que los puertos utilizados no estén ocupados por otros procesos.
- Verifica que los nodos estén correctamente conectados y sincronizados.
- Consulta la documentación oficial de Geth para más detalles sobre las opciones de configuración.
  Asociar genesis con los nodos
