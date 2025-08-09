import { MeshSelection } from "../core/topology/MeshSelection";

export class SelectionSets {
  private sets = new Map<string, MeshSelection>();
  save(name: string, sel: MeshSelection) { this.sets.set(name, { ...sel, verts: new Set(sel.verts), edges: new Set(sel.edges), faces: new Set(sel.faces) }); }
  get(name: string) { return this.sets.get(name) ?? null; }
  names() { return [...this.sets.keys()]; }
}
