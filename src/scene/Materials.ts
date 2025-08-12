// Headless material registry (IDs map to user-defined material payloads)
export type MaterialId = number;
export interface Material { id: MaterialId; name: string; data?: Record<string, unknown> }

export class Materials {
  private map = new Map<MaterialId, Material>();
  private nextId: MaterialId = 1;
  create(name: string, data?: Record<string, unknown>) {
    const id = this.nextId++;
    const m: Material = { id, name, data };
    this.map.set(id, m);
    return id;
  }
  get(id: MaterialId) { return this.map.get(id) ?? null; }
  all() { return [...this.map.values()]; }
}
