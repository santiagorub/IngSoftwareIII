const InMemoryOrderDAO = require('../dao/InMemoryOrderDAO');
const OrderRepository = require('../repositories/OrderRepository');
const OrderService = require('../services/OrderService');
const { tables } = require('../data/database');

function buildApp() {
    let counter = 1;
    const idGenerator = () => counter++;
    const dao = new InMemoryOrderDAO();
    const repo = new OrderRepository(dao, idGenerator);

    const orderService = new OrderService({
        orderRepository: repo,
        users: tables.users,
        products: tables.products,
        // Más dependencias se agregarán en Parte C y D
    });

    return { orderService };
}

module.exports = buildApp;
