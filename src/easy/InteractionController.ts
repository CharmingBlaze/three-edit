import * as THREE from 'three';
import { SelectionManager } from './SelectionManager';
import { applyTranslate, applyRotate, applyScale } from './TransformEngine';
import type { EventHub } from './EventHub';

export interface InteractionDeps {
  dom: HTMLElement;
  camera: THREE.Camera;
  meshObj: THREE.Object3D;
  editable: any; // EditableMesh
  selection: SelectionManager;
  hub?: EventHub;
  // TransformControls-like object (optional). We only check for .dragging when present.
  getGizmoControl?: () => { dragging?: boolean } | undefined;
  // Callbacks to host
  onEditedTick?: () => void;
  onEditedCommit?: () => void;
}

// Lightweight controller to allow mouse-drag screen-plane translation without relying on TransformControls.
export class InteractionController {
  private deps: InteractionDeps;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private mode: 'translate'|'rotate'|'scale' = 'translate';

  constructor(deps: InteractionDeps){
    this.deps = deps;
    this.attach();
    // Track gizmo mode to mirror interactions
    this.deps.hub?.on('gizmo.mode.changed', (e: any)=>{
      const m = e?.mode as 'translate'|'rotate'|'scale'|undefined;
      if (m) this.mode = m;
    });
  }

  setEditable(editable: any){ this.deps.editable = editable; }
  setMeshObj(obj: THREE.Object3D){ this.deps.meshObj = obj; }

  dispose(){
    const dom = this.deps.dom;
    dom.removeEventListener('pointerdown', this.onDown);
    dom.removeEventListener('pointermove', this.onMove);
    dom.removeEventListener('pointerup', this.onUp);
  }

  private attach(){
    const dom = this.deps.dom;
    dom.addEventListener('pointerdown', this.onDown);
    dom.addEventListener('pointermove', this.onMove);
    dom.addEventListener('pointerup', this.onUp);
    dom.addEventListener('contextmenu', (e)=> e.preventDefault());
  }

  private onDown = (e: PointerEvent) => {
    if (e.button !== 0) return; // left only
    const tc = this.deps.getGizmoControl?.();
    if (tc && (tc as any).dragging) return; // gizmo owns drag
    this.dragging = true;
    this.lastX = e.clientX; this.lastY = e.clientY;
  };

  private onMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    const tc = this.deps.getGizmoControl?.();
    if (tc && (tc as any).dragging) return; // gizmo owns drag

    const dx = (e.clientX - this.lastX);
    const dy = (e.clientY - this.lastY);
    this.lastX = e.clientX; this.lastY = e.clientY;

    const camera = this.deps.camera as THREE.PerspectiveCamera;
    const dist = Math.hypot(camera.position.x, camera.position.y, camera.position.z);
    const scale = 0.002 * dist;
    const delta: [number, number, number] = [dx * scale, -dy * scale, 0];

    const viewRight = new THREE.Vector3();
    const viewUp = new THREE.Vector3();
    camera.getWorldDirection(viewUp).negate(); // forward
    viewRight.crossVectors(camera.up, viewUp).normalize();
    const viewUpOrtho = new THREE.Vector3().crossVectors(viewUp, viewRight).normalize();
    const worldDelta = new THREE.Vector3()
      .addScaledVector(viewRight, delta[0])
      .addScaledVector(viewUpOrtho, delta[1]);

    // Optional snapping with modifiers
    if (e.shiftKey || e.ctrlKey){
      // Choose step based on modifier and distance
      const base = e.ctrlKey ? 0.05 : 0.25; // fine vs coarse
      const step = base * dist;
      // Quantize components in the screen basis
      const compRight = worldDelta.dot(viewRight);
      const compUp = worldDelta.dot(viewUpOrtho);
      const qRight = Math.round(compRight / step) * step;
      const qUp = Math.round(compUp / step) * step;
      worldDelta.copy(new THREE.Vector3())
        .addScaledVector(viewRight, qRight)
        .addScaledVector(viewUpOrtho, qUp);
    }

    const selection = this.deps.selection;
    const editable = this.deps.editable;
    const meshObj = this.deps.meshObj;

    const verts = selection.getVerticesForEdit(editable);
    if (!verts.length) return;

    if (this.mode === 'translate'){
      applyTranslate(verts, worldDelta, meshObj, editable);
      this.deps.onEditedTick?.();
      return;
    }

    if (this.mode === 'rotate'){
      // Rotate around view axis using pointer delta
      const viewDir = new THREE.Vector3();
      camera.getWorldDirection(viewDir);
      const angle = (dx - dy) * 0.003; // sensitivity
      const dq = new THREE.Quaternion().setFromAxisAngle(viewDir.normalize(), angle);
      const pivot = selection.getCentroid(editable, meshObj);
      applyRotate(verts, dq, pivot, meshObj, editable);
      this.deps.onEditedTick?.();
      return;
    }

    if (this.mode === 'scale'){
      // Uniform scale around centroid based on vertical drag
      const s = Math.max(0.01, 1 + (-dy) * 0.003);
      const deltaScale = new THREE.Vector3(s, s, s);
      const pivot = selection.getCentroid(editable, meshObj);
      const gizmoRot = new THREE.Quaternion(); // uniform, orientation irrelevant
      applyScale(verts, deltaScale, pivot, gizmoRot, meshObj, editable);
      this.deps.onEditedTick?.();
      return;
    }
  };

  private onUp = (_e: PointerEvent) => {
    if (!this.dragging) return;
    this.dragging = false;
    this.deps.onEditedCommit?.();
  };
}
