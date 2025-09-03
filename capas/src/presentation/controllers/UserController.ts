/**
 * CAPA DE PRESENTACIÓN - CONTROLADOR DE USUARIOS
 * 
 * Maneja operaciones relacionadas con usuarios del sistema
 */

import { Request, Response } from 'express';
import { UserService } from '../../business/services/UserService';
import { UserType } from '../../business/entities/User';
import { 
  CreateUserRequestDTO,
  UserSearchRequestDTO,
  ApiResponse,
  UserDTO,
  UserStatisticsDTO
} from '../models/DTOs';
import { 
  userToDTO,
  usersToDTO,
  createSuccessResponse, 
  createErrorResponse 
} from '../models/Mappers';

export class UserController {
  constructor(private userService: UserService) {}

  /**
   * GET /api/users/:id - Obtiene un usuario por ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        const response: ApiResponse<never> = createErrorResponse('User ID is required');
        res.status(400).json(response);
        return;
      }

      const user = await this.userService.getUserById(id);

      if (!user) {
        const response: ApiResponse<never> = createErrorResponse('User not found');
        res.status(404).json(response);
        return;
      }

      const userDTO = userToDTO(user);
      const response: ApiResponse<UserDTO> = createSuccessResponse(userDTO);
      res.json(response);

    } catch (error) {
      const response: ApiResponse<never> = createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/users/email/:email - Obtiene un usuario por email
   */
  async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      if (!email) {
        const response: ApiResponse<never> = createErrorResponse('Email is required');
        res.status(400).json(response);
        return;
      }

      const user = await this.userService.getUserByEmail(decodeURIComponent(email));

      if (!user) {
        const response: ApiResponse<never> = createErrorResponse('User not found');
        res.status(404).json(response);
        return;
      }

