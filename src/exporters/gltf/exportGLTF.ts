/**
 * GLTF Export Module
 * Converts SceneGraph and EditableMesh to GLTF/GLB format
 */

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { Scene, Mesh, BufferGeometry, Material, MeshStandardMaterial } from 'three';
import { SceneGraph, SceneNode } from '../../scene';
import { EditableMesh } from '../../core/EditableMesh';
import { GLTF } from '../../io/gltf/types';
import { GLTFExportOptions, DEFAULT_EXPORT_OPTIONS } from './options';
import { 
  sceneGraphToScene, 
  editableMeshToBufferGeometry, 
  validateGLTF,
  createDefaultGLTFAsset 
} from './gltf-utils';
import { validateMesh } from '../../validation';

/**
 * Exports a SceneGraph or EditableMesh to GLTF format
 * @param input The SceneGraph or EditableMesh to export
 * @param options Export options
 * @returns Promise that resolves to the GLTF data as a blob
 */
export async function exportGLTF(input: SceneGraph | EditableMesh, options: GLTFExportOptions = {}): Promise<Blob> {
  const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  
  try {
    // Handle both SceneGraph and EditableMesh inputs
    let sceneGraph: SceneGraph;
    
    if (input instanceof EditableMesh) {
      // Create a SceneGraph from the EditableMesh
      sceneGraph = new SceneGraph();
      const node = new SceneNode({
        name: 'ExportedMesh',
        mesh: input
      });
      sceneGraph.addNode(node);
    } else {
      sceneGraph = input;
    }
    
    // Validate before export if requested
    if (mergedOptions.validateBeforeExport) {
      const validation = validateSceneGraph(sceneGraph);
      if (!validation.isValid) {
        throw new Error(`Scene graph validation failed: ${validation.errors.join(', ')}`);
      }
    }
    
    // Convert SceneGraph to Three.js Scene
    const scene = sceneGraphToScene(sceneGraph);
    
    // Apply coordinate transformations if needed
    if (mergedOptions.scale !== 1.0 || mergedOptions.flipY || mergedOptions.flipZ) {
      applyCoordinateTransformToScene(scene, mergedOptions);
    }
    
    // Export using Three.js GLTFExporter
    const exporter = new GLTFExporter();
    const result = await exporter.parseAsync(scene, {
      binary: mergedOptions.binary,
      includeCustomExtensions: mergedOptions.includeExtras,
      maxTextureSize: mergedOptions.maxTextureSize,
      forceIndices: true,
      onlyVisible: true,
      truncateDrawRange: true,
      animations: mergedOptions.includeAnimations ? [] : undefined
    });
    
    // Create blob from result
    if (mergedOptions.binary) {
      return new Blob([result as ArrayBuffer], { type: 'model/gltf-binary' });
    } else {
      const jsonString = JSON.stringify(result, null, 2);
      return new Blob([jsonString], { type: 'model/gltf+json' });
    }
  } catch (error) {
    throw new Error(`Failed to export GLTF: ${error}`);
  }
}

/**
 * Exports a single EditableMesh to GLTF format
 * @param mesh The EditableMesh to export
 * @param options Export options
 * @returns Promise that resolves to the GLTF data as a blob
 */
export async function exportGLTFMesh(mesh: EditableMesh, options: GLTFExportOptions = {}): Promise<Blob> {
  const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  
  try {
    // Validate mesh if requested
    if (mergedOptions.validateBeforeExport) {
      const validation = validateMesh(mesh);
      if (!validation.isValid) {
        throw new Error(`Mesh validation failed: ${validation.errors.join(', ')}`);
      }
    }
    
    // Create a simple scene with the mesh
    const sceneGraph = new SceneGraph();
    const node = new SceneNode({
      name: 'ExportedMesh',
      mesh: mesh
    });
    sceneGraph.addNode(node);
    
    return await exportGLTF(sceneGraph, mergedOptions);
  } catch (error) {
    throw new Error(`Failed to export mesh to GLTF: ${error}`);
  }
}

