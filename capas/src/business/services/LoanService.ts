/**
 * CAPA DE LÓGICA DE NEGOCIO - SERVICIO DE PRÉSTAMOS
 * 
 * Contiene la lógica de negocio más compleja del sistema.
 * Orquesta operaciones entre usuarios, libros y préstamos.
 */

import { Loan, LoanStatus } from '../entities/Loan';
import { User } from '../entities/User';
import { Book } from '../entities/Book';
import { ILoanRepository } from '../../data/repositories/ILoanRepository';
import { BookService } from './BookService';
import { UserService } from './UserService';

export interface CreateLoanRequest {
  userId: string;
  bookId: string;
}

export interface LoanSummary {
  loan: Loan;
  user: User;
  book: Book;
  daysRemaining: number;
  fine: number;
}

export class LoanService {
  constructor(
    private loanRepository: ILoanRepository,
    private bookService: BookService,
    private userService: UserService
  ) {}

  /**
   * LÓGICA DE NEGOCIO COMPLEJA: Crea un nuevo préstamo
   * Valida todas las reglas de negocio antes de proceder
   */
  async createLoan(request: CreateLoanRequest): Promise<Loan> {
    // 1. Validar que el usuario existe y puede tomar préstamos
    const user = await this.userService.getUserById(request.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    if (!user.canTakeNewLoan()) {
      throw new Error(`User cannot take more loans. Current: ${user.currentLoans}, Max: ${user.getMaxLoanLimit()}`);
    }

    // 2. Validar que el libro existe y está disponible
    const book = await this.bookService.getBookById(request.bookId);
    if (!book) {
      throw new Error("Book not found");
    }
    
    if (!book.isAvailableForLoan()) {
      throw new Error("Book is not available for loan");
    }

    // 3. Verificar que el usuario no tiene ya este libro en préstamo
    const hasActiveLoan = await this.loanRepository.hasActiveLoan(request.userId, request.bookId);
    if (hasActiveLoan) {
      throw new Error("User already has an active loan for this book");
    }

    // 4. Calcular fechas según el tipo de usuario
    const loanDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(loanDate.getDate() + user.getLoanPeriodDays());

    // 5. Crear el préstamo
    const loan = new Loan(
      this.loanRepository.generateId(),
      request.userId,
      request.bookId,
      loanDate,
      dueDate
    );

    // 6. Transacción: Reservar libro y actualizar contador de usuario
    try {
      await this.bookService.reserveBook(request.bookId);
      await this.userService.incrementLoanCount(request.userId);
      const savedLoan = await this.loanRepository.save(loan);
      
      return savedLoan;
    } catch (error) {
      // Rollback: Si algo falla, revertir cambios
      // En un sistema real, esto sería una transacción de BD
      throw new Error(`Failed to create loan: ${error}`);
    }
  }

  /**
   * LÓGICA DE NEGOCIO: Devuelve un libro
   */
  async returnBook(loanId: string): Promise<Loan> {
    const loan = await this.loanRepository.findById(loanId);
    if (!loan) {
      throw new Error("Loan not found");
    }

    if (loan.status === LoanStatus.RETURNED) {
      throw new Error("Book is already returned");
    }

    // Marcar como devuelto
    const returnedLoan = loan.returnBook();

    // Transacción: Devolver libro y actualizar contador de usuario
    try {
      await this.bookService.returnBook(loan.bookId);
      await this.userService.decrementLoanCount(loan.userId);
      const savedLoan = await this.loanRepository.update(returnedLoan);
      
      return savedLoan;
    } catch (error) {
      throw new Error(`Failed to return book: ${error}`);
    }
  }

  /**
   * LÓGICA DE NEGOCIO: Procesa préstamos vencidos
   */
  async processOverdueLoans(): Promise<Loan[]> {
    const overdueLoans = await this.loanRepository.findOverdueLoans();
    const processedLoans: Loan[] = [];

    for (const loan of overdueLoans) {
      if (loan.status !== LoanStatus.OVERDUE) {
        const overdueMarkedLoan = loan.markAsOverdue();
        const updatedLoan = await this.loanRepository.update(overdueMarkedLoan);
        processedLoans.push(updatedLoan);
      }
    }

    return processedLoans;
  }

  /**
   * LÓGICA DE NEGOCIO: Obtiene resumen de préstamos con información completa
   */
  async getLoanSummary(loanId: string): Promise<LoanSummary | null> {
    const loan = await this.loanRepository.findById(loanId);
    if (!loan) return null;

    const user = await this.userService.getUserById(loan.userId);
    const book = await this.bookService.getBookById(loan.bookId);

    if (!user || !book) return null;

    const today = new Date();
    const daysRemaining = Math.ceil((loan.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const fine = loan.calculateFine();

    return {
      loan,
      user,
      book,
      daysRemaining,
      fine
    };
  }

  /**
   * Obtiene préstamos activos de un usuario con información completa
   */
  async getUserActiveLoans(userId: string): Promise<LoanSummary[]> {
    const loans = await this.loanRepository.findActiveByUserId(userId);
    const summaries: LoanSummary[] = [];

    for (const loan of loans) {
      const summary = await this.getLoanSummary(loan.id);
      if (summary) {
        summaries.push(summary);
      }
    }

    return summaries;
  }

  /**
   * LÓGICA DE NEGOCIO: Obtiene préstamos que vencen pronto
   */
  async getUpcomingDueLoans(): Promise<LoanSummary[]> {
    const upcomingLoans = await this.loanRepository.findLoansDueSoon();
    const summaries: LoanSummary[] = [];

    for (const loan of upcomingLoans) {
      const summary = await this.getLoanSummary(loan.id);
      if (summary) {
        summaries.push(summary);
      }
    }

    return summaries;
  }

  /**
   * LÓGICA DE NEGOCIO: Renueva un préstamo (si es posible)
   */
  async renewLoan(loanId: string): Promise<Loan> {
    const loan = await this.loanRepository.findById(loanId);
    if (!loan) {
      throw new Error("Loan not found");
    }

    if (loan.status !== LoanStatus.ACTIVE) {
      throw new Error("Only active loans can be renewed");
    }

    if (loan.isOverdue()) {
      throw new Error("Overdue loans cannot be renewed");
    }

    // Verificar que el libro no esté muy demandado (menos del 20% disponible)
    const book = await this.bookService.getBookById(loan.bookId);
    if (book && book.getAvailabilityPercentage() < 20) {
      throw new Error("This book is in high demand and cannot be renewed");
    }

    // Obtener el usuario para calcular nuevo período
    const user = await this.userService.getUserById(loan.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Extender la fecha de vencimiento
    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + user.getLoanPeriodDays());

    const renewedLoan = new Loan(
      loan.id,
      loan.userId,
      loan.bookId,
      loan.loanDate,
      newDueDate,
      loan.returnDate,
      loan.status
    );

    return await this.loanRepository.update(renewedLoan);
  }

  /**
   * Obtiene estadísticas de préstamos
   */
  async getLoanStatistics(startDate: Date, endDate: Date) {
    const stats = await this.loanRepository.getLoanStatistics(startDate, endDate);
    const overdueLoans = await this.loanRepository.findOverdueLoans();
    const upcomingDueLoans = await this.loanRepository.findLoansDueSoon();

    return {
      ...stats,
      currentOverdueLoans: overdueLoans.length,
      currentUpcomingDueLoans: upcomingDueLoans.length,
      totalFines: overdueLoans.reduce((sum, loan) => sum + loan.calculateFine(), 0)
    };
  }

  /**
   * REGLA DE NEGOCIO: Verifica si un usuario puede renovar un préstamo
   */
  async canUserRenewLoan(userId: string, loanId: string): Promise<boolean> {
    try {
      await this.renewLoan(loanId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene historial de préstamos de un usuario
   */
  async getUserLoanHistory(userId: string): Promise<LoanSummary[]> {
    const loans = await this.loanRepository.findByUserId(userId);
    const summaries: LoanSummary[] = [];

    for (const loan of loans) {
      const summary = await this.getLoanSummary(loan.id);
      if (summary) {
        summaries.push(summary);
      }
    }

    // Ordenar por fecha de préstamo (más reciente primero)
    return summaries.sort((a, b) => b.loan.loanDate.getTime() - a.loan.loanDate.getTime());
  }
}
