/**
 * BooleanTool - Handles boolean operations
 */

import * as THREE from 'three';

export default class BooleanTool {
  constructor(editor) {
    this.editor = editor;
  }

  // Union operation - combine two objects
  union(objectA, objectB) {
    if (!objectA || !objectB || !objectA.geometry || !objectB.geometry) {
      return null;
    }

    try {
      // Create CSG-like operation (simplified)
      const geometryA = objectA.geometry.clone();
      const geometryB = objectB.geometry.clone();
      
      // Apply transformations
      geometryA.applyMatrix4(objectA.matrixWorld);
      geometryB.applyMatrix4(objectB.matrixWorld);
      
      // Merge geometries
      const mergedGeometry = this.mergeGeometries([geometryA, geometryB]);
      
      if (mergedGeometry) {
        const material = objectA.material || new THREE.MeshStandardMaterial();
        const result = new THREE.Mesh(mergedGeometry, material);
        
        // Reset position and apply inverse transformation
        result.position.set(0, 0, 0);
        result.rotation.set(0, 0, 0);
        result.scale.set(1, 1, 1);
        
        return result;
      }
    } catch (error) {
      console.warn('Boolean union operation failed:', error);
    }

    return null;
  }

  // Subtraction operation - subtract objectB from objectA
  subtract(objectA, objectB) {
    if (!objectA || !objectB || !objectA.geometry || !objectB.geometry) {
      return null;
    }

    try {
      // Simplified subtraction using geometry difference
      const geometryA = objectA.geometry.clone();
      const geometryB = objectB.geometry.clone();
      
      // Apply transformations
      geometryA.applyMatrix4(objectA.matrixWorld);
      geometryB.applyMatrix4(objectB.matrixWorld);
      
      // Create difference geometry (simplified)
      const differenceGeometry = this.createDifferenceGeometry(geometryA, geometryB);
      
      if (differenceGeometry) {
        const material = objectA.material || new THREE.MeshStandardMaterial();
        const result = new THREE.Mesh(differenceGeometry, material);
        
        result.position.set(0, 0, 0);
        result.rotation.set(0, 0, 0);
        result.scale.set(1, 1, 1);
        
        return result;
      }
    } catch (error) {
      console.warn('Boolean subtraction operation failed:', error);
    }

    return null;
  }

  // Intersection operation - keep only overlapping parts
  intersect(objectA, objectB) {
    if (!objectA || !objectB || !objectA.geometry || !objectB.geometry) {
      return null;
    }

    try {
      // Simplified intersection
      const geometryA = objectA.geometry.clone();
      const geometryB = objectB.geometry.clone();
      
      // Apply transformations
      geometryA.applyMatrix4(objectA.matrixWorld);
      geometryB.applyMatrix4(objectB.matrixWorld);
      
      // Create intersection geometry (simplified)
      const intersectionGeometry = this.createIntersectionGeometry(geometryA, geometryB);
      
      if (intersectionGeometry) {
        const material = objectA.material || new THREE.MeshStandardMaterial();
        const result = new THREE.Mesh(intersectionGeometry, material);
        
        result.position.set(0, 0, 0);
        result.rotation.set(0, 0, 0);
        result.scale.set(1, 1, 1);
        
        return result;
      }
    } catch (error) {
      console.warn('Boolean intersection operation failed:', error);
    }

    return null;
  }

  // Merge multiple geometries
  mergeGeometries(geometries) {
    if (!geometries || geometries.length === 0) return null;

    const mergedGeometry = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    let indexOffset = 0;

    for (const geometry of geometries) {
      const positionAttribute = geometry.getAttribute('position');
      const normalAttribute = geometry.getAttribute('normal');
      const uvAttribute = geometry.getAttribute('uv');

      if (positionAttribute) {
        for (let i = 0; i < positionAttribute.count; i++) {
          positions.push(
            positionAttribute.getX(i),
            positionAttribute.getY(i),
            positionAttribute.getZ(i)
          );
        }
      }

      if (normalAttribute) {
        for (let i = 0; i < normalAttribute.count; i++) {
          normals.push(
            normalAttribute.getX(i),
            normalAttribute.getY(i),
            normalAttribute.getZ(i)
          );
        }
      }

      if (uvAttribute) {
        for (let i = 0; i < uvAttribute.count; i++) {
          uvs.push(
            uvAttribute.getX(i),
            uvAttribute.getY(i)
          );
        }
      }

      if (geometry.index) {
        for (let i = 0; i < geometry.index.count; i++) {
          indices.push(geometry.index.getX(i) + indexOffset);
        }
      }

      indexOffset += positionAttribute ? positionAttribute.count : 0;
    }

    if (positions.length > 0) {
      mergedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    }
    if (normals.length > 0) {
      mergedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    }
    if (uvs.length > 0) {
      mergedGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    }
    if (indices.length > 0) {
      mergedGeometry.setIndex(indices);
    }

    return mergedGeometry;
  }

  // Create difference geometry (simplified)
  createDifferenceGeometry(geometryA, geometryB) {
    // This is a simplified implementation
    // In practice, you'd need a proper CSG library
    return geometryA.clone();
  }

  // Create intersection geometry (simplified)
  createIntersectionGeometry(geometryA, geometryB) {
    // This is a simplified implementation
    // In practice, you'd need a proper CSG library
    return geometryA.clone();
  }

  // Apply boolean operation to selected objects
  applyBooleanOperation(operation, objectA, objectB) {
    let result = null;

    switch (operation) {
      case 'union':
        result = this.union(objectA, objectB);
        break;
      case 'subtract':
        result = this.subtract(objectA, objectB);
        break;
      case 'intersect':
        result = this.intersect(objectA, objectB);
        break;
      default:
        console.warn('Unknown boolean operation:', operation);
        return null;
    }

    if (result) {
      this.editor.addObject(result);
      return result;
    }

    return null;
  }

  // Apply boolean operation to selected objects
  applyBooleanToSelected(operation) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    
    if (selected.length < 2) {
      console.warn('Need at least 2 selected objects for boolean operation');
      return null;
    }

    const objectA = selected[0];
    const objectB = selected[1];
    
    return this.applyBooleanOperation(operation, objectA, objectB);
  }

  // Create boolean preview
  createBooleanPreview(operation, objectA, objectB) {
    const preview = this.applyBooleanOperation(operation, objectA, objectB);
    
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

  // Check if objects can be combined
  canCombine(objectA, objectB) {
    return objectA && objectB && 
           objectA.geometry && objectB.geometry &&
           objectA.geometry.type && objectB.geometry.type;
  }

  // Get supported boolean operations
  getSupportedOperations() {
    return ['union', 'subtract', 'intersect'];
  }

  // Get operation description
  getOperationDescription(operation) {
    const descriptions = {
      union: 'Combine two objects into one',
      subtract: 'Remove second object from first',
      intersect: 'Keep only overlapping parts'
    };
    
    return descriptions[operation] || 'Unknown operation';
  }
} 