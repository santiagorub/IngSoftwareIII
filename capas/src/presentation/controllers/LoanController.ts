/**
 * CAPA DE PRESENTACIÓN - CONTROLADOR DE PRÉSTAMOS
 *
 * Maneja todas las operaciones relacionadas con préstamos de libros.
 * Ejemplo más complejo de controlador que coordina múltiples servicios.
 */

import { Request, Response } from 'express';
import { LoanService } from '../../business/services/LoanService';
import { CreateLoanRequestDTO, ApiResponse, LoanDTO, LoanSummaryDTO, LoanStatisticsDTO } from '../models/DTOs';
import {
    loanToDTO,
    loanSummaryToDTO,
    loanSummariesToDTO,
    createSuccessResponse,
    createErrorResponse,
} from '../models/Mappers';

export class LoanController {
    constructor(private loanService: LoanService) {}

    /**
     * POST /api/loans - Crea un nuevo préstamo
     */
    async createLoan(req: Request, res: Response): Promise<void> {
        try {
            const loanData: CreateLoanRequestDTO = req.body;

            // Validación de entrada
            if (!this.validateCreateLoanRequest(loanData)) {
                const response: ApiResponse<never> = createErrorResponse('Invalid loan request data');
                res.status(400).json(response);
                return;
            }

            // Llamar a la lógica de negocio (compleja)
            const newLoan = await this.loanService.createLoan({
                userId: loanData.userId,
                bookId: loanData.bookId,
            });

            // Obtener información completa del préstamo
            const loanSummary = await this.loanService.getLoanSummary(newLoan.id);

            if (!loanSummary) {
                const response: ApiResponse<never> = createErrorResponse('Failed to retrieve loan information');
                res.status(500).json(response);
                return;
            }

            const loanSummaryDTO = loanSummaryToDTO(loanSummary);
            const response: ApiResponse<LoanSummaryDTO> = createSuccessResponse(
                loanSummaryDTO,
                'Loan created successfully',
            );
            res.status(201).json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(400).json(response);
        }
    }

    /**
     * POST /api/loans/:id/return - Devuelve un libro
     */
    async returnBook(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                const response: ApiResponse<never> = createErrorResponse('Loan ID is required');
                res.status(400).json(response);
                return;
            }

            // Llamar a la lógica de negocio
            const returnedLoan = await this.loanService.returnBook(id);

            // Obtener información completa
            const loanSummary = await this.loanService.getLoanSummary(returnedLoan.id);

            if (!loanSummary) {
                const response: ApiResponse<never> = createErrorResponse('Failed to retrieve updated loan information');
                res.status(500).json(response);
                return;
            }

