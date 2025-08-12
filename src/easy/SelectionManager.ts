import * as THREE from 'three';
import type { EventHub } from './EventHub';
import { defaultHub } from './EventHub';

export type EditMode = 'object' | 'vertex' | 'edge' | 'face';

export class SelectionManager {
  mode: EditMode = 'object';
  objectSelected = true;
  verts = new Set<number>();
  edges = new Set<string>(); // "a|b" with a<b
  faces = new Set<number>();
  private hub: EventHub;

  constructor(hub?: EventHub){
    this.hub = hub ?? defaultHub;
    // make selection.changed sticky so late subscribers get latest selection state
    this.hub.sticky('selection.changed', true);
  }

  setMode(m: EditMode){
    this.mode = m;
    this.hub.emit('selection.changed', { reason: 'mode' });
  }

  clear(){
    this.objectSelected = this.mode === 'object' ? false : this.objectSelected;
    this.verts.clear();
    this.edges.clear();
    this.faces.clear();
    this.hub.emit('selection.changed', { reason: 'clear' });
  }

  hasAny(){
    if (this.mode === 'object') return this.objectSelected;
    if (this.mode === 'vertex') return this.verts.size > 0;
    if (this.mode === 'edge') return this.edges.size > 0;
    return this.faces.size > 0;
  }

  toggleFromPick(hit: any){
    if (!hit) return;
    if (this.mode === 'object'){
      this.objectSelected = !this.objectSelected;
      this.hub.emit('selection.changed', { reason: 'pick' });
      return;
    }
    if (this.mode === 'vertex' && hit.vert != null){
      const id = hit.vert as number;
      if (this.verts.has(id)) this.verts.delete(id); else this.verts.add(id);
      this.hub.emit('selection.changed', { reason: 'pick' });
      return;
    }
    if (this.mode === 'edge' && hit.edge){
      const [a, b] = hit.edge as [number, number];
      const key = a < b ? `${a}|${b}` : `${b}|${a}`;
      if (this.edges.has(key)) this.edges.delete(key); else this.edges.add(key);
      this.hub.emit('selection.changed', { reason: 'pick' });
      return;
    }
    if (this.mode === 'face' && hit.face != null){
      const f = hit.face as number;
      if (this.faces.has(f)) this.faces.delete(f); else this.faces.add(f);
      this.hub.emit('selection.changed', { reason: 'pick' });
    }
  }

  getVerticesForEdit(editable: any): number[]{
    if (this.mode === 'object' && this.objectSelected){
      const V = editable.vertices?.() ?? [];
      const ids: number[] = [];
      for (let i=0;i<V.length;i++) if (V[i]) ids.push(i);
      return ids;
    }
    if (this.mode === 'vertex') return Array.from(this.verts);
    if (this.mode === 'edge'){
      const unique = new Set<number>();
      const HE = editable.halfEdges?.();
      if (HE){
        for (const k of this.edges){
          const parts = k.split('|');
          const a = Number(parts[0]);
          const b = Number(parts[1]);
          if (Number.isFinite(a)) unique.add(a);
          if (Number.isFinite(b)) unique.add(b);
        }
      }
      return Array.from(unique);
    }
    // face
    const unique = new Set<number>();
    const HE = editable.halfEdges?.();
    const F = editable.faces?.();
    if (HE && F){
      for (const f of this.faces){
        const face = F[f]; if (!face) continue;
        let h = face.he; const s = h; let guard=0;
        do {
          const heRec = HE[h]; if (!heRec) break;
          unique.add(heRec.v as number);
          h = heRec.next as number;
        } while (h!==s && ++guard < HE.length);
      }
    }
    return Array.from(unique);
  }

  getCentroid(editable: any, meshObj: THREE.Object3D): THREE.Vector3{
    // centroid in mesh local space -> return world
    const verts = this.getVerticesForEdit(editable);
    if (verts.length === 0){
      return meshObj.getWorldPosition(new THREE.Vector3());
    }
    let cx=0, cy=0, cz=0;
    for (const v of verts){ const p = editable.position.get(v) as [number,number,number]; cx+=p[0], cy+=p[1], cz+=p[2]; }
    cx/=verts.length; cy/=verts.length; cz/=verts.length;
    const local = new THREE.Vector3(cx,cy,cz);
    return meshObj.localToWorld(local.clone());
  }
}
