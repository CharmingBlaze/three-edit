/**
 * @fileoverview SelectionManager Tests
 * Comprehensive tests for the SelectionManager class
 */

import { SelectionManager, SelectionItem } from '../selection/SelectionManager.js';
import { SelectionTypes, SelectionModes } from '../selection/index.js';

describe('SelectionManager', () => {
  let selectionManager;

  beforeEach(() => {
    selectionManager = new SelectionManager({
      multiSelect: true,
      autoHighlight: true,
      maxSelections: 100
    });
  });

  afterEach(() => {
    selectionManager = null;
  });

  describe('Constructor', () => {
    test('should create SelectionManager with default options', () => {
      const manager = new SelectionManager();
      expect(manager.multiSelect).toBe(true);
      expect(manager.autoHighlight).toBe(true);
      expect(manager.maxSelections).toBe(1000);
    });

    test('should create SelectionManager with custom options', () => {
      const manager = new SelectionManager({
        multiSelect: false,
        autoHighlight: false,
        maxSelections: 50
      });
      expect(manager.multiSelect).toBe(false);
      expect(manager.autoHighlight).toBe(false);
      expect(manager.maxSelections).toBe(50);
    });
  });

  describe('Selection Mode', () => {
    test('should set valid selection mode', () => {
      const result = selectionManager.setSelectionMode('object');
      expect(result).toBe(true);
      expect(selectionManager.getSelectionMode()).toBe('object');
    });

    test('should reject invalid selection mode', () => {
      const result = selectionManager.setSelectionMode('invalid');
      expect(result).toBe(false);
      expect(selectionManager.getSelectionMode()).toBe('object'); // Default mode
    });

    test('should support all valid selection modes', () => {
      const validModes = ['object', 'vertex', 'edge', 'face', 'mesh'];
      
      validModes.forEach(mode => {
        const result = selectionManager.setSelectionMode(mode);
        expect(result).toBe(true);
        expect(selectionManager.getSelectionMode()).toBe(mode);
      });
    });
  });

  describe('Adding Selections', () => {
    test('should add selection successfully', () => {
      const selection = selectionManager.addSelection('object', 'test-id', { name: 'Test' });
      
      expect(selection).toBeInstanceOf(SelectionItem);
      expect(selection.type).toBe('object');
      expect(selection.id).toBe('test-id');
      expect(selection.data.name).toBe('Test');
    });

    test('should not add duplicate selection', () => {
      selectionManager.addSelection('object', 'test-id');
      const duplicate = selectionManager.addSelection('object', 'test-id');
      
      expect(duplicate).toBeInstanceOf(SelectionItem);
      expect(selectionManager.getAllSelections()).toHaveLength(1);
    });

    test('should respect maxSelections limit', () => {
      const manager = new SelectionManager({ maxSelections: 2 });
      
      manager.addSelection('object', 'id1');
      manager.addSelection('object', 'id2');
      const third = manager.addSelection('object', 'id3');
      
      expect(third).toBeNull();
      expect(manager.getAllSelections()).toHaveLength(2);
    });

    test('should clear previous selection in single-select mode', () => {
      const manager = new SelectionManager({ multiSelect: false });
      
      manager.addSelection('object', 'id1');
      manager.addSelection('object', 'id2');
      
      expect(manager.getAllSelections()).toHaveLength(1);
      expect(manager.getSelection('object', 'id2')).toBeTruthy();
    });
  });

  describe('Removing Selections', () => {
    test('should remove selection successfully', () => {
      selectionManager.addSelection('object', 'test-id');
      const result = selectionManager.removeSelection('object', 'test-id');
      
      expect(result).toBe(true);
      expect(selectionManager.getAllSelections()).toHaveLength(0);
    });

    test('should return false for non-existent selection', () => {
      const result = selectionManager.removeSelection('object', 'non-existent');
      expect(result).toBe(false);
    });

    test('should clear all selections', () => {
      selectionManager.addSelection('object', 'id1');
      selectionManager.addSelection('vertex', 'id2');
      selectionManager.addSelection('edge', 'id3');
      
      selectionManager.clearSelection();
      expect(selectionManager.getAllSelections()).toHaveLength(0);
    });

    test('should clear selections by type', () => {
      selectionManager.addSelection('object', 'obj1');
      selectionManager.addSelection('object', 'obj2');
      selectionManager.addSelection('vertex', 'vert1');
      
      selectionManager.clearSelectionsByType('object');
      
      expect(selectionManager.getSelectionsByType('object')).toHaveLength(0);
      expect(selectionManager.getSelectionsByType('vertex')).toHaveLength(1);
    });
  });

  describe('Checking Selections', () => {
    test('should check if item is selected', () => {
      selectionManager.addSelection('object', 'test-id');
      
      expect(selectionManager.isSelected('object', 'test-id')).toBe(true);
      expect(selectionManager.isSelected('object', 'non-existent')).toBe(false);
    });

    test('should get selection item', () => {
      const added = selectionManager.addSelection('object', 'test-id', { name: 'Test' });
      const retrieved = selectionManager.getSelection('object', 'test-id');
      
      expect(retrieved).toBeInstanceOf(SelectionItem);
      expect(retrieved.id).toBe('test-id');
      expect(retrieved.data.name).toBe('Test');
    });

    test('should return null for non-existent selection', () => {
      const selection = selectionManager.getSelection('object', 'non-existent');
      expect(selection).toBeNull();
    });
  });

  describe('Getting Selections', () => {
    test('should get all selections', () => {
      selectionManager.addSelection('object', 'obj1');
      selectionManager.addSelection('vertex', 'vert1');
      selectionManager.addSelection('edge', 'edge1');
      
      const all = selectionManager.getAllSelections();
      expect(all).toHaveLength(3);
    });

    test('should get selections by type', () => {
      selectionManager.addSelection('object', 'obj1');
      selectionManager.addSelection('object', 'obj2');
      selectionManager.addSelection('vertex', 'vert1');
      
      const objects = selectionManager.getSelectionsByType('object');
      const vertices = selectionManager.getSelectionsByType('vertex');
      
      expect(objects).toHaveLength(2);
      expect(vertices).toHaveLength(1);
    });

    test('should get selected IDs by type', () => {
      selectionManager.addSelection('object', 'obj1');
      selectionManager.addSelection('object', 'obj2');
      selectionManager.addSelection('vertex', 'vert1');
      
      const objectIds = selectionManager.getSelectedIds('object');
      const vertexIds = selectionManager.getSelectedIds('vertex');
      
      expect(objectIds).toContain('obj1');
      expect(objectIds).toContain('obj2');
      expect(vertexIds).toContain('vert1');
    });
  });

  describe('Toggling Selections', () => {
    test('should toggle selection on', () => {
      const result = selectionManager.toggleSelection('object', 'test-id');
      expect(result).toBe(true);
      expect(selectionManager.isSelected('object', 'test-id')).toBe(true);
    });

    test('should toggle selection off', () => {
      selectionManager.addSelection('object', 'test-id');
      const result = selectionManager.toggleSelection('object', 'test-id');
      
      expect(result).toBe(false);
      expect(selectionManager.isSelected('object', 'test-id')).toBe(false);
    });
  });

  describe('Multiple Selections', () => {
    test('should select multiple items', () => {
      const items = [
        { type: 'object', id: 'obj1', data: { name: 'Object 1' } },
        { type: 'object', id: 'obj2', data: { name: 'Object 2' } },
        { type: 'vertex', id: 'vert1', data: { position: { x: 0, y: 0, z: 0 } } }
      ];
      
      const results = selectionManager.selectMultiple(items);
      expect(results).toHaveLength(3);
      expect(selectionManager.getAllSelections()).toHaveLength(3);
    });

    test('should handle empty selection array', () => {
      const results = selectionManager.selectMultiple([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('Highlighting', () => {
    test('should highlight selection', () => {
      selectionManager.addSelection('object', 'test-id');
      const result = selectionManager.highlightSelection('object', 'test-id', true);
      
      expect(result).toBe(true);
      const selection = selectionManager.getSelection('object', 'test-id');
      expect(selection.highlighted).toBe(true);
    });

    test('should unhighlight selection', () => {
      selectionManager.addSelection('object', 'test-id');
      selectionManager.highlightSelection('object', 'test-id', true);
      selectionManager.highlightSelection('object', 'test-id', false);
      
      const selection = selectionManager.getSelection('object', 'test-id');
      expect(selection.highlighted).toBe(false);
    });

    test('should return false for non-existent selection', () => {
      const result = selectionManager.highlightSelection('object', 'non-existent', true);
      expect(result).toBe(false);
    });
  });

  describe('Statistics', () => {
    test('should get selection statistics', () => {
      selectionManager.addSelection('object', 'obj1');
      selectionManager.addSelection('object', 'obj2');
      selectionManager.addSelection('vertex', 'vert1');
      
      const stats = selectionManager.getStatistics();
      
      expect(stats.totalSelections).toBe(3);
      expect(stats.mode).toBe('object');
      expect(stats.multiSelect).toBe(true);
      expect(stats.objectCount).toBe(2);
      expect(stats.vertexCount).toBe(1);
    });
  });

  describe('History', () => {
    test('should maintain selection history', () => {
      selectionManager.addSelection('object', 'test-id');
      selectionManager.removeSelection('object', 'test-id');
      
      const history = selectionManager.getHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    test('should respect max history size', () => {
      const manager = new SelectionManager({ maxSelections: 10 });
      
      // Add more than max history size
      for (let i = 0; i < 15; i++) {
        manager.addSelection('object', `id${i}`);
      }
      
      const history = manager.getHistory();
      expect(history.length).toBeLessThanOrEqual(50); // Default max history size
    });
  });

  describe('Event Listeners', () => {
    test('should add and remove event listeners', () => {
      const callback = jest.fn();
      
      selectionManager.addEventListener('selectionAdded', callback);
      selectionManager.addSelection('object', 'test-id');
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          item: expect.any(SelectionItem)
        })
      );
      
      selectionManager.removeEventListener('selectionAdded', callback);
      callback.mockClear();
      
      selectionManager.addSelection('object', 'test-id2');
      expect(callback).not.toHaveBeenCalled();
    });

    test('should notify listeners on selection events', () => {
      const addedCallback = jest.fn();
      const removedCallback = jest.fn();
      const clearedCallback = jest.fn();
      
      selectionManager.addEventListener('selectionAdded', addedCallback);
      selectionManager.addEventListener('selectionRemoved', removedCallback);
      selectionManager.addEventListener('selectionCleared', clearedCallback);
      
      selectionManager.addSelection('object', 'test-id');
      selectionManager.removeSelection('object', 'test-id');
      selectionManager.clearSelection();
      
      expect(addedCallback).toHaveBeenCalled();
      expect(removedCallback).toHaveBeenCalled();
      expect(clearedCallback).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined parameters', () => {
      expect(() => selectionManager.addSelection(null, 'id')).not.toThrow();
      expect(() => selectionManager.addSelection('object', null)).not.toThrow();
      expect(() => selectionManager.addSelection('object', 'id', null)).not.toThrow();
    });

    test('should handle empty strings', () => {
      const result = selectionManager.addSelection('object', '');
      expect(result).toBeInstanceOf(SelectionItem);
    });

    test('should handle special characters in IDs', () => {
      const specialId = 'test-id-with-special-chars-!@#$%^&*()';
      const result = selectionManager.addSelection('object', specialId);
      expect(result).toBeInstanceOf(SelectionItem);
      expect(selectionManager.isSelected('object', specialId)).toBe(true);
    });
  });
});

describe('SelectionItem', () => {
  test('should create SelectionItem with required parameters', () => {
    const item = new SelectionItem('object', 'test-id', { name: 'Test' });
    
    expect(item.type).toBe('object');
    expect(item.id).toBe('test-id');
    expect(item.data.name).toBe('Test');
    expect(item.highlighted).toBe(false);
    expect(item.selectedAt).toBeInstanceOf(Number);
  });

  test('should create SelectionItem with options', () => {
    const item = new SelectionItem('object', 'test-id', { name: 'Test' }, {
      highlighted: true,
      transform: { position: { x: 1, y: 2, z: 3 } },
      metadata: { custom: 'data' }
    });
    
    expect(item.highlighted).toBe(true);
    expect(item.transform).toEqual({ position: { x: 1, y: 2, z: 3 } });
    expect(item.metadata.custom).toBe('data');
  });

  test('should clone SelectionItem', () => {
    const original = new SelectionItem('object', 'test-id', { name: 'Test' }, {
      highlighted: true,
      transform: { position: { x: 1, y: 2, z: 3 } }
    });
    
    const cloned = original.clone();
    
    expect(cloned).toBeInstanceOf(SelectionItem);
    expect(cloned.type).toBe(original.type);
    expect(cloned.id).toBe(original.id);
    expect(cloned.data).toEqual(original.data);
    expect(cloned.highlighted).toBe(original.highlighted);
    expect(cloned.transform).toEqual(original.transform);
    expect(cloned).not.toBe(original);
  });

  test('should get selection summary', () => {
    const item = new SelectionItem('object', 'test-id', { name: 'Test', value: 123 });
    const summary = item.getSummary();
    
    expect(summary.type).toBe('object');
    expect(summary.id).toBe('test-id');
    expect(summary.highlighted).toBe(false);
    expect(summary.selectedAt).toBeInstanceOf(Number);
    expect(summary.dataKeys).toContain('name');
    expect(summary.dataKeys).toContain('value');
  });

  test('should validate SelectionItem', () => {
    const validItem = new SelectionItem('object', 'test-id');
    const validation = validItem.validate();
    
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  test('should validate SelectionItem with errors', () => {
    const invalidItem = new SelectionItem('object', 'test-id');
    invalidItem.u = 2; // Invalid UV coordinate
    
    const validation = invalidItem.validate();
    expect(validation.isValid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
}); 