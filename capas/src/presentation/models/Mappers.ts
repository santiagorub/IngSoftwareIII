/**
 * CAPA DE PRESENTACIÓN - MAPPERS
 *
 * Convierte entre entidades de negocio y DTOs de presentación.
 * Esto mantiene separadas las capas y permite evolucionar independientemente.
 */

import { Book } from '../../business/entities/Book';
import { User } from '../../business/entities/User';
import { Loan } from '../../business/entities/Loan';
import { LoanSummary } from '../../business/services/LoanService';
import { BookDTO, UserDTO, LoanDTO, LoanSummaryDTO } from './DTOs';

/**
 * Convierte Book (entidad) a BookDTO (presentación)
 */
export function bookToDTO(book: Book): BookDTO {
    return {
        id: book.id,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        category: book.category,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        publishedYear: book.publishedYear,
        isAvailable: book.isAvailableForLoan(),
        isPopular: book.isPopular(),
        isRecent: book.isRecent(),
        availabilityPercentage: Math.round(book.getAvailabilityPercentage()),
    };
}

/**
 * Convierte User (entidad) a UserDTO (presentación)
 */
export function userToDTO(user: User): UserDTO {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        isActive: user.isActive,
        currentLoans: user.currentLoans,
        maxLoanLimit: user.getMaxLoanLimit(),
        loanPeriodDays: user.getLoanPeriodDays(),
        canTakeNewLoan: user.canTakeNewLoan(),
        isNearLoanLimit: user.isNearLoanLimit(),
    };
}

/**
 * Convierte Loan (entidad) a LoanDTO (presentación)
 */
export function loanToDTO(loan: Loan): LoanDTO {
    return {
        id: loan.id,
        userId: loan.userId,
        bookId: loan.bookId,
        loanDate: loan.loanDate.toISOString(),
        dueDate: loan.dueDate.toISOString(),
        returnDate: loan.returnDate?.toISOString() || null,
        status: loan.status,
        isOverdue: loan.isOverdue(),
        daysOverdue: loan.getDaysOverdue(),
        isDueSoon: loan.isDueSoon(),
        fine: loan.calculateFine(),
        loanDuration: loan.getLoanDuration(),
    };
}

/**
 * Convierte LoanSummary (servicio) a LoanSummaryDTO (presentación)
 */
export function loanSummaryToDTO(loanSummary: LoanSummary): LoanSummaryDTO {
    return {
        loan: loanToDTO(loanSummary.loan),
        user: userToDTO(loanSummary.user),
        book: bookToDTO(loanSummary.book),
        daysRemaining: loanSummary.daysRemaining,
        fine: loanSummary.fine,
    };
}

/**
 * Convierte arrays de entidades a arrays de DTOs
 */
export function booksToDTO(books: Book[]): BookDTO[] {
    return books.map((book) => bookToDTO(book));
}

export function usersToDTO(users: User[]): UserDTO[] {
    return users.map((user) => userToDTO(user));
}

export function loansToDTO(loans: Loan[]): LoanDTO[] {
    return loans.map((loan) => loanToDTO(loan));
}

export function loanSummariesToDTO(summaries: LoanSummary[]): LoanSummaryDTO[] {
    return summaries.map((summary) => loanSummaryToDTO(summary));
}

/**
 * Mapper helper para respuestas de API exitosas
 */
export function createSuccessResponse<T>(data: T, message?: string) {
    return {
        success: true,
        data,
        message,
    };
}

/**
 * Mapper helper para respuestas de API con error
 */
export function createErrorResponse(error: string) {
    return {
        success: false,
        error,
    };
}

/**
 * Mapper para respuestas paginadas
 */
export function createPaginatedResponse<T>(items: T[], total: number, page: number, pageSize: number) {
    return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
