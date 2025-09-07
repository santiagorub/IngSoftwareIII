/**
 * APLICACIÓN PRINCIPAL
 *
 * Configura y arranca la aplicación demostrando:
 * 1. Inyección de dependencias entre capas
 * 2. Configuración de la arquitectura completa
 * 3. Separación clara de responsabilidades
 */

import express from 'express';
import { createApiRoutes } from './presentation/routes';
import { initializeDatabase, testConnection } from './config/database';

// Cargar variables de entorno
require('dotenv').config();

// CAPA DE DATOS - Repositorios
import { BookRepository } from './data/repositories/BookRepository';
import { UserRepository } from './data/repositories/UserRepository';
// Eliminado LoanRepository para simplificar el ejemplo

// CAPA DE NEGOCIO - Servicios
import { BookService } from './business/services/BookService';
import { UserService } from './business/services/UserService';
// Eliminado LoanService para simplificar el ejemplo

// CAPA DE PRESENTACIÓN - Controladores
import { BookController } from './presentation/controllers/BookController';
import { UserController } from './presentation/controllers/UserController';
// Eliminados LoanController y DashboardController para simplificar el ejemplo

/**
 * Configuración de la aplicación con inyección de dependencias
 */
function createApp() {
    const app = express();

    // Middleware básico
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // CORS simple para desarrollo
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        } else {
            next();
        }
    });

    // INYECCIÓN DE DEPENDENCIAS - Construcción de la arquitectura en capas

    // 1. CAPA DE DATOS - Instanciar repositorios MySQL
    console.log('🗃️ Using MySQL repositories');
    const bookRepository = new BookRepository();
    const userRepository = new UserRepository();
    // Sin préstamos en la versión simplificada

    // 2. CAPA DE NEGOCIO - Inyectar repositorios en servicios
    const bookService = new BookService(bookRepository);
    const userService = new UserService(userRepository);
    // Sin préstamos en la versión simplificada

    // 3. CAPA DE PRESENTACIÓN - Inyectar servicios en controladores
    const bookController = new BookController(bookService);
    const userController = new UserController(userService);
    // Sin préstamos ni dashboard en la versión simplificada

    // 4. CONFIGURAR RUTAS - Conectar controladores con endpoints HTTP
    app.use('/api', createApiRoutes(bookController, userController));

    // Ruta raíz con información del proyecto
    app.get('/', (req, res) => {
        res.json({
            message: 'Library Management System - Layered Architecture Demo',
            description: 'Example implementation for Software Architecture class',
            architecture: {
                style: 'Layered Architecture',
                patterns: ['MVC', 'Repository', 'Service Layer'],
                technologies: ['TypeScript', 'Express.js', 'MySQL Database'],
            },
            layers: {
                presentation: {
                    components: ['Controllers', 'DTOs', 'Routes', 'Mappers'],
                    responsibility: 'HTTP handling, validation, response formatting',
                },
                business: {
                    components: ['Services', 'Entities', 'Business Rules'],
                    responsibility: 'Business logic, rules enforcement, orchestration',
                },
                data: {
                    components: ['Repositories', 'Data Models', 'Database'],
                    responsibility: 'Data persistence, queries, storage abstraction',
                },
            },
            endpoints: {
                api: '/api',
                books: '/api/books',
                users: '/api/users',
            },
            examples: {
                searchBooks: 'GET /api/books?title=java&isAvailable=true',
                createLoan: 'POST /api/loans {"userId": "...", "bookId": "..."}',
                dashboard: 'GET /api/dashboard',
                health: 'GET /api/health',
            },
        });
    });

    // Middleware de manejo de errores
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: 'Endpoint not found',
            availableEndpoints: [
                'GET /',
                'GET /api/health',
                'GET /api/info',
                'GET /api/books',
                'GET /api/users',
                'GET /api/loans',
                'GET /api/dashboard',
            ],
        });
    });

    return app;
}

/**
 * Función para arrancar el servidor
 */
async function startServer() {
    console.log('🔧 Initializing MySQL database connection...');
    initializeDatabase();

    const connected = await testConnection();
    if (!connected) {
        console.error('❌ Could not connect to MySQL database. Please check Docker is running.');
        console.error('💡 Run: npm run docker:up');
        process.exit(1);
    }

    const app = createApp();
    const PORT = process.env.PORT || 3000;

    startAppServer(app, PORT);
}

/**
 * Inicia el servidor Express
 */
function startAppServer(app: express.Express, PORT: string | number) {
    app.listen(PORT, () => {
        console.log('🚀 Library Management System Started!');
        console.log(`📚 Server running on http://localhost:${PORT}`);
        console.log('');
        console.log('📋 Architecture Overview:');
        console.log('   ┌─────────────────────────────────┐');
        console.log('   │     PRESENTATION LAYER          │');
        console.log('   │   (Controllers, DTOs, Routes)   │');
        console.log('   └─────────────────┬───────────────┘');
        console.log('                     │');
        console.log('   ┌─────────────────┴───────────────┐');
        console.log('   │     BUSINESS LOGIC LAYER        │');
        console.log('   │    (Services, Entities)         │');
        console.log('   └─────────────────┬───────────────┘');
        console.log('                     │');
        console.log('   ┌─────────────────┴───────────────┐');
        console.log('   │     DATA ACCESS LAYER           │');
        console.log('   │  (Repositories, Models, DB)     │');
        console.log('   └─────────────────────────────────┘');
        console.log('');
        console.log('🎯 Try these endpoints:');
        console.log(`   📖 Books: http://localhost:${PORT}/api/books`);
        console.log(`   👥 Users: http://localhost:${PORT}/api/users`);
        console.log(`   📋 Dashboard: http://localhost:${PORT}/api/dashboard`);
        console.log(`   ❤️ Health: http://localhost:${PORT}/api/health`);
        console.log('');
        console.log('💡 Example requests:');
        console.log(`   curl http://localhost:${PORT}/api/books?title=java`);
        console.log(`   curl http://localhost:${PORT}/api/dashboard/summary`);
    });
}

// Arrancar la aplicación si este archivo se ejecuta directamente
if (require.main === module) {
    startServer().catch((error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}

export { createApp, startServer };
