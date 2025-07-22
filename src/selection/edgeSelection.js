/**
 * Edge Selection - Pure functions for edge selection operations
 * All functions return selection data, never modify the original mesh
 */

/**
 * Select edges by raycast
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
 * @param {number} maxDistance - Maximum ray distance
 * @returns {Array} Array of edge IDs hit by ray
 */
export function selectEdgesByRaycast(mesh, ray, maxDistance = Infinity) {
  const selectedEdges = [];
  
  for (const [edgeId, edge] of mesh.edges) {
    const vertexA = mesh.vertices.get(edge.vertexA);
    const vertexB = mesh.vertices.get(edge.vertexB);
    
    // Calculate edge direction
    const edgeDirection = {
      x: vertexB.position.x - vertexA.position.x,
      y: vertexB.position.y - vertexA.position.y,
      z: vertexB.position.z - vertexA.position.z
    };
    
    const edgeLength = Math.sqrt(edgeDirection.x * edgeDirection.x + edgeDirection.y * edgeDirection.y + edgeDirection.z * edgeDirection.z);
    const unitEdgeDirection = {
      x: edgeDirection.x / edgeLength,
      y: edgeDirection.y / edgeLength,
      z: edgeDirection.z / edgeLength
    };
    
    // Calculate distance from ray to edge
    const toVertexA = {
      x: vertexA.position.x - ray.origin.x,
      y: vertexA.position.y - ray.origin.y,
      z: vertexA.position.z - ray.origin.z
    };
    
    // Calculate closest point on edge to ray
    const dot = toVertexA.x * unitEdgeDirection.x + toVertexA.y * unitEdgeDirection.y + toVertexA.z * unitEdgeDirection.z;
    const closestPoint = {
      x: vertexA.position.x + unitEdgeDirection.x * dot,
      y: vertexA.position.y + unitEdgeDirection.y * dot,
      z: vertexA.position.z + unitEdgeDirection.z * dot
    };
    
    // Check if closest point is within edge bounds
    if (dot < 0) {
      Object.assign(closestPoint, vertexA.position);
    } else if (dot > edgeLength) {
      Object.assign(closestPoint, vertexB.position);
    }
    
    // Calculate distance from ray to closest point
    const toClosest = {
      x: closestPoint.x - ray.origin.x,
      y: closestPoint.y - ray.origin.y,
      z: closestPoint.z - ray.origin.z
    };
    
    const rayLength = Math.sqrt(ray.direction.x * ray.direction.x + ray.direction.y * ray.direction.y + ray.direction.z * ray.direction.z);
    const distanceAlongRay = (toClosest.x * ray.direction.x + toClosest.y * ray.direction.y + toClosest.z * ray.direction.z) / rayLength;
    
    if (distanceAlongRay < 0 || distanceAlongRay > maxDistance) {continue;}
    
    // Calculate perpendicular distance
    const projectedPoint = {
      x: ray.origin.x + ray.direction.x * distanceAlongRay,
      y: ray.origin.y + ray.direction.y * distanceAlongRay,
      z: ray.origin.z + ray.direction.z * distanceAlongRay
    };
    
    const perpendicularDistance = Math.sqrt(
      Math.pow(closestPoint.x - projectedPoint.x, 2) +
      Math.pow(closestPoint.y - projectedPoint.y, 2) +
      Math.pow(closestPoint.z - projectedPoint.z, 2)
    );
    
    // Select if within threshold
    if (perpendicularDistance <= 0.1) {
      selectedEdges.push({
        edgeId,
        distance: distanceAlongRay,
        perpendicularDistance
      });
    }
  }
  
  // Sort by distance along ray
  selectedEdges.sort((a, b) => a.distance - b.distance);
  
  return selectedEdges.map(e => e.edgeId);
}

/**
 * Select edges by vertex IDs
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Array} vertexIds - Array of vertex IDs
 * @returns {Array} Array of edge IDs connected to the vertices
 */
