---
description: Verificar estado del proyecto completo
---

Realiza una verificación completa del estado del proyecto Supply Chain Tracker.

Instrucciones:
1. Verifica la estructura de directorios (sc/ y web/)
2. En `sc/`:
   - Compila el contrato: `forge build`
   - Ejecuta los tests: `forge test`
   - Muestra estadísticas de tests (pasados/fallados/total)
3. En `web/`:
   - Verifica que package.json existe
   - Lista las páginas implementadas en `src/app/`
   - Verifica la existencia de componentes clave
4. Genera un resumen del estado:
   - ✅ Smart contract: compilado/tests pasando
   - ✅ Frontend: páginas implementadas
   - ⚠️ Pendientes: funcionalidades faltantes
5. Sugiere próximos pasos basándose en lo que falta
