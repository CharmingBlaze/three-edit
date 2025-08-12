import { describe, it, expect } from "vitest";
import { EditableMesh } from "../core/topology/EditableMesh";
import { makeFace } from "../core/topology/build";
import { loopCutQuadRing } from "../ops/loopcut";
import { HEID, VID } from "../core/types";

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

describe("loopCutQuadRing", () => {
  it("cuts across a 2x1 quad strip", () => {
    const m = new EditableMesh();
    // Build 2 quads in a strip: v0-v1-v2-v3 top, v4-v5-v6-v7 bottom
    const v0 = m.addVertex([0,0,0]);
    const v1 = m.addVertex([1,0,0]);
    const v2 = m.addVertex([2,0,0]);
    const v3 = m.addVertex([3,0,0]);
    const v4 = m.addVertex([0,1,0]);
    const v5 = m.addVertex([1,1,0]);
    const v6 = m.addVertex([2,1,0]);
    const v7 = m.addVertex([3,1,0]);

    // Two quads: (v0,v1,v5,v4) and (v1,v2,v6,v5) and (v2,v3,v7,v6) -> actually make 3 for longer ring
    const f0 = makeFace(m, [v0, v1, v5, v4]);
    const f1 = makeFace(m, [v1, v2, v6, v5]);
    const f2 = makeFace(m, [v2, v3, v7, v6]);

    // Start on an edge crossing the strip direction (vertical edge v1->v5)
    const startHE = findHE(m, v1 as VID, v5 as VID)!;
    const res = loopCutQuadRing(m, startHE, 0.5);
    expect(res.verts.length).toBeGreaterThanOrEqual(2);
    expect(res.faces.length).toBeGreaterThan(0);
  });
});
