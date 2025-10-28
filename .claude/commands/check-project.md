---
description: Verificar estado completo del proyecto
---

Realiza una verificación completa del estado del proyecto Besu Network Manager.

Pasos:

1. **Verificar estructura de directorios**:
   ```bash
   echo "📁 Estructura del proyecto:"
   ls -d lib/ app/ script/ .claude/ 2>/dev/null || echo "❌ Falta algún directorio"
   ```

2. **Verificar dependencias instaladas**:
   ```bash
   echo -e "\n📦 Dependencias:"
   echo "lib/: $([ -d "lib/node_modules" ] && echo "✅" || echo "❌ npm install")"
   echo "app/: $([ -d "app/node_modules" ] && echo "✅" || echo "❌ npm install")"
   echo "script/: $([ -d "script/node_modules" ] && echo "✅" || echo "❌ npm install")"
   ```

3. **Verificar Docker**:
   ```bash
   echo -e "\n🐳 Docker:"
   docker version > /dev/null 2>&1 && echo "✅ Docker ejecutándose" || echo "❌ Docker no disponible"
   ```

4. **Verificar TypeScript**:
   ```bash
   echo -e "\n📘 TypeScript:"
   cd lib && npx tsc --noEmit && echo "✅ Sin errores de tipos" || echo "❌ Errores de tipos"
   cd ..
   ```

5. **Verificar contenedores activos**:
   ```bash
   echo -e "\n📦 Contenedores Besu activos:"
   docker ps --filter "label=project=besu-network-manager" --format "{{.Names}}" | wc -l
   ```

6. **Resumen**:
   - ✅ Proyecto configurado correctamente
   - ⚠️ Advertencias si algo falta
   - ❌ Errores críticos
   - 💡 Sugerencias de siguientes pasos

**Usar**:
- Después de clonar el proyecto
- Antes de empezar a trabajar
- Para diagnosticar problemas
- En onboarding de nuevos desarrolladores
