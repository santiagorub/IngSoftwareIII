const { PaymentFactory } = require('../domain/payments/PaymentFactory');

class OrderService {
    /**
     * @param {Object} deps
     * @param {import('../data/repositories/OrderRepository').OrderRepository} deps.orderRepository
     * @param {import('../data/dao/UserDAO').UserDAO} deps.userDAO
     * @param {import('../domain/builder/OrderBuilder').OrderBuilder} deps.orderBuilder
     * @param {typeof PaymentFactory} deps.paymentFactory
     */
    constructor({ orderRepository, userDAO, orderBuilder, paymentFactory = PaymentFactory }) {
        this.orderRepository = orderRepository;
        this.userDAO = userDAO;
        this.orderBuilder = orderBuilder;
        this.paymentFactory = paymentFactory;
    }

    async createOrder({ userId, items, paymentMethod, shippingAddress }) {
        const exists = await this.userDAO.existsById(userId);
        if (!exists) throw new Error('User not found');

        const { materialized, subtotal } = await this.orderBuilder.materializeItems({ items });
        const strategy = this.paymentFactory.create(paymentMethod);
        const { total, payment } = strategy.applyToTotal(subtotal);

        const stored = await this.orderRepository.store({
            userId,
            items: materialized,
            total,
            status: 'CREATED',
            payment,
            shippingAddress: shippingAddress || null,
        });
        return stored;
    }

    async listOrders() {
        return this.orderRepository.findAll();
    }

    async findOrderById(id) {
        return this.orderRepository.findById(id);
    }
}

module.exports = OrderService;
