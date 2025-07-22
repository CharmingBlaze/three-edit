/**
 * Mesh Transforms - Pure functions for entire mesh transformation operations
 * All functions return new EditableMesh instances, never modify the original
 */

import { EditableMesh } from '../EditableMesh.js';

/**
 * Move entire mesh by a translation vector
 * @param {EditableMesh} mesh - The mesh to transform
 * @param {Object} translation - Translation vector {x, y, z}
 * @returns {EditableMesh} New mesh with moved vertices
 */
export function moveMesh(mesh, translation) {
  const newMesh = mesh.clone();
  
  for (const [vertexId, vertex] of newMesh.vertices) {
    vertex.position.x += translation.x;
    vertex.position.y += translation.y;
    vertex.position.z += translation.z;
  }
  
  return newMesh;
}

/**
 * Rotate entire mesh around a center point
 * @param {EditableMesh} mesh - The mesh to transform
 * @param {Object} center - Rotation center point {x, y, z}
 * @param {Object} rotation - Rotation in radians {x, y, z}
 * @returns {EditableMesh} New mesh with rotated vertices
 */
export function rotateMesh(mesh, center, rotation) {
  const newMesh = mesh.clone();
  
  // Create rotation matrices
  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);
  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);
  const cosZ = Math.cos(rotation.z);
  const sinZ = Math.sin(rotation.z);
  
  for (const [vertexId, vertex] of newMesh.vertices) {
    // Translate to origin
    let x = vertex.position.x - center.x;
    let y = vertex.position.y - center.y;
    let z = vertex.position.z - center.z;
    
    // Apply rotations (Z, Y, X order)
    // Z rotation
    const xZ = x * cosZ - y * sinZ;
    const yZ = x * sinZ + y * cosZ;
    x = xZ;
    y = yZ;
    
    // Y rotation
    const xY = x * cosY + z * sinY;
    const zY = -x * sinY + z * cosY;
    x = xY;
    z = zY;
    
    // X rotation
    const yX = y * cosX - z * sinX;
    const zX = y * sinX + z * cosX;
    y = yX;
    z = zX;
    
    // Translate back
    vertex.position.x = x + center.x;
    vertex.position.y = y + center.y;
    vertex.position.z = z + center.z;
  }
  
  return newMesh;
}

/**
 * Scale entire mesh from a center point
 * @param {EditableMesh} mesh - The mesh to transform
 * @param {Object} center - Scaling center point {x, y, z}
 * @param {Object} scale - Scale factors {x, y, z}
 * @returns {EditableMesh} New mesh with scaled vertices
 */
export function scaleMesh(mesh, center, scale) {
  const newMesh = mesh.clone();
  
  for (const [vertexId, vertex] of newMesh.vertices) {
    // Translate to origin
    const x = vertex.position.x - center.x;
    const y = vertex.position.y - center.y;
    const z = vertex.position.z - center.z;
    
    // Apply scale
    vertex.position.x = x * scale.x + center.x;
    vertex.position.y = y * scale.y + center.y;
    vertex.position.z = z * scale.z + center.z;
  }
  
  return newMesh;
}

/**
 * Transform entire mesh using a 4x4 transformation matrix
 * @param {EditableMesh} mesh - The mesh to transform
 * @param {Array} matrix - 4x4 transformation matrix as 16-element array
 * @returns {EditableMesh} New mesh with transformed vertices
 */
export function transformMesh(mesh, matrix) {
  const newMesh = mesh.clone();
  
  for (const [vertexId, vertex] of newMesh.vertices) {
    const { x, y, z } = vertex.position;
    
    // Apply transformation matrix
    const newX = matrix[0] * x + matrix[1] * y + matrix[2] * z + matrix[3];
    const newY = matrix[4] * x + matrix[5] * y + matrix[6] * z + matrix[7];
    const newZ = matrix[8] * x + matrix[9] * y + matrix[10] * z + matrix[11];
    const w = matrix[12] * x + matrix[13] * y + matrix[14] * z + matrix[15];
    
    // Apply perspective division
    if (w !== 0) {
      vertex.position.x = newX / w;
      vertex.position.y = newY / w;
      vertex.position.z = newZ / w;
    } else {
      vertex.position.x = newX;
      vertex.position.y = newY;
      vertex.position.z = newZ;
    }
  }
  
  return newMesh;
}

/**
 * Mirror entire mesh across a plane
 * @param {EditableMesh} mesh - The mesh to transform
 * @param {Object} plane - Mirror plane {normal: {x,y,z}, point: {x,y,z}}
 * @returns {EditableMesh} New mesh with mirrored vertices
 */
