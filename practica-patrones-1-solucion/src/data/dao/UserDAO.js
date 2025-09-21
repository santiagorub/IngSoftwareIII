// User data access abstractions
const { getPool } = require('../../data/database');

class UserDAO {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async existsById(id) {
        throw new Error('Not implemented');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async findById(id) {
        throw new Error('Not implemented');
    }
}

class PostgresUserDAO extends UserDAO {
    async existsById(id) {
        const pool = getPool();
        const res = await pool.query('SELECT 1 FROM users WHERE id = $1', [id]);
        return res.rowCount > 0;
    }

    async findById(id) {
        const pool = getPool();
        const res = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [id]);
        if (res.rowCount === 0) return null;
        const r = res.rows[0];
        return { id: r.id, name: r.name, email: r.email };
    }
}

class InMemoryUserDAO extends UserDAO {
    constructor(seed = []) {
        super();
        this._byId = new Map(seed.map((u) => [u.id, { ...u }]));
    }

    async existsById(id) {
        return this._byId.has(id);
    }

    async findById(id) {
        const u = this._byId.get(id);
        return u ? { ...u } : null;
    }
}

module.exports = { UserDAO, PostgresUserDAO, InMemoryUserDAO };


