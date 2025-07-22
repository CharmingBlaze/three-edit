/**
 * NormalsTool - Handles normal operations
 */

import * as THREE from 'three';

export default class NormalsTool {
  constructor(editor) {
    this.editor = editor;
    this.normalHelpers = [];
  }

  // Compute vertex normals
  computeVertexNormals(object) {
    if (!object || !object.geometry) return false;

    object.geometry.computeVertexNormals();
    return true;
  }

  // Compute face normals
  computeFaceNormals(object) {
    if (!object || !object.geometry) return false;

    object.geometry.computeVertexNormals();
    return true;
  }

  // Flip normals
  flipNormals(object) {
    if (!object || !object.geometry) return false;

    const geometry = object.geometry;
    const normalAttribute = geometry.getAttribute('normal');

    if (normalAttribute) {
      const normals = normalAttribute.array;
      for (let i = 0; i < normals.length; i += 3) {
        normals[i] *= -1;
        normals[i + 1] *= -1;
        normals[i + 2] *= -1;
      }
      normalAttribute.needsUpdate = true;
    }

    return true;
  }

  // Set normals to face normals
  setNormalsToFaceNormals(object) {
    if (!object || !object.geometry) return false;

    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.index;

    if (!positionAttribute || !indexAttribute) return false;

    // Create new normal attribute
    const normalAttribute = new THREE.BufferAttribute(
      new Float32Array(positionAttribute.count * 3),
      3
    );

    // Calculate face normals
    for (let i = 0; i < indexAttribute.count; i += 3) {
      const a = indexAttribute.getX(i);
      const b = indexAttribute.getX(i + 1);
      const c = indexAttribute.getX(i + 2);

      const posA = new THREE.Vector3(
        positionAttribute.getX(a),
        positionAttribute.getY(a),
        positionAttribute.getZ(a)
      );
      const posB = new THREE.Vector3(
        positionAttribute.getX(b),
        positionAttribute.getY(b),
        positionAttribute.getZ(b)
      );
      const posC = new THREE.Vector3(
        positionAttribute.getX(c),
        positionAttribute.getY(c),
        positionAttribute.getZ(c)
      );

      const v1 = new THREE.Vector3().subVectors(posB, posA);
      const v2 = new THREE.Vector3().subVectors(posC, posA);
      const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();

      // Set normal for all vertices of this face
      normalAttribute.setXYZ(a, normal.x, normal.y, normal.z);
      normalAttribute.setXYZ(b, normal.x, normal.y, normal.z);
      normalAttribute.setXYZ(c, normal.x, normal.y, normal.z);
    }

    geometry.setAttribute('normal', normalAttribute);
    return true;
  }

  // Average normals
  averageNormals(object) {
    if (!object || !object.geometry) return false;

    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.index;

    if (!positionAttribute || !indexAttribute) return false;

    // Create vertex to faces mapping
    const vertexFaces = new Map();
    for (let i = 0; i < indexAttribute.count; i += 3) {
      const a = indexAttribute.getX(i);
      const b = indexAttribute.getX(i + 1);
      const c = indexAttribute.getX(i + 2);

      [a, b, c].forEach(vertexIndex => {
        if (!vertexFaces.has(vertexIndex)) {
          vertexFaces.set(vertexIndex, []);
        }
        vertexFaces.get(vertexIndex).push(i / 3);
      });
    }

    // Calculate averaged normals
    const normalAttribute = new THREE.BufferAttribute(
      new Float32Array(positionAttribute.count * 3),
      3
    );

    for (const [vertexIndex, faceIndices] of vertexFaces) {
      const averageNormal = new THREE.Vector3();

      faceIndices.forEach(faceIndex => {
        const a = indexAttribute.getX(faceIndex * 3);
        const b = indexAttribute.getX(faceIndex * 3 + 1);
        const c = indexAttribute.getX(faceIndex * 3 + 2);

        const posA = new THREE.Vector3(
          positionAttribute.getX(a),
          positionAttribute.getY(a),
          positionAttribute.getZ(a)
        );
        const posB = new THREE.Vector3(
          positionAttribute.getX(b),
          positionAttribute.getY(b),
          positionAttribute.getZ(b)
        );
        const posC = new THREE.Vector3(
          positionAttribute.getX(c),
          positionAttribute.getY(c),
          positionAttribute.getZ(c)
        );

        const v1 = new THREE.Vector3().subVectors(posB, posA);
        const v2 = new THREE.Vector3().subVectors(posC, posA);
        const faceNormal = new THREE.Vector3().crossVectors(v1, v2).normalize();

        averageNormal.add(faceNormal);
      });

      averageNormal.normalize();
      normalAttribute.setXYZ(vertexIndex, averageNormal.x, averageNormal.y, averageNormal.z);
    }

    geometry.setAttribute('normal', normalAttribute);
    return true;
  }

