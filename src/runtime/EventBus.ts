type Handler<T> = (payload: T) => void;
export class EventBus {
  private map = new Map<string, Set<Handler<any>>>();
  on<T = any>(type: string, fn: Handler<T>) { if (!this.map.has(type)) this.map.set(type, new Set()); this.map.get(type)!.add(fn as Handler<any>); return () => this.off(type, fn); }
  off<T = any>(type: string, fn: Handler<T>) { this.map.get(type)?.delete(fn as Handler<any>); }
  emit<T = any>(type: string, payload: T) { for (const fn of this.map.get(type) ?? []) fn(payload); }
}
