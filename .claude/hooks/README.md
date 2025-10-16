# Hooks de Claude Code para Supply Chain Tracker

Este directorio contiene hooks personalizados que se ejecutan automáticamente en respuesta a eventos durante el desarrollo con Claude Code.

## Tipos de Hooks Disponibles

### Hooks de Archivo
- `after-edit` - Se ejecuta después de editar un archivo
- `after-write` - Se ejecuta después de crear/escribir un archivo
- `after-read` - Se ejecuta después de leer un archivo

### Hooks de Herramientas
- `after-bash` - Se ejecuta después de un comando bash
- `after-task` - Se ejecuta después de completar una tarea

### Hooks de Usuario
- `user-prompt-submit` - Se ejecuta cuando el usuario envía un mensaje

## Hooks Implementados en Este Proyecto

### 1. `after-edit-solidity.sh`
**Trigger**: Después de editar archivos `.sol`
**Acción**: Compila automáticamente el contrato con `forge build`

### 2. `after-write-solidity.sh`
**Trigger**: Después de crear nuevos archivos `.sol`
**Acción**: Compila y muestra estructura del contrato

### 3. `after-bash-foundry.sh`
**Trigger**: Después de ejecutar comandos forge/anvil/cast
**Acción**: Valida resultado y sugiere próximos pasos

### 4. `after-edit-test.sh`
**Trigger**: Después de editar archivos de test (`.t.sol`)
**Acción**: Ejecuta tests automáticamente

### 5. `user-prompt-submit-session.sh`
**Trigger**: Al enviar cada mensaje
**Acción**: Actualiza métricas de la sesión actual

## Configuración

Los hooks deben ser ejecutables:
```bash
chmod +x .claude/hooks/*.sh
```

## Desactivar Hooks

Para desactivar un hook temporalmente, renómbralo añadiendo `.disabled`:
```bash
mv after-edit-solidity.sh after-edit-solidity.sh.disabled
```

## Notas Importantes

- Los hooks son scripts shell que deben retornar exit code 0 para éxito
- Si un hook falla (exit code != 0), se muestra un mensaje al usuario
- Los hooks tienen acceso a variables de entorno con contexto del evento
- Los hooks pueden ser usados para validaciones, compilaciones, tests automáticos, etc.

---

**Proyecto**: Supply Chain Tracker
**Actualizado**: 16 de octubre de 2025
