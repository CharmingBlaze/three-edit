import { EditableMesh } from "./EditableMesh";
import { HEID, VID, FID } from "../types";
import { prevHalfEdge, getCornerUV, setCornerUV, lerpUV, ensureAttributeSizes } from "./buildInternal";

// NOTE: MVP scaffolds. These expose the signatures and perform minimal safe work
// compatible with our current EditableMesh API (which doesn't expose HE allocation).
// We avoid direct HE mutations where not strictly needed.

export function makeFace(mesh: EditableMesh, ringVids: VID[]): FID {
  return mesh.addFace(ringVids);
}

/** Merge vertex b into a. Repoints half-edges to 'a' and conservatively deletes faces that become degenerate. */
export function mergeVertices(mesh: EditableMesh, a: VID, b: VID): { keptVID: VID, removedVID: VID } {
  if (a === b) return { keptVID: a, removedVID: b };
  const HE = mesh.halfEdges(); const V = mesh.vertices(); const F = mesh.faces();
  // Repoint all half-edges that target b to target a
  for (let h=0; h<HE.length; h++) { const e = HE[h]; if (!e) continue; if (e.v === b) e.v = a; }
  // Update vertex handles
  if (V[a] && V[a].he === -1) {
    // pick any outgoing HE that now targets from a's prev; best-effort scan
    for (let h=0; h<HE.length; h++){ const e=HE[h]; if (!e) continue; const prev = (function(){ let cur=h, prev=h; for(let i=0;i<HE.length;i++){ const n=HE[cur]!.next; if (n===h){ prev=cur; break; } cur=n; } return prev; })(); if (HE[prev]!.v === a) { V[a].he = h as any; break; } }
  }
  if (V[b]) V[b].he = -1 as any;
  // Delete faces that now have any consecutive duplicate vertices
  const toDelete: FID[] = [];
  for (let f=0; f<F.length; f++) {
    const face = F[f]; if (!face) continue;
    const start = face.he; let h = start; const lim = HE.length; let g=0; let deg=false;
    do { const prev = (function(){ let cur=h, prev=h; for(let i=0;i<HE.length;i++){ const n=HE[cur]!.next; if (n===h){ prev=cur; break; } cur=n; } return prev; })(); if (HE[prev]!.v === HE[h]!.v) { deg=true; break; } h = HE[h]!.next; } while (h !== start && ++g < lim);
    if (deg) toDelete.push(f as FID);
  }
  if (toDelete.length) deleteFaces(mesh, toDelete);
  return { keptVID: a, removedVID: b };
}

/** Collapse an edge by merging its two end vertices. Target may be 'mid'|'origin'|'dest'. */
export function collapseEdge(mesh: EditableMesh, he: HEID, target: "mid"|"origin"|"dest" = "mid"): { keptVID: VID, removedVID: VID } {
  const HE = mesh.halfEdges();
  const h = he as number; const e = HE[h]; if (!e) throw new Error("collapseEdge: invalid half-edge");
  const hPrev = (function(){ let cur=h, prev=h; for(let i=0;i<HE.length;i++){ const n=HE[cur]!.next; if (n===h){ prev=cur; break; } cur=n; } return prev; })();
  const vFrom = HE[hPrev]!.v as VID; const vTo = e.v as VID;
  let kept = vFrom, removed = vTo;
  if (target === "dest") { kept = vTo; removed = vFrom; }
  if (target === "mid") {
    const pA = mesh.position.get(vFrom) ?? [0,0,0]; const pB = mesh.position.get(vTo) ?? [0,0,0];
    const mid:[number,number,number] = [(pA[0]+pB[0])/2,(pA[1]+pB[1])/2,(pA[2]+pB[2])/2];
    mesh.position.set(vFrom, mid);
    kept = vFrom; removed = vTo;
  }
  return mergeVertices(mesh, kept, removed);
}

