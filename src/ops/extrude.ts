import { Command, CommandCtx } from "./Command";
import { HEID, FID, VID } from "../core/types";
import { facesToBoundaryLoops } from "../core/topology/loops";
import { duplicateBoundaryLoop, makeFace, deleteFaces } from "../core/topology/build";
import { getCornerUV, setCornerUV } from "../core/topology/corners";
import { averageNormalOfFaces } from "../core/topology/MeshQueries";
import { ScalarAttr } from "../core/attributes/ScalarAttr";

export class ExtrudeFacesCommand implements Command {
  name = "Extrude Faces";
  private createdF: FID[] = [];
  private createdV: VID[] = [];
  constructor(private faces: FID[], private offset: number) {}

  private prevOf(mesh: any, he: HEID): HEID {
    // Walk face cycle to find previous half-edge whose next is he
    const HE = mesh.halfEdges();
    let cur = he as number;
    for (let i = 0; i < HE.length; i++) { const n = HE[cur]!.next; if (n === he) return cur as HEID; cur = n; }
    return he; // fallback
  }

  do({ mesh }: CommandCtx) {
    const faceSet = new Set<FID>(this.faces);
    const loops = facesToBoundaryLoops(mesh, faceSet);
    const HE = mesh.halfEdges();
    const materialAttr = mesh.faceAttr.get("material") as ScalarAttr | undefined;

    for (const loop of loops) {
      // Duplicate boundary loop verts
      const { old2newV } = duplicateBoundaryLoop(mesh, loop);

      // Build side quads and copy UVs
      for (let i = 0; i < loop.length; i++) {
        const he = loop[i]!;
        const heNext = loop[(i + 1) % loop.length]!;
        const vB = HE[he]!.v as VID;               // to-vertex of he
        const prev = this.prevOf(mesh, he);
        const vA = HE[prev]!.v as VID;             // from-vertex of he
        const nvA = old2newV.get(vA)!; const nvB = old2newV.get(vB)!;

        const f = makeFace(mesh, [vA, vB, nvB, nvA]);
        this.createdF.push(f);

        // Propagate material from the source face on the boundary if attribute exists
        if (materialAttr) {
          const srcF = HE[he]!.face as FID;
          const mat = materialAttr.get(srcF) ?? 0;
          materialAttr.resize(f + 1);
          materialAttr.set(f, mat);
        }

        // Map new face half-edges in same order to set per-corner UVs by to-vertex
        const start = mesh.faces()[f]!.he as HEID; const h0 = start; const h1 = HE[h0]!.next as HEID; const h2 = HE[h1]!.next as HEID; const h3 = HE[h2]!.next as HEID;
        // Original boundary corner UVs (directed boundary corners)
        const uvB = getCornerUV(mesh, he);   // at corner to vB
        const uvA = getCornerUV(mesh, prev); // at corner to vA
        // Assign by to-vertex: vA->uvA, vB->uvB, nvB->uvB, nvA->uvA
        const mapHe = [h0, h1, h2, h3];
        const mapV =  [vA, vB, nvB, nvA];
        for (let k=0;k<4;k++) {
          const toV = mapV[k]!; const heK = mapHe[k]!;
          if (toV === vA) setCornerUV(mesh, heK, uvA);
          else if (toV === vB) setCornerUV(mesh, heK, uvB);
          else if (toV === nvB) setCornerUV(mesh, heK, uvB);
          else if (toV === nvA) setCornerUV(mesh, heK, uvA);
        }
      }

      // Cap face from duplicated verts (order follows loop to-vertices)
      const capVerts: VID[] = loop.map((he) => {
        const v = HE[he]!.v as VID; return old2newV.get(v)!;
      });
      const capF = makeFace(mesh, capVerts);
      this.createdF.push(capF); this.createdV.push(...capVerts);

      // Propagate material to cap from the first boundary face (if available)
      if (materialAttr && loop.length > 0) {
        const srcF = HE[loop[0]!]!.face as FID;
        const mat = materialAttr.get(srcF) ?? 0;
        materialAttr.resize(capF + 1);
        materialAttr.set(capF, mat);
      }

      // Copy cap corner UVs from boundary 1:1 by to-vertex order
      const capStart = mesh.faces()[capF]!.he as HEID; let h = capStart; for (let i = 0; i < capVerts.length; i++) {
        const srcHe = loop[i]!; const uv = getCornerUV(mesh, srcHe); setCornerUV(mesh, h, uv); h = HE[h]!.next as HEID; }

      // Offset cap verts along averaged normal
      const n = averageNormalOfFaces(mesh, this.faces);
      for (const v of capVerts) {
        const p = mesh.position.get(v);
        mesh.position.set(v, [p[0] + n[0] * this.offset, p[1] + n[1] * this.offset, p[2] + n[2] * this.offset]);
      }
    }
  }

  undo({ mesh }: CommandCtx) {
    // Remove created faces; isolated verts are ignored in MVP
    deleteFaces(mesh, this.createdF);
  }
}
