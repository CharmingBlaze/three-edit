import { EditableMesh } from '../core/EditableMesh';
import { Edge } from '../core/Edge';
import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { UVCoord } from '../uv/types';
import { generateEdgeKeyFromIds } from './edgeKey';
import { CreatePrimitiveOptions, VertexOptions, FaceOptions, PrimitiveValidationResult } from './types';
import { calculateFaceNormal } from '../utils/mathUtils';

/**
 * Standardized edge reuse logic that considers UV seams
 * @param mesh The mesh to add edges to
 * @param edgeMap The edge map for reuse tracking
 * @param id1 First vertex ID
 * @param id2 Second vertex ID
 * @returns The edge ID (either existing or newly created)
 */
export function getOrCreateEdge(
  mesh: EditableMesh,
  edgeMap: { [key: string]: number },
  id1: number,
  id2: number
): number {
  const key = generateEdgeKeyFromIds(mesh, id1, id2);
  
  if (edgeMap[key] === undefined) {
    edgeMap[key] = mesh.addEdge(new Edge(id1, id2));
  }
  return edgeMap[key];
}

/**
 * Create edges for a face using standardized logic
 * @param mesh The mesh to add edges to
 * @param edgeMap The edge map for reuse tracking
 * @param faceVertexIds Array of vertex IDs for the face
 * @returns Array of edge IDs
 */
export function createFaceEdges(
  mesh: EditableMesh,
  edgeMap: { [key: string]: number },
  faceVertexIds: number[]
): number[] {
  const edgeIds: number[] = [];
  for (let i = 0; i < faceVertexIds.length; i++) {
    const id1 = faceVertexIds[i];
    const id2 = faceVertexIds[(i + 1) % faceVertexIds.length];
    edgeIds.push(getOrCreateEdge(mesh, edgeMap, id1, id2));
  }
  return edgeIds;
}

/**
 * Create a vertex with standardized options
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param options Vertex creation options
 * @returns New Vertex instance
 */
export function createVertex(x: number, y: number, z: number, options: Partial<VertexOptions> = {}): Vertex {
  return new Vertex(x, y, z, options);
}

/**
 * Create a face with standardized options
 * @param mesh The mesh to add the face to
 * @param vertexIds Array of vertex IDs
 * @param edgeIds Array of edge IDs
 * @param options Face creation options
 * @returns The created Face instance
 */
export function createFace(
  mesh: EditableMesh,
  vertexIds: number[],
  edgeIds: number[],
  options: Partial<FaceOptions> = {}
): Face {
  const face = new Face(vertexIds, edgeIds, options);
  
  // Calculate normal if not provided
  if (!face.normal) {
    face.normal = calculateFaceNormal(mesh, face);
  }
  
  return face;
}

/**
 * Standard parameter validation for primitives
 */
export interface ValidationOptions {
  radius?: number;
  width?: number;
  height?: number;
  depth?: number;
  segments?: number;
  widthSegments?: number;
  heightSegments?: number;
  radialSegments?: number;
  tubularSegments?: number;
  minSegments?: number;
  minWidthSegments?: number;
  minHeightSegments?: number;
  minRadialSegments?: number;
  minTubularSegments?: number;
}

/**
 * Validate common primitive parameters
 * @param options The validation options
 * @param name The primitive name for error messages
 */
export function validatePrimitiveParameters(options: ValidationOptions, name: string): void {
  if (options.radius !== undefined && options.radius <= 0) {
    throw new Error(`${name} radius must be positive`);
  }
  if (options.width !== undefined && options.width <= 0) {
    throw new Error(`${name} width must be positive`);
  }
  if (options.height !== undefined && options.height <= 0) {
    throw new Error(`${name} height must be positive`);
  }
  if (options.depth !== undefined && options.depth <= 0) {
    throw new Error(`${name} depth must be positive`);
  }
  if (options.segments !== undefined && options.segments < (options.minSegments || 3)) {
    throw new Error(`${name} segments must be at least ${options.minSegments || 3}`);
  }
  if (options.widthSegments !== undefined && options.widthSegments < (options.minWidthSegments || 1)) {
    throw new Error(`${name} widthSegments must be at least ${options.minWidthSegments || 1}`);
  }
  if (options.heightSegments !== undefined && options.heightSegments < (options.minHeightSegments || 1)) {
    throw new Error(`${name} heightSegments must be at least ${options.minHeightSegments || 1}`);
  }
  if (options.radialSegments !== undefined && options.radialSegments < (options.minRadialSegments || 3)) {
    throw new Error(`${name} radialSegments must be at least ${options.minRadialSegments || 3}`);
  }
  if (options.tubularSegments !== undefined && options.tubularSegments < (options.minTubularSegments || 3)) {
    throw new Error(`${name} tubularSegments must be at least ${options.minTubularSegments || 3}`);
  }
}

