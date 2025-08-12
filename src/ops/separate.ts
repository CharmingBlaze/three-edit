import { EditableMesh } from "../core/topology/EditableMesh";
import { FID, HEID, VID } from "../core/types";

/**
 * Create a new EditableMesh containing copies of the given faces and their vertices.
 * Preserves per-corner UVs (uv0). Face/vertex indices are remapped.
 */
export function separateFaces(source: EditableMesh, faces: FID[]): EditableMesh {
  const dst = new EditableMesh();
  const F = source.faces(); const HE = source.halfEdges();
  const vMap = new Map<VID, VID>();
  for (const f of faces) {
    const face = F[f]; if (!face) continue; const start = face.he; let h = start; const loopV: VID[] = []; const loopHE: HEID[] = [];
    do { loopHE.push(h as HEID); const v = HE[h]!.v as VID; loopV.push(v); h = HE[h]!.next; } while (h !== start);
    // map/create vertices
    const dstLoop: VID[] = [];
    for (const v of loopV) {
      let nv = vMap.get(v);
      if (nv == null) { const p = source.position.get(v)!; nv = dst.addVertex([p[0]!, p[1]!, p[2]!]); vMap.set(v, nv); }
      dstLoop.push(nv);
    }
    const nf = dst.addFace(dstLoop);
    // copy per-corner UVs by iterating new face loop in order
    const dstF = dst.faces()[nf]!; let dh = dstF.he; const dstart = dh;
    for (let i = 0; i < loopHE.length; i++) {
      const uv = source.uv0.get(loopHE[i]!) ?? [0,0];
      dst.uv0.set(dh, [uv[0]!, uv[1]!]);
      dh = dst.halfEdges()[dh]!.next;
      if (dh === dstart) break;
    }
  }
  return dst;
}
