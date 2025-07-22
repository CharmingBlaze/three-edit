/**
 * TransformTool - Manages object transformations (move, rotate, scale)
 */

import * as THREE from 'three';
import BaseTool from './BaseTool.js';

export default class TransformTool extends BaseTool {
  constructor(scene, camera, renderer, options = {}) {
    super(scene, camera, renderer, {
      name: 'TransformTool',
      description: 'Object transformation tool',
      icon: '🔄',
      category: 'transform',
      ...options
    });

    // Transform settings
    this.transformSettings = {
      snapToGrid: options.snapToGrid || false,
      gridSize: options.gridSize || 1,
      snapToAngle: options.snapToAngle || false,
      angleSnap: options.angleSnap || 15,
      showGizmo: options.showGizmo !== false,
      gizmoSize: options.gizmoSize || 1
    };

    // Transform modes
    this.transformModes = {
      translate: 'translate',
      rotate: 'rotate',
      scale: 'scale'
    };

    this.currentMode = this.transformModes.translate;

    // Transform gizmo
    this.gizmo = null;
    this.gizmoHelpers = new Map();

    // Transform state
    this.isTransforming = false;
    this.transformStart = new THREE.Vector3();
    this.transformEnd = new THREE.Vector3();
    this.originalTransforms = new Map();
  }

  // Set transform mode
  setTransformMode(mode) {
    if (!this.transformModes[mode]) return false;

    this.currentMode = mode;
    this.updateGizmo();
    this.emit('transformModeChanged', { mode, tool: this });
    return true;
  }

  // Get transform mode
  getTransformMode() {
    return this.currentMode;
  }

  // Get available transform modes
  getAvailableTransformModes() {
    return Object.keys(this.transformModes);
  }

  // Move objects
  moveObjects(objects, translation) {
    if (!Array.isArray(objects) || !translation) return false;

    try {
      objects.forEach(object => {
        object.position.add(translation);
      });

      this.addToHistory({
        type: 'move',
        objects: objects.map(obj => obj.uuid),
        translation: translation.toArray(),
        undo: () => {
          objects.forEach(object => {
            object.position.sub(translation);
          });
        },
        redo: () => {
          objects.forEach(object => {
            object.position.add(translation);
          });
        }
      });

      this.emit('objectsMoved', { objects, translation, tool: this });
      return true;
    } catch (error) {
      console.error('Failed to move objects:', error);
      return false;
    }
  }

  // Rotate objects
  rotateObjects(objects, rotation, center = new THREE.Vector3()) {
    if (!Array.isArray(objects) || !rotation) return false;

    try {
      const matrix = new THREE.Matrix4();
      matrix.makeRotationFromEuler(rotation);

      objects.forEach(object => {
        // Move to origin, rotate, move back
        object.position.sub(center);
        object.position.applyMatrix4(matrix);
        object.position.add(center);
        object.rotation.add(rotation);
      });

      this.addToHistory({
        type: 'rotate',
        objects: objects.map(obj => obj.uuid),
        rotation: rotation.toArray(),
        center: center.toArray(),
        undo: () => {
          const inverseMatrix = new THREE.Matrix4();
          inverseMatrix.makeRotationFromEuler(rotation.clone().multiplyScalar(-1));
          
          objects.forEach(object => {
            object.position.sub(center);
            object.position.applyMatrix4(inverseMatrix);
            object.position.add(center);
            object.rotation.sub(rotation);
          });
        },
        redo: () => {
          objects.forEach(object => {
            object.position.sub(center);
            object.position.applyMatrix4(matrix);
            object.position.add(center);
            object.rotation.add(rotation);
          });
        }
      });

      this.emit('objectsRotated', { objects, rotation, center, tool: this });
      return true;
    } catch (error) {
      console.error('Failed to rotate objects:', error);
      return false;
    }
  }

