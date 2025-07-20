import { EditableMesh } from '../core/EditableMesh.ts';
import { Command, SerializableCommand } from './Command';

/**
 * Options for CommandHistory
 */
export interface CommandHistoryOptions {
  /** Maximum number of commands to store in history */
  maxHistorySize?: number;
  /** Whether to automatically execute commands when added */
  autoExecute?: boolean;
  /** Whether to merge consecutive commands of the same type */
  mergeConsecutiveCommands?: boolean;
  /** Time window in milliseconds for merging consecutive commands */
  mergeTimeWindow?: number;
}

/**
 * Event types for CommandHistory
 */
export enum CommandHistoryEventType {
  COMMAND_EXECUTED = 'command-executed',
  COMMAND_UNDONE = 'command-undone',
  COMMAND_REDONE = 'command-redone',
  HISTORY_CLEARED = 'history-cleared',
  HISTORY_CHANGED = 'history-changed'
}

/**
 * Event data for CommandHistory events
 */
export interface CommandHistoryEvent {
  /** Type of the event */
  type: CommandHistoryEventType;
  /** Command associated with the event (if applicable) */
  command?: Command;
  /** Index of the command in history (if applicable) */
  index?: number;
}

/**
 * Listener for CommandHistory events
 */
export type CommandHistoryListener = (event: CommandHistoryEvent) => void;

/**
 * Manages the command history for undo/redo operations
 */
export class CommandHistory {
  /** The mesh that commands operate on */
  private mesh: EditableMesh;
  /** Array of commands in the history */
  private commands: Command[] = [];
  /** Current position in the command history */
  private currentIndex: number = -1;
  /** Maximum number of commands to store */
  private maxHistorySize: number;
  /** Whether to automatically execute commands when added */
  private autoExecute: boolean;
  /** Whether to merge consecutive commands of the same type */
  private mergeConsecutiveCommands: boolean;
  /** Time window in milliseconds for merging consecutive commands */
  private mergeTimeWindow: number;
  /** Event listeners */
  private listeners: Map<CommandHistoryEventType, CommandHistoryListener[]> = new Map();
  
  /**
   * Creates a new CommandHistory
   * @param mesh The mesh to operate on
   * @param options Options for the command history
   */
  constructor(mesh: EditableMesh, options: CommandHistoryOptions = {}) {
    this.mesh = mesh;
    this.maxHistorySize = options.maxHistorySize ?? 100;
    this.autoExecute = options.autoExecute ?? true;
    this.mergeConsecutiveCommands = options.mergeConsecutiveCommands ?? false;
    this.mergeTimeWindow = options.mergeTimeWindow ?? 1000; // 1 second by default
  }
  
