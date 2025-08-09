// Minimal GLB (glTF 2.0) exporter
import { EditableMesh } from "../../core/topology/EditableMesh";
import { toThreeBufferGeometry } from "../three/ToThree";

type BV = { buffer: number; byteOffset: number; byteLength: number; target?: number; byteStride?: number };
type Acc = { bufferView: number; byteOffset?: number; componentType: number; count: number; type: string; max?: number[]; min?: number[] };

// Helpers
function align4(n: number) { return (n + 3) & ~3; }
function encodeText(s: string) { return new TextEncoder().encode(s); }

export function exportGLTF(mesh: EditableMesh): ArrayBuffer {
  // Build BufferGeometry using existing adapter (handles triangulation, groups, uvs)
  const geom = toThreeBufferGeometry(mesh);
  const posAttr = geom.getAttribute("position");
  if (!posAttr) return new ArrayBuffer(0);
  const uvAttr = geom.getAttribute("uv");
  const nrmAttr = geom.getAttribute("normal");
  const indexAttr = geom.getIndex();

  // Gather raw arrays
  // Construct views with correct offsets/counts
  const positions = new Float32Array(
    (posAttr.array as ArrayBufferView).buffer,
    (posAttr.array as ArrayBufferView).byteOffset,
    posAttr.count * posAttr.itemSize
  );
  const uvs = uvAttr
    ? new Float32Array(
        (uvAttr.array as ArrayBufferView).buffer,
        (uvAttr.array as ArrayBufferView).byteOffset,
        uvAttr.count * uvAttr.itemSize
      )
    : null;
  const normals = nrmAttr
    ? new Float32Array(
        (nrmAttr.array as ArrayBufferView).buffer,
        (nrmAttr.array as ArrayBufferView).byteOffset,
        nrmAttr.count * nrmAttr.itemSize
      )
    : null;
  // Compute tangents if we have positions, normals, and uvs
  function computeTangents(
    pos: Float32Array,
    uv: Float32Array,
    nrm: Float32Array,
    idx: Uint32Array | null
  ): Float32Array {
    const vcount = pos.length / 3;
    const tan1 = new Float32Array(vcount * 3);
    const tan2 = new Float32Array(vcount * 3);
    const add3 = (a: Float32Array, i: number, x: number, y: number, z: number) => {
      const ax = a[i] ?? 0; const ay = a[i + 1] ?? 0; const az = a[i + 2] ?? 0;
      a[i] = ax + x; a[i + 1] = ay + y; a[i + 2] = az + z;
    };
    const processTri = (i0: number, i1: number, i2: number) => {
      const x0 = pos[i0 * 3] ?? 0, y0 = pos[i0 * 3 + 1] ?? 0, z0 = pos[i0 * 3 + 2] ?? 0;
      const x1 = pos[i1 * 3] ?? 0, y1 = pos[i1 * 3 + 1] ?? 0, z1 = pos[i1 * 3 + 2] ?? 0;
      const x2 = pos[i2 * 3] ?? 0, y2 = pos[i2 * 3 + 1] ?? 0, z2 = pos[i2 * 3 + 2] ?? 0;
      const u0 = uv[i0 * 2] ?? 0, v0 = uv[i0 * 2 + 1] ?? 0;
      const u1 = uv[i1 * 2] ?? 0, v1 = uv[i1 * 2 + 1] ?? 0;
      const u2 = uv[i2 * 2] ?? 0, v2 = uv[i2 * 2 + 1] ?? 0;
      const dx1 = x1 - x0, dy1 = y1 - y0, dz1 = z1 - z0;
      const dx2 = x2 - x0, dy2 = y2 - y0, dz2 = z2 - z0;
      const du1 = u1 - u0, dv1 = v1 - v0;
      const du2 = u2 - u0, dv2 = v2 - v0;
      const r = (du1 * dv2 - du2 * dv1);
      const inv = Math.abs(r) > 1e-8 ? 1.0 / r : 0.0;
      const tx = (dv2 * dx1 - dv1 * dx2) * inv;
      const ty = (dv2 * dy1 - dv1 * dy2) * inv;
      const tz = (dv2 * dz1 - dv1 * dz2) * inv;
      const bx = (du1 * dx2 - du2 * dx1) * inv;
      const by = (du1 * dy2 - du2 * dy1) * inv;
      const bz = (du1 * dz2 - du2 * dz1) * inv;
      add3(tan1, i0 * 3, tx, ty, tz);
      add3(tan1, i1 * 3, tx, ty, tz);
      add3(tan1, i2 * 3, tx, ty, tz);
      add3(tan2, i0 * 3, bx, by, bz);
      add3(tan2, i1 * 3, bx, by, bz);
      add3(tan2, i2 * 3, bx, by, bz);
    };
    if (idx) {
      for (let i = 0; i + 2 < idx.length; i += 3) {
        processTri(idx[i]!, idx[i + 1]!, idx[i + 2]!);
      }
    } else {
      for (let i = 0; i + 2 < vcount; i += 3) {
        processTri(i, i + 1, i + 2);
      }
    }
    const out = new Float32Array(vcount * 4);
    for (let i = 0; i < vcount; i++) {
      const nx = nrm[i * 3] ?? 0, ny = nrm[i * 3 + 1] ?? 0, nz = nrm[i * 3 + 2] ?? 0;
      let tx = tan1[i * 3] ?? 0, ty = tan1[i * 3 + 1] ?? 0, tz = tan1[i * 3 + 2] ?? 0;
      const bx = tan2[i * 3] ?? 0, by = tan2[i * 3 + 1] ?? 0, bz = tan2[i * 3 + 2] ?? 0;
      // Gram-Schmidt: t = normalize(T - N * dot(N,T))
      const ndott = nx * tx + ny * ty + nz * tz;
      tx -= nx * ndott; ty -= ny * ndott; tz -= nz * ndott;
      const tlen = Math.hypot(tx, ty, tz) || 1.0;
      tx /= tlen; ty /= tlen; tz /= tlen;
      // Handedness = sign(dot(cross(N,T), B))
      const cx = ny * tz - nz * ty;
      const cy = nz * tx - nx * tz;
      const cz = nx * ty - ny * tx;
      const handed = (cx * bx + cy * by + cz * bz) < 0 ? -1 : 1;
      out[i * 4] = tx; out[i * 4 + 1] = ty; out[i * 4 + 2] = tz; out[i * 4 + 3] = handed;
    }
    return out;
  }
  // Defer tangent computation until indices are known
  let tangents: Float32Array | null = null;
  let indices: Uint32Array | null = null;
  if (indexAttr) {
    const src = indexAttr.array as ArrayLike<number>;
    // Normalize to Uint32Array
    indices = new Uint32Array(indexAttr.count);
    for (let i = 0; i < indexAttr.count; i++) indices[i] = src[i] as number;
  }
  if (uvs && normals) {
    tangents = computeTangents(positions, uvs, normals, indices);
  }

  // Build BIN contents and descriptors
  const binParts: Uint8Array[] = [];
  const bufferViews: BV[] = [];
  const accessors: Acc[] = [];
  let binByteLength = 0;

  // positions BV/Accessor
  const posBuf = new Uint8Array(positions.buffer as ArrayBuffer, positions.byteOffset, positions.byteLength);
  const posOffset = align4(binByteLength);
  if (posOffset > binByteLength) binParts.push(new Uint8Array(posOffset - binByteLength));
  binParts.push(posBuf);
  bufferViews.push({ buffer: 0, byteOffset: posOffset, byteLength: positions.byteLength, target: 34962 });
  const posCount = positions.length / 3;
  // compute bounds
  const pmin = [Infinity, Infinity, Infinity];
  const pmax = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]!, y = positions[i + 1]!, z = positions[i + 2]!;
    if (x < pmin[0]!) pmin[0] = x; if (y < pmin[1]!) pmin[1] = y; if (z < pmin[2]!) pmin[2] = z;
    if (x > pmax[0]!) pmax[0] = x; if (y > pmax[1]!) pmax[1] = y; if (z > pmax[2]!) pmax[2] = z;
  }
  accessors.push({ bufferView: bufferViews.length - 1, componentType: 5126, count: posCount, type: "VEC3", min: pmin, max: pmax });
  binByteLength = posOffset + positions.byteLength;

  // normals BV/Accessor (optional)
  let normalAccessorIndex: number | undefined;
  if (normals) {
    const nBuf = new Uint8Array(normals.buffer as ArrayBuffer, normals.byteOffset, normals.byteLength);
    const nOffset = align4(binByteLength);
    if (nOffset > binByteLength) binParts.push(new Uint8Array(nOffset - binByteLength));
    binParts.push(nBuf);
    bufferViews.push({ buffer: 0, byteOffset: nOffset, byteLength: normals.byteLength, target: 34962 });
    const nCount = normals.length / 3;
    normalAccessorIndex = accessors.length;
    accessors.push({ bufferView: bufferViews.length - 1, componentType: 5126, count: nCount, type: "VEC3" });
    binByteLength = nOffset + normals.byteLength;
  }

  // uvs BV/Accessor (optional)
  let uvAccessorIndex: number | undefined;
  if (uvs) {
    const uvBuf = new Uint8Array(uvs.buffer as ArrayBuffer, uvs.byteOffset, uvs.byteLength);
    const uvOffset = align4(binByteLength);
    if (uvOffset > binByteLength) binParts.push(new Uint8Array(uvOffset - binByteLength));
    binParts.push(uvBuf);
    bufferViews.push({ buffer: 0, byteOffset: uvOffset, byteLength: uvs.byteLength, target: 34962 });
    const uvCount = uvs.length / 2;
    uvAccessorIndex = accessors.length;
    accessors.push({ bufferView: bufferViews.length - 1, componentType: 5126, count: uvCount, type: "VEC2" });
    binByteLength = uvOffset + uvs.byteLength;
  }

  // tangents BV/Accessor (optional)
  let tangentAccessorIndex: number | undefined;
  if (tangents) {
    const tBuf = new Uint8Array(tangents.buffer as ArrayBuffer, tangents.byteOffset, tangents.byteLength);
    const tOffset = align4(binByteLength);
    if (tOffset > binByteLength) binParts.push(new Uint8Array(tOffset - binByteLength));
    binParts.push(tBuf);
    bufferViews.push({ buffer: 0, byteOffset: tOffset, byteLength: tangents.byteLength, target: 34962 });
    const tCount = tangents.length / 4;
    tangentAccessorIndex = accessors.length;
    accessors.push({ bufferView: bufferViews.length - 1, componentType: 5126, count: tCount, type: "VEC4" });
    binByteLength = tOffset + tangents.byteLength;
  }

  // indices BV/Accessor (optional)
  let indexAccessorIndex: number | undefined;
  if (indices) {
    const idxBuf = new Uint8Array(indices.buffer as ArrayBuffer, indices.byteOffset, indices.byteLength);
    const idxOffset = align4(binByteLength);
    if (idxOffset > binByteLength) binParts.push(new Uint8Array(idxOffset - binByteLength));
    binParts.push(idxBuf);
    bufferViews.push({ buffer: 0, byteOffset: idxOffset, byteLength: indices.byteLength, target: 34963 });
    indexAccessorIndex = accessors.length;
    accessors.push({ bufferView: bufferViews.length - 1, componentType: 5125, count: indices.length, type: "SCALAR" }); // 5125 = UNSIGNED_INT
    binByteLength = idxOffset + indices.byteLength;
  }

  // Concat BIN
  const binAligned = align4(binByteLength);
  if (binAligned > binByteLength) binParts.push(new Uint8Array(binAligned - binByteLength));
  const bin = new Uint8Array(binAligned);
  let ptr = 0;
  for (const part of binParts) { bin.set(part, ptr); ptr += part.byteLength; }

  // glTF JSON
  const json = {
    asset: { version: "2.0", generator: "three-edit" },
    buffers: [{ byteLength: bin.byteLength }],
    bufferViews,
    accessors,
    meshes: [{
      primitives: [{
        attributes: {
          POSITION: 0,
          ...(normalAccessorIndex != null ? { NORMAL: normalAccessorIndex } : {}),
          ...(uvAccessorIndex != null ? { TEXCOORD_0: uvAccessorIndex } : {}),
          ...(tangentAccessorIndex != null ? { TANGENT: tangentAccessorIndex } : {})
        },
        ...(indexAccessorIndex != null ? { indices: indexAccessorIndex } : {}),
        mode: 4 // TRIANGLES
      }]
    }],
    nodes: [{ mesh: 0 }],
    scenes: [{ nodes: [0] }],
    scene: 0
  } as const;

  const jsonBytes = encodeText(JSON.stringify(json));
  const jsonAligned = align4(jsonBytes.byteLength);
  const jsonPadded = new Uint8Array(jsonAligned);
  jsonPadded.set(jsonBytes);

  // GLB container
  // Header: magic (glTF), version (2), length
  // Chunk0: JSON (type JSON), Chunk1: BIN (type BIN)
  const headerSize = 12;
  const chunkHeaderSize = 8;
  const totalLength = headerSize + chunkHeaderSize + jsonPadded.byteLength + chunkHeaderSize + bin.byteLength;
  const glb = new ArrayBuffer(totalLength);
  const dv = new DataView(glb);
  let o = 0;
  // magic 'glTF' = 0x46546C67
  dv.setUint32(o, 0x46546C67, true); o += 4;
  dv.setUint32(o, 2, true); o += 4;
  dv.setUint32(o, totalLength, true); o += 4;
  // JSON chunk
  dv.setUint32(o, jsonPadded.byteLength, true); o += 4;
  dv.setUint32(o, 0x4E4F534A, true); o += 4; // 'JSON'
  new Uint8Array(glb, o, jsonPadded.byteLength).set(jsonPadded); o += jsonPadded.byteLength;
  // BIN chunk
  dv.setUint32(o, bin.byteLength, true); o += 4;
  dv.setUint32(o, 0x004E4942, true); o += 4; // 'BIN\0'
  new Uint8Array(glb, o, bin.byteLength).set(bin);

  return glb;
}
