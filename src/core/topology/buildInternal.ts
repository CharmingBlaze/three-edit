import { EditableMesh } from "./EditableMesh";
import { HEID, VID, FID } from "../types";

/** Utilities internal to core topology primitives. Keep this file small and focused. */

/** Iterate a face's half-edges in order and return the ring as HEIDs. */
export function faceRing(mesh: EditableMesh, f: FID): HEID[] {
  const F = mesh.faces(); const HE = mesh.halfEdges();
  const face = F[f]; if (!face) return [];
  const out: HEID[] = []; const start = face.he; let h = start; let guard = 0;
  do { out.push(h as HEID); h = HE[h]!.next; if (++guard > HE.length) break; } while (h !== start);
  return out;
}

/** Find predecessor (prev) half-edge by walking the face ring. O(n) for robustness. */
export function prevHalfEdge(mesh: EditableMesh, he: HEID): HEID {
  const HE = mesh.halfEdges();
  let cur = he as number; let prev = cur; const limit = HE.length;
  for (let i = 0; i < limit; i++) { const n = HE[cur]!.next; if (n === he) { prev = cur; break; } cur = n; }
  return prev as HEID;
}

/** Get per-corner UV for a half-edge, defaults to [0,0]. */
export function getCornerUV(mesh: EditableMesh, he: HEID): [number, number] {
  const uv = mesh.uv0.get(he) ?? [0, 0];
  return [uv[0] ?? 0, uv[1] ?? 0];
}

/** Set per-corner UV for a half-edge. Ensures attribute capacity. */
export function setCornerUV(mesh: EditableMesh, he: HEID, uv: [number, number]): void {
  mesh.uv0.resize(Math.max(mesh.uv0.size, (he as number) + 1));
  mesh.uv0.set(he, [uv[0] ?? 0, uv[1] ?? 0]);
}

/** Linear interpolate two corner UVs. */
export function lerpUV(a: [number, number], b: [number, number], t: number): [number, number] {
  const s = 1 - t; return [a[0] * s + b[0] * t, a[1] * s + b[1] * t];
}

/** Ensure core attribute domains sized to current counts (no-ops if already sized). */
export function ensureAttributeSizes(mesh: EditableMesh): void {
  const heCount = mesh.halfEdges().length;
  mesh.uv0.resize(heCount);
  // Vertex/face attributes are dynamic via their own layers; keep as-needed.
}

/** Compute Euclidean distance between two vertices. */
export function edgeLen(mesh: EditableMesh, a: VID, b: VID): number {
  const pa = mesh.position.get(a) ?? [0,0,0]; const pb = mesh.position.get(b) ?? [0,0,0];
  const dx = (pa[0] ?? 0) - (pb[0] ?? 0), dy = (pa[1] ?? 0) - (pb[1] ?? 0), dz = (pa[2] ?? 0) - (pb[2] ?? 0);
  return Math.hypot(dx, dy, dz);
}

/** Deterministically choose the best diagonal among candidate VID pairs. */
export function chooseDeterministicDiagonal(mesh: EditableMesh, candidates: Array<[VID, VID]>): [VID, VID] | null {
  if (candidates.length === 0) return null;
  let best: [VID, VID] = candidates[0]!; let bestLen = edgeLen(mesh, best[0], best[1]);
  for (let i = 1; i < candidates.length; i++) {
    const c = candidates[i]!; const len = edgeLen(mesh, c[0], c[1]);
    if (len < bestLen) { best = c; bestLen = len; continue; }
    if (len === bestLen) {
      const [a0, b0] = best; const [a1, b1] = c;
      const key0a = Math.min(a0 as number, b0 as number); const key0b = Math.max(a0 as number, b0 as number);
      const key1a = Math.min(a1 as number, b1 as number); const key1b = Math.max(a1 as number, b1 as number);
      if (key1a < key0a || (key1a === key0a && key1b < key0b)) best = c;
    }
  }
  return best;
}
