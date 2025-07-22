/**
 * SelectionTool - Manages object selection and highlighting
 */

import * as THREE from 'three';
import BaseTool from './BaseTool.js';

export default class SelectionTool extends BaseTool {
  constructor(scene, camera, renderer, options = {}) {
    super(scene, camera, renderer, {
      name: 'SelectionTool',
      description: 'Object selection and highlighting tool',
      icon: '👆',
      category: 'selection',
      ...options
    });

    // Selection settings
    this.selectionSettings = {
      highlightColor: options.highlightColor || 0xffff00,
      outlineColor: options.outlineColor || 0x00ff00,
      outlineWidth: options.outlineWidth || 2,
      showBoundingBox: options.showBoundingBox !== false,
      showCenter: options.showCenter !== false,
      multiSelect: options.multiSelect !== false
    };

    // Selection helpers
    this.boundingBoxes = new Map();
    this.centerPoints = new Map();
    this.outlines = new Map();
    this.highlights = new Map();

    // Selection modes
    this.selectionModes = {
      single: 'single',
      multiple: 'multiple',
      box: 'box',
      lasso: 'lasso'
    };

    this.currentMode = this.selectionModes.single;

    // Box selection
    this.boxSelection = {
      isActive: false,
      startPoint: new THREE.Vector2(),
      endPoint: new THREE.Vector2(),
      helper: null
    };
  }

  // Set selection mode
  setSelectionMode(mode) {
    if (!this.selectionModes[mode]) return false;

    this.currentMode = mode;
    this.emit('selectionModeChanged', { mode, tool: this });
    return true;
  }

  // Get selection mode
  getSelectionMode() {
    return this.currentMode;
  }

  // Get available selection modes
  getAvailableSelectionModes() {
    return Object.keys(this.selectionModes);
  }

  // Select object by clicking
  selectObjectAtMouse(event) {
    const object = this.getObjectAtMouse(event);
    if (!object) return false;

    if (this.currentMode === this.selectionModes.single) {
      this.clearSelection();
    }

    this.selectObject(object);
    return true;
  }

  // Select multiple objects
  selectObjects(objects) {
    if (!Array.isArray(objects)) return false;

    objects.forEach(object => {
      this.selectObject(object);
    });

    this.emit('objectsSelected', { objects, tool: this });
    return true;
  }

  // Deselect objects
  deselectObjects(objects) {
    if (!Array.isArray(objects)) return false;

    objects.forEach(object => {
      this.deselectObject(object);
    });

    this.emit('objectsDeselected', { objects, tool: this });
    return true;
  }

  // Select all objects
  selectAll() {
    const allObjects = this.getAllSelectableObjects();
    this.selectObjects(allObjects);
    return allObjects.length;
  }

  // Select objects by type
  selectByType(type) {
    const objects = this.getObjectsByType(type);
    this.selectObjects(objects);
    return objects.length;
  }

  // Select objects by name pattern
  selectByNamePattern(pattern) {
    const objects = this.getObjectsByNamePattern(pattern);
    this.selectObjects(objects);
    return objects.length;
  }

  // Invert selection
  invertSelection() {
    const allObjects = this.getAllSelectableObjects();
    const selectedObjects = Array.from(this.selectedObjects);
    const unselectedObjects = allObjects.filter(obj => !selectedObjects.includes(obj));
    
    this.clearSelection();
    this.selectObjects(unselectedObjects);
    
    return unselectedObjects.length;
  }

  // Get all selectable objects
  getAllSelectableObjects() {
    const objects = [];
    this.scene.traverse(object => {
      if (object.isMesh || object.isGroup) {
        objects.push(object);
      }
    });
    return objects;
  }

  // Get objects by type
  getObjectsByType(type) {
    const objects = [];
    this.scene.traverse(object => {
      if (object.type === type) {
        objects.push(object);
      }
    });
    return objects;
  }

