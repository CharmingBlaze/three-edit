import { EditableMesh } from "./EditableMesh";
import { VID } from "../types";

function quantize(x: number, eps: number): number { return Math.round(x / eps); }

/** Hash a 3D point into a grid key with cell size eps. */
function hashKey(p: [number, number, number], eps: number): string {
  return `${quantize(p[0] ?? 0, eps)}|${quantize(p[1] ?? 0, eps)}|${quantize(p[2] ?? 0, eps)}`;
}

/** Returns squared distance between two points. */
function dist2(a: [number, number, number], b: [number, number, number]): number {
  const dx = (a[0] ?? 0) - (b[0] ?? 0);
  const dy = (a[1] ?? 0) - (b[1] ?? 0);
  const dz = (a[2] ?? 0) - (b[2] ?? 0);
  return dx*dx + dy*dy + dz*dz;
}

/**
 * Build clusters of vertices that share nearly identical positions (within eps).
 * Returns a map from a representative VID to the list of member VIDs (including the rep).
 */
export function buildPositionClusters(mesh: EditableMesh, eps = 1e-6): Map<VID, VID[]> {
  const V = mesh.vertices();
  const clusters = new Map<VID, VID[]>();
  const buckets = new Map<string, VID[]>();
  const eps2 = eps * eps;

  // Bucket vertices by quantized position
  for (let v = 0; v < V.length; v++) {
    if (!V[v]) continue;
    const p = mesh.position.get(v as VID) ?? [0, 0, 0];
    const key = hashKey(p, eps);
    let arr = buckets.get(key);
    if (!arr) { arr = []; buckets.set(key, arr); }
    arr.push(v as VID);
  }

  // Within each bucket, group by true epsilon to avoid false positives on grid borders
  for (const list of buckets.values()) {
    const used = new Set<VID>();
    for (let i = 0; i < list.length; i++) {
      const v = list[i]!; if (used.has(v)) continue;
      const pv = mesh.position.get(v) ?? [0,0,0];
      const group: VID[] = [v]; used.add(v);
      for (let j = i + 1; j < list.length; j++) {
        const u = list[j]!; if (used.has(u)) continue;
        const pu = mesh.position.get(u) ?? [0,0,0];
        if (dist2(pv, pu) <= eps2) { group.push(u); used.add(u); }
      }
      clusters.set(group[0]!, group);
    }
  }

  return clusters;
}

/** Expand a vertex set with all coincident vertices (within eps). */
export function expandVertsByPosition(mesh: EditableMesh, verts: Iterable<VID>, eps=1e-6): Set<VID> {
  const clusters = buildPositionClusters(mesh, eps);
  const out = new Set<VID>();
  for (const v of verts) {
    // find containing cluster by scanning small map
    let added = false;
    for (const members of clusters.values()) {
      if (members.includes(v)) { for (const m of members) out.add(m); added = true; break; }
    }
    if (!added) out.add(v);
  }
  return out;
}
