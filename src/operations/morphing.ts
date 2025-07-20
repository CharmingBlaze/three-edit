import { Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';

/**
 * Morphing operation options
 */
export interface MorphingOptions {
  intensity?: number;
  preserveNormals?: boolean;
  preserveUVs?: boolean;
  selectionOnly?: boolean;
  materialIndex?: number;
}

/**
 * Morph target definition
 */
export interface MorphTarget {
  name: string;
  vertices: Vector3[];
  weight: number;
}

/**
 * Shape interpolation options
 */
export interface ShapeInterpolationOptions extends MorphingOptions {
  steps?: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  loop?: boolean;
}

/**
 * Morph target options
 */
export interface MorphTargetOptions extends MorphingOptions {

  weight?: number;
  blendMode?: 'additive' | 'multiplicative' | 'normalized';
}

/**
 * Morph vertices to target positions
 */
export function morphVertices(
  mesh: EditableMesh,
  targetVertices: Vector3[],
  options: MorphingOptions = {}
): EditableMesh {
  const {
    intensity = 1.0,
    preserveNormals = true,
    materialIndex
  } = options;

  const clonedMesh = mesh.clone();
  
  // Get vertices to morph - use all vertices since selection is not implemented
  const verticesToMorph = clonedMesh.vertices;

  if (verticesToMorph.length !== targetVertices.length) {
    throw new Error('Target vertex count must match source vertex count');
  }

  // Apply morphing
  for (let i = 0; i < verticesToMorph.length; i++) {
    const vertex = verticesToMorph[i];
    const targetVertex = targetVertices[i];
    
    // Interpolate position
    const originalPos = new Vector3(vertex.x, vertex.y, vertex.z);
    const newPos = new Vector3();
    newPos.lerpVectors(originalPos, targetVertex, intensity);
    vertex.setPosition(newPos.x, newPos.y, newPos.z);
  }

  // Update normals if not preserving
  if (!preserveNormals) {
    // Note: updateNormals method doesn't exist, so we'll skip this for now
  }

  // Assign material if specified
  if (materialIndex !== undefined) {
    clonedMesh.faces.forEach(face => {
      face.materialIndex = materialIndex;
    });
  }

  return clonedMesh;
}

/**
 * Interpolate between two shapes
 */
export function interpolateShapes(
  sourceMesh: EditableMesh,
  targetMesh: EditableMesh,
  options: ShapeInterpolationOptions = {}
): EditableMesh[] {
  const {
    steps = 10,
    easing = 'linear',
    intensity = 1.0,
    preserveNormals = true,
    materialIndex,
    loop = false
  } = options;

  if (sourceMesh.vertices.length !== targetMesh.vertices.length) {
    throw new Error('Source and target meshes must have the same vertex count');
  }

  const results: EditableMesh[] = [];
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const easedT = applyEasing(t, easing);
    
    const interpolatedMesh = sourceMesh.clone();
    const targetVertices = targetMesh.vertices;
    
    // Get vertices to interpolate - use all vertices since selection is not implemented
    const verticesToInterpolate = interpolatedMesh.vertices;

    // Interpolate vertices
    for (let j = 0; j < verticesToInterpolate.length; j++) {
      const vertex = verticesToInterpolate[j];
      const targetVertex = targetVertices[j];
      
      // Interpolate position
      const originalPos = new Vector3(vertex.x, vertex.y, vertex.z);
      const targetPos = new Vector3(targetVertex.x, targetVertex.y, targetVertex.z);
      const newPos = new Vector3();
      newPos.lerpVectors(originalPos, targetPos, easedT * intensity);
      vertex.setPosition(newPos.x, newPos.y, newPos.z);
    }

    // Update normals if not preserving
    if (!preserveNormals) {
      // Note: updateNormals method doesn't exist, so we'll skip this for now
    }

    // Assign material if specified
    if (materialIndex !== undefined) {
      interpolatedMesh.faces.forEach(face => {
        face.materialIndex = materialIndex;
      });
    }

    results.push(interpolatedMesh);
  }

  // Add loop back to source if requested
  if (loop && results.length > 0) {
    results.push(sourceMesh.clone());
  }

  return results;
}

