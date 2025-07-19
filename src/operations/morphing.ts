import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';

/**
 * Options for vertex morphing
 */
export interface VertexMorphOptions {
  /** Target positions for vertices */
  targetPositions: Vector3[];
  /** Interpolation factor (0-1) */
  factor: number;
  /** Whether to interpolate normals */
  interpolateNormals?: boolean;
  /** Whether to interpolate UVs */
  interpolateUVs?: boolean;
  /** Selected vertices only */
  selectedOnly?: boolean;
  /** Vertex indices to morph (if not selectedOnly) */
  vertexIndices?: number[];
}

/**
 * Options for shape interpolation
 */
export interface ShapeInterpolationOptions {
  /** Source mesh */
  sourceMesh: EditableMesh;
  /** Target mesh */
  targetMesh: EditableMesh;
  /** Interpolation factor (0-1) */
  factor: number;
  /** Whether to interpolate materials */
  interpolateMaterials?: boolean;
  /** Whether to interpolate UVs */
  interpolateUVs?: boolean;
  /** Whether to interpolate normals */
  interpolateNormals?: boolean;
}

/**
 * Morph target data
 */
export interface MorphTarget {
  name: string;
  positions: Vector3[];
  normals?: Vector3[];
  uvs?: { u: number; v: number }[];
}

/**
 * Options for morph target operations
 */
export interface MorphTargetOptions {
  /** Morph targets to apply */
  targets: MorphTarget[];
  /** Weights for each target (0-1) */
  weights: number[];
  /** Whether to interpolate normals */
  interpolateNormals?: boolean;
  /** Whether to interpolate UVs */
  interpolateUVs?: boolean;
  /** Selected vertices only */
  selectedOnly?: boolean;
  /** Vertex indices to apply to (if not selectedOnly) */
  vertexIndices?: number[];
}

/**
 * Morphs vertices to target positions
 * @param mesh The mesh to morph
 * @param options Morphing options
 */
export function morphVertices(mesh: EditableMesh, options: VertexMorphOptions): void {
  const { targetPositions, factor, interpolateNormals = false, interpolateUVs = false, selectedOnly = false, vertexIndices } = options;

  if (factor < 0 || factor > 1) {
    throw new Error('Factor must be between 0 and 1');
  }

  const verticesToMorph = selectedOnly ? 
    Array.from(mesh.getSelectedVertices() || []) : 
    (vertexIndices || Array.from({ length: mesh.getVertexCount() }, (_, i) => i));

  if (verticesToMorph.length !== targetPositions.length) {
    throw new Error('Number of target positions must match number of vertices to morph');
  }

  for (let i = 0; i < verticesToMorph.length; i++) {
    const vertexIndex = verticesToMorph[i];
    const vertex = mesh.getVertex(vertexIndex);
    const targetPos = targetPositions[i];

    if (vertex && targetPos) {
      // Interpolate position
      vertex.x = vertex.x + (targetPos.x - vertex.x) * factor;
      vertex.y = vertex.y + (targetPos.y - vertex.y) * factor;
      vertex.z = vertex.z + (targetPos.z - vertex.z) * factor;

      // Interpolate normal if requested
      if (interpolateNormals && vertex.normal && targetPos) {
        // Simple normal interpolation (could be improved with proper spherical interpolation)
        vertex.normal.lerp(targetPos, factor);
        vertex.normal.normalize();
      }

      // Interpolate UV if requested
      if (interpolateUVs && vertex.uv && targetPos) {
        // UV interpolation would need target UVs
        // This is a placeholder for future implementation
      }
    }
  }
}

/**
 * Interpolates between two meshes
 * @param sourceMesh The source mesh
 * @param targetMesh The target mesh
 * @param options Interpolation options
 * @returns The interpolated mesh
 */
export function interpolateShapes(sourceMesh: EditableMesh, targetMesh: EditableMesh, options: ShapeInterpolationOptions): EditableMesh {
  const { factor, interpolateMaterials = false, interpolateUVs = false, interpolateNormals = false } = options;

  if (factor < 0 || factor > 1) {
    throw new Error('Factor must be between 0 and 1');
  }

  // Create a new mesh for the result
  const resultMesh = new EditableMesh();

  // Ensure both meshes have the same vertex count
  if (sourceMesh.getVertexCount() !== targetMesh.getVertexCount()) {
    throw new Error('Source and target meshes must have the same vertex count');
  }

  // Interpolate vertices
  for (let i = 0; i < sourceMesh.getVertexCount(); i++) {
    const sourceVertex = sourceMesh.getVertex(i);
    const targetVertex = targetMesh.getVertex(i);

    if (sourceVertex && targetVertex) {
      // Interpolate position
      const interpolatedPos = new Vector3();
      interpolatedPos.lerpVectors(
        new Vector3(sourceVertex.x, sourceVertex.y, sourceVertex.z),
        new Vector3(targetVertex.x, targetVertex.y, targetVertex.z),
        factor
      );

      // Interpolate normal if requested
      let interpolatedNormal: Vector3 | undefined;
      if (interpolateNormals && sourceVertex.normal && targetVertex.normal) {
        interpolatedNormal = new Vector3();
        interpolatedNormal.lerpVectors(sourceVertex.normal, targetVertex.normal, factor);
        interpolatedNormal.normalize();
      }

      // Interpolate UV if requested
      let interpolatedUV: { u: number; v: number } | undefined;
      if (interpolateUVs && sourceVertex.uv && targetVertex.uv) {
        interpolatedUV = {
          u: sourceVertex.uv.u + (targetVertex.uv.u - sourceVertex.uv.u) * factor,
          v: sourceVertex.uv.v + (targetVertex.uv.v - sourceVertex.uv.v) * factor
        };
      }

      // Add interpolated vertex
      resultMesh.addVertex({
        x: interpolatedPos.x,
        y: interpolatedPos.y,
        z: interpolatedPos.z,
        normal: interpolatedNormal,
        uv: interpolatedUV
      });
    }
  }

  // Copy faces from source mesh (assuming topology is the same)
  for (let i = 0; i < sourceMesh.getFaceCount(); i++) {
    const sourceFace = sourceMesh.getFace(i);
    if (sourceFace) {
      // Create edges for the face
      const edgeIndices: number[] = [];
      for (let j = 0; j < sourceFace.vertices.length; j++) {
        const v1 = sourceFace.vertices[j];
        const v2 = sourceFace.vertices[(j + 1) % sourceFace.vertices.length];
        const edge = { vertex1: v1, vertex2: v2 };
        const edgeIndex = resultMesh.addEdge(edge);
        edgeIndices.push(edgeIndex);
      }

      // Create face
      const face = {
        vertices: sourceFace.vertices,
        edges: edgeIndices,
        materialIndex: interpolateMaterials && targetMesh.getFace(i) ? 
          Math.round(sourceFace.materialIndex + (targetMesh.getFace(i)!.materialIndex - sourceFace.materialIndex) * factor) :
          sourceFace.materialIndex
      };
      resultMesh.addFace(face);
    }
  }

  return resultMesh;
}

