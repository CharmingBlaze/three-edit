import { Vector3 } from 'three';
import { EditableMesh } from '../../core/EditableMesh';
import { Face } from '../../core/Face';
import { BaseSerializableCommand } from '../Command';

/**
 * Command to add a face to a mesh
 */
export class AddFaceCommand extends BaseSerializableCommand {
  /** Type identifier for serialization */
  readonly type = 'AddFaceCommand';
  
  /** The face to add */
  private face: Face;
  
  /** The index of the added face */
  private addedIndex: number = -1;
  
  /**
   * Creates a new AddFaceCommand
   * @param face The face to add
   */
  constructor(face: Face) {
    super('Add Face');
    this.face = new Face(
      [...face.vertices],
      [...face.edges],
      {
        materialIndex: face.materialIndex,
        normal: face.normal?.clone(),
        userData: { ...face.userData }
      }
    );
  }
  
  /**
   * Executes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was executed successfully
   */
  execute(mesh: EditableMesh): boolean {
    // Check if all vertices and edges exist
    for (const vertexIndex of this.face.vertices) {
      if (!mesh.getVertex(vertexIndex)) {
        return false;
      }
    }
    
    for (const edgeIndex of this.face.edges) {
      if (!mesh.getEdge(edgeIndex)) {
        return false;
      }
    }
    
    // Add the face to the mesh
    this.addedIndex = mesh.addFace(new Face(
      [...this.face.vertices],
      [...this.face.edges],
      {
        materialIndex: this.face.materialIndex,
        normal: this.face.normal?.clone(),
        userData: { ...this.face.userData }
      }
    ));
    
    return this.addedIndex !== -1;
  }
  
  /**
   * Undoes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was undone successfully
   */
  undo(mesh: EditableMesh): boolean {
    if (this.addedIndex === -1) {
      return false;
    }
    
    // Remove the face from the mesh
    return mesh.removeFace(this.addedIndex);
  }
  
  /**
   * Gets a description of the command
   * @returns A string describing the command
   */
  getDescription(): string {
    return `Add face with vertices [${this.face.vertices.join(', ')}]`;
  }
  
  /**
   * Serializes the command to JSON
   * @returns A JSON representation of the command
   */
  toJSON(): any {
    return {
      face: {
        vertices: [...this.face.vertices],
        edges: [...this.face.edges],
        materialIndex: this.face.materialIndex,
        normal: this.face.normal ? {
          x: this.face.normal.x,
          y: this.face.normal.y,
          z: this.face.normal.z
        } : undefined,
        userData: this.face.userData
      },
      addedIndex: this.addedIndex
    };
  }
  
  /**
   * Creates an AddFaceCommand from JSON
   * @param json JSON representation of the command
   * @returns A new AddFaceCommand
   */
  static fromJSON(json: any): AddFaceCommand {
    const face = new Face(
      [...json.face.vertices],
      [...json.face.edges],
      {
        materialIndex: json.face.materialIndex,
        normal: json.face.normal ? new Vector3(
          json.face.normal.x,
          json.face.normal.y,
          json.face.normal.z
        ) : undefined,
        userData: json.face.userData ? { ...json.face.userData } : undefined
      }
    );
    
    const command = new AddFaceCommand(face);
    command.addedIndex = json.addedIndex;
    
    return command;
  }
}
