/**
 * TwistTool - Handles twisting operations
 */

import * as THREE from 'three';

export default class TwistTool {
  constructor(editor) {
    this.editor = editor;
  }

  // Twist geometry around an axis
  twistGeometry(geometry, angle = Math.PI, axis = 'y') {
    if (!geometry) return null;

    const twistedGeometry = geometry.clone();
    const positionAttribute = twistedGeometry.getAttribute('position');
    const positions = positionAttribute.array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      let twistValue, radius, height;
      
      switch (axis) {
        case 'x':
          twistValue = x;
          radius = Math.sqrt(y * y + z * z);
          height = x;
          break;
        case 'y':
          twistValue = y;
          radius = Math.sqrt(x * x + z * z);
          height = y;
          break;
        case 'z':
          twistValue = z;
          radius = Math.sqrt(x * x + y * y);
          height = z;
          break;
        default:
          continue;
      }

      // Calculate twist angle based on height
      const twistAngle = (height / 2) * angle; // Normalize height to -1 to 1 range

      // Apply twist transformation
      const cosAngle = Math.cos(twistAngle);
      const sinAngle = Math.sin(twistAngle);

      switch (axis) {
        case 'x':
          positions[i + 1] = y * cosAngle - z * sinAngle;
          positions[i + 2] = y * sinAngle + z * cosAngle;
          break;
        case 'y':
          positions[i] = x * cosAngle - z * sinAngle;
          positions[i + 2] = x * sinAngle + z * cosAngle;
          break;
        case 'z':
          positions[i] = x * cosAngle - y * sinAngle;
          positions[i + 1] = x * sinAngle + y * cosAngle;
          break;
      }
    }

    positionAttribute.needsUpdate = true;
    twistedGeometry.computeVertexNormals();

    return twistedGeometry;
  }

  // Twist object
  twistObject(object, angle = Math.PI, axis = 'y') {
    if (!object || !object.geometry) return null;

    const twistedGeometry = this.twistGeometry(object.geometry, angle, axis);
    
    if (twistedGeometry) {
      const twistedObject = new THREE.Mesh(twistedGeometry, object.material);
      twistedObject.position.copy(object.position);
      twistedObject.rotation.copy(object.rotation);
      twistedObject.scale.copy(object.scale);
      
      return twistedObject;
    }

    return null;
  }

  // Apply twist to selected objects
  twistSelected(angle = Math.PI, axis = 'y') {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const twistedObjects = [];

    selected.forEach(obj => {
      const twisted = this.twistObject(obj, angle, axis);
      if (twisted) {
        this.editor.addObject(twisted);
        twistedObjects.push(twisted);
      }
    });

    return twistedObjects;
  }

  // Create twist preview
  createTwistPreview(object, angle = Math.PI, axis = 'y') {
    const preview = this.twistObject(object, angle, axis);
    
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

  // Twist with custom center
  twistWithCenter(geometry, angle = Math.PI, axis = 'y', center = new THREE.Vector3()) {
    if (!geometry) return null;

    const twistedGeometry = geometry.clone();
    const positionAttribute = twistedGeometry.getAttribute('position');
    const positions = positionAttribute.array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i] - center.x;
      const y = positions[i + 1] - center.y;
      const z = positions[i + 2] - center.z;

      let twistValue, radius, height;
      
      switch (axis) {
        case 'x':
          twistValue = x;
          radius = Math.sqrt(y * y + z * z);
          height = x;
          break;
        case 'y':
          twistValue = y;
          radius = Math.sqrt(x * x + z * z);
          height = y;
          break;
        case 'z':
          twistValue = z;
          radius = Math.sqrt(x * x + y * y);
          height = z;
          break;
        default:
          continue;
      }

      // Calculate twist angle based on height
      const twistAngle = (height / 2) * angle;

      // Apply twist transformation
      const cosAngle = Math.cos(twistAngle);
      const sinAngle = Math.sin(twistAngle);

      switch (axis) {
        case 'x':
          positions[i + 1] = center.y + y * cosAngle - z * sinAngle;
          positions[i + 2] = center.z + y * sinAngle + z * cosAngle;
          break;
        case 'y':
          positions[i] = center.x + x * cosAngle - z * sinAngle;
          positions[i + 2] = center.z + x * sinAngle + z * cosAngle;
          break;
        case 'z':
          positions[i] = center.x + x * cosAngle - y * sinAngle;
          positions[i + 1] = center.y + x * sinAngle + y * cosAngle;
          break;
      }
    }

    positionAttribute.needsUpdate = true;
    twistedGeometry.computeVertexNormals();

    return twistedGeometry;
  }

  // Twist with gradual effect
  twistGradual(geometry, angle = Math.PI, axis = 'y', gradualFactor = 0.5) {
    if (!geometry) return null;

    const twistedGeometry = geometry.clone();
    const positionAttribute = twistedGeometry.getAttribute('position');
    const positions = positionAttribute.array;

    // Find bounds for gradual effect
    let minHeight = Infinity, maxHeight = -Infinity;
    
    for (let i = 0; i < positions.length; i += 3) {
      let height;
      switch (axis) {
        case 'x': height = positions[i]; break;
        case 'y': height = positions[i + 1]; break;
        case 'z': height = positions[i + 2]; break;
      }
      minHeight = Math.min(minHeight, height);
      maxHeight = Math.max(maxHeight, height);
    }

    const heightRange = maxHeight - minHeight;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      let height;
      switch (axis) {
        case 'x': height = x; break;
        case 'y': height = y; break;
        case 'z': height = z; break;
      }

      // Calculate gradual twist factor
      const normalizedHeight = (height - minHeight) / heightRange;
      const twistFactor = Math.pow(normalizedHeight, gradualFactor);
      const twistAngle = twistFactor * angle;

      // Apply twist transformation
      const cosAngle = Math.cos(twistAngle);
      const sinAngle = Math.sin(twistAngle);

      switch (axis) {
        case 'x':
          positions[i + 1] = y * cosAngle - z * sinAngle;
          positions[i + 2] = y * sinAngle + z * cosAngle;
          break;
        case 'y':
          positions[i] = x * cosAngle - z * sinAngle;
          positions[i + 2] = x * sinAngle + z * cosAngle;
          break;
        case 'z':
          positions[i] = x * cosAngle - y * sinAngle;
          positions[i + 1] = x * sinAngle + y * cosAngle;
          break;
      }
    }

    positionAttribute.needsUpdate = true;
    twistedGeometry.computeVertexNormals();

    return twistedGeometry;
  }

  // Get supported twist axes
  getSupportedAxes() {
    return ['x', 'y', 'z'];
  }

  // Get twist description
  getTwistDescription(axis) {
    return `Twist around ${axis.toUpperCase()} axis`;
  }

  // Get recommended twist angle
  getRecommendedAngle(geometry) {
    if (!geometry) return Math.PI;

    const boundingBox = geometry.boundingBox || new THREE.Box3().setFromBufferAttribute(geometry.getAttribute('position'));
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    const maxSize = Math.max(size.x, size.y, size.z);
    
    if (maxSize > 10) return Math.PI / 2;
    if (maxSize > 5) return Math.PI;
    return Math.PI * 2;
  }
} 