/**
 * CAPA DE PRESENTACIÓN - RUTAS DE USUARIOS
 */

import { Router } from 'express';
import { UserController } from '../controllers/UserController';

export function createUserRoutes(userController: UserController): Router {
  const router = Router();

  // GET /api/users - Buscar usuarios con filtros
  router.get('/', (req, res) => userController.searchUsers(req, res));

  // GET /api/users/active - Usuarios activos
  router.get('/active', (req, res) => userController.getActiveUsers(req, res));

  // GET /api/users/attention-needed - Usuarios que necesitan atención
  router.get('/attention-needed', (req, res) => userController.getUsersNeedingAttention(req, res));

  // GET /api/users/statistics - Estadísticas de usuarios
  router.get('/statistics', (req, res) => userController.getUserStatistics(req, res));

  // GET /api/users/type/:userType - Usuarios por tipo
  router.get('/type/:userType', (req, res) => userController.getUsersByType(req, res));

  // POST /api/users - Crear nuevo usuario
  router.post('/', (req, res) => userController.createUser(req, res));

  // GET /api/users/email/:email - Obtener usuario por email
  router.get('/email/:email', (req, res) => userController.getUserByEmail(req, res));

  // GET /api/users/:id - Obtener usuario por ID
  router.get('/:id', (req, res) => userController.getUserById(req, res));

  // PATCH /api/users/:id/status - Actualizar estado del usuario
  router.patch('/:id/status', (req, res) => userController.updateUserStatus(req, res));

  // GET /api/users/:id/can-perform/:action - Verificar si puede realizar acción
  router.get('/:id/can-perform/:action', (req, res) => userController.canUserPerformAction(req, res));

  return router;
}
