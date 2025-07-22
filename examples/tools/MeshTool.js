/**
 * MeshTool - Handles mesh operations
 */

import * as THREE from 'three';

export default class MeshTool {
  constructor(editor) {
    this.editor = editor;
    this.meshHelpers = [];
  }

  // Create mesh from geometry and material
  createMesh(geometry, material) {
    if (!geometry || !material) return null;

    try {
      const mesh = new THREE.Mesh(geometry, material);
      return mesh;
    } catch (error) {
      console.error('Failed to create mesh:', error);
      return null;
    }
  }

  // Merge meshes
  mergeMeshes(meshes) {
    if (!meshes || meshes.length === 0) return null;

    const geometries = [];
    const materials = [];

    meshes.forEach(mesh => {
      if (mesh.geometry) {
        geometries.push(mesh.geometry);
        materials.push(mesh.material);
      }
    });

    if (geometries.length === 0) return null;

    // Merge geometries
    const mergedGeometry = this.mergeGeometries(geometries);
    if (!mergedGeometry) return null;

    // Use first material or create default
    const material = materials[0] || new THREE.MeshStandardMaterial();
    
    const mergedMesh = new THREE.Mesh(mergedGeometry, material);
    
    // Position at center of merged objects
    const center = this.getObjectsCenter(meshes);
    mergedMesh.position.copy(center);

    return mergedMesh;
  }

  // Merge geometries
  mergeGeometries(geometries) {
    if (!geometries || geometries.length === 0) return null;

    try {
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
    } catch (error) {
      console.error('Failed to merge geometries:', error);
      return null;
    }
  }

  // Get objects center
  getObjectsCenter(objects) {
    if (!objects || objects.length === 0) return new THREE.Vector3();

    const center = new THREE.Vector3();
    let count = 0;

    objects.forEach(obj => {
      center.add(obj.position);
      count++;
    });

    return center.divideScalar(count);
  }

  // Split mesh by material
  splitMeshByMaterial(mesh) {
    if (!mesh || !mesh.geometry) return [];

    const geometry = mesh.geometry;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const splitMeshes = [];

    // If single material, return original mesh
    if (materials.length === 1) {
      return [mesh];
    }

    // Split by material groups
    if (geometry.groups && geometry.groups.length > 0) {
      geometry.groups.forEach((group, index) => {
        const material = materials[Math.min(index, materials.length - 1)];
        const subGeometry = geometry.clone();
        
        // Extract group geometry
        const groupIndices = [];
        for (let i = group.start; i < group.start + group.count; i++) {
          groupIndices.push(i);
        }
        
        subGeometry.setIndex(groupIndices);
        subGeometry.computeVertexNormals();
        
        const subMesh = new THREE.Mesh(subGeometry, material);
        subMesh.position.copy(mesh.position);
        subMesh.rotation.copy(mesh.rotation);
        subMesh.scale.copy(mesh.scale);
        
        splitMeshes.push(subMesh);
      });
    } else {
      // No groups, return original mesh
      return [mesh];
    }

    return splitMeshes;
  }

  // Optimize mesh
  optimizeMesh(mesh) {
    if (!mesh || !mesh.geometry) return false;

    try {
      const geometry = mesh.geometry;

      // Merge vertices
      geometry.mergeVertices();

      // Remove unused vertices
      geometry.deleteAttribute('uv');
      geometry.deleteAttribute('normal');
      geometry.computeVertexNormals();

      return true;
    } catch (error) {
      console.error('Failed to optimize mesh:', error);
      return false;
    }
  }

  // Triangulate mesh
  triangulateMesh(mesh) {
    if (!mesh || !mesh.geometry) return false;

    try {
      const geometry = mesh.geometry;
      
      // Ensure geometry is triangulated
      if (geometry.index) {
        // Already triangulated
        return true;
      } else {
        // Convert to indexed geometry
        geometry.setIndex(geometry.getAttribute('position').count);
        return true;
      }
    } catch (error) {
      console.error('Failed to triangulate mesh:', error);
      return false;
    }
  }

  // Convert to wireframe
  convertToWireframe(mesh) {
    if (!mesh || !mesh.geometry) return null;

    try {
      const geometry = mesh.geometry;
      const wireframeGeometry = new THREE.WireframeGeometry(geometry);
      const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      
      const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
      wireframe.position.copy(mesh.position);
      wireframe.rotation.copy(mesh.rotation);
      wireframe.scale.copy(mesh.scale);

      return wireframe;
    } catch (error) {
      console.error('Failed to convert to wireframe:', error);
      return null;
    }
  }

  // Convert to edges
  convertToEdges(mesh) {
    if (!mesh || !mesh.geometry) return null;

    try {
      const geometry = mesh.geometry;
      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      edges.position.copy(mesh.position);
      edges.rotation.copy(mesh.rotation);
      edges.scale.copy(mesh.scale);

      return edges;
    } catch (error) {
      console.error('Failed to convert to edges:', error);
      return null;
    }
  }

  // Create bounding box
  createBoundingBox(mesh) {
    if (!mesh || !mesh.geometry) return null;

    try {
      const geometry = mesh.geometry;
      geometry.computeBoundingBox();
      
      const boxGeometry = new THREE.BoxGeometry(
        geometry.boundingBox.max.x - geometry.boundingBox.min.x,
        geometry.boundingBox.max.y - geometry.boundingBox.min.y,
        geometry.boundingBox.max.z - geometry.boundingBox.min.z
      );
      
      const boxMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });
      
