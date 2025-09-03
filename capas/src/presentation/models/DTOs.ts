/**
 * CAPA DE PRESENTACIÓN - MODELOS (DTOs)
 * 
 * Data Transfer Objects - Representan los datos tal como se intercambian
 * con el cliente (JSON). DIFERENTES de las entidades de negocio.
 * 
 * Esto es parte del patrón MVC - estos son los "Models" para la vista.
 */

/**
 * DTO para Book - Presentación al cliente
 */
export interface BookDTO {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  publishedYear: number;
  isAvailable: boolean;
  isPopular: boolean;
  isRecent: boolean;
  availabilityPercentage: number;
}

/**
 * DTO para User - Presentación al cliente (sin datos sensibles)
 */
export interface UserDTO {
  id: string;
  email: string;
  name: string;
  userType: string;
  isActive: boolean;
  currentLoans: number;
  maxLoanLimit: number;
  loanPeriodDays: number;
  canTakeNewLoan: boolean;
  isNearLoanLimit: boolean;
}

/**
 * DTO para Loan - Presentación al cliente
 */
export interface LoanDTO {
  id: string;
  userId: string;
  bookId: string;
  loanDate: string; // ISO string para JSON
  dueDate: string;
  returnDate: string | null;
  status: string;
  isOverdue: boolean;
  daysOverdue: number;
  isDueSoon: boolean;
  fine: number;
  loanDuration: number;
}

/**
 * DTO completo con información de préstamo, usuario y libro
 */
export interface LoanSummaryDTO {
  loan: LoanDTO;
  user: UserDTO;
  book: BookDTO;
  daysRemaining: number;
  fine: number;
}

/**
 * DTOs para requests de creación
 */
export interface CreateBookRequestDTO {
  isbn: string;
  title: string;
  author: string;
  category: string;
  totalCopies: number;
  publishedYear: number;
}

export interface UpdateBookRequestDTO {
  isbn?: string;
  title?: string;
  author?: string;
  category?: string;
  totalCopies?: number;
  publishedYear?: number;
}

export interface CreateUserRequestDTO {
  email: string;
  name: string;
  userType: 'STUDENT' | 'PROFESSOR' | 'LIBRARIAN';
}

export interface CreateLoanRequestDTO {
  userId: string;
  bookId: string;
}

/**
 * DTOs para búsquedas y filtros
 */
export interface BookSearchRequestDTO {
  title?: string;
  author?: string;
  isbn?: string;
  category?: string;
  isAvailable?: boolean;
}

export interface UserSearchRequestDTO {
  name?: string;
  email?: string;
  userType?: 'STUDENT' | 'PROFESSOR' | 'LIBRARIAN';
  isActive?: boolean;
  hasLoans?: boolean;
}

/**
 * DTOs para estadísticas
 */
export interface BookStatisticsDTO {
  totalBooks: number;
  availableBooks: number;
  popularBooks: number;
  recentBooks: number;
  totalCopies: number;
  availableCopies: number;
}

export interface UserStatisticsDTO {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersNearLimit: number;
  usersByType: {
    students: number;
    professors: number;
    librarians: number;
  };
  totalActiveLoans: number;
  averageLoansPerUser: number;
}

export interface LoanStatisticsDTO {
  totalLoans: number;
  activeLoans: number;
  returnedLoans: number;
  overdueLoans: number;
  currentOverdueLoans: number;
  currentUpcomingDueLoans: number;
  averageLoanDuration: number;
  totalFines: number;
}

/**
 * DTOs para respuestas de API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * DTOs para reportes
 */
export interface LibraryDashboardDTO {
  bookStats: BookStatisticsDTO;
  userStats: UserStatisticsDTO;
  loanStats: LoanStatisticsDTO;
  recentActivity: {
    recentLoans: LoanSummaryDTO[];
    overdueLoans: LoanSummaryDTO[];
    upcomingDueLoans: LoanSummaryDTO[];
  };
}
