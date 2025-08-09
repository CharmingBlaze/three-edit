import { describe, it, expect } from "vitest";
import { EditableMesh } from "../core/topology/EditableMesh";
import { makeFace } from "../core/topology/build";
import { slideAlongEdges } from "../ops/slide";
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

describe("slideAlongEdges", () => {
  it("moves origin vertex towards head without changing face count", () => {
    const m = new EditableMesh();
    const v0 = m.addVertex([0,0,0]);
    const v1 = m.addVertex([1,0,0]);
    const v2 = m.addVertex([1,1,0]);
    const v3 = m.addVertex([0,1,0]);
    makeFace(m, [v0, v1, v2, v3]);

    const he = findHE(m, v1 as VID, v2 as VID)!; // edge v1->v2, origin is prev(he).v = v1
    const beforeFaceCount = m.faces().filter(Boolean).length;
    const beforeV1 = m.position.get(v1)!;

    slideAlongEdges(m, [he], 0.5);

    const afterV1 = m.position.get(v1)!;
    expect(afterV1[1]).toBeGreaterThan(beforeV1[1]!); // moved towards v2 along +y
    const afterFaceCount = m.faces().filter(Boolean).length;
    expect(afterFaceCount).toBe(beforeFaceCount);
  });
});
