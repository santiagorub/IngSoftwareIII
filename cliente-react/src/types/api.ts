/**
 * TIPOS DE LA API - CLIENTE REACT
 *
 * Estos tipos definen la estructura de datos que viaja entre
 * CLIENTE (React) ←→ SERVIDOR (Node.js API)
 *
 * Esto demuestra el contrato de comunicación en Cliente-Servidor
 */

// Respuesta estándar de la API
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

// Entidades principales
export interface Book {
    id: string
    isbn: string
    title: string
    author: string
    category: string
    totalCopies: number
    availableCopies: number
    publishedYear: number
    isAvailable: boolean
    isPopular: boolean
    isRecent: boolean
    availabilityPercentage: number
}

export interface User {
    id: string
    email: string
    name: string
    userType: 'STUDENT' | 'PROFESSOR' | 'LIBRARIAN'
    isActive: boolean
    currentLoans: number
    maxLoanLimit: number
    loanPeriodDays: number
    canTakeNewLoan: boolean
    isNearLoanLimit: boolean
}

// Eliminados tipos de préstamos para simplificar

// Estadísticas del dashboard
export interface BookStatistics {
    totalBooks: number
    availableBooks: number
    popularBooks: number
    recentBooks: number
    totalCopies: number
    availableCopies: number
}

export interface UserStatistics {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    usersNearLimit: number
    usersByType: {
        students: number
        professors: number
        librarians: number
    }
    totalActiveLoans: number
    averageLoansPerUser: number
}

// Eliminado DashboardData en la versión simplificada

// Requests para crear entidades
export interface CreateBookRequest {
    isbn: string
    title: string
    author: string
    category: string
    totalCopies: number
    publishedYear: number
}

export interface CreateUserRequest {
    email: string
    name: string
    userType: 'STUDENT' | 'PROFESSOR' | 'LIBRARIAN'
}

// Eliminado CreateLoanRequest en la versión simplificada

// Filtros para búsquedas
export interface BookFilters {
    title?: string
    author?: string
    category?: string
    isAvailable?: boolean
}
