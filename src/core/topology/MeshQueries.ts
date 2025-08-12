import { EditableMesh } from "./EditableMesh";
import { HEID, FID, VID } from "../types";
import type { MeshSelection } from "./MeshSelection";

export function averageNormalOfFaces(mesh: EditableMesh, facesList: number[]): [number, number, number] {
  const HE = mesh.halfEdges(); const F = mesh.faces();
  let nx = 0, ny = 0, nz = 0, count = 0;
  for (const f of facesList) {
    const face = F[f]; if (!face) continue; const start = face.he; let h0 = start; let guard = 0;
    // Compute face normal via Newell's method
    const ring: number[] = [];
    do { if (guard++ > HE.length) break; ring.push(h0); h0 = HE[h0]!.next; } while (h0 !== start);
    if (ring.length < 3) continue;
    let fx = 0, fy = 0, fz = 0;
    for (let i = 0; i < ring.length; i++) {
      const ha = ring[i]!; const hb = ring[(i + 1) % ring.length]!;
      const va = HE[ha]!.v; const vb = HE[hb]!.v;
      const a = mesh.position.get(va)!; const b = mesh.position.get(vb)!;
      fx += (a[1] ?? 0) * (b[2] ?? 0) - (a[2] ?? 0) * (b[1] ?? 0);
      fy += (a[2] ?? 0) * (b[0] ?? 0) - (a[0] ?? 0) * (b[2] ?? 0);
      fz += (a[0] ?? 0) * (b[1] ?? 0) - (a[1] ?? 0) * (b[0] ?? 0);
    }
    nx += fx; ny += fy; nz += fz; count++;
  }
  const len = Math.hypot(nx, ny, nz) || 1; return [nx / len, ny / len, nz / len];
}

export function faceBoundaryLoops(mesh: EditableMesh, faces: Set<number>): number[][] {
  // Collect boundary half-edges of the face set, then walk each loop once.
  const HE = mesh.halfEdges(); const F = mesh.faces();
  const boundary: Set<number> = new Set();
  for (const f of faces) {
    const face = F[f]; if (!face) continue; let h = face.he; const start = h;
    do { const tw = HE[h]!.twin; const of = tw >= 0 ? HE[tw]!.face : -1; if (of < 0 || !faces.has(of)) boundary.add(h); h = HE[h]!.next; } while (h !== start);
  }
  const loops: number[][] = [];
  const visited: Set<number> = new Set();
  for (const e of boundary) {
    if (visited.has(e)) continue;
    const loop: number[] = [];
    let h = e; let guard = 0;
    do {
      if (visited.has(h)) break;
      visited.add(h);
      loop.push(HE[h]!.v);
      // step to next boundary half-edge around boundary: next along this face; if twin belongs to set, stop at boundary
      let n = HE[h]!.next; // move along face
      // ensure n is boundary
      while (!boundary.has(n) && guard++ < HE.length) { n = HE[n]!.next; }
      h = n;
    } while (h !== e && guard < HE.length);
    if (loop.length > 0) loops.push(loop);
  }
  return loops;
}

// --- Quad-aware helpers ---

export function faceSides(mesh: EditableMesh, f: FID): number {
  const faces = mesh.faces();
  if (!faces[f]) return 0;
  const start = faces[f]!.he as HEID;
  if (start == null || start < 0) return 0;
  const he = mesh.halfEdges();
  let count = 0;
  let h = start as number;
  do { count++; h = he[h]!.next as number; } while (h !== start && count < 1_000_000);
  return count;
}

export function isQuad(mesh: EditableMesh, f: FID): boolean { return faceSides(mesh, f) === 4; }

export function triVerts(mesh: EditableMesh, f: FID): [VID, VID, VID] {
  const faces = mesh.faces(); const he = mesh.halfEdges();
  const start = faces[f]?.he as number; if (start == null || start < 0) throw new Error("face has no loop");
  const a = start; const b = he[a]!.next as number; const c = he[b]!.next as number;
  return [he[a]!.v as VID, he[b]!.v as VID, he[c]!.v as VID];
}

export function quadVerts(mesh: EditableMesh, f: FID): [VID, VID, VID, VID] {
  if (!isQuad(mesh, f)) throw new Error("not a quad face");
  const faces = mesh.faces(); const he = mesh.halfEdges();
  const a = faces[f]!.he as number; const b = he[a]!.next as number; const c = he[b]!.next as number; const d = he[c]!.next as number;
  return [he[a]!.v as VID, he[b]!.v as VID, he[c]!.v as VID, he[d]!.v as VID];
}

export function edgeLen(mesh: EditableMesh, v0: VID, v1: VID): number {
  const p0 = mesh.position.get(v0)!; const p1 = mesh.position.get(v1)!;
  const dx = p0[0]! - p1[0]!; const dy = p0[1]! - p1[1]!; const dz = p0[2]! - p1[2]!;
  return Math.hypot(dx, dy, dz);
}

export function nextRingEdgeAcrossQuad(mesh: EditableMesh, heId: HEID): HEID | null {
  const he = mesh.halfEdges(); const faces = mesh.faces();
  const f = he[heId!]?.face as number; if (f == null || f < 0) return null;
  if (!isQuad(mesh, f)) return null;
  const a = faces[f]!.he as number; const b = he[a]!.next as number; const c = he[b]!.next as number; const d = he[c]!.next as number;
  // Find which of a,b,c,d equals heId
  const ring = [a, b, c, d];
  const idx = ring.indexOf(heId as number);
  if (idx < 0) return null;
  const opposite = ring[(idx + 2) % 4]!;
  const across = he[opposite]!.twin as number;
  return across >= 0 ? (across as HEID) : null;
}

