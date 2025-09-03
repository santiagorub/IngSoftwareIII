/**
 * CAPA DE PRESENTACIÓN - VISTAS (EJEMPLOS DE RESPUESTAS)
 * 
 * En una API REST, las "Views" del patrón MVC son las respuestas JSON.
 * Este archivo documenta ejemplos de las diferentes vistas/respuestas del sistema.
 */

/**
 * VISTA: Respuesta de libro individual
 * GET /api/books/:id
 */
export const BOOK_RESPONSE_EXAMPLE = {
  "success": true,
  "data": {
    "id": "book-123",
    "isbn": "978-0134685991",
    "title": "Effective Java",
    "author": "Joshua Bloch",
    "category": "Programming",
    "totalCopies": 5,
    "availableCopies": 3,
    "publishedYear": 2017,
    "isAvailable": true,
    "isPopular": true,
    "isRecent": true,
    "availabilityPercentage": 60
  }
};

/**
 * VISTA: Lista de libros con filtros
 * GET /api/books?title=java&isAvailable=true
 */
export const BOOKS_LIST_RESPONSE_EXAMPLE = {
  "success": true,
  "data": [
    {
      "id": "book-123",
      "title": "Effective Java",
      "author": "Joshua Bloch",
      "isAvailable": true,
      "availabilityPercentage": 60
    },
    {
      "id": "book-456",
      "title": "Java: The Complete Reference",
      "author": "Herbert Schildt",
      "isAvailable": true,
      "availabilityPercentage": 80
    }
  ]
};

/**
 * VISTA: Información completa de préstamo
 * GET /api/loans/:id
 */
export const LOAN_SUMMARY_RESPONSE_EXAMPLE = {
  "success": true,
  "data": {
    "loan": {
      "id": "loan-789",
      "userId": "user-456",
      "bookId": "book-123",
      "loanDate": "2024-01-15T10:00:00.000Z",
      "dueDate": "2024-01-29T10:00:00.000Z",
      "returnDate": null,
      "status": "ACTIVE",
      "isOverdue": false,
      "daysOverdue": 0,
      "isDueSoon": true,
      "fine": 0,
      "loanDuration": 10
    },
    "user": {
      "id": "user-456",
      "name": "María García",
      "email": "maria.garcia@universidad.edu",
      "userType": "PROFESSOR",
      "currentLoans": 5,
      "maxLoanLimit": 10,
      "canTakeNewLoan": true
    },
    "book": {
      "id": "book-123",
      "title": "Effective Java",
      "author": "Joshua Bloch",
      "isAvailable": false
    },
    "daysRemaining": 4,
    "fine": 0
  }
};

/**
 * VISTA: Dashboard completo del sistema
 * GET /api/dashboard
 */
export const DASHBOARD_RESPONSE_EXAMPLE = {
  "success": true,
  "data": {
    "bookStats": {
      "totalBooks": 150,
      "availableBooks": 120,
      "popularBooks": 25,
      "recentBooks": 40,
      "totalCopies": 500,
      "availableCopies": 380
    },
    "userStats": {
      "totalUsers": 200,
      "activeUsers": 180,
      "inactiveUsers": 20,
      "usersNearLimit": 5,
      "usersByType": {
        "students": 150,
        "professors": 30,
        "librarians": 20
      },
      "totalActiveLoans": 120,
      "averageLoansPerUser": 0.6
    },
    "loanStats": {
      "totalLoans": 85,
      "activeLoans": 75,
      "returnedLoans": 8,
      "overdueLoans": 2,
      "currentOverdueLoans": 3,
      "currentUpcomingDueLoans": 12,
      "averageLoanDuration": 12,
      "totalFines": 15
    },
    "recentActivity": {
      "recentLoans": [
        /* Array de préstamos recientes */
      ],
      "overdueLoans": [
        /* Array de préstamos vencidos */
      ],
      "upcomingDueLoans": [
        /* Array de préstamos que vencen pronto */
      ]
    }
  }
};

/**
 * VISTA: Resumen ejecutivo
 * GET /api/dashboard/summary
 */
export const EXECUTIVE_SUMMARY_RESPONSE_EXAMPLE = {
  "success": true,
  "data": {
    "overview": {
      "totalBooks": 150,
      "activeUsers": 180,
      "activeLoans": 75,
      "utilizationRate": 24
    },
    "performance": {
      "returnRate": 94,
      "averageLoanDuration": 12,
      "overdueRate": 2
    },
    "alerts": {
      "overdueLoans": 3,
      "upcomingDueLoans": 12,
      "totalFines": 15,
      "usersNearLimit": 5
    }
  }
};

/**
 * VISTA: Respuesta de error estándar
 * Cualquier endpoint con error
 */
export const ERROR_RESPONSE_EXAMPLE = {
  "success": false,
  "error": "Book not found"
};

/**
 * VISTA: Respuesta de creación exitosa
 * POST /api/books, POST /api/users, POST /api/loans
 */
export const CREATION_SUCCESS_RESPONSE_EXAMPLE = {
  "success": true,
  "data": {
    /* ... objeto creado ... */
  },
  "message": "Book created successfully"
};

/**
 * VISTA: Health check del sistema
 * GET /api/health
 */
export const HEALTH_CHECK_RESPONSE_EXAMPLE = {
  "success": true,
  "message": "Library Management API is running",
  "timestamp": "2024-01-20T15:30:00.000Z",
  "version": "1.0.0"
};

/**
 * VISTA: Información de la API
 * GET /api/info
 */
export const API_INFO_RESPONSE_EXAMPLE = {
  "success": true,
  "data": {
    "name": "Library Management System API",
    "description": "Example of Layered Architecture + MVC Pattern",
    "version": "1.0.0",
    "architecture": {
      "style": "Layered Architecture",
      "patterns": ["MVC", "Repository", "Service Layer"],
      "layers": [
        "Presentation Layer (Controllers, DTOs, Routes)",
        "Business Logic Layer (Services, Entities)",
        "Data Access Layer (Repositories, Models)"
      ]
    },
    "endpoints": {
      "books": "/api/books",
      "users": "/api/users",
      "loans": "/api/loans",
      "dashboard": "/api/dashboard"
    }
  }
};

/**
 * PATRONES DE VISTA IDENTIFICADOS:
 * 
 * 1. **Respuesta Exitosa Estándar**:
 *    - success: true
 *    - data: objeto o array
 *    - message?: string opcional
 * 
 * 2. **Respuesta de Error Estándar**:
 *    - success: false
 *    - error: string
 * 
 * 3. **Respuestas de Lista**:
 *    - data: array de objetos
 *    - Opcionalmente con paginación
 * 
 * 4. **Respuestas de Detalle**:
 *    - data: objeto único con información completa
 * 
 * 5. **Respuestas Agregadas** (Dashboard):
 *    - data: objeto con múltiples secciones
 *    - Combina información de múltiples dominios
 * 
 * Estas vistas demuestran cómo la capa de presentación 
 * formatea los datos para el consumo del cliente.
 */
