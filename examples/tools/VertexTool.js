/**
 * VertexTool - Handles vertex operations
 */

import * as THREE from 'three';

export default class VertexTool {
  constructor(editor) {
    this.editor = editor;
    this.selectedVertices = new Set();
    this.vertexHelpers = [];
  }

  // Select vertex by raycasting
  selectVertexByRaycast(raycaster, object) {
    if (!object || !object.geometry) return null;

    const intersects = raycaster.intersectObject(object);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const face = intersect.face;
      const vertexIndex = face.a; // Use first vertex of face
      return { object, vertexIndex, position: intersect.point };
    }

    return null;
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

  // Set vertex position
  setVertexPosition(object, vertexIndex, position) {
    if (!object || !object.geometry) return false;

    const positionAttribute = object.geometry.getAttribute('position');
    if (positionAttribute && vertexIndex < positionAttribute.count) {
      positionAttribute.setXYZ(vertexIndex, position.x, position.y, position.z);
      positionAttribute.needsUpdate = true;
      object.geometry.computeVertexNormals();
      return true;
    }

    return false;
  }

  // Move vertex
  moveVertex(object, vertexIndex, delta) {
    const currentPosition = this.getVertexPosition(object, vertexIndex);
    if (currentPosition) {
      const newPosition = currentPosition.add(delta);
      return this.setVertexPosition(object, vertexIndex, newPosition);
    }
    return false;
  }

  // Get connected vertices
  getConnectedVertices(object, vertexIndex) {
    if (!object || !object.geometry) return [];

    const geometry = object.geometry;
    const indexAttribute = geometry.index;
    const connected = new Set();

    if (indexAttribute) {
      for (let i = 0; i < indexAttribute.count; i += 3) {
        const a = indexAttribute.getX(i);
        const b = indexAttribute.getX(i + 1);
        const c = indexAttribute.getX(i + 2);

        if (a === vertexIndex) {
          connected.add(b);
          connected.add(c);
        } else if (b === vertexIndex) {
          connected.add(a);
          connected.add(c);
        } else if (c === vertexIndex) {
          connected.add(a);
          connected.add(b);
        }
      }
    }

    return Array.from(connected);
  }

  // Get vertex neighbors (including diagonal connections)
  getVertexNeighbors(object, vertexIndex) {
    if (!object || !object.geometry) return [];

    const geometry = object.geometry;
    const indexAttribute = geometry.index;
    const neighbors = new Set();

    if (indexAttribute) {
      for (let i = 0; i < indexAttribute.count; i += 3) {
        const a = indexAttribute.getX(i);
        const b = indexAttribute.getX(i + 1);
        const c = indexAttribute.getX(i + 2);

        if (a === vertexIndex || b === vertexIndex || c === vertexIndex) {
          neighbors.add(a);
          neighbors.add(b);
          neighbors.add(c);
        }
      }
    }

    neighbors.delete(vertexIndex);
    return Array.from(neighbors);
  }

  // Weld vertices (merge close vertices)
  weldVertices(object, threshold = 0.01) {
    if (!object || !object.geometry) return false;

    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.index;

    if (!positionAttribute || !indexAttribute) return false;

    const vertexCount = positionAttribute.count;
    const weldedVertices = new Map();
    const newPositions = [];
    const newIndices = [];

    // Find vertices to weld
    for (let i = 0; i < vertexCount; i++) {
      const pos = new THREE.Vector3(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      );

      let welded = false;
      for (const [existingIndex, existingPos] of weldedVertices) {
        if (pos.distanceTo(existingPos) < threshold) {
          weldedVertices.set(i, existingIndex);
          welded = true;
          break;
        }
      }

      if (!welded) {
        weldedVertices.set(i, newPositions.length);
        newPositions.push(pos.x, pos.y, pos.z);
      }
    }

    // Update indices
    for (let i = 0; i < indexAttribute.count; i++) {
      const oldIndex = indexAttribute.getX(i);
      const newIndex = weldedVertices.get(oldIndex);
      newIndices.push(newIndex);
    }

    // Create new geometry
    const newGeometry = new THREE.BufferGeometry();
    newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    newGeometry.setIndex(newIndices);
    newGeometry.computeVertexNormals();

    object.geometry = newGeometry;
    return true;
  }

