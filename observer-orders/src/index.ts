import { OrderEventBus } from './observer/OrderEventBus';
import { EmailNotifierObserver } from './observers/EmailNotifierObserver';
import { AuditLogObserver } from './observers/AuditLogObserver';
import { InventoryUpdaterObserver } from './observers/InventoryUpdaterObserver';
import { OrderServiceNaive } from './services/OrderServiceNaive';
import { OrderServiceWithObserver } from './services/OrderServiceWithObserver';

console.log('==============================');
console.log(' Observer Pattern - Orders ');
console.log('==============================');

// NAIVE setup
const naive = new OrderServiceNaive(
  { notify: (e) => console.log(`[NAIVE] Email => ${e.type} #${e.order.id}`) },
  { log: (e) => console.log(`[NAIVE] Audit => ${e.type} #${e.order.id}`) },
  { apply: (e) => console.log(`[NAIVE] Inventory => ${e.type} #${e.order.id}`) },
);

const orderN = naive.createOrder('N-100', 'naive@customer.test', 150);
naive.updateStatus(orderN, 'PAID');
naive.updateStatus(orderN, 'SHIPPED');

// OBSERVER setup
const bus = new OrderEventBus();
const email = new EmailNotifierObserver();
const audit = new AuditLogObserver();
const inventory = new InventoryUpdaterObserver();

const unsubscribeInventory = bus.subscribe(inventory);
bus.subscribe(email);
bus.subscribe(audit);

const service = new OrderServiceWithObserver(bus);
const order = service.createOrder('O-200', 'observer@customer.test', 250);
service.updateStatus(order, 'PAID');

// Demostrar unsubscribe en vivo: inventario fuera de línea
console.log('\n-- Maintenance: disabling inventory updates --');
unsubscribeInventory();
service.updateStatus(order, 'SHIPPED');

console.log('\nDone.');


