/**
 * @fileoverview Transform Gizmo
 * Interactive transform controls and gizmos
 */

import { MathUtils } from '../utils/MathUtils.js';

/**
 * Transform gizmo types
 */
export const GizmoTypes = {
  TRANSLATE: 'translate',
  ROTATE: 'rotate',
  SCALE: 'scale',
  UNIFORM_SCALE: 'uniform_scale',
  LOOK_AT: 'look_at'
};

/**
 * Gizmo axis colors
 */
export const GizmoColors = {
  X_AXIS: { r: 1, g: 0, b: 0 },
  Y_AXIS: { r: 0, g: 1, b: 0 },
  Z_AXIS: { r: 0, g: 0, b: 1 },
  SELECTED: { r: 1, g: 1, b: 0 },
  HOVER: { r: 1, g: 1, b: 1 }
};

/**
 * Transform Gizmo for interactive controls
 */
export class TransformGizmo {
  /**
   * Create a transform gizmo
   * @param {Object} options - Gizmo options
   * @param {string} options.type - Gizmo type
   * @param {number} options.size - Gizmo size
   * @param {Object} options.position - Gizmo position
   * @param {boolean} options.visible - Gizmo visibility
   */
  constructor(options = {}) {
    const {
      type = GizmoTypes.TRANSLATE,
      size = 1.0,
      position = { x: 0, y: 0, z: 0 },
      visible = true
    } = options;

    this.type = type;
    this.size = size;
    this.position = { ...position };
    this.visible = visible;
    this.active = false;
    this.hoverAxis = null;
    this.selectedAxis = null;
    this.dragStart = null;
    this.dragCurrent = null;
    this.listeners = new Set();
    this.geometry = null;
    this.materials = {};
    this.meshes = {};
  }

  /**
   * Create gizmo geometry
   * @returns {Object} Gizmo geometry data
   */
  createGeometry() {
    switch (this.type) {
      case GizmoTypes.TRANSLATE:
        return this.createTranslateGeometry();
      case GizmoTypes.ROTATE:
        return this.createRotateGeometry();
      case GizmoTypes.SCALE:
        return this.createScaleGeometry();
      case GizmoTypes.UNIFORM_SCALE:
        return this.createUniformScaleGeometry();
      case GizmoTypes.LOOK_AT:
        return this.createLookAtGeometry();
      default:
        return this.createTranslateGeometry();
    }
  }

  /**
   * Create translate gizmo geometry
   * @returns {Object} Translate gizmo geometry
   */
  createTranslateGeometry() {
    const arrowLength = this.size * 0.8;
    const arrowWidth = this.size * 0.1;
    const shaftLength = this.size * 0.6;

    return {
      type: 'group',
      children: [
        {
          type: 'arrow',
          direction: [1, 0, 0],
          length: arrowLength,
          width: arrowWidth,
          color: GizmoColors.X_AXIS,
          position: [this.position.x, this.position.y, this.position.z],
          axis: 'x'
        },
        {
          type: 'arrow',
          direction: [0, 1, 0],
          length: arrowLength,
          width: arrowWidth,
          color: GizmoColors.Y_AXIS,
          position: [this.position.x, this.position.y, this.position.z],
          axis: 'y'
        },
        {
          type: 'arrow',
          direction: [0, 0, 1],
          length: arrowLength,
          width: arrowWidth,
          color: GizmoColors.Z_AXIS,
          position: [this.position.x, this.position.y, this.position.z],
          axis: 'z'
        },
        {
          type: 'plane',
          normal: [0, 0, 1],
          size: [this.size * 0.3, this.size * 0.3],
          color: { r: 0.5, g: 0.5, b: 0.5 },
          position: [this.position.x, this.position.y, this.position.z],
          axis: 'xy'
        },
        {
          type: 'plane',
          normal: [0, 1, 0],
          size: [this.size * 0.3, this.size * 0.3],
          color: { r: 0.5, g: 0.5, b: 0.5 },
          position: [this.position.x, this.position.y, this.position.z],
          axis: 'xz'
        },
        {
          type: 'plane',
          normal: [1, 0, 0],
          size: [this.size * 0.3, this.size * 0.3],
          color: { r: 0.5, g: 0.5, b: 0.5 },
          position: [this.position.x, this.position.y, this.position.z],
          axis: 'yz'
        }
      ]
    };
  }

