import { describe, it, expect } from "vitest";
import { EditableMesh } from "../core/topology/EditableMesh";
import { makeFace } from "../core/topology/build";
import { getCornerUV, setCornerUV } from "../core/topology/corners";
import { loopCutQuadRing } from "../ops/loopcut";
import { HEID, VID, FID } from "../core/types";

function findHE(mesh: EditableMesh, from: VID, to: VID): HEID | null {
  const HE = mesh.halfEdges();
  const V = mesh.vertices();
  const start = V[from]!.he; if (start < 0) return null;
  let h = start; const lim = HE.length; let g=0;
  do {
    if (HE[h]!.v === to) return h as HEID;
    const tw = HE[h]!.twin; h = tw >= 0 ? HE[tw]!.next : -1;
  } while (h >= 0 && ++g < lim);
  return null;
}

function snapshotBoundaryUVsByHe(mesh: EditableMesh, f: FID): Map<number, [number, number] | undefined> {
  const HE = mesh.halfEdges(); const face = mesh.faces()[f]!;
  const out = new Map<number, [number, number] | undefined>();
  let h = face.he as number; const start = h; let guard = 0;
  do {
    if (guard++ > HE.length) break;
    out.set(h, getCornerUV(mesh, h as HEID));
    h = HE[h]!.next;
  } while (h !== start);
  return out;
}

describe("loopCutQuadRing UV preservation", () => {
  it("keeps boundary corner UVs unchanged after loop cut across strip", () => {
    const m = new EditableMesh();
    // Create 2x1 strip of quads: three vertical edges
    const v0 = m.addVertex([0,0,0]);
    const v1 = m.addVertex([1,0,0]);
    const v2 = m.addVertex([2,0,0]);
    const v3 = m.addVertex([0,1,0]);
    const v4 = m.addVertex([1,1,0]);
    const v5 = m.addVertex([2,1,0]);

    const f0 = makeFace(m, [v0, v1, v4, v3]) as FID;
    const f1 = makeFace(m, [v1, v2, v5, v4]) as FID;

    // Assign simple grid UVs per quad
    const H = m.halfEdges();
    const setQuadUVs = (f: FID) => {
      const s = m.faces()[f]!.he as HEID;
      const h0 = s; const h1 = H[h0]!.next as HEID; const h2 = H[h1]!.next as HEID; const h3 = H[h2]!.next as HEID;
      setCornerUV(m, h0, [0,0]);
      setCornerUV(m, h1, [1,0]);
      setCornerUV(m, h2, [1,1]);
      setCornerUV(m, h3, [0,1]);
    };
    setQuadUVs(f0); setQuadUVs(f1);

    const before0 = snapshotBoundaryUVsByHe(m, f0);
    const before1 = snapshotBoundaryUVsByHe(m, f1);

    // Start loop cut on vertical ring via edge v1->v4
    const startHE = findHE(m, v1 as VID, v4 as VID)!;
    const res = loopCutQuadRing(m, startHE, 0.5);
    expect(res.verts.length).toBeGreaterThan(0);

    // Verify original boundary half-edges UVs unchanged on both quads
    for (const [he, uv] of before0.entries()) expect(getCornerUV(m, he as HEID)).toEqual(uv);
    for (const [he, uv] of before1.entries()) expect(getCornerUV(m, he as HEID)).toEqual(uv);
  });
});
