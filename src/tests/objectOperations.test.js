import { describe, it, expect } from 'vitest';
import { EditableMesh, Vertex, Face } from '../EditableMesh.js';
import { splitMesh } from '../editing/objectOperations.js';

describe('splitMesh', () => {
  it('should split a mesh with two disconnected components into two separate meshes', () => {
    // 1. Setup
    const mesh = new EditableMesh();
    // Component 1
    mesh.addVertex(new Vertex(0, 0, 0, 'v0'));
    mesh.addVertex(new Vertex(1, 0, 0, 'v1'));
    mesh.addVertex(new Vertex(1, 1, 0, 'v2'));
    mesh.addFace(new Face(['v0', 'v1', 'v2'], 'f0'));

    // Component 2 (not connected to component 1)
    mesh.addVertex(new Vertex(5, 5, 5, 'v3'));
    mesh.addVertex(new Vertex(6, 5, 5, 'v4'));
    mesh.addVertex(new Vertex(6, 6, 5, 'v5'));
    mesh.addFace(new Face(['v3', 'v4', 'v5'], 'f1'));

    // 2. Execute
    const splitMeshes = splitMesh(mesh);

    // 3. Assert
    // Should result in two separate meshes
    expect(splitMeshes.length).toBe(2);

    // Verify the contents of each new mesh
    const mesh1 = splitMeshes.find(m => m.vertices.has('v0'));
    const mesh2 = splitMeshes.find(m => m.vertices.has('v3'));

    expect(mesh1).toBeDefined();
    expect(mesh1.vertices.size).toBe(3);
    expect(mesh1.faces.size).toBe(1);

    expect(mesh2).toBeDefined();
    expect(mesh2.vertices.size).toBe(3);
    expect(mesh2.faces.size).toBe(1);
  });
});
