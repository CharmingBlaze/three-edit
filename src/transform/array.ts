import { Vector3, Matrix4 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';

/**
 * Options for array operations
 */
export interface ArrayOptions {
  /** Whether to merge the arrays into a single mesh */
  merge?: boolean;
  /** Whether to weld vertices at connection points */
  weldVertices?: boolean;
  /** Tolerance for welding vertices */
  weldTolerance?: number;
}

/**
 * Options for linear array
 */
export interface LinearArrayOptions extends ArrayOptions {
  /** Number of instances to create */
  count?: number;
  /** Distance between instances */
  distance?: number;
  /** Direction of the array */
  direction?: Vector3;
  /** Starting position offset */
  offset?: Vector3;
}

/**
 * Options for radial array
 */
export interface RadialArrayOptions extends ArrayOptions {
  /** Number of instances to create */
  count?: number;
  /** Radius of the circle */
  radius?: number;
  /** Center point of the circle */
  center?: Vector3;
  /** Axis of rotation (normal to the circle plane) */
  axis?: Vector3;
  /** Starting angle in radians */
  startAngle?: number;
  /** Ending angle in radians */
  endAngle?: number;
}

/**
 * Options for grid array
 */
export interface GridArrayOptions extends ArrayOptions {
  /** Number of instances in X direction */
  countX?: number;
  /** Number of instances in Y direction */
  countY?: number;
  /** Number of instances in Z direction */
  countZ?: number;
  /** Distance between instances in X direction */
  distanceX?: number;
  /** Distance between instances in Y direction */
  distanceY?: number;
  /** Distance between instances in Z direction */
  distanceZ?: number;
  /** Starting position offset */
  offset?: Vector3;
}

/**
 * Creates a linear array of the mesh
 * @param mesh The mesh to array
 * @param options Options for the linear array
 * @returns Array of meshes or a single merged mesh
 */
export function arrayLinear(
  mesh: EditableMesh,
  options: LinearArrayOptions = {}
): EditableMesh[] | EditableMesh {
  const count = options.count ?? 3;
  const distance = options.distance ?? 1;
  const direction = options.direction ?? new Vector3(1, 0, 0);
  const offset = options.offset ?? new Vector3(0, 0, 0);
  const merge = options.merge ?? false;
  
  const meshes: EditableMesh[] = [];
  
  for (let i = 0; i < count; i++) {
    const instance = mesh.clone();
    
    // Calculate position
    const position = new Vector3();
    position.copy(direction).normalize().multiplyScalar(distance * i);
    position.add(offset);
    
    // Apply transformation
    const matrix = new Matrix4();
    matrix.makeTranslation(position.x, position.y, position.z);
    instance.matrix.multiply(matrix);
    instance.applyMatrix();
    
    meshes.push(instance);
  }
  
  if (merge) {
    // Merge all meshes into one
    const mergedMesh = meshes[0];
    for (let i = 1; i < meshes.length; i++) {
      // Add vertices, edges, and faces from other meshes
      const otherMesh = meshes[i];
      const vertexOffset = mergedMesh.getVertexCount();
      
      // Add vertices
      for (const vertex of otherMesh.vertices) {
        mergedMesh.addVertex(vertex.clone());
      }
      
      // Add edges with updated indices
      for (const edge of otherMesh.edges) {
        mergedMesh.addEdge(new Edge(
          edge.v1 + vertexOffset,
          edge.v2 + vertexOffset,
          { ...edge.userData }
        ));
      }
      
      // Add faces with updated indices
      for (const face of otherMesh.faces) {
        const updatedVertices = face.vertices.map(v => v + vertexOffset);
        const updatedEdges = face.edges.map(e => e + vertexOffset);
        mergedMesh.addFace(new Face(
          updatedVertices,
          updatedEdges,
          {
            normal: face.normal?.clone(),
            materialIndex: face.materialIndex,
            userData: { ...face.userData }
          }
        ));
      }
    }
    return mergedMesh;
  }
  
  return meshes;
}

/**
 * Creates a radial array of the mesh
 * @param mesh The mesh to array
 * @param options Options for the radial array
 * @returns Array of meshes or a single merged mesh
 */
export function arrayRadial(
  mesh: EditableMesh,
  options: RadialArrayOptions = {}
): EditableMesh[] | EditableMesh {
  const count = options.count ?? 8;
  const radius = options.radius ?? 1;
  const center = options.center ?? new Vector3(0, 0, 0);
  const axis = options.axis ?? new Vector3(0, 0, 1);
  const startAngle = options.startAngle ?? 0;
  const endAngle = options.endAngle ?? 2 * Math.PI;
  const merge = options.merge ?? false;
  
  const meshes: EditableMesh[] = [];
  const angleStep = (endAngle - startAngle) / count;
  
  for (let i = 0; i < count; i++) {
    const instance = mesh.clone();
    
    // Calculate angle
    const angle = startAngle + angleStep * i;
    
    // Calculate position on circle
    const position = new Vector3();
    position.x = center.x + radius * Math.cos(angle);
    position.y = center.y + radius * Math.sin(angle);
    position.z = center.z;
    
    // Create rotation matrix
    const rotationMatrix = new Matrix4();
    rotationMatrix.makeRotationAxis(axis, angle);
    
    // Create translation matrix
    const translationMatrix = new Matrix4();
    translationMatrix.makeTranslation(position.x, position.y, position.z);
    
    // Apply transformations
    const finalMatrix = new Matrix4();
    finalMatrix.multiply(translationMatrix);
    finalMatrix.multiply(rotationMatrix);
    instance.matrix.multiply(finalMatrix);
    instance.applyMatrix();
    
    meshes.push(instance);
  }
  
  if (merge) {
    // Merge all meshes into one (similar to linear array)
    const mergedMesh = meshes[0];
    for (let i = 1; i < meshes.length; i++) {
      const otherMesh = meshes[i];
      const vertexOffset = mergedMesh.getVertexCount();
      
      // Add vertices
      for (const vertex of otherMesh.vertices) {
        mergedMesh.addVertex(vertex.clone());
      }
      
      // Add edges with updated indices
      for (const edge of otherMesh.edges) {
        mergedMesh.addEdge(new Edge(
          edge.v1 + vertexOffset,
          edge.v2 + vertexOffset,
          { ...edge.userData }
        ));
      }
      
      // Add faces with updated indices
      for (const face of otherMesh.faces) {
        const updatedVertices = face.vertices.map(v => v + vertexOffset);
        const updatedEdges = face.edges.map(e => e + vertexOffset);
        mergedMesh.addFace(new Face(
          updatedVertices,
          updatedEdges,
          {
            normal: face.normal?.clone(),
            materialIndex: face.materialIndex,
            userData: { ...face.userData }
          }
        ));
      }
    }
    return mergedMesh;
  }
  
  return meshes;
}

/**
 * Creates a grid array of the mesh
 * @param mesh The mesh to array
 * @param options Options for the grid array
 * @returns Array of meshes or a single merged mesh
 */
export function arrayGrid(
  mesh: EditableMesh,
  options: GridArrayOptions = {}
): EditableMesh[] | EditableMesh {
  const countX = options.countX ?? 3;
  const countY = options.countY ?? 3;
  const countZ = options.countZ ?? 1;
  const distanceX = options.distanceX ?? 1;
  const distanceY = options.distanceY ?? 1;
  const distanceZ = options.distanceZ ?? 1;
  const offset = options.offset ?? new Vector3(0, 0, 0);
  const merge = options.merge ?? false;
  
  const meshes: EditableMesh[] = [];
  
  for (let x = 0; x < countX; x++) {
    for (let y = 0; y < countY; y++) {
      for (let z = 0; z < countZ; z++) {
        const instance = mesh.clone();
        
        // Calculate position
        const position = new Vector3();
        position.x = offset.x + x * distanceX;
        position.y = offset.y + y * distanceY;
        position.z = offset.z + z * distanceZ;
        
        // Apply transformation
        const matrix = new Matrix4();
        matrix.makeTranslation(position.x, position.y, position.z);
        instance.matrix.multiply(matrix);
        instance.applyMatrix();
        
        meshes.push(instance);
      }
    }
  }
  
  if (merge) {
    // Merge all meshes into one (similar to linear array)
    const mergedMesh = meshes[0];
    for (let i = 1; i < meshes.length; i++) {
      const otherMesh = meshes[i];
      const vertexOffset = mergedMesh.getVertexCount();
      
      // Add vertices
      for (const vertex of otherMesh.vertices) {
        mergedMesh.addVertex(vertex.clone());
      }
      
      // Add edges with updated indices
      for (const edge of otherMesh.edges) {
        mergedMesh.addEdge(new Edge(
          edge.v1 + vertexOffset,
          edge.v2 + vertexOffset,
          { ...edge.userData }
        ));
      }
      
      // Add faces with updated indices
      for (const face of otherMesh.faces) {
        const updatedVertices = face.vertices.map(v => v + vertexOffset);
        const updatedEdges = face.edges.map(e => e + vertexOffset);
        mergedMesh.addFace(new Face(
          updatedVertices,
          updatedEdges,
          {
            normal: face.normal?.clone(),
            materialIndex: face.materialIndex,
            userData: { ...face.userData }
          }
        ));
      }
    }
    return mergedMesh;
  }
  
  return meshes;
}

/**
 * Generic array function that can create different types of arrays
 * @param mesh The mesh to array
 * @param arrayType The type of array to create
 * @param options Options for the array operation
 * @returns Array of meshes or a single merged mesh
 */
export function array(
  mesh: EditableMesh,
  arrayType: 'linear' | 'radial' | 'grid',
  options: LinearArrayOptions | RadialArrayOptions | GridArrayOptions = {}
): EditableMesh[] | EditableMesh {
  switch (arrayType) {
    case 'linear':
      return arrayLinear(mesh, options as LinearArrayOptions);
    case 'radial':
      return arrayRadial(mesh, options as RadialArrayOptions);
    case 'grid':
      return arrayGrid(mesh, options as GridArrayOptions);
    default:
      throw new Error(`Unknown array type: ${arrayType}`);
  }
} 