            const loanSummaryDTO = loanSummaryToDTO(loanSummary);
            const response: ApiResponse<LoanSummaryDTO> = createSuccessResponse(
                loanSummaryDTO,
                'Book returned successfully',
            );
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(400).json(response);
        }
    }

    /**
     * POST /api/loans/:id/renew - Renueva un préstamo
     */
    async renewLoan(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                const response: ApiResponse<never> = createErrorResponse('Loan ID is required');
                res.status(400).json(response);
                return;
            }

            const renewedLoan = await this.loanService.renewLoan(id);
            const loanDTO = loanToDTO(renewedLoan);

            const response: ApiResponse<LoanDTO> = createSuccessResponse(loanDTO, 'Loan renewed successfully');
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(400).json(response);
        }
    }

    /**
     * GET /api/loans/:id - Obtiene información completa de un préstamo
     */
    async getLoanById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id) {
                const response: ApiResponse<never> = createErrorResponse('Loan ID is required');
                res.status(400).json(response);
                return;
            }

            const loanSummary = await this.loanService.getLoanSummary(id);

            if (!loanSummary) {
                const response: ApiResponse<never> = createErrorResponse('Loan not found');
                res.status(404).json(response);
                return;
            }

            const loanSummaryDTO = loanSummaryToDTO(loanSummary);
            const response: ApiResponse<LoanSummaryDTO> = createSuccessResponse(loanSummaryDTO);
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(500).json(response);
        }
    }

    /**
     * GET /api/users/:userId/loans - Obtiene préstamos activos de un usuario
     */
    async getUserActiveLoans(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            if (!userId) {
                const response: ApiResponse<never> = createErrorResponse('User ID is required');
                res.status(400).json(response);
                return;
            }

            const userLoans = await this.loanService.getUserActiveLoans(userId);
            const loanSummariesDTO = loanSummariesToDTO(userLoans);

            const response: ApiResponse<LoanSummaryDTO[]> = createSuccessResponse(loanSummariesDTO);
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(500).json(response);
        }
    }

    /**
     * GET /api/users/:userId/loans/history - Obtiene historial de préstamos de un usuario
     */
    async getUserLoanHistory(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            if (!userId) {
                const response: ApiResponse<never> = createErrorResponse('User ID is required');
                res.status(400).json(response);
                return;
            }

            const loanHistory = await this.loanService.getUserLoanHistory(userId);
            const loanSummariesDTO = loanSummariesToDTO(loanHistory);

            const response: ApiResponse<LoanSummaryDTO[]> = createSuccessResponse(loanSummariesDTO);
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(500).json(response);
        }
    }

    /**
     * GET /api/loans/overdue - Obtiene préstamos vencidos
     */
    async getOverdueLoans(req: Request, res: Response): Promise<void> {
        try {
            // Primero procesar préstamos vencidos
            await this.loanService.processOverdueLoans();

            // Luego obtener la lista actualizada (esto podría ser optimizado)
            const overdueLoans = await this.loanService.getUpcomingDueLoans();
            const actuallyOverdue = overdueLoans.filter((summary) => summary.loan.isOverdue);

            const loanSummariesDTO = loanSummariesToDTO(actuallyOverdue);
            const response: ApiResponse<LoanSummaryDTO[]> = createSuccessResponse(loanSummariesDTO);
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(500).json(response);
        }
    }

    /**
     * GET /api/loans/due-soon - Obtiene préstamos que vencen pronto
     */
    async getUpcomingDueLoans(req: Request, res: Response): Promise<void> {
        try {
            const upcomingLoans = await this.loanService.getUpcomingDueLoans();
            const loanSummariesDTO = loanSummariesToDTO(upcomingLoans);

            const response: ApiResponse<LoanSummaryDTO[]> = createSuccessResponse(loanSummariesDTO);
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(500).json(response);
        }
    }

    /**
     * POST /api/loans/process-overdue - Procesa préstamos vencidos (tarea administrativa)
     */
    async processOverdueLoans(req: Request, res: Response): Promise<void> {
        try {
            const processedLoans = await this.loanService.processOverdueLoans();

            const response: ApiResponse<{ processedCount: number }> = createSuccessResponse(
                { processedCount: processedLoans.length },
                `Processed ${processedLoans.length} overdue loans`,
            );
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(500).json(response);
        }
    }

    /**
     * GET /api/loans/statistics - Obtiene estadísticas de préstamos
     */
    async getLoanStatistics(req: Request, res: Response): Promise<void> {
        try {
            // Parámetros opcionales para rango de fechas
            const startDateParam = req.query.startDate as string;
            const endDateParam = req.query.endDate as string;

            const startDate = startDateParam
                ? new Date(startDateParam)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 días atrás por defecto
            const endDate = endDateParam ? new Date(endDateParam) : new Date(); // Hoy por defecto

            const stats = await this.loanService.getLoanStatistics(startDate, endDate);

            const response: ApiResponse<LoanStatisticsDTO> = createSuccessResponse(stats);
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(500).json(response);
        }
    }

    /**
     * GET /api/loans/:loanId/can-renew - Verifica si un préstamo se puede renovar
     */
    async canRenewLoan(req: Request, res: Response): Promise<void> {
        try {
            const { loanId } = req.params;
            const { userId } = req.query;

            if (!loanId || !userId) {
                const response: ApiResponse<never> = createErrorResponse('Loan ID and User ID are required');
                res.status(400).json(response);
                return;
            }

            const canRenew = await this.loanService.canUserRenewLoan(userId as string, loanId);

            const response: ApiResponse<{ canRenew: boolean }> = createSuccessResponse({ canRenew });
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(500).json(response);
        }
    }

    /**
     * VALIDACIÓN DE ENTRADA: Valida datos de creación de préstamo
     */
    private validateCreateLoanRequest(data: any): data is CreateLoanRequestDTO {
        return (
            data &&
            typeof data.userId === 'string' &&
            typeof data.bookId === 'string' &&
            data.userId.length > 0 &&
            data.bookId.length > 0
        );
    }
}