/**
 * Standard material ID calculation for primitives
 * @param faceIndex The face index
 * @param faceMaterialIds Optional array of material IDs per face
 * @param defaultMaterialId The default material ID
 * @returns The material ID to use
 */
export function getMaterialId(
  faceIndex: number,
  faceMaterialIds?: number[],
  defaultMaterialId: number = 0
): number {
  return faceMaterialIds ? faceMaterialIds[faceIndex] : defaultMaterialId;
}

/**
 * Apply centering transformation to vertex positions
 * @param vertices Array of vertex positions
 * @param centered Whether to center the primitive
 * @param dimensions Object with width, height, depth properties
 * @returns Transformed vertex positions
 */
export function applyCentering(
  vertices: { x: number; y: number; z: number }[],
  centered: boolean,
  dimensions: { width?: number; height?: number; depth?: number }
): { x: number; y: number; z: number }[] {
  if (!centered) return vertices;
  
  const { width = 0, height = 0, depth = 0 } = dimensions;
  const offsetX = width / 2;
  const offsetY = height / 2;
  const offsetZ = depth / 2;
  
  return vertices.map(v => ({
    x: v.x + offsetX,
    y: v.y + offsetY,
    z: v.z + offsetZ
  }));
}

/**
 * Generate standard UV coordinates for a face
 * @param faceVertexCount Number of vertices in the face
 * @param uvLayout UV layout method
 * @returns Array of UV coordinates
 */
export function generateStandardUVs(
  faceVertexCount: number,
  uvLayout: 'standard' | 'box' | 'atlas' | 'unwrap' = 'standard'
): UVCoord[] {
  switch (uvLayout) {
    case 'standard':
      // Standard UV mapping based on face vertex count
      switch (faceVertexCount) {
        case 3: // Triangle
          return [{ u: 0, v: 0 }, { u: 1, v: 0 }, { u: 0.5, v: 1 }];
        case 4: // Quad
          return [{ u: 0, v: 0 }, { u: 1, v: 0 }, { u: 1, v: 1 }, { u: 0, v: 1 }];
        default:
          // For n-gons, create a circular UV mapping
          const uvs: UVCoord[] = [];
          for (let i = 0; i < faceVertexCount; i++) {
            const angle = (i / faceVertexCount) * Math.PI * 2;
            uvs.push({
              u: 0.5 + Math.cos(angle) * 0.5,
              v: 0.5 + Math.sin(angle) * 0.5
            });
          }
          return uvs;
      }
    
    case 'box':
      // Box UV mapping (for cubic primitives)
      return Array(faceVertexCount).fill({ u: 0, v: 0 });
    
    case 'atlas':
      // Atlas UV mapping (for texture atlases)
      return Array(faceVertexCount).fill({ u: 0, v: 0 });
    
    case 'unwrap':
      // Unwrap UV mapping (for complex surfaces)
      return Array(faceVertexCount).fill({ u: 0, v: 0 });
    
    default:
      return Array(faceVertexCount).fill({ u: 0, v: 0 });
  }
}

/**
 * Validate a primitive mesh according to the standard
 * @param mesh The mesh to validate
 * @param primitiveType Type of primitive for error messages
 * @returns Validation result
 */
export function validatePrimitiveMesh(mesh: EditableMesh, primitiveType: string): PrimitiveValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic validation
  if (!mesh.vertices || mesh.vertices.length === 0) {
    errors.push(`${primitiveType} has no vertices`);
  }
  
  if (!mesh.faces || mesh.faces.length === 0) {
    errors.push(`${primitiveType} has no faces`);
  }
  
  if (!mesh.edges || mesh.edges.length === 0) {
    errors.push(`${primitiveType} has no edges`);
  }
  
  // Check for vertices with UVs
  const verticesWithUVs = mesh.vertices.filter(v => v.uv);
  if (verticesWithUVs.length === 0) {
    warnings.push(`${primitiveType} has no UV coordinates`);
  }
  
  // Check for valid face winding
  for (let i = 0; i < mesh.faces.length; i++) {
    const face = mesh.faces[i];
    if (face.vertices.length < 3) {
      errors.push(`Face ${i} has less than 3 vertices`);
    }
    if (!face.normal) {
      warnings.push(`Face ${i} has no normal`);
    }
  }
  
  // Count unique materials
  const materialIds = new Set(mesh.faces.map(f => f.materialIndex));
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      vertexCount: mesh.vertices.length,
      edgeCount: mesh.edges.length,
      faceCount: mesh.faces.length,
      materialCount: materialIds.size,
      uvCount: mesh.vertices.filter(v => v.uv).length,
      normalCount: mesh.vertices.filter(v => v.normal).length
    }
  };
} 