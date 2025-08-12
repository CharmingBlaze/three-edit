import { EditableMesh } from '../../core/EditableMesh';
import { Selection } from '../../selection/Selection';
import { BaseSerializableCommand } from '../Command';

/**
 * Command to assign a material to selected faces in a mesh
 */
export class AssignMaterialCommand extends BaseSerializableCommand {
  /** Type identifier for serialization */
  readonly type = 'AssignMaterialCommand';
  
  /** The selection of faces to assign the material to */
  private selection: Selection;
  
  /** The material index to assign */
  private materialIndex: number;
  
  /** The original material indices of the faces (for undo) */
  private originalMaterialIndices: Map<number, number> = new Map();
  
  /**
   * Creates a new AssignMaterialCommand
   * @param selection The selection of faces to assign the material to
   * @param materialIndex The material index to assign
   */
  constructor(selection: Selection, materialIndex: number) {
    super('Assign Material');
    
    // Ensure the selection contains faces
    if (selection.faces.size === 0) {
      throw new Error('AssignMaterialCommand requires a face selection');
    }
    
    this.selection = selection.clone();
    this.materialIndex = materialIndex;
  }
  
  /**
   * Executes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was executed successfully
   */
  execute(mesh: EditableMesh): boolean {
    // Store original material indices for undo
    this.originalMaterialIndices.clear();
    
    // Assign the material to each selected face
    for (const faceIndex of this.selection.faces) {
      const face = mesh.getFace(faceIndex);
      if (!face) {
        return false;
      }
      
      // Store original material index
      this.originalMaterialIndices.set(faceIndex, face.materialIndex);
      
      // Assign new material index
      face.materialIndex = this.materialIndex;
    }
    
    return true;
  }
  
  /**
   * Undoes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was undone successfully
   */
  undo(mesh: EditableMesh): boolean {
    // Restore original material indices
    for (const [faceIndex, materialIndex] of this.originalMaterialIndices.entries()) {
      const face = mesh.getFace(faceIndex);
      if (!face) {
        return false;
      }
      
      face.materialIndex = materialIndex;
    }
    
    return true;
  }
  
  /**
   * Gets a description of the command
   * @returns A string describing the command
   */
  getDescription(): string {
    return `Assign material ${this.materialIndex} to ${this.selection.faces.size} faces`;
  }
  
  /**
   * Serializes the command to JSON
   * @returns A JSON representation of the command
   */
  toJSON(): any {
    // Convert original material indices map to array of entries
    const originalMaterialIndices: Array<[number, number]> = [];
    this.originalMaterialIndices.forEach((materialIndex, faceIndex) => {
      originalMaterialIndices.push([faceIndex, materialIndex]);
    });
    
    return {
      selection: {
        faces: [...this.selection.faces]
      },
      materialIndex: this.materialIndex,
      originalMaterialIndices
    };
  }
  
  /**
   * Creates an AssignMaterialCommand from JSON
   * @param json JSON representation of the command
   * @returns A new AssignMaterialCommand
   */
  static fromJSON(json: any): AssignMaterialCommand {
    const selection = new Selection();
    selection.faces = new Set(json.selection.faces);
    const command = new AssignMaterialCommand(selection, json.materialIndex);
    
    // Restore original material indices map
    command.originalMaterialIndices.clear();
    for (const [faceIndex, materialIndex] of json.originalMaterialIndices) {
      command.originalMaterialIndices.set(faceIndex, materialIndex);
    }
    
    return command;
  }
}
