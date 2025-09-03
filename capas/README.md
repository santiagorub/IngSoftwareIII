# Sistema de Gestión de Biblioteca (Simplificado) - Capas + MVC

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────┐
│           CAPA DE PRESENTACIÓN          │
│                                         │
│  ┌─────────────┐ ┌─────────────────────┐│
│  │ Controllers │ │ Routes & DTOs       ││
│  │   (MVC)     │ │   (Models/Views)    ││
│  └─────────────┘ └─────────────────────┘│
└─────────────────┬───────────────────────┘
                  │ HTTP/JSON
┌─────────────────┴───────────────────────┐
│        CAPA DE LÓGICA DE NEGOCIO        │
│                                         │
│  ┌─────────────┐ ┌─────────────────────┐│
│  │  Services   │ │    Entities         ││
│  │ (Orquestac.)│ │ (Reglas Negocio)    ││
│  └─────────────┘ └─────────────────────┘│
└─────────────────┬───────────────────────┘
                  │ Interfaces
┌─────────────────┴───────────────────────┐
│        CAPA DE ACCESO A DATOS           │
│                                         │
│  ┌─────────────┐ ┌─────────────────────┐│
│  │Repositories │ │   Data Models       ││
│  │ (Persist.)  │ │   & Database        ││
│  └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
src/
├── business/              # CAPA DE LÓGICA DE NEGOCIO
│   ├── entities/         # Entidades con reglas de negocio
│   │   ├── Book.ts       # - Lógica de disponibilidad
│   │   └── User.ts       # - Tipos de usuario y límites
│   └── services/         # Servicios que orquestan operaciones
│       ├── BookService.ts
│       └── UserService.ts
│
├── data/                 # CAPA DE ACCESO A DATOS
│   ├── models/           # Modelos de persistencia
│   │   └── DataModels.ts
│   ├── repositories/     # Patrón Repository
│   │   ├── BookRepository.ts
│   │   └── UserRepository.ts
│   └── database.ts       # Base de datos en memoria
│
├── presentation/         # CAPA DE PRESENTACIÓN (MVC)
│   ├── controllers/      # Controllers (C de MVC)
│   │   ├── BookController.ts
│   │   ├── UserController.ts
│   │   └── (Eliminados LoanController y DashboardController en esta versión)
│   ├── models/           # Models/DTOs (M de MVC)
│   │   ├── DTOs.ts
│   │   └── Mappers.ts
│   ├── routes/           # Configuración de rutas
│   │   └── *.ts
│   └── views/            # (Views = respuestas JSON)
│
└── app.ts               # Configuración e inyección de dependencias (sin préstamos)
```

## 🔄 Flujo de Datos Entre Capas

### Ejemplo: Buscar Libros

1. **HTTP Request** → `GET /api/books?title=java&isAvailable=true`
2. **Presentación**: `BookController.searchBooks()`
   - Valida filtros y convierte a `BookSearchFilters`
3. **Negocio**: `BookService.searchBooks()`
   - Aplica reglas (validaciones, orden por relevancia)
4. **Datos**: `BookRepository.search()`
   - Ejecuta consultas SQL y mapea a entidades `Book`
5. **Respuesta** ← JSON con `BookDTO[]`

## 🚀 Cómo Ejecutar

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar TypeScript
npm run build

# 3. Ejecutar en producción
npm start

# O ejecutar en desarrollo (con ts-node)
npm run dev
```

### Verificar que funciona

```bash
# Health check
curl http://localhost:3000/api/health

# Obtener libros
curl http://localhost:3000/api/books

# Usuarios
curl http://localhost:3000/api/users
```

## 📚 Ejemplos de Uso de la API

### Buscar Libros
```bash
# Todos los libros
GET /api/books

# Libros disponibles de Java
GET /api/books?title=java&isAvailable=true

# Libros por categoría
GET /api/books?category=Programming
```

### Gestión de Usuarios
```bash
# Crear usuario
POST /api/users
{
  "email": "estudiante@universidad.edu",
  "name": "Ana García",
  "userType": "STUDENT"
}

# Listar usuarios
GET /api/users
```