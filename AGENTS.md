# Sistema de Agentes IA para Supply Chain Tracker

## Descripción General

Este documento describe el sistema de agentes especializados diseñados específicamente para el desarrollo del proyecto Supply Chain Tracker. Cada agente es un experto en un área particular y puede trabajar de forma autónoma para completar tareas complejas.

## Arquitectura de Agentes

```
┌─────────────────────────────────────────────────────────┐
│                   AGENTE COORDINADOR                     │
│              (Orquesta otros agentes)                    │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   SOLIDITY   │  │   FRONTEND   │  │   TESTING    │
│   EXPERT     │  │   EXPERT     │  │   EXPERT     │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   SECURITY   │  │    WEB3      │  │   DEPLOY     │
│   AUDITOR    │  │  INTEGRATOR  │  │   MANAGER    │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Agentes Disponibles

### 🏗️ Agentes de Construcción

#### 1. Solidity Expert
**Archivo**: `.claude/agents/solidity-expert.md`
**Especialidad**: Desarrollo de Smart Contracts en Solidity
**Capacidades**:
- Implementar contratos siguiendo especificaciones
- Optimizar gas y performance
- Aplicar patrones de diseño de Solidity
- Documentar código con NatSpec
- Resolver errores de compilación

**Cuándo usar**:
- Implementar SupplyChain.sol desde cero
- Añadir nuevas funciones al contrato
- Refactorizar código Solidity
- Optimizar uso de gas

**Ejemplo de uso**:
```
Usa el agente "Solidity Expert" para implementar la función createToken
del contrato SupplyChain.sol según las especificaciones del CLAUDE.md
```

#### 2. Frontend Expert
**Archivo**: `.claude/agents/frontend-expert.md`
**Especialidad**: Desarrollo de aplicaciones Next.js/React con TypeScript
**Capacidades**:
- Crear componentes React reutilizables
- Implementar páginas Next.js con App Router
- Gestionar estado con Context API
- Diseñar UI con Tailwind CSS y shadcn/ui
- Resolver errores de TypeScript

**Cuándo usar**:
- Crear páginas del frontend
- Implementar componentes UI
- Configurar rutas de Next.js
- Diseñar interfaces responsive

**Ejemplo de uso**:
```
Usa el agente "Frontend Expert" para crear la página de dashboard
con componentes de resumen según el rol del usuario
```

#### 3. Web3 Integrator
**Archivo**: `.claude/agents/web3-integrator.md`
**Especialidad**: Integración de blockchain con frontend
**Capacidades**:
- Conectar MetaMask con aplicación
- Implementar Web3Provider con ethers.js
- Crear servicios para interactuar con contratos
- Gestionar transacciones y eventos
- Manejar conversión de BigInt/datos blockchain

**Cuándo usar**:
- Implementar conexión con MetaMask
- Crear Web3Provider y hooks
- Integrar llamadas al contrato
- Gestionar transacciones y eventos

**Ejemplo de uso**:
```
Usa el agente "Web3 Integrator" para implementar el Web3Provider
con persistencia en localStorage y reconexión automática
```

### 🧪 Agentes de Validación

#### 4. Testing Expert
**Archivo**: `.claude/agents/testing-expert.md`
**Especialidad**: Testing exhaustivo de Smart Contracts y Frontend
**Capacidades**:
- Escribir tests unitarios con Foundry
- Crear tests de integración
- Diseñar casos edge y escenarios complejos
- Validar eventos y estado del contrato
- Verificar cobertura de tests

**Cuándo usar**:
- Escribir tests para nuevas funciones
- Alcanzar cobertura del 90%+
- Debuggear tests fallidos
- Crear tests de flujos completos

**Ejemplo de uso**:
```
Usa el agente "Testing Expert" para escribir todos los tests
de la función transfer incluyendo casos edge y validaciones
```

#### 5. Security Auditor
**Archivo**: `.claude/agents/security-auditor.md`
**Especialidad**: Auditoría de seguridad de Smart Contracts
**Capacidades**:
- Identificar vulnerabilidades comunes (reentrancy, overflow, etc.)
- Validar control de accesos y permisos
- Revisar lógica de negocio
- Verificar manejo de fondos
- Sugerir mejoras de seguridad

**Cuándo usar**:
- Antes de desplegar en testnet/mainnet
- Después de cambios importantes
- Para revisión final del proyecto
- Cuando se detectan bugs extraños

**Ejemplo de uso**:
```
Usa el agente "Security Auditor" para revisar el contrato SupplyChain.sol
y generar un reporte de vulnerabilidades y recomendaciones
```

### 🚀 Agentes de Operaciones

#### 6. Deploy Manager
**Archivo**: `.claude/agents/deploy-manager.md`
**Especialidad**: Despliegue y configuración de contratos
**Capacidades**:
- Crear scripts de deploy optimizados
- Configurar redes (local/testnet/mainnet)
- Verificar contratos en exploradores
- Gestionar configuración post-deploy
- Actualizar ABI en frontend

**Cuándo usar**:
- Desplegar contrato en Anvil/testnet
- Crear script de deploy
- Configurar frontend con nueva dirección
- Generar y actualizar ABI

**Ejemplo de uso**:
```
Usa el agente "Deploy Manager" para desplegar SupplyChain.sol
en Anvil y actualizar la configuración del frontend
```

#### 7. Documentation Writer
**Archivo**: `.claude/agents/documentation-writer.md`
**Especialidad**: Documentación técnica y guías de usuario
**Capacidades**:
- Generar documentación de código
- Crear guías de usuario
- Documentar APIs y funciones
- Escribir READMEs y tutoriales
- Actualizar documentación existente

**Cuándo usar**:
- Documentar funciones del contrato
- Crear guías de uso
- Actualizar README con nuevas features
- Generar documentación de API

**Ejemplo de uso**:
```
Usa el agente "Documentation Writer" para generar documentación
completa de todas las funciones públicas del contrato
```

### 🔧 Agentes Especializados

#### 8. Debug Detective
**Archivo**: `.claude/agents/debug-detective.md`
**Especialidad**: Debugging y resolución de problemas
**Capacidades**:
- Analizar errores de compilación
- Debuggear tests fallidos
- Resolver errores de transacciones
- Interpretar logs y trazas de Foundry
- Solucionar problemas de integración

**Cuándo usar**:
- Tests están fallando y no sabes por qué
- Transacciones revierten sin razón clara
- Errores de compilación complejos
- Problemas de integración Web3

**Ejemplo de uso**:
```
Usa el agente "Debug Detective" para analizar por qué
la transferencia está revirtiendo en el test
```

#### 9. Gas Optimizer
**Archivo**: `.claude/agents/gas-optimizer.md`
**Especialidad**: Optimización de gas en Smart Contracts
**Capacidades**:
- Analizar consumo de gas
- Optimizar storage y memoria
- Refactorizar código para eficiencia
- Comparar diferentes implementaciones
- Sugerir mejoras de performance

**Cuándo usar**:
- Cuando el gas es muy alto
- Antes de deploy en mainnet
- Para optimizar funciones críticas
- Refactorización de código

**Ejemplo de uso**:
```
Usa el agente "Gas Optimizer" para reducir el gas
de la función createToken
```

#### 10. MCP Builder
**Archivo**: `.claude/agents/mcp-builder.md`
**Especialidad**: Construcción de Model Context Protocol servers
**Capacidades**:
- Diseñar arquitectura de MCP servers
- Envolver CLIs (forge, anvil, cast)
- Implementar herramientas MCP
- Configurar comunicación stdio/SSE
- Integrar con Claude Code

**Cuándo usar**:
- Construir MCP para Foundry CLI
- Crear herramientas personalizadas
- Integrar herramientas externas
- Automatizar workflows complejos

**Ejemplo de uso**:
```
Usa el agente "MCP Builder" para crear un MCP server
que envuelva los comandos forge, anvil y cast
```

## Uso de Agentes

### Sintaxis Básica

```
Usa el agente "[NOMBRE_AGENTE]" para [TAREA_ESPECÍFICA]
```

### Ejemplos Prácticos

#### Desarrollo de Smart Contract
```
Usa el agente "Solidity Expert" para implementar el struct Token
y la función createToken con todas las validaciones necesarias

