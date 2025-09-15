const { connect, disconnect, tables } = require('./data/database');
const OrderService = require('./services/OrderService');

async function main() {
    await connect();

    // Seed de datos muy simple
    if (tables.users.length === 0) {
        tables.users.push({ id: 'u1', name: 'Ana', email: 'ana@example.com' });
        tables.users.push({ id: 'u2', name: 'Luis', email: 'luis@example.com' });
    }

    if (tables.products.length === 0) {
        tables.products.push({ id: 'p1', name: 'Café en grano 1kg', price: 20 });
        tables.products.push({ id: 'p2', name: 'Filtro papel x100', price: 6 });
        tables.products.push({ id: 'p3', name: 'Molinillo manual', price: 35 });
    }

    const orderService = new OrderService();

    console.log('Productos disponibles:');
    for (const p of tables.products) {
        console.log(`- ${p.id} | ${p.name} | $${p.price}`);
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
