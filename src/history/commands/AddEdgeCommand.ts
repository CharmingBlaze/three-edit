import { EditableMesh } from '../../core/EditableMesh.ts';
import { Edge } from '../../core/Edge.ts';
import { BaseSerializableCommand } from '../Command.ts';

/**
 * Command to add an edge to a mesh
 */
export class AddEdgeCommand extends BaseSerializableCommand {
  /** Type identifier for serialization */
  readonly type = 'AddEdgeCommand';
  
  /** The edge to add */
  private edge: Edge;
  
  /** The index of the added edge */
  private addedIndex: number = -1;
  
  /**
   * Creates a new AddEdgeCommand
   * @param edge The edge to add
   */
  constructor(edge: Edge) {
    super('Add Edge');
    this.edge = new Edge(edge.v1, edge.v2, { ...edge.userData });
  }
  
  /**
   * Executes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was executed successfully
   */
  execute(mesh: EditableMesh): boolean {
    // Check if the vertices exist
    if (!mesh.getVertex(this.edge.v1) || !mesh.getVertex(this.edge.v2)) {
      return false;
    }
    
    // Add the edge to the mesh
    this.addedIndex = mesh.addEdge(new Edge(this.edge.v1, this.edge.v2, { ...this.edge.userData }));
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
    
    // Remove the edge from the mesh
    return mesh.removeEdge(this.addedIndex);
  }
  
  /**
   * Gets a description of the command
   * @returns A string describing the command
   */
  getDescription(): string {
    return `Add edge between vertices ${this.edge.v1} and ${this.edge.v2}`;
  }
  
  /**
   * Serializes the command to JSON
   * @returns A JSON representation of the command
   */
  toJSON(): any {
    return {
      edge: {
        v1: this.edge.v1,
        v2: this.edge.v2,
        userData: this.edge.userData
      },
      addedIndex: this.addedIndex
    };
  }
  
  /**
   * Creates an AddEdgeCommand from JSON
   * @param json JSON representation of the command
   * @returns A new AddEdgeCommand
   */
  static fromJSON(json: any): AddEdgeCommand {
    const edge = new Edge(
      json.edge.v1,
      json.edge.v2,
      json.edge.userData ? { ...json.edge.userData } : undefined
    );
    
    const command = new AddEdgeCommand(edge);
    command.addedIndex = json.addedIndex;
    
    return command;
  }
}
