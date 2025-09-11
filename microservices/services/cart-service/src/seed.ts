import { PrismaClient } from '@prisma/client';
import pino from 'pino';

const logger = pino({ transport: { target: 'pino-pretty' } });
const prisma = new PrismaClient();

async function main() {
  // No pre-populated cart items required
  await prisma.$queryRawUnsafe('SELECT 1');
  logger.info('Cart DB ready');
}

main().then(() => process.exit(0)).catch((e) => { logger.error(e); process.exit(1); });


