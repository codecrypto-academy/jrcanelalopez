---
description: Compilar la aplicación Next.js para producción
---

Compila la aplicación Next.js para producción.

Pasos:

1. Cambiar al directorio de la app:
   ```bash
   cd app
   ```

2. Limpiar builds anteriores (opcional):
   ```bash
   rm -rf .next out
   ```

3. Ejecutar build:
   ```bash
   npm run build
   ```

4. Mostrar resultados:
   - ✅ Build exitoso
   - 📊 Tamaño de bundles
   - ⚠️ Warnings (si los hay)
   - ❌ Errores (si los hay)

5. Si el build es exitoso, informar cómo iniciar:
   ```bash
   npm run start
   ```

**Validaciones**:
- No debe haber errores de TypeScript
- No debe haber errores de ESLint (excepto warnings aceptables)
- Todos los componentes deben compilar correctamente
