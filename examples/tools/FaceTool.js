/**
 * FaceTool - Handles face operations
 */

import * as THREE from 'three';

export default class FaceTool {
  constructor(editor) {
    this.editor = editor;
    this.selectedFaces = new Set();
    this.faceHelpers = [];
  }

  // Get face from geometry
  getFace(object, faceIndex) {
    if (!object || !object.geometry) return null;

    const geometry = object.geometry;
    const indexAttribute = geometry.index;

    if (!indexAttribute || faceIndex * 3 >= indexAttribute.count) return null;

    const a = indexAttribute.getX(faceIndex * 3);
    const b = indexAttribute.getX(faceIndex * 3 + 1);
    const c = indexAttribute.getX(faceIndex * 3 + 2);

    return { a, b, c, faceIndex };
  }

  // Get all faces from geometry
  getAllFaces(object) {
    if (!object || !object.geometry) return [];

    const geometry = object.geometry;
    const indexAttribute = geometry.index;

    if (!indexAttribute) return [];

    const faces = [];
    const faceCount = indexAttribute.count / 3;

    for (let i = 0; i < faceCount; i++) {
      const face = this.getFace(object, i);
      if (face) {
        faces.push(face);
      }
    }

    return faces;
  }

  // Get face center
  getFaceCenter(object, face) {
    const pos1 = this.getVertexPosition(object, face.a);
    const pos2 = this.getVertexPosition(object, face.b);
    const pos3 = this.getVertexPosition(object, face.c);

    if (pos1 && pos2 && pos3) {
      return new THREE.Vector3()
        .add(pos1)
        .add(pos2)
        .add(pos3)
        .multiplyScalar(1/3);
    }

    return null;
  }

  // Get face normal
  getFaceNormal(object, face) {
    const pos1 = this.getVertexPosition(object, face.a);
    const pos2 = this.getVertexPosition(object, face.b);
    const pos3 = this.getVertexPosition(object, face.c);

    if (pos1 && pos2 && pos3) {
      const v1 = new THREE.Vector3().subVectors(pos2, pos1);
      const v2 = new THREE.Vector3().subVectors(pos3, pos1);
      return new THREE.Vector3().crossVectors(v1, v2).normalize();
    }

    return null;
  }

