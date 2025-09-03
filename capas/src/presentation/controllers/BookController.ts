/**
 * CAPA DE PRESENTACIÓN - CONTROLADOR DE LIBROS
 *
 * Parte "Controller" del patrón MVC.
 * Maneja las peticiones HTTP, valida entrada, llama a la lógica de negocio,
 * y convierte las respuestas a formato JSON.
 */

import { Request, Response } from 'express';
import { BookService } from '../../business/services/BookService';
import { BookSearchRequestDTO, CreateBookRequestDTO, UpdateBookRequestDTO, ApiResponse, BookDTO, BookStatisticsDTO } from '../models/DTOs';
import { bookToDTO, booksToDTO, createSuccessResponse, createErrorResponse } from '../models/Mappers';
import { BookSearchFilters } from '../../data/models/DataModels';

export class BookController {
    constructor(private bookService: BookService) {}

    /**
     * GET /api/books - Busca libros con filtros opcionales
     */
    async searchBooks(req: Request, res: Response): Promise<void> {
        try {
            // Extraer parámetros de query (validación de entrada)
            const searchParams: BookSearchRequestDTO = {
                title: req.query.title as string,
                author: req.query.author as string,
                isbn: req.query.isbn as string,
                category: req.query.category as string,
                isAvailable: req.query.isAvailable ? req.query.isAvailable === 'true' : undefined,
            };

            // Convertir DTO de presentación a filtros de negocio
            const filters: BookSearchFilters = {
                title: searchParams.title,
                author: searchParams.author,
                isbn: searchParams.isbn,
                category: searchParams.category,
                isAvailable: searchParams.isAvailable,
            };

            // Llamar a la lógica de negocio
            const books = await this.bookService.searchBooks(filters);

            // Convertir entidades a DTOs de presentación
            const bookDTOs = booksToDTO(books);

            // Responder con formato JSON estándar
            const response: ApiResponse<BookDTO[]> = createSuccessResponse(bookDTOs);
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(400).json(response);
        }
    }

    /**
     * GET /api/books/:id - Obtiene un libro por ID
     */
    async getBookById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Validación básica de entrada
            if (!id) {
                const response: ApiResponse<never> = createErrorResponse('Book ID is required');
                res.status(400).json(response);
                return;
            }

            // Llamar a la lógica de negocio
            const book = await this.bookService.getBookById(id);

            if (!book) {
                const response: ApiResponse<never> = createErrorResponse('Book not found');
                res.status(404).json(response);
                return;
            }

