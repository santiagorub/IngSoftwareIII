const { getPool, withTransaction } = require('../data/database');
const Order = require('../models/Order');

function toOrderIdString(dbId) {
    return 'o' + String(dbId);
}

function parseOrderId(input) {
    if (typeof input === 'number') return input;
    if (typeof input === 'string' && input.startsWith('o')) {
        const n = Number(input.slice(1));
        if (!Number.isNaN(n)) return n;
    }
    const asNum = Number(input);
    if (!Number.isNaN(asNum)) return asNum;
    throw new Error('Invalid order id: ' + input);
}

class OrderService {
    async createOrder({ userId, items, paymentMethod, shippingAddress }) {
        const pool = getPool();

        const userExists = await pool.query('SELECT 1 FROM users WHERE id = $1', [userId]);
        if (userExists.rowCount === 0) {
            throw new Error('User not found');
        }

        const productIds = items.map((it) => it.productId);
        const productsRes = await pool.query('SELECT id, name, price FROM products WHERE id = ANY($1)', [productIds]);
        const productById = new Map(productsRes.rows.map((r) => [r.id, r]));

        const materialized = [];
        for (const it of items) {
            const product = productById.get(it.productId);
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

        let total = 0;
        for (const mi of materialized) total += mi.lineTotal;

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

        total = Math.round(total * 100) / 100;
        if (paymentFee != null) paymentFee = Math.round(paymentFee * 100) / 100;
        if (paymentDiscount != null) paymentDiscount = Math.round(paymentDiscount * 100) / 100;

        const dbOrder = await withTransaction(async (client) => {
            const insertOrder = await client.query(
                `INSERT INTO orders (user_id, total, status, payment_method, payment_fee, payment_discount, shipping_street, shipping_city, shipping_zip)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING id, user_id, total, status, payment_method, payment_fee, payment_discount, shipping_street, shipping_city, shipping_zip`,
                [
                    userId,
                    total,
                    'CREATED',
                    payment.method,
                    paymentFee,
                    paymentDiscount,
                    shippingAddress?.street || null,
                    shippingAddress?.city || null,
                    shippingAddress?.zip || null,
                ],
            );
            const row = insertOrder.rows[0];
            const orderId = row.id;

            for (const it of materialized) {
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, name, unit_price, quantity, line_total)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [orderId, it.productId, it.name, it.unitPrice, it.quantity, it.lineTotal],
                );
            }

            return row;
        });

        return new Order({
            id: toOrderIdString(dbOrder.id),
            userId: dbOrder.user_id,
            items: materialized,
            total,
            status: dbOrder.status,
            payment,
            shippingAddress,
        });
    }

    async listOrders() {
        const pool = getPool();
        const res = await pool.query(
            'SELECT id, user_id, total, status, payment_method, payment_fee, payment_discount, shipping_street, shipping_city, shipping_zip FROM orders ORDER BY id ASC',
        );
        return res.rows.map((r) =>
            new Order({
                id: toOrderIdString(r.id),
                userId: r.user_id,
                items: [],
                total: Number(r.total),
                status: r.status,
                payment: { method: r.payment_method, fee: r.payment_fee ? Number(r.payment_fee) : undefined, discount: r.payment_discount ? Number(r.payment_discount) : undefined },
                shippingAddress: r.shipping_street || r.shipping_city || r.shipping_zip ? { street: r.shipping_street, city: r.shipping_city, zip: r.shipping_zip } : null,
            }),
        );
    }

    async findOrderById(id) {
        const pool = getPool();
        const numericId = parseOrderId(id);
        const orderRes = await pool.query(
            'SELECT id, user_id, total, status, payment_method, payment_fee, payment_discount, shipping_street, shipping_city, shipping_zip FROM orders WHERE id = $1',
            [numericId],
        );
        if (orderRes.rowCount === 0) return null;
        const r = orderRes.rows[0];
        const itemsRes = await pool.query(
            'SELECT product_id, name, unit_price, quantity, line_total FROM order_items WHERE order_id = $1 ORDER BY id ASC',
            [numericId],
        );
        const items = itemsRes.rows.map((it) => ({
            productId: it.product_id,
            name: it.name,
            unitPrice: Number(it.unit_price),
            quantity: it.quantity,
            lineTotal: Number(it.line_total),
        }));
        return new Order({
            id: toOrderIdString(r.id),
            userId: r.user_id,
            items,
            total: Number(r.total),
            status: r.status,
            payment: { method: r.payment_method, fee: r.payment_fee ? Number(r.payment_fee) : undefined, discount: r.payment_discount ? Number(r.payment_discount) : undefined },
            shippingAddress: r.shipping_street || r.shipping_city || r.shipping_zip ? { street: r.shipping_street, city: r.shipping_city, zip: r.shipping_zip } : null,
        });
    }
}

module.exports = OrderService;
