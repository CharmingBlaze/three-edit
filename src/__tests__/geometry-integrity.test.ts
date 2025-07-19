import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';
import { createCube } from '../primitives/createCube';
import { validateGeometryIntegrity, checkFlippedFaces, validateMaterialIndices, validateUVCoordinates, validateMeshForRendering } from '../validation/validateGeometryIntegrity';
import { fixWindingOrder, recalculateNormals, recalculateVertexNormals, fixGeometryIntegrity } from '../validation/fixWindingOrder';
import { generatePlanarUVs, generateCylindricalUVs, generateSphericalUVs } from '../uv/generatePlanarUVs';
import { MaterialManager } from '../materials/materialManager';
import { calculateFaceNormal } from '../utils/mathUtils';
import { Selection } from '../selection/Selection';

describe('Geometry Integrity Validation', () => {
  it('should validate a properly constructed mesh', () => {
    const mesh = createCube();
    const result = validateGeometryIntegrity(mesh);
    
    // The cube should be valid, but let's check what issues exist
    if (!result.valid) {
      console.log('Validation issues:', result.issues);
    }
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should detect faces with incorrect winding order', () => {
    const mesh = new EditableMesh();
    
    // Add vertices with UVs
    const v0 = mesh.addVertex(new Vertex(0, 0, 0, { uv: { u: 0, v: 0 } }));
    const v1 = mesh.addVertex(new Vertex(1, 0, 0, { uv: { u: 1, v: 0 } }));
    const v2 = mesh.addVertex(new Vertex(0, 1, 0, { uv: { u: 0, v: 1 } }));
    
    // Add edges
    const e0 = mesh.addEdge(new Edge(v0, v1));
    const e1 = mesh.addEdge(new Edge(v1, v2));
    const e2 = mesh.addEdge(new Edge(v2, v0));
    
    // Add face with incorrect winding order (CW instead of CCW)
    const face = new Face([v0, v2, v1], [e0, e2, e1]);
    mesh.addFace(face);
    
    // Set a normal that points in the correct direction for CCW winding
    // But we have CW vertices, so this creates a mismatch
    face.normal = new Vector3(0, 0, 1); // This is the correct normal for CCW, but we have CW vertices
    
    // Debug: Calculate what the normal should be
    const edge1 = new Vector3(1, 0, 0); // v1 - v0
    const edge2 = new Vector3(0, 1, 0); // v2 - v0
    const expectedNormal = new Vector3().crossVectors(edge1, edge2).normalize();
    console.log('Expected normal:', expectedNormal);
    console.log('Face normal:', face.normal);
    console.log('Dot product:', face.normal.dot(expectedNormal));
    
    const result = validateGeometryIntegrity(mesh);
    console.log('Validation result:', result);
    console.log('Face normal:', face.normal);
    console.log('Face vertices:', face.vertices);
    expect(result.incorrectWindingFaces).toHaveLength(1);
    expect(result.valid).toBe(false);
  });

  it('should detect missing UV coordinates', () => {
    const mesh = createCube();
    
    // Remove UV from one vertex
    mesh.vertices[0].uv = undefined;
    
    const result = validateGeometryIntegrity(mesh);
    expect(result.missingUVVertices).toContain(0);
    expect(result.valid).toBe(false);
  });

  it('should detect invalid material indices', () => {
    const mesh = createCube();
    
    // Set negative material index
    mesh.faces[0].materialIndex = -1;
    
    const result = validateGeometryIntegrity(mesh);
    expect(result.invalidMaterialFaces).toContain(0);
    expect(result.valid).toBe(false);
  });

  it('should detect duplicate vertices', () => {
    const mesh = new EditableMesh();
    
    // Add duplicate vertices at the same position
    const v0 = mesh.addVertex(new Vertex(0, 0, 0));
    const v1 = mesh.addVertex(new Vertex(0, 0, 0)); // Duplicate
    
    const result = validateGeometryIntegrity(mesh);
    expect(result.duplicateVertices).toHaveLength(1);
    expect(result.valid).toBe(false);
  });

  it('should detect orphaned vertices', () => {
    const mesh = createCube();
    
    // Add an unused vertex
    mesh.addVertex(new Vertex(10, 10, 10));
    
    const result = validateGeometryIntegrity(mesh);
    expect(result.orphanedVertices).toContain(mesh.vertices.length - 1);
    expect(result.valid).toBe(false);
  });
});

describe('Winding Order Fix', () => {
  it('should fix incorrect winding order', () => {
    const mesh = new EditableMesh();
    
    // Add vertices with UVs
    const v0 = mesh.addVertex(new Vertex(0, 0, 0, { uv: { u: 0, v: 0 } }));
    const v1 = mesh.addVertex(new Vertex(1, 0, 0, { uv: { u: 1, v: 0 } }));
    const v2 = mesh.addVertex(new Vertex(0, 1, 0, { uv: { u: 0, v: 1 } }));
    
    // Add edges
    const e0 = mesh.addEdge(new Edge(v0, v1));
    const e1 = mesh.addEdge(new Edge(v1, v2));
    const e2 = mesh.addEdge(new Edge(v2, v0));
    
    // Add face with incorrect winding order
    const face = new Face([v0, v2, v1], [e0, e2, e1]);
    mesh.addFace(face);
    
    // Set a normal that points in the correct direction for CCW winding
    // But we have CW vertices, so this creates a mismatch
    face.normal = new Vector3(0, 0, 1); // This is the correct normal for CCW, but we have CW vertices
    
    const fixedCount = fixWindingOrder(mesh);
    expect(fixedCount).toBe(1);
    
    const result = validateGeometryIntegrity(mesh);
    expect(result.incorrectWindingFaces).toHaveLength(0);
  });

  it('should recalculate normals after fixing winding order', () => {
    const mesh = createCube();
    
    // Clear all normals
    mesh.faces.forEach(face => face.normal = undefined);
    
    recalculateNormals(mesh);
    
    mesh.faces.forEach(face => {
      expect(face.normal).toBeDefined();
      expect(face.normal!.length()).toBeCloseTo(1);
    });
  });

  it('should recalculate vertex normals', () => {
    const mesh = createCube();
    
    // Clear all vertex normals
    mesh.vertices.forEach(vertex => vertex.normal = undefined);
    
    recalculateVertexNormals(mesh);
    
    mesh.vertices.forEach(vertex => {
      expect(vertex.normal).toBeDefined();
      expect(vertex.normal!.length()).toBeCloseTo(1);
    });
  });
});

