const { connect, disconnect } = require('./data/database');
const { buildContainer } = require('./setup/container');

async function main() {
    await connect();

    const { orderService, productDAO } = buildContainer();
    const products = await productDAO.listAll();

    console.log('Productos disponibles:');
    for (const p of products) {
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
