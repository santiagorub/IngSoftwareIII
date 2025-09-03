/**
 * CAPA DE ACCESO A DATOS - MODELOS DE DATOS
 * 
 * Estos modelos representan la estructura de datos tal como se almacena,
 * NO la lógica de negocio (esa está en las entidades)
 */

/**
 * Modelo de datos para Book - estructura de persistencia
 */
export interface BookData {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  publishedYear: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Modelo de datos para User - estructura de persistencia
 */
export interface UserData {
  id: string;
  email: string;
  name: string;
  userType: 'STUDENT' | 'PROFESSOR' | 'LIBRARIAN';
  isActive: boolean;
  currentLoans: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Modelo de datos para Loan - estructura de persistencia
 */
export interface LoanData {
  id: string;
  userId: string;
  bookId: string;
  loanDate: string; // ISO string para persistencia
  dueDate: string;   // ISO string para persistencia
  returnDate: string | null;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  createdAt: string;
  updatedAt: string;
}

/**
 * Filtros para búsqueda de libros
 */
export interface BookSearchFilters {
  title?: string;
  author?: string;
  isbn?: string;
  category?: string;
  isAvailable?: boolean;
}

/**
 * Filtros para búsqueda de préstamos
 */
export interface LoanSearchFilters {
  userId?: string;
  bookId?: string;
  status?: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  isOverdue?: boolean;
  dueSoon?: boolean;
}
