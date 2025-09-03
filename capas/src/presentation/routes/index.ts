/**
 * CAPA DE PRESENTACIÓN - ÍNDICE DE RUTAS
 * 
 * Centraliza todas las rutas y proporciona una configuración limpia
 * para el enrutamiento de la aplicación.
 */

import { Router } from 'express';
import { createBookRoutes } from './bookRoutes';
import { createUserRoutes } from './userRoutes';
// Eliminadas rutas de préstamos y dashboard para simplificar el ejemplo

// Controllers
import { BookController } from '../controllers/BookController';
import { UserController } from '../controllers/UserController';
// Eliminados LoanController y DashboardController para simplificar el ejemplo

export function createApiRoutes(
  bookController: BookController,
  userController: UserController
): Router {
  const apiRouter = Router();

  // Configurar todas las rutas de la API
  apiRouter.use('/books', createBookRoutes(bookController));
  apiRouter.use('/users', createUserRoutes(userController));
  // Solo libros y usuarios en la versión simplificada

  // Ruta de health check básica
  apiRouter.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Library Management API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // Ruta de información de la API
  apiRouter.get('/info', (req, res) => {
    res.json({
      success: true,
      data: {
        name: 'Library Management System API',
        description: 'Example of Layered Architecture + MVC Pattern',
        version: '1.0.0',
        architecture: {
          style: 'Layered Architecture',
          patterns: ['MVC', 'Repository', 'Service Layer'],
          layers: [
            'Presentation Layer (Controllers, DTOs, Routes)',
            'Business Logic Layer (Services, Entities)',
            'Data Access Layer (Repositories, Models)'
          ]
        },
        endpoints: {
          books: '/api/books',
          users: '/api/users'
        }
      }
    });
  });

  return apiRouter;
}
