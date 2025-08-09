import { EditableMesh } from "../../core/topology/EditableMesh";
import { ScalarAttr } from "../../core/attributes/ScalarAttr";

/** Mark edges as UV seams by setting a per-half-edge scalar attribute `seam` to 1. */
export function markSeams(mesh: EditableMesh, edgeIds: number[] | "all" = "all"): void {
  const HE = mesh.halfEdges();
  const list = edgeIds === "all" ? HE.map((_, i) => i).filter(i => !!HE[i]) : edgeIds;
  let attr = mesh.heAttr.get("seam") as ScalarAttr | undefined;
  if (!attr) { attr = new ScalarAttr(0); mesh.heAttr.set("seam", attr); }
  attr.resize(HE.length);
  for (const he of list) attr.set(he, 1);
}

/** Clear seam marks by setting `seam` to 0 on given edges. */
export function clearSeams(mesh: EditableMesh, edgeIds: number[] | "all" = "all"): void {
  const HE = mesh.halfEdges();
  const list = edgeIds === "all" ? HE.map((_, i) => i).filter(i => !!HE[i]) : edgeIds;
  let attr = mesh.heAttr.get("seam") as ScalarAttr | undefined;
  if (!attr) { attr = new ScalarAttr(0); mesh.heAttr.set("seam", attr); }
  attr.resize(HE.length);
  for (const he of list) attr.set(he, 0);
}
