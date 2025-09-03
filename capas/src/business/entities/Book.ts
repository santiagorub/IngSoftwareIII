/**
 * CAPA DE LÓGICA DE NEGOCIO - ENTIDADES
 * 
 * Entidad Book: Representa un libro en el sistema con su lógica de negocio
 */

export class Book {
  constructor(
    public readonly id: string,
    public readonly isbn: string,
    public readonly title: string,
    public readonly author: string,
    public readonly category: string,
    public readonly totalCopies: number,
    public readonly availableCopies: number,
    public readonly publishedYear: number
  ) {
    // Validaciones de negocio en el constructor
    if (availableCopies > totalCopies) {
      throw new Error("Available copies cannot exceed total copies");
    }
    if (totalCopies < 0 || availableCopies < 0) {
      throw new Error("Copies cannot be negative");
    }
  }

  /**
   * LÓGICA DE NEGOCIO: Determina si el libro está disponible para préstamo
   */
  isAvailableForLoan(): boolean {
    return this.availableCopies > 0;
  }

  /**
   * LÓGICA DE NEGOCIO: Calcula el porcentaje de disponibilidad
   */
  getAvailabilityPercentage(): number {
    if (this.totalCopies === 0) return 0;
    return (this.availableCopies / this.totalCopies) * 100;
  }

  /**
   * LÓGICA DE NEGOCIO: Determina si es un libro popular (menos del 30% disponible)
   */
  isPopular(): boolean {
    return this.getAvailabilityPercentage() < 30;
  }

  /**
   * LÓGICA DE NEGOCIO: Valida si el libro es reciente (menos de 5 años)
   */
  isRecent(): boolean {
    const currentYear = new Date().getFullYear();
    return (currentYear - this.publishedYear) <= 5;
  }

  /**
   * Crea una nueva instancia con copias actualizadas (inmutabilidad)
   */
  withUpdatedCopies(newAvailableCopies: number): Book {
    return new Book(
      this.id,
      this.isbn,
      this.title,
      this.author,
      this.category,
      this.totalCopies,
      newAvailableCopies,
      this.publishedYear
    );
  }
}
