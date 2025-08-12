import { describe, it, expect } from "vitest";
import { EditableMesh } from "../core/topology/EditableMesh";
import { makeFace, splitEdge, splitFace } from "../core/topology/build";
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

describe("core topology primitives", () => {
  it("splitEdge on quad creates a new vertex and preserves connectivity", () => {
    const m = new EditableMesh();
    const v0 = m.addVertex([0,0,0]);
    const v1 = m.addVertex([1,0,0]);
    const v2 = m.addVertex([1,1,0]);
    const v3 = m.addVertex([0,1,0]);
    const f = makeFace(m, [v0, v1, v2, v3]);
    const he = findHE(m, v0, v1);
    expect(he).toBeTypeOf("number");
    const nv = splitEdge(m, he!, 0.5);
    expect(nv).toBeTypeOf("number");
    const p = m.position.get(nv);
    expect(p[0]).toBeCloseTo(0.5);
    expect(p[1]).toBeCloseTo(0);
    // New edges should exist: v0->nv and nv->v1
    const heA = findHE(m, v0, nv as VID);
    const heB = findHE(m, nv as VID, v1);
    expect(heA).not.toBeNull();
    expect(heB).not.toBeNull();
  });

  it("splitFace on quad into two quads (via diagonal)", () => {
    const m = new EditableMesh();
    const v0 = m.addVertex([0,0,0]);
    const v1 = m.addVertex([1,0,0]);
    const v2 = m.addVertex([1,1,0]);
    const v3 = m.addVertex([0,1,0]);
    const f = makeFace(m, [v0, v1, v2, v3]);
    const res = splitFace(m, f as FID, [v0, v2]);
    expect(res).not.toBeNull();
    const [f1, f2] = res!.newFaces;
    expect(m.faces()[f1]).toBeTruthy();
    expect(m.faces()[f2]).toBeTruthy();
  });
});
