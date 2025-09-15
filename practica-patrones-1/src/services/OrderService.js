const { tables } = require('../data/database');
const Order = require('../models/Order');

let orderIdCounter = 1;

class OrderService {
    async createOrder({ userId, items, paymentMethod, shippingAddress }) {
        const user = tables.users.find((u) => u.id === userId);
        if (!user) {
            throw new Error('User not found');
        }

        const materialized = [];
        for (const it of items) {
            const product = tables.products.find((p) => p.id === it.productId);
            if (!product) throw new Error('Product not found: ' + it.productId);
            materialized.push({
                productId: product.id,
                name: product.name,
                unitPrice: product.price,
                quantity: it.quantity,
                lineTotal: product.price * it.quantity,
            });
        }

        let total = 0;
        for (const mi of materialized) total += mi.lineTotal;

        let payment;
        switch (paymentMethod) {
            case 'credit_card':
                payment = { method: 'credit_card', fee: total * 0.02 };
                break;
            case 'cash':
                payment = { method: 'cash', discount: total * 0.05 };
                total = total * 0.95;
                break;
            default:
                payment = { method: 'unknown' };
        }

        const id = 'o' + orderIdCounter++;
        const order = new Order({
            id,
            userId,
            items: materialized,
            total: Math.round(total * 100) / 100,
            status: 'CREATED',
            payment,
            shippingAddress,
        });

        tables.orders.push(order);
        return order;
    }

    async listOrders() {
        return tables.orders;
    }

    async findOrderById(id) {
        return tables.orders.find((o) => o.id === id) || null;
    }
}

module.exports = OrderService;