export function selectEdgesByVertices(mesh, vertexIds) {
  const selectedEdges = [];
  const vertexSet = new Set(vertexIds);
  
  for (const [edgeId, edge] of mesh.edges) {
    if (vertexSet.has(edge.vertexA) || vertexSet.has(edge.vertexB)) {
      selectedEdges.push(edgeId);
    }
  }
  
  return selectedEdges;
}

/**
 * Select edges by face IDs
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Array} faceIds - Array of face IDs
 * @returns {Array} Array of edge IDs belonging to the faces
 */
export function selectEdgesByFaces(mesh, faceIds) {
  const selectedEdges = new Set();
  
  for (const faceId of faceIds) {
    if (!mesh.faces.has(faceId)) {continue;}
    
    const face = mesh.faces.get(faceId);
    for (const edgeId of face.edges) {
      selectedEdges.add(edgeId);
    }
  }
  
  return Array.from(selectedEdges);
}

/**
 * Select boundary edges (edges with only one connected face)
 * @param {EditableMesh} mesh - The mesh to query
 * @returns {Array} Array of boundary edge IDs
 */
export function selectBoundaryEdges(mesh) {
  const edgeFaceCount = new Map();
  
  // Count faces for each edge
  for (const [faceId, face] of mesh.faces) {
    for (const edgeId of face.edges) {
      edgeFaceCount.set(edgeId, (edgeFaceCount.get(edgeId) || 0) + 1);
    }
  }
  
  // Select edges with only one face
  const boundaryEdges = [];
  for (const [edgeId, count] of edgeFaceCount) {
    if (count === 1) {
      boundaryEdges.push(edgeId);
    }
  }
  
  return boundaryEdges;
}

/**
 * Select edges by length
 * @param {EditableMesh} mesh - The mesh to query
 * @param {number} minLength - Minimum edge length
 * @param {number} maxLength - Maximum edge length
 * @returns {Array} Array of edge IDs within length range
 */
export function selectEdgesByLength(mesh, minLength = 0, maxLength = Infinity) {
  const selectedEdges = [];
  
  for (const [edgeId, edge] of mesh.edges) {
    const vertexA = mesh.vertices.get(edge.vertexA);
    const vertexB = mesh.vertices.get(edge.vertexB);
    
    const dx = vertexB.position.x - vertexA.position.x;
    const dy = vertexB.position.y - vertexA.position.y;
    const dz = vertexB.position.z - vertexA.position.z;
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (length >= minLength && length <= maxLength) {
      selectedEdges.push(edgeId);
    }
  }
  
  return selectedEdges;
}

/**
 * Select edges by angle between connected faces
 * @param {EditableMesh} mesh - The mesh to query
 * @param {number} minAngle - Minimum angle in radians
 * @param {number} maxAngle - Maximum angle in radians
 * @returns {Array} Array of edge IDs with angle within range
 */
export function selectEdgesByAngle(mesh, minAngle = 0, maxAngle = Math.PI) {
  const selectedEdges = [];
  
  for (const [edgeId, edge] of mesh.edges) {
    // Find faces connected to this edge
    const connectedFaces = [];
    for (const [faceId, face] of mesh.faces) {
      if (face.edges.includes(edgeId)) {
        connectedFaces.push(face);
      }
    }
    
    if (connectedFaces.length >= 2) {
      // Calculate face normals
      const normals = [];
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
          
          const normal = {
            x: uy * vz - uz * vy,
            y: uz * vx - ux * vz,
            z: ux * vy - uy * vx
          };
          
          const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
          if (length > 0) {
            normal.x /= length;
            normal.y /= length;
            normal.z /= length;
            normals.push(normal);
          }
        }
      }
      
      if (normals.length >= 2) {
        // Calculate angle between normals
        const dot = normals[0].x * normals[1].x + normals[0].y * normals[1].y + normals[0].z * normals[1].z;
        const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
        
        if (angle >= minAngle && angle <= maxAngle) {
          selectedEdges.push(edgeId);
        }
      }
    }
  }
  
  return selectedEdges;
}

/**
 * Select edges by loop (connected sequence)
 * @param {EditableMesh} mesh - The mesh to query
 * @param {number} startEdgeId - Starting edge ID
 * @param {number} maxLength - Maximum loop length
 * @returns {Array} Array of edge IDs in the loop
 */
