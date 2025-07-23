/**
 * GLTF Import Module
 * Converts GLTF/GLB files to SceneGraph and EditableMesh formats
 */

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Scene, Object3D, Mesh, BufferGeometry, Material, Group } from 'three';
import { SceneGraph, SceneNode } from '../../scene';
import { EditableMesh } from '../../core/EditableMesh';
import { GLTF } from '../../io/gltf/types';
import { GLTFImportOptions, DEFAULT_IMPORT_OPTIONS } from './options';
import { 
  object3DToSceneGraph, 
  bufferGeometryToEditableMesh, 
  validateGLTF,
  applyCoordinateTransform 
} from './gltf-utils';
import { validateMesh, repairMesh } from '../../validation';

/**
 * Imports a GLTF file from a URL or file path
 * @param url The URL or file path to load from
 * @param options Import options
 * @returns Promise that resolves to the created SceneGraph
 */
export async function importGLTF(url: string, options: GLTFImportOptions = {}): Promise<SceneGraph> {
  const mergedOptions = { ...DEFAULT_IMPORT_OPTIONS, ...options };
  
  try {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url);
    
    return processGLTFScene(gltf.scene, mergedOptions);
  } catch (error) {
    throw new Error(`Failed to import GLTF from ${url}: ${error}`);
  }
}

/**
 * Imports GLTF data from a buffer (for GLB files)
 * @param buffer The binary buffer containing GLTF data
 * @param options Import options
 * @returns Promise that resolves to the created SceneGraph
 */
export async function importGLTFBuffer(buffer: ArrayBuffer, options: GLTFImportOptions = {}): Promise<SceneGraph> {
  const mergedOptions = { ...DEFAULT_IMPORT_OPTIONS, ...options };
  
  try {
    const loader = new GLTFLoader();
    const gltf = await loader.parseAsync(buffer, '');
    
    return processGLTFScene(gltf.scene, mergedOptions);
  } catch (error) {
    throw new Error(`Failed to import GLTF from buffer: ${error}`);
  }
}

/**
 * Imports GLTF JSON data
 * @param json The GLTF JSON object
 * @param options Import options
 * @returns Promise that resolves to the created SceneGraph
 */
export async function importGLTFJSON(json: GLTF, options: GLTFImportOptions = {}): Promise<SceneGraph> {
  const mergedOptions = { ...DEFAULT_IMPORT_OPTIONS, ...options };
  
  try {
    // Validate GLTF structure
    const errors = validateGLTF(json);
    if (errors.length > 0) {
      throw new Error(`Invalid GLTF structure: ${errors.join(', ')}`);
    }
    
    // For JSON-only GLTF, we need to create a basic scene structure
    // This is a simplified implementation - in practice, you'd need to handle
    // buffer data, materials, etc.
    const sceneGraph = new SceneGraph();
    
    // Create a default mesh if meshes are present
    if (json.meshes && json.meshes.length > 0) {
      const mesh = createEditableMeshFromGLTF(json, mergedOptions);
      const node = new SceneNode({
        name: 'ImportedMesh',
        mesh: mesh
      });
      sceneGraph.addNode(node);
    }
    
    return sceneGraph;
  } catch (error) {
    throw new Error(`Failed to import GLTF JSON: ${error}`);
  }
}

/**
 * Processes a Three.js scene from GLTF loader
 * @param scene The Three.js scene
 * @param options Import options
 * @returns The created SceneGraph
 */
function processGLTFScene(scene: Scene | Group, options: GLTFImportOptions): SceneGraph {
  const sceneGraph = new SceneGraph();
  
  // Convert the entire scene hierarchy
  const convertedSceneGraph = object3DToSceneGraph(scene);
  
  // Apply coordinate transformations if needed
  if (options.scale !== 1.0 || options.flipY || options.flipZ) {
    convertedSceneGraph.traverse(node => {
      if (node.mesh) {
        applyCoordinateTransformToMesh(node.mesh, options);
      }
    });
  }
  
  // Validate and repair geometry if requested
  if (options.validateGeometry) {
    convertedSceneGraph.traverse(node => {
      if (node.mesh) {
        const validation = validateMesh(node.mesh);
        if (!validation.isValid && options.autoRepair) {
          repairMesh(node.mesh);
        }
      }
    });
  }
  
  // Merge meshes if requested
  if (options.mergeMeshes) {
    return mergeMeshesInSceneGraph(convertedSceneGraph);
  }
  
  return convertedSceneGraph;
}

/**
 * Applies coordinate transformations to a mesh
 * @param mesh The mesh to transform
 * @param options Transform options
 */
function applyCoordinateTransformToMesh(mesh: EditableMesh, options: GLTFImportOptions): void {
  const { scale = 1.0, flipY = false, flipZ = false } = options;
  
  for (let i = 0; i < mesh.getVertexCount(); i++) {
    const vertex = mesh.getVertex(i);
    if (vertex) {
      // Apply scale
      vertex.x *= scale;
      vertex.y *= scale;
      vertex.z *= scale;
      
      // Apply coordinate flips
      if (flipY) {
        vertex.y *= -1;
      }
      
      if (flipZ) {
        vertex.z *= -1;
      }
    }
  }
}

/**
 * Merges all meshes in a scene graph into a single mesh
 * @param sceneGraph The scene graph to process
 * @returns A new scene graph with merged meshes
 */
