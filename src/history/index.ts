// Export base command types
export type { Command, BaseCommand, SerializableCommand, BaseSerializableCommand } from './Command';

// Export command history
export { CommandHistory } from './CommandHistory';
export type {
  CommandHistoryOptions,
  CommandHistoryEventType,
  CommandHistoryEvent,
  CommandHistoryListener
} from './CommandHistory';

// Export command factory
export { CommandFactory } from './CommandFactory';

// Export individual commands
export { AddVertexCommand } from './commands/AddVertexCommand';
export { AddEdgeCommand } from './commands/AddEdgeCommand';
export { AddFaceCommand } from './commands/AddFaceCommand';
export { RemoveVertexCommand } from './commands/RemoveVertexCommand';
export { RemoveEdgeCommand } from './commands/RemoveEdgeCommand';
export { RemoveFaceCommand } from './commands/RemoveFaceCommand';
export { TransformCommand } from './commands/TransformCommand';
export { AssignMaterialCommand } from './commands/AssignMaterialCommand';

// Export command creation helpers
import { Vector3, Matrix4 } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';
import { Selection } from '../selection/Selection';
import { AddVertexCommand } from './commands/AddVertexCommand';
import { AddEdgeCommand } from './commands/AddEdgeCommand';
import { AddFaceCommand } from './commands/AddFaceCommand';
import { RemoveVertexCommand } from './commands/RemoveVertexCommand';
import { RemoveEdgeCommand } from './commands/RemoveEdgeCommand';
import { RemoveFaceCommand } from './commands/RemoveFaceCommand';
import { TransformCommand } from './commands/TransformCommand';
import { AssignMaterialCommand } from './commands/AssignMaterialCommand';
import { CommandHistory } from './CommandHistory';

/**
 * Creates a command history for a mesh
 * @param mesh The mesh to track history for
 * @param options Options for the command history
 * @returns A new command history
 */
export function createHistory(
  mesh: EditableMesh,
  options?: {
    maxHistorySize?: number;
    autoExecute?: boolean;
    mergeConsecutiveCommands?: boolean;
    mergeTimeWindow?: number;
  }
): CommandHistory {
  return new CommandHistory(mesh, options);
}

/**
 * Creates a command to add a vertex
 * @param vertex The vertex to add
 * @returns A new AddVertexCommand
 */
export function createAddVertexCommand(vertex: Vertex): AddVertexCommand {
  return new AddVertexCommand(vertex);
}

/**
 * Creates a command to add an edge
 * @param edge The edge to add
 * @returns A new AddEdgeCommand
 */
export function createAddEdgeCommand(edge: Edge): AddEdgeCommand {
  return new AddEdgeCommand(edge);
}

/**
 * Creates a command to add a face
 * @param face The face to add
 * @returns A new AddFaceCommand
 */
export function createAddFaceCommand(face: Face): AddFaceCommand {
  return new AddFaceCommand(face);
}

/**
 * Creates a command to remove a vertex
 * @param vertexIndex The index of the vertex to remove
 * @returns A new RemoveVertexCommand
 */
export function createRemoveVertexCommand(vertexIndex: number): RemoveVertexCommand {
  return new RemoveVertexCommand(vertexIndex);
}

/**
 * Creates a command to remove an edge
 * @param edgeIndex The index of the edge to remove
 * @returns A new RemoveEdgeCommand
 */
export function createRemoveEdgeCommand(edgeIndex: number): RemoveEdgeCommand {
  return new RemoveEdgeCommand(edgeIndex);
}

/**
 * Creates a command to remove a face
 * @param faceIndex The index of the face to remove
 * @returns A new RemoveFaceCommand
 */
export function createRemoveFaceCommand(faceIndex: number): RemoveFaceCommand {
  return new RemoveFaceCommand(faceIndex);
}

/**
 * Creates a command to transform selected elements
 * @param selection The selection to transform
 * @param matrix The transformation matrix
 * @param name Optional name for the command
 * @returns A new TransformCommand
 */
export function createTransformCommand(
  selection: Selection,
  matrix: Matrix4,
  name?: string
): TransformCommand {
  return new TransformCommand(selection, matrix, name);
}

/**
 * Creates a command to move selected elements
 * @param selection The selection to move
 * @param translation The translation vector
 * @returns A new TransformCommand for translation
 */
export function createMoveCommand(
  selection: Selection,
  translation: Vector3
): TransformCommand {
  const matrix = new Matrix4().makeTranslation(translation.x, translation.y, translation.z);
  return new TransformCommand(selection, matrix, 'Move');
}

/**
 * Creates a command to rotate selected elements
 * @param selection The selection to rotate
 * @param axis The axis of rotation
 * @param angle The angle of rotation in radians
 * @param pivot Optional pivot point for the rotation
 * @returns A new TransformCommand for rotation
 */
export function createRotateCommand(
  selection: Selection,
  axis: Vector3,
  angle: number,
  pivot?: Vector3
): TransformCommand {
  let matrix = new Matrix4().makeRotationAxis(axis.normalize(), angle);
  
  if (pivot) {
    // Apply rotation around pivot
    const pivotMatrix = new Matrix4();
    pivotMatrix.makeTranslation(-pivot.x, -pivot.y, -pivot.z);
    
    const invPivotMatrix = new Matrix4();
    invPivotMatrix.makeTranslation(pivot.x, pivot.y, pivot.z);
    
    matrix = new Matrix4()
      .multiply(invPivotMatrix)
      .multiply(matrix)
      .multiply(pivotMatrix);
  }
  
  return new TransformCommand(selection, matrix, 'Rotate');
}

/**
 * Creates a command to scale selected elements
 * @param selection The selection to scale
 * @param scale The scale factor (uniform or non-uniform)
 * @param pivot Optional pivot point for the scaling
 * @returns A new TransformCommand for scaling
 */
export function createScaleCommand(
  selection: Selection,
  scale: Vector3 | number,
  pivot?: Vector3
): TransformCommand {
  const scaleVector = typeof scale === 'number'
    ? new Vector3(scale, scale, scale)
    : scale;
  
  let matrix = new Matrix4().makeScale(scaleVector.x, scaleVector.y, scaleVector.z);
  
  if (pivot) {
    // Apply scaling around pivot
    const pivotMatrix = new Matrix4();
    pivotMatrix.makeTranslation(-pivot.x, -pivot.y, -pivot.z);
    
    const invPivotMatrix = new Matrix4();
    invPivotMatrix.makeTranslation(pivot.x, pivot.y, pivot.z);
    
    matrix = new Matrix4()
      .multiply(invPivotMatrix)
      .multiply(matrix)
      .multiply(pivotMatrix);
  }
  
  return new TransformCommand(selection, matrix, 'Scale');
}

/**
 * Creates a command to assign a material to selected faces
 * @param selection The selection of faces
 * @param materialIndex The material index to assign
 * @returns A new AssignMaterialCommand
 */
export function createAssignMaterialCommand(
  selection: Selection,
  materialIndex: number
): AssignMaterialCommand {
  return new AssignMaterialCommand(selection, materialIndex);
}
