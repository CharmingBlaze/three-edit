import { describe, it, expect } from "vitest";
import { EditableMesh } from "../core/topology/EditableMesh";
import { makeFace } from "../core/topology/build";
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

describe("knifeAcrossFace", () => {
  it("splits a quad by cutting across two opposite edges", () => {
    const m = new EditableMesh();
    const v0 = m.addVertex([0,0,0]);
    const v1 = m.addVertex([1,0,0]);
    const v2 = m.addVertex([1,1,0]);
    const v3 = m.addVertex([0,1,0]);
    const f = makeFace(m, [v0, v1, v2, v3]) as FID;
    const he01 = findHE(m, v0 as VID, v1 as VID)!;
    const he23 = findHE(m, v2 as VID, v3 as VID)!;
    const res = knifeAcrossFace(m, f, he01, 0.5, he23, 0.5);
    expect(res).not.toBeNull();
    const [fa, fb] = res!.faces;
    expect(m.faces()[fa]).toBeTruthy();
    expect(m.faces()[fb]).toBeTruthy();
  });
});