// --- Selection conversions ---
export function facesToBoundaryEdges(mesh: EditableMesh, faces: Set<FID>): Set<HEID> {
  const out = new Set<HEID>();
  const F = mesh.faces(); const HE = mesh.halfEdges();
  for (const f of faces) {
    const face = F[f]; if (!face) continue; const start = face.he; let h = start;
    do {
      const tw = HE[h]!.twin;
      const otherF = tw >= 0 ? HE[tw]!.face : -1;
      if (otherF < 0 || !faces.has(otherF)) { out.add(h as HEID); }
      h = HE[h]!.next;
    } while (h !== start);
  }
  return out;
}

export function edgesToVerts(mesh: EditableMesh, edges: Set<HEID>): Set<VID> {
  const out = new Set<VID>(); const HE = mesh.halfEdges();
  for (const he of edges) {
    const to = HE[he]?.v; if (to != null && to >= 0) out.add(to as VID);
    // prev vertex from twin path
    const tw = HE[he]?.twin ?? -1; if (tw >= 0) { const from = HE[tw]!.v; if (from >= 0) out.add(from as VID); }
    else {
      // find prev in face loop
      let cur = he as number; for (let i = 0; i < HE.length; i++) { const n = HE[cur]!.next; if (n === he) break; cur = n; }
      const from = HE[cur]!.v; if (from >= 0) out.add(from as VID);
    }
  }
  return out;
}

export function vertsToFaces(mesh: EditableMesh, verts: Set<VID>): Set<FID> {
  const out = new Set<FID>(); const F = mesh.faces(); const HE = mesh.halfEdges();
  for (let f = 0; f < F.length; f++) { const face = F[f]; if (!face) continue; const start = face.he; let h = start; let all = true;
    do { const v = HE[h]!.v as VID; if (!verts.has(v)) { all = false; break; } h = HE[h]!.next; } while (h !== start);
    if (all) out.add(f as FID);
  }
  return out;
}

// --- Selection growth/shrink ---
export function growSelection(mesh: EditableMesh, sel: MeshSelection){
  if (sel.mode === "vertex") {
    const HE = mesh.halfEdges(); const F = mesh.faces();
    const add: VID[] = [];
    for (let f = 0; f < F.length; f++) { const face = F[f]; if (!face) continue; const start = face.he; let h = start; const ring: VID[] = [];
      do { ring.push(HE[h]!.v as VID); h = HE[h]!.next; } while (h !== start);
      if (ring.some(v => sel.verts.has(v))) ring.forEach(v => add.push(v));
    }
    add.forEach(v => sel.verts.add(v));
  } else if (sel.mode === "edge") {
    // add adjacent edges in same faces
    const HE = mesh.halfEdges(); const add: HEID[] = [];
    sel.edges.forEach(e => { const n = HE[e]!.next as HEID; add.push(n); const tw = HE[e]!.twin; if (tw >= 0) add.push(HE[tw]!.next as HEID); });
    add.forEach(e => sel.edges.add(e));
  } else if (sel.mode === "face") {
    const HE = mesh.halfEdges(); const F = mesh.faces(); const add: FID[] = [];
    sel.faces.forEach(f => { const start = F[f]!.he; let h = start; do { const t = HE[h]!.twin; if (t >= 0) { const of = HE[t]!.face as FID; if (of >= 0) add.push(of); } h = HE[h]!.next; } while (h !== start); });
    add.forEach(f => sel.faces.add(f));
  }
}

export function shrinkSelection(_mesh: EditableMesh, sel: MeshSelection){
  if (sel.mode === "vertex") {
    // remove boundary verts roughly: keep only verts with all adjacent faces selected (not tracked here) -> simple clear for now
    // Minimal safe behavior: clear selection
    sel.verts.clear();
  } else if (sel.mode === "edge") {
    sel.edges.clear();
  } else if (sel.mode === "face") {
    // remove boundary faces: crude implementation drops selection
    sel.faces.clear();
  }
}

export function edgeLoopFromSeed(mesh: EditableMesh, sel: MeshSelection){
  const HE = mesh.halfEdges();
  const seed = sel.edges.values().next().value as HEID | undefined; if (seed == null) return;
  const visited = new Set<HEID>(); let cur: HEID | null = seed;
  while (cur != null && !visited.has(cur)) { visited.add(cur); const across = nextRingEdgeAcrossQuad(mesh, cur); cur = across; }
  visited.forEach(e => sel.edges.add(e));
}

export function edgeRingFromSeed(mesh: EditableMesh, sel: MeshSelection){
  const HE = mesh.halfEdges();
  const seed = sel.edges.values().next().value as HEID | undefined; if (seed == null) return;
  const visited = new Set<HEID>();
  const enqueue = (e: HEID | null) => { if (e != null) visited.add(e); };
  // Traverse parallel edges: for quads, step next->next around face
  const stepParallel = (e: HEID): HEID | null => {
    const n = HE[e]!.next; const nn = HE[n]!.next; const tw = HE[nn]!.twin; return tw >= 0 ? (HE[tw]!.next as HEID) : null;
  };
  let cur: HEID | null = seed;
  for (let i = 0; i < HE.length && cur != null && !visited.has(cur); i++) { enqueue(cur); cur = stepParallel(cur); }
  visited.forEach(e => sel.edges.add(e));
}

export function tryMakeQuad(_mesh: EditableMesh, _e: HEID): FID | null {
  // Not implemented in MVP; explicit null return.
  return null;
}
