/**
 * @fileoverview Vertex Raycaster
 * Raycasting operations for vertex selection
 */

/**
 * Select mesh vertices by raycasting
 * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
 * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
 * @param {Object} options - Selection options
 * @param {number} [options.threshold=0.1] - Selection threshold distance
 * @param {boolean} [options.selectNearest=true] - Select nearest vertex only
 * @returns {Array<string>} Selected vertex IDs
 */
export function selectVerticesByRay(ray, vertices, options = {}) {
  const {
    threshold = 0.1,
    selectNearest = true
  } = options;

  const selectedVertices = [];
  let nearestDistance = Infinity;
  let nearestVertex = null;

  for (const [id, vertex] of vertices) {
    const distance = raycastVertex(ray, vertex);
    
    if (distance !== null && distance <= threshold) {
      if (selectNearest) {
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestVertex = id;
        }
      } else {
        selectedVertices.push(id);
      }
    }
  }

  if (selectNearest && nearestVertex) {
    selectedVertices.push(nearestVertex);
  }

  return selectedVertices;
}

/**
 * Raycast against a vertex
 * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
 * @param {Vertex} vertex - Vertex object
 * @returns {number|null} Distance to vertex or null if no intersection
 */
export function raycastVertex(ray, vertex) {
  const origin = ray.origin;
  const direction = ray.direction;
  
  // Calculate distance from ray to vertex
  const toVertex = {
    x: vertex.x - origin.x,
    y: vertex.y - origin.y,
    z: vertex.z - origin.z
  };

  const dotProduct = toVertex.x * direction.x +
                    toVertex.y * direction.y +
                    toVertex.z * direction.z;

  const projection = {
    x: direction.x * dotProduct,
    y: direction.y * dotProduct,
    z: direction.z * dotProduct
  };

  const perpendicular = {
    x: toVertex.x - projection.x,
    y: toVertex.y - projection.y,
    z: toVertex.z - projection.z
  };

  return Math.sqrt(perpendicular.x * perpendicular.x +
                  perpendicular.y * perpendicular.y +
                  perpendicular.z * perpendicular.z);
}

/**
 * Select vertices within a sphere
 * @param {Object} sphere - Sphere object {center: {x,y,z}, radius: number}
 * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
 * @param {Object} options - Selection options
 * @param {boolean} [options.selectNearest=false] - Select nearest vertex only
 * @returns {Array<string>} Selected vertex IDs
 */
export function selectVerticesBySphere(sphere, vertices, options = {}) {
  const { selectNearest = false } = options;
  const selectedVertices = [];
  let nearestDistance = Infinity;
  let nearestVertex = null;

  for (const [id, vertex] of vertices) {
    const distance = distanceToSphere(vertex, sphere);
    
    if (distance <= sphere.radius) {
      if (selectNearest) {
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestVertex = id;
        }
      } else {
        selectedVertices.push(id);
      }
    }
  }

  if (selectNearest && nearestVertex) {
    selectedVertices.push(nearestVertex);
  }

  return selectedVertices;
}

/**
 * Calculate distance from vertex to sphere center
 * @param {Vertex} vertex - Vertex object
 * @param {Object} sphere - Sphere object {center: {x,y,z}, radius: number}
 * @returns {number} Distance to sphere center
 */
export function distanceToSphere(vertex, sphere) {
  const dx = vertex.x - sphere.center.x;
  const dy = vertex.y - sphere.center.y;
  const dz = vertex.z - sphere.center.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Select vertices within a box
 * @param {Object} box - Box object {min: {x,y,z}, max: {x,y,z}}
 * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
 * @returns {Array<string>} Selected vertex IDs
 */
export function selectVerticesByBox(box, vertices) {
  const selectedVertices = [];

  for (const [id, vertex] of vertices) {
    if (vertexInBox(vertex, box)) {
      selectedVertices.push(id);
    }
  }

  return selectedVertices;
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
 * Select vertices by distance to a point
 * @param {Object} point - Point object {x, y, z}
 * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
 * @param {number} maxDistance - Maximum distance for selection
 * @param {Object} options - Selection options
 * @param {boolean} [options.selectNearest=false] - Select nearest vertex only
 * @returns {Array<string>} Selected vertex IDs
 */
export function selectVerticesByDistance(point, vertices, maxDistance, options = {}) {
  const { selectNearest = false } = options;
  const selectedVertices = [];
  let nearestDistance = Infinity;
  let nearestVertex = null;

  for (const [id, vertex] of vertices) {
    const distance = distanceToPoint(vertex, point);
    
    if (distance <= maxDistance) {
      if (selectNearest) {
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestVertex = id;
        }
      } else {
        selectedVertices.push(id);
      }
    }
  }

  if (selectNearest && nearestVertex) {
    selectedVertices.push(nearestVertex);
  }

  return selectedVertices;
}

/**
 * Calculate distance between vertex and point
 * @param {Vertex} vertex - Vertex object
 * @param {Object} point - Point object {x, y, z}
 * @returns {number} Distance between vertex and point
 */
export function distanceToPoint(vertex, point) {
  const dx = vertex.x - point.x;
  const dy = vertex.y - point.y;
  const dz = vertex.z - point.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
} 