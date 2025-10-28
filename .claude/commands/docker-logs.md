---
description: Ver logs de un contenedor Besu específico
---

Muestra los logs de un contenedor Besu para debugging.

Pasos:

1. **Listar contenedores disponibles**:
   ```bash
   echo "Contenedores Besu disponibles:"
   docker ps -a --filter "label=project=besu-network-manager" --format "{{.Names}}"
   ```

2. **Preguntar al usuario** qué contenedor quiere ver (o usar el parámetro si se proporciona)

3. **Mostrar logs**:
   ```bash
   docker logs <container-name> --tail 100 --follow
   ```

   Opciones:
   - `--tail 100`: Últimas 100 líneas
   - `--follow`: Seguir logs en tiempo real
   - `--timestamps`: Agregar timestamps

4. **Alternativamente**, buscar errores específicos:
   ```bash
   docker logs <container-name> 2>&1 | grep -i error
   ```

5. **Informar al usuario**:
   - Presionar Ctrl+C para detener el follow
   - Cómo guardar logs en archivo si es necesario
   - Patrones comunes de errores a buscar

**Útil para**:
- Debugging cuando nodos no se sincronizan
- Ver errores de consenso
- Verificar conectividad entre nodos
- Analizar performance
