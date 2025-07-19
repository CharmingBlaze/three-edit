import { Vector3 } from 'three';
import { EditableMesh } from '../../core/EditableMesh';
import { Vertex } from '../../core/Vertex';
import { BaseSerializableCommand } from '../Command';

/**
 * Command to add a vertex to a mesh
 */
export class AddVertexCommand extends BaseSerializableCommand {
  /** Type identifier for serialization */
  readonly type = 'AddVertexCommand';
  
  /** The vertex to add */
  private vertex: Vertex;
  
  /** The index of the added vertex */
  private addedIndex: number = -1;
  
  /**
   * Creates a new AddVertexCommand
   * @param vertex The vertex to add
   */
  constructor(vertex: Vertex) {
    super('Add Vertex');
    this.vertex = vertex.clone();
  }
  
  /**
   * Executes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was executed successfully
   */
  execute(mesh: EditableMesh): boolean {
    // Add the vertex to the mesh
    this.addedIndex = mesh.addVertex(this.vertex.clone());
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
    
    // Remove the vertex from the mesh
    return mesh.removeVertex(this.addedIndex);
  }
  
  /**
   * Gets a description of the command
   * @returns A string describing the command
   */
  getDescription(): string {
    return `Add vertex at (${this.vertex.x.toFixed(2)}, ${this.vertex.y.toFixed(2)}, ${this.vertex.z.toFixed(2)})`;
  }
  
  /**
   * Serializes the command to JSON
   * @returns A JSON representation of the command
   */
  toJSON(): any {
    return {
      vertex: {
        x: this.vertex.x,
        y: this.vertex.y,
        z: this.vertex.z,
        normal: this.vertex.normal ? {
          x: this.vertex.normal.x,
          y: this.vertex.normal.y,
          z: this.vertex.normal.z
        } : undefined,
        uv: this.vertex.uv ? {
          u: this.vertex.uv.u,
          v: this.vertex.uv.v
        } : undefined,
        userData: this.vertex.userData
      },
      addedIndex: this.addedIndex
    };
  }
  
  /**
   * Creates an AddVertexCommand from JSON
   * @param json JSON representation of the command
   * @returns A new AddVertexCommand
   */
  static fromJSON(json: any): AddVertexCommand {
    const vertex = new Vertex(
      json.vertex.x,
      json.vertex.y,
      json.vertex.z
    );
    
    if (json.vertex.normal) {
      vertex.normal = new Vector3(
        json.vertex.normal.x,
        json.vertex.normal.y,
        json.vertex.normal.z
      );
    }
    
    if (json.vertex.uv) {
      vertex.uv = {
        u: json.vertex.uv.u,
        v: json.vertex.uv.v
      };
    }
    
    if (json.vertex.userData) {
      vertex.userData = { ...json.vertex.userData };
    }
    
    const command = new AddVertexCommand(vertex);
    command.addedIndex = json.addedIndex;
    
    return command;
  }
}
