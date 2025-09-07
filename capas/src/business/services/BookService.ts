/**
 * CAPA DE LÓGICA DE NEGOCIO - SERVICIO DE LIBROS
 *
 * Contiene la lógica de negocio para operaciones con libros.
 * Orquesta entre repositorios y aplica reglas de negocio.
 */

import { Book } from '../entities/Book';
import { IBookRepository } from '../../data/interfaces/IBookRepository';
import { BookSearchFilters } from '../../data/models/DataModels';

export class BookService {
  constructor(private bookRepository: IBookRepository) {}

    /**
     * LÓGICA DE NEGOCIO: Busca libros aplicando reglas de negocio
     */
    async searchBooks(filters: BookSearchFilters): Promise<Book[]> {
        // Validaciones de entrada
        if (filters.title && filters.title.length < 2) {
            throw new Error('Title search must be at least 2 characters');
        }

        if (filters.author && filters.author.length < 2) {
            throw new Error('Author search must be at least 2 characters');
        }

        const books = await this.bookRepository.search(filters);

        // Regla de negocio: Ordenar por relevancia
        return this.sortByRelevance(books, filters);
    }

    /**
     * Obtiene un libro por ID
     */
    async getBookById(id: string): Promise<Book | null> {
        if (!id) {
            throw new Error('Book ID is required');
        }

        return await this.bookRepository.findById(id);
    }

    /**
     * LÓGICA DE NEGOCIO: Obtiene libros disponibles para préstamo
     */
    async getAvailableBooks(): Promise<Book[]> {
        const filters: BookSearchFilters = { isAvailable: true };
        return await this.bookRepository.search(filters);
    }

    /**
     * LÓGICA DE NEGOCIO: Obtiene libros populares (alta demanda)
     */
    async getPopularBooks(): Promise<Book[]> {
        return await this.bookRepository.findPopularBooks();
    }

    /**
     * LÓGICA DE NEGOCIO: Obtiene libros recientes
     */
    async getRecentBooks(): Promise<Book[]> {
        return await this.bookRepository.findRecentBooks();
    }

    /**
     * LÓGICA DE NEGOCIO: Obtiene recomendaciones basadas en categoría
     */
    async getRecommendations(categoryOfInterest: string, limit: number = 5): Promise<Book[]> {
        const filters: BookSearchFilters = {
            category: categoryOfInterest,
            isAvailable: true,
        };

        let books = await this.bookRepository.search(filters);

        // Regla de negocio: Priorizar libros recientes y populares
        books = books.sort((a, b) => {
            const aScore = this.calculateRecommendationScore(a);
            const bScore = this.calculateRecommendationScore(b);
            return bScore - aScore;
        });

        return books.slice(0, limit);
    }

    /**
     * LÓGICA DE NEGOCIO: Crea un nuevo libro con validaciones
     */
    async createBook(bookData: {
        isbn: string;
        title: string;
        author: string;
        category: string;
        totalCopies: number;
        publishedYear: number;
    }): Promise<Book> {
        // Validaciones de negocio
        this.validateBookData(bookData);

        // Verificar que no exista un libro con el mismo ISBN
        const existingBooks = await this.bookRepository.search({ isbn: bookData.isbn });
        if (existingBooks.length > 0) {
            throw new Error(`A book with ISBN ${bookData.isbn} already exists`);
        }

        const newBook = new Book(
            this.bookRepository.generateId(),
            bookData.isbn,
            bookData.title,
            bookData.author,
            bookData.category,
            bookData.totalCopies,
            bookData.totalCopies, // Inicialmente todas las copias están disponibles
            bookData.publishedYear,
        );

        return await this.bookRepository.save(newBook);
    }

