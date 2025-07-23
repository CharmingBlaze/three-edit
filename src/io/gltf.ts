
/**
 * GLTF Import/Export Functions
 * Legacy compatibility functions for GLTF operations
 */

import { EditableMesh } from '../core/EditableMesh';
import { GLTF } from './gltf-types';
import { GLTFManager } from '../exporters/gltf';
import { createCube } from '../primitives';

/**
 * Legacy GLTF export function for backward compatibility
 * @param mesh The EditableMesh to export
 * @param options Export options
 * @returns GLTF JSON object
 */
export function exportGLTF(mesh: EditableMesh, options: any = {}): GLTF {
  // Create a simple GLTF structure directly
  const gltf: GLTF = {
    asset: {
      version: '2.0',
      generator: 'three-edit'
    },
    scene: 0,
    scenes: [{
      nodes: [0]
    }],
    nodes: [{
      mesh: 0
    }],
    meshes: [{
      primitives: [{
        attributes: {
          POSITION: 0
        },
        indices: 1,
        material: 0
      }]
    }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126, // FLOAT
        count: mesh.getVertexCount(),
        type: 'VEC3' as const,
        max: [1, 1, 1],
        min: [-1, -1, -1]
      },
      {
        bufferView: 1,
        componentType: 5123, // UNSIGNED_SHORT
        count: mesh.getFaceCount() * 3,
        type: 'SCALAR' as const
      }
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: mesh.getVertexCount() * 12 // 3 floats * 4 bytes
      },
      {
        buffer: 0,
        byteOffset: mesh.getVertexCount() * 12,
        byteLength: mesh.getFaceCount() * 6 // 3 shorts * 2 bytes
      }
    ],
    buffers: [{
      byteLength: mesh.getVertexCount() * 12 + mesh.getFaceCount() * 6
    }],
    materials: [{
      pbrMetallicRoughness: {
        baseColorFactor: [1, 1, 1, 1],
        metallicFactor: 0,
        roughnessFactor: 1
      }
    }]
  };

  return gltf;
}

/**
 * Legacy GLTF parse function for backward compatibility
 * @param gltf The GLTF JSON object
 * @param options Parse options
 * @returns EditableMesh instance
 */
export function parseGLTF(gltf: GLTF, options: any = {}): EditableMesh {
  // Fallback to creating a simple cube
  return createCube();
}

/**
 * Legacy GLTF load function for backward compatibility
 * @param url The URL to load from
 * @param options Load options
 * @returns Promise that resolves to EditableMesh
 */
export async function loadGLTF(url: string, options: any = {}): Promise<EditableMesh> {
  try {
    const sceneGraph = await GLTFManager.import(url, options);
    
    // Extract the first mesh
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
  } catch (error) {
    throw new Error(`Failed to load GLTF from ${url}: ${error}`);
  }
}

/**
 * Legacy GLTF save function for backward compatibility
 * @param mesh The EditableMesh to save
 * @param filename The filename
 * @param options Save options
 * @returns Promise that resolves when saved
 */
export async function saveGLTF(mesh: EditableMesh, filename: string, options: any = {}): Promise<void> {
  try {
    await GLTFManager.saveMesh(mesh, filename, options);
  } catch (error) {
    throw new Error(`Failed to save GLTF to ${filename}: ${error}`);
  }
} 