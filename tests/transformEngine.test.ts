import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { easy } from '../src/index';

function makeEditableWithVerts(count = 3){
  // Minimal editable mesh stub with position attribute API used by TransformEngine
  const positions: Array<[number,number,number]> = [];
  for (let i=0;i<count;i++) positions.push([i, 0, 0]);
  const editable: any = {
    position: {
      get(i: number){ return positions[i]; },
      set(i: number, p: [number,number,number]){ positions[i] = p; },
    },
  };
  return { editable, positions };
}

function makeMeshObj(){
  const geom = new THREE.BufferGeometry();
  const mat = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geom, mat);
  return mesh;
}

describe('TransformEngine', () => {
  it('applyTranslate moves vertices by world delta', () => {
    const { editable, positions } = makeEditableWithVerts(2);
    const meshObj = makeMeshObj();
    const verts = [0, 1];
    const delta = new THREE.Vector3(1, 2, 3);

    easy.applyTranslate(verts as any, delta as any, meshObj, editable);

    expect(positions[0]).toEqual([1,2,3]);
    expect(positions[1]).toEqual([2,2,3]);
  });

  it('applyRotate rotates vertices around pivot', () => {
    const { editable, positions } = makeEditableWithVerts(1);
    positions[0] = [1, 0, 0];
    const meshObj = makeMeshObj();
    const verts = [0];
    const pivot = new THREE.Vector3(0,0,0);
    const axis = new THREE.Vector3(0,0,1);
    const angle = Math.PI / 2;

    easy.applyRotate(verts as any, { pivot, axis, angle } as any, meshObj, editable);

    const [x,y,z] = positions[0];
    expect(Math.abs(x)).toBeLessThan(1e-6);
    expect(Math.abs(y - 1)).toBeLessThan(1e-6);
    expect(z).toBe(0);
  });

  it('applyScale scales about pivot', () => {
    const { editable, positions } = makeEditableWithVerts(1);
    positions[0] = [2, 0, 0];
    const meshObj = makeMeshObj();
    const verts = [0];
    const pivot = new THREE.Vector3(1,0,0);
    const scale = new THREE.Vector3(2,2,2);

    easy.applyScale(verts as any, { pivot, scale } as any, meshObj, editable);

    const [x,y,z] = positions[0];
    expect(x).toBeCloseTo(3, 6);
    expect(y).toBe(0);
    expect(z).toBe(0);
  });
});