  /**
   * Create rotate gizmo geometry
   * @returns {Object} Rotate gizmo geometry
   */
  createRotateGeometry() {
    const radius = this.size * 0.5;

    return {
      type: 'group',
      children: [
        {
          type: 'ring',
          radius,
          color: GizmoColors.X_AXIS,
          position: [this.position.x, this.position.y, this.position.z],
          rotation: [0, 0, 0],
          axis: 'x'
        },
        {
          type: 'ring',
          radius,
          color: GizmoColors.Y_AXIS,
          position: [this.position.x, this.position.y, this.position.z],
          rotation: [Math.PI / 2, 0, 0],
          axis: 'y'
        },
        {
          type: 'ring',
          radius,
          color: GizmoColors.Z_AXIS,
          position: [this.position.x, this.position.y, this.position.z],
          rotation: [0, Math.PI / 2, 0],
          axis: 'z'
        }
      ]
    };
  }

  /**
   * Create scale gizmo geometry
   * @returns {Object} Scale gizmo geometry
   */
  createScaleGeometry() {
    const cubeSize = this.size * 0.1;

    return {
      type: 'group',
      children: [
        {
          type: 'cube',
          size: [cubeSize, cubeSize, cubeSize],
          color: GizmoColors.X_AXIS,
          position: [this.position.x + this.size * 0.5, this.position.y, this.position.z],
          axis: 'x'
        },
        {
          type: 'cube',
          size: [cubeSize, cubeSize, cubeSize],
          color: GizmoColors.Y_AXIS,
          position: [this.position.x, this.position.y + this.size * 0.5, this.position.z],
          axis: 'y'
        },
        {
          type: 'cube',
          size: [cubeSize, cubeSize, cubeSize],
          color: GizmoColors.Z_AXIS,
          position: [this.position.x, this.position.y, this.position.z + this.size * 0.5],
          axis: 'z'
        },
        {
          type: 'cube',
          size: [cubeSize, cubeSize, cubeSize],
          color: GizmoColors.SELECTED,
          position: [this.position.x, this.position.y, this.position.z],
          axis: 'uniform'
        }
      ]
    };
  }

  /**
   * Create uniform scale gizmo geometry
   * @returns {Object} Uniform scale gizmo geometry
   */
  createUniformScaleGeometry() {
    const sphereRadius = this.size * 0.15;

    return {
      type: 'group',
      children: [
        {
          type: 'sphere',
          radius: sphereRadius,
          color: GizmoColors.SELECTED,
          position: [this.position.x, this.position.y, this.position.z],
          axis: 'uniform'
        }
      ]
    };
  }

  /**
   * Create look-at gizmo geometry
   * @returns {Object} Look-at gizmo geometry
   */
  createLookAtGeometry() {
    const arrowLength = this.size * 0.6;
    const arrowWidth = this.size * 0.08;

    return {
      type: 'group',
      children: [
        {
          type: 'arrow',
          direction: [0, 0, 1],
          length: arrowLength,
          width: arrowWidth,
          color: GizmoColors.Z_AXIS,
          position: [this.position.x, this.position.y, this.position.z],
          axis: 'look'
        }
      ]
    };
  }

  /**
   * Set gizmo position
   * @param {Object} position - New position
   */
  setPosition(position) {
    this.position = { ...position };
    this.updateGeometry();
  }

  /**
   * Set gizmo type
   * @param {string} type - New gizmo type
   */
  setType(type) {
    this.type = type;
    this.geometry = this.createGeometry();
    this.notifyListeners('typeChanged', { type });
  }

