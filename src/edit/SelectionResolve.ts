import { EditableMesh } from "../core/topology/EditableMesh";
import { MeshSelection } from "../core/topology/MeshSelection";
import { VID, HEID, FID } from "../core/types";
import { expandVertsByPosition } from "../core/topology/Clusters";

export interface ResolveOptions {
  mode: "vertex" | "edge" | "face";
  linkAcross: {
    coincidentPosition: boolean;
    uvSeam: boolean;          // reserved for future use
    sharpNormal: boolean;     // reserved for future use
    materialBoundary: boolean;// reserved for future use
  };
  mirror?: { enabled: boolean; axis: "X"|"Y"|"Z"; weldEps: number };
  positionEps?: number; // epsilon for coincident clusters
}

/**
 * Turn UI selection into the set of vertex IDs to edit, according to options.
 * MVP: expands by coincident positions; future: seam/sharp/material-aware expansion.
 */
export function resolveVertsForEdit(mesh: EditableMesh, sel: MeshSelection, opt: ResolveOptions): VID[] {
  // 1) seed verts from selection mode
  const seed = new Set<VID>();
  if (opt.mode === "vertex") {
    for (const v of sel.verts) seed.add(v);
  } else if (opt.mode === "edge") {
    const HE = mesh.halfEdges();
    for (const h of sel.edges) {
      if (h == null) continue; const prev = (function(){ let cur=h as number, prev=h as number; for(let i=0;i<HE.length;i++){ const n=HE[cur]!.next; if (n===h){ prev=cur; break; } cur=n; } return prev; })();
      seed.add(HE[prev]!.v as VID);
      seed.add(HE[h as number]!.v as VID);
    }
  } else if (opt.mode === "face") {
    const F = mesh.faces(); const HE = mesh.halfEdges();
    for (const f of sel.faces) {
      const face = F[f]; if (!face) continue;
      const start = face.he; let h = start; const lim = HE.length; let g=0;
      do { const prev = (function(){ let cur=h, prev=h; for(let i=0;i<HE.length;i++){ const n=HE[cur]!.next; if (n===h){ prev=cur; break; } cur=n; } return prev; })(); seed.add(HE[prev]!.v as VID); h = HE[h]!.next; } while (h !== start && ++g < lim);
    }
  }

  // 2) expand by coincident positions if enabled
  let verts: Set<VID> = seed;
  if (opt.linkAcross?.coincidentPosition) {
    verts = expandVertsByPosition(mesh, verts, opt.positionEps ?? 1e-6);
  }

  // 3) mirror (MVP: position-based reflection, no topology weld here)
  if (opt.mirror?.enabled) {
    const out = new Set<VID>(verts);
    const axisIndex = opt.mirror.axis === "X" ? 0 : opt.mirror.axis === "Y" ? 1 : 2;
    const eps = opt.mirror.weldEps;
    // naive: include any vertex whose position is mirrored of an edited vertex
    const positions = new Map<VID, [number,number,number]>();
    for (let v=0; v<mesh.vertices().length; v++) { if (!mesh.vertices()[v]) continue; positions.set(v as VID, mesh.position.get(v as VID)); }
    const idxs = [...positions.keys()];
    const eq = (a:[number,number,number], b:[number,number,number])=>{
      const dx=a[0]-b[0], dy=a[1]-b[1], dz=a[2]-b[2]; return dx*dx+dy*dy+dz*dz <= eps*eps;
    };
    for (const v of verts) {
      const p = positions.get(v)!; const pm:[number,number,number]=[p[0],p[1],p[2]]; pm[axisIndex]*=-1;
      for (const u of idxs) { const q = positions.get(u as VID)!; if (eq(pm, q)) out.add(u as VID); }
    }
    verts = out;
  }

  return [...verts];
}
