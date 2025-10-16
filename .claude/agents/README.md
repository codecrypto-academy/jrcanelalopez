# Supply Chain Tracker - Sistema de Agentes IA

Este directorio contiene agentes especializados diseñados para el desarrollo del proyecto Supply Chain Tracker.

## Agentes Disponibles

### 🏗️ Agentes de Construcción

| Agente | Archivo | Especialidad |
|--------|---------|--------------|
| **Solidity Expert** | [solidity-expert.md](solidity-expert.md) | Desarrollo de Smart Contracts |
| **Frontend Expert** | [frontend-expert.md](frontend-expert.md) | Desarrollo Next.js/React/TypeScript |
| **Web3 Integrator** | [web3-integrator.md](web3-integrator.md) | Integración blockchain con frontend |

### 🧪 Agentes de Validación

| Agente | Archivo | Especialidad |
|--------|---------|--------------|
| **Testing Expert** | [testing-expert.md](testing-expert.md) | Testing exhaustivo con Foundry |
| **Security Auditor** | [security-auditor.md](security-auditor.md) | Auditoría de seguridad de contratos |

### 🚀 Agentes de Operaciones

| Agente | Archivo | Especialidad |
|--------|---------|--------------|
| **Deploy Manager** | [deploy-manager.md](deploy-manager.md) | Despliegue y configuración |
| **Documentation Writer** | [documentation-writer.md](documentation-writer.md) | Documentación técnica |

### 🔧 Agentes Especializados

| Agente | Archivo | Especialidad |
|--------|---------|--------------|
| **Debug Detective** | [debug-detective.md](debug-detective.md) | Debugging y resolución de problemas |
| **Gas Optimizer** | [gas-optimizer.md](gas-optimizer.md) | Optimización de gas |
| **MCP Builder** | [mcp-builder.md](mcp-builder.md) | Construcción de MCP servers |

## Cómo Usar los Agentes

### Sintaxis Básica

```
Usa el agente "[NOMBRE_AGENTE]" para [TAREA_ESPECÍFICA]
```

### Ejemplos

#### Smart Contract
```
Usa el agente "Solidity Expert" para implementar la función createToken
con todas las validaciones según el CLAUDE.md
```

#### Testing
```
Usa el agente "Testing Expert" para escribir todos los tests
de la función transfer incluyendo casos edge
```

#### Frontend
```
Usa el agente "Frontend Expert" para crear la página /dashboard
responsive con Tailwind CSS
```

#### Debugging
```
Usa el agente "Debug Detective" para analizar por qué
el test testCreateToken está fallando
```

## Workflows Predefinidos

### Workflow 1: Nueva Función del Contrato
```
1. Solidity Expert → Implementa función
2. Testing Expert → Escribe tests
3. Security Auditor → Revisa seguridad
4. Documentation Writer → Documenta
```

### Workflow 2: Nueva Página del Frontend
```
1. Frontend Expert → Crea página
2. Web3 Integrator → Conecta con blockchain
3. Documentation Writer → Documenta
```

### Workflow 3: Deploy Completo
```
1. Testing Expert → Verifica tests
2. Security Auditor → Auditoría final
3. Deploy Manager → Despliega
4. Web3 Integrator → Actualiza config
```

## Estructura de Cada Agente

Cada archivo de agente contiene:

```markdown
# [Nombre del Agente]

## Rol
Descripción del rol y especialidad

## Capacidades
Lista de capacidades específicas

## Prompt del Sistema
Instrucciones detalladas para el agente

## Ejemplos de Uso
Casos de uso concretos

## Limitaciones
Qué NO debe hacer

## Integración con Otros Agentes
Con qué agentes trabaja mejor

## Outputs Esperados
Qué debe proporcionar al completar
```

## Métricas de Uso

El uso de agentes se trackea en:
- `usage-log.json` - Log de cada uso
- `metrics.json` - Estadísticas agregadas

## Añadir Nuevos Agentes

Para crear un nuevo agente:

1. Crear archivo `nuevo-agente.md` en este directorio
2. Seguir la estructura estándar
3. Añadir a la tabla en `AGENTS.md` raíz
4. Añadir a este README.md
5. Documentar integraciones con otros agentes

## Ver También

- [AGENTS.md](../AGENTS.md) - Documentación completa del sistema de agentes
- [CLAUDE.md](../CLAUDE.md) - Especificaciones técnicas del proyecto
- [README.md](../README.md) - Documentación general del proyecto

---

**Total de Agentes**: 10
**Última actualización**: 16 de octubre de 2025