    /**
     * LÓGICA DE NEGOCIO: Actualiza las copias disponibles cuando se presta un libro
     */
    async reserveBook(bookId: string): Promise<Book> {
        const book = await this.bookRepository.findById(bookId);
        if (!book) {
            throw new Error('Book not found');
        }

        if (!book.isAvailableForLoan()) {
            throw new Error('Book is not available for loan');
        }

        const updatedBook = await this.bookRepository.updateAvailableCopies(bookId, book.availableCopies - 1);

        if (!updatedBook) {
            throw new Error('Failed to reserve book');
        }

        return updatedBook;
    }

    /**
     * LÓGICA DE NEGOCIO: Actualiza las copias disponibles cuando se devuelve un libro
     */
    async returnBook(bookId: string): Promise<Book> {
        const book = await this.bookRepository.findById(bookId);
        if (!book) {
            throw new Error('Book not found');
        }

        if (book.availableCopies >= book.totalCopies) {
            throw new Error('All copies are already available');
        }

        const updatedBook = await this.bookRepository.updateAvailableCopies(bookId, book.availableCopies + 1);

        if (!updatedBook) {
            throw new Error('Failed to return book');
        }

        return updatedBook;
    }

    /**
     * LÓGICA DE NEGOCIO: Actualiza un libro existente
     */
    async updateBook(bookId: string, updateData: {
        isbn?: string;
        title?: string;
        author?: string;
        category?: string;
        totalCopies?: number;
        publishedYear?: number;
    }): Promise<Book> {
        // Verificar que el libro existe
        const existingBook = await this.bookRepository.findById(bookId);
        if (!existingBook) {
            throw new Error('Book not found');
        }

        // Validar datos proporcionados
        this.validateUpdateBookData(updateData);

        // Si se está actualizando el ISBN, verificar que no exista otro libro con ese ISBN
        if (updateData.isbn && updateData.isbn !== existingBook.isbn) {
            const booksWithSameISBN = await this.bookRepository.search({ isbn: updateData.isbn });
            if (booksWithSameISBN.length > 0) {
                throw new Error(`A book with ISBN ${updateData.isbn} already exists`);
            }
        }

        // Validación de negocio: no se puede reducir las copias totales por debajo de las prestadas
        if (updateData.totalCopies !== undefined) {
            const loanedCopies = existingBook.totalCopies - existingBook.availableCopies;
            if (updateData.totalCopies < loanedCopies) {
                throw new Error(`Cannot reduce total copies below ${loanedCopies} (currently loaned copies)`);
            }
        }

        // Crear libro actualizado manteniendo valores existentes para campos no proporcionados
        const updatedBook = new Book(
            existingBook.id,
            updateData.isbn ?? existingBook.isbn,
            updateData.title ?? existingBook.title,
            updateData.author ?? existingBook.author,
            updateData.category ?? existingBook.category,
            updateData.totalCopies ?? existingBook.totalCopies,
            updateData.totalCopies !== undefined 
                ? Math.min(updateData.totalCopies, existingBook.availableCopies + (updateData.totalCopies - existingBook.totalCopies))
                : existingBook.availableCopies,
            updateData.publishedYear ?? existingBook.publishedYear
        );

        return await this.bookRepository.save(updatedBook);
    }

    /**
     * LÓGICA DE NEGOCIO: Elimina un libro del sistema
     */
    async deleteBook(bookId: string): Promise<boolean> {
        // Verificar que el libro existe
        const existingBook = await this.bookRepository.findById(bookId);
        if (!existingBook) {
            throw new Error('Book not found');
        }

        // Regla de negocio: No se puede eliminar un libro que tiene préstamos activos
        const loanedCopies = existingBook.totalCopies - existingBook.availableCopies;
        if (loanedCopies > 0) {
            throw new Error('Cannot delete book with active loans');
        }

        return await this.bookRepository.delete(bookId);
    }

