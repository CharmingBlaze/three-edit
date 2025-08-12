import { EditableMesh } from "../core/topology/EditableMesh";
import { HEID } from "../core/types";

/**
 * Slide the origin vertex of each provided half-edge along that half-edge by parameter t in [0,1].
 * t=0 keeps at origin; t=1 moves to destination; values outside [0,1] extrapolate.
 * Topology is unchanged; only vertex positions move.
 */
export function slideAlongEdges(mesh: EditableMesh, edges: HEID[], t: number): void {
  const HE = mesh.halfEdges();
  const prevOf = (h: number): number => { let c = h; for (let i=0;i<HE.length;i++){ const n = HE[c]!.next; if (n === h) return c; c = n; } return h; };
  for (const he of edges as number[]) {
    const origin = prevOf(he);
    const o = HE[origin]!.v; // origin vertex id
    const d = HE[he]!.v;     // destination vertex id (head of half-edge)
    const po = mesh.position.get(o)!; const pd = mesh.position.get(d)!;
    const x = po[0]! * (1 - t) + pd[0]! * t;
    const y = po[1]! * (1 - t) + pd[1]! * t;
    const z = po[2]! * (1 - t) + pd[2]! * t;
    mesh.position.set(o, [x, y, z]);
  }
}
