/**
 * CAPA DE LÓGICA DE NEGOCIO - ENTIDADES
 * 
 * Entidad Loan: Representa un préstamo de libro con su lógica de negocio
 */

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE'
}

export class Loan {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bookId: string,
    public readonly loanDate: Date,
    public readonly dueDate: Date,
    public readonly returnDate: Date | null = null,
    public readonly status: LoanStatus = LoanStatus.ACTIVE
  ) {
    // Validaciones de negocio
    if (dueDate <= loanDate) {
      throw new Error("Due date must be after loan date");
    }
    if (returnDate && returnDate < loanDate) {
      throw new Error("Return date cannot be before loan date");
    }
  }

  /**
   * LÓGICA DE NEGOCIO: Verifica si el préstamo está vencido
   */
  isOverdue(): boolean {
    if (this.status === LoanStatus.RETURNED) {
      return false;
    }
    return new Date() > this.dueDate;
  }

  /**
   * LÓGICA DE NEGOCIO: Calcula los días de retraso
   */
  getDaysOverdue(): number {
    if (!this.isOverdue()) {
      return 0;
    }
    const today = new Date();
    const diffTime = today.getTime() - this.dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * LÓGICA DE NEGOCIO: Calcula multa por retraso (ej: $1 por día)
   */
  calculateFine(finePerDay: number = 1): number {
    return this.getDaysOverdue() * finePerDay;
  }

  /**
   * LÓGICA DE NEGOCIO: Verifica si está próximo a vencer (3 días o menos)
   */
  isDueSoon(): boolean {
    if (this.status === LoanStatus.RETURNED) {
      return false;
    }
    const today = new Date();
    const diffTime = this.dueDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 3 && daysUntilDue > 0;
  }

  /**
   * LÓGICA DE NEGOCIO: Calcula la duración total del préstamo
   */
  getLoanDuration(): number {
    const endDate = this.returnDate || new Date();
    const diffTime = endDate.getTime() - this.loanDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Retorna el libro (marca como devuelto)
   */
  returnBook(): Loan {
    return new Loan(
      this.id,
      this.userId,
      this.bookId,
      this.loanDate,
      this.dueDate,
      new Date(),
      LoanStatus.RETURNED
    );
  }

  /**
   * Marca como vencido
   */
  markAsOverdue(): Loan {
    return new Loan(
      this.id,
      this.userId,
      this.bookId,
      this.loanDate,
      this.dueDate,
      this.returnDate,
      LoanStatus.OVERDUE
    );
  }
}
