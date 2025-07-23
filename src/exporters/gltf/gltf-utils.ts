/**
 * GLTF Utilities
 * Shared helper functions for GLTF import/export operations
 */

import { Vector3, Matrix4, Quaternion, BufferGeometry, Material, Mesh, Object3D, Scene, BufferAttribute } from 'three';
import { EditableMesh } from '../../core/EditableMesh';
import { Edge } from '../../core/Edge';
import { Face } from '../../core/Face';
import { SceneGraph, SceneNode } from '../../scene';
import { GLTF, GLTFComponentTypes, GLTFPrimitiveModes } from '../../io/gltf/types';
import { GLTFImportOptions, GLTFExportOptions } from './options';

/**
 * Converts Three.js BufferGeometry to EditableMesh
 */
export function bufferGeometryToEditableMesh(geometry: BufferGeometry): EditableMesh {
  const mesh = new EditableMesh();
  
  // Get position attributes
  const positions = geometry.getAttribute('position') as BufferAttribute;
  const normals = geometry.getAttribute('normal') as BufferAttribute;
  const uvs = geometry.getAttribute('uv') as BufferAttribute;
  const colors = geometry.getAttribute('color') as BufferAttribute;
  
  if (!positions) {
    throw new Error('Geometry must have position attribute');
  }
  
  // Add vertices
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    const vertexData: any = {};
    
    // Add normal if available
    if (normals) {
      vertexData.normal = new Vector3(
        normals.getX(i),
        normals.getY(i),
        normals.getZ(i)
      );
    }
    
    // Add UV if available
    if (uvs) {
      vertexData.uv = {
        u: uvs.getX(i),
        v: uvs.getY(i)
      };
    }
    
    // Add color if available
    if (colors) {
      vertexData.color = new Vector3(
        colors.getX(i),
        colors.getY(i),
        colors.getZ(i)
      );
    }
    
    mesh.addVertex({ x, y, z, ...vertexData });
  }
  
  // Add faces from indices
  const indices = geometry.getIndex();
  if (indices) {
    for (let i = 0; i < indices.count; i += 3) {
      const v1 = indices.getX(i);
      const v2 = indices.getX(i + 1);
      const v3 = indices.getX(i + 2);
      
      // Create edges
      const edge1 = new Edge(v1, v2);
      const edge2 = new Edge(v2, v3);
      const edge3 = new Edge(v3, v1);
      
      const edge1Index = mesh.addEdge(edge1);
      const edge2Index = mesh.addEdge(edge2);
      const edge3Index = mesh.addEdge(edge3);
      
      // Create face
      const face = new Face([v1, v2, v3], [edge1Index, edge2Index, edge3Index]);
      
      mesh.addFace(face);
    }
  }
  
  return mesh;
}

/**
 * Converts EditableMesh to Three.js BufferGeometry
 */
export function editableMeshToBufferGeometry(mesh: EditableMesh): BufferGeometry {
  const geometry = new BufferGeometry();
  
  // Prepare vertex data
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  
  // Export vertices
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (vertex) {
      positions.push(vertex.x, vertex.y, vertex.z);
      
      if (vertex.normal) {
        normals.push(vertex.normal.x, vertex.normal.y, vertex.normal.z);
      } else {
        normals.push(0, 1, 0); // Default normal
      }
      
      if (vertex.uv) {
        uvs.push(vertex.uv.u, vertex.uv.v);
      } else {
        uvs.push(0, 0); // Default UV
      }
      
      // Note: Vertex class doesn't have color property, using default white
      colors.push(1, 1, 1); // Default color
    }
  }
  
  // Export faces as indices
  for (let i = 0; i < mesh.getFaceCount(); i++) {
    const face = mesh.getFace(i);
    if (face && face.vertices.length >= 3) {
      // Triangulate if necessary
      for (let j = 1; j < face.vertices.length - 1; j++) {
        indices.push(
          face.vertices[0],
          face.vertices[j],
          face.vertices[j + 1]
        );
      }
    }
  }
  
  // Set attributes
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  
  return geometry;
}

/**
 * Converts Three.js Object3D hierarchy to SceneGraph
 */
