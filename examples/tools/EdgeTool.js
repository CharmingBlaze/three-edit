/**
 * EdgeTool - Handles edge operations
 */

import * as THREE from 'three';

export default class EdgeTool {
  constructor(editor) {
    this.editor = editor;
    this.selectedEdges = new Set();
    this.edgeHelpers = [];
  }

  // Get edge from face indices
  getEdge(face, edgeIndex) {
    const indices = [face.a, face.b, face.c];
    const edge = [
      indices[edgeIndex],
      indices[(edgeIndex + 1) % 3]
    ];
    return edge.sort((a, b) => a - b); // Sort for consistent edge representation
  }

  // Get all edges from geometry
  getAllEdges(object) {
    if (!object || !object.geometry) return [];

    const geometry = object.geometry;
    const indexAttribute = geometry.index;
    const edges = new Set();

    if (indexAttribute) {
      for (let i = 0; i < indexAttribute.count; i += 3) {
        const a = indexAttribute.getX(i);
        const b = indexAttribute.getX(i + 1);
        const c = indexAttribute.getX(i + 2);

        // Add all edges of this face
        edges.add([Math.min(a, b), Math.max(a, b)].join(','));
        edges.add([Math.min(b, c), Math.max(b, c)].join(','));
        edges.add([Math.min(c, a), Math.max(c, a)].join(','));
      }
    }

    return Array.from(edges).map(edge => edge.split(',').map(Number));
  }

  // Get edge length
  getEdgeLength(object, edge) {
    const [v1, v2] = edge;
    const pos1 = this.getVertexPosition(object, v1);
    const pos2 = this.getVertexPosition(object, v2);

    if (pos1 && pos2) {
      return pos1.distanceTo(pos2);
    }

    return 0;
  }

  // Get vertex position
  getVertexPosition(object, vertexIndex) {
    if (!object || !object.geometry) return null;

    const positionAttribute = object.geometry.getAttribute('position');
    if (positionAttribute && vertexIndex < positionAttribute.count) {
      return new THREE.Vector3(
        positionAttribute.getX(vertexIndex),
        positionAttribute.getY(vertexIndex),
        positionAttribute.getZ(vertexIndex)
      );
    }

    return null;
  }

  // Get edge center
  getEdgeCenter(object, edge) {
    const [v1, v2] = edge;
    const pos1 = this.getVertexPosition(object, v1);
    const pos2 = this.getVertexPosition(object, v2);

    if (pos1 && pos2) {
      return new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);
    }

