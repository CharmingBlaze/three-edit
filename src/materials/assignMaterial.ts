import { EditableMesh } from '../core/EditableMesh';
import { Selection } from '../selection/Selection';
import { Material } from './Material';
import { MaterialManager } from './MaterialManager';

/**
 * Assigns a material to selected faces
 * @param mesh The mesh to modify
 * @param selection The selection containing faces
 * @param materialIndex The index of the material to assign
 * @returns Whether any faces were updated
 */
export function assignMaterial(
  mesh: EditableMesh,
  selection: Selection,
  materialIndex: number
): boolean {
  // Get or create material manager
  let materialManager = mesh.userData.materialManager as MaterialManager;
  if (!materialManager) {
    materialManager = new MaterialManager(mesh);
    mesh.userData.materialManager = materialManager;
  }
  
  return materialManager.assignMaterial(selection, materialIndex);
}

/**
 * Creates a new material and assigns it to selected faces
 * @param mesh The mesh to modify
 * @param selection The selection containing faces
 * @param material The material to create and assign
 * @returns The index of the created material, or -1 if failed
 */
export function createAndAssignMaterial(
  mesh: EditableMesh,
  selection: Selection,
  material: Material
): number {
  // Get or create material manager
  let materialManager = mesh.userData.materialManager as MaterialManager;
  if (!materialManager) {
    materialManager = new MaterialManager(mesh);
    mesh.userData.materialManager = materialManager;
  }
  
  // Add the material
  const materialIndex = materialManager.addMaterial(material);
  
  // Assign it to the selection
  materialManager.assignMaterial(selection, materialIndex);
  
  return materialIndex;
}

/**
 * Gets the materials used by a mesh
 * @param mesh The mesh to query
 * @returns Array of materials or empty array if no material manager exists
 */
export function getMaterials(mesh: EditableMesh): Material[] {
  const materialManager = mesh.userData.materialManager as MaterialManager;
  if (!materialManager) {
    return [];
  }
  
  return materialManager.getMaterials();
}

/**
 * Gets a material by index
 * @param mesh The mesh to query
 * @param index The material index
 * @returns The material or undefined if not found
 */
export function getMaterial(mesh: EditableMesh, index: number): Material | undefined {
  const materialManager = mesh.userData.materialManager as MaterialManager;
  if (!materialManager) {
    return undefined;
  }
  
  return materialManager.getMaterial(index);
}

/**
 * Gets a material by name
 * @param mesh The mesh to query
 * @param name The material name
 * @returns The material or undefined if not found
 */
export function getMaterialByName(mesh: EditableMesh, name: string): Material | undefined {
  const materialManager = mesh.userData.materialManager as MaterialManager;
  if (!materialManager) {
    return undefined;
  }
  
  return materialManager.getMaterialByName(name);
}

/**
 * Gets faces using a specific material
 * @param mesh The mesh to query
 * @param materialIndex The material index
 * @returns Array of face indices using the material
 */
export function getFacesWithMaterial(mesh: EditableMesh, materialIndex: number): number[] {
  const materialManager = mesh.userData.materialManager as MaterialManager;
  if (!materialManager) {
    return [];
  }
  
  return materialManager.getFacesWithMaterial(materialIndex);
}

/**
 * Ensures a mesh has a material manager
 * @param mesh The mesh to ensure has a material manager
 * @returns The material manager
 */
export function ensureMaterialManager(mesh: EditableMesh): MaterialManager {
  let materialManager = mesh.userData.materialManager as MaterialManager;
  if (!materialManager) {
    materialManager = new MaterialManager(mesh);
    mesh.userData.materialManager = materialManager;
  }
  
  return materialManager;
}
