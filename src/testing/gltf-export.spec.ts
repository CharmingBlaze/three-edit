import { describe, it, expect } from "vitest";
import { core, io } from "..";

function makeTri(): core.topology.EditableMesh {
  const m = new core.topology.EditableMesh();
  const a = m.addVertex([0,0,0]);
  const b = m.addVertex([1,0,0]);
  const c = m.addVertex([0,1,0]);
  const f = m.addFace([a,b,c]);
  // uvs
  const faces = m.faces(); const hes = m.halfEdges();
  let he = faces[f]!.he;
  const uvs: [number,number][] = [[0,0],[1,0],[0,1]];
  for (let i=0;i<3;i++){ m.uv0.set(he, uvs[i]!); he = hes[he]!.next; }
  return m;
}

function parseGLBHeader(ab: ArrayBuffer){
  const dv = new DataView(ab);
  const magic = dv.getUint32(0, true);
  const version = dv.getUint32(4, true);
  const length = dv.getUint32(8, true);
  return { magic, version, length };
}

function extractJSON(ab: ArrayBuffer){
  const dv = new DataView(ab);
  const total = dv.getUint32(8, true);
  let offset = 12; // after header
  let found: any = null;
  let foundType = 0;
  while (offset + 8 <= total) {
    const len = dv.getUint32(offset, true); offset += 4;
    const type = dv.getUint32(offset, true); offset += 4;
    if (type === 0x4E4F534A) { // 'JSON'
      const jsonBytes = new Uint8Array(ab, offset, len);
      let jsonText = new TextDecoder().decode(jsonBytes);
      // Trim trailing NUL padding per GLB alignment rules
      jsonText = jsonText.replace(/\u0000+$/g, "");
      found = JSON.parse(jsonText); foundType = type; break;
    } else {
      offset += ((len + 3) & ~3); // skip and align
    }
  }
  return { json: found, jsonType: foundType };
}

describe("GLB export", () => {
  it("exports valid GLB with POSITION and optional TEXCOORD_0", () => {
    const mesh = makeTri();
    const glb = io.export_.gltf.exportGLTF(mesh);
    expect(glb.byteLength).toBeGreaterThan(28);
    const header = parseGLBHeader(glb);
    expect(header.magic).toBe(0x46546c67); // 'glTF'
    expect(header.version).toBe(2);

    // Decode whole buffer (JSON chunk appears inside) and assert expected keys
    const text = new TextDecoder().decode(new Uint8Array(glb));
    expect(text).toContain('"asset"');
    expect(text).toContain('"version":"2.0"');
    expect(text).toContain('"POSITION"');
    expect(text).toContain('"TEXCOORD_0"');
  });

  it("includes TANGENT as VEC4 when normals and uvs exist", () => {
    const mesh = makeTri();
    const glb = io.export_.gltf.exportGLTF(mesh);
    const { json } = extractJSON(glb);
    expect(json).toBeTruthy();
    const prim = json.meshes[0].primitives[0];
    expect(prim.attributes.TANGENT).toBeTypeOf("number");
    const tangentAccessorIndex = prim.attributes.TANGENT as number;
    const tangentAccessor = json.accessors[tangentAccessorIndex];
    expect(tangentAccessor.type).toBe("VEC4");
  });
});
