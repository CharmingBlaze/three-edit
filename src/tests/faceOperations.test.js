import { describe, it, expect } from 'vitest';
import { EditableMesh, Vertex, Face } from '../EditableMesh.js';


import { extrudeFaces } from '../editing/faceOperations.js';

describe('extrudeFaces', () => {
  it('should extrude a single face, creating new faces and vertices', () => {
    // 1. Setup
    const mesh = new EditableMesh();
    const v0 = new Vertex(0, 0, 0, 'v0');
    const v1 = new Vertex(1, 0, 0, 'v1');
    const v2 = new Vertex(1, 1, 0, 'v2');
    const v3 = new Vertex(0, 1, 0, 'v3');
    mesh.addVertex(v0);
    mesh.addVertex(v1);
    mesh.addVertex(v2);
    mesh.addVertex(v3);

    const face = new Face(['v0', 'v1', 'v2', 'v3'], 'f0');
    mesh.addFace(face);

    // 2. Execute
    const extrudedMesh = extrudeFaces(mesh, ['f0'], 1.0);

    // 3. Assert
    // Should have 8 vertices (4 original + 4 extruded)
    expect(extrudedMesh.vertices.size).toBe(8);
    // Should have 5 faces (1 original + 4 side faces)
    expect(extrudedMesh.faces.size).toBe(5);

    // Check that the new vertices are at the correct extruded position
    const newVertex = extrudedMesh.getVertex('v4'); // Vitest doesn't know the new IDs
    // This is a simplification. A real test would need to find the new vertices.
    // A more robust check would be to find vertices with z=1.
    const extrudedVertices = Array.from(extrudedMesh.vertices.values()).filter(v => v.z === 1.0);
    expect(extrudedVertices.length).toBe(4);
  });
});
