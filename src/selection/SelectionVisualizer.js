/**
 * @fileoverview Selection Visualizer
 * Visualization utilities for selections
 */

/**
 * Selection visualization utilities
 */
export class SelectionVisualizer {
  /**
   * Create selection highlight material
   * @param {Object} options - Material options
   * @param {Object} options.color - Highlight color
   * @param {number} options.opacity - Material opacity
   * @param {boolean} options.wireframe - Wireframe mode
   * @returns {Object} Highlight material
   */
  static createHighlightMaterial(options = {}) {
    const {
      color = { r: 1, g: 1, b: 0 },
      opacity = 0.8,
      wireframe = false
    } = options;

    return {
      type: 'highlight',
      color: { ...color },
      opacity,
      wireframe,
      transparent: true,
      side: 'double'
    };
  }

  /**
   * Create vertex highlight geometry
   * @param {Array} vertices - Vertex positions
   * @param {Object} options - Geometry options
   * @param {number} options.size - Vertex size
   * @returns {Object} Vertex highlight geometry
   */
  static createVertexHighlightGeometry(vertices, options = {}) {
    const { size = 0.05 } = options;

    const geometry = {
      type: 'instanced',
      positions: vertices.map(v => [v.x, v.y, v.z]),
      attributes: {
        size: new Array(vertices.length).fill(size)
      }
    };

    return geometry;
  }

  /**
   * Create edge highlight geometry
   * @param {Array} edges - Edge data
   * @param {Object} vertices - Vertex map
   * @param {Object} options - Geometry options
   * @param {number} options.width - Edge width
   * @returns {Object} Edge highlight geometry
   */
  static createEdgeHighlightGeometry(edges, vertices, options = {}) {
    const { width = 0.02 } = options;

    const positions = [];
    const indices = [];

    edges.forEach((edge, index) => {
      const v1 = vertices.get(edge.vertexId1);
      const v2 = vertices.get(edge.vertexId2);

      if (v1 && v2) {
        const startIndex = positions.length / 3;
        
        positions.push(v1.x, v1.y, v1.z);
        positions.push(v2.x, v2.y, v2.z);

        indices.push(startIndex, startIndex + 1);
      }
    });

    return {
      type: 'line',
      positions,
      indices,
      attributes: {
        width: new Array(positions.length / 3).fill(width)
      }
    };
  }

  /**
   * Create face highlight geometry
   * @param {Array} faces - Face data
   * @param {Object} vertices - Vertex map
   * @param {Object} options - Geometry options
   * @returns {Object} Face highlight geometry
   */
  static createFaceHighlightGeometry(faces, vertices, options = {}) {
    const positions = [];
    const indices = [];
    const normals = [];

    faces.forEach(face => {
      const faceVertices = face.vertexIds.map(id => vertices.get(id)).filter(v => v);
      
      if (faceVertices.length >= 3) {
        const startIndex = positions.length / 3;
        
        // Add vertices
        faceVertices.forEach(vertex => {
          positions.push(vertex.x, vertex.y, vertex.z);
        });

        // Add face normal
        const normal = this.calculateFaceNormal(faceVertices);
        faceVertices.forEach(() => {
          normals.push(normal.x, normal.y, normal.z);
        });

        // Add indices for triangulation
        for (let i = 1; i < faceVertices.length - 1; i++) {
          indices.push(startIndex, startIndex + i, startIndex + i + 1);
        }
      }
    });

    return {
      type: 'mesh',
      positions,
      indices,
      normals
    };
  }

  /**
   * Calculate face normal
   * @param {Array} vertices - Face vertices
   * @returns {Object} Face normal
   */
  static calculateFaceNormal(vertices) {
    if (vertices.length < 3) {
      return { x: 0, y: 1, z: 0 };
    }

    const v0 = vertices[0];
    const v1 = vertices[1];
    const v2 = vertices[2];

    const edge1 = {
      x: v1.x - v0.x,
      y: v1.y - v0.y,
      z: v1.z - v0.z
    };

    const edge2 = {
      x: v2.x - v0.x,
      y: v2.y - v0.y,
      z: v2.z - v0.z
    };

    const normal = this.cross(edge1, edge2);
    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);

    if (length === 0) {
      return { x: 0, y: 1, z: 0 };
    }

