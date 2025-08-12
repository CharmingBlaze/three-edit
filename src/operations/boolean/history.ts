import { EditableMesh } from '../../core/EditableMesh';
import { BooleanHistoryEntry } from './types';

/**
 * Boolean history manager
 */
export class BooleanHistoryManager {
  private history: BooleanHistoryEntry[] = [];
  private maxEntries: number = 50;

  constructor(maxEntries: number = 50) {
    this.maxEntries = maxEntries;
  }

  addEntry(entry: Omit<BooleanHistoryEntry, 'timestamp'>): void {
    const historyEntry: BooleanHistoryEntry = {
      ...entry,
      timestamp: Date.now()
    };

    this.history.push(historyEntry);

    // Keep only the last maxEntries
    if (this.history.length > this.maxEntries) {
      this.history = this.history.slice(-this.maxEntries);
    }
  }

  getHistory(): BooleanHistoryEntry[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  undo(): EditableMesh | null {
    if (this.history.length === 0) {
      return null;
    }

    const lastEntry = this.history.pop()!;
    return lastEntry.originalMesh;
  }

  getLastOperation(): BooleanHistoryEntry | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }
} 