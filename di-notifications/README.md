# DI Notifications (Node + TypeScript)

Proyecto pedagógico y mínimo para explicar inyección de dependencias vs. acoplamiento fuerte usando un servicio de notificaciones (Email y Telegram).

## Ejecutar

```bash
cd di-notifications
npm install
npm run dev
# Servidor en http://localhost:4000
```

## Endpoints

- POST `/coupled/notify` → Servicio acoplado (sin DI)
- POST `/di/notify` → Servicio con inyección de dependencias (DI)

Body de ejemplo (ambos endpoints):

```json
{
  "channel": "email", // "email" | "telegram"
  "to": "user@example.com",
  "message": "Hola desde el ejemplo DI"
}
```

### Ejemplos curl

Servicio acoplado (sin DI):
```bash
curl -X POST http://localhost:4000/coupled/notify \
  -H 'Content-Type: application/json' \
  -d '{"channel":"email","to":"user@example.com","message":"Hola!"}'
```

Servicio con DI:
```bash
curl -X POST http://localhost:4000/di/notify \
  -H 'Content-Type: application/json' \
  -d '{"channel":"telegram","to":"@usuario","message":"Hola por Telegram"}'
```

## ¿Qué demuestra?

- Acoplado (sin DI): `CoupledNotificationService` crea las dependencias dentro (new EmailChannel/TelegramChannel). Cambiar, testear o extender obliga a tocar la clase.
- Con DI: `NotificationService` depende de la abstracción `NotificationChannel` y recibe la implementación por constructor (o fábrica). Es reemplazable, testeable y extensible.

## Estructura

```
src/
├── app.ts                     # Configura Express y rutas
├── index.ts                   # Boot del servidor
├── channels/                  # Implementaciones concretas (Email/Telegram)
│   ├── EmailChannel.ts
│   ├── TelegramChannel.ts
│   └── types.ts               # Interfaz NotificationChannel
├── factories/
│   └── channelFactory.ts      # Selecciona implementación según "channel"
└── services/
    ├── CoupledNotificationService.ts  # Sin DI (acoplado)
    └── NotificationService.ts         # Con DI (acepta una abstracción)
```


