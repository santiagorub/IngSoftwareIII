import { Loan, LoanStatus } from '../../business/entities/Loan';

export interface ILoanRepository {
  findById(id: string): Promise<Loan | null>;
  findByUserId(userId: string): Promise<Loan[]>;
  findByBookId(bookId: string): Promise<Loan[]>;
  findActiveByUserId(userId: string): Promise<Loan[]>;
  findActiveByBookId(bookId: string): Promise<Loan[]>;
  findAll(): Promise<Loan[]>;
  findOverdueLoans(): Promise<Loan[]>;
  findLoansDueSoon(): Promise<Loan[]>;
  findByStatus(status: LoanStatus): Promise<Loan[]>;
  save(loan: Loan): Promise<Loan>;
  update(loan: Loan): Promise<Loan>;
  hasActiveLoan(userId: string, bookId: string): Promise<boolean>;
  countActiveByUserId(userId: string): Promise<number>;
  getLoanStatistics(startDate: Date, endDate: Date): Promise<any>;
  generateId(): string;
}
