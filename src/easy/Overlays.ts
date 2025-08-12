import * as THREE from 'three';

// Lightweight overlay manager for showing verts/edges/faces.
// Usage: call show* to add/update, hide* to remove. All helpers are stored in a single Group per scene.

const OVERLAY_TAG = '__three_edit_easy_overlays__';

function getGroup(scene: THREE.Scene): THREE.Group {
  let g = (scene as any)[OVERLAY_TAG] as THREE.Group | undefined;
  if (!g){
    g = new THREE.Group();
    g.name = 'ThreeEdit.Overlays';
    (scene as any)[OVERLAY_TAG] = g;
    scene.add(g);
  }
  return g;
}

function makePoints(positions: number[], color: number, size: number){
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color, size, sizeAttenuation: true, depthTest: true });
  return new THREE.Points(geom, mat);
}

function makeLines(positions: number[], color: number){
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const mat = new THREE.LineBasicMaterial({ color, linewidth: 1 });
  return new THREE.LineSegments(geom, mat);
}

function makeFaces(positions: number[], color: number, opacity: number){
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ color, transparent: opacity < 1, opacity, side: THREE.DoubleSide, depthWrite: false });
  return new THREE.Mesh(geom, mat);
}

export function hideAll(scene: THREE.Scene){
  const g = getGroup(scene);
  g.clear();
}

export function showAllVerts(editable: any, scene: THREE.Scene, opts?: { color?: number; size?: number }){
  const g = getGroup(scene);
  // Remove existing verts helper
  const old = g.getObjectByName('verts'); if (old) g.remove(old);
  const positions: number[] = [];
  const V = editable.vertices?.() ?? [];
  for (let i=0;i<V.length;i++) if (V[i]){
    const p = editable.position.get(i) as [number,number,number];
    positions.push(p[0], p[1], p[2]);
  }
  const pts = makePoints(positions, opts?.color ?? 0x44ccff, opts?.size ?? 4);
  pts.name = 'verts';
  g.add(pts);
  return pts as THREE.Points;
}

export function showVerts(vertIds: number[], editable: any, scene: THREE.Scene, opts?: { color?: number; size?: number }){
  const g = getGroup(scene);
  const old = g.getObjectByName('verts'); if (old) g.remove(old);
  const positions: number[] = [];
  for (const v of vertIds){ const p = editable.position.get(v) as [number,number,number]; positions.push(p[0], p[1], p[2]); }
  const pts = makePoints(positions, opts?.color ?? 0x44ccff, opts?.size ?? 4);
  pts.name = 'verts'; g.add(pts); return pts;
}

export function showAllEdges(editable: any, scene: THREE.Scene, opts?: { color?: number }){
  const g = getGroup(scene);
  const old = g.getObjectByName('edges'); if (old) g.remove(old);
  const positions: number[] = [];
  const HE = editable.halfEdges?.();
  if (HE){
    const seen = new Set<string>();
    for (let i=0;i<HE.length;i++){
      const he = HE[i]; if (!he) continue;
      const a = he.v; const b = HE[he.next]?.v; if (a==null||b==null) continue;
      const key = a < b ? `${a}|${b}` : `${b}|${a}`; if (seen.has(key)) continue; seen.add(key);
      const pa = editable.position.get(a) as [number,number,number];
      const pb = editable.position.get(b) as [number,number,number];
      positions.push(pa[0],pa[1],pa[2], pb[0],pb[1],pb[2]);
    }
  }
  const lines = makeLines(positions, opts?.color ?? 0xffffff);
  lines.name = 'edges'; g.add(lines); return lines;
}

export function showEdges(edgeList: Array<[number,number]>, editable: any, scene: THREE.Scene, opts?: { color?: number }){
  const g = getGroup(scene);
  const old = g.getObjectByName('edges'); if (old) g.remove(old);
  const positions: number[] = [];
  for (const [a,b] of edgeList){
    const pa = editable.position.get(a) as [number,number,number];
    const pb = editable.position.get(b) as [number,number,number];
    positions.push(pa[0],pa[1],pa[2], pb[0],pb[1],pb[2]);
  }
  const lines = makeLines(positions, opts?.color ?? 0xffffff);
  lines.name = 'edges'; g.add(lines); return lines;
}

export function showAllFaces(editable: any, meshObj: THREE.Mesh, scene: THREE.Scene, opts?: { color?: number; opacity?: number }){
  const g = getGroup(scene);
  const old = g.getObjectByName('faces'); if (old) g.remove(old);
  const positions: number[] = [];
  // Use current triangulated geometry from meshObj
  const pos = (meshObj.geometry as THREE.BufferGeometry).getAttribute('position') as THREE.BufferAttribute;
  for (let i=0;i<pos.count;i++){
    positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
  }
  const mesh = makeFaces(positions, opts?.color ?? 0x88ff88, opts?.opacity ?? 0.2);
  mesh.name = 'faces'; g.add(mesh); return mesh;
}

export function showFaces(faceIds: number[], meshObj: THREE.Mesh, mapping: { triFaces: number[] }, scene: THREE.Scene, opts?: { color?: number; opacity?: number }){
  const g = getGroup(scene);
  const old = g.getObjectByName('faces'); if (old) g.remove(old);
  const positions: number[] = [];
  const pos = (meshObj.geometry as THREE.BufferGeometry).getAttribute('position') as THREE.BufferAttribute;
  for (let tri=0; tri<mapping.triFaces.length; tri++){
    const f = mapping.triFaces[tri];
    if (f === undefined) continue;
    if (!faceIds.includes(f)) continue;
    for (let k=0;k<3;k++){
      const i = tri*3 + k;
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
    }
  }
  const mesh = makeFaces(positions, opts?.color ?? 0x88ff88, opts?.opacity ?? 0.2);
  mesh.name = 'faces'; g.add(mesh); return mesh;
}

export const Overlays = { getGroup, hideAll, showAllVerts, showVerts, showAllEdges, showEdges, showAllFaces, showFaces };
