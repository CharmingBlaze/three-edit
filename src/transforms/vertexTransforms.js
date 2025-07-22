/**
 * Vertex Transforms - Pure functions for vertex transformation operations
 * All functions return new EditableMesh instances, never modify the original
 */

import { EditableMesh } from '../EditableMesh.js';

/**
 * Move vertices by a translation vector
 * @param {EditableMesh} mesh - The mesh to transform
 * @param {Array} vertexIds - Array of vertex IDs to move
 * @param {Object} translation - Translation vector {x, y, z}
 * @returns {EditableMesh} New mesh with moved vertices
 */
export function moveVertices(mesh, vertexIds, translation) {
  const newMesh = mesh.clone();
  
  for (const vertexId of vertexIds) {
    if (!newMesh.vertices.has(vertexId)) {continue;}
    
    const vertex = newMesh.vertices.get(vertexId);
    vertex.position.x += translation.x;
    vertex.position.y += translation.y;
    vertex.position.z += translation.z;
  }
  
  return newMesh;
}

/**
 * Rotate vertices around a center point
 * @param {EditableMesh} mesh - The mesh to transform
 * @param {Array} vertexIds - Array of vertex IDs to rotate
 * @param {Object} center - Rotation center point {x, y, z}
 * @param {Object} rotation - Rotation in radians {x, y, z}
 * @returns {EditableMesh} New mesh with rotated vertices
 */
