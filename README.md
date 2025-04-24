# BESU NETWORK PROOF OF AUTHORITY (CLIQUE)

git clone https://github.com/codecrypto-academy/besu-network-2025.git

## Create network

```sh
docker network create nodos
```

## Create a key and address

```sh
besu --data-path=nodo1 public-key export-address --to=nodo1/address
```

## Create genesis

```json
{
  "config": {
    "chainId": 222333,
    "londonBlock": 0,
    "clique": {
      "blockperiodseconds": 4,
      "epochlength": 30000,
      "createemptyblocks": true
    }
  },
  "extraData": "0x000000000000000000000000000000000000000000000000000000000000000087305624eb4ce992cd85d05609e1ff66b32de3de0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "gasLimit": "0x1fffffffffffff",
  "difficulty": "0x1",
  "alloc": {
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC": {
      "balance": "0x200000000000000000000000000000000000000000000000000000000000000"
    }
  }
}
```

## Create config.toml

```toml
genesis-file="/data/genesis.json"
# Networking
p2p-host="0.0.0.0"
p2p-port=30303
p2p-enabled=true
# IPC configuration


# JSON-RPC

# Node discovery
discovery-enabled=true
bootnodes=["enode://38f27919d80672c62c9a6bcf79a0308a4f8a82337cca8144adec9aba377a6882c574668c3cbd595deb372c9e9e883bce2ff7f3fb48bbf60689af6897be385b54@172.18.0.2:30303"]


rpc-http-enabled=true
rpc-http-host="0.0.0.0"
rpc-http-port=8545
rpc-http-cors-origins=["*"]
rpc-http-api=["ETH","NET","CLIQUE","ADMIN", "TRACE", "DEBUG", "TXPOOL", "PERM"]
host-allowlist=["*"]
```

## create a nodo

```sh
docker run -d \
  --name nodo1 \
  --network nodos \
  -p 9999:8545 \
  -v $(pwd):/data \
  hyperledger/besu:latest \
  --config-file=/data/config.toml \
  --data-path=/data/nodo1/data \
  --node-private-key-file=/data/nodo1/key \
  --genesis-file=/data/genesis.json
```

## Test block number

```sh
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' -H "Content-Type: application/json" http://localhost:9999
```

## Test get balance

```sh
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xdA4f8C00E7FdE00b029E7ddaf2aAb85590e64b34","latest"],"id":1}' -H "Content-Type: application/json" http://localhost:9999
```

## get node info

```sh
curl -X POST --data '{"jsonrpc":"2.0","method":"admin_nodeInfo","params":[],"id":1}'
```

## get node info in json

```sh
curl -X POST --data '{"jsonrpc":"2.0","method":"admin_nodeInfo","params":[],"id":1}' -H "Content-Type: application/json" http://localhost:9999 | jq -r '.result.enode'
```

## get ip

```sh
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' nodo1
```

## convert hexa to decimal

```sh
echo $((16#26c626c4be0))
```

## get block by number

```sh
curl -s -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id
":1}' -H "Content-Type: application/json" http://localhost:10002 | jq '.result'
```

## get block by number in decimal

```sh
echo $((16#$(curl -s -X POST \
--data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
-H "Content-Type: application/json" http://localhost:10002 \
| jq -r '.result' | sed 's/0x//')))
```

## linux tools image

```sh
docker run -it --rm --name nodos jonlabelle/network-tools
```

## foundry utils

```sh
docker run --name foundry -d --rm  -it ghcr.io/foundry-rs/foundry /bin/bash
docker exec foundry  /bin/bash -c 'cast wallet new'
```
