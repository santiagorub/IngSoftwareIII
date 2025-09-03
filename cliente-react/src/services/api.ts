/**
 * SERVICIO DE API - CLIENTE REACT
 *
 * Este servicio maneja la comunicación CLIENTE ←→ SERVIDOR
 *
 * Demuestra:
 * - Arquitectura Cliente-Servidor
 * - Comunicación HTTP/REST
 * - Separación de responsabilidades en el cliente
 */

import axios from 'axios'
import {
    ApiResponse,
    Book,
    User,
    BookStatistics,
    UserStatistics,
    CreateBookRequest,
    CreateUserRequest,
    BookFilters,
} from '../types/api'

// Configuración de axios para comunicarse con el servidor
const api = axios.create({
    baseURL: '/api', // Proxy configurado en vite.config.ts
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
    response => {
        console.log('✅ API Response successful:', response.config.url)
        return response
    },
    error => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            code: error.code,
        })

        if (error.code === 'ECONNABORTED') {
            throw new Error('Timeout: El servidor tardó demasiado en responder')
        }

        if (error.code === 'ERR_NETWORK') {
            throw new Error(
                'Error de red: No se puede conectar al servidor. Verifica que esté ejecutándose en http://localhost:3000',
            )
        }

        if (error.response?.status === 500) {
            throw new Error('Error interno del servidor')
        }

        if (error.response?.status === 404) {
            throw new Error('Endpoint no encontrado')
        }

        // Si no hay respuesta del servidor
        if (!error.response) {
            throw new Error(
                'No se pudo conectar al servidor. Verifica que esté ejecutándose y que el proxy esté configurado correctamente.',
            )
        }

        throw error
    },
)

/**
 * SERVICIO DE LIBROS
 */
export const booksApi = {
    // GET /api/books - Buscar libros
    async searchBooks(filters: BookFilters = {}): Promise<Book[]> {
        const params = new URLSearchParams()

        if (filters.title) params.append('title', filters.title)
        if (filters.author) params.append('author', filters.author)
        if (filters.category) params.append('category', filters.category)
        if (filters.isAvailable !== undefined) {
            params.append('isAvailable', filters.isAvailable.toString())
        }

        const response = await api.get<ApiResponse<Book[]>>(
            '/books?' + params.toString(),
        )

        if (!response.data.success) {
            throw new Error(response.data.error || 'Error buscando libros')
        }

        return response.data.data || []
    },

    // GET /api/books/:id - Obtener libro por ID
    async getBookById(id: string): Promise<Book> {
        const response = await api.get<ApiResponse<Book>>(`/books/${id}`)

        if (!response.data.success) {
            throw new Error(response.data.error || 'Libro no encontrado')
        }

        if (!response.data.data) {
            throw new Error('Libro no encontrado')
        }

        return response.data.data
    },

    // GET /api/books/available - Libros disponibles
    async getAvailableBooks(): Promise<Book[]> {
        const response = await api.get<ApiResponse<Book[]>>('/books/available')

        if (!response.data.success) {
            throw new Error(
                response.data.error || 'Error obteniendo libros disponibles',
            )
        }

        return response.data.data || []
    },

    // GET /api/books/popular - Libros populares
    async getPopularBooks(): Promise<Book[]> {
        const response = await api.get<ApiResponse<Book[]>>('/books/popular')

        if (!response.data.success) {
            throw new Error(
                response.data.error || 'Error obteniendo libros populares',
            )
        }

        return response.data.data || []
    },

    // GET /api/books/statistics - Estadísticas de libros
    async getBookStatistics(): Promise<BookStatistics> {
        const response = await api.get<ApiResponse<BookStatistics>>(
            '/books/statistics',
        )

        if (!response.data.success) {
            throw new Error(
                response.data.error || 'Error obteniendo estadísticas',
            )
        }

        if (!response.data.data) {
            throw new Error('No se pudieron obtener estadísticas')
        }

        return response.data.data
    },

    // POST /api/books - Crear libro
    async createBook(bookData: CreateBookRequest): Promise<Book> {
        const response = await api.post<ApiResponse<Book>>('/books', bookData)

        if (!response.data.success) {
            throw new Error(response.data.error || 'Error creando libro')
        }

        if (!response.data.data) {
            throw new Error('Error creando libro')
        }

        return response.data.data
    },
}

/**
 * SERVICIO DE USUARIOS
 */
export const usersApi = {
    // GET /api/users - Buscar usuarios
    async getUsers(): Promise<User[]> {
        const response = await api.get<ApiResponse<User[]>>('/users')

        if (!response.data.success) {
            throw new Error(response.data.error || 'Error obteniendo usuarios')
        }

        return response.data.data || []
    },

    // GET /api/users/:id - Obtener usuario por ID
    async getUserById(id: string): Promise<User> {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`)

        if (!response.data.success) {
            throw new Error(response.data.error || 'Usuario no encontrado')
        }

        if (!response.data.data) {
            throw new Error('Usuario no encontrado')
        }

        return response.data.data
    },

    // GET /api/users/statistics - Estadísticas de usuarios
    async getUserStatistics(): Promise<UserStatistics> {
        const response = await api.get<ApiResponse<UserStatistics>>(
            '/users/statistics',
        )

        if (!response.data.success) {
            throw new Error(
                response.data.error || 'Error obteniendo estadísticas',
            )
        }

        if (!response.data.data) {
            throw new Error('No se pudieron obtener estadísticas')
        }

        return response.data.data
    },

    // POST /api/users - Crear usuario
    async createUser(userData: CreateUserRequest): Promise<User> {
        const response = await api.post<ApiResponse<User>>('/users', userData)

        if (!response.data.success) {
            throw new Error(response.data.error || 'Error creando usuario')
        }

        if (!response.data.data) {
            throw new Error('Error creando usuario')
        }

        return response.data.data
    },
}

/**
 * SERVICIO DE PRÉSTAMOS
 */
// Eliminado loansApi en la versión simplificada

/**
 * SERVICIO DE DASHBOARD
 */
// Eliminado dashboardApi en la versión simplificada

/**
 * SERVICIO DE SALUD DEL SISTEMA
 */
export const healthApi = {
    // GET /api/health - Verificar que el servidor esté funcionando
    async checkHealth(): Promise<{
        message: string
        timestamp: string
        version: string
    }> {
        const response = await api.get<{
            success: boolean
            message: string
            timestamp: string
            version: string
        }>('/health')
        console.log('🔍 Health response:', response.data)

        if (!response.data.success) {
            throw new Error('El servidor no está respondiendo correctamente')
        }

        // El endpoint de health devuelve los datos directamente, no en un objeto "data"
        return {
            message: response.data.message,
            timestamp: response.data.timestamp,
            version: response.data.version,
        }
    },
}

export default api
