/**
 * MirrorTool - Handles mirror operations
 */

import * as THREE from 'three';

export default class MirrorTool {
  constructor(editor) {
    this.editor = editor;
  }

  // Mirror object across X axis
  mirrorX(object, center = new THREE.Vector3()) {
    if (!object) return null;

    const mirrored = object.clone();
    mirrored.position.x = center.x - (object.position.x - center.x);
    mirrored.scale.x *= -1;

    return mirrored;
  }

  // Mirror object across Y axis
  mirrorY(object, center = new THREE.Vector3()) {
    if (!object) return null;

    const mirrored = object.clone();
    mirrored.position.y = center.y - (object.position.y - center.y);
    mirrored.scale.y *= -1;

    return mirrored;
  }

  // Mirror object across Z axis
  mirrorZ(object, center = new THREE.Vector3()) {
    if (!object) return null;

    const mirrored = object.clone();
    mirrored.position.z = center.z - (object.position.z - center.z);
    mirrored.scale.z *= -1;

    return mirrored;
  }

  // Mirror object across a plane
  mirrorAcrossPlane(object, planeNormal, planePoint = new THREE.Vector3()) {
    if (!object) return null;

    const mirrored = object.clone();
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, planePoint);
    
    // Reflect position
    const reflectedPosition = new THREE.Vector3();
    plane.reflectPoint(object.position, reflectedPosition);
    mirrored.position.copy(reflectedPosition);

    // Reflect rotation (simplified)
    const reflectedRotation = object.rotation.clone();
    if (planeNormal.x !== 0) reflectedRotation.x *= -1;
    if (planeNormal.y !== 0) reflectedRotation.y *= -1;
    if (planeNormal.z !== 0) reflectedRotation.z *= -1;
    mirrored.rotation.copy(reflectedRotation);

    return mirrored;
  }

  // Mirror object across a custom axis
  mirrorAcrossAxis(object, axis, center = new THREE.Vector3()) {
    if (!object) return null;

    const mirrored = object.clone();
    const axisVector = new THREE.Vector3();

    switch (axis) {
      case 'x':
        axisVector.set(1, 0, 0);
        break;
      case 'y':
        axisVector.set(0, 1, 0);
        break;
      case 'z':
        axisVector.set(0, 0, 1);
        break;
      default:
        console.warn('Invalid axis:', axis);
        return null;
    }

    // Reflect position
    const toCenter = new THREE.Vector3().subVectors(object.position, center);
    const projection = toCenter.dot(axisVector);
    const reflected = toCenter.clone().sub(axisVector.clone().multiplyScalar(2 * projection));
    mirrored.position.copy(center).add(reflected);

    // Reflect scale
    if (axis === 'x') mirrored.scale.x *= -1;
    else if (axis === 'y') mirrored.scale.y *= -1;
    else if (axis === 'z') mirrored.scale.z *= -1;

    return mirrored;
  }

  // Create mirror with offset
  mirrorWithOffset(object, axis, offset = 0) {
    if (!object) return null;

    const mirrored = this.mirrorAcrossAxis(object, axis);
    if (mirrored) {
      switch (axis) {
        case 'x':
          mirrored.position.x += offset;
          break;
        case 'y':
          mirrored.position.y += offset;
          break;
        case 'z':
          mirrored.position.z += offset;
          break;
      }
    }

    return mirrored;
  }

  // Mirror geometry vertices
  mirrorGeometry(geometry, axis = 'x') {
    if (!geometry) return null;

    const mirroredGeometry = geometry.clone();
    const positionAttribute = mirroredGeometry.getAttribute('position');
    const positions = positionAttribute.array;

    for (let i = 0; i < positions.length; i += 3) {
      switch (axis) {
        case 'x':
          positions[i] *= -1;
          break;
        case 'y':
          positions[i + 1] *= -1;
          break;
        case 'z':
          positions[i + 2] *= -1;
          break;
      }
    }

    positionAttribute.needsUpdate = true;
    mirroredGeometry.computeVertexNormals();

    return mirroredGeometry;
  }

  // Apply mirror to selected objects
  applyMirrorToSelected(axis, center = new THREE.Vector3()) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const mirroredObjects = [];

    selected.forEach(obj => {
      const mirrored = this.mirrorAcrossAxis(obj, axis, center);
      if (mirrored) {
        this.editor.addObject(mirrored);
        mirroredObjects.push(mirrored);
      }
    });

    return mirroredObjects;
  }

  // Create mirror preview
  createMirrorPreview(object, axis, center = new THREE.Vector3()) {
    const preview = this.mirrorAcrossAxis(object, axis, center);
    
    if (preview) {
      // Make preview semi-transparent
      if (preview.material) {
        preview.material.transparent = true;
        preview.material.opacity = 0.5;
      }
      
      return preview;
    }

    return null;
  }

  // Get supported mirror axes
  getSupportedAxes() {
    return ['x', 'y', 'z'];
  }

  // Get axis description
  getAxisDescription(axis) {
    const descriptions = {
      x: 'Mirror across X axis',
      y: 'Mirror across Y axis',
      z: 'Mirror across Z axis'
    };
    
    return descriptions[axis] || 'Unknown axis';
  }

  // Create mirror plane helper
  createMirrorPlaneHelper(axis, center = new THREE.Vector3(), size = 10) {
    const planeGeometry = new THREE.PlaneGeometry(size, size);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.copy(center);

    switch (axis) {
      case 'x':
        plane.rotation.y = Math.PI / 2;
        break;
      case 'y':
        plane.rotation.x = Math.PI / 2;
        break;
      case 'z':
        // No rotation needed for Z plane
        break;
    }

    return plane;
  }
} 