# Hooks de Claude Code para Besu Network Manager

Este directorio contiene hooks que se ejecutan automáticamente en respuesta a eventos específicos durante el desarrollo.

## Hooks Disponibles

### 🔄 Hooks de Edición

| Hook | Evento | Propósito |
|------|--------|-----------|
| `after-edit-typescript.sh` | Después de editar archivos `.ts` o `.tsx` | Verifica tipos TypeScript automáticamente |

### 🐳 Hooks de Docker

| Hook | Evento | Propósito |
|------|--------|-----------|
| `after-bash-docker.sh` | Después de ejecutar comandos Docker | Muestra estado actualizado de contenedores Besu |

### 🧪 Hooks de Testing

| Hook | Evento | Propósito |
|------|--------|-----------|
| `after-test-completion.sh` | Después de completar tests | Ofrece limpiar Docker si los tests fallaron |

### 🔒 Hooks de Git

| Hook | Evento | Propósito |
|------|--------|-----------|
| `pre-commit-validation.sh` | Antes de crear commit | Valida que no haya archivos sensibles, tipos correctos, etc. |

### 📊 Hooks de Tracking (opcional)

| Hook | Evento | Propósito |
|------|--------|-----------|
| `user-prompt-submit-tracking.sh` | Cuando se envía un prompt | Tracking básico de uso (deshabilitado por defecto) |

## Descripción Detallada

### `after-edit-typescript.sh`

Se ejecuta automáticamente después de editar cualquier archivo TypeScript.

**Acciones**:
- Detecta si el archivo está en `lib/` o `app/`
- Ejecuta verificación de tipos con `tsc --noEmit`
- Muestra resultado (✅ o ⚠️)

**Útil para**:
- Detectar errores de tipos inmediatamente
- Evitar acumular errores TypeScript
- Feedback rápido durante desarrollo

### `after-bash-docker.sh`

Se ejecuta después de comandos Docker (excepto ps, logs, inspect).

**Acciones**:
- Cuenta contenedores Besu activos
- Muestra estado de contenedores
- Lista redes Docker creadas

**Útil para**:
- Monitorear estado de Docker automáticamente
- Detectar contenedores huérfanos
- Confirmar operaciones Docker exitosas

### `after-test-completion.sh`

Se ejecuta al completar tests (éxito o fallo).

**Acciones**:
- Si los tests fallan, sugiere limpiar Docker
- Ofrece ejecutar cleanup automáticamente
- Si pasan, informa sobre contenedores activos

**Útil para**:
- Recuperarse rápido de tests fallidos
- Mantener Docker limpio
- Evitar conflictos en próximos tests

### `pre-commit-validation.sh`

Se ejecuta ANTES de crear un commit (si está configurado).

**Validaciones**:
1. ✅ No hay archivos sensibles (.env, keys, besu-data/)
2. ✅ No hay errores de tipos TypeScript
3. ✅ No hay node_modules/ en commit
4. ✅ Código está listo para commit

**Bloquea commit si**:
- Hay archivos sensibles
- Hay errores de tipos
- Se intenta commitear node_modules/

**Útil para**:
- Prevenir commits con errores
- Evitar exponer información sensible
- Mantener calidad del código

### `user-prompt-submit-tracking.sh`

Tracking opcional de uso (deshabilitado por defecto).

**Acciones**:
- Registra timestamp de prompts (opcional)
- No afecta funcionalidad

## Configuración de Hooks

### Habilitar/Deshabilitar Hooks

Los hooks se ejecutan automáticamente si están en este directorio. Para deshabilitar un hook:

```bash
# Opción 1: Eliminar permisos de ejecución
chmod -x .claude/hooks/nombre-hook.sh

# Opción 2: Renombrar
mv .claude/hooks/nombre-hook.sh .claude/hooks/nombre-hook.sh.disabled

# Opción 3: Eliminar
rm .claude/hooks/nombre-hook.sh
```

### Personalizar Hooks

Puedes modificar los hooks existentes o crear nuevos:

```bash
#!/bin/bash
# Nuevo hook
set -e

# Tu lógica aquí

exit 0
```

Luego hazlo ejecutable:
```bash
chmod +x .claude/hooks/tu-nuevo-hook.sh
```

## Convenciones de Nombres

Los hooks siguen esta convención de nombres:

- `before-<evento>.sh` - Antes de una acción
- `after-<evento>.sh` - Después de una acción
- `on-<evento>.sh` - Durante una acción

## Variables Disponibles

Los hooks reciben información contextual:

```bash
$1  # Primer argumento (varía según el hook)
$2  # Segundo argumento (si aplica)
```

Ejemplos:
- `after-edit-typescript.sh`: `$1` = path del archivo editado
- `after-bash-docker.sh`: `$1` = comando Docker ejecutado
- `after-test-completion.sh`: `$1` = resultado ("success"/"failure")

## Debugging de Hooks

Para ver qué está haciendo un hook:

```bash
# Ejecutar manualmente
bash -x .claude/hooks/nombre-hook.sh "argumento"

# Ver logs (si el hook escribe logs)
cat .claude/logs/usage.log
```

## Best Practices

1. **Mantén hooks rápidos** - No deben bloquear flujo de trabajo
2. **Maneja errores** - Usa `set -e` y maneja casos edge
3. **Da feedback claro** - Usa emojis y mensajes descriptivos
4. **Haz hooks opcionales** - Permite deshabilitar fácilmente
5. **No hagas cambios destructivos** - Pregunta antes de limpiar

## Hooks vs Comandos

**Comandos** (`.claude/commands/`):
- Se invocan explícitamente por el usuario
- Útiles para tareas on-demand
- Ejemplo: `/test-lib`, `/cleanup-networks`

**Hooks** (`.claude/hooks/`):
- Se ejecutan automáticamente por eventos
- Útiles para automatización y validaciones
- Ejemplo: validar antes de commit, limpiar después de tests

## Troubleshooting

### Hook no se ejecuta

```bash
# Verificar que sea ejecutable
ls -la .claude/hooks/

# Dar permisos
chmod +x .claude/hooks/*.sh
```

### Hook falla

```bash
# Ejecutar manualmente para ver error
bash .claude/hooks/nombre-hook.sh "test-arg"

# Ver con debug
bash -x .claude/hooks/nombre-hook.sh
```

### Deshabilitar todos los hooks temporalmente

```bash
# Renombrar directorio
mv .claude/hooks .claude/hooks.disabled

# Restaurar
mv .claude/hooks.disabled .claude/hooks
```

## Ver También

- [Comandos disponibles](../commands/README.md)
- [Agentes disponibles](../agents/README.md)
- [CLAUDE.md](../../CLAUDE.md) - Especificaciones del proyecto
- [AGENTS.md](../../AGENTS.md) - Sistema de agentes

---

**Total de hooks**: 5
**Última actualización**: 28 de Junio, 2025
**Proyecto**: Besu Network Manager
