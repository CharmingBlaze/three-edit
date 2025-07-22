/**
 * @fileoverview Object Selector
 * Object-specific selection operations and utilities
 */

import { EditableMesh } from '../EditableMesh.js';

/**
 * Object selection utilities and operations
 */
export class ObjectSelector {
  /**
   * Select object by raycasting
   * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
   * @param {Array} objects - Array of selectable objects
   * @param {Object} options - Selection options
   * @param {boolean} options.includeChildren - Include child objects
   * @param {number} options.maxDistance - Maximum ray distance
   * @returns {Object|null} Selected object or null
   */
  static selectByRay(ray, objects, options = {}) {
    const {
      includeChildren = true,
      maxDistance = Infinity
    } = options;

    let closestObject = null;
    let closestDistance = maxDistance;

    objects.forEach(object => {
      const distance = this.raycastObject(ray, object);
      
      if (distance !== null && distance < closestDistance) {
        closestDistance = distance;
        closestObject = object;
      }

      // Check children if enabled
      if (includeChildren && object.children) {
        object.children.forEach(child => {
          const childDistance = this.raycastObject(ray, child);
          if (childDistance !== null && childDistance < closestDistance) {
            closestDistance = childDistance;
            closestObject = child;
          }
        });
      }
    });

    return closestObject;
  }

  /**
   * Raycast against an object
   * @param {Object} ray - Ray object
   * @param {Object} object - Target object
   * @returns {number|null} Distance to object or null
   */
  static raycastObject(ray, object) {
    // Simplified raycasting - in a real implementation, you'd use Three.js raycasting
    if (!object.bounds) {return null;}

    const bounds = object.bounds;
    const origin = ray.origin;
    const direction = ray.direction;

    // Check if ray intersects bounding box
    const tMin = (bounds.min.x - origin.x) / direction.x;
    const tMax = (bounds.max.x - origin.x) / direction.x;
    const t1 = Math.min(tMin, tMax);
    const t2 = Math.max(tMin, tMax);

    const tMinY = (bounds.min.y - origin.y) / direction.y;
    const tMaxY = (bounds.max.y - origin.y) / direction.y;
    const t1Y = Math.min(tMinY, tMaxY);
    const t2Y = Math.max(tMinY, tMaxY);

    const tMinZ = (bounds.min.z - origin.z) / direction.z;
    const tMaxZ = (bounds.max.z - origin.z) / direction.z;
    const t1Z = Math.min(tMinZ, tMaxZ);
    const t2Z = Math.max(tMinZ, tMaxZ);

    const tNear = Math.max(t1, t1Y, t1Z);
    const tFar = Math.min(t2, t2Y, t2Z);

    if (tNear <= tFar && tFar > 0) {
      return tNear;
    }

    return null;
  }

  /**
   * Select objects in rectangle
   * @param {Object} bounds - Rectangle bounds
   * @param {Array} objects - Array of selectable objects
   * @param {Object} options - Selection options
   * @param {boolean} options.partial - Include partially overlapping objects
   * @returns {Array} Selected objects
   */
  static selectByRectangle(bounds, objects, options = {}) {
    const { partial = true } = options;
    const selectedObjects = [];

    objects.forEach(object => {
      if (this.objectInRectangle(object, bounds, partial)) {
        selectedObjects.push(object);
      }
    });

    return selectedObjects;
  }

  /**
   * Check if object is in rectangle
   * @param {Object} object - Target object
   * @param {Object} bounds - Rectangle bounds
   * @param {boolean} partial - Allow partial overlap
   * @returns {boolean} True if object is in rectangle
   */
  static objectInRectangle(object, bounds, partial = true) {
    if (!object.bounds) {return false;}

    const objectBounds = object.bounds;
    const rectBounds = bounds;

    if (partial) {
      // Check for any overlap
      return !(objectBounds.max.x < rectBounds.min.x ||
               objectBounds.min.x > rectBounds.max.x ||
               objectBounds.max.y < rectBounds.min.y ||
               objectBounds.min.y > rectBounds.max.y);
    } else {
      // Check if object is completely inside
      return objectBounds.min.x >= rectBounds.min.x &&
             objectBounds.max.x <= rectBounds.max.x &&
             objectBounds.min.y >= rectBounds.min.y &&
             objectBounds.max.y <= rectBounds.max.y;
    }
  }

  /**
   * Select objects in lasso
   * @param {Array} points - Lasso points
   * @param {Array} objects - Array of selectable objects
   * @param {Object} options - Selection options
   * @param {boolean} options.partial - Include partially overlapping objects
   * @returns {Array} Selected objects
   */
  static selectByLasso(points, objects, options = {}) {
    const { partial = true } = options;
    const selectedObjects = [];

    objects.forEach(object => {
      if (this.objectInLasso(object, points, partial)) {
        selectedObjects.push(object);
      }
    });

    return selectedObjects;
  }

