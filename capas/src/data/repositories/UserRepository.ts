/**
 * CAPA DE ACCESO A DATOS - REPOSITORIO DE USUARIOS
 * 
 * Maneja la persistencia y consultas de usuarios con MySQL
 */

import { getDatabase } from '../../config/database';
import { User, UserType } from '../../business/entities/User';
import { IUserRepository } from './IUserRepository';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';

export class UserRepository implements IUserRepository {

  /**
   * Busca un usuario por ID
   */
  async findById(id: string): Promise<User | null> {
    const db = getDatabase();
    
    const query = `
      SELECT id, email, name, user_type, is_active, current_loans
      FROM users 
      WHERE id = ?
    `;
    
    const [rows] = await db.execute(query, [id]) as mysql.RowDataPacket[][];
    
    if (rows.length === 0) return null;
    
    return this.mapRowToUser(rows[0]);
  }

  /**
   * Busca un usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    const db = getDatabase();
    
    const query = `
      SELECT id, email, name, user_type, is_active, current_loans
      FROM users 
      WHERE email = ?
    `;
    
    const [rows] = await db.execute(query, [email]) as mysql.RowDataPacket[][];
    
    if (rows.length === 0) return null;
    
    return this.mapRowToUser(rows[0]);
  }

  /**
   * Obtiene todos los usuarios
   */
  async findAll(): Promise<User[]> {
    const db = getDatabase();
    
    const query = `
      SELECT id, email, name, user_type, is_active, current_loans
      FROM users 
      ORDER BY name ASC
    `;
    
    const [rows] = await db.execute(query) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToUser(row));
  }

  /**
   * Obtiene usuarios por tipo
   */
  async findByType(userType: UserType): Promise<User[]> {
    const db = getDatabase();
    
    const query = `
      SELECT id, email, name, user_type, is_active, current_loans
      FROM users 
      WHERE user_type = ?
      ORDER BY name ASC
    `;
    
    const [rows] = await db.execute(query, [userType]) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToUser(row));
  }

  /**
   * Obtiene usuarios activos
   */
  async findActiveUsers(): Promise<User[]> {
    const db = getDatabase();
    
    const query = `
      SELECT id, email, name, user_type, is_active, current_loans
      FROM users 
      WHERE is_active = TRUE
      ORDER BY name ASC
    `;
    
    const [rows] = await db.execute(query) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToUser(row));
  }

  /**
   * Obtiene usuarios que están cerca del límite de préstamos
   */
  async findUsersNearLoanLimit(): Promise<User[]> {
    const db = getDatabase();
    
    const query = `
      SELECT id, email, name, user_type, is_active, current_loans
      FROM users 
      WHERE is_active = TRUE
      AND (
        (user_type = 'STUDENT' AND current_loans >= 2) OR
        (user_type = 'PROFESSOR' AND current_loans >= 8) OR
        (user_type = 'LIBRARIAN' AND current_loans >= 12)
      )
      ORDER BY current_loans DESC
    `;
    
    const [rows] = await db.execute(query) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToUser(row));
  }

  /**
   * Guarda un nuevo usuario
   */
  async save(user: User): Promise<User> {
    const db = getDatabase();
    
    const query = `
      INSERT INTO users (id, email, name, user_type, is_active, current_loans)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        email = VALUES(email),
        name = VALUES(name),
        user_type = VALUES(user_type),
        is_active = VALUES(is_active),
        current_loans = VALUES(current_loans),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    await db.execute(query, [
      user.id,
      user.email,
      user.name,
      user.userType,
      user.isActive,
      user.currentLoans
    ]);
    
    return user;
  }

  /**
   * Actualiza el contador de préstamos actuales
   */
  async updateCurrentLoans(userId: string, newCurrentLoans: number): Promise<User | null> {
    const db = getDatabase();
    
    const updateQuery = `
      UPDATE users 
      SET current_loans = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const [result] = await db.execute(updateQuery, [newCurrentLoans, userId]) as mysql.ResultSetHeader[];
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    // Retornar el usuario actualizado
    return await this.findById(userId);
  }

  /**
   * Activa o desactiva un usuario
   */
  async updateActiveStatus(userId: string, isActive: boolean): Promise<User | null> {
    const db = getDatabase();
    
    const updateQuery = `
      UPDATE users 
      SET is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const [result] = await db.execute(updateQuery, [isActive, userId]) as mysql.ResultSetHeader[];
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return await this.findById(userId);
  }

  /**
   * Verifica si un email ya está en uso
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const db = getDatabase();
    let query = `SELECT COUNT(*) as count FROM users WHERE email = ?`;
    const params = [email];
    
    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }
    
    const [rows] = await db.execute(query, params) as mysql.RowDataPacket[][];
    return rows[0].count > 0;
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByType: { [key: string]: number };
    totalActiveLoans: number;
    averageLoansPerUser: number;
  }> {
    const db = getDatabase();
    
    // Estadísticas generales
    const generalQuery = `
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
        SUM(current_loans) as total_active_loans,
        AVG(current_loans) as avg_loans_per_user
      FROM users
    `;
    
    const [generalRows] = await db.execute(generalQuery) as mysql.RowDataPacket[][];
    const general = generalRows[0];
    
    // Estadísticas por tipo
    const typeQuery = `
      SELECT user_type, COUNT(*) as count
      FROM users
      GROUP BY user_type
    `;
    
    const [typeRows] = await db.execute(typeQuery) as mysql.RowDataPacket[][];
    
    const usersByType: { [key: string]: number } = {};
    typeRows.forEach((row: any) => {
      usersByType[row.user_type.toLowerCase() + 's'] = row.count;
    });
    
    return {
      totalUsers: general.total_users,
      activeUsers: general.active_users,
      usersByType,
      totalActiveLoans: general.total_active_loans,
      averageLoansPerUser: Math.round(general.avg_loans_per_user * 100) / 100
    };
  }

  /**
   * Busca usuarios por criterios múltiples
   */
  async searchUsers(criteria: {
    name?: string;
    email?: string;
    userType?: UserType;
    isActive?: boolean;
    hasLoans?: boolean;
  }): Promise<User[]> {
    const db = getDatabase();
    let query = `
      SELECT id, email, name, user_type, is_active, current_loans
      FROM users 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (criteria.name) {
      query += ` AND name LIKE ?`;
      params.push(`%${criteria.name}%`);
    }

    if (criteria.email) {
      query += ` AND email LIKE ?`;
      params.push(`%${criteria.email}%`);
    }

    if (criteria.userType) {
      query += ` AND user_type = ?`;
      params.push(criteria.userType);
    }

    if (criteria.isActive !== undefined) {
      query += ` AND is_active = ?`;
      params.push(criteria.isActive);
    }

    if (criteria.hasLoans !== undefined) {
      if (criteria.hasLoans) {
        query += ` AND current_loans > 0`;
      } else {
        query += ` AND current_loans = 0`;
      }
    }

    query += ` ORDER BY name ASC`;

    const [rows] = await db.execute(query, params) as mysql.RowDataPacket[][];
    
    return rows.map(row => this.mapRowToUser(row));
  }

  /**
   * Genera un nuevo ID único para un usuario
   */
  generateId(): string {
    return 'user-' + uuidv4();
  }

  /**
   * Convierte fila de MySQL a entidad User
   */
  private mapRowToUser(row: any): User {
    return new User(
      row.id,
      row.email,
      row.name,
      row.user_type as UserType,
      Boolean(row.is_active),
      row.current_loans
    );
  }
}

