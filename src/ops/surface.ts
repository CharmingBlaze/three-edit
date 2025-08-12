import { EditableMesh } from "../core/topology/EditableMesh";
import { ScalarAttr } from "../core/attributes/ScalarAttr";

export type Axis = "x" | "y" | "z";

/** Set per-face material index */
export function setMaterial(mesh: EditableMesh, faces: number[] | "all", materialIndex: number): void {
  const list = faces === "all" ? mesh.faces().map((_, i) => i).filter(f => !!mesh.faces()[f]) : faces;
  let attr = mesh.faceAttr.get("material") as ScalarAttr | undefined;
  if (!attr) { attr = new ScalarAttr(0); mesh.faceAttr.set("material", attr); }
  for (const f of list) { attr.resize(f + 1); attr.set(f, materialIndex); }
}

/** Mark faces for smooth shading (0) */
export function setToSmooth(mesh: EditableMesh, faces: number[] | "all" = "all"): void {
  const list = faces === "all" ? mesh.faces().map((_, i) => i).filter(f => !!mesh.faces()[f]) : faces;
  let attr = mesh.faceAttr.get("shading") as ScalarAttr | undefined;
  if (!attr) { attr = new ScalarAttr(0); mesh.faceAttr.set("shading", attr); }
  for (const f of list) { attr.resize(f + 1); attr.set(f, 0); }
}

/** Mark faces for flat shading (1) */
export function setToFlat(mesh: EditableMesh, faces: number[] | "all" = "all"): void {
  const list = faces === "all" ? mesh.faces().map((_, i) => i).filter(f => !!mesh.faces()[f]) : faces;
  let attr = mesh.faceAttr.get("shading") as ScalarAttr | undefined;
  if (!attr) { attr = new ScalarAttr(0); mesh.faceAttr.set("shading", attr); }
  for (const f of list) { attr.resize(f + 1); attr.set(f, 1); }
}

/** Simple planar UV projection along an axis. scale and offset apply in UV space. */
export function uvPlanar(mesh: EditableMesh, faces: number[] | "all" = "all", axis: Axis = "z", scale: [number, number] = [1,1], offset: [number, number] = [0,0]): void {
  const list = faces === "all" ? mesh.faces().map((_, i) => i).filter(f => !!mesh.faces()[f]) : faces;
  const facesArr = mesh.faces(); const hes = mesh.halfEdges();
  for (const f of list) {
    const face = facesArr[f]!; let he = face.he; const start = he;
    do {
      const v = hes[he]!.v; const p = mesh.position.get(v)!;
      let u = 0, v2 = 0;
      if (axis === "z") { u = p[0]!; v2 = p[1]!; }
      else if (axis === "y") { u = p[0]!; v2 = p[2]!; }
      else { u = p[1]!; v2 = p[2]!; }
      mesh.uv0.set(he, [u * scale[0] + offset[0], v2 * scale[1] + offset[1]]);
      he = hes[he]!.next;
    } while (he !== start);
  }
}

/** Geometric inset: move each face's vertices toward its centroid by insetScale. No rim creation. */
export function insetFaces(mesh: EditableMesh, faces: number[] | "all" = "all", insetScale = 0.9): void {
  const list = faces === "all" ? mesh.faces().map((_, i) => i).filter(f => !!mesh.faces()[f]) : faces;
  const facesArr = mesh.faces(); const hes = mesh.halfEdges();
  for (const f of list) {
    const face = facesArr[f]!; const verts: number[] = [];
    let he = face.he; const start = he; let cx = 0, cy = 0, cz = 0, n = 0;
    do {
      const v = hes[he]!.v; verts.push(v);
      const p = mesh.position.get(v)!; cx += p[0]!; cy += p[1]!; cz += p[2]!; n++; he = hes[he]!.next;
    } while (he !== start);
    if (n === 0) continue; const c: [number, number, number] = [cx / n, cy / n, cz / n];
    for (const v of verts) {
      const p = mesh.position.get(v)!;
      const nx = c[0]! + (p[0]! - c[0]!) * insetScale;
      const ny = c[1]! + (p[1]! - c[1]!) * insetScale;
      const nz = c[2]! + (p[2]! - c[2]!) * insetScale;
      mesh.position.set(v, [nx, ny, nz]);
    }
  }
}
