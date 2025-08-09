import { EditableMesh } from "./EditableMesh";
import { HEID, VID } from "../types";

/**
 * EdgeMap: canonical map for undirected edges.
 * Key is (min(a,b) << 32) | max(a,b) in a JS number (safe for 32-bit IDs).
 * Value is the canonical half-edge id (preferring the half-edge whose from->to matches (min,max) order when available).
 */
export class EdgeMap {
  private map = new Map<number, HEID>();

  static key(a: VID, b: VID): number {
    const min = a < b ? a : b;
    const max = a < b ? b : a;
    // Compose into a 53-bit safe integer
    return (min as number) * 0x1_0000 + (max as number);
  }

  get(a: VID, b: VID): HEID | undefined {
    return this.map.get(EdgeMap.key(a, b));
  }

  set(a: VID, b: VID, he: HEID): void {
    this.map.set(EdgeMap.key(a, b), he);
  }

  delete(a: VID, b: VID): void {
    this.map.delete(EdgeMap.key(a, b));
  }

  clear(): void {
    this.map.clear();
  }

  /** Rebuild mapping from an existing mesh. O(HE) */
  rebuildFromMesh(mesh: EditableMesh): void {
    this.map.clear();
    const HE = mesh.halfEdges();
    for (let h = 0; h < HE.length; h++) {
      const he = HE[h]; if (!he) continue;
      const to = he.v as VID;
      // prev vertex (from) is the vertex of predecessor half-edge
      let cur = h; let prev = cur;
      for (let i = 0; i < HE.length; i++) { const n = HE[cur]!.next; if (n === h) { prev = cur; break; } cur = n; }
      const from = HE[prev]!.v as VID;
      // store one canonical representative
      const k = EdgeMap.key(from, to);
      if (!this.map.has(k)) this.map.set(k, h as HEID);
    }
  }
}
