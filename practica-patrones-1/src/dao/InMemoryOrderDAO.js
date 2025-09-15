const { tables } = require('../data/database');

class InMemoryOrderDAO {
    async save(order) {
        tables.orders.push(order);
        return order;
    }

    async findAll() {
        return tables.orders;
    }

    async findById(id) {
        return tables.orders.find((o) => o.id === id) || null;
    }
}

module.exports = InMemoryOrderDAO;
