/**
 * VertexSelection - Manages vertex selection state
 * Provides methods for selecting and managing vertex selections
 */

import * as THREE from 'three';
import VertexOperations from './VertexOperations.js';

export default class VertexSelection {
  /**
   * Create a new VertexSelection
   * @param {Editor} editor - Reference to the editor
   */
  constructor(editor) {
    this.editor = editor;
    this.operations = new VertexOperations();
    this.selectedVertices = [];
  }

  /**
   * Select a vertex
   * @param {THREE.Object3D} object - Object containing the vertex
   * @param {Number} index - Vertex index
   */
  selectVertex(object, index) {
    // Clear current selection
    this.clearSelection();
    
    // Add to selection
    this.selectedVertices.push({ object, index });
    
    // Notify selection change
    this.emitSelectionChanged();
  }

  /**
   * Toggle vertex selection
   * @param {THREE.Object3D} object - Object containing the vertex
   * @param {Number} index - Vertex index
   */
  toggleVertex(object, index) {
    // Check if already selected
    const existingIndex = this.findVertexIndex(object, index);
    
    if (existingIndex !== -1) {
      // Remove from selection
      this.selectedVertices.splice(existingIndex, 1);
    } else {
      // Add to selection
      this.selectedVertices.push({ object, index });
    }
    
    // Notify selection change
    this.emitSelectionChanged();
  }

  /**
   * Add vertex to selection
   * @param {THREE.Object3D} object - Object containing the vertex
   * @param {Number} index - Vertex index
   */
  addVertex(object, index) {
    // Check if already selected
    if (this.isVertexSelected(object, index)) return;
    
    // Add to selection
    this.selectedVertices.push({ object, index });
    
    // Notify selection change
    this.emitSelectionChanged();
  }

  /**
   * Remove vertex from selection
   * @param {THREE.Object3D} object - Object containing the vertex
   * @param {Number} index - Vertex index
   */
  removeVertex(object, index) {
    const existingIndex = this.findVertexIndex(object, index);
    
    if (existingIndex !== -1) {
      // Remove from selection
      this.selectedVertices.splice(existingIndex, 1);
      
      // Notify selection change
      this.emitSelectionChanged();
    }
  }

  /**
   * Clear selection
   */
  clearSelection() {
    if (this.selectedVertices.length === 0) return;
    
    this.selectedVertices = [];
    
    // Notify selection change
    this.emitSelectionChanged();
  }

  /**
   * Check if vertex is selected
   * @param {THREE.Object3D} object - Object containing the vertex
   * @param {Number} index - Vertex index
   * @returns {Boolean} Whether the vertex is selected
   */
  isVertexSelected(object, index) {
    return this.findVertexIndex(object, index) !== -1;
  }

  /**
   * Find index of vertex in selection
   * @param {THREE.Object3D} object - Object containing the vertex
   * @param {Number} index - Vertex index
   * @returns {Number} Index in selection or -1 if not found
   */
  findVertexIndex(object, index) {
    return this.selectedVertices.findIndex(v => 
      v.object === object && v.index === index
    );
  }

  /**
   * Get selected vertices
   * @returns {Array} Array of selected vertex info objects
   */
  getSelectedVertices() {
    return [...this.selectedVertices];
  }

  /**
   * Get positions of selected vertices
   * @returns {Array<THREE.Vector3>} Array of vertex positions
   */
  getSelectedVertexPositions() {
    return this.selectedVertices.map(vertexInfo => {
      const { object, index } = vertexInfo;
      return this.operations.getVertexPosition(object.geometry, index);
    });
  }

  /**
   * Check if there is a selection
   * @returns {Boolean} Whether there are selected vertices
   */
  hasSelection() {
    return this.selectedVertices.length > 0;
  }

  /**
   * Emit selection changed event
   */
  emitSelectionChanged() {
    if (this.editor.events) {
      this.editor.events.emit('vertexSelectionChanged', {
        vertices: this.getSelectedVertices()
      });
    }
  }
}
