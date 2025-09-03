/**
 * CAPA DE PRESENTACIÓN - RUTAS DE LIBROS
 * 
 * Define los endpoints HTTP y los conecta con los controladores.
 * Parte de la infraestructura del patrón MVC.
 */

import { Router } from 'express';
import { BookController } from '../controllers/BookController';

export function createBookRoutes(bookController: BookController): Router {
  const router = Router();

  // GET /api/books - Buscar libros con filtros
  router.get('/', (req, res) => bookController.searchBooks(req, res));

  // GET /api/books/available - Libros disponibles
  router.get('/available', (req, res) => bookController.getAvailableBooks(req, res));

  // GET /api/books/popular - Libros populares
  router.get('/popular', (req, res) => bookController.getPopularBooks(req, res));

  // GET /api/books/recent - Libros recientes
  router.get('/recent', (req, res) => bookController.getRecentBooks(req, res));

  // GET /api/books/statistics - Estadísticas de libros
  router.get('/statistics', (req, res) => bookController.getBookStatistics(req, res));

  // GET /api/books/recommendations/:category - Recomendaciones por categoría
  router.get('/recommendations/:category', (req, res) => bookController.getRecommendations(req, res));

  // POST /api/books - Crear nuevo libro
  router.post('/', (req, res) => bookController.createBook(req, res));

  // PUT /api/books/:id - Actualizar libro existente
  router.put('/:id', (req, res) => bookController.updateBook(req, res));

  // DELETE /api/books/:id - Eliminar libro
  router.delete('/:id', (req, res) => bookController.deleteBook(req, res));

  // GET /api/books/:id - Obtener libro por ID (debe ir al final para evitar conflictos)
  router.get('/:id', (req, res) => bookController.getBookById(req, res));

  return router;
}
