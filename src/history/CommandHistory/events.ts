import { CommandHistoryEvent, CommandHistoryEventType, CommandHistoryListener } from './types';

/**
 * Event management for CommandHistory
 */
export class CommandHistoryEvents {
  private listeners: Map<CommandHistoryEventType, CommandHistoryListener[]> = new Map();

  /**
   * Add event listener
   */
  addEventListener(type: CommandHistoryEventType, listener: CommandHistoryListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    const listeners = this.listeners.get(type)!;
    if (!listeners.includes(listener)) {
      listeners.push(listener);
    }
  }

  /**
   * Remove event listener
   */
  removeEventListener(type: CommandHistoryEventType, listener: CommandHistoryListener): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
      
      if (listeners.length === 0) {
        this.listeners.delete(type);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  emitEvent(event: CommandHistoryEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      // Create a copy of the listeners array to avoid issues if listeners are removed during iteration
      const listenersCopy = [...listeners];
      for (const listener of listenersCopy) {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in command history event listener:', error);
        }
      }
    }
  }

  /**
   * Clear all event listeners
   */
  clearListeners(): void {
    this.listeners.clear();
  }

  /**
   * Get all event listeners for a specific type
   */
  getListeners(type: CommandHistoryEventType): CommandHistoryListener[] {
    return this.listeners.get(type) || [];
  }

  /**
   * Check if there are any listeners for a specific type
   */
  hasListeners(type: CommandHistoryEventType): boolean {
    const listeners = this.listeners.get(type);
    return listeners ? listeners.length > 0 : false;
  }
} 