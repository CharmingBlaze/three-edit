/**
 * @fileoverview Transform Tool
 * Modular transform tool for move, rotate, and scale operations
 */

import * as THREE from 'three';
import { EditToolStates } from '../types/operationTypes.js';
import { distance, calculateCentroid } from '../core/mathUtils.js';

/**
 * Transform tool for move, rotate, and scale operations
 */
export class TransformTool {
  /**
   * Create a transform tool
   * @param {Object} options - Tool options
   * @param {string} options.mode - Transform mode: 'move', 'rotate', 'scale'
   * @param {THREE.Vector3} options.pivot - Transform pivot point
   * @param {boolean} options.constrain - Enable axis constraints
   * @param {Object} options.constraints - Axis constraints
   */
  constructor(options = {}) {
    const {
      mode = 'move',
      pivot = new THREE.Vector3(0, 0, 0),
      constrain = false,
      constraints = { x: true, y: true, z: true }
    } = options;

    this.type = 'transform';
    this.mode = mode;
    this.pivot = pivot;
    this.constrain = constrain;
    this.constraints = constraints;
    this.state = EditToolStates.INACTIVE;
    
    this.startPoint = null;
    this.currentPoint = null;
    this.dragDelta = new THREE.Vector3();
    this.isDragging = false;
  }

  /**
   * Activate the tool
   * @returns {boolean} Success status
   */
  activate() {
    this.state = EditToolStates.ACTIVE;
    this.isDragging = false;
    return true;
  }

  /**
   * Deactivate the tool
   * @returns {boolean} Success status
   */
  deactivate() {
    this.state = EditToolStates.INACTIVE;
    this.isDragging = false;
    this.startPoint = null;
    this.currentPoint = null;
    this.dragDelta.set(0, 0, 0);
    return true;
  }

  /**
   * Start drag operation
   * @param {THREE.Vector3} point - Start point
   * @returns {boolean} Success status
   */
  startDrag(point) {
    this.startPoint = point.clone();
    this.currentPoint = point.clone();
    this.dragDelta.set(0, 0, 0);
    this.isDragging = true;
    this.state = EditToolStates.DRAGGING;
    return true;
  }

  /**
   * Update drag operation
   * @param {THREE.Vector3} point - Current point
   * @returns {Object} Transform data
   */
  updateDrag(point) {
    if (!this.isDragging || !this.startPoint) {
      return null;
    }

    this.currentPoint = point.clone();
    this.dragDelta.subVectors(this.currentPoint, this.startPoint);

    // Apply constraints
    if (this.constrain) {
      if (!this.constraints.x) this.dragDelta.x = 0;
      if (!this.constraints.y) this.dragDelta.y = 0;
      if (!this.constraints.z) this.dragDelta.z = 0;
    }

    return this.calculateTransform();
  }

  /**
   * End drag operation
   * @returns {Object} Final transform data
   */
  endDrag() {
    if (!this.isDragging) {
      return null;
    }

    const transform = this.calculateTransform();
    this.isDragging = false;
    this.state = EditToolStates.ACTIVE;
    
    return transform;
  }

  /**
   * Calculate transform based on current mode
   * @returns {Object} Transform data
   */
  calculateTransform() {
    switch (this.mode) {
      case 'move':
        return this.calculateMove();
      case 'rotate':
        return this.calculateRotate();
      case 'scale':
        return this.calculateScale();
      default:
        return null;
    }
  }

  /**
   * Calculate move transform
   * @returns {Object} Move transform data
   */
  calculateMove() {
    return {
      type: 'move',
      delta: this.dragDelta.clone(),
      pivot: this.pivot.clone()
    };
  }

  /**
   * Calculate rotate transform
   * @returns {Object} Rotate transform data
   */
  calculateRotate() {
    const angle = this.dragDelta.length() * 0.01; // Scale factor
    const axis = new THREE.Vector3(0, 1, 0); // Default Y axis
    
    return {
      type: 'rotate',
      angle,
      axis,
      pivot: this.pivot.clone()
    };
  }

  /**
   * Calculate scale transform
   * @returns {Object} Scale transform data
   */
  calculateScale() {
    const scale = new THREE.Vector3(1, 1, 1);
    const deltaLength = this.dragDelta.length();
    
    // Uniform scaling based on drag distance
    const scaleFactor = 1 + deltaLength * 0.01;
    scale.setScalar(scaleFactor);
    
    return {
      type: 'scale',
      scale,
      pivot: this.pivot.clone()
    };
  }

  /**
   * Set transform mode
   * @param {string} mode - New transform mode
   * @returns {boolean} Success status
   */
  setMode(mode) {
    const validModes = ['move', 'rotate', 'scale'];
    if (!validModes.includes(mode)) {
      return false;
    }
    
    this.mode = mode;
    return true;
  }

  /**
   * Set pivot point
   * @param {THREE.Vector3} pivot - New pivot point
   */
  setPivot(pivot) {
    this.pivot = pivot.clone();
  }

  /**
   * Get drag delta
   * @returns {THREE.Vector3} Current drag delta
   */
  getDragDelta() {
    return this.dragDelta.clone();
  }

  /**
   * Check if currently dragging
   * @returns {boolean} Dragging status
   */
  isCurrentlyDragging() {
    return this.isDragging;
  }

  /**
   * Get tool state
   * @returns {Object} Tool state
   */
  getState() {
    return {
      type: this.type,
      mode: this.mode,
      state: this.state,
      isDragging: this.isDragging,
      pivot: this.pivot.clone(),
      dragDelta: this.dragDelta.clone(),
      constrain: this.constrain,
      constraints: { ...this.constraints }
    };
  }
} 