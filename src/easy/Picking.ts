import * as THREE from 'three';

export type Mapping = { triFaces?: number[] };

export type PickResult = {
  tri: number;
  face?: number;
  raw?: THREE.Intersection;
  // Future: edge:[number,number], vert:number
};

export function pick(x: number, y: number, camera: THREE.Camera, meshObj: THREE.Mesh, mapping?: Mapping): PickResult | null {
  const rect = (meshObj as any).__rendererDomRect || (meshObj as any).domRect || document.body.getBoundingClientRect();
  const nx = ((x - rect.left) / rect.width) * 2 - 1;
  const ny = -((y - rect.top) / rect.height) * 2 + 1;
  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(nx, ny), camera);
  const hits = ray.intersectObject(meshObj, true);
  if (!hits.length) return null;
  const h = hits[0]!;
  const tri = h.faceIndex != null ? Math.floor(h.faceIndex) : 0;
  const res: PickResult = { tri, raw: h };
  if (mapping?.triFaces && mapping.triFaces[tri] != null){
    res.face = mapping.triFaces[tri]!;
  }
  return res;
}
