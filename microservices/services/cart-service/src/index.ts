import { Kafka, logLevel } from 'kafkajs';
import pino from 'pino';
import { PrismaClient } from '@prisma/client';

const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: { target: 'pino-pretty' },
});
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'kafka:9092').split(',');
const kafka = new Kafka({
    clientId: 'cart-service',
    brokers: KAFKA_BROKERS,
    logLevel: logLevel.INFO,
});
const consumer = kafka.consumer({ groupId: 'cart-service-group' });
const producer = kafka.producer();

const prisma = new PrismaClient();

async function ensureSchema() {
    try {
        await prisma.$executeRawUnsafe('SELECT 1');
    } catch {}
}

// In-memory state de coreografía por correlationId
type ValidationState = {
    user?: 'success' | 'failure';
    product?: 'success' | 'failure';
    reason?: string;
};
const state: Map<string, ValidationState> = new Map();

let dbFailures = 0;
let circuitOpenUntil = 0;

function dbCircuitAvailable(): boolean {
    return Date.now() >= circuitOpenUntil;
}
function reportDbFailure() {
    dbFailures++;
    if (dbFailures >= 3) {
        circuitOpenUntil = Date.now() + 10000;
        logger.warn({ circuitOpenUntil }, 'Cart DB circuit opened');
        dbFailures = 0;
    }
}
function reportDbSuccess() {
    dbFailures = 0;
}

async function tryCompleteSaga(
    correlationId: string,
    payload: { userId: number; productId: string; quantity: number },
) {
    const s = state.get(correlationId);
    if (!s || !s.user || !s.product) return; // esperar ambos

    if (s.user === 'success' && s.product === 'success') {
        if (!dbCircuitAvailable()) {
            await producer.send({
                topic: 'cart.add.result',
                messages: [
                    {
                        key: correlationId,
                        value: JSON.stringify({
                            correlationId,
                            status: 'failure',
                            reason: 'cart_db_circuit_open',
                        }),
                    },
                ],
            });
            state.delete(correlationId);
            return;
        }
        try {
            await prisma.cartItem.create({
                data: {
                    userId: payload.userId,
                    productId: payload.productId,
                    quantity: payload.quantity,
                },
            });
            reportDbSuccess();
            await producer.send({
                topic: 'cart.add.result',
                messages: [
                    {
                        key: correlationId,
                        value: JSON.stringify({ correlationId, status: 'success' }),
                    },
                ],
            });
            logger.info({ correlationId }, 'Cart item created, saga success');
        } catch (err) {
            logger.error({ err }, 'Cart DB error');
            reportDbFailure();
            await producer.send({
                topic: 'cart.add.result',
                messages: [
                    {
                        key: correlationId,
                        value: JSON.stringify({
                            correlationId,
                            status: 'failure',
                            reason: 'cart_db_error',
                        }),
                    },
                ],
            });
        }
    } else {
        const reason = s.reason || (s.user === 'failure' ? 'user_failed' : 'product_failed');
        await producer.send({
            topic: 'cart.add.result',
            messages: [
                {
                    key: correlationId,
                    value: JSON.stringify({ correlationId, status: 'failure', reason }),
                },
            ],
        });
        logger.info({ correlationId, reason }, 'Saga failed');
    }
    state.delete(correlationId);
}

async function start() {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: 'cart.add.request', fromBeginning: false });
    await consumer.subscribe({ topic: 'user.validation.result', fromBeginning: false });
    await consumer.subscribe({ topic: 'product.validation.result', fromBeginning: false });
    await ensureSchema();

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            const value = message.value ? JSON.parse(message.value.toString()) : null;
            const correlationId = value?.correlationId;
            if (!correlationId) return;
            logger.info({ topic, correlationId, value }, 'Cart service received event');

            if (topic === 'cart.add.request') {
                // Guardar payload para completar posteriormente
                state.set(correlationId, { ...state.get(correlationId) });
                // No emitir nada aún (espera validaciones)
            } else if (topic === 'user.validation.result') {
                const s = state.get(correlationId) || {};
                s.user = value.status === 'success' ? 'success' : 'failure';
                if (value.status !== 'success') s.reason = value.reason;
                state.set(correlationId, s);
            } else if (topic === 'product.validation.result') {
                const s = state.get(correlationId) || {};
                s.product = value.status === 'success' ? 'success' : 'failure';
                if (value.status !== 'success') s.reason = value.reason;
                state.set(correlationId, s);
            }

            if (topic === 'cart.add.request') {
                // store payload on side-channel map
                (state as any).payloads = (state as any).payloads || new Map<string, any>();
                (state as any).payloads.set(correlationId, value.payload);
            }

            const payloads: Map<string, any> = (state as any).payloads || new Map();
            const payload = payloads.get(correlationId);
            if (payload) {
                await tryCompleteSaga(correlationId, payload);
            }
        },
    });

    logger.info('Cart service started');
}

start().catch((err) => {
    logger.error({ err }, 'Cart service failed to start');
    process.exit(1);
});
