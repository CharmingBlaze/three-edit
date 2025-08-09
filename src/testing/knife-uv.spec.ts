import { describe, it, expect } from "vitest";
import { EditableMesh } from "../core/topology/EditableMesh";
import { makeFace } from "../core/topology/build";
import { getCornerUV, setCornerUV } from "../core/topology/corners";
import { knifeAcrossFace } from "../ops/knife";
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

describe("knifeAcrossFace UV preservation", () => {
  it("keeps boundary corner UVs unchanged after cut", () => {
    const m = new EditableMesh();
    const v0 = m.addVertex([0,0,0]);
    const v1 = m.addVertex([1,0,0]);
    const v2 = m.addVertex([1,1,0]);
    const v3 = m.addVertex([0,1,0]);
    const f = makeFace(m, [v0, v1, v2, v3]) as FID;

    // Assign quad UVs in CCW order (0,0),(1,0),(1,1),(0,1)
    const HE = m.halfEdges(); const start = m.faces()[f]!.he as HEID;
    const h0 = start; const h1 = HE[h0]!.next as HEID; const h2 = HE[h1]!.next as HEID; const h3 = HE[h2]!.next as HEID;
    setCornerUV(m, h0, [0,0]);
    setCornerUV(m, h1, [1,0]);
    setCornerUV(m, h2, [1,1]);
    setCornerUV(m, h3, [0,1]);

    const before = snapshotBoundaryUVsByHe(m, f);

    const he01 = findHE(m, v0 as VID, v1 as VID)!;
    const he23 = findHE(m, v2 as VID, v3 as VID)!;
    const res = knifeAcrossFace(m, f, he01, 0.5, he23, 0.5)!;
    expect(res).toBeTruthy();

    // After split, boundary half-edges remain the same objects; verify UVs on same half-edge ids
    for (const [he, uv] of before.entries()) {
      expect(getCornerUV(m, he as HEID)).toEqual(uv);
    }
  });
});
