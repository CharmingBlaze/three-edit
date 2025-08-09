import { EditableMesh } from "../core/topology/EditableMesh";
import { HEID, VID, FID } from "../core/types";
import { splitEdge, splitFace } from "../core/topology/build";

function prevOf(mesh: EditableMesh, he: number): number {
  const HE = mesh.halfEdges(); let cur = he; for (let i=0;i<HE.length;i++){ const n=HE[cur]!.next; if (n===he) return cur; cur=n; } return he;
}

function nextOf(mesh: EditableMesh, he: number): number { return mesh.halfEdges()[he]!.next; }
function oppOf(mesh: EditableMesh, he: number): number { const a1 = nextOf(mesh, he); return nextOf(mesh, a1); }

/**
 * Compute the quad ring starting from a half-edge by walking across quads via twin->next.
 * Returns an ordered list of face entries containing the face id and the two opposite half-edges on that face.
 */
function collectQuadRing(mesh: EditableMesh, startHE: HEID): Array<{ face: FID, heA: HEID, heB: HEID }> {
  const HE = mesh.halfEdges();
  const start = startHE as number;
  const out: Array<{ face: FID, heA: HEID, heB: HEID }> = [];

  // Collect backward from start (excluding start)
  let hb = start;
  for (;;) {
    // step to previous face along ring: go to opposite of prev(prev(hb)) then twin
    const p1 = prevOf(mesh, hb); const p2 = prevOf(mesh, p1);
    const opp = oppOf(mesh, p2);
    const t = HE[opp]!.twin; if (t == null || t < 0 || !HE[t]) break;
    hb = t;
    const f = HE[hb]!.face as FID; if (f < 0) break;
    const a0 = hb; const a1 = HE[a0]!.next; const a2 = HE[a1]!.next; const a3 = HE[a2]!.next;
    if (HE[a3]!.next !== a0) break;
    out.unshift({ face: f, heA: a0 as HEID, heB: a2 as HEID });
    if (hb === start) break;
  }

  // Include start face once
  {
    const f = HE[start]!.face as FID; if (f >= 0) {
      const a0 = start; const a1 = HE[a0]!.next; const a2 = HE[a1]!.next; const a3 = HE[a2]!.next;
      if (HE[a3]!.next === a0) out.push({ face: f, heA: a0 as HEID, heB: a2 as HEID });
    }
  }

  // Walk forward from start (skip duplicate of start face)
  let hf = start;
  for (;;) {
    // step to next face along ring: go to opposite edge then twin
    const opp = oppOf(mesh, hf);
    const t = HE[opp]!.twin; if (t == null || t < 0 || !HE[t]) break;
    hf = t;
    const f = HE[hf]!.face as FID; if (f < 0) break;
    const a0 = hf; const a1 = HE[a0]!.next; const a2 = HE[a1]!.next; const a3 = HE[a2]!.next;
    if (HE[a3]!.next !== a0) break;
    // advance to analogous edge on that face to continue forward stepping next time
    out.push({ face: f, heA: a0 as HEID, heB: a2 as HEID });
    if (hf === start) break;
  }

  return out;
}

/**
 * Perform a loop cut along a quad ring: split the two opposite edges in every quad at t, then insert a chord across each quad.
 * Returns the list of new edge vertices per face and the new faces created by splits.
 */
export function loopCutQuadRing(mesh: EditableMesh, startHE: HEID, t = 0.5): { verts: Array<[VID, VID]>, faces: FID[] } {
  const ring = collectQuadRing(mesh, startHE);
  const verts: Array<[VID, VID]> = [];
  const faces: FID[] = [];

  // First, split all target edges to create stable vertex ids before face splits
  const splitVerts = ring.map(({ heA, heB }) => {
    const va = splitEdge(mesh, heA, t);
    const vb = splitEdge(mesh, heB, t);
    return [va, vb] as [VID, VID];
  });

  // Then, split each face across the two newly created vertices
  for (let i = 0; i < ring.length; i++) {
    const { face } = ring[i]!; const [va, vb] = splitVerts[i]!;
    const res = splitFace(mesh, face, [va, vb]);
    if (res) { faces.push(res.newFaces[0], res.newFaces[1]); }
    verts.push([va, vb]);
  }

  return { verts, faces };
}