  // Split vertex (create new vertex at same position)
  splitVertex(object, vertexIndex) {
    if (!object || !object.geometry) return false;

    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.index;

    if (!positionAttribute || !indexAttribute) return false;

    const vertexPosition = this.getVertexPosition(object, vertexIndex);
    if (!vertexPosition) return false;

    // Add new vertex
    const newVertexIndex = positionAttribute.count;
    const newPositions = new Float32Array(positionAttribute.count + 1);
    newPositions.set(positionAttribute.array);
    newPositions[newVertexIndex * 3] = vertexPosition.x;
    newPositions[newVertexIndex * 3 + 1] = vertexPosition.y;
    newPositions[newVertexIndex * 3 + 2] = vertexPosition.z;

    // Update geometry
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    geometry.computeVertexNormals();

    return newVertexIndex;
  }

  // Create vertex helper
  createVertexHelper(object, vertexIndex, color = 0xff0000) {
    const position = this.getVertexPosition(object, vertexIndex);
    if (!position) return null;

    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const helper = new THREE.Mesh(geometry, material);

    // Transform to world position
    const worldPosition = new THREE.Vector3();
    worldPosition.setFromMatrixPosition(object.matrixWorld);
    worldPosition.add(position);
    helper.position.copy(worldPosition);

    return helper;
  }

  // Show vertex helpers
  showVertexHelpers(object, vertexIndices = []) {
    this.clearVertexHelpers();

    if (vertexIndices.length === 0) {
      // Show all vertices
      const positionAttribute = object.geometry.getAttribute('position');
      for (let i = 0; i < positionAttribute.count; i++) {
        const helper = this.createVertexHelper(object, i);
        if (helper) {
          this.vertexHelpers.push(helper);
          this.editor.sceneManager.scene.add(helper);
        }
      }
    } else {
      // Show selected vertices
      for (const vertexIndex of vertexIndices) {
        const helper = this.createVertexHelper(object, vertexIndex, 0x00ff00);
        if (helper) {
          this.vertexHelpers.push(helper);
          this.editor.sceneManager.scene.add(helper);
        }
      }
    }
  }

  // Clear vertex helpers
  clearVertexHelpers() {
    this.vertexHelpers.forEach(helper => {
      this.editor.sceneManager.scene.remove(helper);
    });
    this.vertexHelpers = [];
  }

  // Get vertex count
  getVertexCount(object) {
    if (!object || !object.geometry) return 0;
    const positionAttribute = object.geometry.getAttribute('position');
    return positionAttribute ? positionAttribute.count : 0;
  }

  // Get vertex statistics
  getVertexStatistics(object) {
    if (!object || !object.geometry) return null;

    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.index;

    return {
      vertexCount: positionAttribute ? positionAttribute.count : 0,
      faceCount: indexAttribute ? indexAttribute.count / 3 : 0,
      edgeCount: indexAttribute ? indexAttribute.count / 2 : 0
    };
  }

  // Apply vertex operations to selected objects
  applyToSelected(operation, ...args) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const results = [];

    selected.forEach(obj => {
      if (operation === 'weld') {
        const welded = this.weldVertices(obj, ...args);
        results.push({ object: obj, success: welded });
      }
    });

    return results;
  }

  // Get supported vertex operations
  getSupportedOperations() {
    return ['select', 'move', 'weld', 'split', 'connect'];
  }

  // Get operation description
  getOperationDescription(operation) {
    const descriptions = {
      select: 'Select vertices by clicking',
      move: 'Move selected vertices',
      weld: 'Merge close vertices',
      split: 'Split vertex into multiple vertices',
      connect: 'Connect vertices with edges'
    };
    
    return descriptions[operation] || 'Unknown operation';
  }
}
