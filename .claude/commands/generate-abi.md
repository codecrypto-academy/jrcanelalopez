---
description: Generar y copiar el ABI del contrato al frontend
---

Genera el ABI del smart contract y lo copia al frontend.

Instrucciones:
1. Cambia al directorio `sc/`
2. Compila el contrato: `forge build`
3. Lee el ABI desde `out/SupplyChain.sol/SupplyChain.json`
4. Extrae solo la sección "abi"
5. Crea/actualiza el archivo `web/src/contracts/SupplyChainABI.ts`
6. Formatea el ABI como una constante TypeScript exportable
7. Verifica que el archivo se creó correctamente
8. Recuerda al usuario importar este ABI en la configuración
