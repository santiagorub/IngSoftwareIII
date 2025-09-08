import { Order, OrderStatus } from '../domain/Order';
import { eventFromStatus } from '../events/OrderEvents';

/**
 * Servicio NAIVE: el servicio conoce a todos los "listeners" y los invoca manualmente.
 * Alta fricción para mantener y extender.
 */
export class OrderServiceNaive {
  constructor(
    private readonly emailNotifier: { notify: (event: ReturnType<typeof eventFromStatus>) => void },
    private readonly auditLogger: { log: (event: ReturnType<typeof eventFromStatus>) => void },
    private readonly inventoryUpdater: { apply: (event: ReturnType<typeof eventFromStatus>) => void },
  ) {}

  createOrder(id: string, customerEmail: string, total: number): Order {
    const order = new Order(id, customerEmail, total, 'CREATED');
    const event = eventFromStatus(order.status, order);
    this.emailNotifier.notify(event);
    this.auditLogger.log(event);
    this.inventoryUpdater.apply(event);
    return order;
  }

  updateStatus(order: Order, status: OrderStatus) {
    order.status = status;
    const event = eventFromStatus(order.status, order);
    this.emailNotifier.notify(event);
    this.auditLogger.log(event);
    this.inventoryUpdater.apply(event);
  }
}


