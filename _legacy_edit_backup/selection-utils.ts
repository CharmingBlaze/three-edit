import { EditableMesh } from "../core/topology/EditableMesh";
import { MeshSelection } from "../core/topology/MeshSelection";

export function collectAffectedVerts(_mesh: EditableMesh, sel: MeshSelection): number[] {
  // For now, just return selected verts; expand for edge/face modes later.
  return Array.from(sel.verts);
}
