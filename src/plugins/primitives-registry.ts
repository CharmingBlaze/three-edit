import { PrimitiveFactory, PrimitiveResult } from "../core/primitives";

const registry = new Map<string, PrimitiveFactory<any>>();

export const Primitives = {
  register<T>(name: string, make: PrimitiveFactory<T>) { registry.set(name, make); },
  make<T>(name: string, opts: T): PrimitiveResult {
    const f = registry.get(name);
    if (!f) throw new Error(`Unknown primitive: ${name}`);
    return f(opts);
  },
  list(): string[] { return [...registry.keys()]; }
};
