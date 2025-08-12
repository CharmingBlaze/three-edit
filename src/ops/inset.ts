import { EditableMesh } from "../core/topology/EditableMesh";
import { FID, HEID, VID } from "../core/types";
import { makeFace, deleteFaces } from "../core/topology/build";
import { getCornerUV, setCornerUV } from "../core/topology/corners";
import { ScalarAttr } from "../core/attributes/ScalarAttr";

/**
 * Topological inset: for each face, creates an inset cap and a rim of quads.
 * - Keeps original boundary vertices.
 * - Adds one new inner vertex per boundary vertex, positioned toward centroid by insetScale.
 * - Deletes the original face; returns list of all newly created face IDs (rim + cap).
 * - Preserves per-corner UVs and per-face material.
 */
export function insetFacesTopological(mesh: EditableMesh, faceIds: FID[], insetScale = 0.9): FID[] {
  const HE = mesh.halfEdges();
  const F = mesh.faces();
  const created: FID[] = [];
  const materialAttr = mesh.faceAttr.get("material") as ScalarAttr | undefined;

  for (const f of faceIds) {
    const face = F[f]; if (!face) continue;
    // Collect ring vertices and half-edges for f
    const ringHE: HEID[] = []; const ringV: VID[] = [];
    let h = face.he as number; const start = h; let guard = 0;
    do { ringHE.push(h as HEID); ringV.push(HE[h]!.v as VID); h = HE[h]!.next; } while (h !== start && ++guard < HE.length);
    const n = ringV.length; if (n < 3) continue;

    // Centroid
    let cx = 0, cy = 0, cz = 0;
    for (const v of ringV) { const p = mesh.position.get(v)!; cx += p[0]!, cy += p[1]!, cz += p[2]!; }
    const inv = 1 / n; const c:[number,number,number] = [cx*inv, cy*inv, cz*inv];

    // Create inner vertices mapped 1:1 with ringV
    const innerV: VID[] = [];
    for (const v of ringV) {
      const p = mesh.position.get(v)!;
      const nx = c[0]! + (p[0]! - c[0]!) * insetScale;
      const ny = c[1]! + (p[1]! - c[1]!) * insetScale;
      const nz = c[2]! + (p[2]! - c[2]!) * insetScale;
      const nv = mesh.addVertex([nx, ny, nz]);
      innerV.push(nv as VID);
    }

    // Create rim quads and copy materials/UVs
    for (let i = 0; i < n; i++) {
      const i0 = i; const i1 = (i+1) % n;
      const v0 = ringV[i0]!, v1 = ringV[i1]!;
      const w1 = innerV[i1]!, w0 = innerV[i0]!; // maintain CCW ordering
      const fr = makeFace(mesh, [v0, v1, w1, w0]);
      created.push(fr);

      // Material propagation
      if (materialAttr) { materialAttr.resize(fr + 1); materialAttr.set(fr, materialAttr.get(f) ?? 0); }

      // UVs: map new face half-edges to to-vertex and copy from original boundary corner UVs
      const startHe = mesh.faces()[fr]!.he as HEID;
      const h0 = startHe; const h1 = HE[h0]!.next as HEID; const h2 = HE[h1]!.next as HEID; const h3 = HE[h2]!.next as HEID;
      // Original boundary corners: boundary corner to v1 is ringHE[i1]; to v0 is ringHE[i0]
      const heB = ringHE[i1]!; const heA = ringHE[i0]!;
      const uvA = getCornerUV(mesh, heA);
      const uvB = getCornerUV(mesh, heB);
      const mapHe = [h0, h1, h2, h3];
      const mapV  = [v0, v1, w1, w0];
      for (let k=0;k<4;k++) {
        const toV = mapV[k]!; const outHe = mapHe[k]!;
        if (toV === v0 || toV === w0) setCornerUV(mesh, outHe, uvA);
        else if (toV === v1 || toV === w1) setCornerUV(mesh, outHe, uvB);
      }
    }

    // Create cap face from innerV in same order as ring
    const cap = makeFace(mesh, innerV);
    created.push(cap);
    if (materialAttr) { materialAttr.resize(cap + 1); materialAttr.set(cap, materialAttr.get(f) ?? 0); }

    // Cap UVs: copy per-corner UVs by vertex index association from original boundary corners
    let ch = mesh.faces()[cap]!.he as HEID; for (let i=0;i<n;i++) {
      const outHe = ch; ch = HE[ch]!.next as HEID;
      const srcCorner = ringHE[i]!; const uv = getCornerUV(mesh, srcCorner);
      setCornerUV(mesh, outHe, uv);
    }

    // Remove original face
    deleteFaces(mesh, [f]);
  }

  return created;
}
