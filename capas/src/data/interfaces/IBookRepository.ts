/**
 * INTERFAZ COMÚN PARA REPOSITORIOS DE LIBROS
 * 
 * Permite intercambiar entre implementaciones (Memory vs MySQL)
 */

import { Book } from '../../business/entities/Book';
import { BookSearchFilters } from '../models/DataModels';

export interface IBookRepository {
  findById(id: string): Promise<Book | null>;
  search(filters: BookSearchFilters): Promise<Book[]>;
  findAll(): Promise<Book[]>;
  save(book: Book): Promise<Book>;
  updateAvailableCopies(bookId: string, newAvailableCopies: number): Promise<Book | null>;
  findPopularBooks(): Promise<Book[]>;
  findRecentBooks(): Promise<Book[]>;
  delete(id: string): Promise<boolean>;
  generateId(): string;
}
