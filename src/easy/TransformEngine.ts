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

// Overloads:
// 1) applyRotate(verts, deltaQuat, pivotWorld, meshObj, editable)
// 2) applyRotate(verts, { pivot, axis, angle }, meshObj, editable)
export function applyRotate(
  verts: number[],
  deltaQuat: THREE.Quaternion,
  pivotWorld: THREE.Vector3,
  meshObj: THREE.Object3D,
  editable: EditableLike
): void;
export function applyRotate(
  verts: number[],
  params: { pivot: THREE.Vector3; axis: THREE.Vector3; angle: number },
  meshObj: THREE.Object3D,
  editable: EditableLike
): void;
export function applyRotate(
  verts: number[],
  a: any,
  b: any,
  c: any,
  d?: any
): void {
  if (verts.length === 0) return;
  let dq: THREE.Quaternion;
  let pivot: THREE.Vector3;
  let meshObj: THREE.Object3D;
  let editable: EditableLike;
  if (a && typeof a.w === 'number' && b && 'x' in b && 'y' in b && 'z' in b) {
    // Signature 1
    dq = a as THREE.Quaternion;
    pivot = (b as THREE.Vector3).clone();
    meshObj = c as THREE.Object3D;
    editable = d as EditableLike;
  } else {
    // Signature 2
    const params = a as { pivot: THREE.Vector3; axis: THREE.Vector3; angle: number };
    pivot = params.pivot.clone();
    dq = new THREE.Quaternion().setFromAxisAngle(params.axis, params.angle);
    meshObj = b as THREE.Object3D;
    editable = c as EditableLike;
  }
  for (const v of verts){
    const p = editable.position.get(v);
    const world = meshObj.localToWorld(new THREE.Vector3(p[0], p[1], p[2]));
    const off = world.sub(pivot).applyQuaternion(dq);
    const nw = pivot.clone().add(off);
    const nl = meshObj.worldToLocal(nw);
    editable.position.set(v, [nl.x, nl.y, nl.z]);
  }
}

// Overloads:
// 1) applyScale(verts, deltaScale, pivotWorld, gizmoRot, meshObj, editable)
// 2) applyScale(verts, { pivot, scale }, meshObj, editable) // assumes identity gizmo rotation
export function applyScale(
  verts: number[],
  deltaScale: THREE.Vector3,
  pivotWorld: THREE.Vector3,
  gizmoRot: THREE.Quaternion,
  meshObj: THREE.Object3D,
  editable: EditableLike
): void;
export function applyScale(
  verts: number[],
  params: { pivot: THREE.Vector3; scale: THREE.Vector3 },
  meshObj: THREE.Object3D,
  editable: EditableLike
): void;
export function applyScale(
  verts: number[],
  a: any,
  b: any,
  c: any,
  d?: any,
  e?: any,
  f?: any
): void {
  if (verts.length === 0) return;
  let scale: THREE.Vector3;
  let pivot: THREE.Vector3;
  let rot: THREE.Quaternion;
  let meshObj: THREE.Object3D;
  let editable: EditableLike;
  if (a && 'x' in a && b && 'x' in b && c && typeof c.w === 'number'){
    // Signature 1
    scale = a as THREE.Vector3;
    pivot = (b as THREE.Vector3).clone();
    rot = (c as THREE.Quaternion).clone();
    meshObj = d as THREE.Object3D;
    editable = e as EditableLike;
  } else {
    const params = a as { pivot: THREE.Vector3; scale: THREE.Vector3 };
    scale = params.scale.clone();
    pivot = params.pivot.clone();
    rot = new THREE.Quaternion(); // identity
    meshObj = b as THREE.Object3D;
    editable = c as EditableLike;
  }
  const rotInv = rot.clone().invert();
  for (const v of verts){
    const p = editable.position.get(v);
    const world = meshObj.localToWorld(new THREE.Vector3(p[0], p[1], p[2]));
    const off = world.sub(pivot).applyQuaternion(rotInv);
    off.set(off.x * scale.x, off.y * scale.y, off.z * scale.z);
    const nw = pivot.clone().add(off.applyQuaternion(rot));
    const nl = meshObj.worldToLocal(nw);
    editable.position.set(v, [nl.x, nl.y, nl.z]);
  }
}
