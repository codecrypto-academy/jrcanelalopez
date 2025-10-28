---
description: Ejecutar tests de la librería Besu con Jest
---

Ejecuta los tests de la librería TypeScript ubicada en `lib/`.

**IMPORTANTE**: Los tests de Besu Network Manager deben ejecutarse **individualmente**, nunca en paralelo, porque crean redes Docker reales con recursos exclusivos.

Pasos a seguir:

1. Cambiar al directorio de la librería:
   ```bash
   cd lib
   ```

2. Listar los archivos de test disponibles:
   ```bash
   ls _test_/*.test.ts
   ```

3. Preguntar al usuario qué test quiere ejecutar o si quiere ejecutar uno específico

4. Ejecutar el test individual:
   ```bash
   npm test _test_/besu.test.ts
   # o
   npm test -- --testNamePattern="nombre del test específico"
   ```

5. Mostrar resultados:
   - Tests pasados/fallados
   - Cobertura (si aplica)
   - Errores (si los hay)

**Notas**:
- NUNCA ejecutar `npm test` sin argumentos (causará conflictos)
- Limpiar Docker antes si hay fallos: `npm run cleanup-networks`
- Esperar a que termine completamente antes de ejecutar otro test
