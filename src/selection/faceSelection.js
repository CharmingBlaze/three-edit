/**
 * @fileoverview Face selection operations
 * Provides functionality for selecting faces in meshes
 */

import { raycastFace, pointInFace } from './raycasting/raycastUtils.js';

/**
 * Select mesh faces by raycasting
 * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} options - Selection options
 * @param {number} options.threshold - Selection threshold distance
 * @param {boolean} options.selectNearest - Select nearest face only
 * @returns {Array<string>} Selected face IDs
 */
export function selectFacesByRay(ray, mesh, options = {}) {
  const {
    threshold = 0.1,
    selectNearest = true
  } = options;

  const selectedFaces = [];
  let nearestDistance = Infinity;
  let nearestFace = null;

  mesh.faces.forEach((face, id) => {
    const distance = raycastFace(ray, face, mesh);
    
    if (distance !== null && distance <= threshold) {
      if (selectNearest) {
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestFace = id;
        }
      } else {
        selectedFaces.push(id);
      }
    }
  });

  if (selectNearest && nearestFace) {
    selectedFaces.push(nearestFace);
  }

  return selectedFaces;
}

/**
 * Select faces by rectangle selection
 * @param {Object} bounds - Rectangle bounds {min: {x,y}, max: {x,y}}
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} camera - Camera object for projection
 * @returns {Array<string>} Selected face IDs
 */
export function selectFacesByRectangle(bounds, mesh, camera) {
  const selectedFaces = [];

  mesh.faces.forEach((face, id) => {
    // Get face vertices
    const vertices = face.vertexIds.map(vertexId => mesh.vertices.get(vertexId)).filter(Boolean);
    
    if (vertices.length < 3) return;

    // Convert vertices to screen coordinates
    const screenVertices = vertices.map(vertex => worldToScreen(vertex, camera));

    // Check if face polygon intersects with rectangle
    if (polygonIntersectsRectangle(screenVertices, bounds)) {
      selectedFaces.push(id);
    }
  });

  return selectedFaces;
}

/**
 * Select faces by sphere selection
 * @param {Object} center - Sphere center {x, y, z}
 * @param {number} radius - Sphere radius
 * @param {EditableMesh} mesh - Target mesh
 * @returns {Array<string>} Selected face IDs
 */
export function selectFacesBySphere(center, radius, mesh) {
  const selectedFaces = [];

  mesh.faces.forEach((face, id) => {
    const vertices = face.vertexIds.map(vertexId => mesh.vertices.get(vertexId)).filter(Boolean);
    
    if (vertices.length < 3) return;

    // Check if any vertex is inside the sphere
    const hasVertexInSphere = vertices.some(vertex => {
      const distance = Math.sqrt(
        Math.pow(vertex.x - center.x, 2) +
        Math.pow(vertex.y - center.y, 2) +
        Math.pow(vertex.z - center.z, 2)
      );
      return distance <= radius;
    });

    if (hasVertexInSphere) {
      selectedFaces.push(id);
    }
  });

  return selectedFaces;
}

/**
 * Select faces by connected components
 * @param {Array<string>} seedFaces - Starting face IDs
 * @param {EditableMesh} mesh - Target mesh
 * @param {Object} options - Selection options
 * @param {number} options.maxFaces - Maximum number of faces to select
 * @returns {Array<string>} Selected face IDs
 */
export function selectFacesByConnection(seedFaces, mesh, options = {}) {
  const {
    maxFaces = 1000
  } = options;

  const selectedFaces = new Set(seedFaces);
  const queue = [...seedFaces];

  while (queue.length > 0 && selectedFaces.size < maxFaces) {
    const currentId = queue.shift();
    const currentFace = mesh.faces.get(currentId);
    
    if (!currentFace) continue;

    // Find connected faces (sharing edges)
    mesh.faces.forEach((face, id) => {
      if (selectedFaces.has(id)) return;

      // Check if faces share any edges
      const sharesEdge = currentFace.vertexIds.some(vertexId1 => {
        return currentFace.vertexIds.some(vertexId2 => {
          if (vertexId1 === vertexId2) return false;
          
          // Check if this edge exists in the other face
          return face.vertexIds.includes(vertexId1) && face.vertexIds.includes(vertexId2);
        });
      });

      if (sharesEdge) {
        selectedFaces.add(id);
        queue.push(id);
      }
    });
  }

  return Array.from(selectedFaces);
}

/**
 * Select faces by material
 * @param {string} materialName - Material name to select
 * @param {EditableMesh} mesh - Target mesh
 * @returns {Array<string>} Selected face IDs
 */
export function selectFacesByMaterial(materialName, mesh) {
  const selectedFaces = [];

  mesh.faces.forEach((face, id) => {
    if (face.material && face.material.name === materialName) {
      selectedFaces.push(id);
    }
  });

  return selectedFaces;
}

/**
 * Select faces by normal direction
 * @param {Object} normal - Normal direction {x, y, z}
 * @param {number} angleThreshold - Maximum angle difference in radians
 * @param {EditableMesh} mesh - Target mesh
 * @returns {Array<string>} Selected face IDs
 */
export function selectFacesByNormal(normal, angleThreshold, mesh) {
  const selectedFaces = [];
  const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);

  if (normalLength === 0) return selectedFaces;

  const normalizedNormal = {
    x: normal.x / normalLength,
    y: normal.y / normalLength,
    z: normal.z / normalLength
  };

  mesh.faces.forEach((face, id) => {
    if (!face.normal) return;

    const faceNormalLength = Math.sqrt(
      face.normal.x * face.normal.x +
      face.normal.y * face.normal.y +
      face.normal.z * face.normal.z
    );

    if (faceNormalLength === 0) return;

    const normalizedFaceNormal = {
      x: face.normal.x / faceNormalLength,
      y: face.normal.y / faceNormalLength,
      z: face.normal.z / faceNormalLength
    };

    const dotProduct = normalizedNormal.x * normalizedFaceNormal.x +
                      normalizedNormal.y * normalizedFaceNormal.y +
                      normalizedNormal.z * normalizedFaceNormal.z;

    const angle = Math.acos(Math.abs(dotProduct));
    
    if (angle <= angleThreshold) {
      selectedFaces.push(id);
    }
  });

  return selectedFaces;
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
 * Check if polygon intersects rectangle
 * @param {Array<Object>} polygon - Polygon vertices [{x, y}, ...]
 * @param {Object} bounds - Rectangle bounds {min: {x,y}, max: {x,y}}
 * @returns {boolean} True if polygon intersects rectangle
 */
function polygonIntersectsRectangle(polygon, bounds) {
  // Check if any polygon vertex is inside the rectangle
  if (polygon.some(vertex => pointInRectangle(vertex, bounds))) {
    return true;
  }

  // Check if any polygon edge intersects with rectangle edges
  const rectangleEdges = [
    [{ x: bounds.min.x, y: bounds.min.y }, { x: bounds.max.x, y: bounds.min.y }],
    [{ x: bounds.max.x, y: bounds.min.y }, { x: bounds.max.x, y: bounds.max.y }],
    [{ x: bounds.max.x, y: bounds.max.y }, { x: bounds.min.x, y: bounds.max.y }],
    [{ x: bounds.min.x, y: bounds.max.y }, { x: bounds.min.x, y: bounds.min.y }]
  ];

  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];

    for (const rectEdge of rectangleEdges) {
      if (linesIntersect(p1, p2, rectEdge[0], rectEdge[1])) {
        return true;
      }
    }
  }

  return false;
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