  /**
   * Set gizmo size
   * @param {number} size - New gizmo size
   */
  setSize(size) {
    this.size = size;
    this.geometry = this.createGeometry();
    this.notifyListeners('sizeChanged', { size });
  }

  /**
   * Set gizmo visibility
   * @param {boolean} visible - Gizmo visibility
   */
  setVisible(visible) {
    this.visible = visible;
    this.notifyListeners('visibilityChanged', { visible });
  }

  /**
   * Update gizmo geometry
   */
  updateGeometry() {
    this.geometry = this.createGeometry();
    this.notifyListeners('geometryUpdated', { geometry: this.geometry });
  }

  /**
   * Handle mouse down event
   * @param {Object} event - Mouse event
   * @param {Object} camera - Camera object
   * @returns {boolean} True if gizmo was clicked
   */
  onMouseDown(event, camera) {
    const intersection = this.raycast(event, camera);
    if (intersection) {
      this.active = true;
      this.selectedAxis = intersection.axis;
      this.dragStart = intersection.point;
      this.dragCurrent = intersection.point;
      
      this.notifyListeners('dragStart', {
        axis: this.selectedAxis,
        point: this.dragStart
      });
      
      return true;
    }
    return false;
  }

  /**
   * Handle mouse move event
   * @param {Object} event - Mouse event
   * @param {Object} camera - Camera object
   */
  onMouseMove(event, camera) {
    if (this.active) {
      const intersection = this.raycast(event, camera);
      if (intersection) {
        this.dragCurrent = intersection.point;
        
        this.notifyListeners('dragMove', {
          axis: this.selectedAxis,
          startPoint: this.dragStart,
          currentPoint: this.dragCurrent,
          delta: MathUtils.subtractVectors(this.dragCurrent, this.dragStart)
        });
      }
    } else {
      // Handle hover
      const intersection = this.raycast(event, camera);
      const previousHover = this.hoverAxis;
      this.hoverAxis = intersection ? intersection.axis : null;
      
      if (this.hoverAxis !== previousHover) {
        this.notifyListeners('hoverChanged', {
          axis: this.hoverAxis,
          previousAxis: previousHover
        });
      }
    }
  }

  /**
   * Handle mouse up event
   */
  onMouseUp() {
    if (this.active) {
      this.notifyListeners('dragEnd', {
        axis: this.selectedAxis,
        startPoint: this.dragStart,
        endPoint: this.dragCurrent,
        delta: MathUtils.subtractVectors(this.dragCurrent, this.dragStart)
      });
      
      this.active = false;
      this.selectedAxis = null;
      this.dragStart = null;
      this.dragCurrent = null;
    }
  }

  /**
   * Raycast against gizmo
   * @param {Object} event - Mouse event
   * @param {Object} camera - Camera object
   * @returns {Object|null} Intersection data or null
   */
  raycast(event, camera) {
    // Simplified raycasting - in a real implementation, you'd use Three.js raycasting
    const ray = this.screenToRay(event.clientX, event.clientY, camera);
    
    // Check intersection with gizmo geometry
    const intersections = [];
    
    if (this.geometry && this.geometry.children) {
      this.geometry.children.forEach(child => {
        const intersection = this.raycastGeometry(ray, child);
        if (intersection) {
          intersections.push({
            ...intersection,
            axis: child.axis
          });
        }
      });
    }
    
    // Return closest intersection
    if (intersections.length > 0) {
      intersections.sort((a, b) => a.distance - b.distance);
      return intersections[0];
    }
    
    return null;
  }

  /**
   * Raycast against specific geometry
   * @param {Object} ray - Ray object
   * @param {Object} geometry - Geometry to test
   * @returns {Object|null} Intersection data or null
   */
  raycastGeometry(ray, geometry) {
    // Simplified geometry intersection testing
    // In a real implementation, you'd use proper Three.js intersection testing
    
    const position = geometry.position || [0, 0, 0];
    const bounds = this.getGeometryBounds(geometry);
    
    if (bounds) {
      const intersection = this.raycastBounds(ray, bounds);
      if (intersection) {
        return {
          point: intersection.point,
          distance: intersection.distance,
          geometry
        };
      }
    }
    
    return null;
  }

