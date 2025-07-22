/**
 * @fileoverview EditManager Tests
 * Comprehensive tests for the EditManager class
 */

import { EditManager, EditTypes, EditModes } from '../editing/EditManager.js';

describe('EditManager', () => {
  let editManager;

  beforeEach(() => {
    editManager = new EditManager({
      autoSave: true,
      validation: true,
      maxHistory: 50,
      defaultMode: 'object'
    });
  });

  afterEach(() => {
    editManager = null;
  });

  describe('Constructor', () => {
    test('should create EditManager with default options', () => {
      const manager = new EditManager();
      expect(manager.autoSave).toBe(true);
      expect(manager.validation).toBe(true);
      expect(manager.maxHistory).toBe(100);
      expect(manager.defaultMode).toBe('object');
    });

    test('should create EditManager with custom options', () => {
      const manager = new EditManager({
        autoSave: false,
        validation: false,
        maxHistory: 200,
        defaultMode: 'vertex'
      });
      expect(manager.autoSave).toBe(false);
      expect(manager.validation).toBe(false);
      expect(manager.maxHistory).toBe(200);
      expect(manager.defaultMode).toBe('vertex');
    });
  });

  describe('Edit Session Management', () => {
    test('should start edit session successfully', () => {
      const result = editManager.startEdit('object', {
        selectionMode: 'single'
      });

      expect(result).toBe(true);
      expect(editManager.isCurrentlyEditing()).toBe(true);
      expect(editManager.getEditMode()).toBe('object');
    });

    test('should not start edit session when already editing', () => {
      editManager.startEdit('object');
      const result = editManager.startEdit('vertex');

      expect(result).toBe(false);
    });

    test('should end edit session successfully', () => {
      editManager.startEdit('object');
      const result = editManager.endEdit(true);

      expect(result.success).toBe(true);
      expect(editManager.isCurrentlyEditing()).toBe(false);
    });

    test('should end edit session with cancellation', () => {
      editManager.startEdit('object');
      const result = editManager.endEdit(false);

      expect(result.success).toBe(false);
      expect(editManager.isCurrentlyEditing()).toBe(false);
    });

    test('should return false when ending non-existent edit session', () => {
      const result = editManager.endEdit(true);
      expect(result.success).toBe(false);
    });
  });

  describe('Operation Management', () => {
    beforeEach(() => {
      editManager.startEdit('object');
    });

    test('should add operation successfully', () => {
      const result = editManager.addOperation('create', {
        type: 'mesh',
        position: { x: 1, y: 2, z: 3 }
      });

      expect(result).toBe(true);
    });

    test('should not add operation when not editing', () => {
      editManager.endEdit(true);
      const result = editManager.addOperation('create', {
        type: 'mesh'
      });

      expect(result).toBe(false);
    });

    test('should validate operation when validation is enabled', () => {
      const result = editManager.addOperation('invalid_type', {
        data: 'test'
      });

      expect(result).toBe(false);
    });

    test('should add multiple operations', () => {
      editManager.addOperation('create', { type: 'mesh' });
      editManager.addOperation('modify', { object: 'test' });
      editManager.addOperation('delete', { object: 'test' });

      const currentEdit = editManager.currentEdit;
      expect(currentEdit.operations).toHaveLength(3);
    });
  });

  describe('Object Selection', () => {
    const testObjects = [
      { id: 'obj1', name: 'Object 1' },
      { id: 'obj2', name: 'Object 2' },
      { id: 'obj3', name: 'Object 3' }
    ];

    test('should select objects successfully', () => {
      const result = editManager.selectObjects(testObjects, {
        clear: true,
        add: false
      });

      expect(result).toBe(true);
      expect(editManager.getSelectionCount()).toBe(3);
    });

    test('should add objects to selection', () => {
      editManager.selectObjects([testObjects[0]]);
      editManager.selectObjects([testObjects[1]], { add: true });

      expect(editManager.getSelectionCount()).toBe(2);
    });

    test('should deselect objects', () => {
      editManager.selectObjects(testObjects);
      editManager.deselectObjects([testObjects[0]]);

      expect(editManager.getSelectionCount()).toBe(2);
    });

    test('should clear all selections', () => {
      editManager.selectObjects(testObjects);
      editManager.clearSelection();

      expect(editManager.getSelectionCount()).toBe(0);
    });

    test('should get selected objects', () => {
      editManager.selectObjects(testObjects);
      const selected = editManager.getSelectedObjects();

      expect(selected).toHaveLength(3);
      expect(selected).toContain(testObjects[0]);
      expect(selected).toContain(testObjects[1]);
      expect(selected).toContain(testObjects[2]);
    });

    test('should get selection count', () => {
      expect(editManager.getSelectionCount()).toBe(0);

      editManager.selectObjects([testObjects[0]]);
      expect(editManager.getSelectionCount()).toBe(1);

      editManager.selectObjects([testObjects[1], testObjects[2]]);
      expect(editManager.getSelectionCount()).toBe(3);
    });
  });

  describe('Edit Mode Management', () => {
    test('should set edit mode successfully', () => {
      const result = editManager.setEditMode('vertex');
      expect(result).toBe(true);
      expect(editManager.getEditMode()).toBe('vertex');
    });

    test('should not set invalid edit mode', () => {
      const result = editManager.setEditMode('invalid_mode');
      expect(result).toBe(false);
      expect(editManager.getEditMode()).toBe('object'); // Default mode
    });

    test('should get current edit mode', () => {
      expect(editManager.getEditMode()).toBe('object');

      editManager.setEditMode('edge');
      expect(editManager.getEditMode()).toBe('edge');
    });

    test('should validate edit modes', () => {
      Object.values(EditModes).forEach(mode => {
        const validation = editManager.validateEditMode(mode);
        expect(validation.isValid).toBe(true);
      });
    });

    test('should reject invalid edit modes', () => {
      const invalidModes = ['invalid', 'test', 'unknown'];
      
      invalidModes.forEach(mode => {
        const validation = editManager.validateEditMode(mode);
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain(`Invalid edit mode: ${mode}`);
      });
    });
  });

  describe('Edit Statistics', () => {
    test('should get edit statistics', () => {
      const stats = editManager.getEditStatistics();

      expect(stats.isEditing).toBe(false);
      expect(stats.currentMode).toBe('object');
      expect(stats.selectedCount).toBe(0);
      expect(stats.historySize).toBe(0);
      expect(stats.autoSave).toBe(true);
      expect(stats.validation).toBe(true);
    });

    test('should update statistics when editing', () => {
      editManager.startEdit('vertex');
      editManager.selectObjects([{ id: 'test' }]);

      const stats = editManager.getEditStatistics();

      expect(stats.isEditing).toBe(true);
      expect(stats.currentMode).toBe('vertex');
      expect(stats.selectedCount).toBe(1);
    });
  });

  describe('Edit History', () => {
    test('should add to history', () => {
      editManager.startEdit('object');
      editManager.addOperation('create', { type: 'mesh' });
      editManager.endEdit(true);

      const history = editManager.getEditHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    test('should limit history size', () => {
      const manager = new EditManager({ maxHistory: 2 });

      for (let i = 0; i < 5; i++) {
        manager.startEdit('object');
        manager.addOperation('create', { type: 'mesh' });
        manager.endEdit(true);
      }

      const history = manager.getEditHistory();
      expect(history.length).toBeLessThanOrEqual(2);
    });

    test('should clear history', () => {
      editManager.startEdit('object');
      editManager.addOperation('create', { type: 'mesh' });
      editManager.endEdit(true);

      const result = editManager.clearHistory();
      expect(result).toBe(true);
      expect(editManager.getEditHistory()).toHaveLength(0);
    });
  });

  describe('Validation', () => {
    test('should validate edit mode', () => {
      const validModes = Object.values(EditModes);
      
      validModes.forEach(mode => {
        const validation = editManager.validateEditMode(mode);
        expect(validation.isValid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      });
    });

    test('should validate operations', () => {
      const validOperations = [
        { type: 'create', data: { object: 'test' } },
        { type: 'delete', data: { object: 'test' } },
        { type: 'modify', data: { object: 'test' } }
      ];

      validOperations.forEach(operation => {
        const validation = editManager.validateOperation(operation);
        expect(validation.isValid).toBe(true);
      });
    });

    test('should reject invalid operations', () => {
      const invalidOperations = [
        { data: { object: 'test' } }, // Missing type
        { type: 'invalid', data: { object: 'test' } }, // Invalid type
        { type: 'create' } // Missing data
      ];

      invalidOperations.forEach(operation => {
        const validation = editManager.validateOperation(operation);
        expect(validation.isValid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Event Handling', () => {
    test('should emit edit started event', () => {
      const eventListener = jest.fn();
      editManager.addEventListener('editStarted', eventListener);

      editManager.startEdit('object');
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'object',
          timestamp: expect.any(Number)
        })
      );
    });

    test('should emit edit committed event', () => {
      editManager.startEdit('object');
      const eventListener = jest.fn();
      editManager.addEventListener('editCommitted', eventListener);

      editManager.endEdit(true);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'object',
          success: true
        })
      );
    });

    test('should emit edit cancelled event', () => {
      editManager.startEdit('object');
      const eventListener = jest.fn();
      editManager.addEventListener('editCancelled', eventListener);

      editManager.endEdit(false);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'object',
          success: false
        })
      );
    });

    test('should emit operation added event', () => {
      editManager.startEdit('object');
      const eventListener = jest.fn();
      editManager.addEventListener('operationAdded', eventListener);

      editManager.addOperation('create', { type: 'mesh' });
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'create',
          data: { type: 'mesh' }
        })
      );
    });

    test('should emit objects selected event', () => {
      const eventListener = jest.fn();
      editManager.addEventListener('objectsSelected', eventListener);

      editManager.selectObjects([{ id: 'test' }]);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          objects: [{ id: 'test' }],
          count: 1
        })
      );
    });

    test('should emit selection cleared event', () => {
      editManager.selectObjects([{ id: 'test' }]);
      const eventListener = jest.fn();
      editManager.addEventListener('selectionCleared', eventListener);

      editManager.clearSelection();
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          count: 0
        })
      );
    });

    test('should emit edit mode changed event', () => {
      const eventListener = jest.fn();
      editManager.addEventListener('editModeChanged', eventListener);

      editManager.setEditMode('vertex');
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'vertex'
        })
      );
    });

    test('should remove event listener', () => {
      const eventListener = jest.fn();
      editManager.addEventListener('editStarted', eventListener);
      editManager.removeEventListener('editStarted', eventListener);

      editManager.startEdit('object');
      expect(eventListener).not.toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    test('should get edit manager state', () => {
      const state = editManager.getState();

      expect(state.isEditing).toBe(false);
      expect(state.currentMode).toBe('object');
      expect(state.selectedObjects).toHaveLength(0);
      expect(state.editHistory).toBe(0);
      expect(state.autoSave).toBe(true);
      expect(state.validation).toBe(true);
    });

    test('should update state when editing', () => {
      editManager.startEdit('vertex');
      editManager.selectObjects([{ id: 'test' }]);

      const state = editManager.getState();

      expect(state.isEditing).toBe(true);
      expect(state.currentMode).toBe('vertex');
      expect(state.selectedObjects).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined parameters', () => {
      expect(() => editManager.startEdit(null)).not.toThrow();
      expect(() => editManager.startEdit(undefined)).not.toThrow();
    });

    test('should handle empty object selections', () => {
      const result = editManager.selectObjects([]);
      expect(result).toBe(true);
      expect(editManager.getSelectionCount()).toBe(0);
    });

    test('should handle concurrent edit sessions', () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(Promise.resolve(editManager.startEdit('object')));
      }

      return Promise.all(promises).then(() => {
        // Only one edit session should be active
        expect(editManager.isCurrentlyEditing()).toBe(true);
      });
    });

    test('should handle large operation counts', () => {
      editManager.startEdit('object');
      
      for (let i = 0; i < 1000; i++) {
        editManager.addOperation('create', { type: 'mesh', index: i });
      }

      const currentEdit = editManager.currentEdit;
      expect(currentEdit.operations).toHaveLength(1000);
    });

    test('should handle extreme values', () => {
      editManager.startEdit('object');
      
      const extremeOperation = {
        type: 'create',
        data: {
          position: { x: 1e6, y: -1e6, z: 1e-6 },
          scale: { x: 1e3, y: 1e-3, z: 1 },
          rotation: { x: 2 * Math.PI, y: -2 * Math.PI, z: 0 }
        }
      };

      const result = editManager.addOperation('create', extremeOperation.data);
      expect(result).toBe(true);
    });
  });
}); 