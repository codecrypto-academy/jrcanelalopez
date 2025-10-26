Hola, soy Javier Ruiz-Canela y os presento **Supply Chain Tracker**, una DApp educativa desarrollada en Solidity y Next.js que permite gestionar la trazabilidad de productos en una cadena de suministro usando blockchain Ethereum.

El sistema tokeniza materias primas y productos, rastreando su movimiento a través de cuatro roles: Producer, Factory, Retailer y Consumer.

DURANTE REGISTRO DEL CONSUMER

El proyecto también incluye un mcp para ejecutar comandos forge, cast y anvil.

durante la aprobación del ROL CONSUMER:

**Sistema de roles y permisos**: Solo el admin puede registrar usuarios. Los flujos de transferencia están validados en el smart contract, no solo en el frontend.

DURANTE la creación del TOKEN patatas:

---

"El corazón del sistema es el smart contract SupplyChain.sol, que implementa tres estructuras principales:

**Token**: representa materias primas o productos derivados, con ID único, nombre, supply total, metadatos JSON y un sistema de parentId para trazabilidad.

DURANTE LA TRANSFERENCIA AL FACTORY:

otra estructura seria:

**Transfer**: gestiona las transferencias entre usuarios con un sistema de aprobación pendiente-aceptado-rechazado.

DURANTE LA APROBACIÓN DE TRANSFERENCIA:

**User**: almacena información de usuarios registrados con sus roles y estados de aprobación.

DURANTE LA CREACIÓN DEL TOKEN TORTILLA DE PATATAS.

**Sistema de aprobación**: Todas las transferencias requieren aceptación del destinatario, evitando envíos no deseados.

DURANTE LA TRANSFERENCIA AL FACTORY:

**Persistencia local**: La aplicación usa localStorage para mantener la sesión del usuario y reconectar automáticamente al recargar.

DURANTE LA APROBACIÓN DE TRANSFERENCIA:

**Design System**: La UI está construida con Tailwind CSS y es completamente responsive, funcionando en móvil, tablet y desktop.

DURANTE LA CREACIÓN DEL TOKEN :

**Testing exhaustivo**: El proyecto incluye 22 tests unitarios del smart contract con Foundry, y configuración completa para tests E2E con Playwright y Synpress."

durante la transferencia a retailers:

El contrato implementa validación estricta de flujos: Producer puede transferir a Factory, Factory a Retailer, Retailer a Consumer, pero Consumer no puede transferir más.

Este proyecto demuestra el uso de blockchain para trazabilidad en cadenas de suministro, implementando smart contracts seguros, una interfaz de usuario intuitiva y un sistema de testing robusto.

Gracias por ver esta demo."
