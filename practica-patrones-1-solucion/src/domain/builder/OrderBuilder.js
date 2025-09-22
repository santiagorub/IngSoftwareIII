// Builder that materializes order items and totals from input cart using a ProductDAO
class OrderBuilder {
    /**
     * @param {import('../../data/dao/ProductDAO').ProductDAO} productDAO
     */
    constructor(productDAO) {
        this.productDAO = productDAO;
    }

    /**
     * @param {Object} params
     * @param {Array<{productId: string, quantity: number}>} params.items
     * @returns {Promise<{ materialized: Array, subtotal: number }>} Materialized items and subtotal before payments
     */
    async materializeItems({ items }) {
        const productIds = items.map((it) => it.productId);
        const products = await this.productDAO.findByIds(productIds);
        const productById = new Map(products.map((p) => [p.id, p]));

        const materialized = [];
        for (const it of items) {
            const product = productById.get(it.productId);
            if (!product) throw new Error('Product not found: ' + it.productId);
            const unitPrice = Number(product.price);
            const lineTotal = unitPrice * it.quantity;
            materialized.push({
                productId: product.id,
                name: product.name,
                unitPrice,
                quantity: it.quantity,
                lineTotal,
            });
        }

        let subtotal = 0;
        for (const mi of materialized) subtotal += mi.lineTotal;
        subtotal = Math.round(subtotal * 100) / 100;
        return { materialized, subtotal };
    }
}

module.exports = { OrderBuilder };


