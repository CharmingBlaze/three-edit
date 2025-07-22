/**
 * @fileoverview Scene Utilities
 * Utility functions for scene operations and management
 */

import { EditableMesh } from '../EditableMesh.js';

/**
 * Scene utility functions
 */
export class SceneUtils {
  /**
   * Calculate scene bounds
   * @param {Scene} scene - Target scene
   * @returns {Object} Bounds object
   */
  static calculateBounds(scene) {
    const meshes = scene.getAllMeshes();
    if (meshes.length === 0) {
      return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
    }

    const bounds = {
      min: { x: Infinity, y: Infinity, z: Infinity },
      max: { x: -Infinity, y: -Infinity, z: -Infinity }
    };

    meshes.forEach(mesh => {
      const meshBounds = this.calculateMeshBounds(mesh);
      bounds.min.x = Math.min(bounds.min.x, meshBounds.min.x);
      bounds.min.y = Math.min(bounds.min.y, meshBounds.min.y);
      bounds.min.z = Math.min(bounds.min.z, meshBounds.min.z);
      bounds.max.x = Math.max(bounds.max.x, meshBounds.max.x);
      bounds.max.y = Math.max(bounds.max.y, meshBounds.max.y);
      bounds.max.z = Math.max(bounds.max.z, meshBounds.max.z);
    });

    return bounds;
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
   * Calculate scene center
   * @param {Scene} scene - Target scene
   * @returns {Object} Center point
   */
  static calculateCenter(scene) {
    const bounds = this.calculateBounds(scene);
    return {
      x: (bounds.min.x + bounds.max.x) / 2,
      y: (bounds.min.y + bounds.max.y) / 2,
      z: (bounds.min.z + bounds.max.z) / 2
    };
  }

  /**
   * Calculate scene dimensions
   * @param {Scene} scene - Target scene
   * @returns {Object} Dimensions object
   */
  static calculateDimensions(scene) {
    const bounds = this.calculateBounds(scene);
    return {
      width: bounds.max.x - bounds.min.x,
      height: bounds.max.y - bounds.min.y,
      depth: bounds.max.z - bounds.min.z
    };
  }

  /**
   * Find meshes by name pattern
   * @param {Scene} scene - Target scene
   * @param {string} pattern - Name pattern (supports wildcards)
   * @returns {EditableMesh[]} Matching meshes
   */
  static findMeshesByName(scene, pattern) {
    const meshes = scene.getAllMeshes();
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    
    return meshes.filter(mesh => regex.test(mesh.name));
  }

  /**
   * Find meshes by type
   * @param {Scene} scene - Target scene
   * @param {string} type - Mesh type
   * @returns {EditableMesh[]} Matching meshes
   */
  static findMeshesByType(scene, type) {
    const meshes = scene.getAllMeshes();
    return meshes.filter(mesh => mesh.type === type);
  }

  /**
   * Get scene statistics
   * @param {Scene} scene - Target scene
   * @returns {Object} Statistics object
   */
  static getStatistics(scene) {
    const meshes = scene.getAllMeshes();
    let totalVertices = 0;
    let totalFaces = 0;
    let totalEdges = 0;
    let totalUVs = 0;

    meshes.forEach(mesh => {
      totalVertices += mesh.vertices.size;
      totalFaces += mesh.faces.size;
      totalEdges += mesh.edges.size;
      totalUVs += mesh.uvs.size;
    });

    return {
      meshCount: meshes.length,
      totalVertices,
      totalFaces,
      totalEdges,
      totalUVs,
      averageVerticesPerMesh: meshes.length > 0 ? totalVertices / meshes.length : 0,
      averageFacesPerMesh: meshes.length > 0 ? totalFaces / meshes.length : 0
    };
  }

  /**
   * Optimize scene
   * @param {Scene} scene - Target scene
   * @param {Object} options - Optimization options
   * @returns {Object} Optimization results
   */
  static optimizeScene(scene, options = {}) {
    const {
      mergeVertices = true,
      removeUnusedVertices = true,
      optimizeFaces = true,
      removeDuplicateFaces = true
    } = options;

    const results = {
      originalStats: this.getStatistics(scene),
      optimizations: []
    };

    const meshes = scene.getAllMeshes();
    meshes.forEach(mesh => {
      if (mergeVertices) {
        const mergedCount = this.mergeVertices(mesh);
        if (mergedCount > 0) {
          results.optimizations.push(`Merged ${mergedCount} vertices in ${mesh.name}`);
        }
      }

      if (removeUnusedVertices) {
        const removedCount = this.removeUnusedVertices(mesh);
        if (removedCount > 0) {
          results.optimizations.push(`Removed ${removedCount} unused vertices in ${mesh.name}`);
        }
      }

      if (optimizeFaces) {
        const optimizedCount = this.optimizeFaces(mesh);
        if (optimizedCount > 0) {
          results.optimizations.push(`Optimized ${optimizedCount} faces in ${mesh.name}`);
        }
      }

      if (removeDuplicateFaces) {
        const removedCount = this.removeDuplicateFaces(mesh);
        if (removedCount > 0) {
          results.optimizations.push(`Removed ${removedCount} duplicate faces in ${mesh.name}`);
        }
      }
    });

    results.finalStats = this.getStatistics(scene);
    return results;
  }

  /**
   * Merge nearby vertices
   * @param {EditableMesh} mesh - Target mesh
   * @param {number} threshold - Distance threshold
   * @returns {number} Number of merged vertices
   */
  static mergeVertices(mesh, threshold = 0.001) {
    const vertices = Array.from(mesh.vertices.values());
    const merged = new Set();
    let mergedCount = 0;

    for (let i = 0; i < vertices.length; i++) {
      if (merged.has(i)) {continue;}

      for (let j = i + 1; j < vertices.length; j++) {
        if (merged.has(j)) {continue;}

        const v1 = vertices[i];
        const v2 = vertices[j];
        const distance = Math.sqrt(
          Math.pow(v1.x - v2.x, 2) +
          Math.pow(v1.y - v2.y, 2) +
          Math.pow(v1.z - v2.z, 2)
        );

        if (distance < threshold) {
          // Replace v2 with v1 in all faces
          mesh.faces.forEach(face => {
            face.vertexIds = face.vertexIds.map(id => 
              id === v2.id ? v1.id : id
            );
          });

          // Remove v2
          mesh.vertices.delete(v2.id);
          merged.add(j);
          mergedCount++;
        }
      }
    }

    return mergedCount;
  }

  /**
   * Remove unused vertices
   * @param {EditableMesh} mesh - Target mesh
   * @returns {number} Number of removed vertices
   */
  static removeUnusedVertices(mesh) {
    const usedVertices = new Set();
    mesh.faces.forEach(face => {
      face.vertexIds.forEach(id => usedVertices.add(id));
    });

    const unusedVertices = [];
    mesh.vertices.forEach((vertex, id) => {
      if (!usedVertices.has(id)) {
        unusedVertices.push(id);
      }
    });

    unusedVertices.forEach(id => {
      mesh.vertices.delete(id);
    });

    return unusedVertices.length;
  }

  /**
   * Optimize faces
   * @param {EditableMesh} mesh - Target mesh
   * @returns {number} Number of optimized faces
   */
  static optimizeFaces(mesh) {
    let optimizedCount = 0;

    mesh.faces.forEach(face => {
      // Remove duplicate vertex IDs
      const uniqueIds = [...new Set(face.vertexIds)];
      if (uniqueIds.length !== face.vertexIds.length) {
        face.vertexIds = uniqueIds;
        optimizedCount++;
      }
    });

    return optimizedCount;
  }

  /**
   * Remove duplicate faces
   * @param {EditableMesh} mesh - Target mesh
   * @returns {number} Number of removed faces
   */
  static removeDuplicateFaces(mesh) {
    const seen = new Set();
    const toRemove = [];

    mesh.faces.forEach((face, id) => {
      const key = face.vertexIds.sort().join(',');
      if (seen.has(key)) {
        toRemove.push(id);
      } else {
        seen.add(key);
      }
    });

    toRemove.forEach(id => {
      mesh.faces.delete(id);
    });

    return toRemove.length;
  }
} 