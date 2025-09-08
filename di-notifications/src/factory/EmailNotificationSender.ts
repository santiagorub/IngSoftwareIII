import { NotificationSender } from './NotificationSender';
import { NotificationChannel } from '../channels/types';
import { EmailChannel } from '../channels/EmailChannel';

export class EmailNotificationSender extends NotificationSender {
    protected createChannel(): NotificationChannel {
        return new EmailChannel();
    }

    protected format(message: string): string {
        return `✉️ [EMAIL TEMPLATE]\n${message}`;
    }

    protected afterSend(to: string, message: string) {
        console.log(`✅ Email sent to ${to}`);
    }
}