  // Get objects by name pattern
  getObjectsByNamePattern(pattern) {
    const regex = new RegExp(pattern);
    const objects = [];
    this.scene.traverse(object => {
      if (object.name && regex.test(object.name)) {
        objects.push(object);
      }
    });
    return objects;
  }

  // Create selection helper
  createSelectionHelper(object) {
    if (!this.state.showHelpers) return;

    // Bounding box helper
    if (this.selectionSettings.showBoundingBox) {
      const boxHelper = new THREE.BoxHelper(object, this.selectionSettings.highlightColor);
      boxHelper.name = `selection-box-${object.uuid}`;
      this.scene.add(boxHelper);
      this.boundingBoxes.set(object.uuid, boxHelper);
    }

    // Center point helper
    if (this.selectionSettings.showCenter) {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: this.selectionSettings.outlineColor });
      const centerPoint = new THREE.Mesh(geometry, material);
      
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      centerPoint.position.copy(center);
      
      centerPoint.name = `selection-center-${object.uuid}`;
      this.scene.add(centerPoint);
      this.centerPoints.set(object.uuid, centerPoint);
    }

    // Outline helper
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: this.selectionSettings.outlineColor,
      side: THREE.BackSide
    });
    
    const outline = object.clone();
    outline.material = outlineMaterial;
    outline.scale.multiplyScalar(1.05);
    outline.name = `selection-outline-${object.uuid}`;
    
    this.scene.add(outline);
    this.outlines.set(object.uuid, outline);
  }

  // Remove selection helper
  removeSelectionHelper(object) {
    const uuid = object.uuid;

    // Remove bounding box
    const boundingBox = this.boundingBoxes.get(uuid);
    if (boundingBox) {
      this.scene.remove(boundingBox);
      this.boundingBoxes.delete(uuid);
    }

    // Remove center point
    const centerPoint = this.centerPoints.get(uuid);
    if (centerPoint) {
      this.scene.remove(centerPoint);
      this.centerPoints.delete(uuid);
    }

    // Remove outline
    const outline = this.outlines.get(uuid);
    if (outline) {
      this.scene.remove(outline);
      this.outlines.delete(uuid);
    }
  }

  // Start box selection
  startBoxSelection(event) {
    if (this.currentMode !== this.selectionModes.box) return;

    const mouse = this.getNormalizedMouseCoordinates(event);
    this.boxSelection.startPoint.copy(mouse);
    this.boxSelection.endPoint.copy(mouse);
    this.boxSelection.isActive = true;

    // Create box selection helper
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: this.selectionSettings.highlightColor,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    this.boxSelection.helper = new THREE.Mesh(geometry, material);
    this.scene.add(this.boxSelection.helper);
  }

  // Update box selection
  updateBoxSelection(event) {
    if (!this.boxSelection.isActive) return;

    const mouse = this.getNormalizedMouseCoordinates(event);
    this.boxSelection.endPoint.copy(mouse);

    // Update box helper
    if (this.boxSelection.helper) {
      const start = this.boxSelection.startPoint;
      const end = this.boxSelection.endPoint;
      
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      
      this.boxSelection.helper.scale.set(width, height, 1);
      this.boxSelection.helper.position.set(
        (start.x + end.x) / 2,
        (start.y + end.y) / 2,
        0
      );
    }
  }

  // End box selection
  endBoxSelection() {
    if (!this.boxSelection.isActive) return;

    // Get objects in selection box
    const objects = this.getObjectsInBox(this.boxSelection.startPoint, this.boxSelection.endPoint);
    this.selectObjects(objects);

    // Clean up
    if (this.boxSelection.helper) {
      this.scene.remove(this.boxSelection.helper);
      this.boxSelection.helper = null;
    }
    
    this.boxSelection.isActive = false;
  }

  // Get objects in selection box
  getObjectsInBox(startPoint, endPoint) {
    const objects = [];
    const intersects = this.raycast(startPoint);
    
    intersects.forEach(intersection => {
      const object = intersection.object;
      const mouse = this.getNormalizedMouseCoordinates({ clientX: intersection.point.x, clientY: intersection.point.y });
      
      if (mouse.x >= Math.min(startPoint.x, endPoint.x) &&
          mouse.x <= Math.max(startPoint.x, endPoint.x) &&
          mouse.y >= Math.min(startPoint.y, endPoint.y) &&
          mouse.y <= Math.max(startPoint.y, endPoint.y)) {
        objects.push(object);
      }
    });

    return objects;
  }

  // Get selection info
  getSelectionInfo() {
    return {
      selectedCount: this.selectedObjects.size,
      selectedObjects: Array.from(this.selectedObjects).map(obj => ({
        uuid: obj.uuid,
        name: obj.name,
        type: obj.type,
        position: obj.position.toArray()
      })),
      selectionMode: this.currentMode,
      availableModes: this.getAvailableSelectionModes()
    };
  }

  // Override selectObject
  selectObject(object) {
    super.selectObject(object);
    this.createSelectionHelper(object);
  }

  // Override deselectObject
  deselectObject(object) {
    super.deselectObject(object);
    this.removeSelectionHelper(object);
  }

  // Override clearSelection
  clearSelection() {
    super.clearSelection();
    this.boundingBoxes.clear();
    this.centerPoints.clear();
    this.outlines.clear();
  }

  // Override onMouseDown
  onMouseDown(event) {
    if (!this.isActive || !this.isEnabled) return;

    if (this.currentMode === this.selectionModes.box) {
      this.startBoxSelection(event);
    } else {
      this.selectObjectAtMouse(event);
    }
  }

  // Override onMouseMove
  onMouseMove(event) {
    if (!this.isActive || !this.isEnabled) return;

    if (this.boxSelection.isActive) {
      this.updateBoxSelection(event);
    }
  }

  // Override onMouseUp
  onMouseUp(event) {
    if (!this.isActive || !this.isEnabled) return;

    if (this.boxSelection.isActive) {
      this.endBoxSelection();
    }
  }

  // Override onKeyDown
  onKeyDown(event) {
    if (!this.isActive || !this.isEnabled) return;

    switch (event.key) {
      case 'a':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.selectAll();
        }
        break;
      case 'Escape':
        this.clearSelection();
        break;
      case 'Delete':
      case 'Backspace':
        // Handle delete selected objects
        break;
    }
  }

  // Get supported operations
  getSupportedOperations() {
    return [
      'setSelectionMode', 'getSelectionMode', 'getAvailableSelectionModes',
      'selectObjectAtMouse', 'selectObjects', 'deselectObjects',
      'selectAll', 'selectByType', 'selectByNamePattern', 'invertSelection',
      'getAllSelectableObjects', 'getObjectsByType', 'getObjectsByNamePattern',
      'getSelectionInfo'
    ];
  }

  // Get operation description
  getOperationDescription(operation) {
    const descriptions = {
      setSelectionMode: 'Set selection mode (single, multiple, box, lasso)',
      getSelectionMode: 'Get current selection mode',
      getAvailableSelectionModes: 'Get available selection modes',
      selectObjectAtMouse: 'Select object at mouse position',
      selectObjects: 'Select multiple objects',
      deselectObjects: 'Deselect multiple objects',
      selectAll: 'Select all objects in scene',
      selectByType: 'Select objects by type',
      selectByNamePattern: 'Select objects by name pattern',
      invertSelection: 'Invert current selection',
      getAllSelectableObjects: 'Get all selectable objects',
      getObjectsByType: 'Get objects by type',
      getObjectsByNamePattern: 'Get objects by name pattern',
      getSelectionInfo: 'Get current selection information'
    };
    
    return descriptions[operation] || 'Unknown operation';
  }
} 