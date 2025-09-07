import { EmailChannel } from '../channels/EmailChannel';
import { TelegramChannel } from '../channels/TelegramChannel';

/**
 * Servicio ACOPLADO: crea las dependencias internamente.
 * - Difícil de testear (no se pueden stubear canales).
 * - Difícil de extender (agregar WhatsApp obliga a tocar esta clase).
 */
export class CoupledNotificationService {
    async notify(channel: 'email' | 'telegram', to: string, message: string): Promise<void> {
        if (channel === 'email') {
            const email = new EmailChannel();
            await email.send(to, message);
            return;
        }

        if (channel === 'telegram') {
            const tg = new TelegramChannel();
            await tg.send(to, message);
            return;
        }

        throw new Error('Unsupported channel');
    }
}
