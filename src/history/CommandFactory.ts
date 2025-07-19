import { Command } from './Command';
import { AddVertexCommand } from './commands/AddVertexCommand';
import { AddEdgeCommand } from './commands/AddEdgeCommand';
import { AddFaceCommand } from './commands/AddFaceCommand';
import { RemoveVertexCommand } from './commands/RemoveVertexCommand';
import { RemoveEdgeCommand } from './commands/RemoveEdgeCommand';
import { RemoveFaceCommand } from './commands/RemoveFaceCommand';
import { TransformCommand } from './commands/TransformCommand';
import { AssignMaterialCommand } from './commands/AssignMaterialCommand';

/**
 * Factory for creating commands from JSON
 */
export class CommandFactory {
  /**
   * Creates a command from JSON
   * @param type Type of the command
   * @param data JSON data for the command
   * @returns A new command, or null if the type is not recognized
   */
  static createCommand(type: string, data: any): Command | null {
    switch (type) {
      case 'AddVertexCommand':
        return AddVertexCommand.fromJSON(data);
        
      case 'AddEdgeCommand':
        return AddEdgeCommand.fromJSON(data);
        
      case 'AddFaceCommand':
        return AddFaceCommand.fromJSON(data);
        
      case 'RemoveVertexCommand':
        return RemoveVertexCommand.fromJSON(data);
        
      case 'RemoveEdgeCommand':
        return RemoveEdgeCommand.fromJSON(data);
        
      case 'RemoveFaceCommand':
        return RemoveFaceCommand.fromJSON(data);
        
      case 'TransformCommand':
        return TransformCommand.fromJSON(data);
        
      case 'AssignMaterialCommand':
        return AssignMaterialCommand.fromJSON(data);
        
      default:
        console.warn(`Unknown command type: ${type}`);
        return null;
    }
  }
}
