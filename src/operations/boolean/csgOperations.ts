import { EditableMesh } from '../../core/EditableMesh';
import { Vertex } from '../../core/Vertex';
import { Edge } from '../../core/Edge';
import { Face } from '../../core/Face';
import { Vector3 } from 'three';
import { CSGOptions } from './types';
import { validateGeometryIntegrity } from '../../validation/validateGeometryIntegrity';

/**
 * CSG operation types
 */
export type CSGOperation = 'union' | 'difference' | 'intersection';

/**
 * CSG operation result
 */
export interface CSGResult {
  /** The resulting mesh */
  mesh: EditableMesh;
  /** Whether the operation was successful */
  success: boolean;
  /** Error message if operation failed */
  error?: string;
  /** Validation results if validation was performed */
  validation?: any;
  /** Statistics about the operation */
  statistics?: {
    inputVertices: number;
    inputFaces: number;
    outputVertices: number;
    outputFaces: number;
    processingTime: number;
  };
}

/**
 * CSG Node for building CSG trees
 */
export class CSGNode {
  public mesh: EditableMesh;
  public operation?: CSGOperation;
  public left?: CSGNode;
  public right?: CSGNode;

  constructor(mesh: EditableMesh, operation?: CSGOperation, left?: CSGNode, right?: CSGNode) {
    this.mesh = mesh;
    this.operation = operation;
    this.left = left;
    this.right = right;
  }

  /**
   * Evaluate the CSG tree
   */
  evaluate(options: CSGOptions = {}): CSGResult {
    if (!this.operation || !this.left || !this.right) {
      // Leaf node - return the mesh
      return {
        mesh: this.mesh.clone(),
        success: true,
        statistics: {
          inputVertices: this.mesh.vertices.length,
          inputFaces: this.mesh.faces.length,
          outputVertices: this.mesh.vertices.length,
          outputFaces: this.mesh.faces.length,
          processingTime: 0
        }
      };
    }

    // Evaluate left and right subtrees
    const leftResult = this.left.evaluate(options);
    const rightResult = this.right.evaluate(options);

    if (!leftResult.success || !rightResult.success) {
      return {
        mesh: new EditableMesh(),
        success: false,
        error: `Failed to evaluate ${this.operation}: ${leftResult.error || rightResult.error}`
      };
    }

    // Perform the operation
    return performCSGOperation(leftResult.mesh, rightResult.mesh, this.operation, options);
  }
}

/**
 * Perform CSG operation between two meshes
 */
export function performCSGOperation(
  meshA: EditableMesh,
  meshB: EditableMesh,
  operation: CSGOperation,
  options: CSGOptions = {}
): CSGResult {
  const startTime = performance.now();
  const {
    tolerance = 1e-6,
    validate = true,
    repair = false,
    preserveMaterials = true,
    mergeVertices = true
  } = options;

  try {
    // Ensure meshes are valid
    if (meshA.vertices.length === 0 || meshB.vertices.length === 0) {
      return {
        mesh: new EditableMesh(),
        success: false,
        error: 'One or both input meshes are empty'
      };
    }

    // Create result mesh
    const resultMesh = new EditableMesh({
      name: `${meshA.name}_${operation}_${meshB.name}`
    });

    // Perform the specific operation
    let success = false;
    switch (operation) {
      case 'union':
        success = performUnion(meshA, meshB, resultMesh, options);
        break;
      case 'difference':
        success = performSubtract(meshA, meshB, resultMesh, options);
        break;
      case 'intersection':
        success = performIntersect(meshA, meshB, resultMesh, options);
        break;
      default:
        return {
          mesh: new EditableMesh(),
          success: false,
          error: `Unknown CSG operation: ${operation}`
        };
    }

    if (!success) {
      return {
        mesh: new EditableMesh(),
        success: false,
        error: `Failed to perform ${operation} operation`
      };
    }

    // Post-process the result
    if (mergeVertices) {
      mergeCoincidentVertices(resultMesh, tolerance);
    }

    // Validate if requested
    let validation;
    if (validate) {
      validation = validateGeometryIntegrity(resultMesh);
      if (!validation.valid && repair) {
        // TODO: Implement repair functionality
        console.warn('Geometry validation failed, repair not yet implemented');
      }
    }

    const processingTime = performance.now() - startTime;

    return {
      mesh: resultMesh,
      success: true,
      validation,
      statistics: {
        inputVertices: meshA.vertices.length + meshB.vertices.length,
        inputFaces: meshA.faces.length + meshB.faces.length,
        outputVertices: resultMesh.vertices.length,
        outputFaces: resultMesh.faces.length,
        processingTime
      }
    };

  } catch (error) {
    return {
      mesh: new EditableMesh(),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during CSG operation'
    };
  }
}

