/**
 * @fileoverview Edge Raycaster
 * Raycasting operations for edge selection
 */

/**
 * Select mesh edges by raycasting
 * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
 * @param {Map<string, Edge>} edges - Map of edge ID to Edge objects
 * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
 * @param {Object} options - Selection options
 * @param {number} [options.threshold=0.1] - Selection threshold distance
 * @param {boolean} [options.selectNearest=true] - Select nearest edge only
 * @returns {Array<string>} Selected edge IDs
 */
export function selectEdgesByRay(ray, edges, vertices, options = {}) {
  const {
    threshold = 0.1,
    selectNearest = true
  } = options;

  const selectedEdges = [];
  let nearestDistance = Infinity;
  let nearestEdge = null;

  for (const [id, edge] of edges) {
    const distance = raycastEdge(ray, edge, vertices);
    
    if (distance !== null && distance <= threshold) {
      if (selectNearest) {
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestEdge = id;
        }
      } else {
        selectedEdges.push(id);
      }
    }
  }

  if (selectNearest && nearestEdge) {
    selectedEdges.push(nearestEdge);
  }

  return selectedEdges;
}

/**
 * Raycast against an edge
 * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
 * @param {Edge} edge - Edge object
 * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
 * @returns {number|null} Distance to edge or null if no intersection
 */
export function raycastEdge(ray, edge, vertices) {
  const v1 = vertices.get(edge.vertexIds[0]);
  const v2 = vertices.get(edge.vertexIds[1]);
  
  if (!v1 || !v2) {
    return null;
  }

  const origin = ray.origin;
  const direction = ray.direction;
  
  // Edge vector
  const edgeVector = {
    x: v2.x - v1.x,
    y: v2.y - v1.y,
    z: v2.z - v1.z
  };
  
  // Vector from ray origin to edge start
  const toEdge = {
    x: v1.x - origin.x,
    y: v1.y - origin.y,
    z: v1.z - origin.z
  };
  
  // Cross products
  const cross1 = cross(direction, edgeVector);
  const cross2 = cross(toEdge, edgeVector);
  const cross3 = cross(direction, toEdge);
  
  const denominator = dot(cross1, cross1);
  
  if (Math.abs(denominator) < 1e-6) {
    return null; // Ray is parallel to edge
  }
  
  // Calculate parameters
  const t = dot(cross2, cross1) / denominator;
  const s = dot(cross3, cross1) / denominator;
  
  // Check if intersection is within edge bounds
  if (s < 0 || s > 1) {
    return null;
  }
  
  // Calculate closest point on edge
  const closestPoint = {
    x: v1.x + s * edgeVector.x,
    y: v1.y + s * edgeVector.y,
    z: v1.z + s * edgeVector.z
  };
  
  // Calculate distance from ray origin to closest point
  const rayPoint = {
    x: origin.x + t * direction.x,
    y: origin.y + t * direction.y,
    z: origin.z + t * direction.z
  };
  
  return distance(closestPoint, rayPoint);
}

/**
 * Select edges within a sphere
 * @param {Object} sphere - Sphere object {center: {x,y,z}, radius: number}
 * @param {Map<string, Edge>} edges - Map of edge ID to Edge objects
 * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
 * @param {Object} options - Selection options
 * @param {boolean} [options.selectNearest=false] - Select nearest edge only
 * @returns {Array<string>} Selected edge IDs
 */
export function selectEdgesBySphere(sphere, edges, vertices, options = {}) {
  const { selectNearest = false } = options;
  const selectedEdges = [];
  let nearestDistance = Infinity;
  let nearestEdge = null;

  for (const [id, edge] of edges) {
    const distance = distanceToSphere(edge, vertices, sphere);
    
    if (distance <= sphere.radius) {
      if (selectNearest) {
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestEdge = id;
        }
      } else {
        selectedEdges.push(id);
      }
    }
  }

  if (selectNearest && nearestEdge) {
    selectedEdges.push(nearestEdge);
  }

  return selectedEdges;
}

/**
 * Calculate distance from edge to sphere center
 * @param {Edge} edge - Edge object
 * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
 * @param {Object} sphere - Sphere object {center: {x,y,z}, radius: number}
 * @returns {number} Distance to sphere center
 */
export function distanceToSphere(edge, vertices, sphere) {
  const v1 = vertices.get(edge.vertexIds[0]);
  const v2 = vertices.get(edge.vertexIds[1]);
  
  if (!v1 || !v2) {
    return Infinity;
  }

  // Calculate closest point on edge to sphere center
  const edgeVector = {
    x: v2.x - v1.x,
    y: v2.y - v1.y,
    z: v2.z - v1.z
  };
  
  const toCenter = {
    x: sphere.center.x - v1.x,
    y: sphere.center.y - v1.y,
    z: sphere.center.z - v1.z
  };
  
  const edgeLength = dot(edgeVector, edgeVector);
  if (edgeLength === 0) {
    return distance(v1, sphere.center);
  }
  
  const t = Math.max(0, Math.min(1, dot(toCenter, edgeVector) / edgeLength));
  
  const closestPoint = {
    x: v1.x + t * edgeVector.x,
    y: v1.y + t * edgeVector.y,
    z: v1.z + t * edgeVector.z
  };
  
  return distance(closestPoint, sphere.center);
}

