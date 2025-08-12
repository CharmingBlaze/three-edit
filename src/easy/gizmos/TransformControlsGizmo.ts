import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import type { GizmoAdapter, GizmoMode, GizmoSpace } from './GizmoAdapter';

export class TransformControlsGizmo implements GizmoAdapter {
  public readonly object: THREE.Object3D;
  public readonly control: TransformControls;

  constructor(camera: THREE.Camera, dom: HTMLElement){
    this.control = new TransformControls(camera, dom);
    this.object = (this.control as unknown as THREE.Object3D);
  }

  addTo(scene: THREE.Scene): void {
    const root = (this.control as any)._root as THREE.Object3D | undefined;
    if (root) { if (!root.parent) scene.add(root); }
    else { if (!this.object.parent) scene.add(this.object); }
  }

  attach(target: THREE.Object3D): void { this.control.attach(target); }
  detach(): void { this.control.detach(); }

  dispose(): void {
    const root = (this.control as any)._root as THREE.Object3D | undefined;
    if (root && root.parent) root.parent.remove(root);
    if (!root && this.object.parent) this.object.parent.remove(this.object);
    (this as any).control = null;
  }

  setMode(m: GizmoMode): void { this.control.setMode(m); }
  getMode(): GizmoMode { return this.control.getMode() as GizmoMode; }
  setSpace(s: GizmoSpace): void { this.control.setSpace(s); }

  setSnaps(opts: Partial<{ translate: number; rotate: number; scale: number }>): void {
    if (opts.translate != null) this.control.setTranslationSnap(opts.translate);
    if (opts.rotate != null) this.control.setRotationSnap(opts.rotate);
    if (opts.scale != null) this.control.setScaleSnap(opts.scale);
  }

  setVisible(v: boolean): void {
    const root = (this.control as any)._root as THREE.Object3D | undefined;
    if (root) root.visible = v; else (this.object as any).visible = v;
  }

  on(event: 'dragging-changed'|'change', listener: (e: any) => void): void {
    this.control.addEventListener(event, listener as any);
  }
}