      const userDTO = userToDTO(user);
      const response: ApiResponse<UserDTO> = createSuccessResponse(userDTO);
      res.json(response);

    } catch (error) {
      const response: ApiResponse<never> = createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/users - Busca usuarios con filtros opcionales
   */
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const searchParams: UserSearchRequestDTO = {
        name: req.query.name as string,
        email: req.query.email as string,
        userType: req.query.userType as 'STUDENT' | 'PROFESSOR' | 'LIBRARIAN',
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        hasLoans: req.query.hasLoans ? req.query.hasLoans === 'true' : undefined
      };

      // Convertir DTO a parámetros de búsqueda de negocio
      const searchCriteria = {
        name: searchParams.name,
        email: searchParams.email,
        userType: searchParams.userType ? searchParams.userType as UserType : undefined,
        isActive: searchParams.isActive,
        hasLoans: searchParams.hasLoans
      };

      const users = await this.userService.searchUsers(searchCriteria);
      const userDTOs = usersToDTO(users);
      
      const response: ApiResponse<UserDTO[]> = createSuccessResponse(userDTOs);
      res.json(response);

    } catch (error) {
      const response: ApiResponse<never> = createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/users/type/:userType - Obtiene usuarios por tipo
   */
  async getUsersByType(req: Request, res: Response): Promise<void> {
    try {
      const { userType } = req.params;

      // Validar tipo de usuario
      if (!Object.values(UserType).includes(userType as UserType)) {
        const response: ApiResponse<never> = createErrorResponse('Invalid user type');
        res.status(400).json(response);
        return;
      }

      const users = await this.userService.getUsersByType(userType as UserType);
      const userDTOs = usersToDTO(users);
      
      const response: ApiResponse<UserDTO[]> = createSuccessResponse(userDTOs);
      res.json(response);

    } catch (error) {
      const response: ApiResponse<never> = createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/users/active - Obtiene usuarios activos
   */
  async getActiveUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getActiveUsers();
      const userDTOs = usersToDTO(users);
      
      const response: ApiResponse<UserDTO[]> = createSuccessResponse(userDTOs);
      res.json(response);

    } catch (error) {
      const response: ApiResponse<never> = createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/users/attention-needed - Obtiene usuarios que necesitan atención
   */
  async getUsersNeedingAttention(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getUsersNeedingAttention();
      const userDTOs = usersToDTO(users);
      
      const response: ApiResponse<UserDTO[]> = createSuccessResponse(userDTOs);
      res.json(response);

    } catch (error) {
      const response: ApiResponse<never> = createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      res.status(500).json(response);
    }
  }

  /**
   * POST /api/users - Crea un nuevo usuario
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequestDTO = req.body;

      // Validación de entrada
      if (!this.validateCreateUserRequest(userData)) {
        const response: ApiResponse<never> = createErrorResponse('Invalid user data');
        res.status(400).json(response);
        return;
      }

      // Convertir DTO a parámetros de negocio
      const createRequest = {
        email: userData.email,
        name: userData.name,
        userType: userData.userType as UserType
      };

      const newUser = await this.userService.createUser(createRequest);
      const userDTO = userToDTO(newUser);
      
      const response: ApiResponse<UserDTO> = createSuccessResponse(
        userDTO, 
        'User created successfully'
      );
      res.status(201).json(response);

    } catch (error) {
      const response: ApiResponse<never> = createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      res.status(400).json(response);
    }
  }

  /**
   * PATCH /api/users/:id/status - Activa o desactiva un usuario
   */
  async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (!id) {
        const response: ApiResponse<never> = createErrorResponse('User ID is required');
        res.status(400).json(response);
        return;
      }

      if (typeof isActive !== 'boolean') {
        const response: ApiResponse<never> = createErrorResponse('isActive must be a boolean');
        res.status(400).json(response);
        return;
      }

      const updatedUser = await this.userService.setUserActiveStatus(id, isActive);
      const userDTO = userToDTO(updatedUser);
      
      const response: ApiResponse<UserDTO> = createSuccessResponse(
        userDTO, 
        `User ${isActive ? 'activated' : 'deactivated'} successfully`
      );
      res.json(response);

    } catch (error) {
      const response: ApiResponse<never> = createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      res.status(400).json(response);
    }
  }

  /**
   * GET /api/users/:id/can-perform/:action - Verifica si un usuario puede realizar una acción
   */
  async canUserPerformAction(req: Request, res: Response): Promise<void> {
    try {
      const { id, action } = req.params;

      if (!id || !action) {
        const response: ApiResponse<never> = createErrorResponse('User ID and action are required');
        res.status(400).json(response);
        return;
      }

      // Validar acción
      const validActions = ['LOAN', 'RENEW', 'RESERVE'];
      if (!validActions.includes(action.toUpperCase())) {
        const response: ApiResponse<never> = createErrorResponse('Invalid action');
        res.status(400).json(response);
        return;
      }

      const canPerform = await this.userService.canUserPerformAction(
        id, 
        action.toUpperCase() as 'LOAN' | 'RENEW' | 'RESERVE'
      );
      
      const response: ApiResponse<{ canPerform: boolean }> = createSuccessResponse({ canPerform });
      res.json(response);

    } catch (error) {
      const response: ApiResponse<never> = createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      res.status(500).json(response);
    }
  }

  /**
   * GET /api/users/statistics - Obtiene estadísticas de usuarios
   */
  async getUserStatistics(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.userService.getUserStatistics();
      const response: ApiResponse<UserStatisticsDTO> = createSuccessResponse(stats);
      res.json(response);

    } catch (error) {
      const response: ApiResponse<never> = createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
      res.status(500).json(response);
    }
  }

  /**
   * VALIDACIÓN DE ENTRADA: Valida datos de creación de usuario
   */
  private validateCreateUserRequest(data: any): data is CreateUserRequestDTO {
    return (
      data &&
      typeof data.email === 'string' &&
      typeof data.name === 'string' &&
      typeof data.userType === 'string' &&
      data.email.length > 0 &&
      data.name.length >= 2 &&
      Object.values(UserType).includes(data.userType as UserType) &&
      this.isValidEmail(data.email)
    );
  }

  /**
   * Validación de formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
