# Guía de Uso de Hooks - Supply Chain Tracker

## Resumen de Hooks Implementados

### 🔨 Hooks de Smart Contract

#### 1. `after-edit-solidity.sh`
**Cuándo se ejecuta**: Al editar archivos `.sol` en `sc/src/`
**Qué hace**:
- Compila automáticamente con `forge build`
- Muestra warnings si los hay
- Informa si la compilación falla

**Ejemplo de salida**:
```
🔨 [Hook] Compilando contrato modificado...
✅ [Hook] Compilación exitosa
```

#### 2. `after-write-solidity.sh`
**Cuándo se ejecuta**: Al crear nuevos archivos `.sol`
**Qué hace**:
- Compila el nuevo contrato
- Muestra estructura básica (contratos, funciones, eventos)
- Sugiere ejecutar tests si es un archivo de test

**Ejemplo de salida**:
```
📝 [Hook] Nuevo contrato Solidity creado: SupplyChain.sol
🔨 [Hook] Compilando nuevo contrato...
✅ [Hook] Compilación exitosa
📊 [Hook] Estructura del contrato:
contract SupplyChain {
    function createToken(...) public {
    event TokenCreated(...);
```

#### 3. `after-edit-test.sh`
**Cuándo se ejecuta**: Al editar archivos `.t.sol` (tests)
**Qué hace**:
- Compila el contrato
- Ejecuta todos los tests automáticamente
- Muestra resumen de resultados
- Alerta si hay tests fallidos

**Ejemplo de salida**:
```
🧪 [Hook] Test modificado, ejecutando tests...
▶️  [Hook] Ejecutando forge test...
✅ [Hook] Todos los tests pasaron
```

#### 4. `after-bash-foundry.sh`
**Cuándo se ejecuta**: Después de comandos `forge`, `anvil`, o `cast`
**Qué hace**:
- Valida el resultado del comando
- Sugiere próximos pasos lógicos
- Muestra información útil (ej: cuentas de Anvil)

**Ejemplo de salida**:
```
✅ [Hook] Compilación exitosa
💡 Próximos pasos: forge test (ejecutar tests)
```

### ⚛️  Hooks de Frontend

#### 5. `after-write-frontend.sh`
**Cuándo se ejecuta**: Al crear archivos `.tsx` o `.ts` en `web/`
**Qué hace**:
- Detecta tipo de archivo (página, componente, hook, contexto)
- Muestra información de la ruta (para páginas)
- Da recomendaciones específicas (ej: 'use client' para Web3)

**Ejemplo de salida**:
```
⚛️  [Hook] Archivo frontend creado: page.tsx
📄 [Hook] Nueva página Next.js detectada
🔗 Ruta: /dashboard
```

### 📊 Hooks de Tracking

#### 6. `user-prompt-submit-tracking.sh`
**Cuándo se ejecuta**: Cada vez que envías un mensaje
**Qué hace**:
- Incrementa contador de interacciones
- Guarda estadísticas en `current-session.json`
- Cada 10 interacciones, recuerda documentar

**Ejemplo de salida** (cada 10 mensajes):
```
💾 [Hook] Llevas 10 interacciones en esta sesión
💡 Considera documentar esta sesión pronto
```

#### 7. `after-task-complete.sh`
**Cuándo se ejecuta**: Al completar una tarea con el agente Task
**Qué hace**:
- Confirma tarea completada
- Sugiere próximo paso lógico según tipo de tarea
- Recuerda documentar

**Ejemplo de salida**:
```
✅ [Hook] Tarea completada: Implementar SupplyChain.sol
💡 Próximo paso: Escribir tests para el contrato
📝 Recuerda: Documenta esta tarea en la sesión actual
```

### 🔒 Hooks de Validación

#### 8. `pre-commit-validation.sh`
**Cuándo se ejecuta**: Antes de hacer commit (opcional)
**Qué hace**:
- Valida que el smart contract compile
- Verifica que todos los tests pasen
- Valida build del frontend
- Bloquea commit si hay errores críticos

**Ejemplo de salida**:
```
🔍 [Hook] Validación pre-commit...
📋 Validando Smart Contract...
✅ Smart Contract válido
📋 Validando Frontend...
✅ Frontend válido
✅ [Hook] Validación completada
```

## Gestión de Hooks

### Activar/Desactivar Hooks

**Desactivar un hook temporalmente**:
```bash
mv .claude/hooks/after-edit-test.sh .claude/hooks/after-edit-test.sh.disabled
```

**Reactivar un hook**:
```bash
mv .claude/hooks/after-edit-test.sh.disabled .claude/hooks/after-edit-test.sh
```

### Verificar que los hooks son ejecutables

```bash
ls -la .claude/hooks/*.sh
```

Si no son ejecutables:
```bash
chmod +x .claude/hooks/*.sh
```

## Configuración Avanzada

### Integrar con Git Hooks

Para usar `pre-commit-validation.sh` con git:

```bash
# Copiar a git hooks
cp .claude/hooks/pre-commit-validation.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Personalizar Hooks

Puedes editar cualquier hook para adaptarlo a tus necesidades:

```bash
# Ejemplo: Hacer que after-edit-test.sh solo compile sin ejecutar tests
nano .claude/hooks/after-edit-test.sh
```

### Variables de Entorno Disponibles

Los hooks reciben información del contexto:

- `$1` - Path del archivo (para hooks de archivo)
- `$1` - Comando ejecutado (para hooks de bash)
- `$2` - Exit code del comando (para hooks de bash)
- `$1` - Descripción de tarea (para hooks de task)

## Debugging de Hooks

Si un hook falla, puedes ejecutarlo manualmente:

```bash
# Ejemplo: probar el hook de compilación
.claude/hooks/after-edit-solidity.sh sc/src/SupplyChain.sol
```

Ver salida detallada:
```bash
bash -x .claude/hooks/after-edit-solidity.sh sc/src/SupplyChain.sol
```

## Mejores Prácticas

1. **No desactivar hooks de validación** durante desarrollo normal
2. **Revisar mensajes de hooks** - contienen información útil
3. **Usar hooks para automatizar** tareas repetitivas
4. **Documentar cambios** si personalizas hooks
5. **Mantener hooks ligeros** - deben ejecutarse rápido

## Troubleshooting

### Hook no se ejecuta
- Verificar permisos: `chmod +x .claude/hooks/*.sh`
- Verificar nombre del archivo (debe terminar en `.sh`)
- Verificar que no esté renombrado como `.disabled`

### Hook falla constantemente
- Ejecutar manualmente para ver error detallado
- Verificar que las herramientas necesarias estén instaladas (forge, npm, etc.)
- Revisar paths en el script

### Hook es muy lento
- Considerar desactivarlo temporalmente
- Optimizar el script (ej: compilar solo si cambió el archivo)
- Mover validaciones pesadas a pre-commit

---

**Proyecto**: Supply Chain Tracker
**Última actualización**: 16 de octubre de 2025
