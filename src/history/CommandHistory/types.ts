import { Command } from '../Command';

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
 * Command history state for serialization
 */
export interface CommandHistoryState {
  commands: any[];
  currentIndex: number;
  maxHistorySize: number;
  autoExecute: boolean;
  mergeConsecutiveCommands: boolean;
  mergeTimeWindow: number;
} 