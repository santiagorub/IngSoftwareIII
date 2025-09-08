import { Observer } from '../observer/Subject';
import { OrderEvent } from '../events/OrderEvents';

export class EmailNotifierObserver implements Observer<OrderEvent> {
  update(event: OrderEvent) {
    const { order, type } = event;
    console.log(`📧 [Email] to=${order.customerEmail} | ${type} | order=${order.id} total=${order.total}`);
  }
}


