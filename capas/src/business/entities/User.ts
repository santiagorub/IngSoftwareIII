/**
 * CAPA DE LÓGICA DE NEGOCIO - ENTIDADES
 * 
 * Entidad User: Representa un usuario del sistema (estudiante, profesor, bibliotecario)
 */

export enum UserType {
  STUDENT = 'STUDENT',
  PROFESSOR = 'PROFESSOR',
  LIBRARIAN = 'LIBRARIAN'
}

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly userType: UserType,
    public readonly isActive: boolean = true,
    public readonly currentLoans: number = 0
  ) {
    // Validaciones de negocio
    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email format");
    }
  }

  /**
   * LÓGICA DE NEGOCIO: Determina el máximo de libros que puede pedir prestado
   */
  getMaxLoanLimit(): number {
    switch (this.userType) {
      case UserType.STUDENT:
        return 3;
      case UserType.PROFESSOR:
        return 10;
      case UserType.LIBRARIAN:
        return 15;
      default:
        return 0;
    }
  }

  /**
   * LÓGICA DE NEGOCIO: Determina el período de préstamo en días
   */
  getLoanPeriodDays(): number {
    switch (this.userType) {
      case UserType.STUDENT:
        return 14; // 2 semanas
      case UserType.PROFESSOR:
        return 30; // 1 mes
      case UserType.LIBRARIAN:
        return 60; // 2 meses
      default:
        return 0;
    }
  }

  /**
   * LÓGICA DE NEGOCIO: Verifica si puede tomar un préstamo adicional
   */
  canTakeNewLoan(): boolean {
    return this.isActive && 
           this.currentLoans < this.getMaxLoanLimit();
  }

  /**
   * LÓGICA DE NEGOCIO: Verifica si está cerca del límite de préstamos
   */
  isNearLoanLimit(): boolean {
    const limit = this.getMaxLoanLimit();
    return this.currentLoans >= (limit * 0.8); // 80% del límite
  }

  /**
   * Validación básica de email
   */
  private isValidEmail(email: string): boolean {
    return email.includes('@') && email.includes('.');
  }

  /**
   * Crea una nueva instancia con préstamos actualizados
   */
  withUpdatedLoans(newCurrentLoans: number): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.userType,
      this.isActive,
      newCurrentLoans
    );
  }
}
