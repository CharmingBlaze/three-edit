import { EditableMesh } from "../core/topology/EditableMesh";
import { ScalarAttr } from "../core/attributes/ScalarAttr";
import { Vec3Attr } from "../core/attributes/Vec3Attr";

/** Compute and store per-face normals using Newell's method into faceAttr['normal'] (Vec3Attr). */
export function computeFaceNormals(mesh: EditableMesh, faces: number[] | "all" = "all"): void {
  const F = mesh.faces(); const HE = mesh.halfEdges();
  const list = faces === "all" ? F.map((_, i) => i).filter(i => !!F[i]) : faces;
  let attr = mesh.faceAttr.get("normal") as Vec3Attr | undefined; if (!attr) { attr = new Vec3Attr(); mesh.faceAttr.set("normal", attr); }
  for (const f of list) {
    const face = F[f]!; let h = face.he; const start = h; let nx = 0, ny = 0, nz = 0; let guard = 0;
    do {
      const v = HE[h]!.v; const p = mesh.position.get(v)!; const n = HE[h]!.next; const v2 = HE[n]!.v; const q = mesh.position.get(v2)!;
      nx += (p[1]! - q[1]!) * (p[2]! + q[2]!);
      ny += (p[2]! - q[2]!) * (p[0]! + q[0]!);
      nz += (p[0]! - q[0]!) * (p[1]! + q[1]!);
      h = n;
      if (++guard > HE.length) break;
    } while (h !== start);
    const len = Math.hypot(nx, ny, nz) || 1;
    attr.resize(f + 1); attr.set(f, [nx / len, ny / len, nz / len]);
  }
}

/** Compute vertex normals by averaging adjacent face normals (requires face normals). Writes into mesh.normal (Vec3Attr). */
export function computeVertexNormals(mesh: EditableMesh): void {
  const V = mesh.vertices(); const HE = mesh.halfEdges(); const F = mesh.faces();
  let faceNormals = mesh.faceAttr.get("normal") as Vec3Attr | undefined;
  if (!faceNormals) { computeFaceNormals(mesh, "all"); faceNormals = mesh.faceAttr.get("normal") as Vec3Attr; }
  for (let v = 0; v < V.length; v++) {
    if (!V[v]) continue; const start = V[v]!.he; if (start < 0) { mesh.normal.set(v, [0,0,1]); continue; }
    let nx = 0, ny = 0, nz = 0; let h = start; const visited = new Set<number>(); let guard = 0;
    while (!visited.has(h) && guard++ < HE.length) {
      visited.add(h);
      const f = HE[h]!.face; if (f >= 0 && F[f]) { const fn = faceNormals.get(f) ?? [0,0,1]; nx += fn[0]!, ny += fn[1]!, nz += fn[2]!; }
      const tw = HE[h]!.twin; if (tw < 0) break; h = HE[tw]!.next;
    }
    const len = Math.hypot(nx, ny, nz) || 1; mesh.normal.set(v, [nx / len, ny / len, nz / len]);
  }
}