  // Create normal helpers
  createNormalHelpers(object, length = 0.1, color = 0xff0000) {
    this.clearNormalHelpers();

    if (!object || !object.geometry) return;

    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const normalAttribute = geometry.getAttribute('normal');

    if (!positionAttribute || !normalAttribute) return;

    for (let i = 0; i < positionAttribute.count; i++) {
      const position = new THREE.Vector3(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      );

      const normal = new THREE.Vector3(
        normalAttribute.getX(i),
        normalAttribute.getY(i),
        normalAttribute.getZ(i)
      );

      // Create arrow helper
      const arrowHelper = new THREE.ArrowHelper(
        normal,
        position,
        length,
        color
      );

      // Transform to world position
      arrowHelper.applyMatrix4(object.matrixWorld);

      this.normalHelpers.push(arrowHelper);
      this.editor.sceneManager.scene.add(arrowHelper);
    }
  }

  // Create face normal helpers
  createFaceNormalHelpers(object, length = 0.1, color = 0x00ff00) {
    this.clearNormalHelpers();

    if (!object || !object.geometry) return;

    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.index;

    if (!positionAttribute || !indexAttribute) return;

    for (let i = 0; i < indexAttribute.count; i += 3) {
      const a = indexAttribute.getX(i);
      const b = indexAttribute.getX(i + 1);
      const c = indexAttribute.getX(i + 2);

      const posA = new THREE.Vector3(
        positionAttribute.getX(a),
        positionAttribute.getY(a),
        positionAttribute.getZ(a)
      );
      const posB = new THREE.Vector3(
        positionAttribute.getX(b),
        positionAttribute.getY(b),
        positionAttribute.getZ(b)
      );
      const posC = new THREE.Vector3(
        positionAttribute.getX(c),
        positionAttribute.getY(c),
        positionAttribute.getZ(c)
      );

      // Calculate face center
      const center = new THREE.Vector3()
        .add(posA)
        .add(posB)
        .add(posC)
        .multiplyScalar(1/3);

      // Calculate face normal
      const v1 = new THREE.Vector3().subVectors(posB, posA);
      const v2 = new THREE.Vector3().subVectors(posC, posA);
      const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();

      // Create arrow helper
      const arrowHelper = new THREE.ArrowHelper(
        normal,
        center,
        length,
        color
      );

      // Transform to world position
      arrowHelper.applyMatrix4(object.matrixWorld);

      this.normalHelpers.push(arrowHelper);
      this.editor.sceneManager.scene.add(arrowHelper);
    }
  }

  // Clear normal helpers
  clearNormalHelpers() {
    this.normalHelpers.forEach(helper => {
      this.editor.sceneManager.scene.remove(helper);
    });
    this.normalHelpers = [];
  }

  // Get normal statistics
  getNormalStatistics(object) {
    if (!object || !object.geometry) return null;

    const geometry = object.geometry;
    const normalAttribute = geometry.getAttribute('normal');

    if (!normalAttribute) return null;

    let minLength = Infinity;
    let maxLength = 0;
    let totalLength = 0;

    for (let i = 0; i < normalAttribute.count; i++) {
      const x = normalAttribute.getX(i);
      const y = normalAttribute.getY(i);
      const z = normalAttribute.getZ(i);
      const length = Math.sqrt(x * x + y * y + z * z);

      minLength = Math.min(minLength, length);
      maxLength = Math.max(maxLength, length);
      totalLength += length;
    }

    return {
      normalCount: normalAttribute.count,
      minLength: minLength,
      maxLength: maxLength,
      averageLength: totalLength / normalAttribute.count
    };
  }

  // Apply normal operations to selected objects
  applyToSelected(operation, ...args) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const results = [];

    selected.forEach(obj => {
      let success = false;
      
      switch (operation) {
        case 'computeVertexNormals':
          success = this.computeVertexNormals(obj);
          break;
        case 'computeFaceNormals':
          success = this.computeFaceNormals(obj);
          break;
        case 'flipNormals':
          success = this.flipNormals(obj);
          break;
        case 'setToFaceNormals':
          success = this.setNormalsToFaceNormals(obj);
          break;
        case 'averageNormals':
          success = this.averageNormals(obj);
          break;
      }

      results.push({ object: obj, success });
    });

    return results;
  }

  // Get supported normal operations
  getSupportedOperations() {
    return ['computeVertexNormals', 'computeFaceNormals', 'flipNormals', 'setToFaceNormals', 'averageNormals'];
  }

  // Get operation description
  getOperationDescription(operation) {
    const descriptions = {
      computeVertexNormals: 'Compute smooth vertex normals',
      computeFaceNormals: 'Compute face normals',
      flipNormals: 'Flip all normals',
      setToFaceNormals: 'Set vertex normals to face normals',
      averageNormals: 'Average normals at vertices'
    };
    
    return descriptions[operation] || 'Unknown operation';
  }
}
