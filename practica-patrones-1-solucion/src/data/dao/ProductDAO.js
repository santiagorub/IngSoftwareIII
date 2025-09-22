// Product data access abstractions
const { getPool } = require('../../data/database');

class ProductDAO {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async findByIds(ids) {
        throw new Error('Not implemented');
    }

    async listAll() {
        throw new Error('Not implemented');
    }
}

class PostgresProductDAO extends ProductDAO {
    async findByIds(ids) {
        const pool = getPool();
        const res = await pool.query('SELECT id, name, price FROM products WHERE id = ANY($1)', [ids]);
        return res.rows.map((r) => ({ id: r.id, name: r.name, price: Number(r.price) }));
    }

    async listAll() {
        const pool = getPool();
        const res = await pool.query('SELECT id, name, price FROM products ORDER BY id');
        return res.rows.map((r) => ({ id: r.id, name: r.name, price: Number(r.price) }));
    }
}

class InMemoryProductDAO extends ProductDAO {
    constructor(seed = []) {
        super();
        this._byId = new Map(seed.map((p) => [p.id, { ...p }]));
    }

    async findByIds(ids) {
        return ids
            .map((id) => this._byId.get(id))
            .filter(Boolean)
            .map((p) => ({ ...p }));
    }

    async listAll() {
        return Array.from(this._byId.values()).map((p) => ({ ...p }));
    }
}

module.exports = { ProductDAO, PostgresProductDAO, InMemoryProductDAO };


