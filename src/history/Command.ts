import { EditableMesh } from '../core/EditableMesh.ts';

/**
 * Interface for a command in the history system
 * Commands represent operations that can be executed, undone, and redone
 */
export interface Command {
  /** Name of the command */
  name: string;
  
  /** 
   * Executes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was executed successfully
   */
  execute(mesh: EditableMesh): boolean;
  
  /** 
   * Undoes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was undone successfully
   */
  undo(mesh: EditableMesh): boolean;
  
  /** 
   * Redoes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was redone successfully
   */
  redo(mesh: EditableMesh): boolean;
  
  /**
   * Gets a description of the command
   * @returns A string describing the command
   */
  getDescription(): string;
  
  /**
   * Gets the timestamp when the command was created
   * @returns The timestamp
   */
  getTimestamp(): number;
}

/**
 * Abstract base class for commands
 */
export abstract class BaseCommand implements Command {
  /** Name of the command */
  name: string;
  
  /** Timestamp when the command was created */
  private timestamp: number;
  
  /**
   * Creates a new command
   * @param name Name of the command
   */
  constructor(name: string) {
    this.name = name;
    this.timestamp = Date.now();
  }
  
  /**
   * Executes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was executed successfully
   */
  abstract execute(mesh: EditableMesh): boolean;
  
  /**
   * Undoes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was undone successfully
   */
  abstract undo(mesh: EditableMesh): boolean;
  
  /**
   * Redoes the command
   * @param mesh The mesh to operate on
   * @returns Whether the command was redone successfully
   */
  redo(mesh: EditableMesh): boolean {
    return this.execute(mesh);
  }
  
  /**
   * Gets a description of the command
   * @returns A string describing the command
   */
  getDescription(): string {
    return this.name;
  }
  
  /**
   * Gets the timestamp when the command was created
   * @returns The timestamp
   */
  getTimestamp(): number {
    return this.timestamp;
  }
}

/**
 * Command that can be serialized to JSON
 */
export interface SerializableCommand extends Command {
  /**
   * Serializes the command to JSON
   * @returns A JSON representation of the command
   */
  toJSON(): any;
  
  /**
   * Type identifier for the command
   */
  readonly type: string;
}

/**
 * Abstract base class for serializable commands
 */
export abstract class BaseSerializableCommand extends BaseCommand implements SerializableCommand {
  /**
   * Type identifier for the command
   */
  abstract readonly type: string;
  
  /**
   * Serializes the command to JSON
   * @returns A JSON representation of the command
   */
  abstract toJSON(): any;
}
