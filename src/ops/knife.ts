import { EditableMesh } from "../core/topology/EditableMesh";
import { HEID, VID, FID } from "../core/types";
import { splitEdge, splitFace } from "../core/topology/build";

/**
 * Knife across a single polygonal face by splitting two edges at parameters tA and tB, then inserting a chord.
 * Returns the created vertex IDs and the new face IDs from the split.
 */
export function knifeAcrossFace(mesh: EditableMesh, f: FID, aHE: HEID, tA: number, bHE: HEID, tB: number): { verts: [VID, VID], faces: [FID, FID] } | null {
  // Preconditions: both half-edges must belong to the given face f (or its cycle)
  const HE = mesh.halfEdges();
  const face = mesh.faces()[f]; if (!face) return null;
  const belongs = (he: number): boolean => {
    const start = face.he; let h = start; const lim = HE.length; let g=0;
    do { if (h === he) return true; h = HE[h]!.next; } while (h !== start && ++g < lim);
    return false;
  };
  if (!belongs(aHE as number) || !belongs(bHE as number)) return null;

  const va = splitEdge(mesh, aHE, tA);
  const vb = aHE === bHE ? va : splitEdge(mesh, bHE, tB);

  const res = splitFace(mesh, f, [va, vb]);
  if (!res) return null;
  return { verts: [va, vb], faces: res.newFaces };
}
