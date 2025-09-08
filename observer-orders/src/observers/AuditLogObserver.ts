import { Observer } from '../observer/Subject';
import { OrderEvent } from '../events/OrderEvents';

export class AuditLogObserver implements Observer<OrderEvent> {
  update(event: OrderEvent) {
    console.log(`🧾 [Audit] ${event.type} at=${event.at.toISOString()} order=${event.order.id}`);
  }
}


