/**
 * Vertex Selection - Pure functions for vertex selection operations
 * All functions return selection data, never modify the original mesh
 */

/**
 * Select vertices by raycast
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
 * @param {number} maxDistance - Maximum ray distance
 * @returns {Array} Array of vertex IDs hit by ray
 */
export function selectVerticesByRaycast(mesh, ray, maxDistance = Infinity) {
  const selectedVertices = [];
  
  for (const [vertexId, vertex] of mesh.vertices) {
    const toVertex = {
      x: vertex.position.x - ray.origin.x,
      y: vertex.position.y - ray.origin.y,
      z: vertex.position.z - ray.origin.z
    };
    
    // Calculate distance along ray
    const dot = toVertex.x * ray.direction.x + toVertex.y * ray.direction.y + toVertex.z * ray.direction.z;
    const rayLength = Math.sqrt(ray.direction.x * ray.direction.x + ray.direction.y * ray.direction.y + ray.direction.z * ray.direction.z);
    
    if (rayLength === 0) {continue;}
    
    const distanceAlongRay = dot / rayLength;
    
    if (distanceAlongRay < 0 || distanceAlongRay > maxDistance) {continue;}
    
    // Calculate perpendicular distance to ray
    const projectedPoint = {
      x: ray.origin.x + ray.direction.x * distanceAlongRay,
      y: ray.origin.y + ray.direction.y * distanceAlongRay,
      z: ray.origin.z + ray.direction.z * distanceAlongRay
    };
    
    const perpendicularDistance = Math.sqrt(
      Math.pow(vertex.position.x - projectedPoint.x, 2) +
      Math.pow(vertex.position.y - projectedPoint.y, 2) +
      Math.pow(vertex.position.z - projectedPoint.z, 2)
    );
    
    // Select if within threshold
    if (perpendicularDistance <= 0.1) {
      selectedVertices.push({
        vertexId,
        distance: distanceAlongRay,
        perpendicularDistance
      });
    }
  }
  
  // Sort by distance along ray
  selectedVertices.sort((a, b) => a.distance - b.distance);
  
  return selectedVertices.map(v => v.vertexId);
}

/**
 * Select vertices within a box
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Object} box - Box bounds {min: {x,y,z}, max: {x,y,z}}
 * @returns {Array} Array of vertex IDs within box
 */
export function selectVerticesByBox(mesh, box) {
  const selectedVertices = [];
  
  for (const [vertexId, vertex] of mesh.vertices) {
    const { x, y, z } = vertex.position;
    
    if (x >= box.min.x && x <= box.max.x &&
        y >= box.min.y && y <= box.max.y &&
        z >= box.min.z && z <= box.max.z) {
      selectedVertices.push(vertexId);
    }
  }
  
  return selectedVertices;
}

/**
 * Select vertices within a sphere
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Object} sphere - Sphere {center: {x,y,z}, radius: number}
 * @returns {Array} Array of vertex IDs within sphere
 */
export function selectVerticesBySphere(mesh, sphere) {
  const selectedVertices = [];
  
  for (const [vertexId, vertex] of mesh.vertices) {
    const dx = vertex.position.x - sphere.center.x;
    const dy = vertex.position.y - sphere.center.y;
    const dz = vertex.position.z - sphere.center.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance <= sphere.radius) {
      selectedVertices.push(vertexId);
    }
  }
  
  return selectedVertices;
}

/**
 * Select vertices by distance from a point
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Object} point - Center point {x, y, z}
 * @param {number} maxDistance - Maximum distance
 * @returns {Array} Array of vertex IDs within distance
 */
export function selectVerticesByDistance(mesh, point, maxDistance) {
  const selectedVertices = [];
  
  for (const [vertexId, vertex] of mesh.vertices) {
    const dx = vertex.position.x - point.x;
    const dy = vertex.position.y - point.y;
    const dz = vertex.position.z - point.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance <= maxDistance) {
      selectedVertices.push(vertexId);
    }
  }
  
  return selectedVertices;
}

/**
 * Select vertices connected to a given vertex
 * @param {EditableMesh} mesh - The mesh to query
 * @param {number} vertexId - Starting vertex ID
 * @param {number} maxDepth - Maximum connection depth
 * @returns {Array} Array of connected vertex IDs
 */
export function selectConnectedVertices(mesh, vertexId, maxDepth = 1) {
  if (!mesh.vertices.has(vertexId)) {
    return [];
  }
  
  const selectedVertices = new Set([vertexId]);
  const toProcess = [{ vertexId, depth: 0 }];
  
  while (toProcess.length > 0) {
    const { vertexId: currentVertexId, depth } = toProcess.shift();
    
    if (depth >= maxDepth) {continue;}
    
    // Find edges connected to this vertex
    for (const [edgeId, edge] of mesh.edges) {
      let connectedVertexId = null;
      
      if (edge.vertexA === currentVertexId) {
        connectedVertexId = edge.vertexB;
      } else if (edge.vertexB === currentVertexId) {
        connectedVertexId = edge.vertexA;
      }
      
      if (connectedVertexId && !selectedVertices.has(connectedVertexId)) {
        selectedVertices.add(connectedVertexId);
        toProcess.push({ vertexId: connectedVertexId, depth: depth + 1 });
      }
    }
  }
  
  return Array.from(selectedVertices);
}

/**
 * Select vertices by face membership
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Array} faceIds - Array of face IDs
 * @returns {Array} Array of vertex IDs belonging to the faces
 */
