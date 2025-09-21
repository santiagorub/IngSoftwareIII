// Conexión real a Postgres (utilizar con docker-compose.yml del proyecto)
const { Pool } = require('pg');

let pool = null;

function buildPool() {
    return new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || 'app',
        password: process.env.DB_PASSWORD || 'app',
        database: process.env.DB_NAME || 'coffee_store',
        max: 10,
        idleTimeoutMillis: 30000,
    });
}

async function connect() {
    if (!pool) {
        pool = buildPool();
    }
    await pool.query('SELECT 1');
    console.log('[DB] Conectado a Postgres');
}

async function disconnect() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('[DB] Conexión a Postgres cerrada');
    }
}

function getPool() {
    if (!pool) {
        throw new Error('DB pool not initialized. Call connect() first.');
    }
    return pool;
}

async function withTransaction(run) {
    const client = await getPool().connect();
    try {
        await client.query('BEGIN');
        const result = await run(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch (_) {}
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { connect, disconnect, getPool, withTransaction };
