/**
 * @fileoverview Modern Mesh Selector
 * Modular mesh selection operations using the new raycasting system
 */

import * as vertexRaycaster from './raycasting/vertexRaycaster.js';
import * as edgeRaycaster from './raycasting/edgeRaycaster.js';

/**
 * Modern mesh selection utilities and operations
 */
export class ModernMeshSelector {
  /**
   * Select mesh vertices by raycasting
   * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} options - Selection options
   * @param {number} [options.threshold=0.1] - Selection threshold distance
   * @param {boolean} [options.selectNearest=true] - Select nearest vertex only
   * @returns {Array<string>} Selected vertex IDs
   */
  static selectVerticesByRay(ray, mesh, options = {}) {
    return vertexRaycaster.selectVerticesByRay(ray, mesh.vertices, options);
  }

  /**
   * Select mesh edges by raycasting
   * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} options - Selection options
   * @param {number} [options.threshold=0.1] - Selection threshold distance
   * @param {boolean} [options.selectNearest=true] - Select nearest edge only
   * @returns {Array<string>} Selected edge IDs
   */
  static selectEdgesByRay(ray, mesh, options = {}) {
    return edgeRaycaster.selectEdgesByRay(ray, mesh.edges, mesh.vertices, options);
  }

  /**
   * Select mesh faces by raycasting
   * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} options - Selection options
   * @param {number} [options.threshold=0.1] - Selection threshold distance
   * @param {boolean} [options.selectNearest=true] - Select nearest face only
   * @returns {Array<string>} Selected face IDs
   */
  static selectFacesByRay(ray, mesh, options = {}) {
    const {
      threshold = 0.1,
      selectNearest = true
    } = options;

    const selectedFaces = [];
    let nearestDistance = Infinity;
    let nearestFace = null;

    for (const [id, face] of mesh.faces) {
      const distance = this.raycastFace(ray, face, mesh.vertices);
      
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
    }

    if (selectNearest && nearestFace) {
      selectedFaces.push(nearestFace);
    }

    return selectedFaces;
  }

  /**
   * Raycast against a face
   * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
   * @param {Face} face - Face object
   * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
   * @returns {number|null} Distance to face or null if no intersection
   */
  static raycastFace(ray, face, vertices) {
    if (face.vertexIds.length < 3) {
      return null;
    }

    // Get first three vertices to define the plane
    const v1 = vertices.get(face.vertexIds[0]);
    const v2 = vertices.get(face.vertexIds[1]);
    const v3 = vertices.get(face.vertexIds[2]);

    if (!v1 || !v2 || !v3) {
      return null;
    }

    // Calculate face normal
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

    const normal = {
      x: edge1.y * edge2.z - edge1.z * edge2.y,
      y: edge1.z * edge2.x - edge1.x * edge2.z,
      z: edge1.x * edge2.y - edge1.y * edge2.x
    };

    const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    if (normalLength === 0) {
      return null; // Degenerate face
    }

    normal.x /= normalLength;
    normal.y /= normalLength;
    normal.z /= normalLength;

    // Ray-plane intersection
    const rayDirection = ray.direction;
    const rayOrigin = ray.origin;

    const denominator = normal.x * rayDirection.x + normal.y * rayDirection.y + normal.z * rayDirection.z;
    if (Math.abs(denominator) < 1e-6) {
      return null; // Ray is parallel to face
    }

    const t = ((v1.x - rayOrigin.x) * normal.x + (v1.y - rayOrigin.y) * normal.y + (v1.z - rayOrigin.z) * normal.z) / denominator;
    if (t < 0) {
      return null; // Intersection is behind ray origin
    }

    // Calculate intersection point
    const intersectionPoint = {
      x: rayOrigin.x + t * rayDirection.x,
      y: rayOrigin.y + t * rayDirection.y,
      z: rayOrigin.z + t * rayDirection.z
    };

    // Check if intersection point is inside the face
    if (this.pointInFace(intersectionPoint, face, vertices)) {
      return t;
    }

    return null;
  }

