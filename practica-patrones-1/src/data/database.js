// Simulación de una "base de datos" en memoria.

const tables = {
    users: [],
    products: [],
    orders: [],
};

let isConnected = false;

async function connect() {
    if (!isConnected) {
        await new Promise((r) => setTimeout(r, 50));
        isConnected = true;
        console.log('[DB] Conectado a base en memoria');
    }
}

async function disconnect() {
    if (isConnected) {
        await new Promise((r) => setTimeout(r, 10));
        isConnected = false;
        console.log('[DB] Desconectado');
    }
}

module.exports = { tables, connect, disconnect };
