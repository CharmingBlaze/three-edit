import * as THREE from 'three';
import type { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export type GizmoMode = 'translate'|'rotate'|'scale';
export type GizmoSpace = 'world'|'local';

export interface GizmoAdapter {
  readonly object: THREE.Object3D;
  readonly control?: TransformControls; // optional for adapters that expose it
  addTo(scene: THREE.Scene): void;
  attach(target: THREE.Object3D): void;
  detach(): void;
  dispose(): void;
  setMode(m: GizmoMode): void;
  getMode(): GizmoMode;
  setSpace(s: GizmoSpace): void;
  setSnaps(opts: Partial<{ translate: number; rotate: number; scale: number }>): void;
  setVisible(v: boolean): void;
  on(event: 'dragging-changed'|'change', listener: (e: any) => void): void;
}