  // Get face area
  getFaceArea(object, face) {
    const pos1 = this.getVertexPosition(object, face.a);
    const pos2 = this.getVertexPosition(object, face.b);
    const pos3 = this.getVertexPosition(object, face.c);

    if (pos1 && pos2 && pos3) {
      const v1 = new THREE.Vector3().subVectors(pos2, pos1);
      const v2 = new THREE.Vector3().subVectors(pos3, pos1);
      const cross = new THREE.Vector3().crossVectors(v1, v2);
      return cross.length() * 0.5;
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

  // Select face by raycasting
  selectFaceByRaycast(raycaster, object) {
    if (!object || !object.geometry) return null;

    const intersects = raycaster.intersectObject(object);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const faceIndex = intersect.faceIndex;
      const face = this.getFace(object, faceIndex);
      return { object, face, position: intersect.point };
    }

    return null;
  }

  // Extrude face
  extrudeFace(object, face, distance = 0.5) {
    if (!object || !object.geometry) return false;

    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.index;

    if (!positionAttribute || !indexAttribute) return false;

    // Get face vertices
    const pos1 = this.getVertexPosition(object, face.a);
    const pos2 = this.getVertexPosition(object, face.b);
    const pos3 = this.getVertexPosition(object, face.c);

    if (!pos1 || !pos2 || !pos3) return false;

    // Calculate face normal
    const normal = this.getFaceNormal(object, face);
    if (!normal) return false;

    // Create extruded vertices
    const extrudedPos1 = pos1.clone().add(normal.clone().multiplyScalar(distance));
    const extrudedPos2 = pos2.clone().add(normal.clone().multiplyScalar(distance));
    const extrudedPos3 = pos3.clone().add(normal.clone().multiplyScalar(distance));

    // Add new vertices to geometry
    const newVertexCount = positionAttribute.count + 3;
    const newPositions = new Float32Array(newVertexCount * 3);
    newPositions.set(positionAttribute.array);
    
    newPositions[newVertexCount * 3 - 9] = extrudedPos1.x;
    newPositions[newVertexCount * 3 - 8] = extrudedPos1.y;
    newPositions[newVertexCount * 3 - 7] = extrudedPos1.z;
    newPositions[newVertexCount * 3 - 6] = extrudedPos2.x;
    newPositions[newVertexCount * 3 - 5] = extrudedPos2.y;
    newPositions[newVertexCount * 3 - 4] = extrudedPos2.z;
    newPositions[newVertexCount * 3 - 3] = extrudedPos3.x;
    newPositions[newVertexCount * 3 - 2] = extrudedPos3.y;
    newPositions[newVertexCount * 3 - 1] = extrudedPos3.z;

    // Add new faces (sides of extrusion)
    const newFaceCount = indexAttribute.count / 3 + 3; // Original face + 3 side faces
    const newIndices = new Uint32Array(newFaceCount * 3);
    newIndices.set(indexAttribute.array);

    const newVertexStart = positionAttribute.count;
    let newIndex = indexAttribute.count;

    // Side face 1: a, b, extruded_a
    newIndices[newIndex++] = face.a;
    newIndices[newIndex++] = face.b;
    newIndices[newIndex++] = newVertexStart;

    // Side face 2: b, c, extruded_b
    newIndices[newIndex++] = face.b;
    newIndices[newIndex++] = face.c;
    newIndices[newIndex++] = newVertexStart + 1;

    // Side face 3: c, a, extruded_c
    newIndices[newIndex++] = face.c;
    newIndices[newIndex++] = face.a;
    newIndices[newIndex++] = newVertexStart + 2;

    // Update geometry
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    geometry.setIndex(newIndices);
    geometry.computeVertexNormals();

    return true;
  }

  // Inset face
  insetFace(object, face, amount = 0.1) {
    if (!object || !object.geometry) return false;

    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.index;

    if (!positionAttribute || !indexAttribute) return false;

    // Get face center
    const center = this.getFaceCenter(object, face);
    if (!center) return false;

    // Get face vertices
    const pos1 = this.getVertexPosition(object, face.a);
    const pos2 = this.getVertexPosition(object, face.b);
    const pos3 = this.getVertexPosition(object, face.c);

    if (!pos1 || !pos2 || !pos3) return false;

    // Calculate inset positions
    const insetPos1 = pos1.clone().lerp(center, amount);
    const insetPos2 = pos2.clone().lerp(center, amount);
    const insetPos3 = pos3.clone().lerp(center, amount);

    // Add new vertices to geometry
    const newVertexCount = positionAttribute.count + 3;
    const newPositions = new Float32Array(newVertexCount * 3);
    newPositions.set(positionAttribute.array);
    
    newPositions[newVertexCount * 3 - 9] = insetPos1.x;
    newPositions[newVertexCount * 3 - 8] = insetPos1.y;
    newPositions[newVertexCount * 3 - 7] = insetPos1.z;
    newPositions[newVertexCount * 3 - 6] = insetPos2.x;
    newPositions[newVertexCount * 3 - 5] = insetPos2.y;
    newPositions[newVertexCount * 3 - 4] = insetPos2.z;
    newPositions[newVertexCount * 3 - 3] = insetPos3.x;
    newPositions[newVertexCount * 3 - 2] = insetPos3.y;
    newPositions[newVertexCount * 3 - 1] = insetPos3.z;

    // Add new faces
    const newFaceCount = indexAttribute.count / 3 + 3; // Original face + 3 side faces
    const newIndices = new Uint32Array(newFaceCount * 3);
    newIndices.set(indexAttribute.array);

    const newVertexStart = positionAttribute.count;
    let newIndex = indexAttribute.count;

    // Inset face
    newIndices[newIndex++] = newVertexStart;
    newIndices[newIndex++] = newVertexStart + 1;
    newIndices[newIndex++] = newVertexStart + 2;

    // Side face 1: a, b, inset_a
    newIndices[newIndex++] = face.a;
    newIndices[newIndex++] = face.b;
    newIndices[newIndex++] = newVertexStart;

    // Side face 2: b, c, inset_b
    newIndices[newIndex++] = face.b;
    newIndices[newIndex++] = face.c;
    newIndices[newIndex++] = newVertexStart + 1;

    // Side face 3: c, a, inset_c
    newIndices[newIndex++] = face.c;
    newIndices[newIndex++] = face.a;
    newIndices[newIndex++] = newVertexStart + 2;

    // Update geometry
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    geometry.setIndex(newIndices);
    geometry.computeVertexNormals();

    return true;
  }

  // Flip face normal
  flipFaceNormal(object, face) {
    if (!object || !object.geometry) return false;

    const geometry = object.geometry;
    const indexAttribute = geometry.index;

    if (!indexAttribute) return false;

    // Swap two vertices to flip the face normal
    const indices = new Uint32Array(indexAttribute.array);
    const faceStart = face.faceIndex * 3;
    
    // Swap b and c
    const temp = indices[faceStart + 1];
    indices[faceStart + 1] = indices[faceStart + 2];
    indices[faceStart + 2] = temp;

    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    return true;
  }

  // Delete face
  deleteFace(object, face) {
    if (!object || !object.geometry) return false;

    const geometry = object.geometry;
    const indexAttribute = geometry.index;

    if (!indexAttribute) return false;

    // Create new index array without the face
    const newIndices = new Uint32Array(indexAttribute.count - 3);
    let newIndex = 0;

    for (let i = 0; i < indexAttribute.count; i += 3) {
      if (i !== face.faceIndex * 3) {
        newIndices[newIndex++] = indexAttribute.getX(i);
        newIndices[newIndex++] = indexAttribute.getX(i + 1);
        newIndices[newIndex++] = indexAttribute.getX(i + 2);
      }
    }

    geometry.setIndex(new THREE.BufferAttribute(newIndices, 1));
    geometry.computeVertexNormals();

    return true;
  }

  // Create face helper
  createFaceHelper(object, face, color = 0x0000ff) {
    const pos1 = this.getVertexPosition(object, face.a);
    const pos2 = this.getVertexPosition(object, face.b);
    const pos3 = this.getVertexPosition(object, face.c);

    if (!pos1 || !pos2 || !pos3) return null;

    // Create triangle geometry
    const geometry = new THREE.BufferGeometry().setFromPoints([pos1, pos2, pos3]);
    const material = new THREE.MeshBasicMaterial({ 
      color: color, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const helper = new THREE.Mesh(geometry, material);

    // Transform to world position
    helper.applyMatrix4(object.matrixWorld);

    return helper;
  }

  // Show face helpers
  showFaceHelpers(object, faces = []) {
    this.clearFaceHelpers();

    if (faces.length === 0) {
      // Show all faces
      const allFaces = this.getAllFaces(object);
      for (const face of allFaces) {
        const helper = this.createFaceHelper(object, face);
        if (helper) {
          this.faceHelpers.push(helper);
          this.editor.sceneManager.scene.add(helper);
        }
      }
    } else {
      // Show selected faces
      for (const face of faces) {
        const helper = this.createFaceHelper(object, face, 0xff0000);
        if (helper) {
          this.faceHelpers.push(helper);
          this.editor.sceneManager.scene.add(helper);
        }
      }
    }
  }

  // Clear face helpers
  clearFaceHelpers() {
    this.faceHelpers.forEach(helper => {
      this.editor.sceneManager.scene.remove(helper);
    });
    this.faceHelpers = [];
  }

  // Get face count
  getFaceCount(object) {
    return this.getAllFaces(object).length;
  }

  // Get face statistics
  getFaceStatistics(object) {
    const faces = this.getAllFaces(object);
    let totalArea = 0;

    for (const face of faces) {
      totalArea += this.getFaceArea(object, face);
    }

    return {
      faceCount: faces.length,
      totalArea: totalArea,
      averageArea: faces.length > 0 ? totalArea / faces.length : 0
    };
  }

  // Apply face operations to selected objects
  applyToSelected(operation, ...args) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const results = [];

    selected.forEach(obj => {
      const faces = this.getAllFaces(obj);
      for (const face of faces) {
        let success = false;
        
        switch (operation) {
          case 'extrude':
            success = this.extrudeFace(obj, face, ...args);
            break;
          case 'inset':
            success = this.insetFace(obj, face, ...args);
            break;
          case 'flip':
            success = this.flipFaceNormal(obj, face);
            break;
          case 'delete':
            success = this.deleteFace(obj, face);
            break;
        }

        results.push({ object: obj, face, success });
      }
    });

    return results;
  }

  // Get supported face operations
  getSupportedOperations() {
    return ['select', 'extrude', 'inset', 'flip', 'delete', 'measure'];
  }

  // Get operation description
  getOperationDescription(operation) {
    const descriptions = {
      select: 'Select faces by clicking',
      extrude: 'Extrude selected faces',
      inset: 'Inset selected faces',
      flip: 'Flip face normals',
      delete: 'Delete selected faces',
      measure: 'Measure face area'
    };
    
    return descriptions[operation] || 'Unknown operation';
  }
}
