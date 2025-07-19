import { Vector3 } from 'three';
import { EditableMesh } from '../../core/EditableMesh';
import { Vertex } from '../../core/Vertex';
import { BaseSerializableCommand } from '../Command';

/**
 * Command to remove a vertex from a mesh
 */
export class RemoveVertexCommand extends BaseSerializableCommand {
  /** Type identifier for serialization */
  readonly type = 'RemoveVertexCommand';
  
  /** The index of the vertex to remove */
  private vertexIndex: number;
  
  /** The removed vertex (for undo) */
  private removedVertex: Vertex | null = null;
  
  /**
   * Creates a new RemoveVertexCommand
   * @param vertexIndex The index of the vertex to remove
   */
  constructor(vertexIndex: number) {
    super('Remove Vertex');
    this.vertexIndex = vertexIndex;
  }
  
  /**
   * Executes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was executed successfully
   */
  execute(mesh: EditableMesh): boolean {
    // Store the vertex for undo
    const vertex = mesh.getVertex(this.vertexIndex);
    if (!vertex) {
      return false;
    }
    
    this.removedVertex = vertex.clone();
    
    // Remove the vertex from the mesh
    return mesh.removeVertex(this.vertexIndex);
  }
  
  /**
   * Undoes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was undone successfully
   */
  undo(mesh: EditableMesh): boolean {
    if (!this.removedVertex) {
      return false;
    }
    
    // Add the vertex back to the mesh at the same index
    const addedIndex = mesh.addVertex(this.removedVertex.clone());
    return addedIndex === this.vertexIndex;
  }
  
  /**
   * Gets a description of the command
   * @returns A string describing the command
   */
  getDescription(): string {
    return `Remove vertex ${this.vertexIndex}`;
  }
  
  /**
   * Serializes the command to JSON
   * @returns A JSON representation of the command
   */
  toJSON(): any {
    return {
      vertexIndex: this.vertexIndex,
      removedVertex: this.removedVertex ? {
        x: this.removedVertex.x,
        y: this.removedVertex.y,
        z: this.removedVertex.z,
        normal: this.removedVertex.normal ? {
          x: this.removedVertex.normal.x,
          y: this.removedVertex.normal.y,
          z: this.removedVertex.normal.z
        } : undefined,
        uv: this.removedVertex.uv ? {
          u: this.removedVertex.uv.u,
          v: this.removedVertex.uv.v
        } : undefined,
        userData: this.removedVertex.userData
      } : null
    };
  }
  
  /**
   * Creates a RemoveVertexCommand from JSON
   * @param json JSON representation of the command
   * @returns A new RemoveVertexCommand
   */
  static fromJSON(json: any): RemoveVertexCommand {
    const command = new RemoveVertexCommand(json.vertexIndex);
    
    if (json.removedVertex) {
      const vertex = new Vertex(
        json.removedVertex.x,
        json.removedVertex.y,
        json.removedVertex.z
      );
      
      if (json.removedVertex.normal) {
        vertex.normal = new Vector3(
          json.removedVertex.normal.x,
          json.removedVertex.normal.y,
          json.removedVertex.normal.z
        );
      }
      
      if (json.removedVertex.uv) {
        vertex.uv = {
          u: json.removedVertex.uv.u,
          v: json.removedVertex.uv.v
        };
      }
      
      if (json.removedVertex.userData) {
        vertex.userData = { ...json.removedVertex.userData };
      }
      
      command.removedVertex = vertex;
    }
    
    return command;
  }
}
