const Order = require('../models/Order');

class OrderService {
    constructor({ orderRepository, users, products }) {
        this.orderRepo = orderRepository;
        this.users = users;
        this.products = products;
    }

    async createOrder({ userId, items, paymentMethod, shippingAddress }) {
        const user = this.users.find((u) => u.id === userId);
        if (!user) {
            throw new Error('User not found');
        }

        const materialized = [];
        for (const it of items) {
            const product = this.products.find((p) => p.id === it.productId);
            if (!product) throw new Error('Product not found: ' + it.productId);
            materialized.push({
                productId: product.id,
                name: product.name,
                unitPrice: product.price,
                quantity: it.quantity,
                lineTotal: product.price * it.quantity,
            });
        }

        let total = materialized.reduce((sum, mi) => sum + mi.lineTotal, 0);

        // ⚠️ Todavía con switch, se sacará en Parte C
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

        const order = new Order({
            id: null, // repo asigna id
            userId,
            items: materialized,
            total: Math.round(total * 100) / 100,
            status: 'CREATED',
            payment,
            shippingAddress,
        });

        return this.orderRepo.store(order);
    }

    async listOrders() {
        return this.orderRepo.all();
    }

    async findOrderById(id) {
        return this.orderRepo.findById(id);
    }
}

module.exports = OrderService;
