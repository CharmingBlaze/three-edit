import { describe, it, expect } from "vitest";
import { core, io } from "..";

function makeQuad(): core.topology.EditableMesh {
  const mesh = new core.topology.EditableMesh();
  const a = mesh.addVertex([-0.5, -0.5, 0]);
  const b = mesh.addVertex([ 0.5, -0.5, 0]);
  const c = mesh.addVertex([ 0.5,  0.5, 0]);
  const d = mesh.addVertex([-0.5,  0.5, 0]);
  const f = mesh.addFace([a, b, c, d]);
  // set simple uv per corner
  const faces = mesh.faces();
  const hes = mesh.halfEdges();
  let he = faces[f]!.he;
  const uvs: [number, number][] = [[0,0],[1,0],[1,1],[0,1]];
  for (let i=0;i<4;i++) { mesh.uv0.set(he, uvs[i]!); he = hes[he]!.next; }
  return mesh;
}

describe("OBJ import/export", () => {
  it("exports OBJ with v/vt/f and roundtrips via import", () => {
    const mesh = makeQuad();
    const text = io.export_.obj.exportOBJ(mesh);
    expect(text).toContain("\nv ");
    expect(text).toContain("\nvt ");
    expect(text).toMatch(/\nf [^\n]+/);

    const m2 = io.import_.importOBJ(text);
    expect(m2.vertexCount()).toBeGreaterThan(0);
    expect(m2.faceCount()).toBeGreaterThan(0);
    // spot-check a uv exists
    const faces = m2.faces();
    const hes = m2.halfEdges();
    const anyFace = faces.find(f=>!!f);
    expect(anyFace).toBeTruthy();
    if (anyFace) {
      let he = anyFace.he;
      const uv = m2.uv0.get(he);
      expect(uv).toBeTruthy();
    }
  });
});
