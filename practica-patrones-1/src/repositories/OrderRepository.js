class OrderRepository {
    constructor(orderDAO, idGenerator) {
        this.dao = orderDAO;
        this.idGenerator = idGenerator;
    }

    async getNextId() {
        return 'o' + this.idGenerator();
    }

    async store(order) {
        if (!order.id) {
            order.id = await this.getNextId();
        }
        return this.dao.save(order);
    }

    async all() {
        return this.dao.findAll();
    }

    async findById(id) {
        return this.dao.findById(id);
    }
}

module.exports = OrderRepository;
