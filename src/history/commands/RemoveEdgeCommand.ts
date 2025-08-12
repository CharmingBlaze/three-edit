import { EditableMesh } from '../../core/EditableMesh';
import { Edge } from '../../core/Edge';
import { BaseSerializableCommand } from '../Command';

/**
 * Command to remove an edge from a mesh
 */
export class RemoveEdgeCommand extends BaseSerializableCommand {
  /** Type identifier for serialization */
  readonly type = 'RemoveEdgeCommand';
  
  /** The index of the edge to remove */
  private edgeIndex: number;
  
  /** The removed edge (for undo) */
  private removedEdge: Edge | null = null;
  
  /**
   * Creates a new RemoveEdgeCommand
   * @param edgeIndex The index of the edge to remove
   */
  constructor(edgeIndex: number) {
    super('Remove Edge');
    this.edgeIndex = edgeIndex;
  }
  
  /**
   * Executes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was executed successfully
   */
  execute(mesh: EditableMesh): boolean {
    // Store the edge for undo
    const edge = mesh.getEdge(this.edgeIndex);
    if (!edge) {
      return false;
    }
    
    this.removedEdge = new Edge(edge.v1, edge.v2, { ...edge.userData });
    
    // Remove the edge from the mesh
    return mesh.removeEdge(this.edgeIndex);
  }
  
  /**
   * Undoes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was undone successfully
   */
  undo(mesh: EditableMesh): boolean {
    if (!this.removedEdge) {
      return false;
    }
    
    // Add the edge back to the mesh at the same index
    return mesh.insertEdge(
      new Edge(this.removedEdge.v1, this.removedEdge.v2, { ...this.removedEdge.userData }),
      this.edgeIndex
    );
  }
  
  /**
   * Gets a description of the command
   * @returns A string describing the command
   */
  getDescription(): string {
    return `Remove edge ${this.edgeIndex}`;
  }
  
  /**
   * Serializes the command to JSON
   * @returns A JSON representation of the command
   */
  toJSON(): any {
    return {
      edgeIndex: this.edgeIndex,
      removedEdge: this.removedEdge ? {
        v1: this.removedEdge.v1,
        v2: this.removedEdge.v2,
        userData: this.removedEdge.userData
      } : null
    };
  }
  
  /**
   * Creates a RemoveEdgeCommand from JSON
   * @param json JSON representation of the command
   * @returns A new RemoveEdgeCommand
   */
  static fromJSON(json: any): RemoveEdgeCommand {
    const command = new RemoveEdgeCommand(json.edgeIndex);
    
    if (json.removedEdge) {
      command.removedEdge = new Edge(
        json.removedEdge.v1,
        json.removedEdge.v2,
        json.removedEdge.userData ? { ...json.removedEdge.userData } : undefined
      );
    }
    
    return command;
  }
}
