import { EditableMesh } from "../../core/topology/EditableMesh";
import { ScalarAttr } from "../../core/attributes/ScalarAttr";

// Very simple OBJ importer: supports v, vt, and f with v or v/vt. Triangulates ngons by fan.
export function importOBJ(text: string): EditableMesh {
  const mesh = new EditableMesh();
  const positions: [number, number, number][] = [];
  const uvs: [number, number][] = [];
  const vns: [number, number, number][] = [];
  // material handling
  const matAttr = new ScalarAttr(0);
  mesh.faceAttr.set("material", matAttr);
  const matNameToId = new Map<string, number>();
  let currentMat: number | undefined = undefined;

  // Map of OBJ vertex index (1-based) => VID in EditableMesh
  const vidForObjIndex: number[] = [];

  const getVID = (objIndex: number): number => {
    const idx = objIndex - 1; // OBJ is 1-based
    let v = vidForObjIndex[idx]!;
    if (v == null) {
      const p = positions[idx];
      if (!p) throw new Error(`OBJ references missing vertex index ${objIndex}`);
      v = mesh.addVertex([p[0], p[1], p[2]]);
      vidForObjIndex[idx] = v;
    }
    return v;
  };

  const lines = text.split(/\r?\n/);
  for (const lineRaw of lines) {
    const line = lineRaw.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(/\s+/);
    const tag = parts[0];
    if (tag === "v") {
      const x = parseFloat(parts[1] ?? "0");
      const y = parseFloat(parts[2] ?? "0");
      const z = parseFloat(parts[3] ?? "0");
      positions.push([x, y, z]);
    } else if (tag === "vt") {
      const u = parseFloat(parts[1] ?? "0");
      const v = parseFloat(parts[2] ?? "0");
      uvs.push([u, v]);
    } else if (tag === "vn") {
      const x = parseFloat(parts[1] ?? "0");
      const y = parseFloat(parts[2] ?? "0");
      const z = parseFloat(parts[3] ?? "0");
      vns.push([x, y, z]);
    } else if (tag === "usemtl") {
      const name = parts[1] ?? "default";
      let id = matNameToId.get(name);
      if (id == null) { id = matNameToId.size; matNameToId.set(name, id); }
      currentMat = id;
    }
  }

  // Second pass for faces to ensure we added all vertices first
  for (const lineRaw of lines) {
    const line = lineRaw.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(/\s+/);
    const tag = parts[0];
    if (tag === "f") {
      // tokens like v, or v/vt, or v//vn, or v/vt/vn — we only care up to vt
      const faceTokens = parts.slice(1);
      if (faceTokens.length < 3) continue;

      // Build arrays of (vid, vtIndex or undefined, vnIndex or undefined) in face order
      const verts: number[] = [];
      const vtIdx: (number | undefined)[] = [];
      const vnIdx: (number | undefined)[] = [];
      for (const tok of faceTokens) {
        const [vStr, vtStr, vnStr] = tok.split("/");
        const vObj = parseInt(vStr!, 10);
        const vtObj = vtStr ? parseInt(vtStr, 10) : NaN;
        const vnObj = vnStr ? parseInt(vnStr, 10) : NaN;
        const vid = getVID(vObj);
        verts.push(vid);
        vtIdx.push(Number.isFinite(vtObj) ? vtObj : undefined);
        vnIdx.push(Number.isFinite(vnObj) ? vnObj : undefined);
      }

      // Triangulate by fan: (0, i, i+1)
      for (let i = 1; i + 1 < verts.length; i++) {
        const a = verts[0]!;
        const b = verts[i]!;
        const c = verts[i + 1]!;
        const f = mesh.addFace([a, b, c]);
        // Assign face material if active
        if (currentMat != null) { matAttr.resize(f + 1); matAttr.set(f, currentMat); }
        // Assign per-corner uv from vt indices if present
        const faces = mesh.faces();
        const hes = mesh.halfEdges();
        let he = faces[f]!.he;
        const corners = [0, i, i + 1];
        for (let k = 0; k < 3; k++) {
          const vtIndex = vtIdx[corners[k]!] ?? undefined;
          if (vtIndex != null) {
            const uv = uvs[vtIndex - 1];
            if (uv) mesh.uv0.set(he, [uv[0], uv[1]]);
          }
          he = hes[he]!.next;
        }

        // Accumulate per-vertex normals if vn provided
        for (const corner of corners) {
          const vnIndex = vnIdx[corner!] ?? undefined;
          if (vnIndex != null) {
            const n = vns[vnIndex - 1];
            if (n) {
              const v = [a, b, c][corner === 0 ? 0 : (corner === i ? 1 : 2)]!;
              const cur = mesh.normal.get(v);
              mesh.normal.set(v, [cur[0] + n[0], cur[1] + n[1], cur[2] + n[2]]);
            }
          }
        }
      }
    }
  }

  // Normalize accumulated vertex normals if any were set
  const V = mesh.vertices();
  for (let v = 0; v < V.length; v++) {
    if (!V[v]) continue;
    const n = mesh.normal.get(v);
    const len = Math.hypot(n[0], n[1], n[2]);
    if (len > 1e-12) mesh.normal.set(v, [n[0] / len, n[1] / len, n[2] / len]);
  }

  return mesh;
}
