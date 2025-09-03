/**
 * CAPA DE PRESENTACIÓN - RUTAS DE PRÉSTAMOS
 */

import { Router } from 'express';
import { LoanController } from '../controllers/LoanController';

export function createLoanRoutes(loanController: LoanController): Router {
  const router = Router();

  // GET /api/loans/overdue - Préstamos vencidos
  router.get('/overdue', (req, res) => loanController.getOverdueLoans(req, res));

  // GET /api/loans/due-soon - Préstamos que vencen pronto
  router.get('/due-soon', (req, res) => loanController.getUpcomingDueLoans(req, res));

  // GET /api/loans/statistics - Estadísticas de préstamos
  router.get('/statistics', (req, res) => loanController.getLoanStatistics(req, res));

  // POST /api/loans - Crear nuevo préstamo
  router.post('/', (req, res) => loanController.createLoan(req, res));

  // POST /api/loans/process-overdue - Procesar préstamos vencidos
  router.post('/process-overdue', (req, res) => loanController.processOverdueLoans(req, res));

  // GET /api/loans/:id - Obtener préstamo por ID
  router.get('/:id', (req, res) => loanController.getLoanById(req, res));

  // POST /api/loans/:id/return - Devolver libro
  router.post('/:id/return', (req, res) => loanController.returnBook(req, res));

  // POST /api/loans/:id/renew - Renovar préstamo
  router.post('/:id/renew', (req, res) => loanController.renewLoan(req, res));

  // GET /api/loans/:loanId/can-renew - Verificar si se puede renovar
  router.get('/:loanId/can-renew', (req, res) => loanController.canRenewLoan(req, res));

  return router;
}

// También creamos rutas específicas para préstamos de usuarios
export function createUserLoanRoutes(loanController: LoanController): Router {
  const router = Router();

  // GET /api/users/:userId/loans - Préstamos activos del usuario
  router.get('/:userId/loans', (req, res) => loanController.getUserActiveLoans(req, res));

  // GET /api/users/:userId/loans/history - Historial de préstamos del usuario
  router.get('/:userId/loans/history', (req, res) => loanController.getUserLoanHistory(req, res));

  return router;
}
