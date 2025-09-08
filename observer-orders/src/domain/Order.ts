export type OrderStatus = 'CREATED' | 'PAID' | 'SHIPPED' | 'CANCELLED';

export class Order {
  constructor(
    public readonly id: string,
    public customerEmail: string,
    public total: number,
    public status: OrderStatus = 'CREATED'
  ) {}
}


