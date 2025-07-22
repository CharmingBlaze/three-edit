/**
 * @fileoverview Scene Operations
 * Specific operations for scene manipulation and management
 */

import { EditableMesh } from '../EditableMesh.js';

/**
 * Scene operation functions
 */
export class SceneOperations {
  /**
   * Duplicate mesh in scene
   * @param {Scene} scene - Target scene
   * @param {string} meshId - Mesh ID to duplicate
   * @param {Object} options - Duplication options
   * @returns {EditableMesh|null} Duplicated mesh or null
   */
  static duplicateMesh(scene, meshId, options = {}) {
    const {
      offset = { x: 1, y: 0, z: 0 },
      scale = { x: 1, y: 1, z: 1 },
      rotation = { x: 0, y: 0, z: 0 }
    } = options;

    const originalMesh = scene.getMesh(meshId);
    if (!originalMesh) {return null;}

    const duplicatedMesh = originalMesh.clone();
    duplicatedMesh.name = `${originalMesh.name}_copy`;

    // Apply transformations
    duplicatedMesh.vertices.forEach(vertex => {
      // Apply scale
      vertex.x *= scale.x;
      vertex.y *= scale.y;
      vertex.z *= scale.z;

      // Apply rotation (simplified)
      if (rotation.x !== 0) {
        const cosX = Math.cos(rotation.x);
        const sinX = Math.sin(rotation.x);
        const oldY = vertex.y;
        const oldZ = vertex.z;
        vertex.y = oldY * cosX - oldZ * sinX;
        vertex.z = oldY * sinX + oldZ * cosX;
      }

      // Apply offset
      vertex.x += offset.x;
      vertex.y += offset.y;
      vertex.z += offset.z;
    });

    scene.addMesh(duplicatedMesh);
    return duplicatedMesh;
  }

  /**
   * Group meshes in scene
   * @param {Scene} scene - Target scene
   * @param {string[]} meshIds - Mesh IDs to group
   * @param {Object} options - Grouping options
   * @returns {Scene|null} Group scene or null
   */
  static groupMeshes(scene, meshIds, options = {}) {
    const {
      name = 'Group',
      center = true
    } = options;

    const meshes = meshIds.map(id => scene.getMesh(id)).filter(mesh => mesh);
    if (meshes.length === 0) {return null;}

    const groupScene = new Scene({ name });

    // Move meshes to group
    meshes.forEach(mesh => {
      scene.removeMesh(mesh.id);
      groupScene.addMesh(mesh);
    });

    // Center group if requested
    if (center) {
      this.centerGroup(groupScene);
    }

    scene.addChild(groupScene);
    return groupScene;
  }

  /**
   * Center group at origin
   * @param {Scene} groupScene - Group scene to center
   */
  static centerGroup(groupScene) {
    const meshes = groupScene.getAllMeshes();
    if (meshes.length === 0) {return;}

    // Calculate group center
    let centerX = 0, centerY = 0, centerZ = 0;
    let totalVertices = 0;

    meshes.forEach(mesh => {
      mesh.vertices.forEach(vertex => {
        centerX += vertex.x;
        centerY += vertex.y;
        centerZ += vertex.z;
        totalVertices++;
      });
    });

    if (totalVertices === 0) {return;}

    centerX /= totalVertices;
    centerY /= totalVertices;
    centerZ /= totalVertices;

    // Move all vertices to center
    meshes.forEach(mesh => {
      mesh.vertices.forEach(vertex => {
        vertex.x -= centerX;
        vertex.y -= centerY;
        vertex.z -= centerZ;
      });
    });
  }

  /**
   * Ungroup meshes
   * @param {Scene} scene - Parent scene
   * @param {string} groupId - Group scene ID
   * @returns {EditableMesh[]} Ungrouped meshes
   */
  static ungroupMeshes(scene, groupId) {
    const groupScene = scene.getChild(groupId);
    if (!groupScene) {return [];}

    const meshes = groupScene.getAllMeshes();
    const ungroupedMeshes = [];

    meshes.forEach(mesh => {
      groupScene.removeMesh(mesh.id);
      scene.addMesh(mesh);
      ungroupedMeshes.push(mesh);
    });

    scene.removeChild(groupId);
    return ungroupedMeshes;
  }

