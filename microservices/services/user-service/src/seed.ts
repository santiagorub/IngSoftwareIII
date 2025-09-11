import { PrismaClient } from '@prisma/client';
import pino from 'pino';

const logger = pino({ transport: { target: 'pino-pretty' } });
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { email: 'alice@example.com', name: 'Alice' },
      { email: 'bob@example.com', name: 'Bob' }
    ]
  });
  logger.info('Seeded users');
}

main().then(() => process.exit(0)).catch((e) => { logger.error(e); process.exit(1); });


