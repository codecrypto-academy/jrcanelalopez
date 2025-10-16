---
description: Desplegar smart contract en Anvil local
---

Despliega el smart contract SupplyChain.sol en la blockchain local Anvil.

Pre-requisitos:
- Anvil debe estar corriendo en otro terminal (localhost:8545)

Instrucciones:
1. Verifica que Anvil esté corriendo
2. Cambia al directorio `sc/`
3. Ejecuta el script de deploy:
   ```
   forge script script/Deploy.s.sol \
     --rpc-url http://localhost:8545 \
     --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
     --broadcast
   ```
4. Captura y muestra la dirección del contrato desplegado
5. Recuerda al usuario actualizar `web/src/contracts/config.ts` con la nueva dirección