  /**
   * Align meshes
   * @param {Scene} scene - Target scene
   * @param {string[]} meshIds - Mesh IDs to align
   * @param {Object} options - Alignment options
   * @returns {boolean} Success status
   */
  static alignMeshes(scene, meshIds, options = {}) {
    const {
      axis = 'x',
      alignment = 'center' // 'min', 'center', 'max'
    } = options;

    const meshes = meshIds.map(id => scene.getMesh(id)).filter(mesh => mesh);
    if (meshes.length === 0) {return false;}

    // Calculate alignment value
    let alignValue = 0;
    const bounds = [];

    meshes.forEach(mesh => {
      const meshBounds = this.calculateMeshBounds(mesh);
      bounds.push(meshBounds);
    });

    switch (alignment) {
      case 'min':
        alignValue = Math.min(...bounds.map(b => b.min[axis]));
        break;
      case 'center':
        const centers = bounds.map(b => (b.min[axis] + b.max[axis]) / 2);
        alignValue = centers.reduce((sum, center) => sum + center, 0) / centers.length;
        break;
      case 'max':
        alignValue = Math.max(...bounds.map(b => b.max[axis]));
        break;
    }

    // Align meshes
    meshes.forEach(mesh => {
      const meshBounds = this.calculateMeshBounds(mesh);
      const meshCenter = (meshBounds.min[axis] + meshBounds.max[axis]) / 2;
      const offset = alignValue - meshCenter;

      mesh.vertices.forEach(vertex => {
        vertex[axis] += offset;
      });
    });

    return true;
  }

  /**
   * Distribute meshes evenly
   * @param {Scene} scene - Target scene
   * @param {string[]} meshIds - Mesh IDs to distribute
   * @param {Object} options - Distribution options
   * @returns {boolean} Success status
   */
  static distributeMeshes(scene, meshIds, options = {}) {
    const {
      axis = 'x',
      spacing = 1
    } = options;

    const meshes = meshIds.map(id => scene.getMesh(id)).filter(mesh => mesh);
    if (meshes.length < 2) {return false;}

    // Sort meshes by position
    meshes.sort((a, b) => {
      const aCenter = this.calculateMeshCenter(a);
      const bCenter = this.calculateMeshCenter(b);
      return aCenter[axis] - bCenter[axis];
    });

    // Calculate total span
    const firstBounds = this.calculateMeshBounds(meshes[0]);
    const lastBounds = this.calculateMeshBounds(meshes[meshes.length - 1]);
    const totalSpan = lastBounds.max[axis] - firstBounds.min[axis];

    // Calculate spacing
    const totalSpacing = spacing * (meshes.length - 1);
    const availableSpace = totalSpan + totalSpacing;
    const step = availableSpace / (meshes.length - 1);

    // Distribute meshes
    for (let i = 1; i < meshes.length; i++) {
      const mesh = meshes[i];
      const targetPosition = firstBounds.min[axis] + (step * i);
      const currentCenter = this.calculateMeshCenter(mesh);
      const offset = targetPosition - currentCenter[axis];

      mesh.vertices.forEach(vertex => {
        vertex[axis] += offset;
      });
    }

    return true;
  }

  /**
   * Calculate mesh bounds
   * @param {EditableMesh} mesh - Target mesh
   * @returns {Object} Bounds object
   */
  static calculateMeshBounds(mesh) {
    const vertices = Array.from(mesh.vertices.values());
    if (vertices.length === 0) {
      return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
    }

    const bounds = {
      min: { x: Infinity, y: Infinity, z: Infinity },
      max: { x: -Infinity, y: -Infinity, z: -Infinity }
    };

    vertices.forEach(vertex => {
      bounds.min.x = Math.min(bounds.min.x, vertex.x);
      bounds.min.y = Math.min(bounds.min.y, vertex.y);
      bounds.min.z = Math.min(bounds.min.z, vertex.z);
      bounds.max.x = Math.max(bounds.max.x, vertex.x);
      bounds.max.y = Math.max(bounds.max.y, vertex.y);
      bounds.max.z = Math.max(bounds.max.z, vertex.z);
    });

    return bounds;
  }

  /**
   * Calculate mesh center
   * @param {EditableMesh} mesh - Target mesh
   * @returns {Object} Center point
   */
  static calculateMeshCenter(mesh) {
    const bounds = this.calculateMeshBounds(mesh);
    return {
      x: (bounds.min.x + bounds.max.x) / 2,
      y: (bounds.min.y + bounds.max.y) / 2,
      z: (bounds.min.z + bounds.max.z) / 2
    };
  }
} 