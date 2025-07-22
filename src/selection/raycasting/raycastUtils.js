/**
 * @fileoverview Raycasting utility functions
 * Provides utility functions for raycasting operations
 */

/**
 * Raycast against a vertex
 * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
 * @param {Object} vertex - Vertex object {x, y, z}
 * @returns {number|null} Distance to vertex or null
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
 * Raycast against an edge
 * @param {Object} ray - Ray object
 * @param {Object} edge - Edge object
 * @param {EditableMesh} mesh - Mesh containing the edge
 * @returns {number|null} Distance to edge or null
 */
export function raycastEdge(ray, edge, mesh) {
  const v1 = mesh.vertices.get(edge.vertexIds[0]);
  const v2 = mesh.vertices.get(edge.vertexIds[1]);
  
  if (!v1 || !v2) {
    return null;
  }

  const edgeVector = {
    x: v2.x - v1.x,
    y: v2.y - v1.y,
    z: v2.z - v1.z
  };

  const rayToV1 = {
    x: ray.origin.x - v1.x,
    y: ray.origin.y - v1.y,
    z: ray.origin.z - v1.z
  };

  const cross1 = cross(ray.direction, edgeVector);
  const cross2 = cross(rayToV1, edgeVector);

  const denominator = dot(cross1, cross1);
  if (Math.abs(denominator) < 1e-6) {
    return null;
  }

  const t = dot(cross2, cross1) / denominator;
  const u = dot(rayToV1, cross1) / denominator;

  if (t >= 0 && u >= 0 && u <= 1) {
    return t;
  }

  return null;
}

/**
 * Raycast against a face
 * @param {Object} ray - Ray object
 * @param {Object} face - Face object
 * @param {EditableMesh} mesh - Mesh containing the face
 * @returns {number|null} Distance to face or null
 */
export function raycastFace(ray, face, mesh) {
  if (face.vertexIds.length < 3) {
    return null;
  }

  const v1 = mesh.vertices.get(face.vertexIds[0]);
  const v2 = mesh.vertices.get(face.vertexIds[1]);
  const v3 = mesh.vertices.get(face.vertexIds[2]);

  if (!v1 || !v2 || !v3) {
    return null;
  }

  const edge1 = {
    x: v2.x - v1.x,
    y: v2.y - v1.y,
    z: v2.z - v1.z
  };

  const edge2 = {
    x: v3.x - v1.x,
    y: v3.y - v1.y,
    z: v3.z - v1.z
  };

  const h = cross(ray.direction, edge2);
  const a = dot(edge1, h);

  if (Math.abs(a) < 1e-6) {
    return null;
  }

  const f = 1.0 / a;
  const s = {
    x: ray.origin.x - v1.x,
    y: ray.origin.y - v1.y,
    z: ray.origin.z - v1.z
  };

  const u = f * dot(s, h);

  if (u < 0.0 || u > 1.0) {
    return null;
  }

  const q = cross(s, edge1);
  const v = f * dot(ray.direction, q);

  if (v < 0.0 || u + v > 1.0) {
    return null;
  }

  const t = f * dot(edge2, q);

  if (t > 1e-6) {
    return t;
  }

  return null;
}

/**
 * Check if a point is inside a face
 * @param {Object} point - Point to test {x, y, z}
 * @param {Array<Object>} vertices - Face vertices
 * @returns {boolean} True if point is inside face
 */
export function pointInFace(point, vertices) {
  if (vertices.length < 3) {
    return false;
  }

  // Use ray casting algorithm
  let inside = false;
  const x = point.x;
  const y = point.y;

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x;
    const yi = vertices[i].y;
    const xj = vertices[j].x;
    const yj = vertices[j].y;

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Cross product of two vectors
 * @param {Object} a - First vector
 * @param {Object} b - Second vector
 * @returns {Object} Cross product vector
 */
function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

/**
 * Dot product of two vectors
 * @param {Object} a - First vector
 * @param {Object} b - Second vector
 * @returns {number} Dot product
 */
function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
} 