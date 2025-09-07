import { NotificationChannel } from '../channels/types';

/**
 * Servicio con INYECCIÓN DE DEPENDENCIAS (DI):
 * - Depende de la abstracción NotificationChannel.
 * - Recibe la implementación por constructor (Email, Telegram, etc.).
 * - Testeable y extensible.
 */
export class NotificationService {
    constructor(private readonly channel: NotificationChannel) {}

    async notify(to: string, message: string): Promise<void> {
        await this.channel.send(to, message);
    }
}