export function rotateVertices(mesh, vertexIds, center, rotation) {
  const newMesh = mesh.clone();
  
  // Create rotation matrices
  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);
  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);
  const cosZ = Math.cos(rotation.z);
  const sinZ = Math.sin(rotation.z);
  
  for (const vertexId of vertexIds) {
    if (!newMesh.vertices.has(vertexId)) {continue;}
    
    const vertex = newMesh.vertices.get(vertexId);
    
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
 * Scale vertices from a center point
 * @param {EditableMesh} mesh - The mesh to transform
 * @param {Array} vertexIds - Array of vertex IDs to scale
 * @param {Object} center - Scaling center point {x, y, z}
 * @param {Object} scale - Scale factors {x, y, z}
 * @returns {EditableMesh} New mesh with scaled vertices
 */
export function scaleVertices(mesh, vertexIds, center, scale) {
  const newMesh = mesh.clone();
  
  for (const vertexId of vertexIds) {
    if (!newMesh.vertices.has(vertexId)) {continue;}
    
    const vertex = newMesh.vertices.get(vertexId);
    
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
 * Transform vertices using a 4x4 transformation matrix
 * @param {EditableMesh} mesh - The mesh to transform
 * @param {Array} vertexIds - Array of vertex IDs to transform
 * @param {Array} matrix - 4x4 transformation matrix as 16-element array
 * @returns {EditableMesh} New mesh with transformed vertices
 */
export function transformVertices(mesh, vertexIds, matrix) {
  const newMesh = mesh.clone();
  
  for (const vertexId of vertexIds) {
    if (!newMesh.vertices.has(vertexId)) {continue;}
    
    const vertex = newMesh.vertices.get(vertexId);
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
 * Mirror vertices across a plane
 * @param {EditableMesh} mesh - The mesh to transform
 * @param {Array} vertexIds - Array of vertex IDs to mirror
 * @param {Object} plane - Mirror plane {normal: {x,y,z}, point: {x,y,z}}
 * @returns {EditableMesh} New mesh with mirrored vertices
 */
export function mirrorVertices(mesh, vertexIds, plane) {
  const newMesh = mesh.clone();
  const { normal, point } = plane;
  
  // Normalize plane normal
  const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
  const unitNormal = {
    x: normal.x / length,
    y: normal.y / length,
    z: normal.z / length
  };
  
  for (const vertexId of vertexIds) {
    if (!newMesh.vertices.has(vertexId)) {continue;}
    
    const vertex = newMesh.vertices.get(vertexId);
    
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
 * Bend vertices along a curve
 * @param {EditableMesh} mesh - The mesh to transform
 * @param {Array} vertexIds - Array of vertex IDs to bend
 * @param {Object} bendAxis - Bend axis {x, y, z}
 * @param {number} bendAngle - Bend angle in radians
 * @param {Object} bendCenter - Bend center point {x, y, z}
 * @returns {EditableMesh} New mesh with bent vertices
 */
export function bendVertices(mesh, vertexIds, bendAxis, bendAngle, bendCenter) {
  const newMesh = mesh.clone();
  
  // Normalize bend axis
  const length = Math.sqrt(bendAxis.x * bendAxis.x + bendAxis.y * bendAxis.y + bendAxis.z * bendAxis.z);
  const unitAxis = {
    x: bendAxis.x / length,
    y: bendAxis.y / length,
    z: bendAxis.z / length
  };
  
  for (const vertexId of vertexIds) {
    if (!newMesh.vertices.has(vertexId)) {continue;}
    
    const vertex = newMesh.vertices.get(vertexId);
    
    // Calculate distance along bend axis
    const toVertex = {
      x: vertex.position.x - bendCenter.x,
      y: vertex.position.y - bendCenter.y,
      z: vertex.position.z - bendCenter.z
    };
    
    const distanceAlongAxis = toVertex.x * unitAxis.x + toVertex.y * unitAxis.y + toVertex.z * unitAxis.z;
    
    // Calculate bend radius and angle
    const bendRadius = Math.abs(distanceAlongAxis);
    const localBendAngle = (distanceAlongAxis > 0 ? 1 : -1) * bendAngle;
    
    // Calculate perpendicular distance from axis
    const projectedPoint = {
      x: bendCenter.x + unitAxis.x * distanceAlongAxis,
      y: bendCenter.y + unitAxis.y * distanceAlongAxis,
      z: bendCenter.z + unitAxis.z * distanceAlongAxis
    };
    
    const perpendicular = {
      x: vertex.position.x - projectedPoint.x,
      y: vertex.position.y - projectedPoint.y,
      z: vertex.position.z - projectedPoint.z
    };
    
    // Apply bend transformation
    const cos = Math.cos(localBendAngle);
    const sin = Math.sin(localBendAngle);
    
    // Find perpendicular direction to bend axis
    const perpLength = Math.sqrt(perpendicular.x * perpendicular.x + perpendicular.y * perpendicular.y + perpendicular.z * perpendicular.z);
    
    if (perpLength > 0) {
      const unitPerp = {
        x: perpendicular.x / perpLength,
        y: perpendicular.y / perpLength,
        z: perpendicular.z / perpLength
      };
      
      // Calculate new position
      const newPerp = {
        x: unitPerp.x * cos - unitPerp.y * sin,
        y: unitPerp.x * sin + unitPerp.y * cos,
        z: unitPerp.z
      };
      
      vertex.position.x = projectedPoint.x + newPerp.x * perpLength;
      vertex.position.y = projectedPoint.y + newPerp.y * perpLength;
      vertex.position.z = projectedPoint.z + newPerp.z * perpLength;
    }
  }
  
  return newMesh;
}

/**
 * Twist vertices around an axis
 * @param {EditableMesh} mesh - The mesh to transform
 * @param {Array} vertexIds - Array of vertex IDs to twist
 * @param {Object} twistAxis - Twist axis {x, y, z}
 * @param {Object} twistCenter - Twist center point {x, y, z}
 * @param {number} twistAngle - Total twist angle in radians
 * @param {number} twistHeight - Height over which twist is applied
 * @returns {EditableMesh} New mesh with twisted vertices
 */
export function twistVertices(mesh, vertexIds, twistAxis, twistCenter, twistAngle, twistHeight) {
  const newMesh = mesh.clone();
  
  // Normalize twist axis
  const length = Math.sqrt(twistAxis.x * twistAxis.x + twistAxis.y * twistAxis.y + twistAxis.z * twistAxis.z);
  const unitAxis = {
    x: twistAxis.x / length,
    y: twistAxis.y / length,
    z: twistAxis.z / length
  };
  
  for (const vertexId of vertexIds) {
    if (!newMesh.vertices.has(vertexId)) {continue;}
    
    const vertex = newMesh.vertices.get(vertexId);
    
    // Calculate distance along twist axis
    const toVertex = {
      x: vertex.position.x - twistCenter.x,
      y: vertex.position.y - twistCenter.y,
      z: vertex.position.z - twistCenter.z
    };
    
    const distanceAlongAxis = toVertex.x * unitAxis.x + toVertex.y * unitAxis.y + toVertex.z * unitAxis.z;
    
    // Calculate local twist angle based on height
    const localTwistAngle = (distanceAlongAxis / twistHeight) * twistAngle;
    
    // Calculate perpendicular distance from axis
    const projectedPoint = {
      x: twistCenter.x + unitAxis.x * distanceAlongAxis,
      y: twistCenter.y + unitAxis.y * distanceAlongAxis,
      z: twistCenter.z + unitAxis.z * distanceAlongAxis
    };
    
    const perpendicular = {
      x: vertex.position.x - projectedPoint.x,
      y: vertex.position.y - projectedPoint.y,
      z: vertex.position.z - projectedPoint.z
    };
    
    // Apply twist rotation
    const cos = Math.cos(localTwistAngle);
    const sin = Math.sin(localTwistAngle);
    
    const perpLength = Math.sqrt(perpendicular.x * perpendicular.x + perpendicular.y * perpendicular.y + perpendicular.z * perpendicular.z);
    
    if (perpLength > 0) {
      const unitPerp = {
        x: perpendicular.x / perpLength,
        y: perpendicular.y / perpLength,
        z: perpendicular.z / perpLength
      };
      
      // Calculate new position
      const newPerp = {
        x: unitPerp.x * cos - unitPerp.y * sin,
        y: unitPerp.x * sin + unitPerp.y * cos,
        z: unitPerp.z
      };
      
      vertex.position.x = projectedPoint.x + newPerp.x * perpLength;
      vertex.position.y = projectedPoint.y + newPerp.y * perpLength;
      vertex.position.z = projectedPoint.z + newPerp.z * perpLength;
    }
  }
  
  return newMesh;
}

/**
 * Taper vertices along an axis
 * @param {EditableMesh} mesh - The mesh to transform
 * @param {Array} vertexIds - Array of vertex IDs to taper
 * @param {Object} taperAxis - Taper axis {x, y, z}
 * @param {Object} taperCenter - Taper center point {x, y, z}
 * @param {Object} taperFactors - Taper factors {x, y, z}
 * @param {number} taperHeight - Height over which taper is applied
 * @returns {EditableMesh} New mesh with tapered vertices
 */
export function taperVertices(mesh, vertexIds, taperAxis, taperCenter, taperFactors, taperHeight) {
  const newMesh = mesh.clone();
  
  // Normalize taper axis
  const length = Math.sqrt(taperAxis.x * taperAxis.x + taperAxis.y * taperAxis.y + taperAxis.z * taperAxis.z);
  const unitAxis = {
    x: taperAxis.x / length,
    y: taperAxis.y / length,
    z: taperAxis.z / length
  };
  
  for (const vertexId of vertexIds) {
    if (!newMesh.vertices.has(vertexId)) {continue;}
    
    const vertex = newMesh.vertices.get(vertexId);
    
    // Calculate distance along taper axis
    const toVertex = {
      x: vertex.position.x - taperCenter.x,
      y: vertex.position.y - taperCenter.y,
      z: vertex.position.z - taperCenter.z
    };
    
    const distanceAlongAxis = toVertex.x * unitAxis.x + toVertex.y * unitAxis.y + toVertex.z * unitAxis.z;
    
    // Calculate taper factor based on height
    const taperFactor = distanceAlongAxis / taperHeight;
    
    // Calculate perpendicular distance from axis
    const projectedPoint = {
      x: taperCenter.x + unitAxis.x * distanceAlongAxis,
      y: taperCenter.y + unitAxis.y * distanceAlongAxis,
      z: taperCenter.z + unitAxis.z * distanceAlongAxis
    };
    
    const perpendicular = {
      x: vertex.position.x - projectedPoint.x,
      y: vertex.position.y - projectedPoint.y,
      z: vertex.position.z - projectedPoint.z
    };
    
    // Apply taper scaling
    const scaleX = 1 + (taperFactors.x - 1) * taperFactor;
    const scaleY = 1 + (taperFactors.y - 1) * taperFactor;
    const scaleZ = 1 + (taperFactors.z - 1) * taperFactor;
    
    vertex.position.x = projectedPoint.x + perpendicular.x * scaleX;
    vertex.position.y = projectedPoint.y + perpendicular.y * scaleY;
    vertex.position.z = projectedPoint.z + perpendicular.z * scaleZ;
  }
  
  return newMesh;
} 