  /**
   * Get geometry bounds
   * @param {Object} geometry - Geometry object
   * @returns {Object|null} Bounds object or null
   */
  getGeometryBounds(geometry) {
    const position = geometry.position || [0, 0, 0];
    const size = geometry.size || [this.size * 0.1, this.size * 0.1, this.size * 0.1];
    
    return {
      min: {
        x: position[0] - size[0] / 2,
        y: position[1] - size[1] / 2,
        z: position[2] - size[2] / 2
      },
      max: {
        x: position[0] + size[0] / 2,
        y: position[1] + size[1] / 2,
        z: position[2] + size[2] / 2
      }
    };
  }

  /**
   * Raycast against bounds
   * @param {Object} ray - Ray object
   * @param {Object} bounds - Bounds object
   * @returns {Object|null} Intersection data or null
   */
  raycastBounds(ray, bounds) {
    // Simplified bounds intersection testing
    const tMin = (bounds.min.x - ray.origin.x) / ray.direction.x;
    const tMax = (bounds.max.x - ray.origin.x) / ray.direction.x;
    const t1 = Math.min(tMin, tMax);
    const t2 = Math.max(tMin, tMax);

    const tMinY = (bounds.min.y - ray.origin.y) / ray.direction.y;
    const tMaxY = (bounds.max.y - ray.origin.y) / ray.direction.y;
    const t1Y = Math.min(tMinY, tMaxY);
    const t2Y = Math.max(tMinY, tMaxY);

    const tMinZ = (bounds.min.z - ray.origin.z) / ray.direction.z;
    const tMaxZ = (bounds.max.z - ray.origin.z) / ray.direction.z;
    const t1Z = Math.min(tMinZ, tMaxZ);
    const t2Z = Math.max(tMinZ, tMaxZ);

    const tNear = Math.max(t1, t1Y, t1Z);
    const tFar = Math.min(t2, t2Y, t2Z);

    if (tNear <= tFar && tFar > 0) {
      const point = {
        x: ray.origin.x + tNear * ray.direction.x,
        y: ray.origin.y + tNear * ray.direction.y,
        z: ray.origin.z + tNear * ray.direction.z
      };
      
      return {
        point,
        distance: tNear
      };
    }

    return null;
  }

  /**
   * Convert screen coordinates to ray
   * @param {number} x - Screen X coordinate
   * @param {number} y - Screen Y coordinate
   * @param {Object} camera - Camera object
   * @returns {Object} Ray object
   */
  screenToRay(x, y, camera) {
    // Simplified screen to ray conversion
    // In a real implementation, you'd use proper Three.js screen to ray conversion
    
    const normalizedX = (x / window.innerWidth) * 2 - 1;
    const normalizedY = -(y / window.innerHeight) * 2 + 1;
    
    return {
      origin: { ...camera.position },
      direction: {
        x: normalizedX,
        y: normalizedY,
        z: -1
      }
    };
  }

  /**
   * Get gizmo state
   * @returns {Object} Gizmo state
   */
  getState() {
    return {
      type: this.type,
      size: this.size,
      position: { ...this.position },
      visible: this.visible,
      active: this.active,
      hoverAxis: this.hoverAxis,
      selectedAxis: this.selectedAxis,
      dragStart: this.dragStart,
      dragCurrent: this.dragCurrent
    };
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    this.listeners.add({ event, callback });
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeEventListener(event, callback) {
    for (const listener of this.listeners) {
      if (listener.event === event && listener.callback === callback) {
        this.listeners.delete(listener);
        break;
      }
    }
  }

  /**
   * Notify all listeners
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    for (const listener of this.listeners) {
      if (listener.event === event) {
        try {
          listener.callback(data);
        } catch (error) {
          console.error('Gizmo listener error:', error);
        }
      }
    }
  }
} 