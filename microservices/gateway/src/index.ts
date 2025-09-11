import express, { Request, Response } from 'express';
import cors from 'cors';
import { Kafka, logLevel } from 'kafkajs';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: { target: 'pino-pretty' },
});

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:29092').split(',');
const PORT = Number(process.env.PORT || 8080);

const kafka = new Kafka({ clientId: 'gateway', brokers: KAFKA_BROKERS, logLevel: logLevel.INFO });
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'gateway-group' });

type PendingMap = Map<
    string,
    { resolve: (v: any) => void; reject: (e: any) => void; timeout: NodeJS.Timeout }
>;
const pendingByCorrelation: PendingMap = new Map();

async function startKafka() {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: 'cart.add.result', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            try {
                const value = message.value ? JSON.parse(message.value.toString()) : null;
                const correlationId = value?.correlationId;
                logger.info({ topic, correlationId, value }, 'Received result event');
                if (correlationId && pendingByCorrelation.has(correlationId)) {
                    const { resolve, timeout } = pendingByCorrelation.get(correlationId)!;
                    clearTimeout(timeout);
                    pendingByCorrelation.delete(correlationId);
                    resolve(value);
                }
            } catch (err) {
                logger.error({ err }, 'Error handling result event');
            }
        },
    });
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

const AddSchema = z.object({
    userId: z.number().int().positive(),
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
});

app.post('/cart/add', async (req: Request, res: Response) => {
    const parsed = AddSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'invalid_request', details: parsed.error.flatten() });
    }
    const { userId, productId, quantity } = parsed.data;
    const correlationId = uuidv4();
    const event = {
        type: 'cart.add.request',
        payload: { userId, productId, quantity },
        correlationId,
        ts: Date.now(),
    };
    logger.info({ event }, 'Publishing add to cart request');

    try {
        await producer.send({
            topic: 'cart.add.request',
            messages: [{ key: correlationId, value: JSON.stringify(event) }],
        });
    } catch (err) {
        logger.error({ err }, 'Failed to publish request');
        return res.status(503).json({ error: 'kafka_unavailable' });
    }

    const result = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            pendingByCorrelation.delete(correlationId);
            reject(new Error('timeout'));
        }, 8000);
        pendingByCorrelation.set(correlationId, { resolve, reject, timeout });
    }).catch(() => null);

    if (!result) {
        return res.status(504).json({ status: 'timeout' });
    }
    const ok = (result as any)?.status === 'success';
    return res.status(ok ? 200 : 422).json(result);
});

app.listen(PORT, async () => {
    logger.info({ PORT, KAFKA_BROKERS }, 'Gateway listening');
    try {
        await startKafka();
        logger.info('Kafka started');
    } catch (err) {
        logger.error({ err }, 'Kafka failed to start');
        process.exit(1);
    }
});