/**
 * Select edges within a box
 * @param {Object} box - Box object {min: {x,y,z}, max: {x,y,z}}
 * @param {Map<string, Edge>} edges - Map of edge ID to Edge objects
 * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
 * @returns {Array<string>} Selected edge IDs
 */
export function selectEdgesByBox(box, edges, vertices) {
  const selectedEdges = [];

  for (const [id, edge] of edges) {
    if (edgeInBox(edge, vertices, box)) {
      selectedEdges.push(id);
    }
  }

  return selectedEdges;
}

/**
 * Check if edge intersects with a box
 * @param {Edge} edge - Edge object
 * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
 * @param {Object} box - Box object {min: {x,y,z}, max: {x,y,z}}
 * @returns {boolean} True if edge intersects with box
 */
export function edgeInBox(edge, vertices, box) {
  const v1 = vertices.get(edge.vertexIds[0]);
  const v2 = vertices.get(edge.vertexIds[1]);
  
  if (!v1 || !v2) {
    return false;
  }

  // Check if both vertices are inside box
  if (vertexInBox(v1, box) && vertexInBox(v2, box)) {
    return true;
  }

  // Check if edge intersects box faces
  // This is a simplified check - for more accurate results, implement full line-box intersection
  const edgeVector = {
    x: v2.x - v1.x,
    y: v2.y - v1.y,
    z: v2.z - v1.z
  };

  // Check intersection with each face
  const faces = [
    { normal: { x: 1, y: 0, z: 0 }, point: { x: box.max.x, y: 0, z: 0 } },
    { normal: { x: -1, y: 0, z: 0 }, point: { x: box.min.x, y: 0, z: 0 } },
    { normal: { x: 0, y: 1, z: 0 }, point: { x: 0, y: box.max.y, z: 0 } },
    { normal: { x: 0, y: -1, z: 0 }, point: { x: 0, y: box.min.y, z: 0 } },
    { normal: { x: 0, y: 0, z: 1 }, point: { x: 0, y: 0, z: box.max.z } },
    { normal: { x: 0, y: 0, z: -1 }, point: { x: 0, y: 0, z: box.min.z } }
  ];

  for (const face of faces) {
    if (lineIntersectsPlane(v1, v2, face.point, face.normal)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if line intersects with a plane
 * @param {Vertex} v1 - First vertex
 * @param {Vertex} v2 - Second vertex
 * @param {Object} planePoint - Point on plane {x, y, z}
 * @param {Object} planeNormal - Plane normal {x, y, z}
 * @returns {boolean} True if line intersects plane
 */
export function lineIntersectsPlane(v1, v2, planePoint, planeNormal) {
  const lineVector = {
    x: v2.x - v1.x,
    y: v2.y - v1.y,
    z: v2.z - v1.z
  };
  
  const toPlane = {
    x: planePoint.x - v1.x,
    y: planePoint.y - v1.y,
    z: planePoint.z - v1.z
  };
  
  const denominator = dot(lineVector, planeNormal);
  if (Math.abs(denominator) < 1e-6) {
    return false; // Line is parallel to plane
  }
  
  const t = dot(toPlane, planeNormal) / denominator;
  return t >= 0 && t <= 1;
}

/**
 * Check if vertex is inside a box
 * @param {Vertex} vertex - Vertex object
 * @param {Object} box - Box object {min: {x,y,z}, max: {x,y,z}}
 * @returns {boolean} True if vertex is inside box
 */
export function vertexInBox(vertex, box) {
  return vertex.x >= box.min.x && vertex.x <= box.max.x &&
         vertex.y >= box.min.y && vertex.y <= box.max.y &&
         vertex.z >= box.min.z && vertex.z <= box.max.z;
}

/**
 * Calculate cross product of two vectors
 * @param {Object} a - First vector {x, y, z}
 * @param {Object} b - Second vector {x, y, z}
 * @returns {Object} Cross product {x, y, z}
 */
export function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

/**
 * Calculate dot product of two vectors
 * @param {Object} a - First vector {x, y, z}
 * @param {Object} b - Second vector {x, y, z}
 * @returns {number} Dot product
 */
export function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Calculate distance between two points
 * @param {Object} a - First point {x, y, z}
 * @param {Object} b - Second point {x, y, z}
 * @returns {number} Distance
 */
export function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
} 