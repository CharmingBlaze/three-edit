import { EditableMesh } from "../core/topology/EditableMesh";
import { ScalarAttr } from "../core/attributes/ScalarAttr";
import { deleteFaces as coreDeleteFaces, makeFace } from "../core/topology/build";
import { facesToBoundaryLoops } from "../core/topology/loops";
import { HEID } from "../core/types";

export function faceCentroid(mesh: EditableMesh, f: number): [number, number, number] {
  const faces = mesh.faces(); const hes = mesh.halfEdges();
  const face = faces[f]!; let he = face.he; const start = he;
  let cx = 0, cy = 0, cz = 0, n = 0;
  do { const v = hes[he]!.v; const p = mesh.position.get(v)!; cx += p[0]!, cy += p[1]!, cz += p[2]!, n++; he = hes[he]!.next; } while (he !== start);
  if (n === 0) return [0,0,0];
  return [cx / n, cy / n, cz / n];
}

export function faceArea(mesh: EditableMesh, f: number): number {
  // Fan triangulate around centroid for area approximation
  const faces = mesh.faces(); const hes = mesh.halfEdges();
  const face = faces[f]!; let he = face.he; const start = he;
  const verts: number[] = [];
  do { verts.push(hes[he]!.v); he = hes[he]!.next; } while (he !== start);
  let area = 0;
  const p0 = mesh.position.get(verts[0]!)!;
  for (let i = 1; i + 1 < verts.length; i++) {
    const p1 = mesh.position.get(verts[i]!)!;
    const p2 = mesh.position.get(verts[i+1]!)!;
    const ux = p1[0]! - p0[0]!; const uy = p1[1]! - p0[1]!; const uz = p1[2]! - p0[2]!;
    const vx = p2[0]! - p0[0]!; const vy = p2[1]! - p0[1]!; const vz = p2[2]! - p0[2]!;
    const cx = uy*vz - uz*vy; const cy = uz*vx - ux*vz; const cz = ux*vy - uy*vx;
    area += 0.5 * Math.hypot(cx, cy, cz);
  }
  return area;
}

/** Delete a list of faces using core topology helper. */
export function deleteFaces(mesh: EditableMesh, faces: number[]): void {
  if (faces.length === 0) return;
  coreDeleteFaces(mesh, faces as any);
}

/** Dissolve faces behaves as delete in MVP (removes faces, keeps boundary half-edges). */
export function dissolveFaces(mesh: EditableMesh, faces: number[]): void {
  deleteFaces(mesh, faces);
}

/**
 * Merge a set of adjacent faces into a single n-gon if they form exactly one simple outer boundary loop.
 * Preserves per-corner UVs for the new boundary.
 * Returns the new face id or null if merge conditions are not met.
 */
export function mergeFacesToNgon(mesh: EditableMesh, faces: number[]): number | null {
  if (faces.length === 0) return null;
  const loops = facesToBoundaryLoops(mesh, new Set(faces));
  if (loops.length !== 1) return null; // cannot represent holes with single n-gon in our addFace
  const HE = mesh.halfEdges();
  const boundary: HEID[] = loops[0]!;
  // Build vertex ring from boundary half-edges order (take to-vertex)
  const ring = boundary.map(h => HE[h]!.v);
  const newF = makeFace(mesh, ring as number[] as any);
  // Copy per-corner UVs from boundary half-edges to new face's corners in order
  const F = mesh.faces(); const newFace = F[newF]!; let h = newFace.he; const start = h;
  for (let i = 0; i < boundary.length; i++) {
    const src = boundary[i]!; const uv = mesh.uv0.get(src) ?? [0,0];
    mesh.uv0.set(h, [uv[0]!, uv[1]!]);
    h = HE[h]!.next; if (h === start) break;
  }
  // Delete original faces
  coreDeleteFaces(mesh, faces as any);
  return newF;
}

/** Translate all unique vertices belonging to faces by delta. */
export function translateFaces(mesh: EditableMesh, faces: number[] | "all", delta: [number, number, number]): void {
  const [dx, dy, dz] = delta; const facesArr = mesh.faces(); const hes = mesh.halfEdges();
  const list = faces === "all" ? facesArr.map((_, i) => i).filter(i => !!facesArr[i]) : faces;
  const V = new Set<number>();
  for (const f of list) { let he = facesArr[f]!.he; const start = he; do { V.add(hes[he]!.v); he = hes[he]!.next; } while (he !== start); }
  for (const v of V) { const p = mesh.position.get(v)!; mesh.position.set(v, [p[0]!+dx, p[1]!+dy, p[2]!+dz]); }
}

/** Set generic per-face scalar attribute */
export function setFaceScalar(mesh: EditableMesh, key: string, faces: number[] | "all", value: number): void {
  const facesArr = mesh.faces(); const list = faces === "all" ? facesArr.map((_, i) => i).filter(i => !!facesArr[i]) : faces;
  let attr = mesh.faceAttr.get(key) as ScalarAttr | undefined; if (!attr) { attr = new ScalarAttr(0); mesh.faceAttr.set(key, attr); }
  for (const f of list) { attr.resize(f + 1); attr.set(f, value); }
}
