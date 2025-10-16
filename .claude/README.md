# Comandos Claude Code para Supply Chain Tracker

Este directorio contiene comandos personalizados para facilitar el desarrollo del proyecto Supply Chain Tracker.

## Comandos Disponibles

### Smart Contract

- `/test-sc` - Ejecutar tests del smart contract con Foundry
- `/build-sc` - Compilar el smart contract con Foundry
- `/coverage-sc` - Generar reporte de cobertura de tests
- `/review-contract` - Revisar el smart contract en busca de mejoras y vulnerabilidades
- `/deploy-local` - Desplegar smart contract en Anvil local
- `/generate-abi` - Generar y copiar el ABI del contrato al frontend

### Frontend

- `/build-frontend` - Compilar el frontend Next.js
- `/lint-frontend` - Ejecutar linter del frontend
- `/create-component` - Crear un nuevo componente React

### Desarrollo y Testing

- `/start-anvil` - Iniciar blockchain local Anvil
- `/create-test` - Crear un nuevo test para el smart contract
- `/check-project` - Verificar estado del proyecto completo

### Utilidades

- `/setup-project` - Guía de configuración inicial del proyecto
- `/explain-flow` - Explicar un flujo específico del sistema

## Cómo Usar los Comandos

Simplemente escribe el nombre del comando precedido por `/` en el chat de Claude Code:

```
/test-sc
```

Claude Code ejecutará las instrucciones definidas en el comando correspondiente.

## Personalización

Puedes crear tus propios comandos agregando archivos `.md` en el directorio `.claude/commands/`. Cada archivo debe tener:

```markdown
---
description: Breve descripción del comando
---

Instrucciones detalladas de lo que Claude Code debe hacer cuando se ejecute este comando.
```

## Notas

- Estos comandos están diseñados específicamente para el proyecto Supply Chain Tracker
- Algunos comandos requieren que Anvil esté corriendo o que ciertas dependencias estén instaladas
- Los comandos pueden combinarse para flujos de trabajo complejos

---

Creado para facilitar el desarrollo del proyecto educativo Supply Chain Tracker
