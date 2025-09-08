import { Observer } from '../observer/Subject';
import { OrderEvent } from '../events/OrderEvents';

export class InventoryUpdaterObserver implements Observer<OrderEvent> {
  update(event: OrderEvent) {
    // Simulado: en un caso real, actualizaríamos stock DB
    console.log(`📦 [Inventory] ${event.type} -> update stock for order=${event.order.id}`);
  }
}


