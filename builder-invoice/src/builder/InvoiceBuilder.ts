import { Customer } from '../domain/Customer';
import { Item } from '../domain/Item';
import { Invoice, PaymentTerms, TaxBreakdown } from '../domain/Invoice';

/**
 * InvoiceBuilder
 * - Builder fluido para construir facturas con validaciones y cálculos.
 * - En un caso real, podría incorporar estrategias de impuestos y monedas.
 */
export class InvoiceBuilder {
    private id: string | null = null;
    private customer: Customer | null = null;
    private items: Item[] = [];
    private discounts: number = 0;
    private currency: 'USD' | 'EUR' | 'ARS' = 'USD';
    private payment: PaymentTerms = { days: 0, method: 'CASH' };
    private notes?: string;
    private metadata: Record<string, string> = {};

    withId(id: string) {
        this.id = id;
        return this;
    }

    forCustomer(customer: Customer) {
        this.customer = customer;
        return this;
    }

    addItem(item: Item) {
        if (item.quantity <= 0 || item.unitPrice < 0) {
            throw new Error('Invalid item (quantity must be > 0, price >= 0)');
        }
        this.items.push(item);
        return this;
    }

    addItems(items: Item[]) {
        items.forEach((i) => this.addItem(i));
        return this;
    }

    withDiscount(amount: number) {
        if (amount < 0) throw new Error('Discount cannot be negative');
        this.discounts += amount;
        return this;
    }

    withCurrency(currency: 'USD' | 'EUR' | 'ARS') {
        this.currency = currency;
        return this;
    }

    withPaymentTerms(terms: PaymentTerms) {
        if (terms.days < 0) throw new Error('Payment days cannot be negative');
        this.payment = terms;
        return this;
    }

    withNotes(notes?: string) {
        this.notes = notes;
        return this;
    }

    withMetadata(key: string, value: string) {
        this.metadata[key] = value;
        return this;
    }

    /**
     * Cálculo de impuestos simplificado por país.
     * En un sistema real, usarías tablas/tarifas o estrategias configurables.
     */
    private calculateTaxes(subtotal: number, customer: Customer): TaxBreakdown[] {
        const countryRateMap: Record<string, number> = {
            AR: 0.21,
            ES: 0.21,
            US: 0.0,
            BR: 0.17,
        };
        const rate = countryRateMap[customer.country] ?? 0.0;
        const amount = Math.round(subtotal * rate * 100) / 100;
        return [{ base: subtotal, rate, amount }];
    }

    build(): Invoice {
        if (!this.id) throw new Error('Invoice id is required');
        if (!this.customer) throw new Error('Customer is required');
        if (this.items.length === 0) throw new Error('At least one item is required');

        const subtotal = Math.round(this.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) * 100) / 100;

        const appliedDiscount = Math.min(this.discounts, subtotal);
        const taxedBase = subtotal - appliedDiscount;
        const taxes = this.calculateTaxes(taxedBase, this.customer);
        const taxesTotal = Math.round(taxes.reduce((s, t) => s + t.amount, 0) * 100) / 100;
        const total = Math.round((taxedBase + taxesTotal) * 100) / 100;

        return new Invoice(
            this.id,
            this.customer,
            this.items,
            subtotal,
            appliedDiscount,
            taxes,
            total,
            this.currency,
            this.payment,
            this.notes,
            Object.keys(this.metadata).length ? this.metadata : undefined,
        );
    }
}
