import { describe, it, expect } from "vitest";
import { core, io } from "..";
import { ScalarAttr } from "../core/attributes/ScalarAttr";

function makeTwoTriMesh(): core.topology.EditableMesh {
  const m = new core.topology.EditableMesh();
  const v0 = m.addVertex([0,0,0]);
  const v1 = m.addVertex([1,0,0]);
  const v2 = m.addVertex([0,1,0]);
  const v3 = m.addVertex([1,1,0]);
  const f0 = m.addFace([v0,v1,v2]);
  const f1 = m.addFace([v1,v3,v2]);
  // assign simple per-corner uvs
  const faces = m.faces(); const hes = m.halfEdges();
  let he = faces[f0]!.he; m.uv0.set(he,[0,0]); he=hes[he]!.next; m.uv0.set(he,[1,0]); he=hes[he]!.next; m.uv0.set(he,[0,1]);
  he = faces[f1]!.he; m.uv0.set(he,[1,0]); he=hes[he]!.next; m.uv0.set(he,[1,1]); he=hes[he]!.next; m.uv0.set(he,[0,1]);
  // materials per face
  const mat = new ScalarAttr(0);
  mat.resize(Math.max(f0,f1)+1);
  mat.set(f0, 0); mat.set(f1, 1);
  m.faceAttr.set("material", mat);
  return m;
}

describe("OBJ + MTL", () => {
  it("exporter emits mtllib and usemtl", () => {
    const mesh = makeTwoTriMesh();
    const obj = io.export_.obj.exportOBJ(mesh, { mtlFileName: "model.mtl" });
    expect(obj).toContain("usemtl mat_0");
    expect(obj).toContain("usemtl mat_1");
    const mtl = io.export_.mtl.exportMTL(mesh);
    expect(mtl).toContain("newmtl mat_0");
    expect(mtl).toContain("newmtl mat_1");
  });

  it("importer parses usemtl and assigns face.material", () => {
    const src = [
      "mtllib x.mtl",
      "v 0 0 0",
      "v 1 0 0",
      "v 0 1 0",
      "vt 0 0",
      "vt 1 0",
      "vt 0 1",
      "usemtl red",
      "f 1/1 2/2 3/3",
    ].join("\n");
    const mesh = io.import_.importOBJ(src);
    expect(mesh.faceCount()).toBe(1);
    const matAttr = mesh.faceAttr.get("material") as ScalarAttr | undefined;
    expect(matAttr).toBeTruthy();
    const mat = matAttr!.get(0);
    expect(typeof mat).toBe("number");
  });
});
