import express from 'express';
import { CoupledNotificationService } from './services/CoupledNotificationService';
import { NotificationService } from './services/NotificationService';
import { EmailChannel } from './channels/EmailChannel';
import { TelegramChannel } from './channels/TelegramChannel';
import { EmailNotificationSender } from './factory/EmailNotificationSender';
import { TelegramNotificationSender } from './factory/TelegramNotificationSender';

export type ChannelName = 'email' | 'telegram';

export function createApp() {
    const app = express();
    app.use(express.json());

    const coupled = new CoupledNotificationService();

    // Servicio acoplado: decide y crea internamente la implementación
    app.post('/coupled/notify', async (req, res) => {
        try {
            const { channel, to, message } = req.body as {
                channel: ChannelName;
                to: string;
                message: string;
            };

            if (!channel || !to || !message) {
                res.status(400).json({ success: false, error: 'channel, to, message are required' });
                return;
            }
            
            await coupled.notify(channel, to, message);
            res.json({ success: true, message: 'Sent (coupled)' });
        } catch (err) {
            res.status(400).json({ success: false, error: (err as Error).message });
        }
    });

    // Servicio con DI: rutas explícitas por canal
    app.post('/di/notify/email', async (req, res) => {
        try {
            const { to, message } = req.body as { to: string; message: string };
            if (!to || !message) {
                res.status(400).json({ success: false, error: 'to, message are required' });
                return;
            }
            const service = new NotificationService(new EmailChannel());
            await service.notify(to, message);
            res.json({ success: true, message: 'Sent via Email (DI)' });
        } catch (err) {
            res.status(400).json({ success: false, error: (err as Error).message });
        }
    });

    app.post('/di/notify/telegram', async (req, res) => {
        try {
            const { to, message } = req.body as { to: string; message: string };
            if (!to || !message) {
                res.status(400).json({ success: false, error: 'to, message are required' });
                return;
            }
            const service = new NotificationService(new TelegramChannel());
            await service.notify(to, message);
            res.json({ success: true, message: 'Sent via Telegram (DI)' });
        } catch (err) {
            res.status(400).json({ success: false, error: (err as Error).message });
        }
    });

    // Factory Method: usa creadores concretos que deciden el canal
    app.post('/factory/notify/email', async (req, res) => {
        try {
            const { to, message } = req.body as { to: string; message: string };
            const sender = new EmailNotificationSender();
            await sender.send(to, message);
            res.json({ success: true, message: 'Sent via Email (Factory Method)' });
        } catch (err) {
            res.status(400).json({ success: false, error: (err as Error).message });
        }
    });

    app.post('/factory/notify/telegram', async (req, res) => {
        try {
            const { to, message } = req.body as { to: string; message: string };
            const sender = new TelegramNotificationSender();
            await sender.send(to, message);
            res.json({ success: true, message: 'Sent via Telegram (Factory Method)' });
        } catch (err) {
            res.status(400).json({ success: false, error: (err as Error).message });
        }
    });

    app.get('/', (_req, res) => {
        res.json({
            success: true,
            message: 'DI Notifications API',
            endpoints: {
                coupled: 'POST /coupled/notify',
                diEmail: 'POST /di/notify/email',
                diTelegram: 'POST /di/notify/telegram',
                factoryEmail: 'POST /factory/notify/email',
                factoryTelegram: 'POST /factory/notify/telegram',
            },
        });
    });

    return app;
}