  /**
   * Check if a point is inside a face
   * @param {Object} point - Point to test {x, y, z}
   * @param {Face} face - Face object
   * @param {Map<string, Vertex>} vertices - Map of vertex ID to Vertex objects
   * @returns {boolean} True if point is inside face
   */
  static pointInFace(point, face, vertices) {
    if (face.vertexIds.length < 3) {
      return false;
    }

    // Use winding number algorithm for point-in-polygon test
    let windingNumber = 0;
    const numVertices = face.vertexIds.length;

    for (let i = 0; i < numVertices; i++) {
      const currentId = face.vertexIds[i];
      const nextId = face.vertexIds[(i + 1) % numVertices];

      const current = vertices.get(currentId);
      const next = vertices.get(nextId);

      if (!current || !next) {
        continue;
      }

      if (current.y <= point.y) {
        if (next.y > point.y && this.isLeftOf(current, next, point)) {
          windingNumber++;
        }
      } else {
        if (next.y <= point.y && !this.isLeftOf(current, next, point)) {
          windingNumber--;
        }
      }
    }

    return windingNumber !== 0;
  }

  /**
   * Check if a point is to the left of a line segment
   * @param {Vertex} v1 - First vertex of line segment
   * @param {Vertex} v2 - Second vertex of line segment
   * @param {Object} point - Point to test {x, y, z}
   * @returns {boolean} True if point is to the left of line segment
   */
  static isLeftOf(v1, v2, point) {
    return ((v2.x - v1.x) * (point.y - v1.y) - (point.x - v1.x) * (v2.y - v1.y)) > 0;
  }

  /**
   * Select vertices within a sphere
   * @param {Object} sphere - Sphere object {center: {x,y,z}, radius: number}
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} options - Selection options
   * @param {boolean} [options.selectNearest=false] - Select nearest vertex only
   * @returns {Array<string>} Selected vertex IDs
   */
  static selectVerticesBySphere(sphere, mesh, options = {}) {
    return vertexRaycaster.selectVerticesBySphere(sphere, mesh.vertices, options);
  }

  /**
   * Select edges within a sphere
   * @param {Object} sphere - Sphere object {center: {x,y,z}, radius: number}
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} options - Selection options
   * @param {boolean} [options.selectNearest=false] - Select nearest edge only
   * @returns {Array<string>} Selected edge IDs
   */
  static selectEdgesBySphere(sphere, mesh, options = {}) {
    return edgeRaycaster.selectEdgesBySphere(sphere, mesh.edges, mesh.vertices, options);
  }

  /**
   * Select vertices within a box
   * @param {Object} box - Box object {min: {x,y,z}, max: {x,y,z}}
   * @param {EditableMesh} mesh - Target mesh
   * @returns {Array<string>} Selected vertex IDs
   */
  static selectVerticesByBox(box, mesh) {
    return vertexRaycaster.selectVerticesByBox(box, mesh.vertices);
  }

  /**
   * Select edges within a box
   * @param {Object} box - Box object {min: {x,y,z}, max: {x,y,z}}
   * @param {EditableMesh} mesh - Target mesh
   * @returns {Array<string>} Selected edge IDs
   */
  static selectEdgesByBox(box, mesh) {
    return edgeRaycaster.selectEdgesByBox(box, mesh.edges, mesh.vertices);
  }

  /**
   * Select vertices by distance to a point
   * @param {Object} point - Point object {x, y, z}
   * @param {EditableMesh} mesh - Target mesh
   * @param {number} maxDistance - Maximum distance for selection
   * @param {Object} options - Selection options
   * @param {boolean} [options.selectNearest=false] - Select nearest vertex only
   * @returns {Array<string>} Selected vertex IDs
   */
  static selectVerticesByDistance(point, mesh, maxDistance, options = {}) {
    return vertexRaycaster.selectVerticesByDistance(point, mesh.vertices, maxDistance, options);
  }

  /**
   * Convert world coordinates to screen coordinates
   * @param {Object} worldPoint - World point {x, y, z}
   * @param {Object} camera - Camera object with projection and matrix
   * @returns {Object|null} Screen coordinates {x, y} or null if behind camera
   */
  static worldToScreen(worldPoint, camera) {
    // This is a simplified implementation
    // In a real application, you would use the camera's projection matrix
    // and viewport information for accurate screen coordinates
    
    // For now, return a basic projection
    const distance = Math.sqrt(worldPoint.x * worldPoint.x + worldPoint.y * worldPoint.y + worldPoint.z * worldPoint.z);
    if (distance === 0) {
      return { x: 0, y: 0 };
    }
    
    return {
      x: worldPoint.x / distance,
      y: worldPoint.y / distance
    };
  }
} 