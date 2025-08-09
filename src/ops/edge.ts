import { EditableMesh } from "../core/topology/EditableMesh";
import { ScalarAttr } from "../core/attributes/ScalarAttr";
import { collapseEdge as coreCollapseEdge, mergeVertices as coreMergeVertices } from "../core/topology/build";
import { HEID, VID } from "../core/types";

function edgeEndpoints(mesh: EditableMesh, he: number): [number, number] {
  const HE = mesh.halfEdges();
  const to = HE[he]!.v;
  // Try twin to get from; if no twin, walk face loop to find previous
  const tw = HE[he]!.twin;
  let from: number;
  if (tw >= 0) {
    from = HE[tw]!.v;
  } else {
    // find prev: walk until next === he
    let cur = he;
    for (let i = 0; i < HE.length; i++) { const n = HE[cur]!.next; if (n === he) break; cur = n; }
    from = HE[cur]!.v;
  }
  return [from, to];
}

export function edgeLength(mesh: EditableMesh, he: number): number {
  const [a, b] = edgeEndpoints(mesh, he);
  const pa = mesh.position.get(a)!; const pb = mesh.position.get(b)!;
  const dx = pb[0]! - pa[0]!; const dy = pb[1]! - pa[1]!; const dz = pb[2]! - pa[2]!;
  return Math.hypot(dx, dy, dz);
}

export function translateEdges(mesh: EditableMesh, edges: number[], delta: [number, number, number]): void {
  const [dx, dy, dz] = delta; const V = new Set<number>();
  for (const he of edges) { const [a, b] = edgeEndpoints(mesh, he); V.add(a); V.add(b); }
  for (const v of V) { const p = mesh.position.get(v)!; mesh.position.set(v, [p[0]!+dx, p[1]!+dy, p[2]!+dz]); }
}

/** Mark edges hard/soft by setting a per-half-edge attribute 'hard' (1 hard, 0 soft). Useful as shading/UV seam. */
export function setEdgeHard(mesh: EditableMesh, edges: number[] | "all" = "all", hard = true): void {
  const HE = mesh.halfEdges();
  const list = edges === "all" ? HE.map((_, i) => i).filter(i => !!HE[i]) : edges;
  let attr = mesh.heAttr.get("hard") as ScalarAttr | undefined;
  if (!attr) { attr = new ScalarAttr(0); mesh.heAttr.set("hard", attr); }
  attr.resize(HE.length);
  for (const he of list) attr.set(he, hard ? 1 : 0);
}

/** Collapse a set of half-edges using the core primitive. Returns the list of kept vertex IDs. */
export function collapseEdges(mesh: EditableMesh, edges: number[], target: "mid"|"origin"|"dest" = "mid"): number[] {
  const kept: number[] = [];
  for (const he of edges) {
    const res = coreCollapseEdge(mesh, he as HEID, target);
    kept.push(res.keptVID as number);
  }
  return kept;
}

/** Merge pairs of vertices using the core primitive. */
export function mergeVertexPairs(mesh: EditableMesh, pairs: Array<[number, number]>): void {
  for (const [a, b] of pairs) coreMergeVertices(mesh, a as VID, b as VID);
}