/** Split a polygonal face by inserting a chord between two non-adjacent vertices. */
export function splitFace(mesh: EditableMesh, f: FID, chord: [VID, VID]): { newFaces: [FID, FID] } | null {
  const HE = mesh.halfEdges();
  const face = mesh.faces()[f]; if (!face) return null;
  const ring = (function collectRing(): { hs: HEID[]; vs: VID[] } {
    const hs: HEID[] = []; const vs: VID[] = [];
    const start = face.he; let h = start; const limit = HE.length; let guard = 0;
    do { hs.push(h as HEID); vs.push(HE[h]!.v as VID); h = HE[h]!.next; } while (h !== start && ++guard < limit);
    return { hs, vs };
  })();
  const { hs: origHE, vs: origV } = ring;
  const n = origV.length; if (n < 4) return null;
  const a = chord[0], b = chord[1];
  const ia = origV.indexOf(a); const ib = origV.indexOf(b);
  if (ia < 0 || ib < 0) return null;
  const dist = (x:number,y:number)=> (y>=x? y-x : y+n-x);
  const d = Math.abs(ia-ib);
  if (d === 0 || d === 1 || d === n-1) return null; // adjacent or same

  // Build loops along forward order (CCW) to keep original orientation
  const loopAB: VID[] = []; // a..b along ring
  for (let k=0;k<=dist(ia,ib);k++) loopAB.push(origV[(ia+k)%n]!);
  const loopBA: VID[] = []; // b..a along ring
  for (let k=0;k<=dist(ib,ia);k++) loopBA.push(origV[(ib+k)%n]!);

  // Create the two new faces
  const f1 = makeFace(mesh, loopAB);
  const f2 = makeFace(mesh, loopBA);

  // Transfer per-corner UVs where edges come from original ring; chord corners get averaged UVs
  ensureAttributeSizes(mesh);
  const applyUVs = (newF: FID, loop: VID[]) => {
    const newRingHE: HEID[] = (function() {
      const start = mesh.faces()[newF]!.he; const out: HEID[] = []; let h = start; const lim = mesh.halfEdges().length; let g=0;
      do { out.push(h as HEID); h = mesh.halfEdges()[h]!.next; } while (h !== start && ++g < lim);
      return out;
    })();
    const m = loop.length;
    for (let i=0;i<m;i++){
      const from = loop[i]!; const to = loop[(i+1)%m]!;
      // Find if (from->to) exists in original ring
      let src: HEID | null = null;
      for (let r=0;r<n;r++){
        const rf = origV[r]!; const rt = origV[(r+1)%n]!;
        if (rf === from && rt === to) { src = origHE[r]!; break; }
      }
      if (src != null) {
        setCornerUV(mesh, newRingHE[i]!, getCornerUV(mesh, src));
      } else {
        // chord: set average of endpoint original corner uvs
        // Use original corners corresponding to vertices 'from' and 'to'
        const uvFrom = (function(){
          const idx = origV.indexOf(from); return idx>=0 ? getCornerUV(mesh, origHE[idx]!) : [0,0] as [number,number];
        })();
        const uvTo = (function(){
          const idx = origV.indexOf(to); return idx>=0 ? getCornerUV(mesh, origHE[idx]!) : [0,0] as [number,number];
        })();
        setCornerUV(mesh, newRingHE[i]!, lerpUV(uvFrom, uvTo, 0.5));
      }
    }
  };
  applyUVs(f1, loopAB);
  applyUVs(f2, loopBA);

  // Remove original face (mark) — keep half-edges for MVP
  deleteFaces(mesh, [f]);
  return { newFaces: [f1, f2] };
}

/** Create a quad strip between two boundary loops given as half-edge rings. */
export function bridgeEdges(mesh: EditableMesh, loopA: HEID[], loopB: HEID[]): { faces: FID[] } {
  if (loopA.length !== loopB.length) throw new Error("bridgeEdges requires equal-length loops");
  const HE = mesh.halfEdges();
  const VA: VID[] = loopA.map(h => HE[h]!.v as VID);
  const VB: VID[] = loopB.map(h => HE[h]!.v as VID);
  const n = VA.length; const faces: FID[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = VA[i]!, a1 = VA[(i+1)%n]!;
    const b1 = VB[(i+1)%n]!, b0 = VB[i]!;
    const f = makeFace(mesh, [a0, a1, b1, b0]);
    faces.push(f);
  }
  return { faces };
}

