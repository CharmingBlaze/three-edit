import * as THREE from 'three';

export type CursorOptions = {
  size?: number;           // visual size of the cursor in world units
  colorAxes?: number;      // color for axes helper
  colorRing?: number;      // color for ring circle
  visible?: boolean;
};

/**
 * 3D Cursor helper: manages a world-space pivot/marker you can use as a custom pivot.
 * Adds a small visual (axes + ring). You can position it in world space and show/hide it.
 */
export class Cursor3D {
  readonly group: THREE.Group;
  private _axes: THREE.AxesHelper;
  private _ring: THREE.Line;
  private _size: number;

  constructor(opts: CursorOptions = {}){
    this._size = opts.size ?? 0.25;
    this.group = new THREE.Group();
    this.group.matrixAutoUpdate = true;

    // Axes
    this._axes = new THREE.AxesHelper(this._size);
    (this._axes.material as THREE.LineBasicMaterial).linewidth = 1;
    this.group.add(this._axes);

    // Ring (XY plane circle)
    const ringGeom = new THREE.BufferGeometry();
    const segments = 32;
    const positions: number[] = [];
    for (let i=0; i<=segments; i++){
      const t = (i/segments) * Math.PI*2;
      positions.push(Math.cos(t)*this._size*0.8, Math.sin(t)*this._size*0.8, 0);
    }
    ringGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const ringMat = new THREE.LineBasicMaterial({ color: opts.colorRing ?? 0xffff00, depthTest: true });
    this._ring = new THREE.Line(ringGeom, ringMat);
    this.group.add(this._ring);

    this.setVisible(opts.visible ?? true);
  }

  addTo(scene: THREE.Scene){ scene.add(this.group); }
  removeFrom(scene: THREE.Scene){ scene.remove(this.group); }

  setPosition(world: THREE.Vector3 | [number,number,number]){
    const v = Array.isArray(world) ? new THREE.Vector3(world[0],world[1],world[2]) : world;
    this.group.position.copy(v);
    this.group.updateMatrixWorld();
  }

  getPosition(target = new THREE.Vector3()): THREE.Vector3{
    return target.copy(this.group.getWorldPosition(new THREE.Vector3()));
  }

  setVisible(v: boolean){ this.group.visible = v; }
  get visible(){ return this.group.visible; }

  setSize(size: number){
    this._size = size;
    this._axes.scale.setScalar(size / (this._axes as any).size || 1);
    // rebuild ring
    const segments = 32; const positions: number[] = [];
    for (let i=0; i<=segments; i++){
      const t = (i/segments) * Math.PI*2;
      positions.push(Math.cos(t)*this._size*0.8, Math.sin(t)*this._size*0.8, 0);
    }
    (this._ring.geometry as THREE.BufferGeometry).setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    (this._ring.geometry as THREE.BufferGeometry).computeBoundingSphere();
  }
}
