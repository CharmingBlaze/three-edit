/**
 * GLTF Import/Export Module
 * Complete GLTF 2.0 support for three-edit
 * 
 * This module provides comprehensive GLTF import and export functionality
 * with support for both .gltf and .glb formats, scene graphs, and individual meshes.
 */

import type { SceneGraph, SceneNode } from '../../scene';
import type { EditableMesh } from '../../core/EditableMesh';
import type { GLTF } from '../../io/gltf/types';

// Export options
export * from './options';

// Export utility functions
export * from './gltf-utils';

// Export import functions
export {
  importGLTF,
  importGLTFBuffer,
  importGLTFJSON,
  importGLTFMesh,
  importGLTFMeshes
} from './importGLTF';

// Export export functions
export {
  exportGLTF,
  exportGLTFMesh,
  exportGLTFMeshes,
  exportGLTFJSON,
  saveGLTF,
  saveGLTFMesh
} from './exportGLTF';

// Re-export core types for convenience
export type { SceneGraph, SceneNode } from '../../scene';
export type { EditableMesh } from '../../core/EditableMesh';
export type { GLTF } from '../../io/gltf/types';

/**
 * Main GLTF class that provides a unified interface for import/export operations
 */
export class GLTFManager {
  /**
   * Imports a GLTF file and returns a SceneGraph
   * @param url The URL or file path to load from
   * @param options Import options
   * @returns Promise that resolves to the created SceneGraph
   */
  static async import(url: string, options?: any): Promise<SceneGraph> {
    const { importGLTF } = await import('./importGLTF');
    return importGLTF(url, options);
  }

  /**
   * Imports GLTF data from a buffer (for GLB files)
   * @param buffer The binary buffer containing GLTF data
   * @param options Import options
   * @returns Promise that resolves to the created SceneGraph
   */
  static async importBuffer(buffer: ArrayBuffer, options?: any): Promise<SceneGraph> {
    const { importGLTFBuffer } = await import('./importGLTF');
    return importGLTFBuffer(buffer, options);
  }

  /**
   * Exports a SceneGraph to GLTF format
   * @param sceneGraph The SceneGraph to export
   * @param options Export options
   * @returns Promise that resolves to the GLTF data as a blob
   */
  static async export(sceneGraph: SceneGraph, options?: any): Promise<Blob> {
    const { exportGLTF } = await import('./exportGLTF');
    return exportGLTF(sceneGraph, options);
  }

  /**
   * Exports a single EditableMesh to GLTF format
   * @param mesh The EditableMesh to export
   * @param options Export options
   * @returns Promise that resolves to the GLTF data as a blob
   */
  static async exportMesh(mesh: EditableMesh, options?: any): Promise<Blob> {
    const { exportGLTFMesh } = await import('./exportGLTF');
    return exportGLTFMesh(mesh, options);
  }

  /**
   * Saves a SceneGraph to a GLTF file
   * @param sceneGraph The SceneGraph to save
   * @param filename The filename to save to
   * @param options Export options
   * @returns Promise that resolves when the file is saved
   */
  static async save(sceneGraph: SceneGraph, filename: string, options?: any): Promise<void> {
    const { saveGLTF } = await import('./exportGLTF');
    return saveGLTF(sceneGraph, filename, options);
  }

  /**
   * Saves a single EditableMesh to a GLTF file
   * @param mesh The EditableMesh to save
   * @param filename The filename to save to
   * @param options Export options
   * @returns Promise that resolves when the file is saved
   */
  static async saveMesh(mesh: EditableMesh, filename: string, options?: any): Promise<void> {
    const { saveGLTFMesh } = await import('./exportGLTF');
    return saveGLTFMesh(mesh, filename, options);
  }

  /**
   * Validates GLTF data structure
   * @param gltf The GLTF object to validate
   * @returns Array of validation errors
   */
  static validate(gltf: GLTF): string[] {
    const { validateGLTF } = require('./gltf-utils');
    return validateGLTF(gltf);
  }

  /**
   * Creates a default GLTF asset structure
   * @returns A default GLTF object
   */
  static createDefault(): GLTF {
    const { createDefaultGLTFAsset } = require('./gltf-utils');
    return createDefaultGLTFAsset();
  }

  /**
   * Merges multiple GLTF files into one
   * @param gltfFiles Array of GLTF objects to merge
   * @returns The merged GLTF object
   */
  static merge(gltfFiles: GLTF[]): GLTF {
    const { mergeGLTF } = require('./gltf-utils');
    return mergeGLTF(gltfFiles);
  }
}

// Default export for convenience
export default GLTFManager; 