import { Vector3 } from 'three';
import { EditableMesh } from '../../core/EditableMesh.ts';
import { Face } from '../../core/Face.ts';
import { BaseSerializableCommand } from '../Command.ts';

/**
 * Command to remove a face from a mesh
 */
export class RemoveFaceCommand extends BaseSerializableCommand {
  /** Type identifier for serialization */
  readonly type = 'RemoveFaceCommand';
  
  /** The index of the face to remove */
  private faceIndex: number;
  
  /** The removed face (for undo) */
  private removedFace: Face | null = null;
  
  /**
   * Creates a new RemoveFaceCommand
   * @param faceIndex The index of the face to remove
   */
  constructor(faceIndex: number) {
    super('Remove Face');
    this.faceIndex = faceIndex;
  }
  
  /**
   * Executes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was executed successfully
   */
  execute(mesh: EditableMesh): boolean {
    // Store the face for undo
    const face = mesh.getFace(this.faceIndex);
    if (!face) {
      return false;
    }
    
    this.removedFace = new Face(
      [...face.vertices],
      [...face.edges],
      {
        materialIndex: face.materialIndex,
        normal: face.normal?.clone(),
        userData: { ...face.userData }
      }
    );
    
    // Remove the face from the mesh
    return mesh.removeFace(this.faceIndex);
  }
  
  /**
   * Undoes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was undone successfully
   */
  undo(mesh: EditableMesh): boolean {
    if (!this.removedFace) {
      return false;
    }
    
    // Add the face back to the mesh at the same index
    return mesh.insertFace(
      new Face(
        [...this.removedFace.vertices],
        [...this.removedFace.edges],
        {
          materialIndex: this.removedFace.materialIndex,
          normal: this.removedFace.normal?.clone(),
          userData: { ...this.removedFace.userData }
        }
      ),
      this.faceIndex
    );
  }
  
  /**
   * Gets a description of the command
   * @returns A string describing the command
   */
  getDescription(): string {
    return `Remove face ${this.faceIndex}`;
  }
  
  /**
   * Serializes the command to JSON
   * @returns A JSON representation of the command
   */
  toJSON(): any {
    return {
      faceIndex: this.faceIndex,
      removedFace: this.removedFace ? {
        vertices: [...this.removedFace.vertices],
        edges: [...this.removedFace.edges],
        materialIndex: this.removedFace.materialIndex,
        normal: this.removedFace.normal ? {
          x: this.removedFace.normal.x,
          y: this.removedFace.normal.y,
          z: this.removedFace.normal.z
        } : undefined,
        userData: this.removedFace.userData
      } : null
    };
  }
  
  /**
   * Creates a RemoveFaceCommand from JSON
   * @param json JSON representation of the command
   * @returns A new RemoveFaceCommand
   */
  static fromJSON(json: any): RemoveFaceCommand {
    const command = new RemoveFaceCommand(json.faceIndex);
    
    if (json.removedFace) {
      command.removedFace = new Face(
        [...json.removedFace.vertices],
        [...json.removedFace.edges],
        {
          materialIndex: json.removedFace.materialIndex,
          normal: json.removedFace.normal ? new Vector3(
            json.removedFace.normal.x,
            json.removedFace.normal.y,
            json.removedFace.normal.z
          ) : undefined,
          userData: json.removedFace.userData ? { ...json.removedFace.userData } : undefined
        }
      );
    }
    
    return command;
  }
}
