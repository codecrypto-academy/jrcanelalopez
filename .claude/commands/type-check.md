---
description: Verificar tipos TypeScript en todo el proyecto
---

Verifica que no haya errores de tipos TypeScript en el proyecto.

Pasos:

1. **Verificar librería**:
   ```bash
   cd lib
   npx tsc --noEmit
   ```

   Mostrar:
   - ✅ Sin errores de tipos en lib/
   - ❌ Errores encontrados (con detalles)

2. **Verificar aplicación**:
   ```bash
   cd app
   npm run type-check
   ```

   Mostrar:
   - ✅ Sin errores de tipos en app/
   - ❌ Errores encontrados (con detalles)

3. **Resumen final**:
   - Total de errores en proyecto
   - Archivos con problemas
   - Sugerencias para resolver

**Cuándo usar**:
- Antes de hacer commit
- Después de cambios significativos en tipos
- Cuando hay errores de compilación confusos
- Como parte de CI/CD
