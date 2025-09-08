import { NotificationSender } from './NotificationSender';
import { NotificationChannel } from '../channels/types';
import { TelegramChannel } from '../channels/TelegramChannel';

export class TelegramNotificationSender extends NotificationSender {
    protected createChannel(): NotificationChannel {
        return new TelegramChannel();
    }

    protected format(message: string): string {
        return `🤖 [TELEGRAM BOT]\n${message}`;
    }

    protected afterSend(to: string, message: string) {
        console.log(`✅ Telegram sent to ${to}`);
    }
}


