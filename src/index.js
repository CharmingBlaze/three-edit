/**
 * @fileoverview Three.js Advanced Editing Library
 * Main entry point for the Three.js Advanced Editing Library
 * Provides professional-grade mesh editing capabilities for Three.js projects
 */

// Core editing operations
export * from './editing/index.js';

// Scene management
export * from './scene/index.js';

// Selection system
export * from './selection/index.js';

// Transform system
export * from './transforms/index.js';

// Material system
export * from './materials/index.js';

// UV system
export * from './uv/index.js';

// Animation system
export * from './animation/index.js';

// Rendering system
export * from './rendering/index.js';

// History and undo/redo
export * from './history/index.js';
export * from './undoRedo/index.js';

// Utilities
export * from './utils/index.js';

// Events
export * from './events/index.js';

// Primitives
export * from './primitives/index.js';

// Core classes
export { EditableMesh } from './EditableMesh.js';
export { convertToThreeJS } from './threejsConverter.js';

// Default export with all functionality
import * as EditingSystem from './editing/index.js';
import * as SceneSystem from './scene/index.js';
import * as SelectionSystem from './selection/index.js';
import * as TransformSystem from './transforms/index.js';
import * as MaterialSystem from './materials/index.js';
import * as UVSystem from './uv/index.js';
import * as AnimationSystem from './animation/index.js';
import * as RenderingSystem from './rendering/index.js';
import * as HistorySystem from './history/index.js';
import * as UndoRedoSystem from './undoRedo/index.js';
import * as Utils from './utils/index.js';
import * as Events from './events/index.js';
import * as Primitives from './primitives/index.js';
import { EditableMesh } from './EditableMesh.js';
import { convertToThreeJS } from './threejsConverter.js';

export default {
  // Core editing operations
  ...EditingSystem,
  
  // Scene management
  ...SceneSystem,
  
  // Selection system
  ...SelectionSystem,
  
  // Transform system
  ...TransformSystem,
  
  // Material system
  ...MaterialSystem,
  
  // UV system
  ...UVSystem,
  
  // Animation system
  ...AnimationSystem,
  
  // Rendering system
  ...RenderingSystem,
  
  // History and undo/redo
  ...HistorySystem,
  ...UndoRedoSystem,
  
  // Utilities
  ...Utils,
  
  // Events
  ...Events,
  
  // Primitives
  ...Primitives,
  
  // Core classes
  EditableMesh,
  convertToThreeJS
}; 