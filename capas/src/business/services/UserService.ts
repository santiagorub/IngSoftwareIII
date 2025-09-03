/**
 * CAPA DE LÓGICA DE NEGOCIO - SERVICIO DE USUARIOS
 * 
 * Contiene la lógica de negocio para gestión de usuarios
 */

import { User, UserType } from '../entities/User';
import { IUserRepository } from '../../data/repositories/IUserRepository';

export interface CreateUserRequest {
  email: string;
  name: string;
  userType: UserType;
}

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(id: string): Promise<User | null> {
    if (!id) {
      throw new Error("User ID is required");
    }
    
    return await this.userRepository.findById(id);
  }

  /**
   * Obtiene un usuario por email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    if (!email) {
      throw new Error("Email is required");
    }
    
    return await this.userRepository.findByEmail(email);
  }

  /**
   * LÓGICA DE NEGOCIO: Crea un nuevo usuario con validaciones
   */
  async createUser(request: CreateUserRequest): Promise<User> {
    // Validaciones de negocio
    this.validateUserData(request);
    
    // Verificar que el email no esté en uso
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error(`Email ${request.email} is already in use`);
    }
    
    const newUser = new User(
      this.userRepository.generateId(),
      request.email,
      request.name,
      request.userType,
      true, // Los usuarios nuevos están activos por defecto
      0     // Sin préstamos iniciales
    );
    
    return await this.userRepository.save(newUser);
  }

  /**
   * LÓGICA DE NEGOCIO: Incrementa el contador de préstamos
   */
  async incrementLoanCount(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const newLoanCount = user.currentLoans + 1;
    if (newLoanCount > user.getMaxLoanLimit()) {
      throw new Error(`Cannot exceed loan limit of ${user.getMaxLoanLimit()}`);
    }
    
    const updatedUser = await this.userRepository.updateCurrentLoans(userId, newLoanCount);
    if (!updatedUser) {
      throw new Error("Failed to update loan count");
    }
    
    return updatedUser;
  }

  /**
   * LÓGICA DE NEGOCIO: Decrementa el contador de préstamos
   */
  async decrementLoanCount(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const newLoanCount = Math.max(0, user.currentLoans - 1);
    
    const updatedUser = await this.userRepository.updateCurrentLoans(userId, newLoanCount);
    if (!updatedUser) {
      throw new Error("Failed to update loan count");
    }
    
    return updatedUser;
  }

  /**
   * LÓGICA DE NEGOCIO: Activa o desactiva un usuario
   */
  async setUserActiveStatus(userId: string, isActive: boolean): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Regla de negocio: No se puede desactivar un usuario con préstamos activos
    if (!isActive && user.currentLoans > 0) {
      throw new Error("Cannot deactivate user with active loans");
    }
    
    const updatedUser = await this.userRepository.updateActiveStatus(userId, isActive);
    if (!updatedUser) {
      throw new Error("Failed to update user status");
    }
    
    return updatedUser;
  }

  /**
   * Obtiene usuarios por tipo
   */
  async getUsersByType(userType: UserType): Promise<User[]> {
    return await this.userRepository.findByType(userType);
  }

  /**
   * Obtiene usuarios activos
   */
  async getActiveUsers(): Promise<User[]> {
    return await this.userRepository.findActiveUsers();
  }

  /**
   * LÓGICA DE NEGOCIO: Obtiene usuarios que necesitan atención (cerca del límite)
   */
  async getUsersNeedingAttention(): Promise<User[]> {
    return await this.userRepository.findUsersNearLoanLimit();
  }

  /**
   * LÓGICA DE NEGOCIO: Valida si un usuario puede realizar una acción específica
   */
  async canUserPerformAction(userId: string, action: 'LOAN' | 'RENEW' | 'RESERVE'): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return false;
    }
    
    switch (action) {
      case 'LOAN':
        return user.isActive && user.canTakeNewLoan();
      
      case 'RENEW':
        return user.isActive;
      
      case 'RESERVE':
        return user.isActive && user.canTakeNewLoan();
      
      default:
        return false;
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getUserStatistics() {
    const allUsers = await this.userRepository.findAll();
    const activeUsers = allUsers.filter(user => user.isActive);
    const usersNearLimit = allUsers.filter(user => user.isNearLoanLimit());
    
    const usersByType = {
      students: allUsers.filter(user => user.userType === UserType.STUDENT).length,
      professors: allUsers.filter(user => user.userType === UserType.PROFESSOR).length,
      librarians: allUsers.filter(user => user.userType === UserType.LIBRARIAN).length
    };
    
    const totalLoans = allUsers.reduce((sum, user) => sum + user.currentLoans, 0);
    const averageLoansPerUser = allUsers.length > 0 ? totalLoans / allUsers.length : 0;
    
    return {
      totalUsers: allUsers.length,
      activeUsers: activeUsers.length,
      inactiveUsers: allUsers.length - activeUsers.length,
      usersNearLimit: usersNearLimit.length,
      usersByType,
      totalActiveLoans: totalLoans,
      averageLoansPerUser: Math.round(averageLoansPerUser * 100) / 100
    };
  }

  /**
   * LÓGICA DE NEGOCIO: Busca usuarios por criterios múltiples
   */
  async searchUsers(criteria: {
    name?: string;
    email?: string;
    userType?: UserType;
    isActive?: boolean;
    hasLoans?: boolean;
  }): Promise<User[]> {
    let users = await this.userRepository.findAll();
    
    if (criteria.name) {
      users = users.filter(user => 
        user.name.toLowerCase().includes(criteria.name!.toLowerCase())
      );
    }
    
    if (criteria.email) {
      users = users.filter(user => 
        user.email.toLowerCase().includes(criteria.email!.toLowerCase())
      );
    }
    
    if (criteria.userType) {
      users = users.filter(user => user.userType === criteria.userType);
    }
    
    if (criteria.isActive !== undefined) {
      users = users.filter(user => user.isActive === criteria.isActive);
    }
    
    if (criteria.hasLoans !== undefined) {
      const hasLoans = criteria.hasLoans;
      users = users.filter(user => (user.currentLoans > 0) === hasLoans);
    }
    
    return users;
  }

  /**
   * VALIDACIONES DE NEGOCIO para datos de usuario
   */
  private validateUserData(userData: CreateUserRequest): void {
    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new Error("Valid email is required");
    }
    
    if (!userData.name || userData.name.length < 2) {
      throw new Error("Name must be at least 2 characters long");
    }
    
    if (!Object.values(UserType).includes(userData.userType)) {
      throw new Error("Valid user type is required");
    }
  }

  /**
   * Validación de formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
