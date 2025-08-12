import { EditableMesh } from "../../core/topology/EditableMesh";

export type RelaxOptions = {
  iterations?: number;
  lambda?: number; // smoothing factor (0..1)
  pinBoundary?: boolean; // keep chart boundaries fixed
  epsilon?: number; // seam compare epsilon
};

/**
 * Laplacian relax of per-corner UVs (`mesh.uv0`).
 * - Operates on a corner (half-edge) graph so seams are preserved.
 * - Neighbors: previous/next corners on the face; plus across twin if UVs are continuous.
 * - If `pinBoundary` is true, corners on chart boundaries are pinned (twins missing or discontinuous UV).
 */
export function relaxIslands(mesh: EditableMesh, opts: RelaxOptions = {}): void {
  const iterations = opts.iterations ?? 10;
  const lambda = opts.lambda ?? 0.5;
  const pinBoundary = opts.pinBoundary ?? true;
  const eps = opts.epsilon ?? 1e-5;

  const HE = mesh.halfEdges();
  const F = mesh.faces();

  const nHE = HE.length;
  if (nHE === 0) return;

  // Helpers
  const prevOf = (h: number) => {
    // find prev by walking loop (safe for small faces)
    let cur = h; for (let i = 0; i < nHE; i++) { const nxt = HE[cur]!.next; if (nxt === h) return cur; cur = nxt; }
    return h;
  };
  const uvEq = (a: [number, number] | undefined, b: [number, number] | undefined) => {
    if (!a || !b) return false; return Math.abs(a[0] - b[0]) <= eps && Math.abs(a[1] - b[1]) <= eps;
  };

  // Precompute neighbors and pinned flags for each HE that has UV
  const neighbors: number[][] = new Array(nHE);
  const pinned: boolean[] = new Array(nHE).fill(false);

  for (let f = 0; f < F.length; f++) {
    const face = F[f]; if (!face) continue;
    // iterate loop
    let h = face.he; const start = h; let guard = 0;
    do {
      if (guard++ > nHE) break;
      const uv = mesh.uv0.get(h);
      if (uv) {
        const nbs: number[] = neighbors[h] ?? (neighbors[h] = []);
        const next = HE[h]!.next;
        const prev = prevOf(h);
        nbs.push(next, prev);
        const tw = HE[h]!.twin;
        const uvTw = tw >= 0 ? mesh.uv0.get(tw) : undefined;
        if (tw >= 0 && uvEq(uv, uvTw)) {
          nbs.push(tw);
        } else if (pinBoundary) {
          pinned[h] = true;
        }
      }
      h = HE[h]!.next;
    } while (h !== start);
  }

  // If pinBoundary, also mark corners with missing UV as implicitly pinned neighbors won't update them
  if (pinBoundary) {
    for (let h = 0; h < nHE; h++) {
      if (!mesh.uv0.get(h)) pinned[h] = true;
    }
  }

  // Iterative smoothing
  const curU: number[] = new Array(nHE);
  const curV: number[] = new Array(nHE);
  const nextU: number[] = new Array(nHE);
  const nextV: number[] = new Array(nHE);

  for (let h = 0; h < nHE; h++) {
    const uv = mesh.uv0.get(h);
    if (uv) { curU[h] = uv[0]; curV[h] = uv[1]; } else { curU[h] = 0; curV[h] = 0; }
  }

  for (let it = 0; it < iterations; it++) {
    for (let h = 0; h < nHE; h++) {
      if (pinned[h] ?? false) { nextU[h] = curU[h] ?? 0; nextV[h] = curV[h] ?? 0; continue; }
      const nbs = neighbors[h] ?? [];
      if (nbs.length === 0) { nextU[h] = curU[h] ?? 0; nextV[h] = curV[h] ?? 0; continue; }
      let au = 0, av = 0, cnt = 0;
      for (const nb of nbs) {
        au += (curU[nb] ?? 0); av += (curV[nb] ?? 0); cnt++;
      }
      const mu = au / Math.max(1, cnt);
      const mv = av / Math.max(1, cnt);
      nextU[h] = (1 - lambda) * (curU[h] ?? 0) + lambda * mu;
      nextV[h] = (1 - lambda) * (curV[h] ?? 0) + lambda * mv;
    }
    // swap
    for (let h = 0; h < nHE; h++) { curU[h] = nextU[h] ?? 0; curV[h] = nextV[h] ?? 0; }
  }

  // Write back
  for (let h = 0; h < nHE; h++) {
    if (mesh.uv0.get(h)) mesh.uv0.set(h, [curU[h] ?? 0, curV[h] ?? 0]);
  }
}
