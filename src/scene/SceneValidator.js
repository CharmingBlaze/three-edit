/**
 * @fileoverview Scene Validator
 * Validation functions for scene integrity and quality
 */

/**
 * Scene validation functions
 */
export class SceneValidator {
  /**
   * Validate scene integrity
   * @param {Scene} scene - Target scene
   * @returns {Object} Validation result
   */
  static validateScene(scene) {
    const errors = [];
    const warnings = [];

    // Validate scene structure
    const structureValidation = this.validateSceneStructure(scene);
    errors.push(...structureValidation.errors);
    warnings.push(...structureValidation.warnings);

    // Validate meshes
    const meshes = scene.getAllMeshes();
    meshes.forEach(mesh => {
      const meshValidation = this.validateMesh(mesh);
      errors.push(...meshValidation.errors.map(error => `Mesh ${mesh.name}: ${error}`));
      warnings.push(...meshValidation.warnings.map(warning => `Mesh ${mesh.name}: ${warning}`));
    });

    // Validate children
    const children = scene.getAllChildren();
    children.forEach(child => {
      const childValidation = this.validateScene(child);
      errors.push(...childValidation.errors.map(error => `Child ${child.name}: ${error}`));
      warnings.push(...childValidation.warnings.map(warning => `Child ${child.name}: ${warning}`));
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate scene structure
   * @param {Scene} scene - Target scene
   * @returns {Object} Validation result
   */
  static validateSceneStructure(scene) {
    const errors = [];
    const warnings = [];

    // Check for required properties
    if (!scene.name) {
      errors.push('Scene must have a name');
    }

    if (!scene.id) {
      errors.push('Scene must have an ID');
    }

    // Check for circular references
    const visited = new Set();
    const checkCircular = (currentScene, path = []) => {
      if (visited.has(currentScene.id)) {
        errors.push(`Circular reference detected: ${path.join(' -> ')}`);
        return;
      }

      visited.add(currentScene.id);
      path.push(currentScene.name);

      currentScene.getAllChildren().forEach(child => {
        checkCircular(child, [...path]);
      });
    };

    checkCircular(scene);

    // Check for orphaned meshes
    const meshes = scene.getAllMeshes();
    meshes.forEach(mesh => {
      if (!mesh.name) {
        warnings.push('Mesh without name found');
      }
    });

    return { errors, warnings };
  }

  /**
   * Validate mesh integrity
   * @param {EditableMesh} mesh - Target mesh
   * @returns {Object} Validation result
   */
  static validateMesh(mesh) {
    const errors = [];
    const warnings = [];

    // Check for empty mesh
    if (mesh.vertices.size === 0) {
      errors.push('Mesh has no vertices');
    }

    if (mesh.faces.size === 0) {
      warnings.push('Mesh has no faces');
    }

    // Check for orphaned vertices
    const usedVertices = new Set();
    mesh.faces.forEach(face => {
      face.vertexIds.forEach(id => usedVertices.add(id));
    });

    mesh.vertices.forEach((vertex, id) => {
      if (!usedVertices.has(id)) {
        warnings.push(`Orphaned vertex: ${id}`);
      }
    });

    // Check for invalid faces
    mesh.faces.forEach((face, id) => {
      if (face.vertexIds.length < 3) {
        errors.push(`Face ${id} has less than 3 vertices`);
      }

      // Check for duplicate vertices in face
      const uniqueIds = [...new Set(face.vertexIds)];
      if (uniqueIds.length !== face.vertexIds.length) {
        errors.push(`Face ${id} has duplicate vertices`);
      }

      // Check for non-existent vertices
      face.vertexIds.forEach(vertexId => {
        if (!mesh.vertices.has(vertexId)) {
          errors.push(`Face ${id} references non-existent vertex: ${vertexId}`);
        }
      });
    });

    // Check for invalid edges
    mesh.edges.forEach((edge, id) => {
      if (!mesh.vertices.has(edge.vertexId1) || !mesh.vertices.has(edge.vertexId2)) {
        errors.push(`Edge ${id} references non-existent vertices`);
      }
    });

    // Check for invalid UVs
    mesh.uvs.forEach((uv, id) => {
      if (!mesh.vertices.has(uv.vertexId)) {
        errors.push(`UV ${id} references non-existent vertex: ${uv.vertexId}`);
      }

      if (uv.u < 0 || uv.u > 1 || uv.v < 0 || uv.v > 1) {
        warnings.push(`UV ${id} coordinates outside [0,1] range`);
      }
    });

    return { errors, warnings };
  }

  /**
   * Validate scene performance
   * @param {Scene} scene - Target scene
   * @returns {Object} Performance validation result
   */
  static validatePerformance(scene) {
    const warnings = [];
    const meshes = scene.getAllMeshes();

    // Check for high vertex count
    let totalVertices = 0;
    meshes.forEach(mesh => {
      totalVertices += mesh.vertices.size;
      if (mesh.vertices.size > 10000) {
        warnings.push(`Mesh ${mesh.name} has high vertex count: ${mesh.vertices.size}`);
      }
    });

    if (totalVertices > 100000) {
      warnings.push(`Scene has very high total vertex count: ${totalVertices}`);
    }

    // Check for high face count
    let totalFaces = 0;
    meshes.forEach(mesh => {
      totalFaces += mesh.faces.size;
      if (mesh.faces.size > 5000) {
        warnings.push(`Mesh ${mesh.name} has high face count: ${mesh.faces.size}`);
      }
    });

    if (totalFaces > 50000) {
      warnings.push(`Scene has very high total face count: ${totalFaces}`);
    }

    // Check for many meshes
    if (meshes.length > 100) {
      warnings.push(`Scene has many meshes: ${meshes.length}`);
    }

    return { warnings };
  }

  /**
   * Validate scene topology
   * @param {Scene} scene - Target scene
   * @returns {Object} Topology validation result
   */
  static validateTopology(scene) {
    const errors = [];
    const warnings = [];

    const meshes = scene.getAllMeshes();
    meshes.forEach(mesh => {
      const topologyValidation = this.validateMeshTopology(mesh);
      errors.push(...topologyValidation.errors.map(error => `Mesh ${mesh.name}: ${error}`));
      warnings.push(...topologyValidation.warnings.map(warning => `Mesh ${mesh.name}: ${warning}`));
    });

    return { errors, warnings };
  }

  /**
   * Validate mesh topology
   * @param {EditableMesh} mesh - Target mesh
   * @returns {Object} Topology validation result
   */
  static validateMeshTopology(mesh) {
    const errors = [];
    const warnings = [];

    // Check for non-manifold edges
    const edgeCount = new Map();
    mesh.faces.forEach(face => {
      for (let i = 0; i < face.vertexIds.length; i++) {
        const v1 = face.vertexIds[i];
        const v2 = face.vertexIds[(i + 1) % face.vertexIds.length];
        const edgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
        edgeCount.set(edgeKey, (edgeCount.get(edgeKey) || 0) + 1);
      }
    });

    edgeCount.forEach((count, edge) => {
      if (count > 2) {
        errors.push(`Non-manifold edge: ${edge} (${count} faces)`);
      }
    });

    // Check for open boundaries
    const boundaryEdges = [];
    edgeCount.forEach((count, edge) => {
      if (count === 1) {
        boundaryEdges.push(edge);
      }
    });

    if (boundaryEdges.length > 0) {
      warnings.push(`Open boundary with ${boundaryEdges.length} edges`);
    }

    // Check for degenerate faces
    mesh.faces.forEach((face, id) => {
      const uniqueVertices = [...new Set(face.vertexIds)];
      if (uniqueVertices.length < 3) {
        errors.push(`Degenerate face: ${id}`);
      }
    });

    return { errors, warnings };
  }

  /**
   * Get validation summary
   * @param {Scene} scene - Target scene
   * @returns {Object} Validation summary
   */
  static getValidationSummary(scene) {
    const integrity = this.validateScene(scene);
    const performance = this.validatePerformance(scene);
    const topology = this.validateTopology(scene);

    return {
      integrity,
      performance,
      topology,
      totalErrors: integrity.errors.length + topology.errors.length,
      totalWarnings: integrity.warnings.length + performance.warnings.length + topology.warnings.length,
      isValid: integrity.errors.length === 0 && topology.errors.length === 0
    };
  }
} 