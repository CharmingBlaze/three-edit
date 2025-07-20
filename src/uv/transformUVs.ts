import { EditableMesh } from '../core/EditableMesh.ts';
import { Selection } from '../selection/Selection.ts';
import { UVCoord } from './UVCoord';

/**
 * Options for UV transformation
 */
export interface TransformUVsOptions {
  /** Translation in U direction */
  translateU?: number;
  /** Translation in V direction */
  translateV?: number;
  /** Scale factor for U coordinate */
  scaleU?: number;
  /** Scale factor for V coordinate */
  scaleV?: number;
  /** Rotation angle in degrees */
  rotation?: number;
  /** Pivot point for scaling and rotation */
  pivot?: UVCoord;
  /** Whether to flip U coordinates */
  flipU?: boolean;
  /** Whether to flip V coordinates */
  flipV?: boolean;
}

/**
 * Transforms UV coordinates of selected vertices
 * @param mesh The mesh to modify
 * @param selection The selection containing vertices to transform
 * @param options Transformation options
 * @returns The mesh with transformed UVs
 */
export function transformUVs(
  mesh: EditableMesh,
  selection: Selection,
  options: TransformUVsOptions = {}
): EditableMesh {
  const translateU = options.translateU ?? 0;
  const translateV = options.translateV ?? 0;
  const scaleU = options.scaleU ?? 1;
  const scaleV = options.scaleV ?? 1;
  const rotation = options.rotation ?? 0;
  const flipU = options.flipU ?? false;
  const flipV = options.flipV ?? false;
  
  // Calculate pivot point if not provided
  let pivot = options.pivot;
  if (!pivot && (rotation !== 0 || scaleU !== 1 || scaleV !== 1)) {
    pivot = calculateUVPivot(mesh, selection);
  }
  
  // Process selected vertices
  const vertexIndices = selection.vertices.size > 0 
    ? Array.from(selection.vertices)
    : getAffectedVertices(mesh, selection);
  
  vertexIndices.forEach(vertexIndex => {
    const vertex = mesh.getVertex(vertexIndex);
    if (!vertex || !vertex.uv) return;
    
    let { u, v } = vertex.uv;
    
    // Apply transformations
    
    // Step 1: Translate to origin if pivot is specified
    if (pivot) {
      u -= pivot.u;
      v -= pivot.v;
    }
    
    // Step 2: Apply rotation
    if (rotation !== 0) {
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const newU = u * cos - v * sin;
      const newV = u * sin + v * cos;
      u = newU;
      v = newV;
    }
    
    // Step 3: Apply scaling
    u *= scaleU;
    v *= scaleV;
    
    // Step 4: Apply flipping
    if (flipU) u = -u;
    if (flipV) v = -v;
    
    // Step 5: Translate back from origin if pivot is specified
    if (pivot) {
      u += pivot.u;
      v += pivot.v;
    }
    
    // Step 6: Apply translation
    u += translateU;
    v += translateV;
    
    // Update UV
    vertex.uv = { u, v };
  });
  
  return mesh;
}

/**
 * Translates UV coordinates of selected vertices
 * @param mesh The mesh to modify
 * @param selection The selection containing vertices to transform
 * @param u Translation in U direction
 * @param v Translation in V direction
 * @returns The mesh with translated UVs
 */
export function translateUVs(
  mesh: EditableMesh,
  selection: Selection,
  u: number,
  v: number
): EditableMesh {
  return transformUVs(mesh, selection, { translateU: u, translateV: v });
}

/**
 * Scales UV coordinates of selected vertices
 * @param mesh The mesh to modify
 * @param selection The selection containing vertices to transform
 * @param u Scale factor for U coordinate
 * @param v Scale factor for V coordinate
 * @param pivot Pivot point for scaling
 * @returns The mesh with scaled UVs
 */
export function scaleUVs(
  mesh: EditableMesh,
  selection: Selection,
  u: number,
  v: number,
  pivot?: UVCoord
): EditableMesh {
  return transformUVs(mesh, selection, { scaleU: u, scaleV: v, pivot });
}

/**
 * Rotates UV coordinates of selected vertices
 * @param mesh The mesh to modify
 * @param selection The selection containing vertices to transform
 * @param angle Rotation angle in degrees
 * @param pivot Pivot point for rotation
 * @returns The mesh with rotated UVs
 */
export function rotateUVs(
  mesh: EditableMesh,
  selection: Selection,
  angle: number,
  pivot?: UVCoord
): EditableMesh {
  return transformUVs(mesh, selection, { rotation: angle, pivot });
}

/**
 * Flips UV coordinates of selected vertices
 * @param mesh The mesh to modify
 * @param selection The selection containing vertices to transform
 * @param flipU Whether to flip U coordinates
 * @param flipV Whether to flip V coordinates
 * @param pivot Pivot point for flipping
 * @returns The mesh with flipped UVs
 */
export function flipUVs(
  mesh: EditableMesh,
  selection: Selection,
  flipU: boolean,
  flipV: boolean,
  pivot?: UVCoord
): EditableMesh {
  return transformUVs(mesh, selection, { flipU, flipV, pivot });
}

/**
 * Calculates the pivot point (center) of UV coordinates for selected vertices
 * @param mesh The mesh to query
 * @param selection The selection containing vertices
 * @returns The pivot point (average of UV coordinates)
 */
export function calculateUVPivot(mesh: EditableMesh, selection: Selection): UVCoord {
  const vertexIndices = selection.vertices.size > 0 
    ? Array.from(selection.vertices)
    : getAffectedVertices(mesh, selection);
  
  let sumU = 0;
  let sumV = 0;
  let count = 0;
  
  vertexIndices.forEach(vertexIndex => {
    const vertex = mesh.getVertex(vertexIndex);
    if (!vertex || !vertex.uv) return;
    
    sumU += vertex.uv.u;
    sumV += vertex.uv.v;
    count++;
  });
  
  if (count === 0) {
    return { u: 0.5, v: 0.5 }; // Default pivot
  }
  
  return {
    u: sumU / count,
    v: sumV / count
  };
}

/**
 * Gets all vertex indices affected by a selection
 * @param mesh The mesh to query
 * @param selection The selection
 * @returns Array of vertex indices
 */
function getAffectedVertices(mesh: EditableMesh, selection: Selection): number[] {
  const vertexSet = new Set<number>();
  
  // Add directly selected vertices
  selection.vertices.forEach(index => vertexSet.add(index));
  
  // Add vertices from selected edges
  selection.edges.forEach(edgeIndex => {
    const edge = mesh.getEdge(edgeIndex);
    if (edge) {
      vertexSet.add(edge.v1);
      vertexSet.add(edge.v2);
    }
  });
  
  // Add vertices from selected faces
  selection.faces.forEach(faceIndex => {
    const face = mesh.getFace(faceIndex);
    if (face) {
      face.vertices.forEach(vertexIndex => {
        vertexSet.add(vertexIndex);
      });
    }
  });
  
  return Array.from(vertexSet);
}