  /**
   * Check if object is in lasso
   * @param {Object} object - Target object
   * @param {Array} points - Lasso points
   * @param {boolean} partial - Allow partial overlap
   * @returns {boolean} True if object is in lasso
   */
  static objectInLasso(object, points, partial = true) {
    if (!object.bounds || points.length < 3) {return false;}

    const objectBounds = object.bounds;
    const objectCenter = {
      x: (objectBounds.min.x + objectBounds.max.x) / 2,
      y: (objectBounds.min.y + objectBounds.max.y) / 2
    };

    // Check if object center is inside polygon
    const centerInside = this.pointInPolygon(objectCenter, points);

    if (partial) {
      return centerInside;
    } else {
      // Check if all corners are inside
      const corners = [
        { x: objectBounds.min.x, y: objectBounds.min.y },
        { x: objectBounds.max.x, y: objectBounds.min.y },
        { x: objectBounds.max.x, y: objectBounds.max.y },
        { x: objectBounds.min.x, y: objectBounds.max.y }
      ];

      return corners.every(corner => this.pointInPolygon(corner, points));
    }
  }

  /**
   * Check if point is inside polygon
   * @param {Object} point - Point {x, y}
   * @param {Array} polygon - Polygon points
   * @returns {boolean} True if point is inside polygon
   */
  static pointInPolygon(point, polygon) {
    let inside = false;
    const x = point.x;
    const y = point.y;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }

  /**
   * Select objects by name pattern
   * @param {string} pattern - Name pattern (supports wildcards)
   * @param {Array} objects - Array of selectable objects
   * @returns {Array} Selected objects
   */
  static selectByName(pattern, objects) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return objects.filter(object => regex.test(object.name));
  }

  /**
   * Select objects by type
   * @param {string} type - Object type
   * @param {Array} objects - Array of selectable objects
   * @returns {Array} Selected objects
   */
  static selectByType(type, objects) {
    return objects.filter(object => object.type === type);
  }

  /**
   * Select objects by material
   * @param {string} materialId - Material ID
   * @param {Array} objects - Array of selectable objects
   * @returns {Array} Selected objects
   */
  static selectByMaterial(materialId, objects) {
    return objects.filter(object => object.material && object.material.id === materialId);
  }

  /**
   * Select objects by layer
   * @param {string} layer - Layer name
   * @param {Array} objects - Array of selectable objects
   * @returns {Array} Selected objects
   */
  static selectByLayer(layer, objects) {
    return objects.filter(object => object.layer === layer);
  }

  /**
   * Select objects by visibility
   * @param {boolean} visible - Visibility state
   * @param {Array} objects - Array of selectable objects
   * @returns {Array} Selected objects
   */
  static selectByVisibility(visible, objects) {
    return objects.filter(object => object.visible === visible);
  }

  /**
   * Select objects in camera frustum
   * @param {Object} camera - Camera object
   * @param {Array} objects - Array of selectable objects
   * @param {Object} options - Selection options
   * @param {boolean} options.includeOccluded - Include occluded objects
   * @returns {Array} Selected objects
   */
  static selectInFrustum(camera, objects, options = {}) {
    const { includeOccluded = false } = options;
    const selectedObjects = [];

    objects.forEach(object => {
      if (this.objectInFrustum(object, camera)) {
        selectedObjects.push(object);
      }
    });

    return selectedObjects;
  }

  /**
   * Check if object is in camera frustum
   * @param {Object} object - Target object
   * @param {Object} camera - Camera object
   * @returns {boolean} True if object is in frustum
   */
  static objectInFrustum(object, camera) {
    if (!object.bounds) {return false;}

    // Simplified frustum culling - in a real implementation, you'd use proper frustum planes
    const bounds = object.bounds;
    const cameraPosition = camera.position;
    const cameraDirection = camera.direction;

    // Check if object is in front of camera
    const toObject = {
      x: bounds.min.x - cameraPosition.x,
      y: bounds.min.y - cameraPosition.y,
      z: bounds.min.z - cameraPosition.z
    };

    const dotProduct = toObject.x * cameraDirection.x +
                      toObject.y * cameraDirection.y +
                      toObject.z * cameraDirection.z;

    return dotProduct > 0;
  }

  /**
   * Get object bounds
   * @param {Object} object - Target object
   * @returns {Object} Object bounds
   */
  static getObjectBounds(object) {
    if (object.bounds) {
      return object.bounds;
    }

    // Calculate bounds from mesh data
    if (object.mesh && object.mesh.vertices) {
      const vertices = Array.from(object.mesh.vertices.values());
      return this.calculateBounds(vertices);
    }

    return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
  }

  /**
   * Calculate bounds from vertices
   * @param {Array} vertices - Array of vertices
   * @returns {Object} Bounds object
   */
  static calculateBounds(vertices) {
    if (vertices.length === 0) {
      return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
    }

    const bounds = {
      min: { x: Infinity, y: Infinity, z: Infinity },
      max: { x: -Infinity, y: -Infinity, z: -Infinity }
    };

    vertices.forEach(vertex => {
      bounds.min.x = Math.min(bounds.min.x, vertex.x);
      bounds.min.y = Math.min(bounds.min.y, vertex.y);
      bounds.min.z = Math.min(bounds.min.z, vertex.z);
      bounds.max.x = Math.max(bounds.max.x, vertex.x);
      bounds.max.y = Math.max(bounds.max.y, vertex.y);
      bounds.max.z = Math.max(bounds.max.z, vertex.z);
    });

    return bounds;
  }
} 