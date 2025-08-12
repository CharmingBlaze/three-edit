import { EditableMesh } from "../core/topology/EditableMesh";
import { HEID, VID } from "../core/types";
import { bridgeEdges as coreBridgeEdges } from "../core/topology/build";

/**
 * Bridge two equal-length loops.
 * Accepts either vertex loops (preferred for simple cycles) or half-edge loops.
 */
export function bridgeLoops(mesh: EditableMesh, loopA: VID[] | HEID[], loopB: VID[] | HEID[]): number[] {
  if (loopA.length !== loopB.length) throw new Error("bridgeLoops requires equal-length loops");
  if (loopA.length < 2) return [];
  // If vertex ids provided, synthesize corresponding half-edge loops by scanning each face loop.
  // For MVP, allow caller to pass HEID[] for deterministic pairing.
  const isHE = typeof loopA[0] === "number" && typeof loopB[0] === "number";
  const HE = mesh.halfEdges();
  let heA: HEID[] = [];
  let heB: HEID[] = [];
  if (isHE) { heA = loopA as HEID[]; heB = loopB as HEID[]; }
  else {
    // Best-effort: build HE loop by finding edges whose to-vertex matches sequence order.
    // This assumes input loops are consecutive boundary rings.
    const toHE = (ring: VID[]): HEID[] => {
      const out: HEID[] = [];
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i]!; const b = ring[(i+1)%ring.length]!;
        // Search local outgoing around vertex a; O(valence) fallback for MVP.
        let found: HEID | null = null;
        const start = mesh.vertices()[a]!.he; let h = start; const limit = HE.length;
        for (let j=0; j<limit && h>=0; j++) {
          if (HE[h]!.v === b) { found = h as HEID; break; }
          const tw = HE[h]!.twin; h = tw >= 0 ? HE[tw]!.next : -1;
          if (h === start) break;
        }
        if (found == null) throw new Error("bridgeLoops: could not resolve half-edge for vertex ring");
        out.push(found);
      }
      return out;
    };
    heA = toHE(loopA as VID[]); heB = toHE(loopB as VID[]);
  }
  const res = coreBridgeEdges(mesh, heA, heB);
  return res.faces as number[];
}
