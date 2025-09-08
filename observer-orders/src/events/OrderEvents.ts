import { Order, OrderStatus } from '../domain/Order';

export type OrderEventType = 'ORDER_CREATED' | 'ORDER_PAID' | 'ORDER_SHIPPED' | 'ORDER_CANCELLED';

export interface OrderEvent {
  type: OrderEventType;
  order: Order;
  at: Date;
  meta?: Record<string, string | number | boolean>;
}

export function eventFromStatus(status: OrderStatus, order: Order): OrderEvent {
  const map: Record<OrderStatus, OrderEventType> = {
    CREATED: 'ORDER_CREATED',
    PAID: 'ORDER_PAID',
    SHIPPED: 'ORDER_SHIPPED',
    CANCELLED: 'ORDER_CANCELLED',
  };
  return { type: map[status], order, at: new Date() };
}


