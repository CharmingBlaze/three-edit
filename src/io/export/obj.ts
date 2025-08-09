// OBJ export (functional)
import { EditableMesh } from "../../core/topology/EditableMesh";
import { faceSides } from "../../core/topology/MeshQueries";

/**
 * Export mesh to Wavefront OBJ format as a string.
 * - Writes `v` and `vt` (no `vn` for now).
 * - Faces reference per-corner UVs using `v/vt` indices.
 * - Emits object groups per face material index if present (`usemtl mat_<id>`).
 */
export function exportOBJ(mesh: EditableMesh, options?: { mtlFileName?: string }): string {
  const V = mesh.vertices();
  const F = mesh.faces();
  const HE = mesh.halfEdges();

  const lines: string[] = [];
  lines.push(`# Exported by three-edit`);
  if (options?.mtlFileName) {
    lines.push(`mtllib ${options.mtlFileName}`);
  }

  // 1) Vertices
  const vBase = 1; // OBJ is 1-based
  for (let v = 0; v < V.length; v++) {
    if (!V[v]) continue;
    const p = mesh.position.get(v)!;
    lines.push(`v ${p[0]} ${p[1]} ${p[2]}`);
  }

  // 1b) Vertex normals (optional: we always emit current normals array)
  for (let v = 0; v < V.length; v++) {
    if (!V[v]) continue;
    const n = mesh.normal.get(v)!;
    if (n) lines.push(`vn ${n[0]} ${n[1]} ${n[2]}`);
  }

  // 2) Gather unique UVs per-corner -> vt indices
  const uvKeyToVT = new Map<string, number>();
  const vtList: [number, number][] = [];
  const getVT = (he: number): number | undefined => {
    const uv = mesh.uv0.get(he);
    if (!uv) return undefined;
    const key = `${uv[0]}|${uv[1]}`;
    let idx = uvKeyToVT.get(key);
    if (idx == null) {
      idx = vtList.length + vBase; // 1-based
      uvKeyToVT.set(key, idx);
      vtList.push([uv[0], uv[1]]);
    }
    return idx;
  };

  // 3) Materials per face (optional) -> we will switch usemtl when material changes
  const matAttr = mesh.faceAttr.get("material") as { get: (f: number) => number | undefined } | undefined;
  let currentMat: number | undefined = undefined;

  // We must iterate faces to accumulate vt as well
  for (let f = 0; f < F.length; f++) {
    const face = F[f];
    if (!face) continue;
    const sides = faceSides(mesh, f);
    // material switch
    const m = matAttr?.get(f);
    if (m !== undefined && m !== currentMat) {
      lines.push(`usemtl mat_${m}`);
      currentMat = m;
    }
    // ensure vt existence mapping for this face's corners
    let he = face.he;
    for (let i = 0; i < sides; i++) {
      getVT(he);
      he = HE[he]!.next;
    }
  }

  // Emit all vt after ensuring we discovered them
  for (const uv of vtList) lines.push(`vt ${uv[0]} ${uv[1]}`);

  // 4) Faces as polygons with v/vt (no vn)
  for (let f = 0; f < F.length; f++) {
    const face = F[f];
    if (!face) continue;
    const sides = faceSides(mesh, f);
    const tokens: string[] = [];
    let he = face.he;
    for (let i = 0; i < sides; i++) {
      const v = HE[he]!.v;
      const vt = getVT(he);
      // vn index equals vertex index (1-based)
      const vn = v + vBase;
      if (vt != null) tokens.push(`${v + vBase}/${vt}/${vn}`);
      else tokens.push(`${v + vBase}//${vn}`);
      he = HE[he]!.next;
    }
    if (tokens.length >= 3) lines.push(`f ${tokens.join(" ")}`);
  }

  return lines.join("\n") + "\n";
}
