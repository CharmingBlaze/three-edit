/**
 * ArrayTool - Handles array operations
 */

import * as THREE from 'three';

export default class ArrayTool {
  constructor(editor) {
    this.editor = editor;
  }

  // Create linear array
  createLinearArray(object, count = 3, spacing = 1, direction = 'x') {
    if (!object) return [];

    const array = [];
    const vector = new THREE.Vector3();

    switch (direction) {
      case 'x':
        vector.set(spacing, 0, 0);
        break;
      case 'y':
        vector.set(0, spacing, 0);
        break;
      case 'z':
        vector.set(0, 0, spacing);
        break;
      default:
        vector.set(spacing, 0, 0);
    }

    for (let i = 0; i < count; i++) {
      const clone = object.clone();
      clone.position.copy(object.position).add(vector.clone().multiplyScalar(i));
      array.push(clone);
    }

    return array;
  }

  // Create circular array
  createCircularArray(object, count = 8, radius = 2, center = new THREE.Vector3()) {
    if (!object) return [];

    const array = [];
    const angleStep = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
      const clone = object.clone();
      const angle = i * angleStep;
      
      clone.position.x = center.x + radius * Math.cos(angle);
      clone.position.z = center.z + radius * Math.sin(angle);
      clone.position.y = center.y;
      
      // Rotate object to face outward
      clone.rotation.y = angle + Math.PI / 2;
      
      array.push(clone);
    }

    return array;
  }

  // Create grid array
  createGridArray(object, rows = 3, columns = 3, spacing = 1) {
    if (!object) return [];

    const array = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const clone = object.clone();
        clone.position.x = object.position.x + col * spacing;
        clone.position.z = object.position.z + row * spacing;
        clone.position.y = object.position.y;
        array.push(clone);
      }
    }

    return array;
  }

  // Create radial array
  createRadialArray(object, count = 6, radius = 2, height = 0) {
    if (!object) return [];

    const array = [];
    const angleStep = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
      const clone = object.clone();
      const angle = i * angleStep;
      
      clone.position.x = object.position.x + radius * Math.cos(angle);
      clone.position.z = object.position.z + radius * Math.sin(angle);
      clone.position.y = object.position.y + height;
      
      array.push(clone);
    }

    return array;
  }

  // Create spiral array
  createSpiralArray(object, count = 10, radius = 2, height = 1, turns = 2) {
    if (!object) return [];

    const array = [];
    const angleStep = (2 * Math.PI * turns) / count;
    const heightStep = height / count;

    for (let i = 0; i < count; i++) {
      const clone = object.clone();
      const angle = i * angleStep;
      const currentRadius = radius * (1 - i / count * 0.5);
      
      clone.position.x = object.position.x + currentRadius * Math.cos(angle);
      clone.position.z = object.position.z + currentRadius * Math.sin(angle);
      clone.position.y = object.position.y + i * heightStep;
      
      array.push(clone);
    }

    return array;
  }

  // Create random array
  createRandomArray(object, count = 10, bounds = { x: 5, y: 2, z: 5 }) {
    if (!object) return [];

    const array = [];

    for (let i = 0; i < count; i++) {
      const clone = object.clone();
      
      clone.position.x = object.position.x + (Math.random() - 0.5) * bounds.x;
      clone.position.y = object.position.y + (Math.random() - 0.5) * bounds.y;
      clone.position.z = object.position.z + (Math.random() - 0.5) * bounds.z;
      
      clone.rotation.x = Math.random() * Math.PI * 2;
      clone.rotation.y = Math.random() * Math.PI * 2;
      clone.rotation.z = Math.random() * Math.PI * 2;
      
      array.push(clone);
    }

    return array;
  }

  // Apply array to selected objects
  applyArrayToSelected(type, options = {}) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const arrays = [];

    selected.forEach(obj => {
      let array = [];

      switch (type) {
        case 'linear':
          array = this.createLinearArray(obj, options.count || 3, options.spacing || 1, options.direction || 'x');
          break;
        case 'circular':
          array = this.createCircularArray(obj, options.count || 8, options.radius || 2, options.center);
          break;
        case 'grid':
          array = this.createGridArray(obj, options.rows || 3, options.columns || 3, options.spacing || 1);
          break;
        case 'radial':
          array = this.createRadialArray(obj, options.count || 6, options.radius || 2, options.height || 0);
          break;
        case 'spiral':
          array = this.createSpiralArray(obj, options.count || 10, options.radius || 2, options.height || 1, options.turns || 2);
          break;
        case 'random':
          array = this.createRandomArray(obj, options.count || 10, options.bounds);
          break;
        default:
          console.warn('Unknown array type:', type);
          return;
      }

      // Add all objects in array to scene
      array.forEach(clone => {
        this.editor.addObject(clone);
      });

      arrays.push(...array);
    });

    return arrays;
  }

  // Create array preview
  createArrayPreview(type, object, options = {}) {
    let array = [];

    switch (type) {
      case 'linear':
        array = this.createLinearArray(object, options.count || 3, options.spacing || 1, options.direction || 'x');
        break;
      case 'circular':
        array = this.createCircularArray(object, options.count || 8, options.radius || 2, options.center);
        break;
      case 'grid':
        array = this.createGridArray(object, options.rows || 3, options.columns || 3, options.spacing || 1);
        break;
      case 'radial':
        array = this.createRadialArray(object, options.count || 6, options.radius || 2, options.height || 0);
        break;
      case 'spiral':
        array = this.createSpiralArray(object, options.count || 10, options.radius || 2, options.height || 1, options.turns || 2);
        break;
      case 'random':
        array = this.createRandomArray(object, options.count || 10, options.bounds);
        break;
    }

    // Make preview objects semi-transparent
    array.forEach(obj => {
      if (obj.material) {
        obj.material.transparent = true;
        obj.material.opacity = 0.5;
      }
    });

    return array;
  }

  // Get supported array types
  getSupportedArrayTypes() {
    return ['linear', 'circular', 'grid', 'radial', 'spiral', 'random'];
  }

  // Get array type description
  getArrayTypeDescription(type) {
    const descriptions = {
      linear: 'Create objects in a straight line',
      circular: 'Create objects in a circle',
      grid: 'Create objects in a grid pattern',
      radial: 'Create objects in a radial pattern',
      spiral: 'Create objects in a spiral pattern',
      random: 'Create objects in random positions'
    };
    
    return descriptions[type] || 'Unknown array type';
  }
} 