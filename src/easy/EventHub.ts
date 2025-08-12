export type Handler<T = any> = (payload: T) => void;

class Sub<T = any> {
  constructor(public fn: Handler<T>, public once = false) {}
}

class Channel {
  private subs = new Map<string, Sub[]>();
  private stickyMap = new Map<string, any>();
  private stickyEvents = new Set<string>();

  on<T = any>(event: string, fn: Handler<T>): () => void {
    const list = this.subs.get(event) ?? []; this.subs.set(event, list);
    list.push(new Sub(fn as Handler<T>, false));
    if (this.stickyEvents.has(event) && this.stickyMap.has(event)) {
      try { fn(this.stickyMap.get(event)); } catch {}
    }
    return () => this.off(event, fn);
  }

  once<T = any>(event: string, fn: Handler<T>): () => void {
    const list = this.subs.get(event) ?? []; this.subs.set(event, list);
    list.push(new Sub(fn as Handler<T>, true));
    if (this.stickyEvents.has(event) && this.stickyMap.has(event)) {
      try { fn(this.stickyMap.get(event)); } catch {}
      // once fulfilled immediately, no need to keep
      this.off(event, fn);
    }
    return () => this.off(event, fn);
  }

  off<T = any>(event: string, fn: Handler<T>): void {
    const list = this.subs.get(event); if (!list) return;
    const i = list.findIndex(s => s.fn === fn); if (i >= 0) list.splice(i, 1);
  }

  emit<T = any>(event: string, payload?: T): void {
    if (this.stickyEvents.has(event)) this.stickyMap.set(event, payload);
    const list = this.subs.get(event); if (!list || list.length === 0) return;
    // copy to avoid mutation effects
    for (const sub of [...list]) {
      try { sub.fn(payload as T); } catch {}
      if (sub.once) this.off(event, sub.fn);
    }
  }

  sticky(event: string, enabled = true): void {
    if (enabled) this.stickyEvents.add(event); else this.stickyEvents.delete(event);
  }

  clear(event?: string): void {
    if (event) this.subs.delete(event); else this.subs.clear();
  }
}

export class EventHub {
  private root = new Channel();
  private channels = new Map<string, Channel>();

  channel(name: string): Channel {
    let c = this.channels.get(name);
    if (!c) { c = new Channel(); this.channels.set(name, c); }
    return c;
  }

  // Root channel passthroughs
  on = this.root.on.bind(this.root);
  once = this.root.once.bind(this.root);
  off = this.root.off.bind(this.root);
  emit = this.root.emit.bind(this.root);
  sticky = this.root.sticky.bind(this.root);
  clear = this.root.clear.bind(this.root);
}

export const defaultHub = new EventHub();
