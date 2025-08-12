import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { easy } from '../src/index';

// Build a minimal editable mesh stub with:
// - vertices(): boolean[] presence
// - halfEdges(): array of { v, next }
// - faces(): array of { he }
// - position: { get(i), set(i) }
function makeEditableSquare(){
  // square in XY plane: v0(0,0,0), v1(1,0,0), v2(1,1,0), v3(0,1,0)
  const pos: Array<[number,number,number]> = [
    [0,0,0], [1,0,0], [1,1,0], [0,1,0]
  ];
  // one face with 4 half-edges (0..3), CCW: 0->1->2->3
  const HE = [
    { v: 0, next: 1 },
    { v: 1, next: 2 },
    { v: 2, next: 3 },
    { v: 3, next: 0 },
  ];
  const F = [ { he: 0 } ];
  const V = [true,true,true,true];
  const editable: any = {
    position: {
      get(i: number){ return pos[i]; },
      set(i: number, p: [number,number,number]){ pos[i] = p; },
    },
    vertices(){ return V; },
    halfEdges(){ return HE; },
    faces(){ return F; },
  };
  return { editable, pos };
}

function makeMeshObj(){
  const geom = new THREE.BufferGeometry();
  const mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial());
  return mesh;
}

describe('SelectionManager', () => {
  let sm: InstanceType<typeof easy.SelectionManager>;

  beforeEach(() => {
    sm = new easy.SelectionManager();
  });

  it('toggles object selection in object mode', () => {
    sm.setMode('object');
    expect(sm.objectSelected).toBe(true); // default true in constructor
    sm.toggleFromPick({});
    expect(sm.objectSelected).toBe(false);
    sm.toggleFromPick({});
    expect(sm.objectSelected).toBe(true);
  });

  it('toggles vertex selection and returns vertices for edit', () => {
    const { editable } = makeEditableSquare();
    sm.setMode('vertex');
    sm.toggleFromPick({ vert: 1 });
    sm.toggleFromPick({ vert: 3 });
    const verts = sm.getVerticesForEdit(editable);
    expect(new Set(verts)).toEqual(new Set([1,3]));
  });

  it('edge mode collects unique vertex ids from edge keys', () => {
    const { editable } = makeEditableSquare();
    sm.setMode('edge');
    sm.edges.add('0|1');
    sm.edges.add('2|3');
    const verts = sm.getVerticesForEdit(editable);
    expect(new Set(verts)).toEqual(new Set([0,1,2,3]));
  });

  it('face mode expands selected faces into boundary vertices', () => {
    const { editable } = makeEditableSquare();
    sm.setMode('face');
    sm.faces.add(0);
    const verts = sm.getVerticesForEdit(editable);
    expect(new Set(verts)).toEqual(new Set([0,1,2,3]));
  });

  it('computes centroid in world space for selected vertices', () => {
    const { editable } = makeEditableSquare();
    const meshObj = makeMeshObj();
    meshObj.position.set(10, 0, 0); // move mesh to test world conversion
    meshObj.updateMatrixWorld();

    sm.setMode('vertex');
    sm.verts.add(0);
    sm.verts.add(2);
    // local centroid of (0,0,0) and (1,1,0) is (0.5,0.5,0), plus world offset x+10
    const c = sm.getCentroid(editable, meshObj);
    expect(c.x).toBeCloseTo(10.5, 6);
    expect(c.y).toBeCloseTo(0.5, 6);
    expect(c.z).toBeCloseTo(0.0, 6);
  });
});
