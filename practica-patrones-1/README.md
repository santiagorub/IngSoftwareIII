# Actividad en clase: Refactorizando patrones de diseño en un sistema funcional

## Setup rápido

Requisitos: Node 18+ instalado.

```bash
cd patterns-class
npm start
```

Deberían ver en consola la creación de un pedido y un listado de pedidos.

## Código base (intencionalmente "mejorable")

Dominio: tienda de café. Directorios clave:

-   `src/data/database.js`: "DB" en memoria con tablas globales y logs.
-   `src/services/OrderService.js`
-   `src/models/*.js`: modelos simples (`User`, `Product`, `Order`).
-   `src/index.js`: arranque, seed simple y demo.

## Consigna

Trabajen en parejas. Refactoricen progresivamente manteniendo el sistema funcionando en cada paso. No es necesario completar todo si no llegás: prioricen decisiones que reduzcan acoplamiento y mejoren claridad.

### Parte A — DAO y Repository

1. Creen una interfaz/contrato de acceso a datos para `Order` (DAO) con operaciones mínimas: `save(order)` y `findAll()`/`findById(id)`.
2. Implementen un `InMemoryOrderDAO` que use `tables.orders` internamente (pero esconda los detalles). No modifiquen el resto del código aún; inyecten este DAO en `OrderService` o acóplense primero y luego refactoricen.
3. Agreguen un `OrderRepository` que use el DAO y exponga operaciones del dominio (por ejemplo, `getNextId()`, `store(order)`), separando responsabilidades entre acceso crudo (DAO) y semántica de dominio (Repository).

Criterio: `OrderService` no debería acceder a `tables` nunca más.

### Parte B — Dependency Injection

4. Modifiquen `OrderService` para recibir sus dependencias (DAO/Repository, servicio de pagos, generador de IDs) por constructor. Pueden crear un módulo de "ensamblado" simple en `src/app/` que instancie todo y pase dependencias.

Criterio: `OrderService` no debe crear dependencias internas ni requerir módulos globales.

### Parte C — Factory Method (métodos de pago)

5. Extraigan la lógica del `switch (paymentMethod)` a una jerarquía `PaymentStrategy` o `PaymentMethod` con un Factory que devuelva la implementación correcta en base a un input. Ej.: `PaymentFactory.create(method)`.
6. Agreguen un nuevo método de pago (ej. `pix` o `debit_card`) sin tocar `OrderService`.

### Parte D — Builder (Order)

7. Introduzcan un `OrderBuilder` que construya el `Order` y encapsule el cálculo del total, carga de items y estado inicial.
8. Hagan que `OrderService` utilice el builder en lugar de armar objetos a mano.

Criterio: la construcción de `Order` no debería duplicarse ni ser responsabilidad del servicio.