/**
 * Applies morph targets to a mesh
 * @param mesh The mesh to apply morph targets to
 * @param options Morph target options
 */
export function applyMorphTargets(mesh: EditableMesh, options: MorphTargetOptions): void {
  const { targets, weights, interpolateNormals = false, interpolateUVs = false, selectedOnly = false, vertexIndices } = options;

  if (targets.length !== weights.length) {
    throw new Error('Number of targets must match number of weights');
  }

  // Validate weights
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (Math.abs(totalWeight - 1) > 0.001) {
    console.warn('Morph target weights do not sum to 1, normalizing...');
    const normalizedWeights = weights.map(w => w / totalWeight);
    options.weights = normalizedWeights;
  }

  const verticesToMorph = selectedOnly ? 
    Array.from(mesh.getSelectedVertices() || []) : 
    (vertexIndices || Array.from({ length: mesh.getVertexCount() }, (_, i) => i));

  // Apply each morph target
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const weight = weights[i];

    if (weight <= 0) continue;

    if (target.positions.length !== verticesToMorph.length) {
      throw new Error(`Morph target "${target.name}" has ${target.positions.length} positions but ${verticesToMorph.length} vertices to morph`);
    }

    for (let j = 0; j < verticesToMorph.length; j++) {
      const vertexIndex = verticesToMorph[j];
      const vertex = mesh.getVertex(vertexIndex);
      const targetPos = target.positions[j];

      if (vertex && targetPos) {
        // Apply weighted position offset
        vertex.x += (targetPos.x - vertex.x) * weight;
        vertex.y += (targetPos.y - vertex.y) * weight;
        vertex.z += (targetPos.z - vertex.z) * weight;

        // Apply normal offset if available
        if (interpolateNormals && vertex.normal && target.normals && target.normals[j]) {
          vertex.normal.lerp(target.normals[j], weight);
          vertex.normal.normalize();
        }

        // Apply UV offset if available
        if (interpolateUVs && vertex.uv && target.uvs && target.uvs[j]) {
          vertex.uv.u += (target.uvs[j].u - vertex.uv.u) * weight;
          vertex.uv.v += (target.uvs[j].v - vertex.uv.v) * weight;
        }
      }
    }
  }
}

/**
 * Creates a morph target from current mesh state
 * @param mesh The mesh to create morph target from
 * @param name The name of the morph target
 * @param options Options for creating the morph target
 * @returns The morph target
 */
export function createMorphTarget(mesh: EditableMesh, name: string, options: {
  includeNormals?: boolean;
  includeUVs?: boolean;
  vertexIndices?: number[];
} = {}): MorphTarget {
  const { includeNormals = false, includeUVs = false, vertexIndices } = options;

  const vertices = vertexIndices || Array.from({ length: mesh.getVertexCount() }, (_, i) => i);
  const positions: Vector3[] = [];
  const normals: Vector3[] = [];
  const uvs: { u: number; v: number }[] = [];

  for (const vertexIndex of vertices) {
    const vertex = mesh.getVertex(vertexIndex);
    if (vertex) {
      positions.push(new Vector3(vertex.x, vertex.y, vertex.z));
      
      if (includeNormals && vertex.normal) {
        normals.push(vertex.normal.clone());
      }
      
      if (includeUVs && vertex.uv) {
        uvs.push({ u: vertex.uv.u, v: vertex.uv.v });
      }
    }
  }

  return {
    name,
    positions,
    normals: includeNormals ? normals : undefined,
    uvs: includeUVs ? uvs : undefined
  };
}

/**
 * Blends between multiple morph targets
 * @param mesh The mesh to apply morph targets to
 * @param targets Array of morph targets
 * @param weights Array of weights for each target
 * @param options Additional options
 */
export function blendMorphTargets(mesh: EditableMesh, targets: MorphTarget[], weights: number[], options: {
  interpolateNormals?: boolean;
  interpolateUVs?: boolean;
  selectedOnly?: boolean;
  vertexIndices?: number[];
} = {}): void {
  applyMorphTargets(mesh, {
    targets,
    weights,
    interpolateNormals: options.interpolateNormals,
    interpolateUVs: options.interpolateUVs,
    selectedOnly: options.selectedOnly,
    vertexIndices: options.vertexIndices
  });
} 