---
description: Limpiar todas las redes Docker de Besu
---

Limpia completamente todas las redes Docker y contenedores de Besu.

Pasos:

1. Mostrar contenedores actuales de Besu:
   ```bash
   docker ps -a --filter "label=project=besu-network-manager"
   ```

2. Detener todos los contenedores:
   ```bash
   docker stop $(docker ps -aq --filter "label=project=besu-network-manager")
   ```

3. Remover contenedores:
   ```bash
   docker rm -f $(docker ps -aq --filter "label=project=besu-network-manager")
   ```

4. Remover redes Docker de Besu:
   ```bash
   docker network prune -f
   ```

5. Remover volúmenes huérfanos (opcional):
   ```bash
   docker volume prune -f
   ```

6. Verificar limpieza:
   ```bash
   docker ps -a --filter "label=project=besu-network-manager"
   ```

7. Informar al usuario:
   - ✅ Contenedores removidos
   - ✅ Redes limpiadas
   - ✅ Volúmenes eliminados (si aplica)

**Cuándo usar**:
- Antes de ejecutar tests
- Cuando hay errores de "network already exists"
- Cuando hay conflictos de puertos
- Para liberar recursos Docker