    return {
      x: normal.x / length,
      y: normal.y / length,
      z: normal.z / length
    };
  }

  /**
   * Create selection box geometry
   * @param {Object} bounds - Selection bounds
   * @param {Object} options - Box options
   * @param {number} options.thickness - Line thickness
   * @returns {Object} Selection box geometry
   */
  static createSelectionBoxGeometry(bounds, options = {}) {
    const { thickness = 0.01 } = options;

    const { min, max } = bounds;
    const positions = [
      // Bottom face
      min.x, min.y, min.z, max.x, min.y, min.z,
      max.x, min.y, min.z, max.x, min.y, max.z,
      max.x, min.y, max.z, min.x, min.y, max.z,
      min.x, min.y, max.z, min.x, min.y, min.z,
      
      // Top face
      min.x, max.y, min.z, max.x, max.y, min.z,
      max.x, max.y, min.z, max.x, max.y, max.z,
      max.x, max.y, max.z, min.x, max.y, max.z,
      min.x, max.y, max.z, min.x, max.y, min.z,
      
      // Vertical edges
      min.x, min.y, min.z, min.x, max.y, min.z,
      max.x, min.y, min.z, max.x, max.y, min.z,
      max.x, min.y, max.z, max.x, max.y, max.z,
      min.x, min.y, max.z, min.x, max.y, max.z
    ];

    return {
      type: 'line',
      positions,
      attributes: {
        width: new Array(positions.length / 3).fill(thickness)
      }
    };
  }

  /**
   * Create selection rectangle geometry
   * @param {Object} bounds - Rectangle bounds
   * @param {Object} camera - Camera object
   * @param {Object} options - Rectangle options
   * @param {number} options.thickness - Line thickness
   * @returns {Object} Selection rectangle geometry
   */
  static createSelectionRectangleGeometry(bounds, camera, options = {}) {
    const { thickness = 0.01 } = options;

    const positions = [
      bounds.min.x, bounds.min.y, 0,
      bounds.max.x, bounds.min.y, 0,
      bounds.max.x, bounds.min.y, 0,
      bounds.max.x, bounds.max.y, 0,
      bounds.max.x, bounds.max.y, 0,
      bounds.min.x, bounds.max.y, 0,
      bounds.min.x, bounds.max.y, 0,
      bounds.min.x, bounds.min.y, 0
    ];

    return {
      type: 'line',
      positions,
      attributes: {
        width: new Array(positions.length / 3).fill(thickness)
      }
    };
  }

  /**
   * Create selection lasso geometry
   * @param {Array} points - Lasso points
   * @param {Object} options - Lasso options
   * @param {number} options.thickness - Line thickness
   * @returns {Object} Selection lasso geometry
   */
  static createSelectionLassoGeometry(points, options = {}) {
    const { thickness = 0.01 } = options;

    if (points.length < 2) {
      return { type: 'line', positions: [], indices: [] };
    }

    const positions = [];
    
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      
      positions.push(current.x, current.y, 0);
      positions.push(next.x, next.y, 0);
    }

    return {
      type: 'line',
      positions,
      attributes: {
        width: new Array(positions.length / 3).fill(thickness)
      }
    };
  }

  /**
   * Create selection indicator geometry
   * @param {Object} position - Indicator position
   * @param {Object} options - Indicator options
   * @param {number} options.size - Indicator size
   * @param {string} options.type - Indicator type ('vertex', 'edge', 'face')
   * @returns {Object} Selection indicator geometry
   */
  static createSelectionIndicatorGeometry(position, options = {}) {
    const {
      size = 0.1,
      type = 'vertex'
    } = options;

    let geometry;

    switch (type) {
      case 'vertex':
        geometry = this.createVertexIndicator(position, size);
        break;
      case 'edge':
        geometry = this.createEdgeIndicator(position, size);
        break;
      case 'face':
        geometry = this.createFaceIndicator(position, size);
        break;
      default:
        geometry = this.createVertexIndicator(position, size);
    }

    return geometry;
  }

  /**
   * Create vertex indicator geometry
   * @param {Object} position - Vertex position
   * @param {number} size - Indicator size
   * @returns {Object} Vertex indicator geometry
   */
  static createVertexIndicator(position, size) {
    return {
      type: 'sphere',
      radius: size,
      position: [position.x, position.y, position.z]
    };
  }

  /**
   * Create edge indicator geometry
   * @param {Object} position - Edge center position
   * @param {number} size - Indicator size
   * @returns {Object} Edge indicator geometry
   */
  static createEdgeIndicator(position, size) {
    return {
      type: 'cylinder',
      radius: size / 2,
      height: size,
      position: [position.x, position.y, position.z]
    };
  }

  /**
   * Create face indicator geometry
   * @param {Object} position - Face center position
   * @param {number} size - Indicator size
   * @returns {Object} Face indicator geometry
   */
  static createFaceIndicator(position, size) {
    return {
      type: 'box',
      size: [size, size, size * 0.1],
      position: [position.x, position.y, position.z]
    };
  }

  /**
   * Create transform gizmo geometry
   * @param {Object} position - Gizmo position
   * @param {Object} options - Gizmo options
   * @param {string} options.mode - Transform mode ('translate', 'rotate', 'scale')
   * @param {number} options.size - Gizmo size
   * @returns {Object} Transform gizmo geometry
   */
  static createTransformGizmoGeometry(position, options = {}) {
    const {
      mode = 'translate',
      size = 1.0
    } = options;

    let geometry;

    switch (mode) {
      case 'translate':
        geometry = this.createTranslateGizmo(position, size);
        break;
      case 'rotate':
        geometry = this.createRotateGizmo(position, size);
        break;
      case 'scale':
        geometry = this.createScaleGizmo(position, size);
        break;
      default:
        geometry = this.createTranslateGizmo(position, size);
    }

    return geometry;
  }

  /**
   * Create translate gizmo geometry
   * @param {Object} position - Gizmo position
   * @param {number} size - Gizmo size
   * @returns {Object} Translate gizmo geometry
   */
  static createTranslateGizmo(position, size) {
    const arrowLength = size * 0.8;
    const arrowWidth = size * 0.1;

    return {
      type: 'group',
      children: [
        {
          type: 'arrow',
          direction: [1, 0, 0],
          length: arrowLength,
          width: arrowWidth,
          color: { r: 1, g: 0, b: 0 },
          position: [position.x, position.y, position.z]
        },
        {
          type: 'arrow',
          direction: [0, 1, 0],
          length: arrowLength,
          width: arrowWidth,
          color: { r: 0, g: 1, b: 0 },
          position: [position.x, position.y, position.z]
        },
        {
          type: 'arrow',
          direction: [0, 0, 1],
          length: arrowLength,
          width: arrowWidth,
          color: { r: 0, g: 0, b: 1 },
          position: [position.x, position.y, position.z]
        }
      ]
    };
  }

  /**
   * Create rotate gizmo geometry
   * @param {Object} position - Gizmo position
   * @param {number} size - Gizmo size
   * @returns {Object} Rotate gizmo geometry
   */
  static createRotateGizmo(position, size) {
    const radius = size * 0.5;

    return {
      type: 'group',
      children: [
        {
          type: 'ring',
          radius,
          color: { r: 1, g: 0, b: 0 },
          position: [position.x, position.y, position.z],
          rotation: [0, 0, 0]
        },
        {
          type: 'ring',
          radius,
          color: { r: 0, g: 1, b: 0 },
          position: [position.x, position.y, position.z],
          rotation: [Math.PI / 2, 0, 0]
        },
        {
          type: 'ring',
          radius,
          color: { r: 0, g: 0, b: 1 },
          position: [position.x, position.y, position.z],
          rotation: [0, Math.PI / 2, 0]
        }
      ]
    };
  }

  /**
   * Create scale gizmo geometry
   * @param {Object} position - Gizmo position
   * @param {number} size - Gizmo size
   * @returns {Object} Scale gizmo geometry
   */
  static createScaleGizmo(position, size) {
    const cubeSize = size * 0.1;

    return {
      type: 'group',
      children: [
        {
          type: 'cube',
          size: [cubeSize, cubeSize, cubeSize],
          color: { r: 1, g: 0, b: 0 },
          position: [position.x + size * 0.5, position.y, position.z]
        },
        {
          type: 'cube',
          size: [cubeSize, cubeSize, cubeSize],
          color: { r: 0, g: 1, b: 0 },
          position: [position.x, position.y + size * 0.5, position.z]
        },
        {
          type: 'cube',
          size: [cubeSize, cubeSize, cubeSize],
          color: { r: 0, g: 0, b: 1 },
          position: [position.x, position.y, position.z + size * 0.5]
        }
      ]
    };
  }

  /**
   * Calculate cross product of two vectors
   * @param {Object} a - First vector
   * @param {Object} b - Second vector
   * @returns {Object} Cross product
   */
  static cross(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }
} 