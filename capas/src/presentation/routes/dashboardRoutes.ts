/**
 * CAPA DE PRESENTACIÓN - RUTAS DE DASHBOARD
 */

import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';

export function createDashboardRoutes(dashboardController: DashboardController): Router {
  const router = Router();

  // GET /api/dashboard - Datos completos del dashboard
  router.get('/', (req, res) => dashboardController.getDashboardData(req, res));

  // GET /api/dashboard/summary - Resumen ejecutivo
  router.get('/summary', (req, res) => dashboardController.getExecutiveSummary(req, res));

  // GET /api/dashboard/alerts - Alertas del sistema
  router.get('/alerts', (req, res) => dashboardController.getSystemAlerts(req, res));

  // GET /api/dashboard/health - Health check del sistema
  router.get('/health', (req, res) => dashboardController.getSystemHealth(req, res));

  return router;
}
