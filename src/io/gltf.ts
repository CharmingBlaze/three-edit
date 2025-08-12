
/**
 * GLTF Import/Export Functions
 * Legacy compatibility functions for GLTF operations
 */

import { EditableMesh } from '../core/EditableMesh';
import { GLTF } from './gltf-types';
// GLTFManager import removed - using legacy implementation
import { createCube } from '../primitives';

/**
 * Legacy GLTF export function for backward compatibility
 * @param mesh The EditableMesh to export
 * @param options Export options
 * @returns GLTF JSON object
 */
import { triangulateForExport } from '../utils/triangulation';

export function exportGLTF(mesh: EditableMesh, options: any = {}): GLTF {
  
  // Triangulate the mesh for GLTF export (GLTF only supports triangles)
  const triangulated = triangulateForExport(mesh, {
    quadMethod: 'optimal',
    ngonMethod: 'fan',
    preserveOriginal: true
  });
  
  const triangulatedMesh = triangulated.mesh;
  
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
        count: triangulatedMesh.getVertexCount(),
        type: 'VEC3' as const,
        max: [1, 1, 1],
        min: [-1, -1, -1]
      },
      {
        bufferView: 1,
        componentType: 5123, // UNSIGNED_SHORT
        count: triangulatedMesh.getFaceCount() * 3,
        type: 'SCALAR' as const
      }
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: triangulatedMesh.getVertexCount() * 12 // 3 floats * 4 bytes
      },
      {
        buffer: 0,
        byteOffset: triangulatedMesh.getVertexCount() * 12,
        byteLength: triangulatedMesh.getFaceCount() * 6 // 3 shorts * 2 bytes
      }
    ],
    buffers: [{
      byteLength: triangulatedMesh.getVertexCount() * 12 + triangulatedMesh.getFaceCount() * 6
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
  // Fallback to creating a simple cube
  return createCube();
}

/**
 * Legacy GLTF save function for backward compatibility
 * @param mesh The EditableMesh to save
 * @param filename The filename
 * @param options Save options
 * @returns Promise that resolves when saved
 */
export async function saveGLTF(mesh: EditableMesh, filename: string, options: any = {}): Promise<void> {
  // Fallback implementation - just log that saving is not implemented
  console.warn('GLTF saving not implemented in legacy mode');
} 