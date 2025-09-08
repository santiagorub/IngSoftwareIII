import { Customer } from './Customer';
import { Item } from './Item';

export interface PaymentTerms {
    days: number; // días a vencimiento
    method: 'CASH' | 'CARD' | 'BANK_TRANSFER';
}

export interface TaxBreakdown {
    base: number;
    rate: number; // 0.21 = 21%
    amount: number; // base * rate
}

/**
 * Invoice como CLASE (objeto) para uso pedagógico.
 * Mantiene solo datos; la lógica de construcción/validación vive en el Builder.
 */
export class Invoice {
    constructor(
        public readonly id: string,
        public readonly customer: Customer,
        public readonly items: Item[],
        public readonly subtotal: number,
        public readonly discounts: number,
        public readonly taxes: TaxBreakdown[],
        public readonly total: number,
        public readonly currency: 'USD' | 'EUR' | 'ARS',
        public readonly payment: PaymentTerms,
        public readonly notes?: string,
        public readonly metadata?: Record<string, string>,
    ) {}
}
