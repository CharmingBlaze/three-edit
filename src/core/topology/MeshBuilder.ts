import { EditableMesh } from "./EditableMesh";
export class MeshBuilder {
  static quad(mesh: EditableMesh, a:[number,number,number], b:[number,number,number], c:[number,number,number], d:[number,number,number]){
    const v0=mesh.addVertex(a), v1=mesh.addVertex(b), v2=mesh.addVertex(c), v3=mesh.addVertex(d);
    const f = mesh.addFace([v0,v1,v2,v3]);
    return {face:f, verts:[v0,v1,v2,v3]};
  }
  static cube(mesh: EditableMesh, size=1){
    const s = size * 0.5;
    // 8 corners
    const p000:[number,number,number] = [-s, -s, -s];
    const p100:[number,number,number] = [ s, -s, -s];
    const p110:[number,number,number] = [ s,  s, -s];
    const p010:[number,number,number] = [-s,  s, -s];
    const p001:[number,number,number] = [-s, -s,  s];
    const p101:[number,number,number] = [ s, -s,  s];
    const p111:[number,number,number] = [ s,  s,  s];
    const p011:[number,number,number] = [-s,  s,  s];

    // Faces with CCW winding when looking from outside
    // -Z (back)
    const back = mesh.addFace([
      mesh.addVertex(p000), mesh.addVertex(p100), mesh.addVertex(p110), mesh.addVertex(p010)
    ]);
    // +Z (front)
    const front = mesh.addFace([
      mesh.addVertex(p001), mesh.addVertex(p011), mesh.addVertex(p111), mesh.addVertex(p101)
    ]);
    // -X (left)
    const left = mesh.addFace([
      mesh.addVertex(p000), mesh.addVertex(p010), mesh.addVertex(p011), mesh.addVertex(p001)
    ]);
    // +X (right)
    const right = mesh.addFace([
      mesh.addVertex(p100), mesh.addVertex(p101), mesh.addVertex(p111), mesh.addVertex(p110)
    ]);
    // -Y (bottom)
    const bottom = mesh.addFace([
      mesh.addVertex(p000), mesh.addVertex(p001), mesh.addVertex(p101), mesh.addVertex(p100)
    ]);
    // +Y (top)
    const top = mesh.addFace([
      mesh.addVertex(p010), mesh.addVertex(p110), mesh.addVertex(p111), mesh.addVertex(p011)
    ]);

    return { faces: [back, front, left, right, bottom, top] };
  }
}
