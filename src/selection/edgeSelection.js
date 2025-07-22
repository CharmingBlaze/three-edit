/**
 * @fileoverview Edge selection operations
 * Provides functionality for selecting edges in meshes
 */

import { raycastEdge } from './raycasting/raycastUtils.js';

/**
 * Select mesh edges by raycasting
 * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} options - Selection options
 * @param {number} options.threshold - Selection threshold distance
 * @param {boolean} options.selectNearest - Select nearest edge only
 * @returns {Array<string>} Selected edge IDs
 */
export function selectEdgesByRay(ray, mesh, options = {}) {
  const {
    threshold = 0.1,
    selectNearest = true
  } = options;

  const selectedEdges = [];
  let nearestDistance = Infinity;
  let nearestEdge = null;

  mesh.edges.forEach((edge, id) => {
    const distance = raycastEdge(ray, edge, mesh);
    
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
  });

  if (selectNearest && nearestEdge) {
    selectedEdges.push(nearestEdge);
  }

  return selectedEdges;
}

/**
 * Select edges by rectangle selection
 * @param {Object} bounds - Rectangle bounds {min: {x,y}, max: {x,y}}
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} camera - Camera object for projection
 * @returns {Array<string>} Selected edge IDs
 */
export function selectEdgesByRectangle(bounds, mesh, camera) {
  const selectedEdges = [];

  mesh.edges.forEach((edge, id) => {
    const v1 = mesh.vertices.get(edge.vertexIds[0]);
    const v2 = mesh.vertices.get(edge.vertexIds[1]);
    
    if (!v1 || !v2) return;

    const p1 = worldToScreen(v1, camera);
    const p2 = worldToScreen(v2, camera);

    if (lineIntersectsRectangle(p1, p2, bounds)) {
      selectedEdges.push(id);
    }
  });

  return selectedEdges;
}

/**
 * Select edges by sphere selection
 * @param {Object} center - Sphere center {x, y, z}
 * @param {number} radius - Sphere radius
 * @param {EditableMesh} mesh - Target mesh
 * @returns {Array<string>} Selected edge IDs
 */
export function selectEdgesBySphere(center, radius, mesh) {
  const selectedEdges = [];

  mesh.edges.forEach((edge, id) => {
    const v1 = mesh.vertices.get(edge.vertexIds[0]);
    const v2 = mesh.vertices.get(edge.vertexIds[1]);
    
    if (!v1 || !v2) return;

    // Check if edge intersects with sphere
    const edgeVector = {
      x: v2.x - v1.x,
      y: v2.y - v1.y,
      z: v2.z - v1.z
    };

    const toCenter = {
      x: center.x - v1.x,
      y: center.y - v1.y,
      z: center.z - v1.z
    };

    const edgeLength = Math.sqrt(
      edgeVector.x * edgeVector.x +
      edgeVector.y * edgeVector.y +
      edgeVector.z * edgeVector.z
    );

    if (edgeLength === 0) return;

    const t = Math.max(0, Math.min(1, 
      (toCenter.x * edgeVector.x + toCenter.y * edgeVector.y + toCenter.z * edgeVector.z) / 
      (edgeLength * edgeLength)
    ));

    const closestPoint = {
      x: v1.x + t * edgeVector.x,
      y: v1.y + t * edgeVector.y,
      z: v1.z + t * edgeVector.z
    };

    const distance = Math.sqrt(
      Math.pow(closestPoint.x - center.x, 2) +
      Math.pow(closestPoint.y - center.y, 2) +
      Math.pow(closestPoint.z - center.z, 2)
    );

    if (distance <= radius) {
      selectedEdges.push(id);
    }
  });

  return selectedEdges;
}

/**
 * Select edges by connected components
 * @param {Array<string>} seedEdges - Starting edge IDs
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} options - Selection options
 * @param {number} options.maxEdges - Maximum number of edges to select
 * @returns {Array<string>} Selected edge IDs
 */
export function selectEdgesByConnection(seedEdges, mesh, options = {}) {
  const {
    maxEdges = 1000
  } = options;

  const selectedEdges = new Set(seedEdges);
  const queue = [...seedEdges];

  while (queue.length > 0 && selectedEdges.size < maxEdges) {
    const currentId = queue.shift();
    const currentEdge = mesh.edges.get(currentId);
    
    if (!currentEdge) continue;

    // Find connected edges
    mesh.edges.forEach((edge, id) => {
      if (selectedEdges.has(id)) return;

      // Check if edges share a vertex
      const sharesVertex = currentEdge.vertexIds.some(vertexId =>
        edge.vertexIds.includes(vertexId)
      );

      if (sharesVertex) {
        selectedEdges.add(id);
        queue.push(id);
      }
    });
  }

  return Array.from(selectedEdges);
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
 * Check if line intersects rectangle
 * @param {Object} p1 - Line start point {x, y}
 * @param {Object} p2 - Line end point {x, y}
 * @param {Object} bounds - Rectangle bounds {min: {x,y}, max: {x,y}}
 * @returns {boolean} True if line intersects rectangle
 */
function lineIntersectsRectangle(p1, p2, bounds) {
  // Check if either endpoint is inside the rectangle
  if (pointInRectangle(p1, bounds) || pointInRectangle(p2, bounds)) {
    return true;
  }

  // Check intersection with rectangle edges
  const edges = [
    [{ x: bounds.min.x, y: bounds.min.y }, { x: bounds.max.x, y: bounds.min.y }],
    [{ x: bounds.max.x, y: bounds.min.y }, { x: bounds.max.x, y: bounds.max.y }],
    [{ x: bounds.max.x, y: bounds.max.y }, { x: bounds.min.x, y: bounds.max.y }],
    [{ x: bounds.min.x, y: bounds.max.y }, { x: bounds.min.x, y: bounds.min.y }]
  ];

  return edges.some(edge => linesIntersect(p1, p2, edge[0], edge[1]));
}

/**
 * Check if two lines intersect
 * @param {Object} a1 - First line start {x, y}
 * @param {Object} a2 - First line end {x, y}
 * @param {Object} b1 - Second line start {x, y}
 * @param {Object} b2 - Second line end {x, y}
 * @returns {boolean} True if lines intersect
 */
function linesIntersect(a1, a2, b1, b2) {
  const det = (a2.x - a1.x) * (b2.y - b1.y) - (b2.x - b1.x) * (a2.y - a1.y);
  
  if (Math.abs(det) < 1e-6) return false;

  const t = ((b1.x - a1.x) * (b2.y - b1.y) - (b2.x - b1.x) * (b1.y - a1.y)) / det;
  const u = ((a2.x - a1.x) * (b1.y - a1.y) - (b1.x - a1.x) * (a2.y - a1.y)) / det;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
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