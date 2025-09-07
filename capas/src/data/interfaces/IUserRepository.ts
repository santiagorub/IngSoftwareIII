import { User, UserType } from '../../business/entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findByType(userType: UserType): Promise<User[]>;
  findActiveUsers(): Promise<User[]>;
  findUsersNearLoanLimit(): Promise<User[]>;
  save(user: User): Promise<User>;
  updateCurrentLoans(userId: string, newCurrentLoans: number): Promise<User | null>;
  updateActiveStatus(userId: string, isActive: boolean): Promise<User | null>;
  emailExists(email: string, excludeId?: string): Promise<boolean>;
  generateId(): string;
}
