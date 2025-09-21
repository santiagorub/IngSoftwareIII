// Contract and implementations for Order data access
const { getPool, withTransaction } = require('../../data/database');

class OrderDAO {
    /**
     * Persist an order and its items. Returns the persisted DB shape (including numeric id).
     * @param {Object} params
     * @param {string} params.userId
     * @param {Array} params.items - [{ productId, name, unitPrice, quantity, lineTotal }]
     * @param {number} params.total
     * @param {string} params.status
     * @param {Object} params.payment - { method, fee?, discount? }
     * @param {Object|null} params.shippingAddress - { street, city, zip } | null
     * @returns {Promise<Object>} order row ({ id, user_id, total, status, payment_method, payment_fee, payment_discount, shipping_* })
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async save(params) {
        throw new Error('Not implemented');
    }

    /**
     * @returns {Promise<Array<Object>>} order rows (no items)
     */
    async findAll() {
        throw new Error('Not implemented');
    }

    /**
     * @param {number} id - numeric DB id
     * @returns {Promise<{ order: Object, items: Array<Object> }|null>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async findById(id) {
        throw new Error('Not implemented');
    }
}

class PostgresOrderDAO extends OrderDAO {
    async save({ userId, items, total, status, payment, shippingAddress }) {
        const paymentFee = payment.fee != null ? Math.round(payment.fee * 100) / 100 : null;
        const paymentDiscount = payment.discount != null ? Math.round(payment.discount * 100) / 100 : null;
        const row = await withTransaction(async (client) => {
            const insertOrder = await client.query(
                `INSERT INTO orders (user_id, total, status, payment_method, payment_fee, payment_discount, shipping_street, shipping_city, shipping_zip)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING id, user_id, total, status, payment_method, payment_fee, payment_discount, shipping_street, shipping_city, shipping_zip`,
                [
                    userId,
                    total,
                    status,
                    payment.method,
                    paymentFee,
                    paymentDiscount,
                    shippingAddress?.street || null,
                    shippingAddress?.city || null,
                    shippingAddress?.zip || null,
                ],
            );
            const orderRow = insertOrder.rows[0];
            const orderId = orderRow.id;
            for (const it of items) {
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, name, unit_price, quantity, line_total)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [orderId, it.productId, it.name, it.unitPrice, it.quantity, it.lineTotal],
                );
            }
            return orderRow;
        });
        return row;
    }

    async findAll() {
        const pool = getPool();
        const res = await pool.query(
            'SELECT id, user_id, total, status, payment_method, payment_fee, payment_discount, shipping_street, shipping_city, shipping_zip FROM orders ORDER BY id ASC',
        );
        return res.rows;
    }

    async findById(id) {
        const pool = getPool();
        const orderRes = await pool.query(
            'SELECT id, user_id, total, status, payment_method, payment_fee, payment_discount, shipping_street, shipping_city, shipping_zip FROM orders WHERE id = $1',
            [id],
        );
        if (orderRes.rowCount === 0) return null;
        const order = orderRes.rows[0];
        const itemsRes = await pool.query(
            'SELECT product_id, name, unit_price, quantity, line_total FROM order_items WHERE order_id = $1 ORDER BY id ASC',
            [id],
        );
        return { order, items: itemsRes.rows };
    }
}

class InMemoryOrderDAO extends OrderDAO {
    constructor() {
        super();
        this._orders = [];
        this._itemsByOrderId = new Map();
        this._seq = 1;
    }

    async save({ userId, items, total, status, payment, shippingAddress }) {
        const id = this._seq++;
        const order = {
            id,
            user_id: userId,
            total,
            status,
            payment_method: payment.method,
            payment_fee: payment.fee != null ? payment.fee : null,
            payment_discount: payment.discount != null ? payment.discount : null,
            shipping_street: shippingAddress?.street || null,
            shipping_city: shippingAddress?.city || null,
            shipping_zip: shippingAddress?.zip || null,
        };
        this._orders.push(order);
        this._itemsByOrderId.set(
            id,
            items.map((it) => ({
                product_id: it.productId,
                name: it.name,
                unit_price: it.unitPrice,
                quantity: it.quantity,
                line_total: it.lineTotal,
            })),
        );
        return order;
    }

    async findAll() {
        return [...this._orders].sort((a, b) => a.id - b.id);
    }

    async findById(id) {
        const order = this._orders.find((o) => o.id === id);
        if (!order) return null;
        const items = this._itemsByOrderId.get(id) || [];
        return { order, items };
    }
}

module.exports = { OrderDAO, PostgresOrderDAO, InMemoryOrderDAO };


