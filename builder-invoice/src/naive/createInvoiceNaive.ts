import { Customer } from '../domain/Customer';
import { Item } from '../domain/Item';
import { Invoice } from '../domain/Invoice';

/**
 * Versión NAIVE (sin patrón):
 * - Toda la lógica y validaciones dispersas.
 * - Fácil introducir errores (olvidar calcular impuestos, permitir descuentos negativos, etc.).
 */
export function createInvoiceNaive(params: {
    id: string;
    customer: Customer;
    items: Item[];
    discounts?: number;
    currency?: 'USD' | 'EUR' | 'ARS';
    notes?: string;
}): Invoice {
    if (!params.id) throw new Error('id required');
    if (!params.customer) throw new Error('customer required');
    if (!params.items || params.items.length === 0) throw new Error('items required');

    const subtotal = Math.round(params.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) * 100) / 100;

    const discounts = Math.max(0, params.discounts ?? 0); // podría colarse > subtotal
    const taxedBase = subtotal - discounts; // podría quedar negativo si no validamos

    // Impuestos (duplicado y simplificado)
    const countryRateMap: Record<string, number> = { AR: 0.21, ES: 0.21, US: 0.0, BR: 0.17 };
    const rate = countryRateMap[params.customer.country] ?? 0.0;
    const taxAmount = Math.round(taxedBase * rate * 100) / 100;

    const total = Math.round((taxedBase + taxAmount) * 100) / 100;

    return new Invoice(params.id, params.customer, params.items, subtotal, discounts, [{ base: taxedBase, rate, amount: taxAmount }], total, params.currency ?? 'USD', { days: 0, method: 'CASH' }, params.notes);
}
