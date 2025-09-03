/**
 * CAPA DE PRESENTACIÓN - CONTROLADOR DE DASHBOARD
 * 
 * Ejemplo de controlador que ORQUESTA múltiples servicios
 * para crear vistas agregadas. Demuestra la coordinación entre capas.
 */

import { Request, Response } from 'express';
import { BookService } from '../../business/services/BookService';
import { UserService } from '../../business/services/UserService';
import { LoanService } from '../../business/services/LoanService';
import { 
  ApiResponse,
  LibraryDashboardDTO
} from '../models/DTOs';
import { 
  loanSummariesToDTO,
  createSuccessResponse, 
  createErrorResponse 
} from '../models/Mappers';

export class DashboardController {
  constructor(
    private bookService: BookService,
    private userService: UserService,
    private loanService: LoanService
  ) {}

  /**
   * GET /api/dashboard - Obtiene datos completos del dashboard
   * 
   * Este endpoint demuestra cómo un controlador puede:
   * 1. Orquestar múltiples servicios
   * 2. Agregar información de diferentes dominios
   * 3. Crear vistas personalizadas para la presentación
   */
  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      // ORQUESTACIÓN: Llamar a múltiples servicios en paralelo
      const [bookStats, userStats, overdueLoans, upcomingDueLoans] = await Promise.all([
        this.bookService.getBookStatistics(),
        this.userService.getUserStatistics(),
        this.getRecentOverdueLoans(),
        this.loanService.getUpcomingDueLoans()
      ]);

      // Obtener estadísticas de préstamos para el último mes
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const loanStats = await this.loanService.getLoanStatistics(lastMonth, new Date());

      // Obtener actividad reciente (últimos 10 préstamos)
      const recentLoans = await this.getRecentLoans(10);

      // AGREGACIÓN: Combinar datos de múltiples dominios
      const dashboardData: LibraryDashboardDTO = {
        bookStats,
        userStats,
        loanStats,
        recentActivity: {
          recentLoans: loanSummariesToDTO(recentLoans),
          overdueLoans: loanSummariesToDTO(overdueLoans),
          upcomingDueLoans: loanSummariesToDTO(upcomingDueLoans)
        }
      };

