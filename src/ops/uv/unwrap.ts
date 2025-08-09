import { EditableMesh } from "../../core/topology/EditableMesh";
import { HEID, FID, VID } from "../../core/types";

/**
 * Planar unwrap: projects selected faces to XY and writes per-corner UVs.
 * This is a simple baseline (one chart per face), deterministic and safe.
 */
export function unwrapIslands(mesh: EditableMesh, faceIds: FID[]): void {
  const HE = mesh.halfEdges();
  for (const f of faceIds) {
    const face = mesh.faces()[f]; if (!face) continue;
    // Find bounding box in XY of face vertices and normalize to [0,1]
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const corners: HEID[] = [];
    let h = face.he as HEID; const start = h; let guard = 0;
    do {
      if (guard++ > HE.length) break;
      corners.push(h);
      const v = HE[h]!.v as VID; const p = mesh.position.get(v)!;
      const x = p[0] ?? 0, y = p[1] ?? 0;
      if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y;
      h = HE[h]!.next as HEID;
    } while (h !== start);
    const sx = (maxX - minX) || 1; const sy = (maxY - minY) || 1;
    // Write normalized UVs per corner
    for (const c of corners) {
      const v = HE[c]!.v as VID; const p = mesh.position.get(v)!;
      const u = ((p[0] ?? 0) - minX) / sx; const vcoord = ((p[1] ?? 0) - minY) / sy;
      mesh.uv0.set(c, [u, vcoord]);
    }
  }
}
