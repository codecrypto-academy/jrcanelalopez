
# Faucet 2024

Nota Clique signing con el geth 1.14 o superior
esta deprecado, buscar como se haría un Faucet 2025.

# Arrancar nodo
docker run --rm -v ./datos:/data -v ./pwd.txt:/p.txt -p 5556:8545 ethereum/client-go:v1.13.15 --datadir /data --unlock af5ba15db164f96fe21b838693321cee61d86d8b --allow-insecure-unlock --mine --miner.etherbase af5ba15db164f96fe21b838693321cee61d86d8b --password /p.txt --nodiscover --http --http.addr "0.0.0.0" --http.api "admin,eth,debug,miner,net,txpool,personal,web3" --http.corsdomain "*"

# iniciar el genesis
docker run -v ./genesis.json:/gen.json -v ./datos:/data ethereum/client-go:v1.13.15 init --datadir /data /gen.json

# crear cuenta
docker run --rm -v ./datos:/data -v ./pwd.txt:/p.txt ethereum/client-go:v1.13.15
account new --datadir /data --password /p.txt 