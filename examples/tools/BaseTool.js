/**
 * BaseTool - Base class for all 3D editing tools
 */

import * as THREE from 'three';

export default class BaseTool {
  constructor(scene, camera, renderer, options = {}) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.isActive = false;
    this.isEnabled = true;
    
    // Tool options
    this.options = {
      name: options.name || 'BaseTool',
      description: options.description || 'Base tool for 3D editing',
      icon: options.icon || '🔧',
      category: options.category || 'general',
      ...options
    };
    
    // Event handling
    this.eventListeners = new Map();
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = options.maxHistorySize || 50;
    
    // Selection and interaction
    this.selectedObjects = new Set();
    this.hoveredObject = null;
    this.isDragging = false;
    this.dragStart = new THREE.Vector3();
    this.dragEnd = new THREE.Vector3();
    
    // Helpers and visual aids
    this.helpers = new Set();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Tool state
    this.state = {
      mode: 'select',
      snap: false,
      grid: false,
      showHelpers: true
    };
  }

  // Activate the tool
  activate() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.setupEventListeners();
    this.createHelpers();
    this.emit('activated', { tool: this });
    
    console.log(`Tool activated: ${this.options.name}`);
  }

  // Deactivate the tool
  deactivate() {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.removeEventListeners();
    this.removeHelpers();
    this.clearSelection();
    this.emit('deactivated', { tool: this });
    
    console.log(`Tool deactivated: ${this.options.name}`);
  }

  // Enable the tool
  enable() {
    this.isEnabled = true;
    this.emit('enabled', { tool: this });
  }

  // Disable the tool
  disable() {
    this.isEnabled = false;
    this.emit('disabled', { tool: this });
  }

  // Setup event listeners
  setupEventListeners() {
    // Mouse events
    this.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.addEventListener('click', this.onClick.bind(this));
    this.addEventListener('dblclick', this.onDoubleClick.bind(this));
    
    // Keyboard events
    this.addEventListener('keydown', this.onKeyDown.bind(this));
    this.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // Touch events
    this.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  // Remove event listeners
  removeEventListeners() {
    this.eventListeners.forEach((listeners, event) => {
      listeners.forEach(listener => {
        document.removeEventListener(event, listener);
      });
    });
    this.eventListeners.clear();
  }

  // Add event listener
  addEventListener(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
    document.addEventListener(event, listener);
  }

  // Remove event listener
  removeEventListener(event, listener) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
        document.removeEventListener(event, listener);
      }
    }
  }

  // Emit event
  emit(event, data = {}) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener({ ...data, tool: this, event });
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get normalized mouse coordinates
  getNormalizedMouseCoordinates(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    return this.mouse.clone();
  }

  // Perform raycasting
  raycast(mouse) {
    this.raycaster.setFromCamera(mouse, this.camera);
    return this.raycaster.intersectObjects(this.scene.children, true);
  }

  // Get object at mouse position
  getObjectAtMouse(event) {
    const mouse = this.getNormalizedMouseCoordinates(event);
    const intersects = this.raycast(mouse);
    return intersects.length > 0 ? intersects[0].object : null;
  }

  // Select object
  selectObject(object) {
    if (!object) return;
    
    this.selectedObjects.add(object);
    this.emit('objectSelected', { object, tool: this });
    
    // Add selection helper
    this.addSelectionHelper(object);
  }

  // Deselect object
  deselectObject(object) {
    if (!object) return;
    
    this.selectedObjects.delete(object);
    this.emit('objectDeselected', { object, tool: this });
    
    // Remove selection helper
    this.removeSelectionHelper(object);
  }

  // Clear selection
  clearSelection() {
    this.selectedObjects.forEach(object => {
      this.removeSelectionHelper(object);
    });
    this.selectedObjects.clear();
    this.emit('selectionCleared', { tool: this });
  }

  // Add selection helper
  addSelectionHelper(object) {
    if (!this.state.showHelpers) return;
    
    const helper = new THREE.BoxHelper(object, 0xffff00);
    helper.name = `selection-helper-${object.uuid}`;
    this.scene.add(helper);
    this.helpers.add(helper);
  }

  // Remove selection helper
  removeSelectionHelper(object) {
    this.helpers.forEach(helper => {
      if (helper.name === `selection-helper-${object.uuid}`) {
        this.scene.remove(helper);
        this.helpers.delete(helper);
      }
    });
  }

  // Create helpers
  createHelpers() {
    // Override in subclasses
  }

  // Remove helpers
  removeHelpers() {
    this.helpers.forEach(helper => {
      this.scene.remove(helper);
    });
    this.helpers.clear();
  }

  // Add to history
  addToHistory(action) {
    // Remove any history after current index
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Add new action
    this.history.push({
      ...action,
      timestamp: Date.now(),
      tool: this.options.name
    });
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
    
    this.emit('historyChanged', { action, tool: this });
  }

  // Undo last action
  undo() {
    if (this.historyIndex < 0) return false;
    
    const action = this.history[this.historyIndex];
    if (action.undo) {
      action.undo();
      this.historyIndex--;
      this.emit('actionUndone', { action, tool: this });
      return true;
    }
    return false;
  }

  // Redo last action
  redo() {
    if (this.historyIndex >= this.history.length - 1) return false;
    
    this.historyIndex++;
    const action = this.history[this.historyIndex];
    if (action.redo) {
      action.redo();
      this.emit('actionRedone', { action, tool: this });
      return true;
    }
    return false;
  }

  // Get tool info
  getInfo() {
    return {
      name: this.options.name,
      description: this.options.description,
      icon: this.options.icon,
      category: this.options.category,
      isActive: this.isActive,
      isEnabled: this.isEnabled,
      selectedObjects: this.selectedObjects.size,
      historySize: this.history.length,
      historyIndex: this.historyIndex
    };
  }

  // Get supported operations
  getSupportedOperations() {
    return ['activate', 'deactivate', 'enable', 'disable', 'select', 'deselect', 'clearSelection', 'undo', 'redo'];
  }

  // Get operation description
  getOperationDescription(operation) {
    const descriptions = {
      activate: 'Activate the tool',
      deactivate: 'Deactivate the tool',
      enable: 'Enable the tool',
      disable: 'Disable the tool',
      select: 'Select an object',
      deselect: 'Deselect an object',
      clearSelection: 'Clear all selections',
      undo: 'Undo last action',
      redo: 'Redo last action'
    };
    
    return descriptions[operation] || 'Unknown operation';
  }

  // Event handlers (to be overridden)
  onMouseDown(event) {
    // Override in subclasses
  }

  onMouseMove(event) {
    // Override in subclasses
  }

  onMouseUp(event) {
    // Override in subclasses
  }

  onClick(event) {
    // Override in subclasses
  }

  onDoubleClick(event) {
    // Override in subclasses
  }

  onKeyDown(event) {
    // Override in subclasses
  }

  onKeyUp(event) {
    // Override in subclasses
  }

  onTouchStart(event) {
    // Override in subclasses
  }

  onTouchMove(event) {
    // Override in subclasses
  }

  onTouchEnd(event) {
    // Override in subclasses
  }

  // Update tool
  update() {
    // Override in subclasses
  }

  // Dispose tool
  dispose() {
    this.deactivate();
    this.removeEventListeners();
    this.removeHelpers();
    this.clearSelection();
    this.history = [];
    this.eventListeners.clear();
    this.emit('disposed', { tool: this });
  }
}
