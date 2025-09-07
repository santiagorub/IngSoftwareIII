/**
 * CAPA DE ACCESO A DATOS - REPOSITORIO DE LIBROS
 * 
 * Implementa el patrón Repository con MySQL.
 * La capa de negocio no conoce detalles de persistencia.
 */

import { getDatabase } from '../../config/database';
import { BookSearchFilters } from '../models/DataModels';
import { Book } from '../../business/entities/Book';
import { IBookRepository } from '../interfaces/IBookRepository';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';

export class BookRepository implements IBookRepository {

  /**
   * Busca un libro por ID
   */
  async findById(id: string): Promise<Book | null> {
    const db = getDatabase();
    
    const query = `
      SELECT id, isbn, title, author, category, total_copies, available_copies, published_year
      FROM books 
      WHERE id = ?
    `;
    
    const [rows] = await db.execute(query, [id]) as mysql.RowDataPacket[][];
    
    if (rows.length === 0) return null;
    
    return this.mapRowToBook(rows[0]);
  }

  /**
   * Busca libros con filtros aplicados
   */
  async search(filters: BookSearchFilters): Promise<Book[]> {
    const db = getDatabase();
    let query = `
      SELECT id, isbn, title, author, category, total_copies, available_copies, published_year
      FROM books 
      WHERE 1=1
    `;
    
    const params: any[] = [];

    // Construir query dinámicamente
    if (filters.title) {
      query += ` AND title LIKE ?`;
      params.push(`%${filters.title}%`);
    }

    if (filters.author) {
      query += ` AND author LIKE ?`;
      params.push(`%${filters.author}%`);
    }

    if (filters.isbn) {
      query += ` AND isbn = ?`;
      params.push(filters.isbn);
    }

    if (filters.category) {
      query += ` AND category = ?`;
      params.push(filters.category);
    }

    if (filters.isAvailable !== undefined) {
      if (filters.isAvailable) {
        query += ` AND available_copies > 0`;
      } else {
        query += ` AND available_copies = 0`;
      }
    }

    // Ordenar por disponibilidad y título
    query += ` ORDER BY available_copies DESC, title ASC`;

    const [rows] = await db.execute(query, params) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToBook(row));
  }

  /**
   * Obtiene todos los libros
   */
  async findAll(): Promise<Book[]> {
    const db = getDatabase();
    
    const query = `
      SELECT id, isbn, title, author, category, total_copies, available_copies, published_year
      FROM books 
      ORDER BY title ASC
    `;
    
    const [rows] = await db.execute(query) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToBook(row));
  }

  /**
   * Guarda un nuevo libro
   */
  async save(book: Book): Promise<Book> {
    const db = getDatabase();
    
    const query = `
      INSERT INTO books (id, isbn, title, author, category, total_copies, available_copies, published_year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        isbn = VALUES(isbn),
        title = VALUES(title),
        author = VALUES(author),
        category = VALUES(category),
        total_copies = VALUES(total_copies),
        available_copies = VALUES(available_copies),
        published_year = VALUES(published_year),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    await db.execute(query, [
      book.id,
      book.isbn,
      book.title,
      book.author,
      book.category,
      book.totalCopies,
      book.availableCopies,
      book.publishedYear
    ]);
    
    return book;
  }

  /**
   * Actualiza las copias disponibles de un libro
   */
  async updateAvailableCopies(bookId: string, newAvailableCopies: number): Promise<Book | null> {
    const db = getDatabase();
    
    const updateQuery = `
      UPDATE books 
      SET available_copies = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const [result] = await db.execute(updateQuery, [newAvailableCopies, bookId]) as mysql.ResultSetHeader[];
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    // Retornar el libro actualizado
    return await this.findById(bookId);
  }

  /**
   * Busca libros populares (menos del 30% de disponibilidad)
   */
  async findPopularBooks(): Promise<Book[]> {
    const db = getDatabase();
    
    const query = `
      SELECT id, isbn, title, author, category, total_copies, available_copies, published_year
      FROM books 
      WHERE (available_copies * 100.0 / total_copies) < 30
      ORDER BY (available_copies * 100.0 / total_copies) ASC
    `;
    
    const [rows] = await db.execute(query) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToBook(row));
  }

  /**
   * Busca libros recientes (últimos 5 años)
   */
  async findRecentBooks(): Promise<Book[]> {
    const db = getDatabase();
    const currentYear = new Date().getFullYear();
    
    const query = `
      SELECT id, isbn, title, author, category, total_copies, available_copies, published_year
      FROM books 
      WHERE published_year > ?
      ORDER BY published_year DESC, title ASC
    `;
    
    const [rows] = await db.execute(query, [currentYear - 5]) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToBook(row));
  }

  /**
   * Elimina un libro
   */
  async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    
    const query = `DELETE FROM books WHERE id = ?`;
    const [result] = await db.execute(query, [id]) as mysql.ResultSetHeader[];
    
    return result.affectedRows > 0;
  }

  /**
   * Obtiene estadísticas de libros
   */
  async getStatistics(): Promise<{
    totalBooks: number;
    totalCopies: number;
    availableCopies: number;
    categoriesCount: number;
  }> {
    const db = getDatabase();
    
    const query = `
      SELECT 
        COUNT(*) as total_books,
        SUM(total_copies) as total_copies,
        SUM(available_copies) as available_copies,
        COUNT(DISTINCT category) as categories_count
      FROM books
    `;
    
    const [rows] = await db.execute(query) as mysql.RowDataPacket[][];
    const stats = rows[0];
    
    return {
      totalBooks: stats.total_books,
      totalCopies: stats.total_copies,
      availableCopies: stats.available_copies,
      categoriesCount: stats.categories_count
    };
  }

  /**
   * Verifica si un ISBN ya existe
   */
  async existsByISBN(isbn: string, excludeId?: string): Promise<boolean> {
    const db = getDatabase();
    let query = `SELECT COUNT(*) as count FROM books WHERE isbn = ?`;
    const params = [isbn];
    
    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }
    
    const [rows] = await db.execute(query, params) as mysql.RowDataPacket[][];
    return rows[0].count > 0;
  }

  /**
   * Genera un nuevo ID único para un libro
   */
  generateId(): string {
    return uuidv4();
  }

  /**
   * Convierte fila de MySQL a entidad Book
   */
  private mapRowToBook(row: any): Book {
    return new Book(
      row.id,
      row.isbn,
      row.title,
      row.author,
      row.category,
      row.total_copies,
      row.available_copies,
      row.published_year
    );
  }
}

