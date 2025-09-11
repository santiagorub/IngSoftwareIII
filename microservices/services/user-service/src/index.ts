import { Kafka, logLevel } from 'kafkajs';
import pino from 'pino';
import { PrismaClient } from '@prisma/client';

const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', transport: { target: 'pino-pretty' } });
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'kafka:9092').split(',');
const kafka = new Kafka({ clientId: 'user-service', brokers: KAFKA_BROKERS, logLevel: logLevel.INFO });
const consumer = kafka.consumer({ groupId: 'user-service-group' });
const producer = kafka.producer();

const prisma = new PrismaClient();

async function ensureSchema() {
  try {
    // For demo purposes: push schema on startup
    await prisma.$executeRawUnsafe('SELECT 1');
  } catch (e) {
    // ignore
  }
}

// Circuit breaker simple para DB: abre tras 3 errores, se mantiene 10s
let dbFailures = 0;
let circuitOpenUntil = 0;

function dbCircuitAvailable(): boolean {
  const now = Date.now();
  if (now < circuitOpenUntil) return false;
  return true;
}

function reportDbFailure() {
  dbFailures++;
  if (dbFailures >= 3) {
    circuitOpenUntil = Date.now() + 10000; // 10s
    logger.warn({ circuitOpenUntil }, 'DB circuit opened');
    dbFailures = 0; // reset counter after opening
  }
}

function reportDbSuccess() {
  dbFailures = 0;
}

async function start() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: 'cart.add.request', fromBeginning: false });
  await ensureSchema();

  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = message.value ? JSON.parse(message.value.toString()) : null;
      const correlationId = value?.correlationId;
      const payload = value?.payload;
      if (!payload) return;
      const { userId } = payload;
      logger.info({ correlationId, userId }, 'User validation started');

      if (!dbCircuitAvailable()) {
        await producer.send({ topic: 'user.validation.result', messages: [{ key: correlationId, value: JSON.stringify({ correlationId, status: 'failure', reason: 'user_db_circuit_open' }) }] });
        return;
      }

      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        reportDbSuccess();
        const ok = !!user;
        const msg = ok ? { correlationId, status: 'success', userId } : { correlationId, status: 'failure', reason: 'user_not_found' };
        await producer.send({ topic: 'user.validation.result', messages: [{ key: correlationId, value: JSON.stringify(msg) }] });
        logger.info({ correlationId, ok }, 'User validation result sent');
      } catch (err) {
        logger.error({ err }, 'User DB error');
        reportDbFailure();
        await producer.send({ topic: 'user.validation.result', messages: [{ key: correlationId, value: JSON.stringify({ correlationId, status: 'failure', reason: 'user_db_error' }) }] });
      }
    }
  });

  logger.info('User service started');
}

start().catch((err) => {
  logger.error({ err }, 'User service failed to start');
  process.exit(1);
});


