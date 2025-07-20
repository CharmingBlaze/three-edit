import { EditableMesh } from '../../core/EditableMesh.ts';
import { Command } from '../Command.ts';
import { CommandHistoryOptions, CommandHistoryEventType, CommandHistoryEvent } from './types';

/**
 * Core operations for CommandHistory
 */
export class CommandHistoryOperations {
  private commands: Command[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number;
  private autoExecute: boolean;
  private mergeConsecutiveCommands: boolean;
  private mergeTimeWindow: number;

  constructor(options: CommandHistoryOptions = {}) {
    this.maxHistorySize = options.maxHistorySize ?? 100;
    this.autoExecute = options.autoExecute ?? true;
    this.mergeConsecutiveCommands = options.mergeConsecutiveCommands ?? false;
    this.mergeTimeWindow = options.mergeTimeWindow ?? 1000; // 1 second by default
  }

  /**
   * Adds a command to the history
   */
  add(command: Command, mesh: EditableMesh, emitEvent: (event: CommandHistoryEvent) => void): boolean {
    // If we're not at the end of the history, remove all commands after the current index
    if (this.currentIndex < this.commands.length - 1) {
      this.commands = this.commands.slice(0, this.currentIndex + 1);
      emitEvent({
        type: CommandHistoryEventType.HISTORY_CHANGED
      });
    }
    
    // Try to merge with the previous command if enabled
    if (
      this.mergeConsecutiveCommands && 
      this.currentIndex >= 0 && 
      this.canMergeCommands(this.commands[this.currentIndex], command)
    ) {
      // Replace the current command with the merged one
      this.commands[this.currentIndex] = command;
    } else {
      // Add the new command
      this.commands.push(command);
      this.currentIndex++;
      
      // Trim history if it exceeds the maximum size
      if (this.commands.length > this.maxHistorySize) {
        this.commands.shift();
        this.currentIndex--;
      }
    }
    
    // Execute the command if auto-execute is enabled
    let success = true;
    if (this.autoExecute) {
      success = command.execute(mesh);
      if (success) {
        emitEvent({
          type: CommandHistoryEventType.COMMAND_EXECUTED,
          command,
          index: this.currentIndex
        });
      }
    }
    
    emitEvent({
      type: CommandHistoryEventType.HISTORY_CHANGED
    });
    
    return success;
  }

  /**
   * Undoes the last command
   */
  undo(mesh: EditableMesh, emitEvent: (event: CommandHistoryEvent) => void): boolean {
    if (!this.canUndo()) {
      return false;
    }
    
    const command = this.commands[this.currentIndex];
    const success = command.undo(mesh);
    
    if (success) {
      this.currentIndex--;
      
      emitEvent({
        type: CommandHistoryEventType.COMMAND_UNDONE,
        command,
        index: this.currentIndex + 1
      });
      
      emitEvent({
        type: CommandHistoryEventType.HISTORY_CHANGED
      });
    }
    
    return success;
  }

  /**
   * Redoes the next command
   */
  redo(mesh: EditableMesh, emitEvent: (event: CommandHistoryEvent) => void): boolean {
    if (!this.canRedo()) {
      return false;
    }
    
    const command = this.commands[this.currentIndex + 1];
    const success = command.redo(mesh);
    
    if (success) {
      this.currentIndex++;
      
      emitEvent({
        type: CommandHistoryEventType.COMMAND_REDONE,
        command,
        index: this.currentIndex
      });
      
      emitEvent({
        type: CommandHistoryEventType.HISTORY_CHANGED
      });
    }
    
    return success;
  }

  /**
   * Checks if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Checks if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.commands.length - 1;
  }

  /**
   * Get the current command
   */
  getCurrentCommand(): Command | undefined {
    return this.currentIndex >= 0 ? this.commands[this.currentIndex] : undefined;
  }

  /**
   * Get the next command
   */
  getNextCommand(): Command | undefined {
    return this.currentIndex < this.commands.length - 1 ? this.commands[this.currentIndex + 1] : undefined;
  }

  /**
   * Get all commands
   */
  getCommands(): Command[] {
    return [...this.commands];
  }

  /**
   * Get current index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Clear all commands
   */
  clear(emitEvent: (event: CommandHistoryEvent) => void): void {
    this.commands = [];
    this.currentIndex = -1;
    
    emitEvent({
      type: CommandHistoryEventType.HISTORY_CLEARED
    });
    
    emitEvent({
      type: CommandHistoryEventType.HISTORY_CHANGED
    });
  }

  /**
   * Check if two commands can be merged
   */
  private canMergeCommands(previous: Command, current: Command): boolean {
    // Check if commands are of the same type
    if (previous.constructor !== current.constructor) {
      return false;
    }
    
    // Check if they were executed within the merge time window
    const timeDiff = Date.now() - (previous as any).timestamp;
    if (timeDiff > this.mergeTimeWindow) {
      return false;
    }
    
    // Additional merge logic can be implemented here based on command types
    return true;
  }
} 