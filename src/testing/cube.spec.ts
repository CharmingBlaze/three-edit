import { describe, it, expect } from "vitest";
import { core, ops } from "..";

describe("MeshBuilder + TranslateCommand", () => {
  it("translates two selected verts via history", () => {
    const mesh = new core.topology.EditableMesh();
    core.topology.MeshBuilder.quad(mesh, [-0.5, -0.5, 0], [0.5, -0.5, 0], [0.5, 0.5, 0], [-0.5, 0.5, 0]);

    const selection = core.topology.makeSelection();
    selection.mode = "vertex";
    selection.verts.add(0); selection.verts.add(1);

    const ctx = { mesh } as ops.CommandCtx;
    const hist = new ops.History();
    hist.run(ctx, new ops.TranslateCommand([0,1], [0.2, 0.3, 0]));

    const p0 = mesh.position.get(0);
    const p1 = mesh.position.get(1);
    expect(p0[0]).toBeCloseTo(-0.3);
    expect(p0[1]).toBeCloseTo(-0.2);
    expect(p1[0]).toBeCloseTo(0.7);
    expect(p1[1]).toBeCloseTo(-0.2);

    hist.undo(ctx);
    const p0u = mesh.position.get(0);
    const p1u = mesh.position.get(1);
    expect(p0u[0]).toBeCloseTo(-0.5);
    expect(p1u[0]).toBeCloseTo(0.5);
  });
});