export function selectEdgeLoop(mesh, startEdgeId, maxLength = 100) {
  if (!mesh.edges.has(startEdgeId)) {
    return [];
  }
  
  const selectedEdges = new Set([startEdgeId]);
  const toProcess = [{ edgeId: startEdgeId, direction: 0 }];
  
  while (toProcess.length > 0 && selectedEdges.size < maxLength) {
    const { edgeId, direction } = toProcess.shift();
    const edge = mesh.edges.get(edgeId);
    
    // Find faces connected to this edge
    const connectedFaces = [];
    for (const [faceId, face] of mesh.faces) {
      if (face.edges.includes(edgeId)) {
        connectedFaces.push(face);
      }
    }
    
    // Find next edge in loop
    for (const face of connectedFaces) {
      const edgeIndex = face.edges.indexOf(edgeId);
      if (edgeIndex !== -1) {
        const nextEdgeId = face.edges[(edgeIndex + 1) % face.edges.length];
        const prevEdgeId = face.edges[(edgeIndex - 1 + face.edges.length) % face.edges.length];
        
        const nextEdge = direction === 0 ? nextEdgeId : prevEdgeId;
        
        if (!selectedEdges.has(nextEdge)) {
          selectedEdges.add(nextEdge);
          toProcess.push({ edgeId: nextEdge, direction });
        }
      }
    }
  }
  
  return Array.from(selectedEdges);
}

/**
 * Select edges by ring (parallel sequence)
 * @param {EditableMesh} mesh - The mesh to query
 * @param {number} startEdgeId - Starting edge ID
 * @param {number} maxLength - Maximum ring length
 * @returns {Array} Array of edge IDs in the ring
 */
export function selectEdgeRing(mesh, startEdgeId, maxLength = 100) {
  if (!mesh.edges.has(startEdgeId)) {
    return [];
  }
  
  const selectedEdges = new Set([startEdgeId]);
  const toProcess = [{ edgeId: startEdgeId }];
  
  while (toProcess.length > 0 && selectedEdges.size < maxLength) {
    const { edgeId } = toProcess.shift();
    const edge = mesh.edges.get(edgeId);
    
    // Find faces connected to this edge
    for (const [faceId, face] of mesh.faces) {
      if (face.edges.includes(edgeId)) {
        // Find opposite edge in face
        const edgeIndex = face.edges.indexOf(edgeId);
        const oppositeEdgeId = face.edges[(edgeIndex + 2) % face.edges.length];
        
        if (!selectedEdges.has(oppositeEdgeId)) {
          selectedEdges.add(oppositeEdgeId);
          toProcess.push({ edgeId: oppositeEdgeId });
        }
      }
    }
  }
  
  return Array.from(selectedEdges);
}

/**
 * Invert edge selection
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Array} selectedEdges - Currently selected edge IDs
 * @returns {Array} Array of unselected edge IDs
 */
export function invertEdgeSelection(mesh, selectedEdges) {
  const allEdges = Array.from(mesh.edges.keys());
  const selectedSet = new Set(selectedEdges);
  
  return allEdges.filter(edgeId => !selectedSet.has(edgeId));
}

/**
 * Expand edge selection by one level
 * @param {EditableMesh} mesh - The mesh to query
 * @param {Array} selectedEdges - Currently selected edge IDs
 * @returns {Array} Array of expanded edge IDs
 */
export function expandEdgeSelection(mesh, selectedEdges) {
  const expandedEdges = new Set(selectedEdges);
  
  for (const edgeId of selectedEdges) {
    const edge = mesh.edges.get(edgeId);
    if (!edge) {continue;}
    
    // Find edges connected to the same vertices
    for (const [otherEdgeId, otherEdge] of mesh.edges) {
      if (otherEdgeId === edgeId) {continue;}
      
      if (otherEdge.vertexA === edge.vertexA || otherEdge.vertexA === edge.vertexB ||
          otherEdge.vertexB === edge.vertexA || otherEdge.vertexB === edge.vertexB) {
        expandedEdges.add(otherEdgeId);
      }
    }
  }
  
  return Array.from(expandedEdges);
} 