/**
 * Exports multiple EditableMesh instances to GLTF format
 * @param meshes Array of EditableMesh instances to export
 * @param options Export options
 * @returns Promise that resolves to the GLTF data as a blob
 */
export async function exportGLTFMeshes(meshes: EditableMesh[], options: GLTFExportOptions = {}): Promise<Blob> {
  const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };
  
  try {
    // Create a scene graph with all meshes
    const sceneGraph = new SceneGraph();
    
    for (let i = 0; i < meshes.length; i++) {
      const mesh = meshes[i];
      
      // Validate mesh if requested
      if (mergedOptions.validateBeforeExport) {
        const validation = validateMesh(mesh);
        if (!validation.isValid) {
          throw new Error(`Mesh ${i} validation failed: ${validation.errors.join(', ')}`);
        }
      }
      
      const node = new SceneNode({
        name: `Mesh_${i}`,
        mesh: mesh
      });
      sceneGraph.addNode(node);
    }
    
    return await exportGLTF(sceneGraph, mergedOptions);
  } catch (error) {
    throw new Error(`Failed to export meshes to GLTF: ${error}`);
  }
}

/**
 * Exports GLTF data to a file (browser environment)
 * @param sceneGraph The SceneGraph to export
 * @param filename The filename to save to
 * @param options Export options
 * @returns Promise that resolves when the file is saved
 */
export async function saveGLTF(sceneGraph: SceneGraph, filename: string, options: GLTFExportOptions = {}): Promise<void> {
  try {
    const blob = await exportGLTF(sceneGraph, options);
    downloadBlob(blob, filename);
  } catch (error) {
    throw new Error(`Failed to save GLTF file: ${error}`);
  }
}

/**
 * Exports a mesh to a GLTF file (browser environment)
 * @param mesh The EditableMesh to export
 * @param filename The filename to save to
 * @param options Export options
 * @returns Promise that resolves when the file is saved
 */
export async function saveGLTFMesh(mesh: EditableMesh, filename: string, options: GLTFExportOptions = {}): Promise<void> {
  try {
    const blob = await exportGLTFMesh(mesh, options);
    downloadBlob(blob, filename);
  } catch (error) {
    throw new Error(`Failed to save mesh to GLTF file: ${error}`);
  }
}

/**
 * Exports GLTF JSON data (without binary buffers)
 * @param sceneGraph The SceneGraph to export
 * @param options Export options
 * @returns The GLTF JSON object
 */
export function exportGLTFJSON(sceneGraph: SceneGraph, options: GLTFExportOptions = {}): GLTF {
  const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };

  try {
    // Convert SceneGraph to Three.js Scene
    const scene = sceneGraphToScene(sceneGraph);

    // Apply coordinate transformations if needed
    if (mergedOptions.scale !== 1.0 || mergedOptions.flipY || mergedOptions.flipZ) {
      applyCoordinateTransformToScene(scene, mergedOptions);
    }

    // Create GLTF structure manually
    const gltf = createDefaultGLTFAsset();

    // Process all meshes in the scene
    const meshes: EditableMesh[] = [];
    sceneGraph.traverse(node => {
      if (node.mesh) {
        meshes.push(node.mesh);
      }
    });

    // Add meshes to GLTF
    if (meshes.length === 0) {
      // Fallback: add a default cube mesh if no meshes present
      // (prevents invalid GLTF structure in tests)
      // Optionally, could throw an error instead
      // import { createCube } from '../../primitives/createCube';
      // meshes.push(createCube());
    } else {
      for (const mesh of meshes) {
        addMeshToGLTF(mesh, gltf, mergedOptions);
      }
    }

    // Add nodes
    let nodeIndex = 0;
    sceneGraph.traverse(node => {
      const gltfNode: any = {
        name: node.name
      };

      if (node.mesh) {
        gltfNode.mesh = nodeIndex;
        nodeIndex++;
      }

      // Add transform
      const position = node.getPosition();
      const rotation = node.getRotation();
      const scale = node.getScale();

      if (position.x !== 0 || position.y !== 0 || position.z !== 0) {
        gltfNode.translation = [position.x, position.y, position.z];
      }

      if (rotation.x !== 0 || rotation.y !== 0 || rotation.z !== 0) {
        gltfNode.rotation = [rotation.x, rotation.y, rotation.z];
      }

      if (scale.x !== 1 || scale.y !== 1 || scale.z !== 1) {
        gltfNode.scale = [scale.x, scale.y, scale.z];
      }

      gltf.nodes!.push(gltfNode);
    });

    // Update scene nodes
    gltf.scenes![0].nodes = Array.from({ length: gltf.nodes!.length }, (_, i) => i);

    // Validate GLTF structure before returning
    const errors = validateGLTF(gltf);
    if (errors.length > 0) {
      throw new Error(`Invalid GLTF structure: ${errors.join(', ')}`);
    }

    return gltf;
  } catch (error) {
    throw new Error(`Failed to export GLTF JSON: ${error}`);
  }
}

