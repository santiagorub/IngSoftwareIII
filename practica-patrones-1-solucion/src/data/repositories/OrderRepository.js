// Order repository encapsulating domain semantics and ID mapping
const Order = require('../../models/Order');

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

class OrderRepository {
    /**
     * @param {import('../dao/OrderDAO').OrderDAO} orderDAO
     */
    constructor(orderDAO) {
        this.orderDAO = orderDAO;
    }

    /**
     * @param {Object} data
     * @param {string} data.userId
     * @param {Array} data.items - materialized items
     * @param {number} data.total
     * @param {string} data.status
     * @param {Object} data.payment - { method, fee?, discount? }
     * @param {Object|null} data.shippingAddress
     * @returns {Promise<Order>}
     */
    async store({ userId, items, total, status, payment, shippingAddress }) {
        const row = await this.orderDAO.save({ userId, items, total, status, payment, shippingAddress });
        return new Order({
            id: toOrderIdString(row.id),
            userId: row.user_id,
            items,
            total,
            status: row.status,
            payment,
            shippingAddress,
        });
    }

    /**
     * @returns {Promise<Array<Order>>}
     */
    async findAll() {
        const rows = await this.orderDAO.findAll();
        return rows.map((r) =>
            new Order({
                id: toOrderIdString(r.id),
                userId: r.user_id,
                items: [],
                total: Number(r.total),
                status: r.status,
                payment: {
                    method: r.payment_method,
                    fee: r.payment_fee != null ? Number(r.payment_fee) : undefined,
                    discount: r.payment_discount != null ? Number(r.payment_discount) : undefined,
                },
                shippingAddress:
                    r.shipping_street || r.shipping_city || r.shipping_zip
                        ? { street: r.shipping_street, city: r.shipping_city, zip: r.shipping_zip }
                        : null,
            }),
        );
    }

    /**
     * @param {string|number} id
     * @returns {Promise<Order|null>}
     */
    async findById(id) {
        const numericId = parseOrderId(id);
        const res = await this.orderDAO.findById(numericId);
        if (!res) return null;
        const { order: r, items: itemRows } = res;
        const items = itemRows.map((it) => ({
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
            payment: {
                method: r.payment_method,
                fee: r.payment_fee != null ? Number(r.payment_fee) : undefined,
                discount: r.payment_discount != null ? Number(r.payment_discount) : undefined,
            },
            shippingAddress:
                r.shipping_street || r.shipping_city || r.shipping_zip
                    ? { street: r.shipping_street, city: r.shipping_city, zip: r.shipping_zip }
                    : null,
        });
    }
}

module.exports = { OrderRepository };