      const response: ApiResponse<LibraryDashboardDTO> = createSuccessResponse(dashboardData);
      res.json(response);

    } catch (error) {
      const response: ApiResponse<never> = createErrorResponse(
        error instanceof Error ? error.message : 'Failed to load dashboard data'
      );
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/dashboard/summary - Obtiene resumen ejecutivo
   */
  async getExecutiveSummary(req: Request, res: Response): Promise<void> {
    try {
      const [bookStats, userStats, loanStats] = await Promise.all([
        this.bookService.getBookStatistics(),
        this.userService.getUserStatistics(),
        this.loanService.getLoanStatistics(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
          new Date()
        )
      ]);

      // LÓGICA DE PRESENTACIÓN: Calcular métricas derivadas
      const utilizationRate = bookStats.totalCopies > 0 
        ? ((bookStats.totalCopies - bookStats.availableCopies) / bookStats.totalCopies) * 100 
        : 0;

      const returnRate = loanStats.totalLoans > 0 
        ? (loanStats.returnedLoans / loanStats.totalLoans) * 100 
        : 0;

      const summary = {
        overview: {
          totalBooks: bookStats.totalBooks,
          activeUsers: userStats.activeUsers,
          activeLoans: loanStats.activeLoans,
          utilizationRate: Math.round(utilizationRate)
        },
        performance: {
          returnRate: Math.round(returnRate),
          averageLoanDuration: loanStats.averageLoanDuration,
          overdueRate: loanStats.totalLoans > 0 
            ? Math.round((loanStats.overdueLoans / loanStats.totalLoans) * 100) 
            : 0
        },
        alerts: {
          overdueLoans: loanStats.currentOverdueLoans,
          upcomingDueLoans: loanStats.currentUpcomingDueLoans,
          totalFines: loanStats.totalFines,
          usersNearLimit: userStats.usersNearLimit
        }
      };

      const response: ApiResponse<typeof summary> = createSuccessResponse(summary);
      res.json(response);

    } catch (error) {
      const response: ApiResponse<never> = createErrorResponse(
        error instanceof Error ? error.message : 'Failed to load executive summary'
      );
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/dashboard/alerts - Obtiene alertas del sistema
   */
  async getSystemAlerts(req: Request, res: Response): Promise<void> {
    try {
      const [overdueLoans, upcomingDueLoans, usersNeedingAttention, popularBooks] = await Promise.all([
        this.getRecentOverdueLoans(),
        this.loanService.getUpcomingDueLoans(),
        this.userService.getUsersNeedingAttention(),
        this.bookService.getPopularBooks()
      ]);

      // LÓGICA DE PRESENTACIÓN: Categorizar alertas por prioridad
      const alerts = {
        critical: {
          overdueLoans: overdueLoans.length,
          items: overdueLoans.slice(0, 5) // Top 5 más críticos
        },
        warning: {
          upcomingDueLoans: upcomingDueLoans.length,
          usersNearLimit: usersNeedingAttention.length,
          items: [
            ...upcomingDueLoans.slice(0, 3),
            // Podrían agregarse más tipos de alertas
          ]
        },
        info: {
          popularBooks: popularBooks.length,
          items: popularBooks.slice(0, 3) // Top 3 libros populares
        }
      };

      const response: ApiResponse<typeof alerts> = createSuccessResponse(alerts);
      res.json(response);

    } catch (error) {
      const response: ApiResponse<never> = createErrorResponse(
        error instanceof Error ? error.message : 'Failed to load system alerts'
      );
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/dashboard/health - Health check del sistema
   */
  async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      const [bookStats, userStats] = await Promise.all([
        this.bookService.getBookStatistics(),
        this.userService.getUserStatistics()
      ]);

      // LÓGICA DE PRESENTACIÓN: Evaluar salud del sistema
      const health = {
        status: 'healthy', // healthy, warning, critical
        checks: {
          database: { status: 'ok', message: 'All services responding' },
          inventory: { 
            status: bookStats.availableCopies > 0 ? 'ok' : 'warning',
            message: `${bookStats.availableCopies} books available`
          },
          users: {
            status: userStats.activeUsers > 0 ? 'ok' : 'warning',
            message: `${userStats.activeUsers} active users`
          }
        },
        metrics: {
          uptime: '99.9%', // En un sistema real, esto vendría de métricas reales
          responseTime: '150ms',
          errorRate: '0.1%'
        }
      };

      const response: ApiResponse<typeof health> = createSuccessResponse(health);
      res.json(response);

    } catch (error) {
      const response: ApiResponse<never> = createErrorResponse(
        error instanceof Error ? error.message : 'System health check failed'
      );
      res.status(500).json(response);
    }
  }

  /**
   * Método auxiliar: Obtiene préstamos vencidos recientes
   */
  private async getRecentOverdueLoans() {
    // Procesar préstamos vencidos primero
    await this.loanService.processOverdueLoans();
    
    // Obtener todos los upcoming y filtrar los realmente vencidos
    const allUpcoming = await this.loanService.getUpcomingDueLoans();
    return allUpcoming.filter(summary => summary.loan.isOverdue);
  }

  /**
   * Método auxiliar: Obtiene préstamos recientes
   * 
   * Nota: En un sistema real, esto podría ser un método del LoanService
   * Lo implementamos aquí para demostrar lógica de presentación
   */
  private async getRecentLoans(limit: number) {
    // Para este ejemplo, obtenemos upcoming loans como "actividad reciente"
    // En un sistema real, tendríamos un método específico para esto
    const upcomingLoans = await this.loanService.getUpcomingDueLoans();
    return upcomingLoans.slice(0, limit);
  }
}
