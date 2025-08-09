import { EditableMesh } from "../core/topology/EditableMesh";
import { HEID, FID, VID } from "../core/types";
import { deleteFaces, makeFace } from "../core/topology/build";
import { getCornerUV, setCornerUV } from "../core/topology/corners";

export type SubdivideOptions = { levels?: number };

/**
 * Subdivide faces by creating a centroid and fanning triangles around it.
 * - Preserves arbitrary n-gons by producing n triangles per face.
 * - Propagates per-corner UVs: boundary corners keep their UVs; centroid gets an average of adjacent UVs.
 * - Returns list of new face IDs.
 */
export function subdivideFaces(mesh: EditableMesh, faceIds: FID[], opts: SubdivideOptions = {}): FID[] {
  const levels = Math.max(1, opts.levels ?? 1);
  let currentFaces = faceIds.slice();
  let result: FID[] = [];

  for (let level = 0; level < levels; level++) {
    const nextFaces: FID[] = [];
    for (const f of currentFaces) {
      const face = mesh.faces()[f]; if (!face) continue;
      const HE = mesh.halfEdges();
      // Gather loop vertices and corner HEs
      const verts: VID[] = [];
      const corners: HEID[] = [];
      let h = face.he as HEID; const start = h; let guard = 0;
      do {
        if (guard++ > HE.length) break;
        corners.push(h);
        verts.push(HE[h]!.v as VID);
        h = HE[h]!.next as HEID;
      } while (h !== start);
      const n = verts.length; if (n < 3) continue;

      // Centroid position
      let cx = 0, cy = 0, cz = 0;
      for (const v of verts) { const p = mesh.position.get(v)!; cx += p[0] ?? 0; cy += p[1] ?? 0; cz += p[2] ?? 0; }
      cx /= n; cy /= n; cz /= n;
      const vC = mesh.addVertex([cx, cy, cz]) as VID;

      // Delete original face and create fan triangles
      deleteFaces(mesh, [f]);

      for (let i = 0; i < n; i++) {
        const ia = i; const ib = (i + 1) % n;
        const vA = verts[ia]!; const vB = verts[ib]!;
        const fNew = makeFace(mesh, [vA, vB, vC]);
        nextFaces.push(fNew);

        // UV propagation: use original boundary corner UVs; centroid UV as average of adjacent uvA/uvB
        const heA = corners[ia]!; // corner at boundary towards vA (to-vertex depends on convention)
        const heB = corners[ib]!;
        const uvA = getCornerUV(mesh, heA);
        const uvB = getCornerUV(mesh, heB);
        const uvC: [number, number] = [
          ((uvA?.[0] ?? 0) + (uvB?.[0] ?? 0)) * 0.5,
          ((uvA?.[1] ?? 0) + (uvB?.[1] ?? 0)) * 0.5,
        ];

        // Map new triangle corners by to-vertex id
        const startHe = mesh.faces()[fNew]!.he as HEID;
        let hh = startHe; const triHes: HEID[] = [];
        for (let k = 0; k < 3; k++) { triHes.push(hh); hh = HE[hh]!.next as HEID; }
        for (const tHe of triHes) {
          const toV = HE[tHe]!.v as VID;
          if (toV === vA) setCornerUV(mesh, tHe, uvA);
          else if (toV === vB) setCornerUV(mesh, tHe, uvB);
          else if (toV === vC) setCornerUV(mesh, tHe, uvC);
        }
      }
    }
    result = nextFaces;
    currentFaces = nextFaces;
  }
  return result;
}