export function selectVerticesByFaces(mesh, faceIds) {
  const selectedVertices = new Set();
  
  for (const faceId of faceIds) {
    if (!mesh.faces.has(faceId)) {continue;}
    
    const face = mesh.faces.get(faceId);
    for (const vertexId of face.vertices) {
      selectedVertices.add(vertexId);
    }
  }
  
  return Array.from(selectedVertices);
}

/**
 * Select vertices by edge membership
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Array} edgeIds - Array of edge IDs
 * @returns {Array} Array of vertex IDs belonging to the edges
 */
export function selectVerticesByEdges(mesh, edgeIds) {
  const selectedVertices = new Set();
  
  for (const edgeId of edgeIds) {
    if (!mesh.edges.has(edgeId)) {continue;}
    
    const edge = mesh.edges.get(edgeId);
    selectedVertices.add(edge.vertexA);
    selectedVertices.add(edge.vertexB);
  }
  
  return Array.from(selectedVertices);
}

/**
 * Select vertices by boundary (vertices with only one connected face)
 * @param {EditableMesh} mesh - The mesh to query
 * @returns {Array} Array of boundary vertex IDs
 */
export function selectBoundaryVertices(mesh) {
  const selectedVertices = [];
  
  for (const [vertexId, vertex] of mesh.vertices) {
    // Count faces that contain this vertex
    let faceCount = 0;
    for (const [faceId, face] of mesh.faces) {
      if (face.vertices.includes(vertexId)) {
        faceCount++;
      }
    }
    
    // Boundary vertices have fewer connected faces
    if (faceCount <= 1) {
      selectedVertices.push(vertexId);
    }
  }
  
  return selectedVertices;
}

/**
 * Select vertices by normal direction
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Object} direction - Normal direction {x, y, z}
 * @param {number} threshold - Dot product threshold (0-1)
 * @returns {Array} Array of vertex IDs with matching normal direction
 */
export function selectVerticesByNormal(mesh, direction, threshold = 0.8) {
  const selectedVertices = [];
  
  // Normalize direction
  const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
  const normalizedDirection = {
    x: direction.x / length,
    y: direction.y / length,
    z: direction.z / length
  };
  
  for (const [vertexId, vertex] of mesh.vertices) {
    // Calculate approximate vertex normal by averaging connected face normals
    const connectedFaces = [];
    for (const [faceId, face] of mesh.faces) {
      if (face.vertices.includes(vertexId)) {
        connectedFaces.push(face);
      }
    }
    
    if (connectedFaces.length > 0) {
      const avgNormal = { x: 0, y: 0, z: 0 };
      
      for (const face of connectedFaces) {
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
          
          const nx = uy * vz - uz * vy;
          const ny = uz * vx - ux * vz;
          const nz = ux * vy - uy * vx;
          
          const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
          if (length > 0) {
            avgNormal.x += nx / length;
            avgNormal.y += ny / length;
            avgNormal.z += nz / length;
          }
        }
      }
      
      // Normalize average normal
      const avgLength = Math.sqrt(avgNormal.x * avgNormal.x + avgNormal.y * avgNormal.y + avgNormal.z * avgNormal.z);
      if (avgLength > 0) {
        avgNormal.x /= avgLength;
        avgNormal.y /= avgLength;
        avgNormal.z /= avgLength;
        
        // Check dot product
        const dot = avgNormal.x * normalizedDirection.x + avgNormal.y * normalizedDirection.y + avgNormal.z * normalizedDirection.z;
        
        if (Math.abs(dot) >= threshold) {
          selectedVertices.push(vertexId);
        }
      }
    }
  }
  
  return selectedVertices;
}

/**
 * Invert vertex selection
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Array} selectedVertices - Currently selected vertex IDs
 * @returns {Array} Array of unselected vertex IDs
 */
export function invertVertexSelection(mesh, selectedVertices) {
  const allVertices = Array.from(mesh.vertices.keys());
  const selectedSet = new Set(selectedVertices);
  
  return allVertices.filter(vertexId => !selectedSet.has(vertexId));
}

/**
 * Expand vertex selection by one level
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Array} selectedVertices - Currently selected vertex IDs
 * @returns {Array} Array of expanded vertex IDs
 */
export function expandVertexSelection(mesh, selectedVertices) {
  const expandedVertices = new Set(selectedVertices);
  
  for (const vertexId of selectedVertices) {
    const connected = selectConnectedVertices(mesh, vertexId, 1);
    for (const connectedVertexId of connected) {
      expandedVertices.add(connectedVertexId);
    }
  }
  
  return Array.from(expandedVertices);
}

/**
 * Contract vertex selection by removing boundary vertices
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Array} selectedVertices - Currently selected vertex IDs
 * @returns {Array} Array of contracted vertex IDs
 */
export function contractVertexSelection(mesh, selectedVertices) {
  const contractedVertices = [];
  
  for (const vertexId of selectedVertices) {
    // Count selected neighbors
    let selectedNeighbors = 0;
    let totalNeighbors = 0;
    
    for (const [edgeId, edge] of mesh.edges) {
      if (edge.vertexA === vertexId) {
        totalNeighbors++;
        if (selectedVertices.includes(edge.vertexB)) {
          selectedNeighbors++;
        }
      } else if (edge.vertexB === vertexId) {
        totalNeighbors++;
        if (selectedVertices.includes(edge.vertexA)) {
          selectedNeighbors++;
        }
      }
    }
    
    // Keep vertex if it has enough selected neighbors
    if (totalNeighbors > 0 && selectedNeighbors / totalNeighbors >= 0.5) {
      contractedVertices.push(vertexId);
    }
  }
  
  return contractedVertices;
} 