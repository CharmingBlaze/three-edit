import { EditableMesh } from '../core/EditableMesh.ts';
import { Selection } from '../selection/Selection.ts';

/**
 * Material slot information
 */
export interface MaterialSlot {
  /** Unique identifier for the material slot */
  id: string;
  /** Name of the material slot */
  name: string;
  /** Material index used by Three.js */
  index: number;
  /** Whether this slot is active */
  active: boolean;
}

/**
 * Material assignment result
 */
export interface MaterialAssignmentResult {
  /** Number of faces that were assigned the material */
  assignedFaces: number;
  /** Number of faces that already had the material */
  alreadyAssigned: number;
  /** Number of faces that couldn't be assigned */
  failed: number;
}

/**
 * Material grouping result
 */
export interface MaterialGroupingResult {
  /** Map of material indices to face indices */
  materialGroups: Map<number, number[]>;
  /** Number of unique materials found */
  uniqueMaterialCount: number;
  /** List of unused material indices */
  unusedMaterials: number[];
}

/**
 * Manages materials for an EditableMesh
 */
export class MaterialManager {
  /** The mesh this manager is associated with */
  private mesh: EditableMesh;
  
  /** Material slots */
  private slots: Map<number, MaterialSlot> = new Map();
  
  /** Next available material index */
  private nextMaterialIndex: number = 0;
  
  /**
   * Creates a new MaterialManager
   * @param mesh The mesh to manage materials for
   */
  constructor(mesh: EditableMesh) {
    this.mesh = mesh;
    this.analyzeExistingMaterials();
  }
  
  /**
   * Analyzes existing materials in the mesh
   */
  private analyzeExistingMaterials(): void {
    const materialIndices = new Set<number>();
    
    // Collect all material indices used in the mesh
    for (const face of this.mesh.faces) {
      materialIndices.add(face.materialIndex);
    }
    
    // Create slots for existing materials
    Array.from(materialIndices).forEach(index => {
      this.slots.set(index, {
        id: `material_${index}`,
        name: `Material ${index}`,
        index,
        active: true
      });
      
      this.nextMaterialIndex = Math.max(this.nextMaterialIndex, index + 1);
    });
  }
  
  /**
   * Creates a new material slot
   * @param name Name for the material slot
   * @returns The created material slot
   */
  createMaterialSlot(name: string): MaterialSlot {
    const slot: MaterialSlot = {
      id: `material_${this.nextMaterialIndex}`,
      name,
      index: this.nextMaterialIndex,
      active: true
    };
    
    this.slots.set(this.nextMaterialIndex, slot);
    this.nextMaterialIndex++;
    
    return slot;
  }
  
  /**
   * Gets a material slot by index
   * @param index The material index
   * @returns The material slot or undefined if not found
   */
  getMaterialSlot(index: number): MaterialSlot | undefined {
    return this.slots.get(index);
  }
  
  /**
   * Gets all material slots
   * @returns Array of all material slots
   */
  getAllMaterialSlots(): MaterialSlot[] {
    return Array.from(this.slots.values());
  }
  
  /**
   * Gets active material slots
   * @returns Array of active material slots
   */
  getActiveMaterialSlots(): MaterialSlot[] {
    return Array.from(this.slots.values()).filter(slot => slot.active);
  }
  
  /**
   * Assigns a material to selected faces
   * @param selection The selection of faces to assign material to
   * @param materialIndex The material index to assign
   * @returns Result of the assignment operation
   */
  assignMaterialToSelection(
    selection: Selection,
    materialIndex: number
  ): MaterialAssignmentResult {
    let assignedFaces = 0;
    let alreadyAssigned = 0;
    let failed = 0;

    // Create slot if it doesn't exist
    if (!this.slots.has(materialIndex)) {
      this.slots.set(materialIndex, {
        id: `material_${materialIndex}`,
        name: `Material ${materialIndex}`,
        index: materialIndex,
        active: true
      });
      this.nextMaterialIndex = Math.max(this.nextMaterialIndex, materialIndex + 1);
    }

    // Assign material to selected faces
    Array.from(selection.faces).forEach(faceIndex => {
      if (faceIndex >= 0 && faceIndex < this.mesh.faces.length) {
        const face = this.mesh.faces[faceIndex];
        if (face.materialIndex === materialIndex) {
          alreadyAssigned++;
        } else {
          face.materialIndex = materialIndex;
          assignedFaces++;
        }
      } else {
        failed++;
      }
    });

    return {
      assignedFaces,
      alreadyAssigned,
      failed
    };
  }
  