export function object3DToSceneGraph(object: Object3D): SceneGraph {
  const sceneGraph = new SceneGraph();
  
  function processNode(obj: Object3D, parentNode?: SceneNode): SceneNode {
    const node = new SceneNode({
      name: obj.name || 'Node',
      userData: { ...obj.userData }
    });
    
    // Copy transform
    node.setPosition(obj.position);
    node.setRotation(obj.rotation);
    node.setScale(obj.scale);
    
    // Copy matrix if different from decomposed transform
    if (obj.matrix && !obj.matrix.equals(new Matrix4())) {
      node.setTransform(obj.matrix);
    }
    
    // Handle mesh objects
    if (obj instanceof Mesh && obj.geometry) {
      node.mesh = bufferGeometryToEditableMesh(obj.geometry);
      
      // Store material reference
      if (obj.material) {
        node.userData.material = obj.material;
      }
    }
    
    // Add to scene graph
    if (parentNode) {
      parentNode.addChild(node);
    } else {
      sceneGraph.addNode(node);
    }
    
    // Process children
    for (const child of obj.children) {
      processNode(child, node);
    }
    
    return node;
  }
  
  processNode(object);
  return sceneGraph;
}

/**
 * Converts SceneGraph to Three.js Scene
 */
export function sceneGraphToScene(sceneGraph: SceneGraph): Scene {
  const scene = new Scene();
  
  function processNode(sceneNode: SceneNode, parentObject?: Object3D): Object3D {
    let object: Object3D;
    
    if (sceneNode.mesh) {
      const geometry = editableMeshToBufferGeometry(sceneNode.mesh);
      const material = sceneNode.userData.material || new (require('three').MeshStandardMaterial)();
      object = new Mesh(geometry, material);
    } else {
      object = new Object3D();
    }
    
    // Set name
    object.name = sceneNode.name;
    
    // Set transform
    object.position.copy(sceneNode.getPosition());
    object.rotation.copy(sceneNode.getRotation());
    object.scale.copy(sceneNode.getScale());
    
    const transform = sceneNode.getWorldMatrix();
    if (!transform.equals(new Matrix4())) {
      object.matrix.copy(transform);
      object.matrixAutoUpdate = false;
    }
    
    // Copy user data
    object.userData = { ...sceneNode.userData };
    
    // Add to parent
    if (parentObject) {
      parentObject.add(object);
    } else {
      scene.add(object);
    }
    
    // Process children
    for (const child of sceneNode.children) {
      processNode(child, object);
    }
    
    return object;
  }
  
  // Process root node children
  for (const child of sceneGraph.root.children) {
    processNode(child);
  }
  
  return scene;
}

/**
 * Applies coordinate system transformations
 */
export function applyCoordinateTransform(
  vector: Vector3,
  options: GLTFImportOptions | GLTFExportOptions
): Vector3 {
  const { scale = 1.0, flipY = false, flipZ = false } = options;
  
  const transformed = vector.clone();
  
  // Apply scale
  transformed.multiplyScalar(scale);
  
  // Apply coordinate flips
  if (flipY) {
    transformed.y *= -1;
  }
  
  if (flipZ) {
    transformed.z *= -1;
  }
  
  return transformed;
}

/**
 * Validates GLTF data structure
 */
export function validateGLTF(gltf: GLTF): string[] {
  const errors: string[] = [];
  
  // Check required asset field
  if (!gltf.asset || !gltf.asset.version) {
    errors.push('Missing or invalid asset.version field');
  }
  
  // Check version compatibility
  if (gltf.asset.version !== '2.0') {
    errors.push(`Unsupported GLTF version: ${gltf.asset.version}`);
  }
  
  // Validate meshes
  if (gltf.meshes) {
    for (let i = 0; i < gltf.meshes.length; i++) {
      const mesh = gltf.meshes[i];
      if (!mesh.primitives || mesh.primitives.length === 0) {
        errors.push(`Mesh ${i} has no primitives`);
      }
      
      for (let j = 0; j < mesh.primitives.length; j++) {
        const primitive = mesh.primitives[j];
        if (!primitive.attributes || !primitive.attributes.POSITION) {
          errors.push(`Mesh ${i}, primitive ${j} missing POSITION attribute`);
        }
      }
    }
  }
  
  // Validate accessors
  if (gltf.accessors) {
    for (let i = 0; i < gltf.accessors.length; i++) {
      const accessor = gltf.accessors[i];
      if (accessor.bufferView !== undefined && accessor.bufferView >= (gltf.bufferViews?.length || 0)) {
        errors.push(`Accessor ${i} references invalid bufferView ${accessor.bufferView}`);
      }
    }
  }
  
  // Validate buffer views
  if (gltf.bufferViews) {
    for (let i = 0; i < gltf.bufferViews.length; i++) {
      const bufferView = gltf.bufferViews[i];
      if (bufferView.buffer >= (gltf.buffers?.length || 0)) {
        errors.push(`BufferView ${i} references invalid buffer ${bufferView.buffer}`);
      }
    }
  }
  
  return errors;
}

