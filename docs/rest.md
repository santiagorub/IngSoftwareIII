# REST – Guía detallada

## ¿Qué es REST?
Estilo arquitectónico para construir APIs sobre HTTP, basado en recursos y una interfaz uniforme. Principios clave:
- Recursos con URLs estables (sustantivos): `/api/books`, `/api/users`
- Verbos HTTP con semántica: GET, POST, PUT, PATCH, DELETE
- Representación intercambiable (JSON en este proyecto)
- Stateless: cada request contiene todo lo necesario
- Cacheable: GET puede cachearse
- Uniform Interface: contratos consistentes

## Endpoints en este proyecto
- Libros: `GET /api/books`, `GET /api/books/:id`, `GET /api/books/available`, `GET /api/books/popular`, `GET /api/books/recent`, `GET /api/books/statistics`, `POST /api/books`
- Usuarios: `GET /api/users`, `GET /api/users/:id`, `GET /api/users/statistics`, `POST /api/users`
- Health: `GET /api/health`

## Contrato de respuesta (uniforme)
```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "opcional"
}
```
Errores:
```json
{ "success": false, "error": "mensaje" }
```

## Status codes y semántica (resumen)
- 200 OK: lectura/acción exitosa
- 201 Created: creación de recurso (`POST /api/books`)
- 400 Bad Request: validación fallida (controladores validan DTOs)
- 404 Not Found: recurso inexistente
- 500 Internal Server Error: error inesperado

## Idempotencia
- GET, PUT, DELETE deberían ser idempotentes
- POST no es idempotente (crea nuevos recursos)

## Ejemplos listos para demo
```bash
# Libros por filtro (REST + query params)
curl "http://localhost:3000/api/books?title=java&isAvailable=true"

# Libro por id
curl "http://localhost:3000/api/books/<id>"

# Crear usuario
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@uni.edu","name":"Estudiante Demo","userType":"STUDENT"}'
```

## Buenas prácticas aplicadas
- Sustantivos en la URL; filtros en query strings
- Validación en Controller; reglas en Service; persistencia en Repository
- DTOs para la vista (no exponer entidades crudas)

## Anti‑patrones (evitar)
- Verbos en la URL (`/getBooks`)
- Modelos de respuesta inconsistentes
- Filtrar vía cuerpo en GET (usar query params)
