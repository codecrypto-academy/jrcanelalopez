# Proyecto Cesta Northwind + Ethereum

> Este es el proyecto **Cesta**, una aplicación para comprar productos de Northwind utilizando la blockchain de Ethereum.

---

## 1. Crear la base de datos MySQL

Inicia un contenedor de MySQL:

```bash
docker run --name mysql-server -e MYSQL_ROOT_PASSWORD=mysql -p 2206:3306 -d mysql:latest
```

Crea el usuario y otorga permisos:

```sql
CREATE USER 'northwind_user'@'%' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON northwind.* TO 'northwind_user'@'%';
FLUSH PRIVILEGES;
```

---

## 2. Crear el nodo de Ethereum

Inicializa la base de datos del nodo:

```bash
rm -rf data/
docker rm -f eth-node
docker run -d -v ${PWD}/data:/data -v ${PWD}/genesis.json:/genesis.json --name eth-node ethereum/client-go init --datadir data /genesis.json
```

Arranca el nodo de Ethereum:

```bash
docker rm -f eth-node-01
docker run -d -p 8545:8545 -p 30303:30303 -v ${PWD}/data:/data --name eth-node-01 ethereum/client-go --datadir /data --http.api personal,eth,net,web3 --http --http.addr 0.0.0.0 --http.port 8545 --http.corsdomain '*' --mine --miner.etherbase 0xdA4f8C00E7FdE00b029E7ddaf2aAb85590e64b34
```

---

## 3. Arrancar la aplicación backend

```bash
cd back
npm install
npm run dev
```

El backend expone un servidor HTTP en el puerto **5555**.

---r la base de datos

docker run --name mysql-server -e MYSQL_ROOT_PASSWORD=mysql -p 2206:3306 -d mysql:latest

CREATE USER 'northwind_user'@'%' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON northwind.\* TO 'northwind_user'@'%';
FLUSH PRIVILEGES;

Crear el nodo de ethereum

Inicializo la baase de datos

rm -rf data/

docker rm -f eth-node

docker run -d -v ${PWD}/data:/data -v ${PWD}/genesis.json:/genesis.json --name eth-node ethereum/client-go init --datadir data /genesis.json

arrancar el nodo

docker rm -f eth-node-01

docker run -d -p 8545:8545 -p:30303:30303 -v ${PWD}/data:/data --name eth-node-01 ethereum/client-go --datadir /data --http.api personal,eth,net,web3 --http --http.addr 0.0.0.0 --http.port 8545 --http.corsdomain '\*' --mine --miner.etherbase 0xdA4f8C00E7FdE00b029E7ddaf2aAb85590e64b34

Arrancar la aplicación backend

```bash
cd back
npm install
npm run dev
```

El back tiene un servidor http en el puerto 5555.
