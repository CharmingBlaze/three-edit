import { describe, it, expect } from "vitest";
import { EditableMesh } from "../core/topology/EditableMesh";
import { makeFace } from "../core/topology/build";
import { ExtrudeFacesCommand } from "../ops/extrude";
import { ScalarAttr } from "../core/attributes/ScalarAttr";
import { HEID, FID } from "../core/types";
import { setCornerUV, getCornerUV } from "../core/topology/corners";

function countFaces(m: EditableMesh): number { return m.faces().filter(Boolean).length; }

function walkFaceHes(mesh: EditableMesh, f: FID): HEID[] {
  const HE = mesh.halfEdges(); const face = mesh.faces()[f]!; const out: HEID[] = [];
  let h = face.he as HEID; const start = h; let guard = 0;
  do { if (guard++ > HE.length) break; out.push(h); h = HE[h]!.next as HEID; } while (h !== start);
  return out;
}

describe("ExtrudeFacesCommand attributes", () => {
  it("propagates material to new faces and sets UVs on sides and cap", () => {
    const m = new EditableMesh();
    const v0 = m.addVertex([0,0,0]);
    const v1 = m.addVertex([1,0,0]);
    const v2 = m.addVertex([1,1,0]);
    const v3 = m.addVertex([0,1,0]);
    const f = makeFace(m, [v0, v1, v2, v3]);

    // Material on original face
    let mat = m.faceAttr.get("material") as ScalarAttr | undefined;
    if (!mat) { mat = new ScalarAttr(0); m.faceAttr.set("material", mat); }
    mat.resize(f + 1); mat.set(f, 5);

    // UVs on original corners
    const HE = m.halfEdges(); const s = m.faces()[f]!.he as HEID;
    const h0 = s; const h1 = HE[h0]!.next as HEID; const h2 = HE[h1]!.next as HEID; const h3 = HE[h2]!.next as HEID;
    setCornerUV(m, h0, [0,0]); setCornerUV(m, h1, [1,0]); setCornerUV(m, h2, [1,1]); setCornerUV(m, h3, [0,1]);

    const beforeCount = countFaces(m);
    const cmd = new ExtrudeFacesCommand([f], 1.0);
    cmd.do({ mesh: m });

    const afterFaces = m.faces();
    const newFaces: FID[] = [];
    for (let i=0;i<afterFaces.length;i++) {
      const face = afterFaces[i]; if (!face) continue;
      // consider face new if any vertex has z>0
      let anyRaised = false; const HEA = m.halfEdges(); let h = face.he as number; const start = h; let guard = 0;
      do { if (guard++ > HEA.length) break; const v = HEA[h]!.v; const p = m.position.get(v)!; if ((p[2] ?? 0) > 0) { anyRaised = true; }
        h = HEA[h]!.next; } while (h !== start);
      if (anyRaised) newFaces.push(i as FID);
    }

    // All new faces should carry material 5
    const matAfter = m.faceAttr.get("material") as ScalarAttr | undefined;
    expect(matAfter).toBeTruthy();
    for (const nf of newFaces) {
      expect(matAfter!.get(nf)).toBe(5);
    }

    // Find a side face: exactly 2 raised and 2 base vertices
    const pickSide = newFaces.find((fid) => {
      const hes = walkFaceHes(m, fid); let raised = 0; for (const he of hes) { const v = m.halfEdges()[he]!.v; const z = m.position.get(v)![2] ?? 0; if (z > 0) raised++; }
      return hes.length === 4 && raised === 2;
    });
    expect(pickSide).toBeDefined();

    // On side face, UVs should be defined and matching along vertical pairs (copied bottom->top)
    if (pickSide != null) {
      const hes = walkFaceHes(m, pickSide);
      const uvs = hes.map((he) => getCornerUV(m, he));
      for (const uv of uvs) expect(uv).toBeTruthy();
      // Compare opposite edges: (h0,h1) bottom, (h3,h2) top in makeFace order
      const bottom0 = uvs[0]!; const bottom1 = uvs[1]!; const top1 = uvs[2]!; const top0 = uvs[3]!;
      expect(bottom0).toEqual(top0);
      expect(bottom1).toEqual(top1);
    }

    // Cap face: all vertices raised
    const cap = newFaces.find((fid) => {
      const hes = walkFaceHes(m, fid); return hes.every((he) => (m.position.get(m.halfEdges()[he]!.v)![2] ?? 0) > 0);
    });
    expect(cap).toBeDefined();
    if (cap != null) {
      // All UVs defined on cap
      const hes = walkFaceHes(m, cap);
      for (const he of hes) expect(getCornerUV(m, he)).toBeTruthy();
    }
  });
});