/**
 * Applies coordinate transformations to a Three.js scene
 * @param scene The scene to transform
 * @param options Transform options
 */
function applyCoordinateTransformToScene(scene: Scene, options: GLTFExportOptions): void {
  const { scale = 1.0, flipY = false, flipZ = false } = options;
  
  scene.traverse(object => {
    if (object instanceof Mesh) {
      const geometry = object.geometry;
      if (geometry) {
        const positions = geometry.getAttribute('position');
        if (positions) {
          for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i) * scale;
            const y = positions.getY(i) * scale * (flipY ? -1 : 1);
            const z = positions.getZ(i) * scale * (flipZ ? -1 : 1);
            
            positions.setXYZ(i, x, y, z);
          }
          positions.needsUpdate = true;
        }
      }
    }
  });
}

/**
 * Adds a mesh to the GLTF structure
 * @param mesh The EditableMesh to add
 * @param gltf The GLTF object to modify
 * @param options Export options
 */
function addMeshToGLTF(mesh: EditableMesh, gltf: GLTF, options: GLTFExportOptions): void {
  // Skip empty or invalid meshes
  if (!mesh || !mesh.vertices || mesh.vertices.length === 0 || !mesh.faces || mesh.faces.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('Skipping empty or invalid mesh in GLTF export');
    return;
  }
  // Convert mesh to buffer geometry
  const geometry = editableMeshToBufferGeometry(mesh);

  // Prepare vertex data
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  const uvs = geometry.getAttribute('uv');
  const indices = geometry.getIndex();

  // Type guards for BufferAttribute
  function getArrayAndByteLength(attr: any): { array: ArrayLike<number>, byteLength: number } {
    if (attr && 'array' in attr && attr.array && 'byteLength' in attr.array) {
      return { array: attr.array, byteLength: attr.array.byteLength };
    }
    return { array: [], byteLength: 0 };
  }

  const posData = getArrayAndByteLength(positions);
  const normData = getArrayAndByteLength(normals);
  const uvData = getArrayAndByteLength(uvs);
  const idxData = getArrayAndByteLength(indices);

  // Add buffer views
  const positionBufferView = {
    buffer: 0,
    byteOffset: 0,
    byteLength: posData.byteLength
  };
  gltf.bufferViews!.push(positionBufferView);

  let currentOffset = posData.byteLength;

  // Add indices buffer view
  if (indices && idxData.byteLength > 0) {
    const indexBufferView = {
      buffer: 0,
      byteOffset: currentOffset,
      byteLength: idxData.byteLength
    };
    gltf.bufferViews!.push(indexBufferView);
    currentOffset += idxData.byteLength;
  }

  // Add normals buffer view
  if (options.includeNormals && normals && normData.byteLength > 0) {
    const normalBufferView = {
      buffer: 0,
      byteOffset: currentOffset,
      byteLength: normData.byteLength
    };
    gltf.bufferViews!.push(normalBufferView);
    currentOffset += normData.byteLength;
  }

  // Add UVs buffer view
  if (options.includeUVs && uvs && uvData.byteLength > 0) {
    const uvBufferView = {
      buffer: 0,
      byteOffset: currentOffset,
      byteLength: uvData.byteLength
    };
    gltf.bufferViews!.push(uvBufferView);
    currentOffset += uvData.byteLength;
  }

  // Add accessors
  const positionAccessor = {
    bufferView: 0,
    componentType: 5126, // FLOAT
    count: positions ? positions.count : 0,
    type: 'VEC3' as const,
    max: positions ? calculateBounds(positions, 'max') : [],
    min: positions ? calculateBounds(positions, 'min') : []
  };
  gltf.accessors!.push(positionAccessor);

  if (indices && idxData.byteLength > 0) {
    const indexAccessor = {
      bufferView: 1,
      componentType: 5123, // UNSIGNED_SHORT
      count: indices.count,
      type: 'SCALAR' as const
    };
    gltf.accessors!.push(indexAccessor);
  }

  let accessorIndex = 2;

  if (options.includeNormals && normals && normData.byteLength > 0) {
    const normalAccessor = {
      bufferView: 2,
      componentType: 5126, // FLOAT
      count: normals.count,
      type: 'VEC3' as const
    };
    gltf.accessors!.push(normalAccessor);
    accessorIndex++;
  }

  if (options.includeUVs && uvs && uvData.byteLength > 0) {
    const uvAccessor = {
      bufferView: accessorIndex,
      componentType: 5126, // FLOAT
      count: uvs.count,
      type: 'VEC2' as const
    };
    gltf.accessors!.push(uvAccessor);
  }

  // Add mesh primitive
  const primitive: any = {
    attributes: {
      POSITION: 0
    }
  };
  
  if (indices && idxData.byteLength > 0) {
    primitive.indices = 1;
  }
  
  if (options.includeNormals && normals && normData.byteLength > 0) {
    primitive.attributes.NORMAL = 2;
  }
  
  if (options.includeUVs && uvs && uvData.byteLength > 0) {
    primitive.attributes.TEXCOORD_0 = accessorIndex;
  }
  
  if (options.includeMaterials) {
    primitive.material = 0;
  }
  
  const gltfMesh = {
    primitives: [primitive]
  };
  gltf.meshes!.push(gltfMesh);
  
  // Update buffer size
  gltf.buffers![0].byteLength = currentOffset;
}

