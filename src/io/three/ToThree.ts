import * as THREE from "three";
import { EditableMesh } from "../../core/topology/EditableMesh";
import { faceSides, triVerts, quadVerts, edgeLen } from "../../core/topology/MeshQueries";
import { DefaultTriangulation, TriangulationPolicy } from "../../core/policies";

export function toThreeBufferGeometry(mesh: EditableMesh, policy: TriangulationPolicy = DefaultTriangulation): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  const faces = mesh.faces();
  const hes = mesh.halfEdges();
  const posOut: number[] = [];
  const uvOut: number[] = [];

  // Materials per face -> groups (non-indexed). We'll coalesce consecutive triangles with same material id.
  const matAttr = mesh.faceAttr.get("material") as { get: (f: number) => number | undefined } | undefined;
  const groups: { start: number; count: number; materialIndex: number }[] = [];
  let currentMat = -1;
  let groupStart = 0; // in vertices, since non-indexed
  let emittedVerts = 0;

  const flushGroup = () => {
    const count = emittedVerts - groupStart;
    if (count > 0 && currentMat >= 0) groups.push({ start: groupStart, count, materialIndex: currentMat });
    groupStart = emittedVerts;
  };

  const pushCorner = (vIndex: number, heIndex: number) => {
    const p = mesh.position.get(vIndex)!;
    posOut.push(p[0]!, p[1]!, p[2]!);
    const uv = mesh.uv0.get(heIndex) ?? [0, 0];
    uvOut.push(uv[0]!, uv[1]!);
    emittedVerts += 1;
  };

  const pushTriByVerts = (cornerInfo: Array<{ v: number; he: number }>, a: number, b: number, c: number) => {
    // Find corresponding corners by vertex index
    const ca = cornerInfo.find(ci => ci.v === a)!;
    const cb = cornerInfo.find(ci => ci.v === b)!;
    const cc = cornerInfo.find(ci => ci.v === c)!;
    pushCorner(ca.v, ca.he);
    pushCorner(cb.v, cb.he);
    pushCorner(cc.v, cc.he);
  };

  for (let f = 0; f < faces.length; f++) {
    const face = faces[f];
    if (!face) continue;
    const sides = faceSides(mesh, f);

    // Determine material and manage groups
    const mat = matAttr?.get(f) ?? 0;
    if (mat !== currentMat) {
      flushGroup();
      currentMat = mat;
    }

    // Build corner info loop for this face
    const loop: Array<{ v: number; he: number }> = [];
    let he = face.he;
    for (let i = 0; i < sides; i++) {
      const v = hes[he]!.v;
      loop.push({ v, he });
      he = hes[he]!.next;
    }

    if (sides === 3) {
      // Use face cycle order
      pushCorner(loop[0]!.v, loop[0]!.he);
      pushCorner(loop[1]!.v, loop[1]!.he);
      pushCorner(loop[2]!.v, loop[2]!.he);
    } else if (sides === 4) {
      const [v0, v1, v2, v3] = quadVerts(mesh, f);
      const d1 = edgeLen(mesh, v0, v2);
      const d2 = edgeLen(mesh, v1, v3);
      const choose14 = policy.diagonal === "shortest" ? d1 <= d2 : d1 <= d2; // same policy placeholder
      if (choose14) {
        pushTriByVerts(loop, v0, v1, v2);
        pushTriByVerts(loop, v0, v2, v3);
      } else {
        pushTriByVerts(loop, v1, v2, v3);
        pushTriByVerts(loop, v1, v3, v0);
      }
    } else if (sides > 0) {
      // Simple fan triangulation: (v0, vi, v{i+1})
      for (let i = 1; i < loop.length - 1; i++) {
        pushCorner(loop[0]!.v, loop[0]!.he);
        pushCorner(loop[i]!.v, loop[i]!.he);
        pushCorner(loop[i + 1]!.v, loop[i + 1]!.he);
      }
    }
  }

  // Final flush for last material group
  flushGroup();

  // Decide shading mode: if faceAttr.shading exists and every present face has 0 (smooth), export indexed with pos+uv dedup.
  const shadingAttr = mesh.faceAttr.get("shading") as { get: (f: number) => number | undefined } | undefined;
  let allSmooth = !!shadingAttr;
  for (let f = 0; f < faces.length; f++) {
    const face = faces[f]; if (!face) continue;
    const sv = shadingAttr?.get(f) ?? 0; // default smooth
    if (sv !== 0) { allSmooth = false; break; }
  }

  if (!allSmooth) {
    // Non-indexed (flat-friendly) path
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(posOut), 3));
    if (uvOut.length > 0) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvOut), 2));
    g.clearGroups();
    for (const gr of groups) g.addGroup(gr.start, gr.count, gr.materialIndex);
    g.computeBoundingBox(); g.computeBoundingSphere(); g.computeVertexNormals();
    return g;
  }

  // Smooth path: rebuild as indexed, deduplicating by (position, uv)
  // Reconstruct triangulation again but collect HE corners per triangle
  const rebuildLoop = (f: number) => {
    const face = faces[f]!; const sides = faceSides(mesh, f);
    const loop: Array<{ v: number; he: number }> = []; let he = face.he;
    for (let i = 0; i < sides; i++) { const v = hes[he]!.v; loop.push({ v, he }); he = hes[he]!.next; }
    return loop;
  };
  const triHEs: Array<[number, number, number]> = [];
  const matPerTri: number[] = [];
  for (let f = 0; f < faces.length; f++) {
    const face = faces[f]; if (!face) continue; const sides = faceSides(mesh, f);
    const mat = matAttr?.get(f) ?? 0;
    const loop = rebuildLoop(f);
    if (sides === 3) {
      triHEs.push([loop[0]!.he, loop[1]!.he, loop[2]!.he]);
      matPerTri.push(mat);
    } else if (sides === 4) {
      const [v0, v1, v2, v3] = quadVerts(mesh, f);
      const d1 = edgeLen(mesh, v0, v2); const d2 = edgeLen(mesh, v1, v3);
      const choose14 = policy.diagonal === "shortest" ? d1 <= d2 : d1 <= d2;
      if (choose14) {
        // map verts to their corners
        const c0 = loop.find(c => c.v === v0)!;
        const c1 = loop.find(c => c.v === v1)!;
        const c2 = loop.find(c => c.v === v2)!;
        const c3 = loop.find(c => c.v === v3)!;
        triHEs.push([c0.he, c1.he, c2.he], [c0.he, c2.he, c3.he]);
        matPerTri.push(mat, mat);
      } else {
        const c1 = loop.find(c => c.v === v1)!;
        const c2 = loop.find(c => c.v === v2)!;
        const c3 = loop.find(c => c.v === v3)!;
        const c0 = loop.find(c => c.v === v0)!;
        triHEs.push([c1.he, c2.he, c3.he], [c1.he, c3.he, c0.he]);
        matPerTri.push(mat, mat);
      }
    } else if (sides > 0) {
      // Fan triangulation collecting corner half-edges
      for (let i = 1; i < loop.length - 1; i++) {
        triHEs.push([loop[0]!.he, loop[i]!.he, loop[i + 1]!.he]);
        matPerTri.push(mat);
      }
    }
  }
  // Deduplicate indices by (pos, uv) per corner
  const keyToIndex = new Map<string, number>();
  const indices: number[] = [];
  const posList: number[] = [];
  const uvList: number[] = [];
  // Track groups by material in index space
  g.clearGroups();
  let start = 0; let curMat = matPerTri[0] ?? 0;
  const flush = (end: number, mat: number) => { const count = end - start; if (count > 0) g.addGroup(start, count, mat); start = end; };
  for (let t = 0; t < triHEs.length; t++) {
    const mat = matPerTri[t] ?? 0;
    if (t > 0 && mat !== curMat) { flush(indices.length, curMat); curMat = mat; }
    const tri = triHEs[t]!;
    for (let k = 0; k < 3; k++) {
      const he = tri[k]!;
      const v = hes[he]!.v;
      // Build a key from position and uv for deduplication
      const p = mesh.position.get(v)!;
      const uv = mesh.uv0.get(he) ?? [0, 0];
      const key = `${p[0]}|${p[1]}|${p[2]}|${uv[0]}|${uv[1]}`;
      let idx = keyToIndex.get(key);
      if (idx == null) {
        idx = keyToIndex.size;
        keyToIndex.set(key, idx);
        posList.push(p[0]!, p[1]!, p[2]!);
        uvList.push(uv[0]!, uv[1]!);
      }
      indices.push(idx);
    }
  }
  flush(indices.length, curMat);
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(posList), 3));
  if (uvList.length > 0) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvList), 2));
  g.setIndex(indices);
  g.computeBoundingBox(); g.computeBoundingSphere(); g.computeVertexNormals();
  return g;
}