/**
 * Perform union operation
 */
function performUnion(
  meshA: EditableMesh,
  meshB: EditableMesh,
  resultMesh: EditableMesh,
  options: CSGOptions
): boolean {
  try {
    // Copy all vertices and faces from both meshes
    const vertexOffset = meshA.vertices.length;
    
    // Copy meshA
    copyMeshData(meshA, resultMesh, 0);
    
    // Copy meshB
    copyMeshData(meshB, resultMesh, vertexOffset);
    
    // Remove overlapping geometry
    removeOverlappingGeometry(resultMesh, options.tolerance || 1e-6);
    
    return true;
  } catch (error) {
    console.error('Union operation failed:', error);
    return false;
  }
}

/**
 * Perform subtract operation
 */
function performSubtract(
  meshA: EditableMesh,
  meshB: EditableMesh,
  resultMesh: EditableMesh,
  options: CSGOptions
): boolean {
  try {
    // Copy meshA
    copyMeshData(meshA, resultMesh, 0);
    
    // Find intersection regions and remove them
    const intersectionRegions = findIntersectionRegions(resultMesh, meshB, options.tolerance || 1e-6);
    
    // Remove faces in intersection regions
    for (const faceIndex of intersectionRegions) {
      if (faceIndex < resultMesh.faces.length) {
        resultMesh.removeFace(faceIndex);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Subtract operation failed:', error);
    return false;
  }
}

/**
 * Perform intersect operation
 */
function performIntersect(
  meshA: EditableMesh,
  meshB: EditableMesh,
  resultMesh: EditableMesh,
  options: CSGOptions
): boolean {
  try {
    // Find intersection regions
    const intersectionRegions = findIntersectionRegions(meshA, meshB, options.tolerance || 1e-6);
    
    // Copy only the intersection faces
    for (const faceIndex of intersectionRegions) {
      if (faceIndex < meshA.faces.length) {
        const face = meshA.faces[faceIndex];
        const newFace = face.clone();
        resultMesh.addFace(newFace);
        
        // Add vertices if not already present
        for (const vertexIndex of face.vertices) {
          const vertex = meshA.vertices[vertexIndex];
          if (vertex && !resultMesh.vertices.includes(vertex)) {
            resultMesh.addVertex(vertex.clone());
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Intersect operation failed:', error);
    return false;
  }
}

/**
 * Copy mesh data to target mesh
 */
function copyMeshData(source: EditableMesh, target: EditableMesh, vertexOffset: number): void {
  // Copy vertices
  for (const vertex of source.vertices) {
    const newVertex = vertex.clone();
    target.addVertex(newVertex);
  }
  
  // Copy edges
  for (const edge of source.edges) {
    const newEdge = new Edge(
      edge.v1 + vertexOffset,
      edge.v2 + vertexOffset
    );
    target.addEdge(newEdge);
  }
  
  // Copy faces
  for (const face of source.faces) {
    const newFace = face.clone();
    // Adjust vertex indices
    newFace.vertices = newFace.vertices.map(v => v + vertexOffset);
    target.addFace(newFace);
  }
}

/**
 * Remove overlapping geometry from the result mesh
 */
function removeOverlappingGeometry(mesh: EditableMesh, tolerance: number): void {
  // Find and remove duplicate faces
  const facesToRemove: number[] = [];
  
  for (let i = 0; i < mesh.faces.length; i++) {
    for (let j = i + 1; j < mesh.faces.length; j++) {
      if (facesAreEqual(mesh.faces[i], mesh.faces[j], tolerance)) {
        facesToRemove.push(j);
      }
    }
  }
  
  // Remove faces in reverse order to maintain indices
  facesToRemove.sort((a, b) => b - a);
  for (const faceIndex of facesToRemove) {
    mesh.removeFace(faceIndex);
  }
}

/**
 * Check if two faces are equal
 */
function facesAreEqual(faceA: Face, faceB: Face, tolerance: number): boolean {
  if (faceA.vertices.length !== faceB.vertices.length) {
    return false;
  }
  
  // Check if vertices are the same (allowing for different order)
  const verticesA = faceA.vertices.slice().sort();
  const verticesB = faceB.vertices.slice().sort();
  
  for (let i = 0; i < verticesA.length; i++) {
    if (verticesA[i] !== verticesB[i]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Find intersection regions between two meshes
 */
function findIntersectionRegions(meshA: EditableMesh, meshB: EditableMesh, tolerance: number): number[] {
  const intersectionFaces: number[] = [];
  
  // Simple implementation: find faces that are close to each other
  // In a full implementation, this would use proper spatial partitioning
  for (let i = 0; i < meshA.faces.length; i++) {
    const faceA = meshA.faces[i];
    const centerA = calculateFaceCenter(faceA, meshA);
    
    for (let j = 0; j < meshB.faces.length; j++) {
      const faceB = meshB.faces[j];
      const centerB = calculateFaceCenter(faceB, meshB);
      
      const distance = centerA.distanceTo(centerB);
      if (distance < tolerance) {
        intersectionFaces.push(i);
        break;
      }
    }
  }
  
  return intersectionFaces;
}

/**
 * Calculate the center of a face
 */
function calculateFaceCenter(face: Face, mesh: EditableMesh): Vector3 {
  const center = new Vector3();
  
  for (const vertexIndex of face.vertices) {
    const vertex = mesh.vertices[vertexIndex];
    if (vertex) {
      center.add(new Vector3(vertex.x, vertex.y, vertex.z));
    }
  }
  
  center.divideScalar(face.vertices.length);
  return center;
}

/**
 * Merge coincident vertices
 */
function mergeCoincidentVertices(mesh: EditableMesh, tolerance: number): void {
  const verticesToMerge = new Map<number, number>();
  
  for (let i = 0; i < mesh.vertices.length; i++) {
    for (let j = i + 1; j < mesh.vertices.length; j++) {
      const vertexA = mesh.vertices[i];
      const vertexB = mesh.vertices[j];
      
      const distance = Math.sqrt(
        Math.pow(vertexA.x - vertexB.x, 2) +
        Math.pow(vertexA.y - vertexB.y, 2) +
        Math.pow(vertexA.z - vertexB.z, 2)
      );
      
      if (distance <= tolerance) {
        verticesToMerge.set(j, i);
      }
    }
  }
  
  // Apply vertex merging
  for (const [fromIndex, toIndex] of verticesToMerge) {
    // Update all faces that reference the merged vertex
    for (const face of mesh.faces) {
      for (let k = 0; k < face.vertices.length; k++) {
        if (face.vertices[k] === fromIndex) {
          face.vertices[k] = toIndex;
        }
      }
    }
    
    // Update all edges that reference the merged vertex
    for (const edge of mesh.edges) {
      if (edge.v1 === fromIndex) {
        edge.v1 = toIndex;
      }
      if (edge.v2 === fromIndex) {
        edge.v2 = toIndex;
      }
    }
  }
  
  // Remove merged vertices
  const indicesToRemove = Array.from(verticesToMerge.keys()).sort((a, b) => b - a);
  for (const index of indicesToRemove) {
    mesh.removeVertex(index);
  }
}

/**
 * Create a CSG tree for complex operations
 */
export function createCSGTree(meshes: EditableMesh[], operations: CSGOperation[]): CSGNode | null {
  if (meshes.length === 0) {
    return null;
  }
  
  if (meshes.length === 1) {
    return new CSGNode(meshes[0]);
  }
  
  if (meshes.length !== operations.length + 1) {
    throw new Error('Number of operations must be one less than number of meshes');
  }
  
  let currentNode = new CSGNode(meshes[0]);
  
  for (let i = 0; i < operations.length; i++) {
    const rightNode = new CSGNode(meshes[i + 1]);
    currentNode = new CSGNode(
      new EditableMesh(), // Placeholder mesh
      operations[i],
      currentNode,
      rightNode
    );
  }
  
  return currentNode;
}

/**
 * Export the main CSG functions
 */
export function csgUnion(meshA: EditableMesh, meshB: EditableMesh, options: CSGOptions = {}): CSGResult {
  return performCSGOperation(meshA, meshB, 'union', options);
}

export function csgSubtract(meshA: EditableMesh, meshB: EditableMesh, options: CSGOptions = {}): CSGResult {
  return performCSGOperation(meshA, meshB, 'difference', options);
}

export function csgIntersect(meshA: EditableMesh, meshB: EditableMesh, options: CSGOptions = {}): CSGResult {
  return performCSGOperation(meshA, meshB, 'intersection', options);
} 