Luego usa el agente "Testing Expert" para escribir tests completos
de createToken incluyendo casos edge

Finalmente usa el agente "Security Auditor" para revisar
la implementación y tests
```

#### Desarrollo de Frontend
```
Usa el agente "Frontend Expert" para crear la página /tokens
con lista de tokens del usuario conectado

Luego usa el agente "Web3 Integrator" para conectar la página
con el smart contract y mostrar datos reales
```

#### Pipeline Completo
```
1. "Solidity Expert" → Implementa función
2. "Testing Expert" → Escribe tests
3. "Security Auditor" → Revisa seguridad
4. "Deploy Manager" → Despliega
5. "Documentation Writer" → Documenta
```

## Coordinación de Agentes

### Workflows Predefinidos

#### Workflow 1: Nueva Función del Contrato
```
1. Solidity Expert → Implementa función
2. Testing Expert → Escribe 5+ tests
3. Gas Optimizer → Optimiza si es necesario
4. Security Auditor → Revisa seguridad
5. Documentation Writer → Documenta
```

#### Workflow 2: Nueva Página del Frontend
```
1. Frontend Expert → Crea página y componentes
2. Web3 Integrator → Integra con blockchain
3. Testing Expert → Tests de integración (opcional)
4. Documentation Writer → Guía de uso
```

#### Workflow 3: Deploy Completo
```
1. Testing Expert → Verifica todos los tests pasan
2. Security Auditor → Auditoría final
3. Deploy Manager → Despliega contrato
4. Web3 Integrator → Actualiza configuración
5. Documentation Writer → Guía de deploy
```

#### Workflow 4: Debugging
```
1. Debug Detective → Identifica problema
2. [Agente Relevante] → Implementa fix
3. Testing Expert → Verifica fix con tests
```

## Mejores Prácticas

### ✅ Hacer

1. **Especificar claramente la tarea** al agente
2. **Proporcionar contexto** relevante (archivos, errores)
3. **Usar workflows** para tareas complejas
4. **Validar resultados** después de cada agente
5. **Documentar decisiones** tomadas por agentes

### ❌ No Hacer

1. No usar múltiples agentes simultáneamente sin coordinación
2. No omitir el agente de testing
3. No ignorar advertencias del Security Auditor
4. No desplegar sin pasar por todos los agentes de validación
5. No usar agentes para tareas fuera de su especialidad

## Métricas de Agentes

### Tracking de Uso

Cada vez que uses un agente, se documenta en `.claude/agents/usage-log.json`:

```json
{
  "agent": "Solidity Expert",
  "task": "Implementar createToken",
  "timestamp": "2025-10-16T19:45:00Z",
  "duration": "5 minutes",
  "success": true,
  "files_modified": ["sc/src/SupplyChain.sol"]
}
```

### Estadísticas

El sistema mantiene estadísticas de:
- Agente más usado
- Tasa de éxito por agente
- Tiempo promedio por tipo de tarea
- Workflows más efectivos

## Estructura de Archivos de Agentes

Cada agente tiene su archivo en `.claude/agents/` con:

```markdown
# [Nombre del Agente]