  // Scale objects
  scaleObjects(objects, scale, center = new THREE.Vector3()) {
    if (!Array.isArray(objects) || !scale) return false;

    try {
      objects.forEach(object => {
        // Move to origin, scale, move back
        object.position.sub(center);
        object.position.multiply(scale);
        object.position.add(center);
        object.scale.multiply(scale);
      });

      this.addToHistory({
        type: 'scale',
        objects: objects.map(obj => obj.uuid),
        scale: scale.toArray(),
        center: center.toArray(),
        undo: () => {
          const inverseScale = new THREE.Vector3(1 / scale.x, 1 / scale.y, 1 / scale.z);
          objects.forEach(object => {
            object.position.sub(center);
            object.position.multiply(inverseScale);
            object.position.add(center);
            object.scale.multiply(inverseScale);
          });
        },
        redo: () => {
          objects.forEach(object => {
            object.position.sub(center);
            object.position.multiply(scale);
            object.position.add(center);
            object.scale.multiply(scale);
          });
        }
      });

      this.emit('objectsScaled', { objects, scale, center, tool: this });
      return true;
    } catch (error) {
      console.error('Failed to scale objects:', error);
      return false;
    }
  }

  // Transform objects by matrix
  transformObjects(objects, matrix) {
    if (!Array.isArray(objects) || !matrix) return false;

    try {
      const originalTransforms = new Map();
      
      objects.forEach(object => {
        originalTransforms.set(object.uuid, {
          position: object.position.clone(),
          rotation: object.rotation.clone(),
          scale: object.scale.clone()
        });
        
        object.applyMatrix4(matrix);
      });

      this.addToHistory({
        type: 'transform',
        objects: objects.map(obj => obj.uuid),
        matrix: matrix.elements,
        undo: () => {
          objects.forEach(object => {
            const original = originalTransforms.get(object.uuid);
            if (original) {
              object.position.copy(original.position);
              object.rotation.copy(original.rotation);
              object.scale.copy(original.scale);
            }
          });
        },
        redo: () => {
          objects.forEach(object => {
            object.applyMatrix4(matrix);
          });
        }
      });

      this.emit('objectsTransformed', { objects, matrix, tool: this });
      return true;
    } catch (error) {
      console.error('Failed to transform objects:', error);
      return false;
    }
  }

