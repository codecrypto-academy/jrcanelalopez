---
description: Ver estado de contenedores y redes Docker de Besu
---

Muestra el estado actual de todos los contenedores y redes Docker relacionados con Besu.

Pasos:

1. **Contenedores de Besu**:
   ```bash
   echo "📦 Contenedores Besu:"
   docker ps -a --filter "label=project=besu-network-manager" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
   ```

2. **Redes Docker**:
   ```bash
   echo -e "\n🌐 Redes Docker:"
   docker network ls --filter "label=project=besu-network-manager" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"
   ```

3. **Volúmenes (si existen)**:
   ```bash
   echo -e "\n💾 Volúmenes:"
   docker volume ls --filter "label=project=besu-network-manager" --format "table {{.Name}}\t{{.Driver}}"
   ```

4. **Uso de recursos**:
   ```bash
   echo -e "\n📊 Uso de recursos:"
   docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker ps -q --filter "label=project=besu-network-manager")
   ```

5. **Resumen**:
   - Total de contenedores (running/stopped)
   - Total de redes
   - Total de volúmenes
   - Sugerencias (cleanup si hay muchos stopped)

**Útil para**:
- Debugging de problemas de red
- Verificar que cleanup funcionó
- Monitoreo de recursos
- Antes de ejecutar tests
