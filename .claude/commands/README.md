# Comandos Claude Code para Besu Network Manager

Este directorio contiene comandos personalizados para facilitar el desarrollo del proyecto Besu Network Manager.

## Comandos Disponibles

### 🧪 Testing y Ejemplos

| Comando | Descripción |
|---------|-------------|
| `/test-lib` | Ejecutar tests de la librería TypeScript (individual) |
| `/example-simple` | Ejecutar ejemplo simple de red Besu |

### 🐳 Docker

| Comando | Descripción |
|---------|-------------|
| `/cleanup-networks` | Limpiar todas las redes y contenedores Docker de Besu |
| `/docker-status` | Ver estado de contenedores y redes Docker |
| `/docker-logs` | Ver logs de un contenedor específico |

### 🎨 Aplicación Next.js

| Comando | Descripción |
|---------|-------------|
| `/dev-app` | Iniciar servidor de desarrollo (http://localhost:3000) |
| `/build-app` | Compilar aplicación para producción |

### 🔧 Utilidades

| Comando | Descripción |
|---------|-------------|
| `/type-check` | Verificar tipos TypeScript en todo el proyecto |
| `/check-project` | Verificación completa del estado del proyecto |

## Cómo Usar los Comandos

Simplemente escribe el nombre del comando precedido por `/` en el chat de Claude Code:

```
/test-lib
```

Claude Code ejecutará las instrucciones definidas en el comando correspondiente.

## Comandos Importantes

### Testing

**⚠️ IMPORTANTE**: Los tests de Besu Network Manager deben ejecutarse **individualmente**:

```
/test-lib
```

Luego selecciona qué test ejecutar. NUNCA ejecutes `npm test` sin argumentos.

### Limpieza Docker

Si hay problemas con contenedores o redes:

```
/cleanup-networks
```

Esto limpiará completamente todos los recursos Docker de Besu.

### Verificación del Proyecto

Para verificar que todo esté configurado correctamente:

```
/check-project
```

## Flujo de Trabajo Típico

### Desarrollo de Librería

1. `/check-project` - Verificar estado inicial
2. *Hacer cambios en lib/*
3. `/type-check` - Verificar tipos
4. `/test-lib` - Ejecutar tests específicos
5. `/cleanup-networks` - Limpiar si es necesario

### Desarrollo de Frontend

1. `/dev-app` - Iniciar servidor de desarrollo
2. *Hacer cambios en app/*
3. `/type-check` - Verificar tipos
4. `/build-app` - Build para producción (cuando esté listo)

### Debugging

1. `/docker-status` - Ver estado de contenedores
2. `/docker-logs` - Ver logs específicos
3. `/cleanup-networks` - Limpiar y empezar de nuevo

## Personalización

Puedes crear tus propios comandos agregando archivos `.md` en este directorio. Cada archivo debe tener:

```markdown
---
description: Breve descripción del comando
---

Instrucciones detalladas de lo que Claude Code debe hacer cuando se ejecute este comando.
```

## Notas

- Estos comandos están diseñados específicamente para Besu Network Manager
- Algunos comandos requieren que Docker esté ejecutándose
- Los comandos pueden combinarse para flujos de trabajo complejos
- Revisa `.claude/hooks/` para automatizaciones post-ejecución

---

**Total de comandos**: 9
**Última actualización**: 28 de Junio, 2025
**Proyecto**: Besu Network Manager