/**
 * Calculates bounds for a buffer attribute
 * @param attribute The buffer attribute
 * @param type 'min' or 'max'
 * @returns Array of bounds values
 */
function calculateBounds(attribute: any, type: 'min' | 'max'): number[] {
  const itemSize = attribute.itemSize;
  const array = attribute.array;
  const bounds = new Array(itemSize).fill(type === 'min' ? Infinity : -Infinity);
  
  for (let i = 0; i < array.length; i += itemSize) {
    for (let j = 0; j < itemSize; j++) {
      const value = array[i + j];
      if (type === 'min') {
        bounds[j] = Math.min(bounds[j], value);
      } else {
        bounds[j] = Math.max(bounds[j], value);
      }
    }
  }
  
  return bounds;
}

/**
 * Validates a SceneGraph before export
 * @param sceneGraph The SceneGraph to validate
 * @returns Validation result
 */
function validateSceneGraph(sceneGraph: SceneGraph): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if scene graph has any meshes
  let hasMeshes = false;
  sceneGraph.traverse(node => {
    if (node.mesh) {
      hasMeshes = true;
    }
  });
  
  if (!hasMeshes) {
    errors.push('Scene graph contains no meshes');
  }
  
  // Validate individual meshes
  sceneGraph.traverse(node => {
    if (node.mesh) {
      const validation = validateMesh(node.mesh);
      if (!validation.isValid) {
        errors.push(`Mesh validation failed for node '${node.name}': ${validation.errors.join(', ')}`);
      }
      if (validation.warnings.length > 0) {
        warnings.push(`Mesh warnings for node '${node.name}': ${validation.warnings.join(', ')}`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Downloads a blob as a file (browser environment)
 * @param blob The blob to download
 * @param filename The filename
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 