import { EditableMesh } from "../../core/topology/EditableMesh";
import { BufferAttribute, BufferGeometry } from "three";
import { ScalarAttr } from "../../core/attributes/ScalarAttr";

export function fromThreeBufferGeometry(geom: BufferGeometry): EditableMesh {
  const mesh = new EditableMesh();

  // Source attributes
  const pos = geom.getAttribute("position") as BufferAttribute | undefined;
  if (!pos) return mesh;
  const uv = geom.getAttribute("uv") as BufferAttribute | undefined;
  const idx = geom.getIndex();

  // Create vertices, tracking mapping from source index -> VID
  const srcIndexForVID: number[] = [];
  const vidForSrc: number[] = [];
  const addVertexFromSrc = (src: number): number => {
    let v = vidForSrc[src]!;
    if (v == null) {
      const x = pos.getX(src);
      const y = pos.getY(src);
      const z = pos.getZ(src);
      v = mesh.addVertex([x, y, z]);
      vidForSrc[src] = v;
      srcIndexForVID[v] = src;
    }
    return v;
  };

  // Pre-create non-indexed mapping if geometry is non-indexed
  if (!idx) {
    const count = pos.count;
    vidForSrc.length = count;
    for (let i = 0; i < count; i++) addVertexFromSrc(i);
  }

  // Prepare face material attribute
  const matAttr = new ScalarAttr(0);
  mesh.faceAttr.set("material", matAttr);

  // Helper to get group materialIndex for a given index offset (in indices array)
  const groups = geom.groups ?? [];
  let gptr = 0;
  const groupForOffset = (offset: number): number => {
    // Advance pointer while offset goes beyond current group range
    while (gptr + 1 < groups.length) {
      const g = groups[gptr];
      if (!g) break;
      if (offset >= g.start + g.count) {
        gptr++;
        continue;
      }
      break;
    }
    const g = groups[gptr];
    if (g && offset >= g.start && offset < g.start + g.count) return g.materialIndex ?? 0;
    return 0;
  };

  // Iterate triangles
  if (idx) {
    const indexArray = idx.array as ArrayLike<number>;
    for (let i = 0; i + 2 < idx.count; i += 3) {
      const aSrc = indexArray[i] as number;
      const bSrc = indexArray[i + 1] as number;
      const cSrc = indexArray[i + 2] as number;
      const a = addVertexFromSrc(aSrc);
      const b = addVertexFromSrc(bSrc);
      const c = addVertexFromSrc(cSrc);
      const f = mesh.addFace([a, b, c]);
      // per-face material
      matAttr.resize(f + 1);
      matAttr.set(f, groupForOffset(i));
      // per-corner UVs
      if (uv) {
        const faces = mesh.faces();
        const hes = mesh.halfEdges();
        let he = faces[f]!.he;
        // he.v corresponds to the corner at that vertex
        for (let k = 0; k < 3; k++) {
          const vAtCorner = hes[he]!.v;
          const src = srcIndexForVID[vAtCorner]!;
          const u = uv.getX(src);
          const v = uv.getY(src);
          mesh.uv0.set(he, [u, v]);
          he = hes[he]!.next;
        }
      }
    }
  } else {
    // Non-indexed: assume triangles laid out sequentially in position attribute
    const triCount = Math.floor(pos.count / 3);
    for (let t = 0; t < triCount; t++) {
      const a = t * 3 + 0;
      const b = t * 3 + 1;
      const c = t * 3 + 2;
      const va = vidForSrc[a]!;
      const vb = vidForSrc[b]!;
      const vc = vidForSrc[c]!;
      const f = mesh.addFace([va, vb, vc]);
      matAttr.resize(f + 1);
      matAttr.set(f, 0);
      if (uv) {
        const faces = mesh.faces();
        const hes = mesh.halfEdges();
        let he = faces[f]!.he;
        for (let k = 0; k < 3; k++) {
          const vAtCorner = hes[he]!.v;
          const src = srcIndexForVID[vAtCorner]!;
          const u = uv.getX(src);
          const v = uv.getY(src);
          mesh.uv0.set(he, [u, v]);
          he = hes[he]!.next;
        }
      }
    }
  }

  return mesh;
}
