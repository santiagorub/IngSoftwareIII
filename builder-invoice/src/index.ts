import { InvoiceBuilder } from './builder/InvoiceBuilder';
import { createInvoiceNaive } from './naive/createInvoiceNaive';

console.log('============================');
console.log(' NAIVE vs BUILDER (Invoice) ');
console.log('============================');

const customer = {
    id: 'c-001',
    name: 'Acme Corp',
    country: 'AR',
    email: 'billing@acme.test',
};
const items = [
    {
        sku: 'A-100',
        description: 'API Subscription',
        unitPrice: 100,
        quantity: 1,
    },
    { sku: 'S-200', description: 'Support Pack', unitPrice: 50, quantity: 2 },
];

// 1) Versión NAIVE (sin patrón)
try {
    const naive = createInvoiceNaive({
        id: 'INV-NAIVE-001',
        customer,
        items,
        discounts: 10,
        currency: 'USD',
        notes: 'Gracias por su compra',
    });
    console.log('\n-- NAIVE --');
    console.log('Subtotal:', naive.subtotal);
    console.log('Discounts:', naive.discounts);
    console.log('Taxes:', naive.taxes);
    console.log('Total:', naive.total);
} catch (e) {
    console.error('NAIVE error:', (e as Error).message);
}

// 2) Builder (fluido + validaciones)
try {
    const invoice = new InvoiceBuilder()
        .withId('INV-BLD-001')
        .forCustomer(customer)
        .addItems(items)
        .withDiscount(10)
        .withCurrency('USD')
        .withPaymentTerms({ days: 15, method: 'BANK_TRANSFER' })
        .withNotes('Pago dentro de 15 días')
        .withMetadata('origin', 'online')
        .build();

    console.log('\n-- BUILDER --');
    console.log('Subtotal:', invoice.subtotal);
    console.log('Discounts:', invoice.discounts);
    console.log('Taxes:', invoice.taxes);
    console.log('Total:', invoice.total);
    console.log('Payment:', invoice.payment);
    console.log('Metadata:', invoice.metadata);
} catch (e) {
    console.error('BUILDER error:', (e as Error).message);
}

// 3) Mostrar error de validación con Builder
try {
    new InvoiceBuilder()
        .withId('INV-ERROR-001')
        .forCustomer(customer)
        // .addItems(items) // Intencional: sin ítems
        .build();
} catch (e) {
    console.log('\n-- BUILDER VALIDATION DEMO --');
    console.error('Expected error:', (e as Error).message);
}
