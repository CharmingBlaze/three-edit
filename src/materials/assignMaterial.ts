import { EditableMesh } from '../core/EditableMesh.ts';
import { Selection } from '../selection/Selection.ts';
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
  const materialManager = ensureMaterialManager(mesh);
  
  const result = materialManager.assignMaterialToSelection(selection, materialIndex);
  return result.assignedFaces > 0;
}

/**
 * Creates a new material and assigns it to selected faces
 * @param mesh The mesh to modify
 * @param selection The selection containing faces
 * @returns The index of the created material, or -1 if failed
 */
export function createAndAssignMaterial(
  mesh: EditableMesh,
  selection: Selection
): number {
  // Get or create material manager
  const materialManager = ensureMaterialManager(mesh);
  
  // Add the material
  const materialIndex = materialManager.addMaterial();
  
  // Assign it to the selection
  materialManager.assignMaterialToSelection(selection, materialIndex);
  
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
  
  // Convert MaterialSlot to Material
  return materialManager.getAllMaterialSlots().map(slot => new Material({
    name: slot.name,
    userData: { slotIndex: slot.index }
  }));
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
  
  const slot = materialManager.getMaterialSlot(index);
  if (!slot) {
    return undefined;
  }
  
  // Convert MaterialSlot to Material
  return new Material({
    name: slot.name,
    userData: { slotIndex: slot.index }
  });
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
  
  const slot = materialManager.getMaterialByName(name);
  if (!slot) {
    return undefined;
  }
  
  // Convert MaterialSlot to Material
  return new Material({
    name: slot.name,
    userData: { slotIndex: slot.index }
  });
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
