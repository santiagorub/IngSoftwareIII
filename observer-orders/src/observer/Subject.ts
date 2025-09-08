export interface Observer<T> {
  update(event: T): void | Promise<void>;
}

export class Subject<T> {
  private observers: Set<Observer<T>> = new Set();

  subscribe(o: Observer<T>) {
    this.observers.add(o);
    return () => this.unsubscribe(o);
  }

  unsubscribe(o: Observer<T>) {
    this.observers.delete(o);
  }

  async notify(event: T) {
    for (const o of this.observers) {
      await o.update(event);
    }
  }
}


