class Order {
    constructor({ id, userId, items, total, status, payment, shippingAddress }) {
        this.id = id;
        this.userId = userId;
        this.items = items || [];
        this.total = total || 0;
        this.status = status || 'PENDING';
        this.payment = payment || { method: 'unknown' };
        this.shippingAddress = shippingAddress || null;
    }
}

module.exports = Order;
