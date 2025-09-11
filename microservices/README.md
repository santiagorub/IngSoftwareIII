## Microservicios - Ejemplo mínimo (Kafka + Node/TS + Prisma)

Este ejemplo demuestra un sistema de microservicios puro con coreografía de eventos, usando Apache Kafka como bus de eventos, Node.js con TypeScript, Prisma ORM y bases de datos heterogéneas (MySQL y MongoDB). Incluye:

- API Gateway expuesto a Internet con un endpoint: `POST /cart/add`
- Servicios: `user-service` (MySQL), `product-service` (MongoDB), `cart-service` (MySQL)
- Comunicación asíncrona por eventos en Kafka (sin orquestador, estilo coreografía)
- Circuit Breaker simple en cada servicio
- Logging detallado en todos los procesos
- Seeders automáticos de datos

### Arquitectura (flujo "Agregar al carrito")

1. Gateway recibe `POST /cart/add` y publica `cart.add.request` con `correlationId`.
2. `user-service` y `product-service` consumen el evento, validan existencia y publican `user.validation.result` y `product.validation.result`.
3. `cart-service` escucha ambos resultados. Si ambos son OK, persiste el ítem de carrito y emite `cart.add.result: success`; si alguno falla, emite `cart.add.result: failure`.
4. Gateway espera la respuesta en Kafka por `correlationId` (con timeout) y responde HTTP.

### Requisitos

- Docker y Docker Compose

### Levantar el sistema

```bash
cd microservices
docker compose build
docker compose up -d
```

Gateway: `http://localhost:8080/health`

Probar "agregar al carrito":

```bash
curl -X POST http://localhost:8080/cart/add \
  -H 'Content-Type: application/json' \
  -d '{"userId": 1, "productId": "p1", "quantity": 1}'
```

Usuarios y productos de ejemplo se crean automáticamente por los seeders.

### Tópicos de Kafka

- `cart.add.request`
- `user.validation.result`
- `product.validation.result`
- `cart.add.result`

### Notas didácticas

- Coreografía: no hay un orquestador central; los servicios reaccionan a eventos.
- Circuit Breaker: corta rápido ante fallas repetidas de dependencia (DB/Kafka), protegiendo al sistema.
- Idempotencia y correlación: se utiliza `correlationId` para correlacionar resultados en Gateway y `cart-service`.


