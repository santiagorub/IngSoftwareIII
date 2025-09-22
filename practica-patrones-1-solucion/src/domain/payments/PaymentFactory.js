class PaymentMethod {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    applyToTotal(total) {
        throw new Error('Not implemented');
    }
}

class CreditCardPayment extends PaymentMethod {
    applyToTotal(total) {
        const fee = Math.round(total * 0.02 * 100) / 100;
        return { total: Math.round((total + fee) * 100) / 100, payment: { method: 'credit_card', fee } };
    }
}

class CashPayment extends PaymentMethod {
    applyToTotal(total) {
        const discount = Math.round(total * 0.05 * 100) / 100;
        return { total: Math.round((total - discount) * 100) / 100, payment: { method: 'cash', discount } };
    }
}

class UnknownPayment extends PaymentMethod {
    applyToTotal(total) {
        return { total: Math.round(total * 100) / 100, payment: { method: 'unknown' } };
    }
}

class PixPayment extends PaymentMethod {
    applyToTotal(total) {
        // ejemplo: 3% descuento
        const discount = Math.round(total * 0.03 * 100) / 100;
        return { total: Math.round((total - discount) * 100) / 100, payment: { method: 'pix', discount } };
    }
}

class PaymentFactory {
    static create(method) {
        switch (method) {
            case 'credit_card':
                return new CreditCardPayment();
            case 'cash':
                return new CashPayment();
            case 'pix':
                return new PixPayment();
            default:
                return new UnknownPayment();
        }
    }
}

module.exports = { PaymentFactory, PaymentMethod, CreditCardPayment, CashPayment, PixPayment, UnknownPayment };