  /**
   * Adds a command to the history
   * @param command Command to add
   * @returns Whether the command was added and executed successfully
   */
  add(command: Command): boolean {
    // If we're not at the end of the history, remove all commands after the current index
    if (this.currentIndex < this.commands.length - 1) {
      this.commands = this.commands.slice(0, this.currentIndex + 1);
      this.emitEvent({
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
      success = command.execute(this.mesh);
      if (success) {
        this.emitEvent({
          type: CommandHistoryEventType.COMMAND_EXECUTED,
          command,
          index: this.currentIndex
        });
      }
    }
    
    this.emitEvent({
      type: CommandHistoryEventType.HISTORY_CHANGED
    });
    
    return success;
  }
  
  /**
   * Undoes the last command
   * @returns Whether the undo was successful
   */
  undo(): boolean {
    if (!this.canUndo()) {
      return false;
    }
    
    const command = this.commands[this.currentIndex];
    const success = command.undo(this.mesh);
    
    if (success) {
      this.currentIndex--;
      
      this.emitEvent({
        type: CommandHistoryEventType.COMMAND_UNDONE,
        command,
        index: this.currentIndex + 1
      });
      
      this.emitEvent({
        type: CommandHistoryEventType.HISTORY_CHANGED
      });
    }
    
    return success;
  }
  
  /**
   * Redoes the next command
   * @returns Whether the redo was successful
   */
  redo(): boolean {
    if (!this.canRedo()) {
      return false;
    }
    
    const command = this.commands[this.currentIndex + 1];
    const success = command.redo(this.mesh);
    
    if (success) {
      this.currentIndex++;
      
      this.emitEvent({
        type: CommandHistoryEventType.COMMAND_REDONE,
        command,
        index: this.currentIndex
      });
      
      this.emitEvent({
        type: CommandHistoryEventType.HISTORY_CHANGED
      });
    }
    
    return success;
  }
  
  /**
   * Checks if undo is available
   * @returns Whether undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }
  
  /**
   * Checks if redo is available
   * @returns Whether redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.commands.length - 1;
  }
  
  /**
   * Gets the current command
   * @returns The current command, or undefined if there is none
   */
  getCurrentCommand(): Command | undefined {
    return this.currentIndex >= 0 ? this.commands[this.currentIndex] : undefined;
  }
  
  /**
   * Gets the next command
   * @returns The next command, or undefined if there is none
   */
  getNextCommand(): Command | undefined {
    return this.currentIndex < this.commands.length - 1 ? this.commands[this.currentIndex + 1] : undefined;
  }
  
  /**
   * Gets all commands in the history
   * @returns Array of commands
   */
  getCommands(): Command[] {
    return [...this.commands];
  }
  
  /**
   * Gets the current index in the command history
   * @returns The current index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }
  
  /**
   * Clears the command history
   */
  clear(): void {
    this.commands = [];
    this.currentIndex = -1;
    
    this.emitEvent({
      type: CommandHistoryEventType.HISTORY_CLEARED
    });
    
    this.emitEvent({
      type: CommandHistoryEventType.HISTORY_CHANGED
    });
  }
  
  /**
   * Sets the mesh that commands operate on
   * @param mesh The mesh to operate on
   */
  setMesh(mesh: EditableMesh): void {
    this.mesh = mesh;
  }
  
  /**
   * Gets the mesh that commands operate on
   * @returns The mesh
   */
  getMesh(): EditableMesh {
    return this.mesh;
  }
  
  /**
   * Adds an event listener
   * @param type Type of event to listen for
   * @param listener Listener function
   */
  addEventListener(type: CommandHistoryEventType, listener: CommandHistoryListener): void {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }
  
  /**
   * Removes an event listener
   * @param type Type of event to remove listener for
   * @param listener Listener function to remove
   */
  removeEventListener(type: CommandHistoryEventType, listener: CommandHistoryListener): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
        this.listeners.set(type, listeners);
      }
    }
  }
  
  /**
   * Emits an event to all listeners
   * @param event Event to emit
   */
  private emitEvent(event: CommandHistoryEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
    

  }
  
  /**
   * Checks if two commands can be merged
   * @param previous Previous command
   * @param current Current command
   * @returns Whether the commands can be merged
   */
  private canMergeCommands(previous: Command, current: Command): boolean {
    // Commands must be of the same type
    if (previous.constructor !== current.constructor) {
      return false;
    }
    
    // Commands must be within the merge time window
    const timeDiff = current.getTimestamp() - previous.getTimestamp();
    if (timeDiff > this.mergeTimeWindow) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Serializes the command history to JSON
   * @returns JSON representation of the command history
   */
  toJSON(): any {
    // Only serialize commands that implement SerializableCommand
    const serializableCommands = this.commands
      .filter((command): command is SerializableCommand => 'toJSON' in command && 'type' in command)
      .map(command => ({
        type: command.type,
        data: command.toJSON()
      }));
    
    return {
      commands: serializableCommands,
      currentIndex: this.currentIndex
    };
  }
  
  /**
   * Creates a CommandHistory from JSON
   * @param json JSON representation of the command history
   * @param mesh Mesh to operate on
   * @param commandFactory Factory function to create commands from JSON
   * @param options Options for the command history
   * @returns A new CommandHistory
   */
  static fromJSON(
    json: any,
    mesh: EditableMesh,
    commandFactory: (type: string, data: any) => Command | null,
    options: CommandHistoryOptions = {}
  ): CommandHistory {
    const history = new CommandHistory(mesh, options);
    
    if (json.commands && Array.isArray(json.commands)) {
      history.commands = json.commands
        .map((item: any) => commandFactory(item.type, item.data))
        .filter((command: any): command is Command => command !== null);
      
      history.currentIndex = Math.min(
        json.currentIndex || 0,
        history.commands.length - 1
      );
    }
    
    return history;
  }
}