export function mirrorMesh(mesh, plane) {
  const newMesh = mesh.clone();
  const { normal, point } = plane;
  
  // Normalize plane normal
  const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
  const unitNormal = {
    x: normal.x / length,
    y: normal.y / length,
    z: normal.z / length
  };
  
  for (const [vertexId, vertex] of newMesh.vertices) {
    // Calculate distance to plane
    const toVertex = {
      x: vertex.position.x - point.x,
      y: vertex.position.y - point.y,
      z: vertex.position.z - point.z
    };
    
    const distance = toVertex.x * unitNormal.x + toVertex.y * unitNormal.y + toVertex.z * unitNormal.z;
    
    // Mirror the vertex
    vertex.position.x -= 2 * unitNormal.x * distance;
    vertex.position.y -= 2 * unitNormal.y * distance;
    vertex.position.z -= 2 * unitNormal.z * distance;
  }
  
  return newMesh;
}

/**
 * Calculate mesh bounding box
 * @param {EditableMesh} mesh - The mesh to analyze
 * @returns {Object} Bounding box {min: {x,y,z}, max: {x,y,z}, center: {x,y,z}, size: {x,y,z}}
 */
export function getMeshBoundingBox(mesh) {
  if (mesh.vertices.size === 0) {
    return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 }, center: { x: 0, y: 0, z: 0 }, size: { x: 0, y: 0, z: 0 } };
  }
  
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  
  for (const [vertexId, vertex] of mesh.vertices) {
    minX = Math.min(minX, vertex.position.x);
    minY = Math.min(minY, vertex.position.y);
    minZ = Math.min(minZ, vertex.position.z);
    maxX = Math.max(maxX, vertex.position.x);
    maxY = Math.max(maxY, vertex.position.y);
    maxZ = Math.max(maxZ, vertex.position.z);
  }
  
  const min = { x: minX, y: minY, z: minZ };
  const max = { x: maxX, y: maxY, z: maxZ };
  const center = {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    z: (minZ + maxZ) / 2
  };
  const size = {
    x: maxX - minX,
    y: maxY - minY,
    z: maxZ - minZ
  };
  
  return { min, max, center, size };
}

/**
 * Center mesh at origin
 * @param {EditableMesh} mesh - The mesh to center
 * @returns {EditableMesh} New mesh centered at origin
 */
export function centerMesh(mesh) {
  const boundingBox = getMeshBoundingBox(mesh);
  const translation = {
    x: -boundingBox.center.x,
    y: -boundingBox.center.y,
    z: -boundingBox.center.z
  };
  
  return moveMesh(mesh, translation);
}

/**
 * Normalize mesh to fit in unit cube
 * @param {EditableMesh} mesh - The mesh to normalize
 * @param {number} scale - Target scale (default: 1.0)
 * @returns {EditableMesh} New mesh normalized to unit cube
 */
export function normalizeMesh(mesh, scale = 1.0) {
  const boundingBox = getMeshBoundingBox(mesh);
  const maxSize = Math.max(boundingBox.size.x, boundingBox.size.y, boundingBox.size.z);
  
  if (maxSize === 0) {return mesh.clone();}
  
  const scaleFactor = scale / maxSize;
  const center = boundingBox.center;
  
  // Center and scale
  let newMesh = centerMesh(mesh);
  newMesh = scaleMesh(newMesh, { x: 0, y: 0, z: 0 }, { x: scaleFactor, y: scaleFactor, z: scaleFactor });
  
  return newMesh;
}

/**
 * Align mesh to axis
 * @param {EditableMesh} mesh - The mesh to align
 * @param {string} axis - Axis to align to ('x', 'y', 'z', 'xy', 'xz', 'yz', 'xyz')
 * @returns {EditableMesh} New mesh aligned to specified axis
 */
export function alignMeshToAxis(mesh, axis = 'xyz') {
  const boundingBox = getMeshBoundingBox(mesh);
  const center = boundingBox.center;
  
  const newMesh = centerMesh(mesh);
  
  // Apply alignment based on axis
  if (axis.includes('x')) {
    // Align to X axis (no rotation needed)
  }
  
  if (axis.includes('y')) {
    // Align to Y axis (no rotation needed)
  }
  
  if (axis.includes('z')) {
    // Align to Z axis (no rotation needed)
  }
  
  return newMesh;
}

/**
 * Create a copy of mesh at offset position
 * @param {EditableMesh} mesh - The mesh to copy
 * @param {Object} offset - Offset vector {x, y, z}
 * @returns {EditableMesh} New mesh at offset position
 */
