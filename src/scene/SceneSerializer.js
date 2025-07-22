/**
 * @fileoverview Scene Serializer
 * Serialization and deserialization functions for scenes
 */

/**
 * Scene serialization functions
 */
export class SceneSerializer {
  /**
   * Serialize scene to JSON
   * @param {Scene} scene - Target scene
   * @param {Object} options - Serialization options
   * @returns {Object} Serialized scene data
   */
  static serialize(scene, options = {}) {
    const {
      includeMeshes = true,
      includeChildren = true,
      includeMetadata = true,
      compact = false
    } = options;

    const data = {
      version: '1.0',
      type: 'scene'
    };

    if (includeMetadata) {
      data.metadata = {
        name: scene.name,
        id: scene.id,
        createdAt: scene.createdAt,
        updatedAt: scene.updatedAt,
        visible: scene.visible,
        active: scene.active
      };
    }

    data.settings = {
      camera: { ...scene.camera },
      lighting: { ...scene.lighting },
      environment: { ...scene.environment }
    };

    if (includeMeshes) {
      data.meshes = this.serializeMeshes(scene, compact);
    }

    if (includeChildren) {
      data.children = this.serializeChildren(scene, options);
    }

    return data;
  }

  /**
   * Serialize meshes
   * @param {Scene} scene - Target scene
   * @param {boolean} compact - Use compact format
   * @returns {Object} Serialized meshes
   */
  static serializeMeshes(scene, compact = false) {
    const meshes = {};
    
    scene.getAllMeshes().forEach(mesh => {
      meshes[mesh.id] = this.serializeMesh(mesh, compact);
    });

    return meshes;
  }

  /**
   * Serialize single mesh
   * @param {EditableMesh} mesh - Target mesh
   * @param {boolean} compact - Use compact format
   * @returns {Object} Serialized mesh
   */
  static serializeMesh(mesh, compact = false) {
    const data = {
      name: mesh.name,
      type: mesh.type || 'standard'
    };

    if (!compact) {
      data.vertices = this.serializeVertices(mesh);
      data.faces = this.serializeFaces(mesh);
      data.edges = this.serializeEdges(mesh);
      data.uvs = this.serializeUVs(mesh);
      data.material = { ...mesh.material };
      data.attributes = Object.fromEntries(mesh.attributes);
    } else {
      data.vertexCount = mesh.vertices.size;
      data.faceCount = mesh.faces.size;
      data.edgeCount = mesh.edges.size;
      data.uvCount = mesh.uvs.size;
    }

    return data;
  }

  /**
   * Serialize vertices
   * @param {EditableMesh} mesh - Target mesh
   * @returns {Object} Serialized vertices
   */
  static serializeVertices(mesh) {
    const vertices = {};
    
    mesh.vertices.forEach((vertex, id) => {
      vertices[id] = {
        x: vertex.x,
        y: vertex.y,
        z: vertex.z,
        normal: vertex.normal ? { ...vertex.normal } : null,
        attributes: Object.fromEntries(vertex.attributes || new Map())
      };
    });

    return vertices;
  }

  /**
   * Serialize faces
   * @param {EditableMesh} mesh - Target mesh
   * @returns {Object} Serialized faces
   */
  static serializeFaces(mesh) {
    const faces = {};
    
    mesh.faces.forEach((face, id) => {
      faces[id] = {
        vertexIds: [...face.vertexIds],
        normal: face.normal ? { ...face.normal } : null,
        attributes: Object.fromEntries(face.attributes || new Map())
      };
    });

    return faces;
  }

  /**
   * Serialize edges
   * @param {EditableMesh} mesh - Target mesh
   * @returns {Object} Serialized edges
   */
  static serializeEdges(mesh) {
    const edges = {};
    
    mesh.edges.forEach((edge, id) => {
      edges[id] = {
        vertexId1: edge.vertexId1,
        vertexId2: edge.vertexId2,
        attributes: Object.fromEntries(edge.attributes || new Map())
      };
    });

    return edges;
  }

  /**
   * Serialize UVs
   * @param {EditableMesh} mesh - Target mesh
   * @returns {Object} Serialized UVs
   */
  static serializeUVs(mesh) {
    const uvs = {};
    
    mesh.uvs.forEach((uv, id) => {
      uvs[id] = {
        u: uv.u,
        v: uv.v,
        vertexId: uv.vertexId,
        attributes: Object.fromEntries(uv.attributes || new Map())
      };
    });

    return uvs;
  }

