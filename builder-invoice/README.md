# Builder Invoice (Node + TypeScript)

Proyecto pedagógico mínimo para demostrar el patrón Builder con un caso real de negocio: construcción de facturas (Invoice) con ítems, impuestos, descuentos y condiciones de pago.

Objetivo: contrastar una versión ingenua (sin patrón) vs una versión con Builder fluido y validaciones claras.

## Ejecutar

```bash
cd builder-invoice
npm install
npm run dev
```

Verás en consola:
- Construcción NAIVE (sin patrón) con problemas típicos
- Construcción con BUILDER (fluido, validado) y totales calculados

## ¿Por qué este ejemplo es realista?
- Facturas suelen requerir muchos parámetros opcionales: cliente, items, impuestos por país, descuentos, términos de pago, notas, metadatos.
- La combinación de estos produce “constructores telescópicos” o objetos de configuración gigantes.
- Builder permite armar paso a paso, validar y calcular en el momento correcto (al `build()`).

## Estructura

```
src/
├── builder/
│   └── InvoiceBuilder.ts
├── domain/
│   ├── Customer.ts
│   ├── Item.ts
│   └── Invoice.ts
├── naive/
│   └── createInvoiceNaive.ts
└── index.ts               # CLI de demostración (naive vs builder)
```

## Ideas para la clase
- Agregar IVA por país (mapa de tasas) y mostrar cómo el Builder puede cambiar estrategias.
- Agregar descuentos por fidelidad o cupones.
- Enfatizar validaciones centralizadas: “no permitimos facturas sin ítems ni cliente”.


