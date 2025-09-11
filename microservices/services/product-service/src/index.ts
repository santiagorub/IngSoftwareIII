import { Kafka, logLevel } from 'kafkajs';
import pino from 'pino';
import { PrismaClient } from '@prisma/client';

const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', transport: { target: 'pino-pretty' } });
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'kafka:9092').split(',');
const kafka = new Kafka({ clientId: 'product-service', brokers: KAFKA_BROKERS, logLevel: logLevel.INFO });
const consumer = kafka.consumer({ groupId: 'product-service-group' });
const producer = kafka.producer();

const prisma = new PrismaClient();

let dbFailures = 0;
let circuitOpenUntil = 0;

function dbCircuitAvailable(): boolean {
  return Date.now() >= circuitOpenUntil;
}

function reportDbFailure() {
  dbFailures++;
  if (dbFailures >= 3) {
    circuitOpenUntil = Date.now() + 10000;
    logger.warn({ circuitOpenUntil }, 'Mongo circuit opened');
    dbFailures = 0;
  }
}

function reportDbSuccess() {
  dbFailures = 0;
}

async function start() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: 'cart.add.request', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = message.value ? JSON.parse(message.value.toString()) : null;
      const correlationId = value?.correlationId;
      const payload = value?.payload;
      if (!payload) return;
      const { productId, quantity } = payload;
      logger.info({ correlationId, productId }, 'Product validation started');

      if (!dbCircuitAvailable()) {
        await producer.send({ topic: 'product.validation.result', messages: [{ key: correlationId, value: JSON.stringify({ correlationId, status: 'failure', reason: 'product_db_circuit_open' }) }] });
        return;
      }

      try {
        const isHex24 = typeof productId === 'string' && /^[0-9a-fA-F]{24}$/.test(productId);
        const product = isHex24
          ? await prisma.product.findUnique({ where: { id: productId } })
          : await prisma.product.findUnique({ where: { code: productId } });
        reportDbSuccess();
        const ok = !!product && product.stock >= quantity;
        const msg = ok ? { correlationId, status: 'success', productId } : { correlationId, status: 'failure', reason: product ? 'insufficient_stock' : 'product_not_found' };
        await producer.send({ topic: 'product.validation.result', messages: [{ key: correlationId, value: JSON.stringify(msg) }] });
        logger.info({ correlationId, ok }, 'Product validation result sent');
      } catch (err) {
        logger.error({ err }, 'Product DB error');
        reportDbFailure();
        await producer.send({ topic: 'product.validation.result', messages: [{ key: correlationId, value: JSON.stringify({ correlationId, status: 'failure', reason: 'product_db_error' }) }] });
      }
    }
  });

  logger.info('Product service started');
}

start().catch((err) => {
  logger.error({ err }, 'Product service failed to start');
  process.exit(1);
});


