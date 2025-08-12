import { EditableMesh } from "./EditableMesh";
import { HEID, FID } from "../types";
import { nextRingEdgeAcrossQuad } from "./MeshQueries";

// Returns boundary loops as arrays of HEIDs, outer loops only for MVP.
export function facesToBoundaryLoops(mesh: EditableMesh, faces: Set<FID>): HEID[][] {
  const HE = mesh.halfEdges();
  const F = mesh.faces();
  const out: HEID[][] = [];

  // Collect boundary half-edges per face, in face order
  for (const f of faces) {
    const face = F[f]; if (!face) continue;
    const start = face.he as number; let h = start; const loop: HEID[] = [];
    do {
      const tw = HE[h]!.twin; const of = tw >= 0 ? HE[tw]!.face : -1;
      if (of < 0 || !faces.has(of)) loop.push(h as HEID);
      h = HE[h]!.next;
    } while (h !== start);
    if (loop.length > 0) out.push(loop);
  }
  return out;
}

export function edgeLoopAcrossQuads(mesh: EditableMesh, seed: HEID): HEID[] {
  const visited = new Set<HEID>();
  let cur: HEID | null = seed;
  for (let i = 0; i < mesh.halfEdges().length && cur != null && !visited.has(cur); i++) {
    visited.add(cur);
    cur = nextRingEdgeAcrossQuad(mesh, cur);
  }
  return Array.from(visited);
}

export function ringFromEdge(mesh: EditableMesh, seed: HEID): HEID[] {
  // Traverse approximate parallel edges via next-next across opposite twins
  const HE = mesh.halfEdges();
  const visited = new Set<HEID>();
  const stepParallel = (e: HEID): HEID | null => {
    const n = HE[e]!.next; const nn = HE[n]!.next; const tw = HE[nn]!.twin; return tw >= 0 ? (HE[tw]!.next as HEID) : null;
  };
  let cur: HEID | null = seed;
  for (let i = 0; i < HE.length && cur != null && !visited.has(cur); i++) { visited.add(cur); cur = stepParallel(cur); }
  return Array.from(visited);
}