/**
 * Apply morph targets to a mesh
 */
export function applyMorphTargets(
  mesh: EditableMesh,
  morphTargets: MorphTarget[],
  options: MorphTargetOptions = {}
): EditableMesh {
  const {
    intensity = 1.0,
    preserveNormals = true,
    materialIndex,
    blendMode = 'additive'
  } = options;

  const clonedMesh = mesh.clone();
  
  // Get vertices to morph - use all vertices since selection is not implemented
  const verticesToMorph = clonedMesh.vertices;

  // Apply each morph target
  for (const morphTarget of morphTargets) {
    if (morphTarget.vertices.length !== verticesToMorph.length) {
      throw new Error(`Morph target "${morphTarget.name}" vertex count must match mesh vertex count`);
    }

    const weight = morphTarget.weight * intensity;

    for (let i = 0; i < verticesToMorph.length; i++) {
      const vertex = verticesToMorph[i];
      const targetVertex = morphTarget.vertices[i];
      
      switch (blendMode) {
        case 'additive':
          vertex.setPosition(
            vertex.x + targetVertex.x * weight,
            vertex.y + targetVertex.y * weight,
            vertex.z + targetVertex.z * weight
          );
          break;
        case 'multiplicative':
          vertex.setPosition(
            vertex.x * targetVertex.x * weight,
            vertex.y * targetVertex.y * weight,
            vertex.z * targetVertex.z * weight
          );
          break;
        case 'normalized':
          const originalPos = new Vector3(vertex.x, vertex.y, vertex.z);
          const newPos = new Vector3();
          newPos.lerpVectors(originalPos, targetVertex, weight);
          vertex.setPosition(newPos.x, newPos.y, newPos.z);
          break;
      }
    }
  }

  // Update normals if not preserving
  if (!preserveNormals) {
    // Note: updateNormals method doesn't exist, so we'll skip this for now
  }

  // Assign material if specified
  if (materialIndex !== undefined) {
    clonedMesh.faces.forEach(face => {
      face.materialIndex = materialIndex;
    });
  }

  return clonedMesh;
}

/**
 * Create a morph target from current mesh state
 */
export function createMorphTarget(
  mesh: EditableMesh,
  name: string,
  weight: number = 1.0
): MorphTarget {
  const vertices: Vector3[] = [];
  
  for (const vertex of mesh.vertices) {
    vertices.push(new Vector3(vertex.x, vertex.y, vertex.z));
  }
  
  return {
    name,
    vertices,
    weight
  };
}

/**
 * Blend multiple morph targets
 */
export function blendMorphTargets(
  morphTargets: MorphTarget[],
  weights: number[]
): MorphTarget {
  if (morphTargets.length === 0) {
    throw new Error('At least one morph target is required');
  }
  
  if (morphTargets.length !== weights.length) {
    throw new Error('Morph target count must match weight count');
  }
  
  const vertexCount = morphTargets[0].vertices.length;
  const blendedVertices: Vector3[] = [];
  
  // Initialize blended vertices
  for (let i = 0; i < vertexCount; i++) {
    blendedVertices.push(new Vector3(0, 0, 0));
  }
  
  // Blend all morph targets
  for (let i = 0; i < morphTargets.length; i++) {
    const morphTarget = morphTargets[i];
    const weight = weights[i];
    
    if (morphTarget.vertices.length !== vertexCount) {
      throw new Error(`Morph target "${morphTarget.name}" has different vertex count`);
    }
    
    for (let j = 0; j < vertexCount; j++) {
      const targetVertex = morphTarget.vertices[j];
      const blendedVertex = blendedVertices[j];
      
      blendedVertex.addScaledVector(targetVertex, weight * morphTarget.weight);
    }
  }
  
  return {
    name: 'blended',
    vertices: blendedVertices,
    weight: 1.0
  };
}

/**
 * Apply easing function
 */
function applyEasing(t: number, easing: string): number {
  switch (easing) {
    case 'linear':
      return t;
    case 'easeIn':
      return t * t;
    case 'easeOut':
      return t * (2 - t);
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    default:
      return t;
  }
} 