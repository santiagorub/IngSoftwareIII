import { NotificationChannel } from '../channels/types';

/**
 * Factory Method pattern
 * Creator abstracto: define el método de alto nivel `send` y delega la
 * creación del "product" (canal) a `createChannel()` que implementan
 * las subclases.
 */
export abstract class NotificationSender {
    // Factory Method: cada subclase decide qué canal crear
    protected abstract createChannel(): NotificationChannel;

    // Lógica común reutilizable (puede verse como Template Method)
    async send(to: string, message: string): Promise<void> {
        this.validate(to, message);
        const channel = this.createChannel();
        const finalMessage = this.format(message);
        await channel.send(to, finalMessage);
        this.afterSend(to, finalMessage);
    }

    protected validate(to: string, message: string) {
        if (!to || !message) {
            throw new Error('to and message are required');
        }
    }

    // Hook para formatear el mensaje (subclases pueden personalizar)
    protected format(message: string): string {
        return message;
    }

    // Hook post-envío (métricas, logs, etc.)
    // Default: no-op
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected afterSend(to: string, message: string) {}
}


