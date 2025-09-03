/**
 * CAPA DE ACCESO A DATOS - REPOSITORIO DE PRÉSTAMOS
 * 
 * Maneja la persistencia y consultas de préstamos de libros con MySQL
 */

import { getDatabase } from '../../config/database';
import { Loan, LoanStatus } from '../../business/entities/Loan';
import { ILoanRepository } from './ILoanRepository';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';

export class LoanRepository implements ILoanRepository {

  /**
   * Busca un préstamo por ID
   */
  async findById(id: string): Promise<Loan | null> {
    const db = getDatabase();
    
    const query = `
      SELECT id, user_id, book_id, loan_date, due_date, return_date, status
      FROM loans 
      WHERE id = ?
    `;
    
    const [rows] = await db.execute(query, [id]) as mysql.RowDataPacket[][];
    
    if (rows.length === 0) return null;
    
    return this.mapRowToLoan(rows[0]);
  }

  /**
   * Busca préstamos por usuario
   */
  async findByUserId(userId: string): Promise<Loan[]> {
    const db = getDatabase();
    
    const query = `
      SELECT id, user_id, book_id, loan_date, due_date, return_date, status
      FROM loans 
      WHERE user_id = ?
      ORDER BY loan_date DESC
    `;
    
    const [rows] = await db.execute(query, [userId]) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToLoan(row));
  }

  /**
   * Busca préstamos por libro
   */
  async findByBookId(bookId: string): Promise<Loan[]> {
    const db = getDatabase();
    
    const query = `
      SELECT id, user_id, book_id, loan_date, due_date, return_date, status
      FROM loans 
      WHERE book_id = ?
      ORDER BY loan_date DESC
    `;
    
    const [rows] = await db.execute(query, [bookId]) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToLoan(row));
  }

  /**
   * Busca préstamos activos de un usuario
   */
  async findActiveByUserId(userId: string): Promise<Loan[]> {
    const db = getDatabase();
    
    const query = `
      SELECT id, user_id, book_id, loan_date, due_date, return_date, status
      FROM loans 
      WHERE user_id = ? AND status = 'ACTIVE'
      ORDER BY due_date ASC
    `;
    
    const [rows] = await db.execute(query, [userId]) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToLoan(row));
  }

  /**
   * Busca préstamos activos de un libro específico
   */
  async findActiveByBookId(bookId: string): Promise<Loan[]> {
    const db = getDatabase();
    
    const query = `
      SELECT id, user_id, book_id, loan_date, due_date, return_date, status
      FROM loans 
      WHERE book_id = ? AND status = 'ACTIVE'
      ORDER BY loan_date ASC
    `;
    
    const [rows] = await db.execute(query, [bookId]) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToLoan(row));
  }

  /**
   * Obtiene todos los préstamos
   */
  async findAll(): Promise<Loan[]> {
    const db = getDatabase();
    
    const query = `
      SELECT id, user_id, book_id, loan_date, due_date, return_date, status
      FROM loans 
      ORDER BY loan_date DESC
    `;
    
    const [rows] = await db.execute(query) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToLoan(row));
  }

  /**
   * Obtiene préstamos vencidos
   */
  async findOverdueLoans(): Promise<Loan[]> {
    const db = getDatabase();
    
    const query = `
      SELECT id, user_id, book_id, loan_date, due_date, return_date, status
      FROM loans 
      WHERE status = 'ACTIVE' AND due_date < NOW()
      ORDER BY due_date ASC
    `;
    
    const [rows] = await db.execute(query) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToLoan(row));
  }

  /**
   * Obtiene préstamos que vencen pronto (próximos 3 días)
   */
  async findLoansDueSoon(): Promise<Loan[]> {
    const db = getDatabase();
    
    const query = `
      SELECT id, user_id, book_id, loan_date, due_date, return_date, status
      FROM loans 
      WHERE status = 'ACTIVE' 
      AND due_date > NOW() 
      AND due_date <= DATE_ADD(NOW(), INTERVAL 3 DAY)
      ORDER BY due_date ASC
    `;
    
    const [rows] = await db.execute(query) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToLoan(row));
  }

  /**
   * Obtiene préstamos por estado
   */
  async findByStatus(status: LoanStatus): Promise<Loan[]> {
    const db = getDatabase();
    
    const query = `
      SELECT id, user_id, book_id, loan_date, due_date, return_date, status
      FROM loans 
      WHERE status = ?
      ORDER BY loan_date DESC
    `;
    
    const [rows] = await db.execute(query, [status]) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToLoan(row));
  }

  /**
   * Guarda un nuevo préstamo
   */
  async save(loan: Loan): Promise<Loan> {
    const db = getDatabase();
    
    const query = `
      INSERT INTO loans (id, user_id, book_id, loan_date, due_date, return_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        return_date = VALUES(return_date),
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    await db.execute(query, [
      loan.id,
      loan.userId,
      loan.bookId,
      loan.loanDate,
      loan.dueDate,
      loan.returnDate,
      loan.status
    ]);
    
    return loan;
  }

  /**
   * Actualiza un préstamo existente
   */
  async update(loan: Loan): Promise<Loan> {
    return await this.save(loan);
  }

  /**
   * Verifica si un usuario tiene un préstamo activo de un libro específico
   */
  async hasActiveLoan(userId: string, bookId: string): Promise<boolean> {
    const db = getDatabase();
    
    const query = `
      SELECT COUNT(*) as count
      FROM loans 
      WHERE user_id = ? AND book_id = ? AND status = 'ACTIVE'
    `;
    
    const [rows] = await db.execute(query, [userId, bookId]) as mysql.RowDataPacket[][];
    
    return rows[0].count > 0;
  }

  /**
   * Cuenta préstamos activos de un usuario
   */
  async countActiveByUserId(userId: string): Promise<number> {
    const db = getDatabase();
    
    const query = `
      SELECT COUNT(*) as count
      FROM loans 
      WHERE user_id = ? AND status = 'ACTIVE'
    `;
    
    const [rows] = await db.execute(query, [userId]) as mysql.RowDataPacket[][];
    
    return rows[0].count;
  }

  /**
   * Obtiene estadísticas de préstamos por período
   */
  async getLoanStatistics(startDate: Date, endDate: Date): Promise<{
    totalLoans: number;
    activeLoans: number;
    returnedLoans: number;
    overdueLoans: number;
    averageLoanDuration: number;
  }> {
    const db = getDatabase();
    
    const query = `
      SELECT 
        COUNT(*) as total_loans,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_loans,
        SUM(CASE WHEN status = 'RETURNED' THEN 1 ELSE 0 END) as returned_loans,
        SUM(CASE WHEN status = 'OVERDUE' THEN 1 ELSE 0 END) as overdue_loans,
        AVG(CASE 
          WHEN return_date IS NOT NULL THEN DATEDIFF(return_date, loan_date)
          ELSE DATEDIFF(NOW(), loan_date)
        END) as avg_duration
      FROM loans
      WHERE loan_date >= ? AND loan_date <= ?
    `;
    
    const [rows] = await db.execute(query, [startDate, endDate]) as mysql.RowDataPacket[][];
    const stats = rows[0];
    
    return {
      totalLoans: stats.total_loans,
      activeLoans: stats.active_loans,
      returnedLoans: stats.returned_loans,
      overdueLoans: stats.overdue_loans,
      averageLoanDuration: Math.round(stats.avg_duration || 0)
    };
  }

  /**
   * Actualiza préstamos vencidos (marca como OVERDUE)
   */
  async markOverdueLoans(): Promise<number> {
    const db = getDatabase();
    
    const query = `
      UPDATE loans 
      SET status = 'OVERDUE', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'ACTIVE' AND due_date < NOW()
    `;
    
    const [result] = await db.execute(query) as mysql.ResultSetHeader[];
    
    return result.affectedRows;
  }

  /**
   * Obtiene préstamos con información completa (JOIN con users y books)
   */
  async findLoansWithDetails(limit: number = 50): Promise<any[]> {
    const db = getDatabase();
    
    const query = `
      SELECT 
        l.id,
        l.user_id,
        l.book_id,
        l.loan_date,
        l.due_date,
        l.return_date,
        l.status,
        u.name as user_name,
        u.email as user_email,
        u.user_type,
        b.title as book_title,
        b.author as book_author,
        b.isbn as book_isbn
      FROM loans l
      JOIN users u ON l.user_id = u.id
      JOIN books b ON l.book_id = b.id
      ORDER BY l.loan_date DESC
      LIMIT ?
    `;
    
    const [rows] = await db.execute(query, [limit]) as mysql.RowDataPacket[][];
    
    return rows;
  }

  /**
   * Genera un nuevo ID único para un préstamo
   */
  generateId(): string {
    return 'loan-' + uuidv4();
  }

  /**
   * Convierte fila de MySQL a entidad Loan
   */
  private mapRowToLoan(row: any): Loan {
    return new Loan(
      row.id,
      row.user_id,
      row.book_id,
      new Date(row.loan_date),
      new Date(row.due_date),
      row.return_date ? new Date(row.return_date) : null,
      row.status as LoanStatus
    );
  }
}

