import { NotificationChannel } from './types';

export class TelegramChannel implements NotificationChannel {
  async send(to: string, message: string): Promise<void> {
    // Simulación: en un proyecto real, aquí integrarías Telegram Bot API
    console.log(`💬 [TELEGRAM] to=${to} | message=${message}`);
  }
}


