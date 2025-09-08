import { Order, OrderStatus } from '../domain/Order';
import { OrderEventBus } from '../observer/OrderEventBus';
import { eventFromStatus } from '../events/OrderEvents';

/**
 * Servicio con Observer: publica eventos al bus y no conoce a los observadores.
 */
export class OrderServiceWithObserver {
  constructor(private readonly bus: OrderEventBus) {}

  createOrder(id: string, customerEmail: string, total: number): Order {
    const order = new Order(id, customerEmail, total, 'CREATED');
    this.bus.notify(eventFromStatus(order.status, order));
    return order;
  }

  updateStatus(order: Order, status: OrderStatus) {
    order.status = status;
    this.bus.notify(eventFromStatus(order.status, order));
  }
}


