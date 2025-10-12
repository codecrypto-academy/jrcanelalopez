# 🚀 Guía Rápida de Inicio

## Paso 1: Desplegar el Contrato

Anvil ya está corriendo en otra terminal. Ahora despliega el contrato:

```bash
# Desde la raíz del proyecto
forge create "on-chain application/DocumentRegistry.sol:DocumentRegistry" \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**GUARDA LA DIRECCIÓN DEL CONTRATO** que se muestra en la salida.

## Paso 2: Instalar dependencias de React

```bash
cd "off-chain application"
npm install
```

## Paso 3: Iniciar la aplicación

```bash
npm start
```

## Paso 4: Usar la aplicación

1. Abre http://localhost:3000
2. Click "Conectar a Anvil Local"
3. Pega la dirección del contrato
4. Click "Inicializar Contrato"
5. ¡Sube tus documentos!

---

Ver README.md para documentación completa.
