import { EditableMesh } from "../core/topology/EditableMesh";
import { FID } from "../core/types";

export type CatmullClarkOptions = {
  levels?: number;
  preserveBoundary?: boolean;
};

/**
 * Catmull–Clark subdivision (placeholder).
 * Throws a clear error until the robust implementation is delivered.
 */
export function catmullClark(mesh: EditableMesh, faces: FID[] | "all" = "all", opts: CatmullClarkOptions = {}): never {
  throw new Error("Catmull–Clark subdivision is not implemented yet. This operation is planned and will include proper attribute (UV/material) propagation and topology-safe remeshing.");
}