## Rol
[Descripción del rol y especialidad]

## Capacidades
- [Lista de capacidades específicas]

## Prompt del Sistema
[Instrucciones detalladas para el agente]

## Ejemplos de Uso
[Casos de uso concretos]

## Limitaciones
[Qué NO debe hacer este agente]

## Integración con Otros Agentes
[Con qué agentes trabaja mejor]
```

#### 11. Frontend Testing Expert
**Archivo**: `.claude/agents/frontend-testing-expert.md`
**Especialidad**: Testing de integración frontend ↔ smart contract
**Capacidades**:
- Crear tests E2E para flujos de usuario
- Testing de integración Web3 con ethers.js
- Automatizar tests de contratos con Anvil
- Verificar flujos completos (registro, tokens, transferencias)
- Generar reportes de tests coloridos y detallados

**Cuándo usar**:
- Crear tests de flujos de usuario (ej: auto-registro)
- Verificar integración frontend-blockchain
- Automatizar tests de regresión
- Validar comportamiento de DApp

**Ejemplo de uso**:
```
Usa el agente "Frontend Testing Expert" para crear un test que verifique
el flujo: usuario no-admin se registra, admin aprueba, usuario reconectado
es reconocido con su rol correcto
```

#### 12. Playwright E2E Expert 🆕
**Archivo**: `.claude/agents/playwright-e2e-expert.md`
**Especialidad**: Tests E2E avanzados con Playwright y Synpress para DApps Web3
**Capacidades**:
- Configurar y troubleshoot Synpress v4 con MetaMask
- Crear wallet setup files y manejar caches
- Implementar tests multi-wallet con roles diferentes
- Resolver errores comunes de Playwright/Synpress
- Configurar pipelines de tests E2E
- Testing de transacciones blockchain en navegador
- Debugging avanzado con headed mode, traces y videos

**Cuándo usar**:
- Configurar tests E2E con MetaMask desde cero
- Resolver errores de cache de wallets
- Crear flujos de testing multi-usuario (Admin, Producer, Factory, etc.)
- Troubleshoot problemas de Playwright/Synpress
- Implementar tests de transacciones blockchain completos

**Ejemplo de uso**:
```
Usa el agente "Playwright E2E Expert" para resolver el error
"Cache does not exist" en mis tests de Synpress y configurar
correctamente los 5 wallets para testing
```

## Agentes Futuros (Extensiones)

### Potenciales Agentes Adicionales

1. **UI/UX Designer** - Diseño de interfaces y experiencia de usuario
2. **Performance Analyzer** - Análisis de performance frontend
3. **Contract Upgrader** - Gestión de upgrades de contratos
4. **Analytics Integrator** - Integración de analytics y métricas

## Referencias

- Ver especificaciones completas en `.claude/agents/[nombre-agente].md`
- Ver logs de uso en `.claude/agents/usage-log.json`
- Ver métricas en `.claude/agents/metrics.json`

---

**Proyecto**: Supply Chain Tracker
**Sistema de Agentes**: v1.2
**Total de Agentes**: 12
**Última actualización**: 23 de octubre de 2025
**Nuevo**: Playwright E2E Expert - Especialista en tests E2E con Synpress y MetaMask
