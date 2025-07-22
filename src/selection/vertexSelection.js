/**
 * @fileoverview Vertex selection operations
 * Provides functionality for selecting vertices in meshes
 */

import { raycastVertex } from './raycasting/raycastUtils.js';

/**
 * Select mesh vertices by raycasting
 * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} options - Selection options
 * @param {number} options.threshold - Selection threshold distance
 * @param {boolean} options.selectNearest - Select nearest vertex only
 * @returns {Array<string>} Selected vertex IDs
 */
export function selectVerticesByRay(ray, mesh, options = {}) {
  const {
    threshold = 0.1,
    selectNearest = true
  } = options;

  const selectedVertices = [];
  let nearestDistance = Infinity;
  let nearestVertex = null;

  mesh.vertices.forEach((vertex, id) => {
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
  });

  if (selectNearest && nearestVertex) {
    selectedVertices.push(nearestVertex);
  }

  return selectedVertices;
}

/**
 * Select vertices by rectangle selection
 * @param {Object} bounds - Rectangle bounds {min: {x,y}, max: {x,y}}
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} camera - Camera object for projection
 * @returns {Array<string>} Selected vertex IDs
 */
export function selectVerticesByRectangle(bounds, mesh, camera) {
  const selectedVertices = [];

  mesh.vertices.forEach((vertex, id) => {
    const screenPoint = worldToScreen(vertex, camera);
    if (pointInRectangle(screenPoint, bounds)) {
      selectedVertices.push(id);
    }
  });

  return selectedVertices;
}

/**
 * Select vertices by sphere selection
 * @param {Object} center - Sphere center {x, y, z}
 * @param {number} radius - Sphere radius
 * @param {EditableMesh} mesh - Target mesh
 * @returns {Array<string>} Selected vertex IDs
 */
export function selectVerticesBySphere(center, radius, mesh) {
  const selectedVertices = [];

  mesh.vertices.forEach((vertex, id) => {
    const distance = Math.sqrt(
      Math.pow(vertex.x - center.x, 2) +
      Math.pow(vertex.y - center.y, 2) +
      Math.pow(vertex.z - center.z, 2)
    );
    
    if (distance <= radius) {
      selectedVertices.push(id);
    }
  });

  return selectedVertices;
}

/**
 * Select vertices by connected components
 * @param {Array<string>} seedVertices - Starting vertex IDs
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} options - Selection options
 * @param {number} options.maxDistance - Maximum distance for connection
 * @param {number} options.maxVertices - Maximum number of vertices to select
 * @returns {Array<string>} Selected vertex IDs
 */
export function selectVerticesByConnection(seedVertices, mesh, options = {}) {
  const {
    maxDistance = 1.0,
    maxVertices = 1000
  } = options;

  const selectedVertices = new Set(seedVertices);
  const queue = [...seedVertices];

  while (queue.length > 0 && selectedVertices.size < maxVertices) {
    const currentId = queue.shift();
    const currentVertex = mesh.vertices.get(currentId);
    
    if (!currentVertex) continue;

    // Find nearby vertices
    mesh.vertices.forEach((vertex, id) => {
      if (selectedVertices.has(id)) return;

      const distance = Math.sqrt(
        Math.pow(vertex.x - currentVertex.x, 2) +
        Math.pow(vertex.y - currentVertex.y, 2) +
        Math.pow(vertex.z - currentVertex.z, 2)
      );

      if (distance <= maxDistance) {
        selectedVertices.add(id);
        queue.push(id);
      }
    });
  }

  return Array.from(selectedVertices);
}

/**
 * Convert world point to screen coordinates
 * @param {Object} worldPoint - World point {x, y, z}
 * @param {Object} camera - Camera object
 * @returns {Object} Screen point {x, y}
 */
function worldToScreen(worldPoint, camera) {
  // This is a simplified implementation
  // In a real application, you would use Three.js projection methods
  const screenX = (worldPoint.x / worldPoint.z) * camera.fov;
  const screenY = (worldPoint.y / worldPoint.z) * camera.fov;
  
  return { x: screenX, y: screenY };
}

/**
 * Check if point is inside rectangle
 * @param {Object} point - Point to test {x, y}
 * @param {Object} bounds - Rectangle bounds {min: {x,y}, max: {x,y}}
 * @returns {boolean} True if point is inside rectangle
 */
function pointInRectangle(point, bounds) {
  return point.x >= bounds.min.x && point.x <= bounds.max.x &&
         point.y >= bounds.min.y && point.y <= bounds.max.y;
} 