  /**
   * Serialize children
   * @param {Scene} scene - Target scene
   * @param {Object} options - Serialization options
   * @returns {Object} Serialized children
   */
  static serializeChildren(scene, options = {}) {
    const children = {};
    
    scene.getAllChildren().forEach(child => {
      children[child.id] = this.serialize(child, options);
    });

    return children;
  }

  /**
   * Deserialize scene from JSON
   * @param {Object} data - Serialized scene data
   * @returns {Scene} Deserialized scene
   */
  static deserialize(data) {
    if (!data || data.type !== 'scene') {
      throw new Error('Invalid scene data');
    }

    const scene = new Scene({
      name: data.metadata?.name || 'Imported Scene',
      id: data.metadata?.id,
      camera: data.settings?.camera || {},
      lighting: data.settings?.lighting || {},
      environment: data.settings?.environment || {}
    });

    // Restore metadata
    if (data.metadata) {
      scene.createdAt = data.metadata.createdAt || Date.now();
      scene.updatedAt = data.metadata.updatedAt || Date.now();
      scene.visible = data.metadata.visible !== undefined ? data.metadata.visible : true;
      scene.active = data.metadata.active || false;
    }

    // Deserialize meshes
    if (data.meshes) {
      this.deserializeMeshes(scene, data.meshes);
    }

    // Deserialize children
    if (data.children) {
      this.deserializeChildren(scene, data.children);
    }

    return scene;
  }

  /**
   * Deserialize meshes
   * @param {Scene} scene - Target scene
   * @param {Object} meshesData - Serialized meshes data
   */
  static deserializeMeshes(scene, meshesData) {
    Object.entries(meshesData).forEach(([id, meshData]) => {
      const mesh = this.deserializeMesh(meshData);
      scene.addMesh(mesh);
    });
  }

  /**
   * Deserialize single mesh
   * @param {Object} meshData - Serialized mesh data
   * @returns {EditableMesh} Deserialized mesh
   */
  static deserializeMesh(meshData) {
    const { EditableMesh, Vertex, Edge, Face, UV } = require('../EditableMesh.js');
    
    const mesh = new EditableMesh({
      name: meshData.name,
      type: meshData.type
    });

    // Deserialize vertices
    if (meshData.vertices) {
      Object.entries(meshData.vertices).forEach(([id, vertexData]) => {
        const vertex = new Vertex(vertexData.x, vertexData.y, vertexData.z);
        vertex.id = id;
        
        if (vertexData.normal) {
          vertex.setNormal(vertexData.normal.x, vertexData.normal.y, vertexData.normal.z);
        }

        if (vertexData.attributes) {
          Object.entries(vertexData.attributes).forEach(([key, value]) => {
            vertex.setAttribute(key, value);
          });
        }

        mesh.addVertex(vertex);
      });
    }

    // Deserialize faces
    if (meshData.faces) {
      Object.entries(meshData.faces).forEach(([id, faceData]) => {
        const face = new Face(faceData.vertexIds);
        face.id = id;
        
        if (faceData.normal) {
          face.setNormal(faceData.normal.x, faceData.normal.y, faceData.normal.z);
        }

        if (faceData.attributes) {
          Object.entries(faceData.attributes).forEach(([key, value]) => {
            face.setAttribute(key, value);
          });
        }

        mesh.addFace(face);
      });
    }

    // Deserialize edges
    if (meshData.edges) {
      Object.entries(meshData.edges).forEach(([id, edgeData]) => {
        const edge = new Edge(edgeData.vertexId1, edgeData.vertexId2);
        edge.id = id;

        if (edgeData.attributes) {
          Object.entries(edgeData.attributes).forEach(([key, value]) => {
            edge.setAttribute(key, value);
          });
        }

        mesh.addEdge(edge);
      });
    }

    // Deserialize UVs
    if (meshData.uvs) {
      Object.entries(meshData.uvs).forEach(([id, uvData]) => {
        const uv = new UV(uvData.u, uvData.v, uvData.vertexId);
        uv.id = id;

        if (uvData.attributes) {
          Object.entries(uvData.attributes).forEach(([key, value]) => {
            uv.setAttribute(key, value);
          });
        }

        mesh.addUV(uv);
      });
    }

    // Restore material and attributes
    if (meshData.material) {
      mesh.material = { ...meshData.material };
    }

    if (meshData.attributes) {
      Object.entries(meshData.attributes).forEach(([key, value]) => {
        mesh.setAttribute(key, value);
      });
    }

    return mesh;
  }