  // Reset object transforms
  resetObjectTransforms(objects) {
    if (!Array.isArray(objects)) return false;

    try {
      const originalTransforms = new Map();
      
      objects.forEach(object => {
        originalTransforms.set(object.uuid, {
          position: object.position.clone(),
          rotation: object.rotation.clone(),
          scale: object.scale.clone()
        });
        
        object.position.set(0, 0, 0);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);
      });

      this.addToHistory({
        type: 'resetTransforms',
        objects: objects.map(obj => obj.uuid),
        undo: () => {
          objects.forEach(object => {
            const original = originalTransforms.get(object.uuid);
            if (original) {
              object.position.copy(original.position);
              object.rotation.copy(original.rotation);
              object.scale.copy(original.scale);
            }
          });
        },
        redo: () => {
          objects.forEach(object => {
            object.position.set(0, 0, 0);
            object.rotation.set(0, 0, 0);
            object.scale.set(1, 1, 1);
          });
        }
      });

      this.emit('transformsReset', { objects, tool: this });
      return true;
    } catch (error) {
      console.error('Failed to reset object transforms:', error);
      return false;
    }
  }

  // Align objects
  alignObjects(objects, alignment) {
    if (!Array.isArray(objects) || !alignment) return false;

    try {
      const originalPositions = new Map();
      
      objects.forEach(object => {
        originalPositions.set(object.uuid, object.position.clone());
        
        switch (alignment) {
          case 'left':
            object.position.x = Math.min(...objects.map(obj => obj.position.x));
            break;
          case 'right':
            object.position.x = Math.max(...objects.map(obj => obj.position.x));
            break;
          case 'center':
            const centerX = objects.reduce((sum, obj) => sum + obj.position.x, 0) / objects.length;
            object.position.x = centerX;
            break;
          case 'top':
            object.position.y = Math.max(...objects.map(obj => obj.position.y));
            break;
          case 'bottom':
            object.position.y = Math.min(...objects.map(obj => obj.position.y));
            break;
          case 'middle':
            const centerY = objects.reduce((sum, obj) => sum + obj.position.y, 0) / objects.length;
            object.position.y = centerY;
            break;
        }
      });

      this.addToHistory({
        type: 'align',
        objects: objects.map(obj => obj.uuid),
        alignment,
        undo: () => {
          objects.forEach(object => {
            const original = originalPositions.get(object.uuid);
            if (original) {
              object.position.copy(original);
            }
          });
        },
        redo: () => {
          objects.forEach(object => {
            switch (alignment) {
              case 'left':
                object.position.x = Math.min(...objects.map(obj => obj.position.x));
                break;
              case 'right':
                object.position.x = Math.max(...objects.map(obj => obj.position.x));
                break;
              case 'center':
                const centerX = objects.reduce((sum, obj) => sum + obj.position.x, 0) / objects.length;
                object.position.x = centerX;
                break;
              case 'top':
                object.position.y = Math.max(...objects.map(obj => obj.position.y));
                break;
              case 'bottom':
                object.position.y = Math.min(...objects.map(obj => obj.position.y));
                break;
              case 'middle':
                const centerY = objects.reduce((sum, obj) => sum + obj.position.y, 0) / objects.length;
                object.position.y = centerY;
                break;
            }
          });
        }
      });

      this.emit('objectsAligned', { objects, alignment, tool: this });
      return true;
    } catch (error) {
      console.error('Failed to align objects:', error);
      return false;
    }
  }

  // Create transform gizmo
  createTransformGizmo() {
    if (!this.transformSettings.showGizmo) return;

    try {
      // Import TransformControls dynamically
      import('three/examples/jsm/controls/TransformControls.js').then(({ TransformControls }) => {
        this.gizmo = new TransformControls(this.camera, this.renderer.domElement);
        this.gizmo.setMode(this.currentMode);
        this.gizmo.setSize(this.transformSettings.gizmoSize);
        
        // Add selected objects to gizmo
        this.selectedObjects.forEach(object => {
          this.gizmo.attach(object);
        });
        
        this.scene.add(this.gizmo);
        
        // Setup gizmo events
        this.gizmo.addEventListener('dragging-changed', (event) => {
          this.isTransforming = event.value;
        });
        
        this.gizmo.addEventListener('change', () => {
          this.emit('transformChanged', { gizmo: this.gizmo, tool: this });
        });
        
        this.emit('gizmoCreated', { gizmo: this.gizmo, tool: this });
      });
    } catch (error) {
      console.error('Failed to create transform gizmo:', error);
    }
  }

  // Update gizmo
  updateGizmo() {
    if (!this.gizmo) return;

    this.gizmo.setMode(this.currentMode);
    
    // Update attached objects
    this.gizmo.detach();
    this.selectedObjects.forEach(object => {
      this.gizmo.attach(object);
    });
  }

  // Remove gizmo
  removeGizmo() {
    if (this.gizmo) {
      this.scene.remove(this.gizmo);
      this.gizmo.dispose();
      this.gizmo = null;
    }
  }

  // Override selectObject
  selectObject(object) {
    super.selectObject(object);
    if (this.gizmo) {
      this.gizmo.attach(object);
    }
  }

  // Override deselectObject
  deselectObject(object) {
    super.deselectObject(object);
    if (this.gizmo) {
      this.gizmo.detach(object);
    }
  }

  // Override clearSelection
  clearSelection() {
    super.clearSelection();
    if (this.gizmo) {
      this.gizmo.detach();
    }
  }

  // Override createHelpers
  createHelpers() {
    this.createTransformGizmo();
  }

  // Override removeHelpers
  removeHelpers() {
    super.removeHelpers();
    this.removeGizmo();
  }

  // Get supported operations
  getSupportedOperations() {
    return [
      'setTransformMode', 'getTransformMode', 'getAvailableTransformModes',
      'moveObjects', 'rotateObjects', 'scaleObjects', 'transformObjects',
      'resetObjectTransforms', 'alignObjects'
    ];
  }

  // Get operation description
  getOperationDescription(operation) {
    const descriptions = {
      setTransformMode: 'Set transform mode (translate, rotate, scale)',
      getTransformMode: 'Get current transform mode',
      getAvailableTransformModes: 'Get available transform modes',
      moveObjects: 'Move objects by translation vector',
      rotateObjects: 'Rotate objects around center point',
      scaleObjects: 'Scale objects from center point',
      transformObjects: 'Transform objects using matrix',
      resetObjectTransforms: 'Reset object transforms to default',
      alignObjects: 'Align objects (left, right, center, top, bottom, middle)'
    };
    
    return descriptions[operation] || 'Unknown operation';
  }
} 