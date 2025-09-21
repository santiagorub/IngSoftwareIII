# Actividad en clase: Refactorizando patrones de diseño en un sistema funcional

## Setup rápido (con base de datos real en Docker)

Requisitos: Node 18+ y Docker/Docker Compose instalados.

1) Levantar Postgres (seeder automático):
```bash
cd practica-patrones-1
docker compose up -d
```

2) Instalar dependencias Node:
```bash
npm install
```

3) Ejecutar demo:
```bash
npm start
```

Deberías ver: conexión a Postgres, listado de productos (desde la DB), creación de un pedido y su posterior listado.

## Código base

Dominio: tienda de café. Directorios clave:

-   `src/data/database.js`
-   `src/services/OrderService.js`
-   `src/models/*.js`: modelos simples (`User`, `Product`, `Order`).
-   `src/index.js`: arranque, lee productos desde Postgres y corre la demo.

### Configuración de base de datos

- Archivo `docker-compose.yml` levanta un Postgres 16 con DB `coffee_store` y usuario `app/app`.
- Script `db/init.sql` crea tablas: `users`, `products`, `orders`, `order_items` y hace un seed mínimo.
- Variables de conexión (con defaults):
  - `DB_HOST=localhost`
  - `DB_PORT=5432`
  - `DB_USER=app`
  - `DB_PASSWORD=app`
  - `DB_NAME=coffee_store`

Si necesitás parar y limpiar los datos:
```bash
docker compose down -v
```

## Consigna

Trabajen en parejas o solo. Refactoricen progresivamente manteniendo el sistema funcionando en cada paso. No es necesario completar todo si no llegás: prioricen decisiones que reduzcan acoplamiento y mejoren claridad.

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

