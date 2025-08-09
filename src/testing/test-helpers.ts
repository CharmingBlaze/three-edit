import { EditableMesh } from "../core/topology/EditableMesh";
import { MeshBuilder } from "../core/topology/MeshBuilder";

export function makeQuad(size = 1) {
  const mesh = new EditableMesh();
  const s = size * 0.5;
  MeshBuilder.quad(mesh, [-s, -s, 0], [s, -s, 0], [s, s, 0], [-s, s, 0]);
  return mesh;
}
