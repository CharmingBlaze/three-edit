/**
 * VertexTool - Handles vertex operations
 * Provides a user-friendly interface for vertex manipulation
 */

import * as THREE from 'three';
import VertexOperations from './VertexOperations.js';
import VertexHelpers from './VertexHelpers.js';
import VertexSelection from './VertexSelection.js';

export default class VertexTool {
  /**
   * Create a new VertexTool
   * @param {Editor} editor - Reference to the editor
   */
  constructor(editor) {
    this.editor = editor;
    this.operations = new VertexOperations();
    this.helpers = new VertexHelpers(editor);
    this.selection = new VertexSelection(editor);
    
    // Tool state
    this.active = false;
    this.name = 'Vertex Tool';
    this.type = 'vertex';
    this.icon = 'point';
    this.cursor = 'crosshair';
  }

  /**
   * Activate the tool
   */
  activate() {
    this.active = true;
    this.setupEventListeners();
    document.body.style.cursor = this.cursor;
    return this;
  }

  /**
   * Deactivate the tool
   */
  deactivate() {
    this.active = false;
    this.removeEventListeners();
    document.body.style.cursor = 'default';
    this.helpers.hideHelpers();
    return this;
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    const renderer = this.editor.viewport.getRenderer().domElement;
    
    this.mouseDownHandler = this.onMouseDown.bind(this);
    this.mouseMoveHandler = this.onMouseMove.bind(this);
    this.mouseUpHandler = this.onMouseUp.bind(this);
    this.keyDownHandler = this.onKeyDown.bind(this);
    
    renderer.addEventListener('mousedown', this.mouseDownHandler);
    renderer.addEventListener('mousemove', this.mouseMoveHandler);
    renderer.addEventListener('mouseup', this.mouseUpHandler);
    document.addEventListener('keydown', this.keyDownHandler);
  }

  /**
   * Remove event listeners
   */
  removeEventListeners() {
    const renderer = this.editor.viewport.getRenderer().domElement;
    
    renderer.removeEventListener('mousedown', this.mouseDownHandler);
    renderer.removeEventListener('mousemove', this.mouseMoveHandler);
    renderer.removeEventListener('mouseup', this.mouseUpHandler);
    document.removeEventListener('keydown', this.keyDownHandler);
  }

