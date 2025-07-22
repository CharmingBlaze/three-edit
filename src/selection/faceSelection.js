/**
 * Face Selection - Pure functions for face selection operations
 * All functions return selection data, never modify the original mesh
 */

/**
 * Select faces by raycast
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
 * @param {number} maxDistance - Maximum ray distance
 * @returns {Array} Array of face IDs hit by ray
 */
export function selectFacesByRaycast(mesh, ray, maxDistance = Infinity) {
  const selectedFaces = [];
  
  for (const [faceId, face] of mesh.faces) {
    const faceVertices = face.vertices.map(vId => mesh.vertices.get(vId));
    
    if (faceVertices.length < 3) {continue;}
    
    // Calculate face normal
    const v1 = faceVertices[0];
    const v2 = faceVertices[1];
    const v3 = faceVertices[2];
    
    const ux = v2.position.x - v1.position.x;
    const uy = v2.position.y - v1.position.y;
    const uz = v2.position.z - v1.position.z;
    
    const vx = v3.position.x - v1.position.x;
    const vy = v3.position.y - v1.position.y;
    const vz = v3.position.z - v1.position.z;
    
    const normal = {
      x: uy * vz - uz * vy,
      y: uz * vx - ux * vz,
      z: ux * vy - uy * vx
    };
    
    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    if (length === 0) {continue;}
    
    normal.x /= length;
    normal.y /= length;
    normal.z /= length;
    
    // Calculate ray intersection with face plane
    const toV1 = {
      x: v1.position.x - ray.origin.x,
      y: v1.position.y - ray.origin.y,
      z: v1.position.z - ray.origin.z
    };
    
    const denominator = normal.x * ray.direction.x + normal.y * ray.direction.y + normal.z * ray.direction.z;
    
    if (Math.abs(denominator) < 0.0001) {continue;} // Ray parallel to face
    
    const distance = (normal.x * toV1.x + normal.y * toV1.y + normal.z * toV1.z) / denominator;
    
    if (distance < 0 || distance > maxDistance) {continue;}
    
    // Calculate intersection point
    const intersection = {
      x: ray.origin.x + ray.direction.x * distance,
      y: ray.origin.y + ray.direction.y * distance,
      z: ray.origin.z + ray.direction.z * distance
    };
    
    // Check if intersection point is inside face (point-in-polygon test)
    if (isPointInFace(intersection, faceVertices)) {
      selectedFaces.push({
        faceId,
        distance,
        intersection
      });
    }
  }
  
  // Sort by distance
  selectedFaces.sort((a, b) => a.distance - b.distance);
  
  return selectedFaces.map(f => f.faceId);
}

/**
 * Select faces by vertex IDs
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Array} vertexIds - Array of vertex IDs
 * @returns {Array} Array of face IDs containing the vertices
 */
export function selectFacesByVertices(mesh, vertexIds) {
  const selectedFaces = [];
  const vertexSet = new Set(vertexIds);
  
  for (const [faceId, face] of mesh.faces) {
    for (const vertexId of face.vertices) {
      if (vertexSet.has(vertexId)) {
        selectedFaces.push(faceId);
        break;
      }
    }
  }
  
  return selectedFaces;
}

/**
 * Select faces by edge IDs
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Array} edgeIds - Array of edge IDs
 * @returns {Array} Array of face IDs containing the edges
 */
export function selectFacesByEdges(mesh, edgeIds) {
  const selectedFaces = [];
  const edgeSet = new Set(edgeIds);
  
  for (const [faceId, face] of mesh.faces) {
    for (const edgeId of face.edges) {
      if (edgeSet.has(edgeId)) {
        selectedFaces.push(faceId);
        break;
      }
    }
  }
  
  return selectedFaces;
}

/**
 * Select faces by normal direction
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Object} direction - Normal direction {x, y, z}
 * @param {number} threshold - Dot product threshold (0-1)
 * @returns {Array} Array of face IDs with matching normal direction
 */
export function selectFacesByNormal(mesh, direction, threshold = 0.8) {
  const selectedFaces = [];
  
  // Normalize direction
  const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
  const normalizedDirection = {
    x: direction.x / length,
    y: direction.y / length,
    z: direction.z / length
  };
  
  for (const [faceId, face] of mesh.faces) {
    const faceVertices = face.vertices.map(vId => mesh.vertices.get(vId));
    
    if (faceVertices.length >= 3) {
      const v1 = faceVertices[0];
      const v2 = faceVertices[1];
      const v3 = faceVertices[2];
      
      const ux = v2.position.x - v1.position.x;
      const uy = v2.position.y - v1.position.y;
      const uz = v2.position.z - v1.position.z;
      
      const vx = v3.position.x - v1.position.x;
      const vy = v3.position.y - v1.position.y;
      const vz = v3.position.z - v1.position.z;
      
      const normal = {
        x: uy * vz - uz * vy,
        y: uz * vx - ux * vz,
        z: ux * vy - uy * vx
      };
      
      const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
      if (normalLength > 0) {
        normal.x /= normalLength;
        normal.y /= normalLength;
        normal.z /= normalLength;
        
        // Check dot product
        const dot = normal.x * normalizedDirection.x + normal.y * normalizedDirection.y + normal.z * normalizedDirection.z;
        
        if (Math.abs(dot) >= threshold) {
          selectedFaces.push(faceId);
        }
      }
    }
  }
  
  return selectedFaces;
}

/**
 * Select faces by area
 * @param {EditableMesh} mesh - The mesh to query
 * @param {number} minArea - Minimum face area
 * @param {number} maxArea - Maximum face area
 * @returns {Array} Array of face IDs within area range
 */
