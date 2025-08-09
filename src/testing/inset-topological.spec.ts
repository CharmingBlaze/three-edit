import { describe, it, expect } from "vitest";
import { EditableMesh } from "../core/topology/EditableMesh";
import { makeFace } from "../core/topology/build";
import { setCornerUV, getCornerUV } from "../core/topology/corners";
import { ScalarAttr } from "../core/attributes/ScalarAttr";
import { insetFacesTopological } from "../ops/inset";
import { HEID, FID } from "../core/types";

function walkFaceHes(mesh: EditableMesh, f: FID): HEID[] {
  const HE = mesh.halfEdges(); const face = mesh.faces()[f]!; const out: HEID[] = [];
  let h = face.he as HEID; const start = h; let guard = 0;
  do { if (guard++ > HE.length) break; out.push(h); h = HE[h]!.next as HEID; } while (h !== start);
  return out;
}
function faceVertices(mesh: EditableMesh, f: FID): number[] {
  const HE = mesh.halfEdges();
  return walkFaceHes(mesh, f).map(h => HE[h]!.v);
}

describe("insetFacesTopological", () => {
  it("creates rim quads and cap, preserving UVs and materials on a quad", () => {
    const m = new EditableMesh();
    const v0 = m.addVertex([0,0,0]); const v1 = m.addVertex([1,0,0]);
    const v2 = m.addVertex([1,1,0]); const v3 = m.addVertex([0,1,0]);
    const f = makeFace(m, [v0, v1, v2, v3]);

    // Set material on original face
    let mat = m.faceAttr.get("material") as ScalarAttr | undefined;
    if (!mat) { mat = new ScalarAttr(0); m.faceAttr.set("material", mat); }
    mat.resize(f + 1); mat.set(f, 7);

    // Set UVs on original corners in CCW order
    const HE = m.halfEdges(); const s = m.faces()[f]!.he as HEID;
    const h0 = s; const h1 = HE[h0]!.next as HEID; const h2 = HE[h1]!.next as HEID; const h3 = HE[h2]!.next as HEID;
    setCornerUV(m, h0, [0,0]); setCornerUV(m, h1, [1,0]); setCornerUV(m, h2, [1,1]); setCornerUV(m, h3, [0,1]);

    const created = insetFacesTopological(m, [f], 0.8);
    expect(created.length).toBe(5); // 4 rim + 1 cap

    // Cap face: the only created face that contains none of the original boundary vertices
    const originalVs = new Set([v0, v1, v2, v3]);
    const capFace = created.find(fid => faceVertices(m, fid).every(v => !originalVs.has(v)));
    expect(capFace).toBeDefined();

    // Cap UVs should match original corners (ignore starting index and orientation)
    if (capFace != null) {
      const hes = walkFaceHes(m, capFace);
      const uvCap = hes.map(he => getCornerUV(m, he));
      const target: ([number,number]|undefined)[] = [[0,0],[1,0],[1,1],[0,1]];
      const containsAll = (arr: ([number,number]|undefined)[], exp: ([number,number]|undefined)[]) => {
        if (arr.length !== exp.length) return false;
        const rem = arr.slice();
        const take = (uv?: [number,number]) => {
          const idx = rem.findIndex(x => x && uv && x[0] === uv[0] && x[1] === uv[1]);
          if (idx >= 0) { rem.splice(idx,1); return true; }
          return false;
        };
        for (const uv of exp as [number,number][]) if (!take(uv)) return false;
        return rem.length === 0;
      };
      expect(containsAll(uvCap, target)).toBe(true);
    }

    // All created faces should have material=7
    const matAfter = m.faceAttr.get("material") as ScalarAttr | undefined; expect(matAfter).toBeTruthy();
    for (const nf of created) expect(matAfter!.get(nf)).toBe(7);

    // Check one rim face UV mapping consistency
    const rim = created.find(fid => fid !== capFace)!; expect(rim).toBeDefined();
    const rimHes = walkFaceHes(m, rim);
    const rimUVs = rimHes.map(h => getCornerUV(m, h));
    const has00 = rimUVs.some(u => u && u[0] === 0 && u[1] === 0);
    const has10 = rimUVs.some(u => u && u[0] === 1 && u[1] === 0);
    expect(has00 && has10).toBe(true);
  });
});