    return null;
  }

  // Get edge direction
  getEdgeDirection(object, edge) {
    const [v1, v2] = edge;
    const pos1 = this.getVertexPosition(object, v1);
    const pos2 = this.getVertexPosition(object, v2);

    if (pos1 && pos2) {
      return new THREE.Vector3().subVectors(pos2, pos1).normalize();
    }

    return null;
  }

  // Select edge by raycasting
  selectEdgeByRaycast(raycaster, object) {
    if (!object || !object.geometry) return null;

    const intersects = raycaster.intersectObject(object);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const face = intersect.face;
      const edgeIndex = this.getClosestEdgeIndex(intersect.point, face, object);
      const edge = this.getEdge(face, edgeIndex);
      return { object, edge, position: intersect.point };
    }

    return null;
  }

  // Get closest edge index
  getClosestEdgeIndex(point, face, object) {
    const edges = [
      this.getEdge(face, 0),
      this.getEdge(face, 1),
      this.getEdge(face, 2)
    ];

    let closestEdge = 0;
    let minDistance = Infinity;

    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const edgeCenter = this.getEdgeCenter(object, edge);
      if (edgeCenter) {
        const distance = point.distanceTo(edgeCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestEdge = i;
        }
      }
    }

    return closestEdge;
  }

  // Bevel edge
  bevelEdge(object, edge, amount = 0.1) {
    if (!object || !object.geometry) return false;

    const [v1, v2] = edge;
    const pos1 = this.getVertexPosition(object, v1);
    const pos2 = this.getVertexPosition(object, v2);

    if (!pos1 || !pos2) return false;

    // Create new vertices at beveled positions
    const direction = new THREE.Vector3().subVectors(pos2, pos1).normalize();
    const perpendicular = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();

    const newPos1 = pos1.clone().add(perpendicular.clone().multiplyScalar(amount));
    const newPos2 = pos2.clone().add(perpendicular.clone().multiplyScalar(amount));

    // Add new vertices to geometry
    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const newVertexCount = positionAttribute.count + 2;

    const newPositions = new Float32Array(newVertexCount * 3);
    newPositions.set(positionAttribute.array);
    newPositions[newVertexCount * 3 - 6] = newPos1.x;
    newPositions[newVertexCount * 3 - 5] = newPos1.y;
    newPositions[newVertexCount * 3 - 4] = newPos1.z;
    newPositions[newVertexCount * 3 - 3] = newPos2.x;
    newPositions[newVertexCount * 3 - 2] = newPos2.y;
    newPositions[newVertexCount * 3 - 1] = newPos2.z;

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    geometry.computeVertexNormals();

    return true;
  }

  // Extrude edge
  extrudeEdge(object, edge, distance = 0.5) {
    if (!object || !object.geometry) return false;

    const [v1, v2] = edge;
    const pos1 = this.getVertexPosition(object, v1);
    const pos2 = this.getVertexPosition(object, v2);

    if (!pos1 || !pos2) return false;

    // Calculate extrusion direction (perpendicular to edge)
    const edgeDirection = new THREE.Vector3().subVectors(pos2, pos1).normalize();
    const extrusionDirection = new THREE.Vector3().crossVectors(edgeDirection, new THREE.Vector3(0, 1, 0)).normalize();

    // Create extruded vertices
    const extrudedPos1 = pos1.clone().add(extrusionDirection.clone().multiplyScalar(distance));
    const extrudedPos2 = pos2.clone().add(extrusionDirection.clone().multiplyScalar(distance));

    // Add new vertices to geometry
    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const newVertexCount = positionAttribute.count + 2;

    const newPositions = new Float32Array(newVertexCount * 3);
    newPositions.set(positionAttribute.array);
    newPositions[newVertexCount * 3 - 6] = extrudedPos1.x;
    newPositions[newVertexCount * 3 - 5] = extrudedPos1.y;
    newPositions[newVertexCount * 3 - 4] = extrudedPos1.z;
    newPositions[newVertexCount * 3 - 3] = extrudedPos2.x;
    newPositions[newVertexCount * 3 - 2] = extrudedPos2.y;
    newPositions[newVertexCount * 3 - 1] = extrudedPos2.z;

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    geometry.computeVertexNormals();

    return true;
  }

  // Split edge
  splitEdge(object, edge) {
    if (!object || !object.geometry) return false;

    const [v1, v2] = edge;
    const pos1 = this.getVertexPosition(object, v1);
    const pos2 = this.getVertexPosition(object, v2);

    if (!pos1 || !pos2) return false;

    // Create new vertex at edge center
    const center = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);

    // Add new vertex to geometry
    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const newVertexIndex = positionAttribute.count;

    const newPositions = new Float32Array((newVertexIndex + 1) * 3);
    newPositions.set(positionAttribute.array);
    newPositions[newVertexIndex * 3] = center.x;
    newPositions[newVertexIndex * 3 + 1] = center.y;
    newPositions[newVertexIndex * 3 + 2] = center.z;

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    geometry.computeVertexNormals();

    return newVertexIndex;
  }

  // Create edge helper
  createEdgeHelper(object, edge, color = 0x00ff00) {
    const [v1, v2] = edge;
    const pos1 = this.getVertexPosition(object, v1);
    const pos2 = this.getVertexPosition(object, v2);

    if (!pos1 || !pos2) return null;

    // Create line geometry
    const geometry = new THREE.BufferGeometry().setFromPoints([pos1, pos2]);
    const material = new THREE.LineBasicMaterial({ color: color, linewidth: 3 });
    const helper = new THREE.Line(geometry, material);

    // Transform to world position
    helper.applyMatrix4(object.matrixWorld);

    return helper;
  }

  // Show edge helpers
  showEdgeHelpers(object, edges = []) {
    this.clearEdgeHelpers();

    if (edges.length === 0) {
      // Show all edges
      const allEdges = this.getAllEdges(object);
      for (const edge of allEdges) {
        const helper = this.createEdgeHelper(object, edge);
        if (helper) {
          this.edgeHelpers.push(helper);
          this.editor.sceneManager.scene.add(helper);
        }
      }
    } else {
      // Show selected edges
      for (const edge of edges) {
        const helper = this.createEdgeHelper(object, edge, 0xff0000);
        if (helper) {
          this.edgeHelpers.push(helper);
          this.editor.sceneManager.scene.add(helper);
        }
      }
    }
  }

  // Clear edge helpers
  clearEdgeHelpers() {
    this.edgeHelpers.forEach(helper => {
      this.editor.sceneManager.scene.remove(helper);
    });
    this.edgeHelpers = [];
  }

  // Get edge count
  getEdgeCount(object) {
    return this.getAllEdges(object).length;
  }

  // Get edge statistics
  getEdgeStatistics(object) {
    const edges = this.getAllEdges(object);
    let totalLength = 0;

    for (const edge of edges) {
      totalLength += this.getEdgeLength(object, edge);
    }

    return {
      edgeCount: edges.length,
      totalLength: totalLength,
      averageLength: edges.length > 0 ? totalLength / edges.length : 0
    };
  }

  // Apply edge operations to selected objects
  applyToSelected(operation, ...args) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const results = [];

    selected.forEach(obj => {
      const edges = this.getAllEdges(obj);
      for (const edge of edges) {
        let success = false;
        
        switch (operation) {
          case 'bevel':
            success = this.bevelEdge(obj, edge, ...args);
            break;
          case 'extrude':
            success = this.extrudeEdge(obj, edge, ...args);
            break;
          case 'split':
            success = this.splitEdge(obj, edge) !== false;
            break;
        }

        results.push({ object: obj, edge, success });
      }
    });

    return results;
  }

  // Get supported edge operations
  getSupportedOperations() {
    return ['select', 'bevel', 'extrude', 'split', 'measure'];
  }

  // Get operation description
  getOperationDescription(operation) {
    const descriptions = {
      select: 'Select edges by clicking',
      bevel: 'Add bevel to selected edges',
      extrude: 'Extrude selected edges',
      split: 'Split edge at center point',
      measure: 'Measure edge length'
    };
    
    return descriptions[operation] || 'Unknown operation';
  }
}