export function selectFacesByArea(mesh, minArea = 0, maxArea = Infinity) {
  const selectedFaces = [];
  
  for (const [faceId, face] of mesh.faces) {
    const faceVertices = face.vertices.map(vId => mesh.vertices.get(vId));
    
    if (faceVertices.length >= 3) {
      const area = calculateFaceArea(faceVertices);
      
      if (area >= minArea && area <= maxArea) {
        selectedFaces.push(faceId);
      }
    }
  }
  
  return selectedFaces;
}

/**
 * Select faces by number of vertices
 * @param {EditableMesh} mesh - The mesh to query
 * @param {number} minVertices - Minimum number of vertices
 * @param {number} maxVertices - Maximum number of vertices
 * @returns {Array} Array of face IDs with vertex count in range
 */
export function selectFacesByVertexCount(mesh, minVertices = 3, maxVertices = Infinity) {
  const selectedFaces = [];
  
  for (const [faceId, face] of mesh.faces) {
    const vertexCount = face.vertices.length;
    
    if (vertexCount >= minVertices && vertexCount <= maxVertices) {
      selectedFaces.push(faceId);
    }
  }
  
  return selectedFaces;
}

/**
 * Select connected faces
 * @param {EditableMesh} mesh - The mesh to query
 * @param {number} startFaceId - Starting face ID
 * @param {number} maxDepth - Maximum connection depth
 * @returns {Array} Array of connected face IDs
 */
export function selectConnectedFaces(mesh, startFaceId, maxDepth = 1) {
  if (!mesh.faces.has(startFaceId)) {
    return [];
  }
  
  const selectedFaces = new Set([startFaceId]);
  const toProcess = [{ faceId: startFaceId, depth: 0 }];
  
  while (toProcess.length > 0) {
    const { faceId, depth } = toProcess.shift();
    
    if (depth >= maxDepth) {continue;}
    
    const face = mesh.faces.get(faceId);
    
    // Find faces that share edges with this face
    for (const [otherFaceId, otherFace] of mesh.faces) {
      if (otherFaceId === faceId || selectedFaces.has(otherFaceId)) {continue;}
      
      // Check if faces share any edges
      for (const edgeId of face.edges) {
        if (otherFace.edges.includes(edgeId)) {
          selectedFaces.add(otherFaceId);
          toProcess.push({ faceId: otherFaceId, depth: depth + 1 });
          break;
        }
      }
    }
  }
  
  return Array.from(selectedFaces);
}

/**
 * Select faces by material properties (placeholder for future material system)
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Object} materialProps - Material properties to match
 * @returns {Array} Array of face IDs with matching material properties
 */
export function selectFacesByMaterial(mesh, materialProps) {
  // This is a placeholder for when material system is implemented
  // For now, return all faces
  return Array.from(mesh.faces.keys());
}

/**
 * Select faces by UV coordinates (placeholder for future UV system)
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Object} uvBounds - UV bounds {min: {u,v}, max: {u,v}}
 * @returns {Array} Array of face IDs within UV bounds
 */
export function selectFacesByUV(mesh, uvBounds) {
  // This is a placeholder for when UV system is implemented
  // For now, return all faces
  return Array.from(mesh.faces.keys());
}

/**
 * Invert face selection
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Array} selectedFaces - Currently selected face IDs
 * @returns {Array} Array of unselected face IDs
 */
export function invertFaceSelection(mesh, selectedFaces) {
  const allFaces = Array.from(mesh.faces.keys());
  const selectedSet = new Set(selectedFaces);
  
  return allFaces.filter(faceId => !selectedSet.has(faceId));
}

/**
 * Expand face selection by one level
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Array} selectedFaces - Currently selected face IDs
 * @returns {Array} Array of expanded face IDs
 */
export function expandFaceSelection(mesh, selectedFaces) {
  const expandedFaces = new Set(selectedFaces);
  
  for (const faceId of selectedFaces) {
    const connected = selectConnectedFaces(mesh, faceId, 1);
    for (const connectedFaceId of connected) {
      expandedFaces.add(connectedFaceId);
    }
  }
  
  return Array.from(expandedFaces);
}

// Helper functions

function isPointInFace(point, faceVertices) {
  // Simple point-in-polygon test using ray casting
  let inside = false;
  
  for (let i = 0, j = faceVertices.length - 1; i < faceVertices.length; j = i++) {
    const vi = faceVertices[i];
    const vj = faceVertices[j];
    
    if (((vi.position.y > point.y) !== (vj.position.y > point.y)) &&
        (point.x < (vj.position.x - vi.position.x) * (point.y - vi.position.y) / (vj.position.y - vi.position.y) + vi.position.x)) {
      inside = !inside;
    }
  }
  
  return inside;
}

function calculateFaceArea(faceVertices) {
  if (faceVertices.length < 3) {return 0;}
  
  // Calculate area using cross product
  let area = 0;
  
  for (let i = 0; i < faceVertices.length; i++) {
    const v1 = faceVertices[i];
    const v2 = faceVertices[(i + 1) % faceVertices.length];
    const v3 = faceVertices[(i + 2) % faceVertices.length];
    
    const ux = v2.position.x - v1.position.x;
    const uy = v2.position.y - v1.position.y;
    const uz = v2.position.z - v1.position.z;
    
    const vx = v3.position.x - v1.position.x;
    const vy = v3.position.y - v1.position.y;
    const vz = v3.position.z - v1.position.z;
    
    const crossX = uy * vz - uz * vy;
    const crossY = uz * vx - ux * vz;
    const crossZ = ux * vy - uy * vx;
    
    area += Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
  }
  
  return area / 2;
} 