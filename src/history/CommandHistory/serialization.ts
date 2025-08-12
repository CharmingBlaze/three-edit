import { EditableMesh } from '../../core/EditableMesh';
import { Command } from '../Command';
import { CommandHistoryOptions, CommandHistoryState } from './types';

/**
 * Serialization utilities for CommandHistory
 */
export class CommandHistorySerialization {
  /**
   * Serialize command history to JSON
   */
  static toJSON(commands: Command[], currentIndex: number, options: CommandHistoryOptions): CommandHistoryState {
    const serializedCommands = commands.map(command => {
      if ('toJSON' in command && typeof command.toJSON === 'function') {
        return command.toJSON();
      }
      return {
        type: command.constructor.name,
        data: {}
      };
    });

    return {
      commands: serializedCommands,
      currentIndex,
      maxHistorySize: options.maxHistorySize ?? 100,
      autoExecute: options.autoExecute ?? true,
      mergeConsecutiveCommands: options.mergeConsecutiveCommands ?? false,
      mergeTimeWindow: options.mergeTimeWindow ?? 1000
    };
  }

  /**
   * Deserialize command history from JSON
   */
  static fromJSON(
    json: CommandHistoryState,
    _mesh: EditableMesh,
    commandFactory: (type: string, data: any) => Command | null,
    _options: CommandHistoryOptions = {}
  ): { commands: Command[], currentIndex: number } {
    const commands: Command[] = [];
    
    // Deserialize commands
    for (const commandData of json.commands) {
      const command = commandFactory(commandData.type, commandData.data);
      if (command) {
        commands.push(command);
      }
    }
    
    // Validate current index
    const currentIndex = Math.min(json.currentIndex, commands.length - 1);
    
    return {
      commands,
      currentIndex
    };
  }

  /**
   * Create a command factory function
   */
  static createCommandFactory(): (type: string, data: any) => Command | null {
    return (type: string, _data: any) => {
      // This is a placeholder implementation
      // In a real implementation, you would have a registry of command types
      console.warn(`Command type '${type}' not found in factory`);
      return null;
    };
  }

  /**
   * Validate command history state
   */
  static validateState(state: CommandHistoryState): boolean {
    if (!Array.isArray(state.commands)) {
      return false;
    }
    
    if (typeof state.currentIndex !== 'number' || state.currentIndex < -1) {
      return false;
    }
    
    if (state.currentIndex >= state.commands.length) {
      return false;
    }
    
    return true;
  }

  /**
   * Get command history statistics
   */
  static getStatistics(commands: Command[], currentIndex: number): {
    totalCommands: number;
    undoableCommands: number;
    redoableCommands: number;
    memoryUsage: number;
  } {
    const totalCommands = commands.length;
    const undoableCommands = currentIndex + 1;
    const redoableCommands = totalCommands - undoableCommands;
    
    // Estimate memory usage (rough calculation)
    const memoryUsage = commands.reduce((total, command) => {
      return total + ('toJSON' in command && typeof command.toJSON === 'function' ? JSON.stringify(command.toJSON()).length : 100);
    }, 0);
    
    return {
      totalCommands,
      undoableCommands,
      redoableCommands,
      memoryUsage
    };
  }
} 