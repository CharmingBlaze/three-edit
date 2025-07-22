/**
 * @fileoverview Mesh Selector
 * Mesh-specific selection operations and utilities
 */

import { EditableMesh } from '../EditableMesh.js';

/**
 * Mesh selection utilities and operations
 */
export class MeshSelector {
  /**
   * Select mesh vertices by raycasting
   * @param {Object} ray - Ray object {origin: {x,y,z}, direction: {x,y,z}}
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} options - Selection options
   * @param {number} options.threshold - Selection threshold distance
   * @param {boolean} options.selectNearest - Select nearest vertex only
   * @returns {Array} Selected vertex IDs
   */
  static selectVerticesByRay(ray, mesh, options = {}) {
    const {
      threshold = 0.1,
      selectNearest = true
    } = options;

    const selectedVertices = [];
    let nearestDistance = Infinity;
    let nearestVertex = null;

    mesh.vertices.forEach((vertex, id) => {
      const distance = this.raycastVertex(ray, vertex);
      
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
   * Raycast against a vertex
   * @param {Object} ray - Ray object
   * @param {Object} vertex - Vertex object
   * @returns {number|null} Distance to vertex or null
   */
  static raycastVertex(ray, vertex) {
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
   * Select mesh edges by raycasting
   * @param {Object} ray - Ray object
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} options - Selection options
   * @param {number} options.threshold - Selection threshold distance
   * @param {boolean} options.selectNearest - Select nearest edge only
   * @returns {Array} Selected edge IDs
   */
  static selectEdgesByRay(ray, mesh, options = {}) {
    const {
      threshold = 0.1,
      selectNearest = true
    } = options;

    const selectedEdges = [];
    let nearestDistance = Infinity;
    let nearestEdge = null;

    mesh.edges.forEach((edge, id) => {
      const distance = this.raycastEdge(ray, edge, mesh);
      
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
   * Raycast against an edge
   * @param {Object} ray - Ray object
   * @param {Object} edge - Edge object
   * @param {EditableMesh} mesh - Parent mesh
   * @returns {number|null} Distance to edge or null
   */
  static raycastEdge(ray, edge, mesh) {
    const vertex1 = mesh.vertices.get(edge.vertexId1);
    const vertex2 = mesh.vertices.get(edge.vertexId2);
    
    if (!vertex1 || !vertex2) {return null;}

    // Calculate edge vector
    const edgeVector = {
      x: vertex2.x - vertex1.x,
      y: vertex2.y - vertex1.y,
      z: vertex2.z - vertex1.z
    };

    const rayVector = ray.direction;
    const toVertex1 = {
      x: vertex1.x - ray.origin.x,
      y: vertex1.y - ray.origin.y,
      z: vertex1.z - ray.origin.z
    };

    // Calculate cross products
    const cross1 = this.cross(rayVector, edgeVector);
    const cross2 = this.cross(toVertex1, edgeVector);
    const cross3 = this.cross(toVertex1, rayVector);

    const denominator = this.dot(cross1, cross1);
    if (Math.abs(denominator) < 1e-6) {return null;}

    const t = this.dot(cross2, cross1) / denominator;
    const u = this.dot(cross3, cross1) / denominator;

    // Check if intersection is on the edge
    if (u >= 0 && u <= 1 && t >= 0) {
      const intersection = {
        x: vertex1.x + u * edgeVector.x,
        y: vertex1.y + u * edgeVector.y,
        z: vertex1.z + u * edgeVector.z
      };

      const distance = this.distance(ray.origin, intersection);
      return distance;
    }

    return null;
  }

  /**
   * Select mesh faces by raycasting
   * @param {Object} ray - Ray object
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} options - Selection options
   * @param {boolean} options.selectNearest - Select nearest face only
   * @returns {Array} Selected face IDs
   */
  static selectFacesByRay(ray, mesh, options = {}) {
    const { selectNearest = true } = options;

    const selectedFaces = [];
    let nearestDistance = Infinity;
    let nearestFace = null;

    mesh.faces.forEach((face, id) => {
      const intersection = this.raycastFace(ray, face, mesh);
      
      if (intersection !== null) {
        if (selectNearest) {
          if (intersection.distance < nearestDistance) {
            nearestDistance = intersection.distance;
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
   * Raycast against a face
   * @param {Object} ray - Ray object
   * @param {Object} face - Face object
   * @param {EditableMesh} mesh - Parent mesh
   * @returns {Object|null} Intersection data or null
   */
  static raycastFace(ray, face, mesh) {
    if (face.vertexIds.length < 3) {return null;}

    // Get face vertices
    const vertices = face.vertexIds.map(id => mesh.vertices.get(id)).filter(v => v);
    if (vertices.length < 3) {return null;}

    // Calculate face normal
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
    const normalLength = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    
    if (normalLength === 0) {return null;}

    // Normalize normal
    normal.x /= normalLength;
    normal.y /= normalLength;
    normal.z /= normalLength;

    // Calculate ray-plane intersection
    const rayDirection = ray.direction;
    const rayOrigin = ray.origin;

    const denominator = normal.x * rayDirection.x +
                      normal.y * rayDirection.y +
                      normal.z * rayDirection.z;

    if (Math.abs(denominator) < 1e-6) {return null;}

    const toVertex = {
      x: v0.x - rayOrigin.x,
      y: v0.y - rayOrigin.y,
      z: v0.z - rayOrigin.z
    };

    const t = (normal.x * toVertex.x + normal.y * toVertex.y + normal.z * toVertex.z) / denominator;

    if (t < 0) {return null;}

    // Calculate intersection point
    const intersection = {
      x: rayOrigin.x + t * rayDirection.x,
      y: rayOrigin.y + t * rayDirection.y,
      z: rayOrigin.z + t * rayDirection.z
    };

    // Check if intersection is inside face (simplified - assumes convex face)
    if (this.pointInFace(intersection, vertices)) {
      return {
        point: intersection,
        distance: t,
        normal
      };
    }

    return null;
  }

  /**
   * Check if point is inside face
   * @param {Object} point - Point to test
   * @param {Array} vertices - Face vertices
   * @returns {boolean} True if point is inside face
   */
  static pointInFace(point, vertices) {
    // Simplified point-in-face test for convex faces
    // In a real implementation, you'd use proper winding number or barycentric coordinates
    
    for (let i = 0; i < vertices.length; i++) {
      const v1 = vertices[i];
      const v2 = vertices[(i + 1) % vertices.length];
      
      const edge = {
        x: v2.x - v1.x,
        y: v2.y - v1.y,
        z: v2.z - v1.z
      };
      
      const toPoint = {
        x: point.x - v1.x,
        y: point.y - v1.y,
        z: point.z - v1.z
      };
      
      const cross = this.cross(edge, toPoint);
      const dot = this.dot(cross, { x: 0, y: 0, z: 1 }); // Assuming face normal is up
      
      if (dot < 0) {return false;}
    }
    
    return true;
  }

  /**
   * Select vertices by rectangle
   * @param {Object} bounds - Rectangle bounds
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} camera - Camera object
   * @returns {Array} Selected vertex IDs
   */
  static selectVerticesByRectangle(bounds, mesh, camera) {
    const selectedVertices = [];

    mesh.vertices.forEach((vertex, id) => {
      const screenPoint = this.worldToScreen(vertex, camera);
      
      if (this.pointInRectangle(screenPoint, bounds)) {
        selectedVertices.push(id);
      }
    });

    return selectedVertices;
  }

  /**
   * Select edges by rectangle
   * @param {Object} bounds - Rectangle bounds
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} camera - Camera object
   * @returns {Array} Selected edge IDs
   */
  static selectEdgesByRectangle(bounds, mesh, camera) {
    const selectedEdges = [];

    mesh.edges.forEach((edge, id) => {
      const vertex1 = mesh.vertices.get(edge.vertexId1);
      const vertex2 = mesh.vertices.get(edge.vertexId2);
      
      if (vertex1 && vertex2) {
        const screenPoint1 = this.worldToScreen(vertex1, camera);
        const screenPoint2 = this.worldToScreen(vertex2, camera);
        
        if (this.lineIntersectsRectangle(screenPoint1, screenPoint2, bounds)) {
          selectedEdges.push(id);
        }
      }
    });

    return selectedEdges;
  }

  /**
   * Select faces by rectangle
   * @param {Object} bounds - Rectangle bounds
   * @param {EditableMesh} mesh - Target mesh
   * @param {Object} camera - Camera object
   * @returns {Array} Selected face IDs
   */
  static selectFacesByRectangle(bounds, mesh, camera) {
    const selectedFaces = [];

    mesh.faces.forEach((face, id) => {
      const vertices = face.vertexIds.map(id => mesh.vertices.get(id)).filter(v => v);
      
      if (vertices.length >= 3) {
        const screenPoints = vertices.map(vertex => this.worldToScreen(vertex, camera));
        
        if (this.polygonIntersectsRectangle(screenPoints, bounds)) {
          selectedFaces.push(id);
        }
      }
    });

    return selectedFaces;
  }

  /**
   * Convert world point to screen coordinates
   * @param {Object} worldPoint - World point
   * @param {Object} camera - Camera object
   * @returns {Object} Screen point
   */
  static worldToScreen(worldPoint, camera) {
    // Simplified world-to-screen conversion
    // In a real implementation, you'd use proper projection matrices
    
    const toCamera = {
      x: worldPoint.x - camera.position.x,
      y: worldPoint.y - camera.position.y,
      z: worldPoint.z - camera.position.z
    };

    const dot = toCamera.x * camera.direction.x +
                toCamera.y * camera.direction.y +
                toCamera.z * camera.direction.z;

    const projected = {
      x: toCamera.x - dot * camera.direction.x,
      y: toCamera.y - dot * camera.direction.y,
      z: toCamera.z - dot * camera.direction.z
    };

    return {
      x: projected.x * camera.fov,
      y: projected.y * camera.fov
    };
  }

  /**
   * Check if point is in rectangle
   * @param {Object} point - Point to test
   * @param {Object} bounds - Rectangle bounds
   * @returns {boolean} True if point is in rectangle
   */
  static pointInRectangle(point, bounds) {
    return point.x >= bounds.min.x && point.x <= bounds.max.x &&
           point.y >= bounds.min.y && point.y <= bounds.max.y;
  }

  /**
   * Check if line intersects rectangle
   * @param {Object} p1 - Line start point
   * @param {Object} p2 - Line end point
   * @param {Object} bounds - Rectangle bounds
   * @returns {boolean} True if line intersects rectangle
   */
  static lineIntersectsRectangle(p1, p2, bounds) {
    // Simplified line-rectangle intersection
    // Check if either endpoint is inside rectangle
    if (this.pointInRectangle(p1, bounds) || this.pointInRectangle(p2, bounds)) {
      return true;
    }

    // Check intersection with rectangle edges
    const edges = [
      { start: { x: bounds.min.x, y: bounds.min.y }, end: { x: bounds.max.x, y: bounds.min.y } },
      { start: { x: bounds.max.x, y: bounds.min.y }, end: { x: bounds.max.x, y: bounds.max.y } },
      { start: { x: bounds.max.x, y: bounds.max.y }, end: { x: bounds.min.x, y: bounds.max.y } },
      { start: { x: bounds.min.x, y: bounds.max.y }, end: { x: bounds.min.x, y: bounds.min.y } }
    ];

    return edges.some(edge => this.linesIntersect(p1, p2, edge.start, edge.end));
  }

  /**
   * Check if two lines intersect
   * @param {Object} a1 - First line start
   * @param {Object} a2 - First line end
   * @param {Object} b1 - Second line start
   * @param {Object} b2 - Second line end
   * @returns {boolean} True if lines intersect
   */
  static linesIntersect(a1, a2, b1, b2) {
    const det = (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x);
    
    if (Math.abs(det) < 1e-6) {return false;}
    
    const t = ((b1.x - a1.x) * (b2.y - b1.y) - (b1.y - a1.y) * (b2.x - b1.x)) / det;
    const u = ((a2.x - a1.x) * (b1.y - a1.y) - (a2.y - a1.y) * (b1.x - a1.x)) / det;
    
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  /**
   * Check if polygon intersects rectangle
   * @param {Array} polygon - Polygon points
   * @param {Object} bounds - Rectangle bounds
   * @returns {boolean} True if polygon intersects rectangle
   */
  static polygonIntersectsRectangle(polygon, bounds) {
    // Check if any polygon vertex is inside rectangle
    if (polygon.some(point => this.pointInRectangle(point, bounds))) {
      return true;
    }

    // Check if any polygon edge intersects rectangle
    for (let i = 0; i < polygon.length; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % polygon.length];
      
      if (this.lineIntersectsRectangle(p1, p2, bounds)) {
        return true;
      }
    }

    return false;
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

  /**
   * Calculate dot product of two vectors
   * @param {Object} a - First vector
   * @param {Object} b - Second vector
   * @returns {number} Dot product
   */
  static dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  /**
   * Calculate distance between two points
   * @param {Object} a - First point
   * @param {Object} b - Second point
   * @returns {number} Distance
   */
  static distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
} 