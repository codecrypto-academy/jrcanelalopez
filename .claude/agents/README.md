# Besu Network Manager - Sistema de Agentes IA

Este directorio contiene agentes especializados diseñados para el desarrollo del proyecto **Besu Network Manager**.

## Agentes Disponibles

### 🏗️ Agentes de Construcción

| Agente | Archivo | Especialidad |
|--------|---------|--------------|
| **TypeScript Expert** | [typescript-expert.md](typescript-expert.md) | Desarrollo de librería Besu con TypeScript |
| **Docker Expert** | [docker-expert.md](docker-expert.md) | Gestión de contenedores y redes Docker |
| **Blockchain Expert** | [blockchain-expert.md](blockchain-expert.md) | Consenso y redes Hyperledger Besu |
| **Besu Private Networks Expert** | [besu-private-networks-expert.md](besu-private-networks-expert.md) | Redes privadas Besu, genesis, consenso PoA |
| **Frontend Expert** | [frontend-expert.md](frontend-expert.md) | Desarrollo Next.js/React para UI |
| **API Expert** | [api-expert.md](api-expert.md) | REST API con Next.js App Router |

### 🧪 Agentes de Validación

| Agente | Archivo | Especialidad |
|--------|---------|--------------|
| **Testing Expert** | [testing-expert.md](testing-expert.md) | Testing con Jest (unit e integration) |
| **Security Expert** | [security-expert.md](security-expert.md) | Validaciones y seguridad de red |
| **Frontend Testing Expert** | [frontend-testing-expert.md](frontend-testing-expert.md) | Testing de componentes UI |

### 🚀 Agentes de Operaciones

| Agente | Archivo | Especialidad |
|--------|---------|--------------|
| **Deploy Manager** | [deploy-manager.md](deploy-manager.md) | Despliegue de redes Besu |
| **Documentation Writer** | [documentation-writer.md](documentation-writer.md) | Documentación técnica |
| **Git Manager** | [git-manager.md](git-manager.md) | Control de versiones |

### 🔧 Agentes Especializados

| Agente | Archivo | Especialidad |
|--------|---------|--------------|
| **Debug Detective** | [debug-detective.md](debug-detective.md) | Debugging y resolución de problemas |

## Cómo Usar los Agentes

### Sintaxis Básica

```
Usa el agente "[NOMBRE_AGENTE]" para [TAREA_ESPECÍFICA]
```

### Ejemplos por Área

#### Desarrollo de Librería TypeScript

```
Usa el agente "TypeScript Expert" para implementar la función removeMultipleNodes()
que permita remover varios nodos a la vez con validaciones robustas
```

```
Usa el agente "Blockchain Expert" para diseñar la configuración de genesis
para una red IBFT2 con 7 validadores
```

```
Usa el agente "Besu Private Networks Expert" para crear un genesis file
QBFT completo con 4 validadores y configuración de producción
```

```
Usa el agente "Besu Private Networks Expert" para diseñar una topología
de red privada con 2 bootnodes, 7 validadores QBFT y 3 nodos RPC
```

#### Gestión de Docker

```
Usa el agente "Docker Expert" para optimizar la creación de redes Docker
y reducir conflictos de subnet
```

```
Usa el agente "Docker Expert" para implementar health checks HTTP
que verifiquen que los nodos Besu responden correctamente
```

#### Desarrollo Frontend

```
Usa el agente "Frontend Expert" para crear la página /networks/[id]/edit
responsive con Tailwind CSS y validación con Zod
```

```
Usa el agente "API Expert" para crear el endpoint POST /api/networks/[id]/nodes
que permita agregar un nodo dinámicamente
```

#### Testing

```
Usa el agente "Testing Expert" para escribir todos los tests
de la función updateNetworkConfig() incluyendo casos edge
```

```
Usa el agente "Frontend Testing Expert" para escribir tests
del componente NetworkForm con React Testing Library
```

#### Debugging

```
Usa el agente "Debug Detective" para analizar por qué
el contenedor besu-mynetwork-miner1 se detiene inesperadamente
```

## Workflows Predefinidos

### Workflow 1: Nueva Función de Librería

```
1. Blockchain Expert → Diseña funcionalidad y validaciones
2. TypeScript Expert → Implementa función con validaciones
3. Testing Expert → Escribe tests unitarios
4. Security Expert → Revisa validaciones
5. Documentation Writer → Documenta API
```

**Ejemplo**:
```
Workflow "Nueva Función de Librería" para implementar la función
addMultipleMiners() que agregue varios miners a la vez con
sus signerAccounts correspondientes
```

### Workflow 2: Nueva Página del Frontend

```
1. Frontend Expert → Crea página y componentes
2. API Expert → Implementa endpoints REST
3. Frontend Testing Expert → Escribe tests de componentes
4. Documentation Writer → Documenta UI y API
```