  /**
   * Groups faces by their material indices
   * @returns Result of the grouping operation
   */
  groupFacesByMaterial(): MaterialGroupingResult {
    const materialGroups = new Map<number, number[]>();
    const usedMaterials = new Set<number>();
    
    // Group faces by material index
    for (let i = 0; i < this.mesh.faces.length; i++) {
      const face = this.mesh.faces[i];
      const materialIndex = face.materialIndex;
      
      if (!materialGroups.has(materialIndex)) {
        materialGroups.set(materialIndex, []);
      }
      
      materialGroups.get(materialIndex)!.push(i);
      usedMaterials.add(materialIndex);
    }
    
    // Find unused materials
    const unusedMaterials: number[] = [];
    Array.from(this.slots.keys()).forEach(index => {
      if (!usedMaterials.has(index)) {
        unusedMaterials.push(index);
      }
    });
    
    return {
      materialGroups,
      uniqueMaterialCount: materialGroups.size,
      unusedMaterials
    };
  }
  
  /**
   * Removes unused material slots
   * @returns Number of slots removed
   */
  removeUnusedMaterials(): number {
    const grouping = this.groupFacesByMaterial();
    let removedCount = 0;
    
    for (const materialIndex of grouping.unusedMaterials) {
      this.slots.delete(materialIndex);
      removedCount++;
    }
    
    return removedCount;
  }
  
  /**
   * Renames a material slot
   * @param materialIndex The material index to rename
   * @param newName The new name for the material slot
   * @returns Whether the rename was successful
   */
  renameMaterialSlot(materialIndex: number, newName: string): boolean {
    const slot = this.slots.get(materialIndex);
    if (!slot) return false;
    
    slot.name = newName;
    return true;
  }
  
  /**
   * Deactivates a material slot
   * @param materialIndex The material index to deactivate
   * @returns Whether the deactivation was successful
   */
  deactivateMaterialSlot(materialIndex: number): boolean {
    const slot = this.slots.get(materialIndex);
    if (!slot) return false;
    
    slot.active = false;
    return true;
  }
  
  /**
   * Activates a material slot
   * @param materialIndex The material index to activate
   * @returns Whether the activation was successful
   */
  activateMaterialSlot(materialIndex: number): boolean {
    const slot = this.slots.get(materialIndex);
    if (!slot) return false;
    
    slot.active = true;
    return true;
  }
  
  /**
   * Gets statistics about material usage
   * @returns Material usage statistics
   */
  getMaterialStatistics(): {
    totalSlots: number;
    activeSlots: number;
    usedMaterials: number;
    totalFaces: number;
    facesByMaterial: Map<number, number>;
  } {
    const grouping = this.groupFacesByMaterial();
    const facesByMaterial = new Map<number, number>();
    
    Array.from(grouping.materialGroups.entries()).forEach(([materialIndex, faceIndices]) => {
      facesByMaterial.set(materialIndex, faceIndices.length);
    });
    
    return {
      totalSlots: this.slots.size,
      activeSlots: this.getActiveMaterialSlots().length,
      usedMaterials: grouping.uniqueMaterialCount,
      totalFaces: this.mesh.faces.length,
      facesByMaterial
    };
  }
  
  /**
   * Validates material assignments
   * @returns Validation result
   */
  validateMaterialAssignments(): {
    valid: boolean;
    issues: string[];
    unassignedFaces: number[];
  } {
    const issues: string[] = [];
    const unassignedFaces: number[] = [];
    
    for (let i = 0; i < this.mesh.faces.length; i++) {
      const face = this.mesh.faces[i];
      
      if (face.materialIndex < 0) {
        issues.push(`Face ${i} has negative material index`);
        unassignedFaces.push(i);
      } else if (!this.slots.has(face.materialIndex)) {
        issues.push(`Face ${i} uses undefined material index ${face.materialIndex}`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues,
      unassignedFaces
    };
  }

  /**
   * Adds a new material slot to the manager
   * @returns The material index of the new slot
   */
  addMaterial(): number {
    const slot = this.createMaterialSlot(`Material ${this.nextMaterialIndex}`);
    return slot.index;
  }

  /**
   * Gets a material by name
   * @param name The material name
   * @returns The material slot or undefined if not found
   */
  getMaterialByName(name: string): MaterialSlot | undefined {
    return Array.from(this.slots.values()).find(slot => slot.name === name);
  }

  /**
   * Gets faces with a specific material index
   * @param materialIndex The material index
   * @returns Array of face indices that use this material
   */
  getFacesWithMaterial(materialIndex: number): number[] {
    const faceIndices: number[] = [];
    for (let i = 0; i < this.mesh.faces.length; i++) {
      if (this.mesh.faces[i].materialIndex === materialIndex) {
        faceIndices.push(i);
      }
    }
    return faceIndices;
  }
}
