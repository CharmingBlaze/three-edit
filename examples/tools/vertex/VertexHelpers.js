/**
 * VertexHelpers - Visual helpers for vertex operations
 * Provides visualization for vertices in the 3D scene
 */

import * as THREE from 'three';
import VertexOperations from './VertexOperations.js';

export default class VertexHelpers {
  /**
   * Create a new VertexHelpers
   * @param {Editor} editor - Reference to the editor
   */
  constructor(editor) {
    this.editor = editor;
    this.scene = editor.scene.getScene();
    this.operations = new VertexOperations();
    
    // Helper settings
    this.vertexSize = 0.05;
    this.selectedColor = 0xff00ff;
    this.hoverColor = 0xffff00;
    
    // Helper containers
    this.helpers = new THREE.Group();
    this.helpers.name = 'Vertex Helpers';
    this.scene.add(this.helpers);
    
    this.hoverHelper = null;
  }

  /**
   * Create a vertex helper
   * @param {Object} vertexInfo - Vertex info object
   * @param {Number} color - Helper color
   * @returns {THREE.Mesh} Helper mesh
   */
  createHelper(vertexInfo, color = 0x00ffff) {
    const { object, index } = vertexInfo;
    
    // Get vertex position
    const position = this.operations.getVertexPosition(object.geometry, index);
    if (!position) return null;
    
    // Create helper geometry
    const geometry = new THREE.SphereGeometry(this.vertexSize, 8, 8);
    
    // Create helper material
    const material = new THREE.MeshBasicMaterial({
      color,
      depthTest: false,
      transparent: true,
      opacity: 0.8
    });
    
    // Create helper mesh
    const helper = new THREE.Mesh(geometry, material);
    
    // Position in world space
    helper.position.copy(position);
    object.localToWorld(helper.position);
    
    // Store reference to vertex info
    helper.userData.vertexInfo = vertexInfo;
    
    return helper;
  }

  /**
   * Show helpers for selected vertices
   * @param {Array} vertices - Array of vertex info objects
   */
  showHelpers(vertices) {
    // Clear existing helpers
    this.clearHelpers();
    
    // Create helpers for each vertex
    vertices.forEach(vertexInfo => {
      const helper = this.createHelper(vertexInfo, this.selectedColor);
      if (helper) {
        this.helpers.add(helper);
      }
    });
  }

  /**
   * Update helper positions
   * @param {Array} vertices - Array of vertex info objects
   */
  updateHelpers(vertices) {
    // Clear and recreate helpers
    this.showHelpers(vertices);
  }

  /**
   * Update a specific helper position
   * @param {Object} vertexInfo - Vertex info object
   */
  updateHelperPosition(vertexInfo) {
    // Find helper for this vertex
    const helper = this.findHelper(vertexInfo);
    if (!helper) return;
    
    // Get updated position
    const position = this.operations.getVertexPosition(vertexInfo.object.geometry, vertexInfo.index);
    if (!position) return;
    
    // Update position in world space
    helper.position.copy(position);
    vertexInfo.object.localToWorld(helper.position);
  }

  /**
   * Find helper for a vertex
   * @param {Object} vertexInfo - Vertex info object
   * @returns {THREE.Mesh|null} Helper mesh or null
   */
  findHelper(vertexInfo) {
    return this.helpers.children.find(helper => {
      const helperInfo = helper.userData.vertexInfo;
      return helperInfo && 
             helperInfo.object === vertexInfo.object && 
             helperInfo.index === vertexInfo.index;
    });
  }

  /**
   * Clear all helpers
   */
  clearHelpers() {
    while (this.helpers.children.length > 0) {
      const helper = this.helpers.children[0];
      this.helpers.remove(helper);
      
      if (helper.geometry) helper.geometry.dispose();
      if (helper.material) helper.material.dispose();
    }
  }

  /**
   * Show hover helper for a vertex
   * @param {THREE.Object3D} object - Object containing the vertex
   * @param {Number} index - Vertex index
   */
  showHoverHelper(object, index) {
    // Clear previous hover helper
    this.hideHoverHelper();
    
    // Create hover helper
    this.hoverHelper = this.createHelper({ object, index }, this.hoverColor);
    
    if (this.hoverHelper) {
      this.scene.add(this.hoverHelper);
    }
  }

  /**
   * Hide hover helper
   */
  hideHoverHelper() {
    if (this.hoverHelper) {
      this.scene.remove(this.hoverHelper);
      
      if (this.hoverHelper.geometry) this.hoverHelper.geometry.dispose();
      if (this.hoverHelper.material) this.hoverHelper.material.dispose();
      
      this.hoverHelper = null;
    }
  }

  /**
   * Hide all helpers
   */
  hideHelpers() {
    this.clearHelpers();
    this.hideHoverHelper();
  }

  /**
   * Dispose helpers
   */
  dispose() {
    this.hideHelpers();
    this.scene.remove(this.helpers);
    this.helpers = null;
  }
}
