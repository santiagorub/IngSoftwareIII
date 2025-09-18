const { connect, disconnect, getPool } = require('./data/database');
const OrderService = require('./services/OrderService');

async function main() {
    await connect();

    // Datos ya vienen del seed SQL (db/init.sql)
    const pool = getPool();
    const products = await pool.query('SELECT id, name, price FROM products ORDER BY id');

    const orderService = new OrderService();

    console.log('Productos disponibles:');
    for (const p of products.rows) {
        console.log(`- ${p.id} | ${p.name} | $${Number(p.price)}`);
    }

    console.log('\nCreando pedido para Ana (u1)...');
    const created = await orderService.createOrder({
        userId: 'u1',
        items: [
            { productId: 'p1', quantity: 1 },
            { productId: 'p2', quantity: 2 },
        ],
        paymentMethod: 'credit_card',
        shippingAddress: {
            street: 'Calle 123',
            city: 'CABA',
            zip: '1000',
        },
    });

    console.log('Pedido creado:', created);

    console.log('\nListando pedidos guardados:');
    const all = await orderService.listOrders();
    for (const o of all) {
        console.log(`- ${o.id} | user=${o.userId} | total=$${o.total} | status=${o.status}`);
    }

    await disconnect();
}

main().catch((err) => {
    console.error('Error en la app:', err);
});