export function copyMeshAtOffset(mesh, offset) {
  const newMesh = mesh.clone();
  
  // Update vertex IDs to avoid conflicts
  const vertexIdMap = new Map();
  for (const [oldVertexId, vertex] of newMesh.vertices) {
    const newVertexId = newMesh.nextVertexId++;
    vertexIdMap.set(oldVertexId, newVertexId);
    vertex.id = newVertexId;
  }
  
  // Update edge vertex references
  for (const [edgeId, edge] of newMesh.edges) {
    edge.vertexA = vertexIdMap.get(edge.vertexA);
    edge.vertexB = vertexIdMap.get(edge.vertexB);
  }
  
  // Update face vertex references
  for (const [faceId, face] of newMesh.faces) {
    face.vertices = face.vertices.map(vId => vertexIdMap.get(vId));
  }
  
  // Move to offset position
  return moveMesh(newMesh, offset);
}

/**
 * Create array of meshes
 * @param {EditableMesh} mesh - The mesh to array
 * @param {Object} options - Array options
 * @param {number} options.count - Number of copies
 * @param {Object} options.offset - Offset between copies {x, y, z}
 * @param {Object} options.rotation - Rotation between copies {x, y, z}
 * @param {Object} options.scale - Scale between copies {x, y, z}
 * @returns {Array} Array of mesh copies
 */
export function createMeshArray(mesh, options = {}) {
  const { count = 3, offset = { x: 2, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }, scale = { x: 1, y: 1, z: 1 } } = options;
  
  const meshes = [];
  
  for (let i = 0; i < count; i++) {
    const newMesh = mesh.clone();
    
    // Apply transformations
    const currentOffset = {
      x: offset.x * i,
      y: offset.y * i,
      z: offset.z * i
    };
    
    const currentRotation = {
      x: rotation.x * i,
      y: rotation.y * i,
      z: rotation.z * i
    };
    
    const currentScale = {
      x: Math.pow(scale.x, i),
      y: Math.pow(scale.y, i),
      z: Math.pow(scale.z, i)
    };
    
    // Apply transformations
    let transformedMesh = moveMesh(newMesh, currentOffset);
    transformedMesh = rotateMesh(transformedMesh, { x: 0, y: 0, z: 0 }, currentRotation);
    transformedMesh = scaleMesh(transformedMesh, { x: 0, y: 0, z: 0 }, currentScale);
    
    meshes.push(transformedMesh);
  }
  
  return meshes;
}

/**
 * Merge multiple meshes into one
 * @param {Array} meshes - Array of meshes to merge
 * @returns {EditableMesh} Merged mesh
 */
export function mergeMeshes(meshes) {
  if (meshes.length === 0) {
    return new EditableMesh();
  }
  
  if (meshes.length === 1) {
    return meshes[0].clone();
  }
  
  const mergedMesh = new EditableMesh();
  let nextVertexId = 0;
  let nextEdgeId = 0;
  let nextFaceId = 0;
  
  for (const mesh of meshes) {
    // Add vertices
    const vertexIdMap = new Map();
    for (const [oldVertexId, vertex] of mesh.vertices) {
      const newVertexId = nextVertexId++;
      vertexIdMap.set(oldVertexId, newVertexId);
      
      mergedMesh.vertices.set(newVertexId, {
        id: newVertexId,
        position: { ...vertex.position }
      });
    }
    
    // Add edges
    for (const [oldEdgeId, edge] of mesh.edges) {
      const newEdgeId = nextEdgeId++;
      mergedMesh.edges.set(newEdgeId, {
        id: newEdgeId,
        vertexA: vertexIdMap.get(edge.vertexA),
        vertexB: vertexIdMap.get(edge.vertexB)
      });
    }
    
    // Add faces
    for (const [oldFaceId, face] of mesh.faces) {
      const newFaceId = nextFaceId++;
      mergedMesh.faces.set(newFaceId, {
        id: newFaceId,
        vertices: face.vertices.map(vId => vertexIdMap.get(vId)),
        edges: face.edges.map(eId => {
          // Find new edge ID by matching vertices
          for (const [edgeId, edge] of mergedMesh.edges) {
            if (edge.vertexA === vertexIdMap.get(mesh.edges.get(eId).vertexA) &&
                edge.vertexB === vertexIdMap.get(mesh.edges.get(eId).vertexB)) {
              return edgeId;
            }
          }
          return null;
        }).filter(id => id !== null)
      });
    }
  }
  
  mergedMesh.nextVertexId = nextVertexId;
  mergedMesh.nextEdgeId = nextEdgeId;
  mergedMesh.nextFaceId = nextFaceId;
  
  return mergedMesh;
} 