---
description: Ejecutar el ejemplo simple de red Besu
---

Ejecuta el ejemplo simple de red Besu que crea una red básica con 4 nodos.

Pasos:

1. Cambiar al directorio de la librería:
   ```bash
   cd lib
   ```

2. Ejecutar el ejemplo simple:
   ```bash
   npm run example:simple
   ```

3. El ejemplo hará:
   - Crear red con 4 nodos (1 bootnode, 1 miner, 2 RPC)
   - Iniciar contenedores Docker
   - Verificar conectividad
   - Financiar 5 cuentas con 10 ETH cada una
   - Consultar balances
   - Mostrar información de la red
   - Limpiar automáticamente al finalizar

4. Monitorear la ejecución y mostrar:
   - ✅ Pasos completados exitosamente
   - ❌ Errores si ocurren
   - 📊 Estadísticas finales

**Notas**:
- El ejemplo limpia automáticamente los recursos
- Esperar ~60 segundos para ejecución completa
- Si falla, verificar que Docker esté ejecutándose
