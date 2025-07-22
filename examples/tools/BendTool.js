/**
 * BendTool - Handles bending operations
 */

import * as THREE from 'three';

export default class BendTool {
  constructor(editor) {
    this.editor = editor;
  }

  // Bend geometry along an axis
  bendGeometry(geometry, angle = Math.PI / 2, axis = 'x', direction = 'y') {
    if (!geometry) return null;

    const bentGeometry = geometry.clone();
    const positionAttribute = bentGeometry.getAttribute('position');
    const positions = positionAttribute.array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      let bendValue, bendAxis;
      
      switch (axis) {
        case 'x':
          bendValue = x;
          bendAxis = direction === 'y' ? y : z;
          break;
        case 'y':
          bendValue = y;
          bendAxis = direction === 'x' ? x : z;
          break;
        case 'z':
          bendValue = z;
          bendAxis = direction === 'x' ? x : y;
          break;
        default:
          continue;
      }

      // Calculate bend radius and angle
      const radius = Math.abs(bendValue) + 1; // Add 1 to avoid division by zero
      const bendAngle = (bendValue / radius) * angle;

      // Apply bend transformation
      const cosAngle = Math.cos(bendAngle);
      const sinAngle = Math.sin(bendAngle);

      switch (axis) {
        case 'x':
          if (direction === 'y') {
            positions[i + 1] = radius * sinAngle;
            positions[i] = radius * (1 - cosAngle);
          } else {
            positions[i + 2] = radius * sinAngle;
            positions[i] = radius * (1 - cosAngle);
          }
          break;
        case 'y':
          if (direction === 'x') {
            positions[i] = radius * sinAngle;
            positions[i + 1] = radius * (1 - cosAngle);
          } else {
            positions[i + 2] = radius * sinAngle;
            positions[i + 1] = radius * (1 - cosAngle);
          }
          break;
        case 'z':
          if (direction === 'x') {
            positions[i] = radius * sinAngle;
            positions[i + 2] = radius * (1 - cosAngle);
          } else {
            positions[i + 1] = radius * sinAngle;
            positions[i + 2] = radius * (1 - cosAngle);
          }
          break;
      }
    }

    positionAttribute.needsUpdate = true;
    bentGeometry.computeVertexNormals();

    return bentGeometry;
  }

  // Bend object
  bendObject(object, angle = Math.PI / 2, axis = 'x', direction = 'y') {
    if (!object || !object.geometry) return null;

    const bentGeometry = this.bendGeometry(object.geometry, angle, axis, direction);
    
    if (bentGeometry) {
      const bentObject = new THREE.Mesh(bentGeometry, object.material);
      bentObject.position.copy(object.position);
      bentObject.rotation.copy(object.rotation);
      bentObject.scale.copy(object.scale);
      
      return bentObject;
    }

    return null;
  }

  // Apply bend to selected objects
  bendSelected(angle = Math.PI / 2, axis = 'x', direction = 'y') {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const bentObjects = [];

    selected.forEach(obj => {
      const bent = this.bendObject(obj, angle, axis, direction);
      if (bent) {
        this.editor.addObject(bent);
        bentObjects.push(bent);
      }
    });

    return bentObjects;
  }

  // Create bend preview
  createBendPreview(object, angle = Math.PI / 2, axis = 'x', direction = 'y') {
    const preview = this.bendObject(object, angle, axis, direction);
    
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

  // Bend with custom center
  bendWithCenter(geometry, angle = Math.PI / 2, axis = 'x', direction = 'y', center = new THREE.Vector3()) {
    if (!geometry) return null;

    const bentGeometry = geometry.clone();
    const positionAttribute = bentGeometry.getAttribute('position');
    const positions = positionAttribute.array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i] - center.x;
      const y = positions[i + 1] - center.y;
      const z = positions[i + 2] - center.z;

      let bendValue, bendAxis;
      
      switch (axis) {
        case 'x':
          bendValue = x;
          bendAxis = direction === 'y' ? y : z;
          break;
        case 'y':
          bendValue = y;
          bendAxis = direction === 'x' ? x : z;
          break;
        case 'z':
          bendValue = z;
          bendAxis = direction === 'x' ? x : y;
          break;
        default:
          continue;
      }

      // Calculate bend radius and angle
      const radius = Math.abs(bendValue) + 1;
      const bendAngle = (bendValue / radius) * angle;

      // Apply bend transformation
      const cosAngle = Math.cos(bendAngle);
      const sinAngle = Math.sin(bendAngle);

      switch (axis) {
        case 'x':
          if (direction === 'y') {
            positions[i + 1] = center.y + radius * sinAngle;
            positions[i] = center.x + radius * (1 - cosAngle);
          } else {
            positions[i + 2] = center.z + radius * sinAngle;
            positions[i] = center.x + radius * (1 - cosAngle);
          }
          break;
        case 'y':
          if (direction === 'x') {
            positions[i] = center.x + radius * sinAngle;
            positions[i + 1] = center.y + radius * (1 - cosAngle);
          } else {
            positions[i + 2] = center.z + radius * sinAngle;
            positions[i + 1] = center.y + radius * (1 - cosAngle);
          }
          break;
        case 'z':
          if (direction === 'x') {
            positions[i] = center.x + radius * sinAngle;
            positions[i + 2] = center.z + radius * (1 - cosAngle);
          } else {
            positions[i + 1] = center.y + radius * sinAngle;
            positions[i + 2] = center.z + radius * (1 - cosAngle);
          }
          break;
      }
    }

    positionAttribute.needsUpdate = true;
    bentGeometry.computeVertexNormals();

    return bentGeometry;
  }

  // Get supported bend axes
  getSupportedAxes() {
    return ['x', 'y', 'z'];
  }

  // Get supported bend directions
  getSupportedDirections() {
    return ['x', 'y', 'z'];
  }

  // Get bend description
  getBendDescription(axis, direction) {
    return `Bend along ${axis.toUpperCase()} axis in ${direction.toUpperCase()} direction`;
  }

  // Get recommended bend angle
  getRecommendedAngle(geometry) {
    if (!geometry) return Math.PI / 2;

    const boundingBox = geometry.boundingBox || new THREE.Box3().setFromBufferAttribute(geometry.getAttribute('position'));
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    const maxSize = Math.max(size.x, size.y, size.z);
    
    if (maxSize > 10) return Math.PI / 4;
    if (maxSize > 5) return Math.PI / 3;
    return Math.PI / 2;
  }
} 