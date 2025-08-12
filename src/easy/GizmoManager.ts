import * as THREE from 'three';
import type { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import type { GizmoAdapter, GizmoMode as AdapterMode, GizmoSpace as AdapterSpace } from './gizmos/GizmoAdapter';
import { TransformControlsGizmo } from './gizmos/TransformControlsGizmo';
import { SelectionManager } from './SelectionManager';
import type { EventHub } from './EventHub';
import { defaultHub } from './EventHub';

export type GizmoMode = 'translate'|'rotate'|'scale';
export type GizmoSpace = 'world'|'local';
export type PivotMode = 'centroid'|'origin'|'cursor';

export interface GizmoOptions {
  mode?: GizmoMode;
  space?: GizmoSpace;
  pivot?: PivotMode;
  snap?: { translate?: number; rotate?: number; scale?: number };
}

export interface GizmoDeps {
  scene: THREE.Scene;
  camera: THREE.Camera;
  dom: HTMLElement;
  meshObj: THREE.Mesh;
  editable: any; // EditableMesh
  selection: SelectionManager;
  history?: { beginDrag?: () => void; commitDrag?: () => void; cancelDrag?: () => void; push?: (c:any)=>void };
  options?: GizmoOptions;
  onDraggingChanged?: (dragging: boolean) => void;
  onEditedTick?: () => void;
  onEditedCommit?: () => void;
  hub?: EventHub;
  adapter?: GizmoAdapter; // optional custom gizmo implementation
}

export class GizmoManager {
  private deps: GizmoDeps;
  private gizmo: GizmoAdapter;
  private mode: GizmoMode = 'translate';
  private space: GizmoSpace = 'world';
  private pivot: PivotMode = 'centroid';
  private snap = { translate: 0, rotate: 0, scale: 0 };
  private target = new THREE.Object3D();
  private lastPos = new THREE.Vector3();
  private lastMat = new THREE.Matrix4();
  private cursor = new THREE.Vector3();
  private dragging = false;
  private hub: EventHub;

  constructor(deps: GizmoDeps){
    this.deps = deps;
    this.hub = deps.hub ?? defaultHub;
    const o = deps.options ?? {};
    this.mode = o.mode ?? 'translate';
    this.space = o.space ?? (this.mode === 'translate' ? 'world' : 'local');
    this.pivot = o.pivot ?? 'centroid';
    this.snap = { translate: o.snap?.translate ?? 0, rotate: o.snap?.rotate ?? 0, scale: o.snap?.scale ?? 0 };

    // Gizmo adapter (default: TransformControls)
    this.gizmo = deps.adapter ?? new TransformControlsGizmo(deps.camera, deps.dom);
    this.gizmo.addTo(deps.scene);
    this.gizmo.setMode(this.mode as AdapterMode);
    this.gizmo.setSpace(this.space as AdapterSpace);
    this.gizmo.setSnaps({ translate: this.snap.translate, rotate: this.snap.rotate, scale: this.snap.scale });

    this.bindEvents();
    // Listen to selection changes to keep gizmo in sync
    this.hub.on('selection.changed', () => this.refresh());
    this.refresh();
  }

  // Host can check if the cursor is currently over a gizmo handle.
  pointerOverGizmo(): boolean { return !!(this.gizmo as any).control?.axis; }
  getControl(): TransformControls { return (this.gizmo as any).control as TransformControls; }

  // Public API
  setMode(m: GizmoMode){ this.mode = m; this.gizmo.setMode(m as AdapterMode); this.setSpace(m === 'translate' ? 'world' : 'local'); this.refresh(); this.hub.emit('gizmo.mode.changed', { mode: m }); }
  setSpace(s: GizmoSpace){ this.space = s; this.gizmo.setSpace(s as AdapterSpace); }
  setPivot(p: PivotMode){ this.pivot = p; this.refresh(); this.hub.emit('pivot.changed', { pivot: p }); }
  setCursor(v: THREE.Vector3){ this.cursor.copy(v); this.refresh(); }
  setSnap(s: Partial<{ translate: number; rotate: number; scale: number }>) {
    this.snap = { ...this.snap, ...s } as any;
    this.gizmo.setSnaps(s);
  }

  refresh(){
    const { meshObj, editable, selection } = this.deps;
    // Determine pivot position in world space
    let pivotW: THREE.Vector3;
    if (this.pivot === 'origin'){
      pivotW = meshObj.getWorldPosition(new THREE.Vector3());
    } else if (this.pivot === 'cursor'){
      pivotW = this.cursor.clone();
    } else {
      pivotW = selection.getCentroid(editable, meshObj);
    }
    this.target.position.copy(pivotW);
    this.target.updateMatrixWorld(true);

    const hasSel = selection.hasAny();
    if (!hasSel){ this.detach(); return; }
    // Ensure the gizmo target is part of the scene graph before attaching
    if (!this.target.parent) this.deps.scene.add(this.target);
    this.gizmo.attach(this.target);
    this.gizmo.setVisible(true);
    this.lastPos.copy(this.target.position);
    this.lastMat.copy(this.target.matrixWorld);
  }

  dispose(){
    this.gizmo.dispose();
    if (this.target.parent) this.target.parent.remove(this.target);
  }

  // Internals
  private detach(){
    this.gizmo.detach();
    this.gizmo.setVisible(false);
    if (this.target.parent) this.target.parent.remove(this.target);
  }

  private bindEvents(){
    const { selection, history } = this.deps;
    this.gizmo.on('dragging-changed', (e: any) => {
      if (e.value){
        this.dragging = true;
        this.lastPos.copy(this.target.position);
        this.lastMat.copy(this.target.matrixWorld);
        history?.beginDrag?.();
        this.deps.onDraggingChanged?.(true);
      } else {
        this.dragging = false;
        // recenter to updated centroid if using centroid pivot
        if (this.pivot === 'centroid') this.refresh();
        history?.commitDrag?.();
        this.deps.onDraggingChanged?.(false);
        this.deps.onEditedCommit?.();
      }
    });

    this.gizmo.on('change', () => {
      if (!this.dragging) return;
      this.onGizmoChange();
    });
  }

  private onGizmoChange(){
    const { meshObj, editable, selection } = this.deps;
    const mode = this.gizmo.getMode();

    if (mode === 'translate'){
      const cur = this.target.position.clone();
      const deltaWorld = cur.clone().sub(this.lastPos);
      if (deltaWorld.lengthSq() === 0) return;
      // Convert world delta to mesh local delta for direct vertex move
      const p0 = meshObj.worldToLocal(this.lastPos.clone());
      const p1 = meshObj.worldToLocal(cur.clone());
      const dLocal = p1.sub(p0);
      const verts: number[] = selection.getVerticesForEdit(editable);
      for (const v of verts){
        const p = editable.position.get(v) as [number,number,number];
        editable.position.set(v, [p[0] + dLocal.x, p[1] + dLocal.y, p[2] + dLocal.z]);
      }
      this.lastPos.copy(cur);
      this.deps.onEditedTick?.();
      return;
    }

    if (mode === 'rotate'){
      this.target.updateMatrixWorld(true);
      const curM = this.target.matrixWorld.clone();
      const deltaM = new THREE.Matrix4().copy(this.lastMat).invert().multiply(curM);
      const dq = new THREE.Quaternion(); const dt = new THREE.Vector3(); const ds = new THREE.Vector3();
      deltaM.decompose(dt, dq, ds);
      if (dq.equals(new THREE.Quaternion())){ this.lastMat.copy(curM); return; }
      const pivotW = this.target.position.clone();
      const verts: number[] = selection.getVerticesForEdit(editable);
      for (const v of verts){
        const p = editable.position.get(v) as [number,number,number];
        const w = meshObj.localToWorld(new THREE.Vector3(p[0],p[1],p[2]));
        const off = w.sub(pivotW).applyQuaternion(dq);
        const nw = pivotW.clone().add(off);
        const nl = meshObj.worldToLocal(nw);
        editable.position.set(v, [nl.x, nl.y, nl.z]);
      }
      this.lastMat.copy(curM);
      this.deps.onEditedTick?.();
      return;
    }

    if (mode === 'scale'){
      this.target.updateMatrixWorld(true);
      const curM = this.target.matrixWorld.clone();
      const deltaM = new THREE.Matrix4().copy(this.lastMat).invert().multiply(curM);
      const dq = new THREE.Quaternion(); const dt = new THREE.Vector3(); const ds = new THREE.Vector3();
      deltaM.decompose(dt, dq, ds);
      const scaleChanged = Math.abs(ds.x-1)+Math.abs(ds.y-1)+Math.abs(ds.z-1) > 1e-9;
      if (!scaleChanged){ this.lastMat.copy(curM); return; }
      const pivotW = this.target.position.clone();
      const gizmoRot = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().extractRotation(this.target.matrixWorld));
      const gizmoRotInv = gizmoRot.clone().invert();
      const verts: number[] = selection.getVerticesForEdit(editable);
      for (const v of verts){
        const p = editable.position.get(v) as [number,number,number];
        const w = meshObj.localToWorld(new THREE.Vector3(p[0],p[1],p[2]));
        const off = w.sub(pivotW).applyQuaternion(gizmoRotInv);
        off.set(off.x * ds.x, off.y * ds.y, off.z * ds.z);
        const nw = pivotW.clone().add(off.applyQuaternion(gizmoRot));
        const nl = meshObj.worldToLocal(nw);
        editable.position.set(v, [nl.x, nl.y, nl.z]);
      }
      this.lastMat.copy(curM);
      this.deps.onEditedTick?.();
      return;
    }
  }
}