**Ejemplo**:
```
Workflow "Nueva Página del Frontend" para crear la página
/networks/[id]/monitoring que muestre métricas en tiempo real
```

### Workflow 3: Nueva Validación de Seguridad

```
1. Security Expert → Identifica caso edge o vulnerabilidad
2. TypeScript Expert → Implementa validación
3. Testing Expert → Escribe tests de validación
4. Documentation Writer → Documenta en CLAUDE.md
```

**Ejemplo**:
```
Workflow "Nueva Validación de Seguridad" para prevenir que
se puedan crear nodos con IPs duplicadas
```

### Workflow 4: Debugging Completo

```
1. Debug Detective → Identifica root cause
2. Testing Expert → Crea test reproduciendo bug
3. [Agente relevante] → Implementa fix
4. Testing Expert → Valida fix con tests
5. Git Manager → Crea commit descriptivo
```

**Ejemplo**:
```
Workflow "Debugging Completo" para resolver el error
"Cannot connect to Docker daemon" en tests
```

### Workflow 5: Optimización de Performance

```
1. Docker Expert → Analiza uso de recursos Docker
2. TypeScript Expert → Optimiza operaciones asíncronas
3. Testing Expert → Benchmarks y tests de performance
4. Documentation Writer → Documenta mejoras
```

**Ejemplo**:
```
Workflow "Optimización de Performance" para reducir el tiempo
de creación de redes de 45s a menos de 20s
```

## Estructura de Cada Agente

Cada archivo de agente sigue esta estructura:

```markdown
# [Nombre del Agente]

## Rol
Descripción concisa del rol principal

## Especialidad
Tecnologías y áreas específicas

## Capacidades
- Lista de capacidades específicas
- Operaciones que puede realizar
- Herramientas que domina

## Prompt del Sistema
Instrucciones detalladas para el agente

### Contexto del Proyecto
### Principios de Diseño
### Patrones de Código

## Ejemplos de Uso
Casos de uso concretos

## Limitaciones
Qué NO debe hacer

## Integración con Otros Agentes
Con qué agentes trabaja mejor

## Outputs Esperados
Qué debe proporcionar al completar
```

## Agentes por Caso de Uso

### Desarrollo de Librería (`lib/`)

**Agentes principales**:
- TypeScript Expert
- Docker Expert
- Blockchain Expert
- Besu Private Networks Expert
- Testing Expert

**Workflow típico**:
```
1. Blockchain Expert diseña funcionalidad
2. TypeScript Expert implementa
3. Docker Expert valida operaciones Docker
4. Testing Expert escribe tests
```

### Desarrollo de Frontend (`app/`)

**Agentes principales**:
- Frontend Expert
- API Expert
- Frontend Testing Expert

**Workflow típico**:
```
1. Frontend Expert crea UI
2. API Expert implementa endpoints
3. Frontend Testing Expert escribe tests
```

### Debugging y Resolución de Problemas

**Agentes principales**:
- Debug Detective
- Docker Expert (si involucra Docker)
- Testing Expert

**Workflow típico**:
```
1. Debug Detective analiza error
2. Testing Expert crea test reproduciendo bug
3. [Agente relevante] implementa fix
```

### Documentación

**Agentes principales**:
- Documentation Writer
- TypeScript Expert (para API docs)
- Frontend Expert (para UI docs)

**Workflow típico**:
```
1. Documentation Writer estructura documentación
2. Expertos técnicos proveen detalles
3. Documentation Writer integra y formatea
```

## Prioridad de Agentes por Frecuencia de Uso

### Alta Prioridad (Uso diario)
- TypeScript Expert
- Docker Expert
- Testing Expert
- Blockchain Expert
- Besu Private Networks Expert
- Debug Detective

### Media Prioridad (Uso frecuente)
- Frontend Expert
- API Expert
- Security Expert
- Documentation Writer

### Baja Prioridad (Uso ocasional)
- Frontend Testing Expert
- Deploy Manager
- Git Manager

## Añadir Nuevos Agentes

Para crear un nuevo agente especializado:

1. **Crear archivo** `.claude/agents/nuevo-agente.md`
2. **Seguir estructura** estándar
3. **Añadir a este README.md** en tabla correspondiente
4. **Añadir a AGENTS.md** raíz
5. **Documentar integraciones** con otros agentes
6. **Crear ejemplos** de uso específicos

## Ver También

- [AGENTS.md](../../AGENTS.md) - Documentación completa del sistema de agentes
- [CLAUDE.md](../../CLAUDE.md) - Especificaciones técnicas del proyecto
- [README.md](../../README.md) - Documentación general del proyecto
- [lib/README.md](../../lib/README.md) - Documentación de librería
- [app/README.md](../../app/README.md) - Documentación de aplicación

---

**Total de Agentes**: 13
**Proyecto**: Besu Network Manager
**Última actualización**: 28 de Octubre, 2025
