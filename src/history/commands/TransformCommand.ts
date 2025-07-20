import { Vector3, Matrix4 } from 'three';
import { EditableMesh } from '../../core/EditableMesh.ts';
import { Selection } from '../../selection/Selection.ts';
import { BaseSerializableCommand } from '../Command.ts';

/**
 * Command to transform selected vertices in a mesh
 */
export class TransformCommand extends BaseSerializableCommand {
  /** Type identifier for serialization */
  readonly type = 'TransformCommand';
  
  /** The selection to transform */
  private selection: Selection;
  
  /** The transformation matrix */
  private matrix: Matrix4;
  
  /** The original positions of the vertices (for undo) */
  private originalPositions: Map<number, Vector3> = new Map();
  
  /**
   * Creates a new TransformCommand
   * @param selection The selection to transform
   * @param matrix The transformation matrix
   * @param name Optional name for the command
   */
  constructor(selection: Selection, matrix: Matrix4, name: string = 'Transform') {
    super(name);
    this.selection = selection.clone();
    this.matrix = matrix.clone();
  }
  
  /**
   * Executes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was executed successfully
   */
  execute(mesh: EditableMesh): boolean {
    // Store original positions for undo
    this.originalPositions.clear();
    
    // For vertex selection, store and transform each selected vertex
    if (this.selection.vertices.size > 0) {
      for (const vertexIndex of this.selection.vertices) {
        const vertex = mesh.getVertex(vertexIndex);
        if (!vertex) {
          return false;
        }
        
        // Store original position
        this.originalPositions.set(vertexIndex, new Vector3(vertex.x, vertex.y, vertex.z));
        
        // Apply transformation
        const position = new Vector3(vertex.x, vertex.y, vertex.z);
        position.applyMatrix4(this.matrix);
        
        // Update vertex position
        vertex.x = position.x;
        vertex.y = position.y;
        vertex.z = position.z;
      }
      return true;
    }
    
    // For edge selection, transform the vertices of each selected edge
    else if (this.selection.edges.size > 0) {
      const transformedVertices = new Set<number>();
      
      for (const edgeIndex of this.selection.edges) {
        const edge = mesh.getEdge(edgeIndex);
        if (!edge) {
          return false;
        }
        
        // Transform each vertex of the edge (if not already transformed)
        for (const vertexIndex of [edge.v1, edge.v2]) {
          if (transformedVertices.has(vertexIndex)) {
            continue;
          }
          
          const vertex = mesh.getVertex(vertexIndex);
          if (!vertex) {
            return false;
          }
          
          // Store original position
          this.originalPositions.set(vertexIndex, new Vector3(vertex.x, vertex.y, vertex.z));
          
          // Apply transformation
          const position = new Vector3(vertex.x, vertex.y, vertex.z);
          position.applyMatrix4(this.matrix);
          
          // Update vertex position
          vertex.x = position.x;
          vertex.y = position.y;
          vertex.z = position.z;
          
          transformedVertices.add(vertexIndex);
        }
      }
      return true;
    }
    
    // For face selection, transform the vertices of each selected face
    else if (this.selection.faces.size > 0) {
      const transformedVertices = new Set<number>();
      
      for (const faceIndex of this.selection.faces) {
        const face = mesh.getFace(faceIndex);
        if (!face) {
          return false;
        }
        
        // Transform each vertex of the face (if not already transformed)
        for (const vertexIndex of face.vertices) {
          if (transformedVertices.has(vertexIndex)) {
            continue;
          }
          
          const vertex = mesh.getVertex(vertexIndex);
          if (!vertex) {
            return false;
          }
          
          // Store original position
          this.originalPositions.set(vertexIndex, new Vector3(vertex.x, vertex.y, vertex.z));
          
          // Apply transformation
          const position = new Vector3(vertex.x, vertex.y, vertex.z);
          position.applyMatrix4(this.matrix);
          
          // Update vertex position
          vertex.x = position.x;
          vertex.y = position.y;
          vertex.z = position.z;
          
          transformedVertices.add(vertexIndex);
        }
      }
      return true;
    }
    
    return false;
  }
  
  /**
   * Undoes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was undone successfully
   */
  undo(mesh: EditableMesh): boolean {
    // Restore original positions
    for (const [vertexIndex, position] of this.originalPositions.entries()) {
      const vertex = mesh.getVertex(vertexIndex);
      if (!vertex) {
        return false;
      }
      
      vertex.x = position.x;
      vertex.y = position.y;
      vertex.z = position.z;
    }
    
    return true;
  }
  
  /**
   * Gets a description of the command
   * @returns A string describing the command
   */
  getDescription(): string {
    const count = this.selection.vertices.size + this.selection.edges.size + this.selection.faces.size;
    return `${this.name} [${count} selected]`;
  }
  
  /**
   * Serializes the command to JSON
   * @returns A JSON representation of the command
   */
  toJSON(): any {
    // Convert original positions map to array of entries
    const originalPositions: Array<[number, { x: number, y: number, z: number }]> = [];
    this.originalPositions.forEach((position, index) => {
      originalPositions.push([index, { x: position.x, y: position.y, z: position.z }]);
    });
    
    return {
      selection: {
        vertices: [...this.selection.vertices],
        edges: [...this.selection.edges],
        faces: [...this.selection.faces]
      },
      matrix: this.matrix.elements,
      originalPositions,
      name: this.name
    };
  }
  
  /**
   * Creates a TransformCommand from JSON
   * @param json JSON representation of the command
   * @returns A new TransformCommand
   */
  static fromJSON(json: any): TransformCommand {
    const selection = new Selection();
    if (json.selection.vertices) selection.vertices = new Set(json.selection.vertices);
    if (json.selection.edges) selection.edges = new Set(json.selection.edges);
    if (json.selection.faces) selection.faces = new Set(json.selection.faces);
    const matrix = new Matrix4().fromArray(json.matrix);
    const command = new TransformCommand(selection, matrix, json.name);
    
    // Restore original positions map
    command.originalPositions.clear();
    for (const [index, position] of json.originalPositions) {
      command.originalPositions.set(index, new Vector3(position.x, position.y, position.z));
    }
    
    return command;
  }
}
