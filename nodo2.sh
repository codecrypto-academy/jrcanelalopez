docker run -d \
  --name nodo2 \
  -p 10002:8545 \
  --network nodos \
  -v $(pwd):/data \
  hyperledger/besu:latest \
  --config-file=/data/config.toml \
  --data-path=/data/nodo2/data