function mergeMeshesInSceneGraph(sceneGraph: SceneGraph): SceneGraph {
  const mergedSceneGraph = new SceneGraph();
  const meshes: EditableMesh[] = [];
  
  // Collect all meshes
  sceneGraph.traverse(node => {
    if (node.mesh) {
      meshes.push(node.mesh);
    }
  });
  
  if (meshes.length === 0) {
    return mergedSceneGraph;
  }
  
  if (meshes.length === 1) {
    // Single mesh, just copy it
    const node = new SceneNode({
      name: 'MergedMesh',
      mesh: meshes[0]
    });
    mergedSceneGraph.addNode(node);
    return mergedSceneGraph;
  }
  
  // Merge multiple meshes
  const mergedMesh = mergeMeshes(meshes);
  const node = new SceneNode({
    name: 'MergedMesh',
    mesh: mergedMesh
  });
  mergedSceneGraph.addNode(node);
  
  return mergedSceneGraph;
}

/**
 * Merges multiple EditableMesh instances into one
 * @param meshes Array of meshes to merge
 * @returns The merged mesh
 */
function mergeMeshes(meshes: EditableMesh[]): EditableMesh {
  if (meshes.length === 0) {
    return new EditableMesh();
  }
  
  if (meshes.length === 1) {
    return meshes[0].clone();
  }
  
  const mergedMesh = new EditableMesh();
  let vertexOffset = 0;
  
  for (const mesh of meshes) {
    // Add vertices
    for (let i = 0; i < mesh.getVertexCount(); i++) {
      const vertex = mesh.getVertex(i);
      if (vertex) {
        mergedMesh.addVertex(vertex.clone());
      }
    }
    
    // Add faces with updated vertex indices
    for (let i = 0; i < mesh.getFaceCount(); i++) {
      const face = mesh.getFace(i);
      if (face) {
        const updatedVertices = face.vertices.map(v => v + vertexOffset);
        const updatedEdges = face.edges.map(e => {
          const edge = mesh.getEdge(e);
          if (edge) {
            const newEdge = new (require('../../core/Edge').Edge)(
              edge.v1 + vertexOffset,
              edge.v2 + vertexOffset
            );
            return mergedMesh.addEdge(newEdge);
          }
          return -1;
        }).filter(e => e !== -1);
        
        const newFace = new (require('../../core/Face').Face)(
          updatedVertices,
          updatedEdges,
          {
            faceVertexUvs: face.faceVertexUvs,
            materialIndex: face.materialIndex,
            normal: face.normal,
            userData: face.userData
          }
        );
        mergedMesh.addFace(newFace);
      }
    }
    
    vertexOffset += mesh.getVertexCount();
  }
  
  return mergedMesh;
}

/**
 * Creates an EditableMesh from GLTF JSON data
 * This is a simplified implementation for JSON-only GLTF
 * @param gltf The GLTF JSON object
 * @param options Import options
 * @returns The created EditableMesh
 */
function createEditableMeshFromGLTF(gltf: GLTF, options: GLTFImportOptions): EditableMesh {
  const mesh = new EditableMesh();
  
  // This is a placeholder implementation
  // In a full implementation, you would:
  // 1. Parse buffer data from the GLTF
  // 2. Extract vertex positions, normals, UVs
  // 3. Create proper vertices and faces
  // 4. Handle materials and textures
  
  // For now, create a simple cube as placeholder
  const size = 1.0;
  const vertices = [
    // Front face
    { x: -size, y: -size, z: size },
    { x: size, y: -size, z: size },
    { x: size, y: size, z: size },
    { x: -size, y: size, z: size },
    // Back face
    { x: -size, y: -size, z: -size },
    { x: size, y: -size, z: -size },
    { x: size, y: size, z: -size },
    { x: -size, y: size, z: -size }
  ];
  
  // Add vertices
  for (const vertexData of vertices) {
    const vertex = new (require('../../core/Vertex').Vertex)(
      vertexData.x,
      vertexData.y,
      vertexData.z
    );
    mesh.addVertex(vertex);
  }
  
  // Add faces (simplified cube faces)
  const faces = [
    [0, 1, 2, 3], // Front
    [5, 4, 7, 6], // Back
    [4, 0, 3, 7], // Left
    [1, 5, 6, 2], // Right
    [3, 2, 6, 7], // Top
    [4, 5, 1, 0]  // Bottom
  ];
  
  for (const faceVertices of faces) {
    // Create edges for this face
    const edges = [];
    for (let i = 0; i < faceVertices.length; i++) {
      const v1 = faceVertices[i];
      const v2 = faceVertices[(i + 1) % faceVertices.length];
      const edge = new (require('../../core/Edge').Edge)(v1, v2);
      edges.push(mesh.addEdge(edge));
    }
    
    // Create face
    const face = new (require('../../core/Face').Face)(faceVertices, edges);
    mesh.addFace(face);
  }
  
  return mesh;
}

/**
 * Imports a single mesh from GLTF (for cases where you only want the mesh data)
 * @param url The URL or file path to load from
 * @param options Import options
 * @returns Promise that resolves to the created EditableMesh
 */
export async function importGLTFMesh(url: string, options: GLTFImportOptions = {}): Promise<EditableMesh> {
  const sceneGraph = await importGLTF(url, options);
  
  // Find the first mesh in the scene graph
  let firstMesh: EditableMesh | null = null;
  sceneGraph.traverse(node => {
    if (node.mesh && !firstMesh) {
      firstMesh = node.mesh;
    }
  });
  
  if (!firstMesh) {
    throw new Error('No mesh found in GLTF file');
  }
  
  return firstMesh;
}

/**
 * Imports multiple meshes from GLTF
 * @param url The URL or file path to load from
 * @param options Import options
 * @returns Promise that resolves to an array of EditableMesh instances
 */
export async function importGLTFMeshes(url: string, options: GLTFImportOptions = {}): Promise<EditableMesh[]> {
  const sceneGraph = await importGLTF(url, options);
  
  const meshes: EditableMesh[] = [];
  sceneGraph.traverse(node => {
    if (node.mesh) {
      meshes.push(node.mesh);
    }
  });
  
  return meshes;
} 