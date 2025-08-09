import { describe, it, expect } from "vitest";
import { EditableMesh } from "../core/topology/EditableMesh";
import { makeFace, mergeVertices, collapseEdge } from "../core/topology/build";
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

describe("mergeVertices primitive", () => {
  it("merges two vertices and removes degenerate faces", () => {
    const m = new EditableMesh();
    const v0 = m.addVertex([0,0,0]);
    const v1 = m.addVertex([1,0,0]);
    const v2 = m.addVertex([1,1,0]);
    const v3 = m.addVertex([0,1,0]);
    makeFace(m, [v0, v1, v2, v3]);

    const res = mergeVertices(m, v0 as VID, v1 as VID);
    expect(res.keptVID).toBe(v0);
    // Edge v0->v1 collapses; the original quad becomes degenerate and should be deleted
    let faceCount = 0; for (const f of m.faces()) if (f) faceCount++;
    expect(faceCount).toBe(0);
  });
});

describe("collapseEdge primitive", () => {
  it("collapses an edge to midpoint and updates position", () => {
    const m = new EditableMesh();
    const v0 = m.addVertex([0,0,0]);
    const v1 = m.addVertex([2,0,0]);
    // simple edge as degenerate face workaround: create a 2-edge loop by adding a thin quad
    const v2 = m.addVertex([2,1e-6,0]);
    const v3 = m.addVertex([0,1e-6,0]);
    makeFace(m, [v0, v1, v2, v3]);
    const he = findHE(m, v0 as VID, v1 as VID);
    expect(he).not.toBeNull();
    const res = collapseEdge(m, he!, "mid");
    const kept = res.keptVID as VID;
    const p = m.position.get(kept);
    expect(p[0]).toBeCloseTo(1.0);
    expect(p[1]).toBeCloseTo(0.0);
  });
});