            // Convertir entidad a DTO
            const bookDTO = bookToDTO(book);
            const response: ApiResponse<BookDTO> = createSuccessResponse(bookDTO);
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(500).json(response);
        }
    }

    /**
     * GET /api/books/available - Obtiene libros disponibles
     */
    async getAvailableBooks(req: Request, res: Response): Promise<void> {
        try {
            const books = await this.bookService.getAvailableBooks();
            const bookDTOs = booksToDTO(books);
            const response: ApiResponse<BookDTO[]> = createSuccessResponse(bookDTOs);
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(500).json(response);
        }
    }

    /**
     * GET /api/books/popular - Obtiene libros populares
     */
    async getPopularBooks(req: Request, res: Response): Promise<void> {
        try {
            const books = await this.bookService.getPopularBooks();
            const bookDTOs = booksToDTO(books);
            const response: ApiResponse<BookDTO[]> = createSuccessResponse(bookDTOs);
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(500).json(response);
        }
    }

    /**
     * GET /api/books/recent - Obtiene libros recientes
     */
    async getRecentBooks(req: Request, res: Response): Promise<void> {
        try {
            const books = await this.bookService.getRecentBooks();
            const bookDTOs = booksToDTO(books);
            const response: ApiResponse<BookDTO[]> = createSuccessResponse(bookDTOs);
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(500).json(response);
        }
    }

    /**
     * GET /api/books/recommendations/:category - Obtiene recomendaciones por categoría
     */
    async getRecommendations(req: Request, res: Response): Promise<void> {
        try {
            const { category } = req.params;
            const limit = parseInt(req.query.limit as string) || 5;

            if (!category) {
                const response: ApiResponse<never> = createErrorResponse('Category is required');
                res.status(400).json(response);
                return;
            }

            const books = await this.bookService.getRecommendations(category, limit);
            const bookDTOs = booksToDTO(books);
            const response: ApiResponse<BookDTO[]> = createSuccessResponse(bookDTOs);
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(500).json(response);
        }
    }

    /**
     * POST /api/books - Crea un nuevo libro
     */
    async createBook(req: Request, res: Response): Promise<void> {
        try {
            // Validar estructura del request body
            const bookData: CreateBookRequestDTO = req.body;

            if (!this.validateCreateBookRequest(bookData)) {
                const response: ApiResponse<never> = createErrorResponse('Invalid book data');
                res.status(400).json(response);
                return;
            }

            // Llamar a la lógica de negocio
            const newBook = await this.bookService.createBook(bookData);

            // Convertir entidad a DTO
            const bookDTO = bookToDTO(newBook);
            const response: ApiResponse<BookDTO> = createSuccessResponse(bookDTO, 'Book created successfully');
            res.status(201).json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(400).json(response);
        }
    }

    /**
     * PUT /api/books/:id - Actualiza un libro existente
     */
    async updateBook(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            
            // Validación básica de entrada
            if (!id) {
                const response: ApiResponse<never> = createErrorResponse('Book ID is required');
                res.status(400).json(response);
                return;
            }

            // Validar estructura del request body
            const updateData: UpdateBookRequestDTO = req.body;

            if (!this.validateUpdateBookRequest(updateData)) {
                const response: ApiResponse<never> = createErrorResponse('Invalid book update data');
                res.status(400).json(response);
                return;
            }

            // Llamar a la lógica de negocio
            const updatedBook = await this.bookService.updateBook(id, updateData);

            // Convertir entidad a DTO
            const bookDTO = bookToDTO(updatedBook);
            const response: ApiResponse<BookDTO> = createSuccessResponse(bookDTO, 'Book updated successfully');
            res.json(response);
        } catch (error) {
            if (error instanceof Error && error.message === 'Book not found') {
                const response: ApiResponse<never> = createErrorResponse('Book not found');
                res.status(404).json(response);
            } else {
                const response: ApiResponse<never> = createErrorResponse(
                    error instanceof Error ? error.message : 'Unknown error occurred',
                );
                res.status(400).json(response);
            }
        }
    }

    /**
     * DELETE /api/books/:id - Elimina un libro
     */
    async deleteBook(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Validación básica de entrada
            if (!id) {
                const response: ApiResponse<never> = createErrorResponse('Book ID is required');
                res.status(400).json(response);
                return;
            }

            // Llamar a la lógica de negocio
            const success = await this.bookService.deleteBook(id);

            if (!success) {
                const response: ApiResponse<never> = createErrorResponse('Failed to delete book');
                res.status(500).json(response);
                return;
            }

            const response: ApiResponse<null> = createSuccessResponse(null, 'Book deleted successfully');
            res.json(response);
        } catch (error) {
            if (error instanceof Error && error.message === 'Book not found') {
                const response: ApiResponse<never> = createErrorResponse('Book not found');
                res.status(404).json(response);
            } else {
                const response: ApiResponse<never> = createErrorResponse(
                    error instanceof Error ? error.message : 'Unknown error occurred',
                );
                res.status(400).json(response);
            }
        }
    }

    /**
     * GET /api/books/statistics - Obtiene estadísticas de libros
     */
    async getBookStatistics(req: Request, res: Response): Promise<void> {
        try {
            const stats = await this.bookService.getBookStatistics();
            const response: ApiResponse<BookStatisticsDTO> = createSuccessResponse(stats);
            res.json(response);
        } catch (error) {
            const response: ApiResponse<never> = createErrorResponse(
                error instanceof Error ? error.message : 'Unknown error occurred',
            );
            res.status(500).json(response);
        }
    }

    /**
     * VALIDACIÓN DE ENTRADA: Valida datos de creación de libro
     */
    private validateCreateBookRequest(data: any): data is CreateBookRequestDTO {
        return (
            data &&
            typeof data.isbn === 'string' &&
            typeof data.title === 'string' &&
            typeof data.author === 'string' &&
            typeof data.category === 'string' &&
            typeof data.totalCopies === 'number' &&
            typeof data.publishedYear === 'number' &&
            data.isbn.length >= 10 &&
            data.title.length >= 1 &&
            data.author.length >= 1 &&
            data.category.length >= 1 &&
            data.totalCopies > 0 &&
            data.publishedYear > 1000 &&
            data.publishedYear <= new Date().getFullYear()
        );
    }

    /**
     * VALIDACIÓN DE ENTRADA: Valida datos de actualización de libro
     */
    private validateUpdateBookRequest(data: any): data is UpdateBookRequestDTO {
        // Al menos un campo debe estar presente para actualización
        if (!data || Object.keys(data).length === 0) {
            return false;
        }

        // Validar campos presentes
        if (data.isbn !== undefined && (typeof data.isbn !== 'string' || data.isbn.length < 10)) {
            return false;
        }

        if (data.title !== undefined && (typeof data.title !== 'string' || data.title.length < 1)) {
            return false;
        }

        if (data.author !== undefined && (typeof data.author !== 'string' || data.author.length < 1)) {
            return false;
        }

        if (data.category !== undefined && (typeof data.category !== 'string' || data.category.length < 1)) {
            return false;
        }

        if (data.totalCopies !== undefined && (typeof data.totalCopies !== 'number' || data.totalCopies < 1)) {
            return false;
        }

        if (data.publishedYear !== undefined) {
            const currentYear = new Date().getFullYear();
            if (typeof data.publishedYear !== 'number' || data.publishedYear < 1000 || data.publishedYear > currentYear) {
                return false;
            }
        }

        return true;
    }
}