      const boundingBox = new THREE.Mesh(boxGeometry, boxMaterial);
      boundingBox.position.copy(mesh.position);
      boundingBox.rotation.copy(mesh.rotation);
      boundingBox.scale.copy(mesh.scale);

      return boundingBox;
    } catch (error) {
      console.error('Failed to create bounding box:', error);
      return null;
    }
  }

  // Create bounding sphere
  createBoundingSphere(mesh) {
    if (!mesh || !mesh.geometry) return null;

    try {
      const geometry = mesh.geometry;
      geometry.computeBoundingSphere();
      
      const sphereGeometry = new THREE.SphereGeometry(geometry.boundingSphere.radius);
      const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });
      
      const boundingSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      boundingSphere.position.copy(mesh.position);
      boundingSphere.rotation.copy(mesh.rotation);
      boundingSphere.scale.copy(mesh.scale);

      return boundingSphere;
    } catch (error) {
      console.error('Failed to create bounding sphere:', error);
      return null;
    }
  }

  // Get mesh statistics
  getMeshStatistics(mesh) {
    if (!mesh || !mesh.geometry) return null;

    try {
      const geometry = mesh.geometry;
      const positionAttribute = geometry.getAttribute('position');
      const indexAttribute = geometry.index;

      return {
        vertexCount: positionAttribute ? positionAttribute.count : 0,
        faceCount: indexAttribute ? indexAttribute.count / 3 : 0,
        edgeCount: indexAttribute ? indexAttribute.count / 2 : 0,
        materialCount: Array.isArray(mesh.material) ? mesh.material.length : 1
      };
    } catch (error) {
      console.error('Failed to get mesh statistics:', error);
      return null;
    }
  }

  // Create mesh helper
  createMeshHelper(mesh, type = 'box') {
    if (!mesh) return null;

    let helper;
    
    switch (type) {
      case 'box':
        helper = new THREE.BoxHelper(mesh, 0xffff00);
        break;
      case 'wireframe':
        helper = new THREE.WireframeHelper(mesh, 0x000000);
        break;
      case 'boundingBox':
        helper = this.createBoundingBox(mesh);
        break;
      case 'boundingSphere':
        helper = this.createBoundingSphere(mesh);
        break;
      default:
        return null;
    }

    if (helper) {
      this.meshHelpers.push(helper);
      this.editor.scene.add(helper);
    }

    return helper;
  }

  // Remove mesh helper
  removeMeshHelper(helper) {
    const index = this.meshHelpers.indexOf(helper);
    if (index !== -1) {
      this.meshHelpers.splice(index, 1);
      this.editor.scene.remove(helper);
      return true;
    }
    return false;
  }

  // Clear all mesh helpers
  clearMeshHelpers() {
    this.meshHelpers.forEach(helper => {
      this.editor.scene.remove(helper);
    });
    this.meshHelpers = [];
  }

  // Apply mesh operations to selected objects
  applyToSelected(operation, ...args) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const results = [];

    switch (operation) {
      case 'merge':
        const merged = this.mergeMeshes(selected);
        if (merged) {
          this.editor.addObject(merged);
          results.push({ success: true, result: merged });
        }
        break;
      case 'optimize':
        selected.forEach(obj => {
          const success = this.optimizeMesh(obj);
          results.push({ object: obj, success });
        });
        break;
      case 'triangulate':
        selected.forEach(obj => {
          const success = this.triangulateMesh(obj);
          results.push({ object: obj, success });
        });
        break;
      case 'wireframe':
        selected.forEach(obj => {
          const wireframe = this.convertToWireframe(obj);
          if (wireframe) {
            this.editor.addObject(wireframe);
            results.push({ object: obj, success: true, result: wireframe });
          }
        });
        break;
      case 'edges':
        selected.forEach(obj => {
          const edges = this.convertToEdges(obj);
          if (edges) {
            this.editor.addObject(edges);
            results.push({ object: obj, success: true, result: edges });
          }
        });
        break;
      case 'split':
        selected.forEach(obj => {
          const splitMeshes = this.splitMeshByMaterial(obj);
          splitMeshes.forEach(splitMesh => {
            this.editor.addObject(splitMesh);
          });
          results.push({ object: obj, success: true, result: splitMeshes });
        });
        break;
    }

    return results;
  }

  // Get supported mesh operations
  getSupportedOperations() {
    return [
      'create', 'merge', 'split', 'optimize', 'triangulate',
      'wireframe', 'edges', 'boundingBox', 'boundingSphere'
    ];
  }

  // Get operation description
  getOperationDescription(operation) {
    const descriptions = {
      create: 'Create new mesh',
      merge: 'Merge selected meshes',
      split: 'Split mesh by materials',
      optimize: 'Optimize mesh geometry',
      triangulate: 'Convert mesh to triangles',
      wireframe: 'Convert to wireframe',
      edges: 'Convert to edges',
      boundingBox: 'Create bounding box',
      boundingSphere: 'Create bounding sphere'
    };
    
    return descriptions[operation] || 'Unknown operation';
  }
}
