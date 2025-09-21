const { PostgresOrderDAO } = require('../data/dao/OrderDAO');
const { PostgresProductDAO } = require('../data/dao/ProductDAO');
const { PostgresUserDAO } = require('../data/dao/UserDAO');
const { OrderRepository } = require('../data/repositories/OrderRepository');
const { OrderBuilder } = require('../domain/builder/OrderBuilder');
const OrderService = require('../services/OrderService');

function buildContainer() {
    // DAOs
    const orderDAO = new PostgresOrderDAO();
    const productDAO = new PostgresProductDAO();
    const userDAO = new PostgresUserDAO();

    // Domain helpers
    const orderBuilder = new OrderBuilder(productDAO);

    // Repository
    const orderRepository = new OrderRepository(orderDAO);

    // Service
    const orderService = new OrderService({ orderRepository, userDAO, orderBuilder });

    return {
        orderService,
        productDAO,
    };
}

module.exports = { buildContainer };


