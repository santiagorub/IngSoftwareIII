export interface NotificationChannel {
  send(to: string, message: string): Promise<void>;
}