/**
 * Creates a default GLTF asset structure
 */
export function createDefaultGLTFAsset(): GLTF {
  return {
    asset: {
      version: '2.0',
      generator: 'three-edit'
    },
    scene: 0,
    scenes: [{
      nodes: []
    }],
    nodes: [],
    meshes: [],
    accessors: [],
    bufferViews: [],
    buffers: [{
      byteLength: 0
    }],
    materials: [{
      pbrMetallicRoughness: {
        baseColorFactor: [1, 1, 1, 1],
        metallicFactor: 0,
        roughnessFactor: 1
      }
    }]
  };
}

/**
 * Merges multiple GLTF files into one
 */
export function mergeGLTF(gltfFiles: GLTF[]): GLTF {
  if (gltfFiles.length === 0) {
    throw new Error('No GLTF files to merge');
  }
  
  if (gltfFiles.length === 1) {
    return gltfFiles[0];
  }
  
  const merged = createDefaultGLTFAsset();
  let nodeIndex = 0;
  let meshIndex = 0;
  let accessorIndex = 0;
  let bufferViewIndex = 0;
  let materialIndex = 0;
  
  for (const gltf of gltfFiles) {
    // Merge nodes
    if (gltf.nodes) {
      for (const node of gltf.nodes) {
        const mergedNode = { ...node };
        if (mergedNode.mesh !== undefined) {
          mergedNode.mesh += meshIndex;
        }
        merged.nodes!.push(mergedNode);
      }
    }
    
    // Merge meshes
    if (gltf.meshes) {
      for (const mesh of gltf.meshes) {
        const mergedMesh = { ...mesh };
        for (const primitive of mergedMesh.primitives) {
          // Update attribute references
          for (const [key, value] of Object.entries(primitive.attributes)) {
            primitive.attributes[key] = value + accessorIndex;
          }
          if (primitive.indices !== undefined) {
            primitive.indices += accessorIndex;
          }
          if (primitive.material !== undefined) {
            primitive.material += materialIndex;
          }
        }
        merged.meshes!.push(mergedMesh);
      }
    }
    
    // Merge accessors
    if (gltf.accessors) {
      for (const accessor of gltf.accessors) {
        const mergedAccessor = { ...accessor };
        if (mergedAccessor.bufferView !== undefined) {
          mergedAccessor.bufferView += bufferViewIndex;
        }
        merged.accessors!.push(mergedAccessor);
      }
    }
    
    // Merge buffer views
    if (gltf.bufferViews) {
      for (const bufferView of gltf.bufferViews) {
        merged.bufferViews!.push({ ...bufferView });
      }
    }
    
    // Merge materials
    if (gltf.materials) {
      for (const material of gltf.materials) {
        merged.materials!.push({ ...material });
      }
    }
    
    // Update scene nodes
    if (gltf.scenes && gltf.scenes[0] && gltf.scenes[0].nodes) {
      for (const nodeRef of gltf.scenes[0].nodes) {
        merged.scenes![0].nodes.push(nodeRef + nodeIndex);
      }
    }
    
    // Update indices
    nodeIndex += gltf.nodes?.length || 0;
    meshIndex += gltf.meshes?.length || 0;
    accessorIndex += gltf.accessors?.length || 0;
    bufferViewIndex += gltf.bufferViews?.length || 0;
    materialIndex += gltf.materials?.length || 0;
  }
  
  return merged;
}

// Import missing Three.js types
import { Float32BufferAttribute, MeshStandardMaterial } from 'three'; 