describe('UV Generation', () => {
  it('should generate planar UVs', () => {
    const mesh = createCube();
    
    // Clear existing UVs
    mesh.vertices.forEach(vertex => vertex.uv = undefined);
    
    generatePlanarUVs(mesh, { projectionAxis: 'z' });
    
    mesh.vertices.forEach(vertex => {
      expect(vertex.uv).toBeDefined();
      expect(vertex.uv!.u).toBeGreaterThanOrEqual(0);
      expect(vertex.uv!.u).toBeLessThanOrEqual(1);
      expect(vertex.uv!.v).toBeGreaterThanOrEqual(0);
      expect(vertex.uv!.v).toBeLessThanOrEqual(1);
    });
  });

  it('should generate cylindrical UVs', () => {
    const mesh = createCube();
    
    // Clear existing UVs
    mesh.vertices.forEach(vertex => vertex.uv = undefined);
    
    generateCylindricalUVs(mesh, { axis: 'z' });
    
    mesh.vertices.forEach(vertex => {
      expect(vertex.uv).toBeDefined();
      expect(vertex.uv!.u).toBeGreaterThanOrEqual(0);
      expect(vertex.uv!.u).toBeLessThanOrEqual(1);
      expect(vertex.uv!.v).toBeGreaterThanOrEqual(0);
      expect(vertex.uv!.v).toBeLessThanOrEqual(1);
    });
  });

  it('should generate spherical UVs', () => {
    const mesh = createCube();
    
    // Clear existing UVs
    mesh.vertices.forEach(vertex => vertex.uv = undefined);
    
    generateSphericalUVs(mesh);
    
    mesh.vertices.forEach(vertex => {
      expect(vertex.uv).toBeDefined();
      expect(vertex.uv!.u).toBeGreaterThanOrEqual(0);
      expect(vertex.uv!.u).toBeLessThanOrEqual(1);
      expect(vertex.uv!.v).toBeGreaterThanOrEqual(0);
      expect(vertex.uv!.v).toBeLessThanOrEqual(1);
    });
  });
});

describe('Material Management', () => {
  it('should create material slots', () => {
    const mesh = createCube();
    const manager = new MaterialManager(mesh);
    
    const slot = manager.createMaterialSlot('Test Material');
    expect(slot.name).toBe('Test Material');
    expect(slot.active).toBe(true);
  });

  it('should assign materials to faces', () => {
    const mesh = createCube();
    const manager = new MaterialManager(mesh);
    
    // Create a selection with all faces (cube has 6 faces)
    const selection = new Selection();
    selection.faces = new Set([0, 1, 2, 3, 4, 5]);
    
    const result = manager.assignMaterialToSelection(selection, 1);
    expect(result.assignedFaces).toBe(5); // 5 faces get assigned material 1
    expect(result.alreadyAssigned).toBe(1); // 1 face already had material 1
    expect(result.failed).toBe(0);
  });

  it('should group faces by material', () => {
    const mesh = createCube();
    const manager = new MaterialManager(mesh);
    
    // The cube already has 6 different material indices (0-5)
    const grouping = manager.groupFacesByMaterial();
    expect(grouping.uniqueMaterialCount).toBe(6); // 0, 1, 2, 3, 4, 5
    expect(grouping.materialGroups.has(0)).toBe(true);
    expect(grouping.materialGroups.has(1)).toBe(true);
    expect(grouping.materialGroups.has(2)).toBe(true);
    expect(grouping.materialGroups.has(3)).toBe(true);
    expect(grouping.materialGroups.has(4)).toBe(true);
    expect(grouping.materialGroups.has(5)).toBe(true);
  });

  it('should validate material assignments', () => {
    const mesh = createCube();
    const manager = new MaterialManager(mesh);
    
    // Set invalid material index
    mesh.faces[0].materialIndex = -1;
    
    const validation = manager.validateMaterialAssignments();
    expect(validation.valid).toBe(false);
    expect(validation.unassignedFaces).toContain(0);
  });
});

describe('Comprehensive Mesh Validation', () => {
  it('should validate mesh for rendering', () => {
    const mesh = createCube();
    const result = validateMeshForRendering(mesh);
    
    expect(result.valid).toBe(true);
    expect(result.geometryIntegrity.valid).toBe(true);
    expect(result.flippedFaces).toHaveLength(0);
    expect(result.materialValidation.valid).toBe(true);
    expect(result.uvValidation.valid).toBe(true);
  });

  it('should fix geometry integrity issues', () => {
    const mesh = createCube();
    
    // Introduce some issues
    mesh.faces[0].normal = undefined;
    mesh.vertices[0].uv = undefined;
    
    const fixResult = fixGeometryIntegrity(mesh);
    expect(fixResult.normalsRecalculated).toBe(true);
    expect(fixResult.vertexNormalsRecalculated).toBe(true);
    
    // Generate UVs
    generatePlanarUVs(mesh);
    
    const validation = validateMeshForRendering(mesh);
    expect(validation.valid).toBe(true);
  });
}); 