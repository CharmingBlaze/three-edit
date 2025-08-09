import { EditableMesh } from "../../core/topology/EditableMesh";

/**
 * Export a minimal Wavefront MTL file for materials used by faces.
 * - Emits materials named `mat_<id>` where id is the per-face material index.
 * - Simple Kd only; no textures.
 */
export function exportMTL(mesh: EditableMesh): string {
  const F = mesh.faces();
  const matAttr = mesh.faceAttr.get("material") as { get: (f: number) => number | undefined } | undefined;
  const used = new Set<number>();
  if (matAttr) {
    for (let f = 0; f < F.length; f++) {
      if (!F[f]) continue;
      const m = matAttr.get(f);
      if (m != null) used.add(m);
    }
  }
  if (used.size === 0) used.add(0);

  const lines: string[] = [];
  lines.push(`# Exported by three-edit`);
  used.forEach((id) => {
    lines.push(`newmtl mat_${id}`);
    // neutral gray diffuse
    lines.push(`Kd 0.8 0.8 0.8`);
  });
  return lines.join("\n") + "\n";
}
