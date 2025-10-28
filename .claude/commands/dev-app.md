---
description: Iniciar servidor de desarrollo de la app Next.js
---

Inicia el servidor de desarrollo de la aplicación Next.js.

Pasos:

1. Cambiar al directorio de la app:
   ```bash
   cd app
   ```

2. Verificar que las dependencias estén instaladas:
   ```bash
   if [ ! -d "node_modules" ]; then
     echo "📦 Installing dependencies..."
     npm install
   fi
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Informar al usuario:
   - 🚀 Servidor iniciado en http://localhost:3000
   - 📝 El servidor se recarga automáticamente con cambios
   - 🛑 Presionar Ctrl+C para detener

**Notas**:
- El servidor quedará ejecutándose en primer plano
- Los cambios en archivos se reflejan automáticamente
- Revisar la consola para errores de compilación
