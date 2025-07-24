/**
 * Tests for Three-Edit Helper Functions
 * 
 * This test suite verifies that all helper functions work correctly
 * and maintain the expected behavior across the refactoring.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from 'three';
import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { Edge } from '../core/Edge';
import {
  // Math helpers
  roundTo,
  clamp,
  lerp,
  degToRad,
  radToDeg,
  isClose,
  isZero,
  sign,
  distance3D,
  distanceSquared3D,
  normalize,
  map,
  wrap,
  angleBetweenVectors,
  isValidTriangle,
  triangleArea,
  triangleCentroid,
  pointInTriangle,
  
  // UV helpers
  generateUVs,
  generatePlanarUVs,
  generateSphericalUVs,
  generateCylindricalUVs,
  generateBoxUVs,
  generateDefaultUVs,
  rotateUVs,
  scaleUVs,
  offsetUVs,
  wrapUVs,
  areUVsClose,
  isUVSeam,
  
  // Edge helpers
  generateEdgeKey,
  generateEdgeKeyFromIds,
  sortEdgeVertices,
  getOtherVertexIndex,
  edgesShareVertex,
  getSharedVertexIndex,
  calculateEdgeLength,
  calculateEdgeLengthSquared,
  getEdgeMidpoint,
  isEdgeStraight,
  getEdgeStatistics,
  
  // Normal helpers
  calculateFaceNormal,
  calculateFaceNormalFromPositions,
  calculateFaceNormalForFace,
  calculateSmoothNormals,
  calculateFaceNormals,
  isValidNormal,
  getNormalStatistics,
  fixInvalidNormals,
  calculateTriangleNormals,
  
  // Validation helpers
  validatePrimitiveOptions,
  validateNumericValue,
  validateCubeOptions,
  validateSphereOptions,
  validateCylinderOptions,
  validateConeOptions,
  validatePlaneOptions,
  validateTorusOptions,
  validateTopology,
  validateGeometry,
  validateUVs,
  validateNormals,
  validateMesh,
  
  // Mesh helpers
  findOrphanedVertices,
  calculateBoundingBox,
  centerVertices,
  scaleVertices,
  rotateVertices,
  findVerticesInRadius,
  
  // Geometry helpers
  mergeVertices,
  triangulatePolygon,
  subdivideFace,
  extrudeFace,
  createVertexGrid,
  createFacesFromGrid,
  
  // Debug helpers
  debugPrimitive,
  printMeshStats,
  printWarnings,
  logWarnings,
  colorCodeFaces,
  debugVertexPositions,
  debugFaceConnectivity,
  debugEdgeConnectivity,
  timeOperation,
  estimateMemoryUsage,
  printMemoryUsage
} from '../helpers';

describe('Math Helpers', () => {
  describe('roundTo', () => {
    it('should round to specified decimal places', () => {
      expect(roundTo(3.14159, 2)).toBe(3.14);
      expect(roundTo(3.14159, 4)).toBe(3.1416);
      expect(roundTo(3.14159)).toBe(3.14159);
    });
  });

  describe('clamp', () => {
    it('should clamp values between min and max', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('lerp', () => {
    it('should perform linear interpolation', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
      expect(lerp(0, 10, 0)).toBe(0);
      expect(lerp(0, 10, 1)).toBe(10);
    });
  });

  describe('degToRad and radToDeg', () => {
    it('should convert between degrees and radians', () => {
      expect(degToRad(180)).toBeCloseTo(Math.PI);
      expect(radToDeg(Math.PI)).toBeCloseTo(180);
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
    });
  });

  describe('isClose', () => {
    it('should check if numbers are close', () => {
      expect(isClose(1.0, 1.000001)).toBe(true);
      expect(isClose(1.0, 1.1)).toBe(false);
      expect(isClose(1.0, 1.0)).toBe(true);
    });
  });

  describe('distance3D', () => {
    it('should calculate 3D distance', () => {
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(3, 4, 0);
      expect(distance3D(a, b)).toBe(5);
    });
  });

  describe('isValidTriangle', () => {
    it('should validate triangle geometry', () => {
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(1, 0, 0);
      const c = new Vector3(0, 1, 0);
      expect(isValidTriangle(a, b, c)).toBe(true);
      
      // Degenerate triangle
      const d = new Vector3(0, 0, 0);
      expect(isValidTriangle(a, b, d)).toBe(false);
    });
  });
});

describe('UV Helpers', () => {
  let vertices: Vertex[];
  let faces: Face[];

  beforeEach(() => {
    vertices = [
      new Vertex(0, 0, 0),
      new Vertex(1, 0, 0),
      new Vertex(0, 1, 0),
      new Vertex(1, 1, 0)
    ];
    
    faces = [
      new Face([0, 1, 2], [], { materialIndex: 0 }),
      new Face([1, 3, 2], [], { materialIndex: 0 })
    ];
  });

  describe('generateUVs', () => {
    it('should generate planar UVs', () => {
      generateUVs(vertices, faces, { layout: 'planar' });
      
      expect(vertices[0].uv).toBeDefined();
      expect(vertices[1].uv).toBeDefined();
      expect(vertices[2].uv).toBeDefined();
      expect(vertices[3].uv).toBeDefined();
    });

    it('should generate spherical UVs', () => {
      generateUVs(vertices, faces, { layout: 'spherical' });
      
      expect(vertices[0].uv).toBeDefined();
      expect(vertices[1].uv).toBeDefined();
      expect(vertices[2].uv).toBeDefined();
      expect(vertices[3].uv).toBeDefined();
    });
  });

  describe('areUVsClose', () => {
    it('should detect close UV coordinates', () => {
      const uv1 = { u: 0.5, v: 0.5 };
      const uv2 = { u: 0.501, v: 0.499 };
      const uv3 = { u: 0.6, v: 0.6 };
      
      expect(areUVsClose(uv1, uv2)).toBe(true);
      expect(areUVsClose(uv1, uv3)).toBe(false);
    });
  });
});

describe('Edge Helpers', () => {
  let vertices: Vertex[];
  let edges: Edge[];

  beforeEach(() => {
    vertices = [
      new Vertex(0, 0, 0),
      new Vertex(1, 0, 0),
      new Vertex(0, 1, 0),
      new Vertex(1, 1, 0)
    ];
    
    edges = [
      new Edge(0, 1),
      new Edge(1, 2),
      new Edge(2, 3),
      new Edge(3, 0)
    ];
  });

  describe('generateEdgeKey', () => {
    it('should generate consistent edge keys', () => {
      const key1 = generateEdgeKey(0, 1);
      const key2 = generateEdgeKey(1, 0);
      expect(key1).toBe(key2);
      expect(key1).toBe('0-1');
    });
  });

  describe('calculateEdgeLength', () => {
    it('should calculate edge length', () => {
      const length = calculateEdgeLength(edges[0], vertices);
      expect(length).toBe(1);
    });
  });

  describe('getEdgeStatistics', () => {
    it('should calculate edge statistics', () => {
      const stats = getEdgeStatistics(edges, vertices);
      expect(stats.total).toBe(4);
      expect(stats.averageLength).toBeGreaterThan(0);
    });
  });
});

describe('Normal Helpers', () => {
  let vertices: Vertex[];
  let faces: Face[];

  beforeEach(() => {
    vertices = [
      new Vertex(0, 0, 0),
      new Vertex(1, 0, 0),
      new Vertex(0, 1, 0)
    ];
    
    faces = [
      new Face([0, 1, 2], [], { materialIndex: 0 })
    ];
  });

  describe('calculateFaceNormal', () => {
    it('should calculate face normal', () => {
      const normal = calculateFaceNormal(vertices[0], vertices[1], vertices[2]);
      expect(normal).toBeInstanceOf(Vector3);
      expect(normal.length()).toBeCloseTo(1);
    });
  });

  describe('calculateSmoothNormals', () => {
    it('should calculate smooth normals', () => {
      calculateSmoothNormals(vertices, faces, { smooth: true });
      
      expect(vertices[0].normal).toBeDefined();
      expect(vertices[1].normal).toBeDefined();
      expect(vertices[2].normal).toBeDefined();
    });
  });

  describe('isValidNormal', () => {
    it('should validate normal vectors', () => {
      const validNormal = new Vector3(0, 0, 1);
      const invalidNormal = new Vector3(0, 0, 0);
      
      expect(isValidNormal(validNormal)).toBe(true);
      expect(isValidNormal(invalidNormal)).toBe(false);
    });
  });
});

describe('Validation Helpers', () => {
  describe('validateNumericValue', () => {
    it('should validate numeric values', () => {
      const result1 = validateNumericValue(5, 'test', { minValue: 0, maxValue: 10 });
      expect(result1.isValid).toBe(true);
      
      const result2 = validateNumericValue(-1, 'test', { allowNegative: false });
      expect(result2.isValid).toBe(false);
      
      const result3 = validateNumericValue(0, 'test', { allowZero: false });
      expect(result3.isValid).toBe(false);
    });
  });

  describe('validateCubeOptions', () => {
    it('should validate cube options', () => {
      const validOptions = { width: 1, height: 1, depth: 1 };
      const result = validateCubeOptions(validOptions);
      expect(result.isValid).toBe(true);
      
      const invalidOptions = { width: -1, height: 1, depth: 1 };
      const result2 = validateCubeOptions(invalidOptions);
      expect(result2.isValid).toBe(false);
    });
  });

  describe('validateTopology', () => {
    it('should validate mesh topology', () => {
      const vertices = [new Vertex(0, 0, 0), new Vertex(1, 0, 0), new Vertex(0, 1, 0)];
      const faces = [new Face([0, 1, 2], [], { materialIndex: 0 })];
      const edges = [new Edge(0, 1), new Edge(1, 2), new Edge(2, 0)];
      
      const result = validateTopology(vertices, faces, edges);
      expect(result.isValid).toBe(true);
    });
  });
});

describe('Mesh Helpers', () => {
  let vertices: Vertex[];
  let faces: Face[];
  let edges: Edge[];

  beforeEach(() => {
    vertices = [
      new Vertex(0, 0, 0),
      new Vertex(1, 0, 0),
      new Vertex(0, 1, 0),
      new Vertex(1, 1, 0)
    ];
    
    faces = [
      new Face([0, 1, 2], [], { materialIndex: 0 })
      // Face 2 removed so vertex 3 becomes orphaned
    ];
    
    edges = [
      new Edge(0, 1),
      new Edge(1, 2),
      new Edge(2, 0)
      // Edges for face 2 removed
    ];
  });

  describe('findOrphanedVertices', () => {
    it('should find orphaned vertices', () => {
      const orphaned = findOrphanedVertices(vertices, faces);
      expect(orphaned).toEqual([3]); // Vertex 3 is not used in faces
    });
  });



  describe('calculateBoundingBox', () => {
    it('should calculate bounding box', () => {
      const bbox = calculateBoundingBox(vertices);
      expect(bbox.min.x).toBe(0);
      expect(bbox.max.x).toBe(1);
      expect(bbox.min.y).toBe(0);
      expect(bbox.max.y).toBe(1);
    });
  });


});

describe('Geometry Helpers', () => {
  let vertices: Vertex[];
  let faces: Face[];

  beforeEach(() => {
    vertices = [
      new Vertex(0, 0, 0),
      new Vertex(1, 0, 0),
      new Vertex(0, 1, 0),
      new Vertex(1, 1, 0)
    ];
    
    faces = [
      new Face([0, 1, 2, 3], [], { materialIndex: 0 })
    ];
  });

  describe('mergeVertices', () => {
    it('should merge close vertices', () => {
      const duplicateVertices = [
        new Vertex(0, 0, 0),
        new Vertex(0.0001, 0, 0), // Very close to first vertex
        new Vertex(1, 0, 0),
        new Vertex(0, 1, 0)
      ];
      
      const result = mergeVertices(duplicateVertices, 0.001);
      expect(result.newVertices.length).toBeLessThan(duplicateVertices.length);
      expect(result.vertexMap).toBeDefined();
      expect(Array.isArray(result.vertexMap)).toBe(true);
    });
  });

  describe('triangulatePolygon', () => {
    it('should triangulate polygons', () => {
      const triangles = triangulatePolygon(vertices, faces[0]);
      expect(triangles.length).toBeGreaterThan(1); // Should create multiple triangles
    });
  });

  describe('createVertexGrid', () => {
    it('should create vertex grid', () => {
      const grid = createVertexGrid(2, 2, (x, y) => ({ x, y, z: 0 }));
      expect(grid.length).toBe(2);
      expect(grid[0].length).toBe(2);
    });
  });
});

describe('Debug Helpers', () => {
  let vertices: Vertex[];
  let faces: Face[];
  let edges: Edge[];

  beforeEach(() => {
    vertices = [
      new Vertex(0, 0, 0),
      new Vertex(1, 0, 0),
      new Vertex(0, 1, 0)
    ];
    
    faces = [
      new Face([0, 1, 2], [], { materialIndex: 0 })
    ];
    
    edges = [
      new Edge(0, 1),
      new Edge(1, 2),
      new Edge(2, 0)
    ];
  });

  describe('timeOperation', () => {
    it('should time operations', () => {
      const result = timeOperation('test', () => 42);
      expect(result).toBe(42);
    });
  });

  describe('estimateMemoryUsage', () => {
    it('should estimate memory usage', () => {
      const usage = estimateMemoryUsage(vertices, faces, edges);
      expect(usage.total).toBeGreaterThan(0);
      expect(usage.vertices).toBeGreaterThan(0);
      expect(usage.faces).toBeGreaterThan(0);
      expect(usage.edges).toBeGreaterThan(0);
    });
  });

  describe('printWarnings', () => {
    it('should print warnings for invalid mesh', () => {
      const invalidVertices = [new Vertex(0, 0, 0)];
      const invalidFaces = [new Face([0, 1], [], { materialIndex: 0 })]; // Invalid face
      const invalidEdges = [new Edge(0, 1)];
      
      // This should not throw an error
      expect(() => printWarnings(invalidVertices, invalidFaces, invalidEdges)).not.toThrow();
    });
  });
});

describe('Helper Integration', () => {
  it('should work together in a complete workflow', () => {
    // Create a simple cube-like mesh
    const vertices = [
      new Vertex(0, 0, 0),
      new Vertex(1, 0, 0),
      new Vertex(1, 1, 0),
      new Vertex(0, 1, 0),
      new Vertex(0, 0, 1),
      new Vertex(1, 0, 1),
      new Vertex(1, 1, 1),
      new Vertex(0, 1, 1)
    ];
    
    const faces = [
      new Face([0, 1, 2, 3], [], { materialIndex: 0 }), // Bottom
      new Face([4, 7, 6, 5], [], { materialIndex: 0 }), // Top
      new Face([0, 4, 5, 1], [], { materialIndex: 0 }), // Front
      new Face([2, 6, 7, 3], [], { materialIndex: 0 }), // Back
      new Face([0, 3, 7, 4], [], { materialIndex: 0 }), // Left
      new Face([1, 5, 6, 2], [], { materialIndex: 0 })  // Right
    ];
    
    const edges = [
      new Edge(0, 1), new Edge(1, 2), new Edge(2, 3), new Edge(3, 0),
      new Edge(4, 5), new Edge(5, 6), new Edge(6, 7), new Edge(7, 4),
      new Edge(0, 4), new Edge(1, 5), new Edge(2, 6), new Edge(3, 7)
    ];
    
    // Test validation
    const validation = validateMesh(vertices, faces, edges);
    expect(validation.isValid).toBe(true);
    
    // Test bounding box
    const bbox = calculateBoundingBox(vertices);
    expect(bbox.size.x).toBe(1);
    expect(bbox.size.y).toBe(1);
    expect(bbox.size.z).toBe(1);
  });
}); 