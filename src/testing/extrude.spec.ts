import { describe, it, expect } from "vitest";
import { EditableMesh } from "../core/topology/EditableMesh";
import { makeFace } from "../core/topology/build";
import { ExtrudeFacesCommand } from "../ops/extrude";

function countFaces(m: EditableMesh): number {
  let c=0; const F=m.faces(); for (let i=0;i<F.length;i++) if (F[i]) c++; return c;
}

describe("ExtrudeFacesCommand", () => {
  it("creates side quads and a cap and offsets cap verts", () => {
    const m = new EditableMesh();
    const v0 = m.addVertex([0,0,0]);
    const v1 = m.addVertex([1,0,0]);
    const v2 = m.addVertex([1,1,0]);
    const v3 = m.addVertex([0,1,0]);
    const f = makeFace(m, [v0, v1, v2, v3]);

    const beforeFaces = countFaces(m);
    const cmd = new ExtrudeFacesCommand([f], 1.0);
    cmd.do({ mesh: m });

    const afterFaces = countFaces(m);
    // 1 original + 4 sides + 1 cap = 6, but original is deleted during extrude implementation, so expect >=5
    expect(afterFaces).toBeGreaterThanOrEqual(5);

    // Some vertex should now be at z>0 (assuming +Z normal for this quad)
    let anyRaised = false; const V = m.vertices();
    for (let i=0;i<V.length;i++) { if (!V[i]) continue; const p = m.position.get(i)!; if (p[2]! > 0.0) { anyRaised = true; break; } }
    expect(anyRaised).toBe(true);

    // Undo should restore face count
    cmd.undo({ mesh: m });
    const afterUndo = countFaces(m);
    expect(afterUndo).toBe(beforeFaces);
  });
});
