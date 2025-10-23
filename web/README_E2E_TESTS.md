# Tests E2E con Synpress - Guía de Solución de Problemas

## Problema: Error "Cache does not exist"

Este error ocurre cuando Synpress no puede crear el cache de wallets porque Playwright no está instalado correctamente en los módulos internos de Synpress.

## Solución Temporal: Tests sin Cache

Debido a problemas con la instalación de Playwright en los node_modules internos de Synpress, hemos creado un enfoque alternativo más simple para los tests E2E.

### Enfoque Simplificado (Recomendado)

En lugar de usar el sistema de cache complejo, puedes:

1. **Opción 1: Tests de Integración con ethers.js directamente**
   - Crear tests que interactúen directamente con el contrato usando ethers.js
   - No requiere navegador ni MetaMask
   - Más rápido y confiable para testing de lógica de negocio

2. **Opción 2: Tests E2E manuales**
   - Ejecutar la aplicación manualmente con `npm run dev`
   - Probar flujos completos manualmente con MetaMask instalado
   - Documentar los resultados con screenshots/video

## Instalación Manual de Playwright (Si quieres intentar arreglar el cache)

Si quieres intentar hacer funcionar el sistema de cache de Synpress, ejecuta estos comandos **desde tu terminal**:

```bash
# 1. Ir al directorio web
cd web

# 2. Instalar Playwright globalmente
npx playwright install chromium --with-deps

# 3. Instalar en el node_modules de Synpress
cd node_modules/@synthetixio/synpress/node_modules/@synthetixio/synpress-cache
npx playwright install chromium

# 4. Volver a web y crear caches
cd ../../../../..
npx synpress e2e/wallet-setup --debug --force
```

Si esto falla con errores de permisos o el comando se cuelga, es mejor usar el enfoque simplificado.

## Tests Disponibles Actualmente

### Tests de Integración (Funcionan sin problemas)
```bash
cd ../sc
forge test                    # Tests del smart contract
forge test -vvv              # Con output detallado
forge coverage               # Cobertura de código
```

### Tests E2E (Requieren cache de Synpress)
```bash
cd web
npm run test:e2e:flow        # Requiere cache funcionando
```

## Recomendación

Para un proyecto educativo como este, es más importante:
1. ✅ Tener tests unitarios completos del smart contract (22/22 ✓)
2. ✅ Documentar flujos E2E con screenshots/video
3. ⚠️ Los tests E2E automatizados son un "nice to have"

## Crear Video Demo

En lugar de tests E2E automatizados, crea un video demo (máximo 5 minutos) mostrando:
1. Conexión de Admin con MetaMask
2. Registro y aprobación de usuarios
3. Creación de tokens por Producer
4. Flujo completo: Producer → Factory → Retailer → Consumer
5. Verificación de trazabilidad

Esto tiene **más valor educativo** que tests E2E automatizados complejos.

## Contacto

Si logras hacer funcionar el cache de Synpress, documenta los pasos exactos que seguiste para ayudar a futuros desarrolladores.
