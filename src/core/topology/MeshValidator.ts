import { EditableMesh } from "./EditableMesh";

export function validateMesh(_mesh: EditableMesh): void {
  // Minimal checks; expand in dev builds.
  // - halfEdge.next cycles
  // - twins are symmetric
  // - face.he and vertex.he are valid
  // Throw errors if invalid.
}