  /**
   * Deserialize children
   * @param {Scene} scene - Target scene
   * @param {Object} childrenData - Serialized children data
   */
  static deserializeChildren(scene, childrenData) {
    Object.entries(childrenData).forEach(([id, childData]) => {
      const childScene = this.deserialize(childData);
      scene.addChild(childScene);
    });
  }

  /**
   * Export scene to file format
   * @param {Scene} scene - Target scene
   * @param {string} format - Export format ('json', 'gltf', 'obj')
   * @param {Object} options - Export options
   * @returns {string|Blob} Exported data
   */
  static export(scene, format = 'json', options = {}) {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(this.serialize(scene, options), null, 2);
      case 'gltf':
        return this.exportToGLTF(scene, options);
      case 'obj':
        return this.exportToOBJ(scene, options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export to GLTF format
   * @param {Scene} scene - Target scene
   * @param {Object} options - Export options
   * @returns {string} GLTF data
   */
  static exportToGLTF(scene, options = {}) {
    // Simplified GLTF export - in a real implementation, you'd use a proper GLTF library
    const gltf = {
      asset: {
        version: '2.0',
        generator: 'SceneSerializer'
      },
      scene: 0,
      scenes: [{
        nodes: []
      }],
      nodes: [],
      meshes: [],
      accessors: [],
      bufferViews: [],
      buffers: []
    };

    // Convert meshes to GLTF format
    scene.getAllMeshes().forEach((mesh, index) => {
      const nodeIndex = gltf.nodes.length;
      const meshIndex = gltf.meshes.length;

      gltf.nodes.push({
        mesh: meshIndex
      });

      gltf.scenes[0].nodes.push(nodeIndex);

      // Convert mesh to GLTF mesh
      const gltfMesh = this.convertMeshToGLTF(mesh);
      gltf.meshes.push(gltfMesh);
    });

    return JSON.stringify(gltf, null, 2);
  }

  /**
   * Convert mesh to GLTF format
   * @param {EditableMesh} mesh - Target mesh
   * @returns {Object} GLTF mesh
   */
  static convertMeshToGLTF(mesh) {
    // Simplified conversion - in a real implementation, you'd handle all GLTF specifics
    const vertices = Array.from(mesh.vertices.values());
    const positions = [];
    const normals = [];

    vertices.forEach(vertex => {
      positions.push(vertex.x, vertex.y, vertex.z);
      if (vertex.normal) {
        normals.push(vertex.normal.x, vertex.normal.y, vertex.normal.z);
      } else {
        normals.push(0, 1, 0); // Default normal
      }
    });

    return {
      primitives: [{
        attributes: {
          POSITION: 0,
          NORMAL: 1
        },
        indices: 2
      }]
    };
  }

  /**
   * Export to OBJ format
   * @param {Scene} scene - Target scene
   * @param {Object} options - Export options
   * @returns {string} OBJ data
   */
  static exportToOBJ(scene, options = {}) {
    let obj = '# Exported by SceneSerializer\n\n';
    let vertexOffset = 1;

    scene.getAllMeshes().forEach(mesh => {
      obj += `# Mesh: ${mesh.name}\n`;
      obj += `g ${mesh.name}\n`;

      // Export vertices
      mesh.vertices.forEach(vertex => {
        obj += `v ${vertex.x} ${vertex.y} ${vertex.z}\n`;
      });

      // Export faces
      mesh.faces.forEach(face => {
        const indices = face.vertexIds.map(id => {
          const vertexIndex = Array.from(mesh.vertices.keys()).indexOf(id);
          return vertexIndex + vertexOffset;
        });
        obj += `f ${indices.join(' ')}\n`;
      });

      vertexOffset += mesh.vertices.size;
      obj += '\n';
    });

    return obj;
  }
} 