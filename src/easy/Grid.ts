import * as THREE from 'three';

export type GridOptions = {
  size?: number;
  divisions?: number;
  colorCenterLine?: number;
  colorGrid?: number;
  showAxes?: boolean;
  axesSize?: number;
};

/** GridAxes provides a ground grid and optional axes helper with simple show/hide and sizing. */
export class GridAxes {
  readonly group: THREE.Group;
  readonly grid: THREE.GridHelper;
  readonly axes?: THREE.AxesHelper;

  constructor(opts: GridOptions = {}){
    const size = opts.size ?? 50;
    const divisions = opts.divisions ?? 50;
    this.grid = new THREE.GridHelper(size, divisions, opts.colorCenterLine ?? 0x404040, opts.colorGrid ?? 0x303030);
    // @ts-ignore linewidth not widely supported
    (this.grid.material as any).linewidth = 1;
    this.group = new THREE.Group();
    this.group.add(this.grid);

    if (opts.showAxes ?? true){
      this.axes = new THREE.AxesHelper(opts.axesSize ?? Math.min(5, size*0.1));
      this.group.add(this.axes);
    }
  }

  addTo(scene: THREE.Scene){ scene.add(this.group); }
  removeFrom(scene: THREE.Scene){ scene.remove(this.group); }

  setVisible(v: boolean){ this.group.visible = v; }
  get visible(){ return this.group.visible; }

  setGrid(size: number, divisions: number){
    const parent = this.group.parent as THREE.Object3D | null;
    if (parent) parent.remove(this.grid);
    const newGrid = new THREE.GridHelper(size, divisions, (this.grid as any).material?.color?.getHex?.() ?? 0x404040, 0x303030);
    this.group.add(newGrid);
    // @ts-ignore
    (newGrid.material as any).linewidth = 1;
    this.grid.geometry.dispose();
    // @ts-ignore
    (this as any).grid = newGrid;
  }
}
