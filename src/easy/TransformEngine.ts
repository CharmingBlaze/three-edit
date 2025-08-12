import * as THREE from 'three';

// Minimal EditableMesh typing to avoid circular deps
export interface EditableLike {
  position: {
    get(v: number): [number, number, number];
    set(v: number, p: [number, number, number]): void;
  };
}

export function applyTranslate(
  verts: number[],
  deltaWorld: THREE.Vector3,
  meshObj: THREE.Object3D,
  editable: EditableLike
): void {
  if (deltaWorld.lengthSq() === 0 || verts.length === 0) return;
  const p0 = new THREE.Vector3();
  const p1 = new THREE.Vector3();
  meshObj.worldToLocal(p0.copy(new THREE.Vector3())); // noop to get inv matrix ready
  // Convert world delta to local delta via two points
  const localDelta = meshObj.worldToLocal(p1.copy(deltaWorld.clone())).sub(meshObj.worldToLocal(p0.set(0,0,0)));
  for (const v of verts){
    const p = editable.position.get(v);
    editable.position.set(v, [p[0] + localDelta.x, p[1] + localDelta.y, p[2] + localDelta.z]);
  }
}

export function applyRotate(
  verts: number[],
  deltaQuat: THREE.Quaternion,
  pivotWorld: THREE.Vector3,
  meshObj: THREE.Object3D,
  editable: EditableLike
): void {
  if (verts.length === 0) return;
  const pivot = pivotWorld.clone();
  for (const v of verts){
    const p = editable.position.get(v);
    const world = meshObj.localToWorld(new THREE.Vector3(p[0], p[1], p[2]));
    const off = world.sub(pivot).applyQuaternion(deltaQuat);
    const nw = pivot.clone().add(off);
    const nl = meshObj.worldToLocal(nw);
    editable.position.set(v, [nl.x, nl.y, nl.z]);
  }
}

export function applyScale(
  verts: number[],
  deltaScale: THREE.Vector3,
  pivotWorld: THREE.Vector3,
  gizmoRot: THREE.Quaternion,
  meshObj: THREE.Object3D,
  editable: EditableLike
): void {
  if (verts.length === 0) return;
  const pivot = pivotWorld.clone();
  const rot = gizmoRot.clone();
  const rotInv = gizmoRot.clone().invert();
  for (const v of verts){
    const p = editable.position.get(v);
    const world = meshObj.localToWorld(new THREE.Vector3(p[0], p[1], p[2]));
    const off = world.sub(pivot).applyQuaternion(rotInv);
    off.set(off.x * deltaScale.x, off.y * deltaScale.y, off.z * deltaScale.z);
    const nw = pivot.clone().add(off.applyQuaternion(rot));
    const nl = meshObj.worldToLocal(nw);
    editable.position.set(v, [nl.x, nl.y, nl.z]);
  }
}