/**
 * Build a non-indexed THREE.BufferGeometry plus mapping data for picking.
 * Mapping arrays align with THREE's triangle indices:
 * - triFaces[t] -> source face id for triangle t
 * - triCornerHEs[t] -> tuple [he0, he1, he2] for the triangle's three corners (same order as emitted vertices)
 */
export function toThreeWithMapping(
  mesh: EditableMesh,
  policy: TriangulationPolicy = DefaultTriangulation
): {
  geometry: THREE.BufferGeometry;
  triFaces: number[];
  triCornerHEs: Array<[number, number, number]>;
} {
  const g = new THREE.BufferGeometry();
  const faces = mesh.faces();
  const hes = mesh.halfEdges();
  const posOut: number[] = [];
  const uvOut: number[] = [];
  const triFaces: number[] = [];
  const triCornerHEs: Array<[number, number, number]> = [];

  const pushCorner = (vIndex: number, heIndex: number) => {
    const p = mesh.position.get(vIndex)!;
    posOut.push(p[0]!, p[1]!, p[2]!);
    const uv = mesh.uv0.get(heIndex) ?? [0, 0];
    uvOut.push(uv[0]!, uv[1]!);
  };

  const pushTriByVerts = (
    loop: Array<{ v: number; he: number }>,
    a: number,
    b: number,
    c: number,
    faceId: number
  ) => {
    const ca = loop.find((ci) => ci.v === a)!;
    const cb = loop.find((ci) => ci.v === b)!;
    const cc = loop.find((ci) => ci.v === c)!;
    pushCorner(ca.v, ca.he);
    pushCorner(cb.v, cb.he);
    pushCorner(cc.v, cc.he);
    triFaces.push(faceId);
    triCornerHEs.push([ca.he, cb.he, cc.he]);
  };

  for (let f = 0; f < faces.length; f++) {
    const face = faces[f];
    if (!face) continue;
    // Build face loop
    const loop: Array<{ v: number; he: number }> = [];
    let he = face.he;
    let sides = 0;
    do {
      loop.push({ v: hes[he]!.v, he });
      he = hes[he]!.next;
      sides++;
    } while (he !== face.he && sides < 100000); // basic guard

    if (sides === 3) {
      // Emit in cycle order
      pushCorner(loop[0]!.v, loop[0]!.he);
      pushCorner(loop[1]!.v, loop[1]!.he);
      pushCorner(loop[2]!.v, loop[2]!.he);
      triFaces.push(f);
      triCornerHEs.push([loop[0]!.he, loop[1]!.he, loop[2]!.he]);
    } else if (sides === 4) {
      // Pick diagonal using same policy as toThreeBufferGeometry
      // Compute vertices in order to evaluate diagonals
      const v0 = loop[0]!.v, v1 = loop[1]!.v, v2 = loop[2]!.v, v3 = loop[3]!.v;
      const edgeLen = (a: number, b: number) => {
        const pa = mesh.position.get(a)!; const pb = mesh.position.get(b)!;
        const dx = pa[0]! - pb[0]!; const dy = pa[1]! - pb[1]!; const dz = pa[2]! - pb[2]!;
        return Math.hypot(dx, dy, dz);
      };
      const d1 = edgeLen(v0, v2);
      const d2 = edgeLen(v1, v3);
      const choose14 = policy.diagonal === "shortest" ? d1 <= d2 : d1 <= d2; // placeholder, same as above
      if (choose14) {
        pushTriByVerts(loop, v0, v1, v2, f);
        pushTriByVerts(loop, v0, v2, v3, f);
      } else {
        pushTriByVerts(loop, v1, v2, v3, f);
        pushTriByVerts(loop, v1, v3, v0, f);
      }
    } else if (sides > 0) {
      // Fan triangulation
      for (let i = 1; i < loop.length - 1; i++) {
        pushCorner(loop[0]!.v, loop[0]!.he);
        pushCorner(loop[i]!.v, loop[i]!.he);
        pushCorner(loop[i + 1]!.v, loop[i + 1]!.he);
        triFaces.push(f);
        triCornerHEs.push([loop[0]!.he, loop[i]!.he, loop[i + 1]!.he]);
      }
    }
  }

  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(posOut), 3));
  if (uvOut.length > 0) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvOut), 2));
  g.computeBoundingBox();
  g.computeBoundingSphere();
  g.computeVertexNormals();
  return { geometry: g, triFaces, triCornerHEs };
}
