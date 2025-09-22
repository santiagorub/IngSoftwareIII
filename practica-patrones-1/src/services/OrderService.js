const { tables } = require('../data/database');
const Order = require('../models/Order');

let orderIdCounter = 1;

class OrderService {
    constructor({ orderRepository, users, products }) {
        this.orderRepo = orderRepository;
        this.users = users;
        this.products = products;
    }

    async createOrder({ userId, items, paymentMethod, shippingAddress }) {
        const user = tables.users.find((u) => u.id === userId);
        if (!user) {
            throw new Error('User not found');
        }

        const productIds = items.map((it) => it.productId);
        const productsRes = await pool.query('SELECT id, name, price FROM products WHERE id = ANY($1)', [productIds]);
        const productById = new Map(productsRes.rows.map((r) => [r.id, r]));

        const materialized = [];
        for (const it of items) {
            const product = tables.products.find((p) => p.id === it.productId);
            if (!product) throw new Error('Product not found: ' + it.productId);
            const lineTotal = Number(product.price) * it.quantity;
            materialized.push({
                productId: product.id,
                name: product.name,
                unitPrice: Number(product.price),
                quantity: it.quantity,
                lineTotal,
            });
        }

        let total = materialized.reduce((sum, mi) => sum + mi.lineTotal, 0);

        // ⚠️ Todavía con switch, se sacará en Parte C
        let payment;
        let paymentFee = null;
        let paymentDiscount = null;
        switch (paymentMethod) {
            case 'credit_card':
                paymentFee = total * 0.02;
                payment = { method: 'credit_card', fee: paymentFee };
                break;
            case 'cash':
                paymentDiscount = total * 0.05;
                total = total * 0.95;
                payment = { method: 'cash', discount: paymentDiscount };
                break;
            default:
                payment = { method: 'unknown' };
        }

        const id = 'o' + orderIdCounter++;
        const order = new Order({
            id,
            userId,
            items: materialized,
            total,
            status: dbOrder.status,
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
