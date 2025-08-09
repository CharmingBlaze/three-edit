import { describe, it, expect } from "vitest";
import { EditableMesh } from "../core/topology/EditableMesh";
import { makeSelection } from "../core/topology/MeshSelection";
import { resolveVertsForEdit } from "../edit/SelectionResolve";
import { makeTranslateFromSelection } from "../ops/transforms";
import { buildPrimitive } from "../io/three/primitives";

describe("Selection resolver", () => {
  it("expands vertex selection across coincident positions", () => {
    const mesh = new EditableMesh();
    const v0 = mesh.addVertex([0,0,0]);
    const v1 = mesh.addVertex([0,0,0]); // coincident

    const sel = makeSelection();
    sel.mode = "vertex";
    sel.verts.add(v0);

    const verts = resolveVertsForEdit(mesh, sel, {
      mode: "vertex",
      linkAcross: { coincidentPosition: true, uvSeam: false, sharpNormal: false, materialBoundary: false },
      positionEps: 1e-8,
    });

    expect(new Set(verts)).toEqual(new Set([v0, v1]));

    // Now move using command helper and ensure both positions moved
    const cmd = makeTranslateFromSelection(mesh, sel, [1,2,3], {
      mode: "vertex",
      linkAcross: { coincidentPosition: true, uvSeam: false, sharpNormal: false, materialBoundary: false },
      positionEps: 1e-8,
    });
    cmd.do({ mesh });

    expect(mesh.position.get(v0)).toEqual([1,2,3]);
    expect(mesh.position.get(v1)).toEqual([1,2,3]);

    cmd.undo({ mesh });
    expect(mesh.position.get(v0)).toEqual([0,0,0]);
    expect(mesh.position.get(v1)).toEqual([0,0,0]);
  });
});

describe("Three primitives adapter", () => {
  it("builds a box mesh with faces", () => {
    const mesh = buildPrimitive({ kind: "box", size: [1,1,1], segments: [1,1,1] });
    const F = mesh.faces();
    // Should have some faces created from BoxGeometry triangles
    let count = 0; for (let i=0;i<F.length;i++) if (F[i]) count++;
    expect(count).toBeGreaterThan(0);
  });
});
