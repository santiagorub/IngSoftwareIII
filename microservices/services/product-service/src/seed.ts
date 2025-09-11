import { PrismaClient } from '@prisma/client';
import pino from 'pino';

const logger = pino({ transport: { target: 'pino-pretty' } });
const prisma = new PrismaClient();

async function main() {
    // Evitar transacciones en Mongo (sin replica set): find + create
    const existingP1 = await prisma.product.findUnique({ where: { code: 'p1' } });
    if (!existingP1) {
        await prisma.product.create({ data: { code: 'p1', name: 'Producto 1', stock: 10 } });
    }
    const existingP2 = await prisma.product.findUnique({ where: { code: 'p2' } });
    if (!existingP2) {
        await prisma.product.create({ data: { code: 'p2', name: 'Producto 2', stock: 0 } });
    }
    logger.info('Seeded products');
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        logger.error(e);
        process.exit(1);
    });
