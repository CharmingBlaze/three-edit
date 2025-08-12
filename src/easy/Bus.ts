export type Handler<T = any> = (payload: T) => void;

export class Bus {
  private map = new Map<string, Set<Handler>>();

  on<T = any>(event: string, fn: Handler<T>): void {
    let set = this.map.get(event);
    if (!set) { set = new Set(); this.map.set(event, set); }
    set.add(fn as Handler);
  }

  off<T = any>(event: string, fn: Handler<T>): void {
    this.map.get(event)?.delete(fn as Handler);
  }

  emit<T = any>(event: string, payload?: T): void {
    const set = this.map.get(event);
    if (!set || set.size === 0) return;
    for (const fn of Array.from(set)) {
      try { fn(payload as T); } catch (e) { /* swallow */ }
    }
  }

  clear(event?: string): void {
    if (event) this.map.delete(event); else this.map.clear();
  }
}