    /**
     * Obtiene estadísticas de libros
     */
    async getBookStatistics() {
        const allBooks = await this.bookRepository.findAll();
        const availableBooks = allBooks.filter((book) => book.isAvailableForLoan());
        const popularBooks = allBooks.filter((book) => book.isPopular());
        const recentBooks = allBooks.filter((book) => book.isRecent());

        return {
            totalBooks: allBooks.length,
            availableBooks: availableBooks.length,
            popularBooks: popularBooks.length,
            recentBooks: recentBooks.length,
            totalCopies: allBooks.reduce((sum, book) => sum + book.totalCopies, 0),
            availableCopies: allBooks.reduce((sum, book) => sum + book.availableCopies, 0),
        };
    }

    /**
     * REGLA DE NEGOCIO: Ordena libros por relevancia según criterios de búsqueda
     */
    private sortByRelevance(books: Book[], filters: BookSearchFilters): Book[] {
        return books.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            // Priorizar disponibilidad
            if (a.isAvailableForLoan()) scoreA += 10;
            if (b.isAvailableForLoan()) scoreB += 10;

            // Priorizar libros recientes
            if (a.isRecent()) scoreA += 5;
            if (b.isRecent()) scoreB += 5;

            // Priorizar por disponibilidad porcentual
            scoreA += a.getAvailabilityPercentage() / 10;
            scoreB += b.getAvailabilityPercentage() / 10;

            return scoreB - scoreA;
        });
    }

    /**
     * REGLA DE NEGOCIO: Calcula score de recomendación
     */
    private calculateRecommendationScore(book: Book): number {
        let score = 0;

        if (book.isAvailableForLoan()) score += 10;
        if (book.isRecent()) score += 8;
        if (book.isPopular()) score += 6;
        score += book.getAvailabilityPercentage() / 10;

        return score;
    }

    /**
     * VALIDACIONES DE NEGOCIO para datos de libro
     */
    private validateBookData(bookData: any): void {
        if (!bookData.isbn || bookData.isbn.length < 10) {
            throw new Error('Valid ISBN is required (minimum 10 characters)');
        }

        if (!bookData.title || bookData.title.length < 2) {
            throw new Error('Title must be at least 2 characters long');
        }

        if (!bookData.author || bookData.author.length < 2) {
            throw new Error('Author must be at least 2 characters long');
        }

        if (!bookData.category) {
            throw new Error('Category is required');
        }

        if (!bookData.totalCopies || bookData.totalCopies < 1) {
            throw new Error('Total copies must be at least 1');
        }

        const currentYear = new Date().getFullYear();
        if (!bookData.publishedYear || bookData.publishedYear > currentYear || bookData.publishedYear < 1000) {
            throw new Error(`Published year must be between 1000 and ${currentYear}`);
        }
    }

    /**
     * VALIDACIONES DE NEGOCIO para datos de actualización de libro
     */
    private validateUpdateBookData(updateData: any): void {
        if (updateData.isbn !== undefined && (typeof updateData.isbn !== 'string' || updateData.isbn.length < 10)) {
            throw new Error('Valid ISBN is required (minimum 10 characters)');
        }

        if (updateData.title !== undefined && (typeof updateData.title !== 'string' || updateData.title.length < 2)) {
            throw new Error('Title must be at least 2 characters long');
        }

        if (updateData.author !== undefined && (typeof updateData.author !== 'string' || updateData.author.length < 2)) {
            throw new Error('Author must be at least 2 characters long');
        }

        if (updateData.category !== undefined && (typeof updateData.category !== 'string' || updateData.category.length < 1)) {
            throw new Error('Category is required');
        }

        if (updateData.totalCopies !== undefined && (typeof updateData.totalCopies !== 'number' || updateData.totalCopies < 1)) {
            throw new Error('Total copies must be at least 1');
        }

        const currentYear = new Date().getFullYear();
        if (updateData.publishedYear !== undefined && (typeof updateData.publishedYear !== 'number' || updateData.publishedYear > currentYear || updateData.publishedYear < 1000)) {
            throw new Error(`Published year must be between 1000 and ${currentYear}`);
        }
    }
}