  /**
   * Handle mouse down event
   * @param {MouseEvent} event - Mouse event
   */
  onMouseDown(event) {
    if (!this.active) return;
    
    // Left mouse button
    if (event.button === 0) {
      const raycaster = this.createRaycaster(event);
      const intersects = this.raycast(raycaster);
      
      if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const faceIndex = intersects[0].faceIndex;
        
        if (mesh && mesh.geometry) {
          // Get vertices of the face
          const vertexIndices = this.getFaceVertexIndices(mesh.geometry, faceIndex);
          
          // Select the closest vertex to the intersection point
          if (vertexIndices.length > 0) {
            const closestVertex = this.findClosestVertex(
              mesh.geometry, 
              vertexIndices, 
              intersects[0].point,
              mesh.matrixWorld
            );
            
            if (closestVertex !== -1) {
              if (event.shiftKey) {
                // Add to selection
                this.selection.toggleVertex(mesh, closestVertex);
              } else {
                // New selection
                this.selection.selectVertex(mesh, closestVertex);
              }
              
              // Show helpers for selected vertices
              this.helpers.showHelpers(this.selection.getSelectedVertices());
              
              // Start drag operation if needed
              if (this.selection.hasSelection()) {
                this.startDrag(event, raycaster);
              }
            }
          }
        }
      } else if (!event.shiftKey) {
        // Clear selection when clicking empty space
        this.selection.clearSelection();
        this.helpers.hideHelpers();
      }
    }
  }

  /**
   * Handle mouse move event
   * @param {MouseEvent} event - Mouse event
   */
  onMouseMove(event) {
    if (!this.active) return;
    
    if (this.isDragging) {
      this.updateDrag(event);
    } else {
      // Hover effect
      const raycaster = this.createRaycaster(event);
      const intersects = this.raycast(raycaster);
      
      if (intersects.length > 0) {
        const mesh = intersects[0].object;
        const faceIndex = intersects[0].faceIndex;
        
        if (mesh && mesh.geometry) {
          // Get vertices of the face
          const vertexIndices = this.getFaceVertexIndices(mesh.geometry, faceIndex);
          
          // Highlight the closest vertex
          if (vertexIndices.length > 0) {
            const closestVertex = this.findClosestVertex(
              mesh.geometry, 
              vertexIndices, 
              intersects[0].point,
              mesh.matrixWorld
            );
            
            if (closestVertex !== -1) {
              this.helpers.showHoverHelper(mesh, closestVertex);
            }
          }
        }
      } else {
        this.helpers.hideHoverHelper();
      }
    }
  }

  /**
   * Handle mouse up event
   * @param {MouseEvent} event - Mouse event
   */
  onMouseUp(event) {
    if (!this.active) return;
    
    if (this.isDragging) {
      this.finishDrag();
    }
  }

  /**
   * Handle key down event
   * @param {KeyboardEvent} event - Keyboard event
   */
  onKeyDown(event) {
    if (!this.active) return;
    
    // Delete selected vertices
    if (event.key === 'Delete' && this.selection.hasSelection()) {
      // TODO: Implement vertex deletion
      console.log('Delete vertices not implemented yet');
    }
    
    // Weld vertices with W key
    if (event.key === 'w' && this.selection.hasSelection() && this.selection.getSelectedVertices().length > 1) {
      this.weldSelectedVertices();
    }
    
    // Split vertex with S key
    if (event.key === 's' && this.selection.hasSelection() && this.selection.getSelectedVertices().length === 1) {
      this.splitSelectedVertex();
    }
  }

  /**
   * Create a raycaster from mouse event
   * @param {MouseEvent} event - Mouse event
   * @returns {THREE.Raycaster} Raycaster
   */
  createRaycaster(event) {
    const renderer = this.editor.viewport.getRenderer();
    const camera = this.editor.viewport.getCamera();
    const rect = renderer.domElement.getBoundingClientRect();
    
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x, y }, camera);
    
    return raycaster;
  }

  /**
   * Perform a raycast
   * @param {THREE.Raycaster} raycaster - Raycaster
   * @returns {Array} Array of intersections
   */
  raycast(raycaster) {
    const scene = this.editor.scene.getScene();
    return raycaster.intersectObjects(scene.children, true);
  }

  /**
   * Get vertex indices for a face
   * @param {THREE.BufferGeometry} geometry - Geometry
   * @param {Number} faceIndex - Face index
   * @returns {Array<Number>} Array of vertex indices
   */
  getFaceVertexIndices(geometry, faceIndex) {
    if (!geometry || !geometry.index) return [];
    
    const indexAttribute = geometry.index;
    const i = faceIndex * 3;
    
    return [
      indexAttribute.getX(i),
      indexAttribute.getX(i + 1),
      indexAttribute.getX(i + 2)
    ];
  }

  /**
   * Find the closest vertex to a point
   * @param {THREE.BufferGeometry} geometry - Geometry
   * @param {Array<Number>} vertexIndices - Array of vertex indices
   * @param {THREE.Vector3} point - Point in world space
   * @param {THREE.Matrix4} matrixWorld - World matrix
   * @returns {Number} Closest vertex index or -1
   */
  findClosestVertex(geometry, vertexIndices, point, matrixWorld) {
    if (!geometry || !geometry.attributes || !geometry.attributes.position) return -1;
    
    const positionAttribute = geometry.attributes.position;
    let closestVertex = -1;
    let closestDistance = Infinity;
    
    // Convert point to local space
    const localPoint = point.clone();
    const inverseMatrix = new THREE.Matrix4().copy(matrixWorld).invert();
    localPoint.applyMatrix4(inverseMatrix);
    
    // Find closest vertex
    for (const index of vertexIndices) {
      if (index >= positionAttribute.count) continue;
      
      const x = positionAttribute.getX(index);
      const y = positionAttribute.getY(index);
      const z = positionAttribute.getZ(index);
      const vertexPosition = new THREE.Vector3(x, y, z);
      
      const distance = vertexPosition.distanceTo(localPoint);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestVertex = index;
      }
    }
    
    return closestVertex;
  }

  /**
   * Start drag operation
   * @param {MouseEvent} event - Mouse event
   * @param {THREE.Raycaster} raycaster - Raycaster
   */
  startDrag(event, raycaster) {
    this.isDragging = true;
    this.dragPlane = this.createDragPlane(raycaster);
    this.dragStartPositions = this.selection.getSelectedVertexPositions();
  }

  /**
   * Create a plane for dragging
   * @param {THREE.Raycaster} raycaster - Raycaster
   * @returns {THREE.Plane} Drag plane
   */
  createDragPlane(raycaster) {
    const camera = this.editor.viewport.getCamera();
    const normal = camera.getWorldDirection(new THREE.Vector3());
    const plane = new THREE.Plane(normal, 0);
    
    // Position the plane at the first selected vertex
    const selectedVertices = this.selection.getSelectedVertices();
    if (selectedVertices.length > 0) {
      const firstVertex = selectedVertices[0];
      const position = this.operations.getVertexPosition(
        firstVertex.object.geometry,
        firstVertex.index
      );
      
      if (position) {
        // Convert to world space
        const worldPosition = position.clone().applyMatrix4(firstVertex.object.matrixWorld);
        plane.constant = worldPosition.dot(normal);
      }
    }
    
    return plane;
  }

  /**
   * Update drag operation
   * @param {MouseEvent} event - Mouse event
   */
  updateDrag(event) {
    if (!this.isDragging || !this.dragPlane) return;
    
    const raycaster = this.createRaycaster(event);
    const ray = raycaster.ray;
    
    // Find intersection with drag plane
    const intersection = new THREE.Vector3();
    if (ray.intersectPlane(this.dragPlane, intersection)) {
      // Move selected vertices
      const selectedVertices = this.selection.getSelectedVertices();
      
      selectedVertices.forEach((vertexInfo, i) => {
        const { object, index } = vertexInfo;
        
        // Get original position
        const originalPosition = this.dragStartPositions[i];
        if (!originalPosition) return;
        
        // Calculate new position
        // This is simplified - in a real implementation, you'd need to handle
        // the drag offset and convert between world and local space properly
        const newPosition = intersection.clone();
        object.worldToLocal(newPosition);
        
        // Update vertex position
        this.operations.setVertexPosition(object.geometry, index, newPosition);
        
        // Update helper position
        this.helpers.updateHelperPosition(vertexInfo);
      });
      
      // Update geometries
      this.updateGeometries();
    }
  }

  /**
   * Finish drag operation
   */
  finishDrag() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.dragPlane = null;
    
    // Add to history
    const selectedVertices = this.selection.getSelectedVertices();
    const finalPositions = this.selection.getSelectedVertexPositions();
    
    this.addToHistory({
      type: 'moveVertices',
      vertices: selectedVertices,
      initialPositions: this.dragStartPositions,
      finalPositions
    });
    
    this.dragStartPositions = null;
  }

  /**
   * Update geometries after modification
   */
  updateGeometries() {
    // Get unique objects from selection
    const objects = new Set();
    this.selection.getSelectedVertices().forEach(v => objects.add(v.object));
    
    // Update each object's geometry
    objects.forEach(object => {
      if (object && object.geometry) {
        object.geometry.attributes.position.needsUpdate = true;
        object.geometry.computeVertexNormals();
      }
    });
  }

  /**
   * Weld selected vertices
   */
  weldSelectedVertices() {
    const selectedVertices = this.selection.getSelectedVertices();
    if (selectedVertices.length < 2) return;
    
    // Group vertices by object
    const verticesByObject = new Map();
    selectedVertices.forEach(v => {
      if (!verticesByObject.has(v.object)) {
        verticesByObject.set(v.object, []);
      }
      verticesByObject.get(v.object).push(v.index);
    });
    
    // Process each object
    verticesByObject.forEach((indices, object) => {
      if (indices.length < 2) return;
      
      // Calculate average position
      const avgPosition = new THREE.Vector3();
      indices.forEach(index => {
        const position = this.operations.getVertexPosition(object.geometry, index);
        if (position) avgPosition.add(position);
      });
      avgPosition.divideScalar(indices.length);
      
      // Store original positions for history
      const originalPositions = indices.map(index => 
        this.operations.getVertexPosition(object.geometry, index)
      );
      
      // Apply welding
      indices.forEach(index => {
        this.operations.setVertexPosition(object.geometry, index, avgPosition);
      });
      
      // Update geometry
      object.geometry.attributes.position.needsUpdate = true;
      object.geometry.computeVertexNormals();
      
      // Add to history
      this.addToHistory({
        type: 'weldVertices',
        object,
        indices,
        originalPositions,
        weldedPosition: avgPosition
      });
    });
    
    // Update helpers
    this.helpers.updateHelpers(this.selection.getSelectedVertices());
  }

  /**
   * Split selected vertex
   */
  splitSelectedVertex() {
    const selectedVertices = this.selection.getSelectedVertices();
    if (selectedVertices.length !== 1) return;
    
    const vertexInfo = selectedVertices[0];
    const { object, index } = vertexInfo;
    
    // TODO: Implement vertex splitting
    console.log('Split vertex not implemented yet');
  }

  /**
   * Add operation to history
   * @param {Object} operation - Operation data
   */
  addToHistory(operation) {
    if (this.editor.history) {
      // Add to editor history
      this.editor.history.add({
        type: operation.type,
        undo: () => this.undoOperation(operation),
        redo: () => this.redoOperation(operation)
      });
    }
  }

  /**
   * Undo an operation
   * @param {Object} operation - Operation data
   */
  undoOperation(operation) {
    switch (operation.type) {
      case 'moveVertices':
        this.undoMoveVertices(operation);
        break;
      case 'weldVertices':
        this.undoWeldVertices(operation);
        break;
      // Add more operation types as needed
    }
  }

  /**
   * Redo an operation
   * @param {Object} operation - Operation data
   */
  redoOperation(operation) {
    switch (operation.type) {
      case 'moveVertices':
        this.redoMoveVertices(operation);
        break;
      case 'weldVertices':
        this.redoWeldVertices(operation);
        break;
      // Add more operation types as needed
    }
  }

  /**
   * Undo move vertices operation
   * @param {Object} operation - Operation data
   */
  undoMoveVertices(operation) {
    const { vertices, initialPositions } = operation;
    
    vertices.forEach((vertexInfo, i) => {
      const { object, index } = vertexInfo;
      const position = initialPositions[i];
      
      if (position) {
        this.operations.setVertexPosition(object.geometry, index, position);
      }
    });
    
    this.updateGeometries();
  }

  /**
   * Redo move vertices operation
   * @param {Object} operation - Operation data
   */
  redoMoveVertices(operation) {
    const { vertices, finalPositions } = operation;
    
    vertices.forEach((vertexInfo, i) => {
      const { object, index } = vertexInfo;
      const position = finalPositions[i];
      
      if (position) {
        this.operations.setVertexPosition(object.geometry, index, position);
      }
    });
    
    this.updateGeometries();
  }

  /**
   * Undo weld vertices operation
   * @param {Object} operation - Operation data
   */
  undoWeldVertices(operation) {
    const { object, indices, originalPositions } = operation;
    
    indices.forEach((index, i) => {
      const position = originalPositions[i];
      if (position) {
        this.operations.setVertexPosition(object.geometry, index, position);
      }
    });
    
    object.geometry.attributes.position.needsUpdate = true;
    object.geometry.computeVertexNormals();
  }

  /**
   * Redo weld vertices operation
   * @param {Object} operation - Operation data
   */
  redoWeldVertices(operation) {
    const { object, indices, weldedPosition } = operation;
    
    indices.forEach(index => {
      this.operations.setVertexPosition(object.geometry, index, weldedPosition);
    });
    
    object.geometry.attributes.position.needsUpdate = true;
    object.geometry.computeVertexNormals();
  }
}
