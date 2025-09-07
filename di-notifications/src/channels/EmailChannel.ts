import { NotificationChannel } from './types';

export class EmailChannel implements NotificationChannel {
  async send(to: string, message: string): Promise<void> {
    // Simulación: en un proyecto real, aquí integrarías nodemailer, SES, etc.
    console.log(`📧 [EMAIL] to=${to} | message=${message}`);
  }
}


