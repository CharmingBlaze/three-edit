/**
 * ObjectTool - Handles object operations
 */

import * as THREE from 'three';

export default class ObjectTool {
  constructor(editor) {
    this.editor = editor;
    this.selectedObjects = new Set();
    this.objectHelpers = [];
  }

  // Create object from geometry and material
  createObject(geometry, material) {
    if (!geometry || !material) return null;

    try {
      const mesh = new THREE.Mesh(geometry, material);
      return mesh;
    } catch (error) {
      console.error('Failed to create object:', error);
      return null;
    }
  }

  // Clone object
  cloneObject(object) {
    if (!object) return null;

    try {
      const cloned = object.clone();
      
      // Clone geometry if it exists
      if (object.geometry) {
        cloned.geometry = object.geometry.clone();
      }
      
      // Clone material if it exists
      if (object.material) {
        if (Array.isArray(object.material)) {
          cloned.material = object.material.map(mat => mat.clone());
        } else {
          cloned.material = object.material.clone();
        }
      }
      
      return cloned;
    } catch (error) {
      console.error('Failed to clone object:', error);
      return null;
    }
  }

  // Duplicate object with offset
  duplicateObject(object, offset = { x: 1, y: 0, z: 0 }) {
    const cloned = this.cloneObject(object);
    if (!cloned) return null;

    cloned.position.add(new THREE.Vector3(offset.x, offset.y, offset.z));
    return cloned;
  }

