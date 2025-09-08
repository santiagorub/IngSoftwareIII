import { Subject } from './Subject';
import { OrderEvent } from '../events/OrderEvents';

// Bus específico de eventos de pedidos
export class OrderEventBus extends Subject<OrderEvent> {}


