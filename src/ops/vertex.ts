import { EditableMesh } from "../core/topology/EditableMesh";

/** Set a vertex position */
export function setVertexPosition(mesh: EditableMesh, v: number, p: [number, number, number]): void {
  mesh.position.set(v, p);
}

/** Weld vertices by averaging positions (no topological merge). */
export function weldVerticesPositions(mesh: EditableMesh, verts: number[]): void {
  if (verts.length === 0) return;
  let cx = 0, cy = 0, cz = 0;
  for (const v of verts) { const p = mesh.position.get(v) ?? [0,0,0]; cx += p[0]!, cy += p[1]!, cz += p[2]!; }
  const inv = 1 / verts.length;
  const avg:[number,number,number] = [cx*inv, cy*inv, cz*inv];
  for (const v of verts) mesh.position.set(v, avg);
}

/** Translate a set of vertices by delta */
export function translateVertices(mesh: EditableMesh, verts: number[], delta: [number, number, number]): void {
  const [dx, dy, dz] = delta;
  for (const v of verts) {
    const p = mesh.position.get(v)!;
    mesh.position.set(v, [p[0]! + dx, p[1]! + dy, p[2]! + dz]);
  }
}

/** Compute an average vertex normal from adjacent faces (geometric, unnormalized weights). */
export function computeVertexNormal(mesh: EditableMesh, v: number): [number, number, number] {
  const HE = mesh.halfEdges();
  const V = mesh.vertices();
  const startHe = V[v]?.he ?? -1;
  if (startHe < 0) return [0, 0, 1];
  let he = startHe;
  let nx = 0, ny = 0, nz = 0;
  const visited = new Set<number>();
  // Walk around the one-ring: ... twin -> next -> twin -> next ...
  for (let iter = 0; iter < HE.length; iter++) {
    if (visited.has(he)) break;
    visited.add(he);
    const face = HE[he]!.face;
    if (face >= 0) {
      const n = computeFaceNormal(mesh, face);
      nx += n[0]!; ny += n[1]!; nz += n[2]!;
    }
    const tw = HE[he]!.twin;
    if (tw < 0) break; // boundary
    he = HE[tw]!.next;
    if (he === startHe) break;
  }
  const len = Math.hypot(nx, ny, nz) || 1;
  return [nx / len, ny / len, nz / len];
}

/** Compute polygon face normal using Newell's method. Exported for reuse. */
export function computeFaceNormal(mesh: EditableMesh, f: number): [number, number, number] {
  const HE = mesh.halfEdges();
  const face = mesh.faces()[f]!;
  let he = face.he; const start = he;
  let nx = 0, ny = 0, nz = 0;
  let px = 0, py = 0, pz = 0;
  do {
    const v = HE[he]!.v; const p = mesh.position.get(v)!;
    const next = HE[he]!.next; const vn = HE[next]!.v; const pn = mesh.position.get(vn)!;
    nx += (p[1]! - pn[1]!) * (p[2]! + pn[2]!);
    ny += (p[2]! - pn[2]!) * (p[0]! + pn[0]!);
    nz += (p[0]! - pn[0]!) * (p[1]! + pn[1]!);
    px += p[0]!; py += p[1]!; pz += p[2]!;
    he = next;
  } while (he !== start);
  const len = Math.hypot(nx, ny, nz) || 1;
  return [nx / len, ny / len, nz / len];
}