export function splitEdge(mesh: EditableMesh, he: HEID, t = 0.5): VID {
  const HE = mesh.halfEdges(); const F = mesh.faces(); const V = mesh.vertices();
  const h = he as number; const e = HE[h]; if (!e) throw new Error("splitEdge: invalid half-edge");
  const hPrev = prevHalfEdge(mesh, h as HEID) as number;
  const from = HE[hPrev]!.v as VID; const to = e.v as VID;
  const ht = e.twin; const hasTwin = ht >= 0 && !!HE[ht];

  // New vertex position interpolated
  const pA = mesh.position.get(from) ?? [0,0,0]; const pB = mesh.position.get(to) ?? [0,0,0];
  const s = 1 - t; const nvPos: [number,number,number] = [pA[0]*s + pB[0]*t, pA[1]*s + pB[1]*t, pA[2]*s + pB[2]*t];
  const nv = mesh.addVertex(nvPos);

  // New half-edges: one on each side of split edge
  const newH: HEID = HE.length as HEID; HE.push({ v: to, next: e.next, twin: -1 as any, face: e.face });
  // Rewire original h to end at new vertex and point to newH
  e.v = nv; e.next = newH as any;

  // Twin side if exists
  let newHT: HEID | null = null;
  if (hasTwin) {
    const et = HE[ht]!; // twin original
    const htPrev = prevHalfEdge(mesh, ht as HEID) as number;
    const to2 = HE[htPrev]!.v as VID; // which is 'to' of htPrev, equals 'to' of twin cycle
    // et currently points to 'from'; after split it should point to nv (segment to->nv)
    et.v = nv;
    newHT = HE.length as HEID; HE.push({ v: from, next: et.next, twin: -1 as any, face: et.face });
    et.next = newHT as any;
    // Set twins across new segments
    HE[h]!.twin = newHT as any; HE[newHT]!.twin = h as any;
    HE[newH]!.twin = ht as any; HE[ht]!.twin = newH as any;
  } else {
    // Boundary edge: only split visible side
    HE[newH]!.twin = -1 as any; HE[h]!.twin = -1 as any;
  }

  // Vertex outgoing half-edges
  if (V[nv]!.he === -1) V[nv]!.he = newH as any;
  if (V[from]!.he === hPrev) V[from]!.he = h as any; // maintain a reasonable outgoing

  // Corner UVs: copy and interpolate along the split
  ensureAttributeSizes(mesh);
  const uvH = getCornerUV(mesh, h as HEID);
  const uvT = hasTwin ? getCornerUV(mesh, ht as HEID) : uvH;
  const uvMid = lerpUV(uvH, uvT, t);
  // Keep original corner on h; assign mid to new segments for stability
  setCornerUV(mesh, newH as HEID, uvMid);
  if (hasTwin && newHT != null) setCornerUV(mesh, newHT as HEID, uvMid);

  return nv;
}

export function duplicateBoundaryLoop(mesh: EditableMesh, loop: HEID[]): { old2newV: Map<VID, VID>, boundaryNewHE: HEID[] } {
  // Duplicate unique vertices in the loop; return mapping. We don't create new boundary HEs here.
  const HE = mesh.halfEdges();
  const old2newV = new Map<VID, VID>();
  for (const he of loop) {
    const to = HE[he]?.v as VID; if (to == null || to < 0) continue;
    if (!old2newV.has(to)) {
      const p = mesh.position.get(to);
      const nv = mesh.addVertex([p[0], p[1], p[2]]);
      old2newV.set(to, nv);
    }
    // also capture the 'from' vertex of this edge, derived via prev walk
    let cur = he as number; let prev = cur;
    for (let i = 0; i < HE.length; i++) { const n = HE[cur]!.next; if (n === he) { prev = cur; break; } cur = n; }
    const from = HE[prev]!.v as VID;
    if (!old2newV.has(from)) {
      const p = mesh.position.get(from);
      const nv = mesh.addVertex([p[0], p[1], p[2]]);
      old2newV.set(from, nv);
    }
  }
  return { old2newV, boundaryNewHE: [] };
}

export function deleteFaces(mesh: EditableMesh, faces: FID[]) {
  const F = mesh.faces(); const HE = mesh.halfEdges();
  for (const f of faces) {
    const face = F[f]; if (!face) continue;
    const start = face.he; let h = start; const visited: HEID[] = [];
    do { visited.push(h as HEID); h = HE[h]!.next; } while (h !== start);
    // mark half-edges' face as -1; keep topology for now (MVP, no reclaim)
    for (const e of visited) { HE[e]!.face = -1 as any; }
    // mark face slot as empty; downstream code checks for falsy
    (F as any)[f] = undefined;
  }
}