  // Delete object
  deleteObject(object) {
    if (!object) return false;

    try {
      // Remove from scene
      if (object.parent) {
        object.parent.remove(object);
      }
      
      // Dispose geometry
      if (object.geometry) {
        object.geometry.dispose();
      }
      
      // Dispose material
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => mat.dispose());
        } else {
          object.material.dispose();
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete object:', error);
      return false;
    }
  }

  // Group objects
  groupObjects(objects) {
    if (!objects || objects.length === 0) return null;

    const group = new THREE.Group();
    
    objects.forEach(object => {
      if (object && object.parent) {
        object.parent.remove(object);
      }
      group.add(object);
    });

    return group;
  }

  // Ungroup objects
  ungroupObjects(group) {
    if (!group || !(group instanceof THREE.Group)) return [];

    const children = [...group.children];
    
    children.forEach(child => {
      group.remove(child);
      if (group.parent) {
        group.parent.add(child);
      }
    });

    return children;
  }

  // Get object hierarchy
  getObjectHierarchy(object) {
    if (!object) return null;

    const hierarchy = {
      object: object,
      children: [],
      parent: object.parent
    };

    object.children.forEach(child => {
      hierarchy.children.push(this.getObjectHierarchy(child));
    });

    return hierarchy;
  }

  // Find object by name
  findObjectByName(name, objects = null) {
    const searchObjects = objects || this.editor.scene.children;
    const results = [];

    const search = (obj) => {
      if (obj.name === name) {
        results.push(obj);
      }
      obj.children.forEach(child => search(child));
    };

    searchObjects.forEach(obj => search(obj));
    return results;
  }

  // Find object by type
  findObjectByType(type, objects = null) {
    const searchObjects = objects || this.editor.scene.children;
    const results = [];

    const search = (obj) => {
      if (obj.type === type || obj.constructor.name === type) {
        results.push(obj);
      }
      obj.children.forEach(child => search(child));
    };

    searchObjects.forEach(obj => search(obj));
    return results;
  }

  // Get object path
  getObjectPath(object) {
    if (!object) return [];

    const path = [];
    let current = object;

    while (current && current.parent) {
      path.unshift(current);
      current = current.parent;
    }

    return path;
  }

  // Get object depth
  getObjectDepth(object) {
    if (!object) return 0;

    let depth = 0;
    let current = object;

    while (current && current.parent) {
      depth++;
      current = current.parent;
    }

    return depth;
  }

  // Move object in hierarchy
  moveObject(object, newParent) {
    if (!object || !newParent) return false;

    try {
      if (object.parent) {
        object.parent.remove(object);
      }
      newParent.add(object);
      return true;
    } catch (error) {
      console.error('Failed to move object:', error);
      return false;
    }
  }

  // Set object position
  setObjectPosition(object, position) {
    if (!object) return false;

    try {
      object.position.set(position.x, position.y, position.z);
      return true;
    } catch (error) {
      console.error('Failed to set object position:', error);
      return false;
    }
  }

  // Set object rotation
  setObjectRotation(object, rotation) {
    if (!object) return false;

    try {
      object.rotation.set(rotation.x, rotation.y, rotation.z);
      return true;
    } catch (error) {
      console.error('Failed to set object rotation:', error);
      return false;
    }
  }

  // Set object scale
  setObjectScale(object, scale) {
    if (!object) return false;

    try {
      object.scale.set(scale.x, scale.y, scale.z);
      return true;
    } catch (error) {
      console.error('Failed to set object scale:', error);
      return false;
    }
  }

  // Get object transform
  getObjectTransform(object) {
    if (!object) return null;

    return {
      position: object.position.clone(),
      rotation: object.rotation.clone(),
      scale: object.scale.clone(),
      matrix: object.matrix.clone(),
      matrixWorld: object.matrixWorld.clone()
    };
  }

  // Set object transform
  setObjectTransform(object, transform) {
    if (!object) return false;

    try {
      if (transform.position) {
        object.position.copy(transform.position);
      }
      if (transform.rotation) {
        object.rotation.copy(transform.rotation);
      }
      if (transform.scale) {
        object.scale.copy(transform.scale);
      }
      return true;
    } catch (error) {
      console.error('Failed to set object transform:', error);
      return false;
    }
  }

  // Reset object transform
  resetObjectTransform(object) {
    if (!object) return false;

    try {
      object.position.set(0, 0, 0);
      object.rotation.set(0, 0, 0);
      object.scale.set(1, 1, 1);
      return true;
    } catch (error) {
      console.error('Failed to reset object transform:', error);
      return false;
    }
  }

  // Create object helper
  createObjectHelper(object, type = 'box') {
    if (!object) return null;

    let helper;
    
    switch (type) {
      case 'box':
        helper = new THREE.BoxHelper(object, 0xffff00);
        break;
      case 'wireframe':
        helper = new THREE.WireframeHelper(object, 0x000000);
        break;
      case 'axes':
        helper = new THREE.AxesHelper(1);
        helper.position.copy(object.position);
        break;
      case 'boundingBox':
        const box = new THREE.Box3().setFromObject(object);
        const boxGeometry = new THREE.BoxGeometry(
          box.max.x - box.min.x,
          box.max.y - box.min.y,
          box.max.z - box.min.z
        );
        const boxMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          wireframe: true,
          transparent: true,
          opacity: 0.5
        });
        helper = new THREE.Mesh(boxGeometry, boxMaterial);
        helper.position.copy(box.getCenter(new THREE.Vector3()));
        break;
      default:
        return null;
    }

    this.objectHelpers.push(helper);
    this.editor.scene.add(helper);
    return helper;
  }

  // Remove object helper
  removeObjectHelper(helper) {
    const index = this.objectHelpers.indexOf(helper);
    if (index !== -1) {
      this.objectHelpers.splice(index, 1);
      this.editor.scene.remove(helper);
      return true;
    }
    return false;
  }

  // Clear all object helpers
  clearObjectHelpers() {
    this.objectHelpers.forEach(helper => {
      this.editor.scene.remove(helper);
    });
    this.objectHelpers = [];
  }

  // Get object statistics
  getObjectStatistics(object) {
    if (!object) return null;

    const stats = {
      type: object.type,
      name: object.name,
      visible: object.visible,
      children: object.children.length,
      depth: this.getObjectDepth(object)
    };

    if (object.geometry) {
      const geometry = object.geometry;
      stats.geometry = {
        type: geometry.type,
        vertexCount: geometry.attributes.position ? geometry.attributes.position.count : 0,
        faceCount: geometry.index ? geometry.index.count / 3 : 0
      };
    }

    if (object.material) {
      stats.material = {
        type: Array.isArray(object.material) ? 'multi' : object.material.type,
        count: Array.isArray(object.material) ? object.material.length : 1
      };
    }

    return stats;
  }

  // Apply object operations to selected objects
  applyToSelected(operation, ...args) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const results = [];

    selected.forEach(obj => {
      let success = false;
      
      switch (operation) {
        case 'clone':
          const cloned = this.cloneObject(obj);
          if (cloned) {
            this.editor.addObject(cloned);
            success = true;
          }
          break;
        case 'duplicate':
          const duplicated = this.duplicateObject(obj, ...args);
          if (duplicated) {
            this.editor.addObject(duplicated);
            success = true;
          }
          break;
        case 'delete':
          success = this.deleteObject(obj);
          break;
        case 'resetTransform':
          success = this.resetObjectTransform(obj);
          break;
        case 'setPosition':
          success = this.setObjectPosition(obj, ...args);
          break;
        case 'setRotation':
          success = this.setObjectRotation(obj, ...args);
          break;
        case 'setScale':
          success = this.setObjectScale(obj, ...args);
          break;
      }

      results.push({ object: obj, success });
    });

    return results;
  }

  // Get supported object operations
  getSupportedOperations() {
    return [
      'create', 'clone', 'duplicate', 'delete', 'group', 'ungroup',
      'setPosition', 'setRotation', 'setScale', 'resetTransform',
      'move', 'find', 'getHierarchy'
    ];
  }

  // Get operation description
  getOperationDescription(operation) {
    const descriptions = {
      create: 'Create new object',
      clone: 'Clone object',
      duplicate: 'Duplicate object with offset',
      delete: 'Delete object',
      group: 'Group objects',
      ungroup: 'Ungroup objects',
      setPosition: 'Set object position',
      setRotation: 'Set object rotation',
      setScale: 'Set object scale',
      resetTransform: 'Reset object transform',
      move: 'Move object in hierarchy',
      find: 'Find object by criteria',
      getHierarchy: 'Get object hierarchy'
    };
    
    return descriptions[operation] || 'Unknown operation';
  }
}
