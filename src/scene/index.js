/**
 * @fileoverview Scene System Index
 * Centralized exports for all scene management functionality
 */

// Core scene classes
export { Scene } from './core/Scene.js';
export { SceneManager } from './core/SceneManager.js';

// Scene operations and utilities
export * from './SceneOperations.js';
export * from './SceneSerializer.js';
export * from './SceneUtils.js';
export * from './SceneValidator.js';

// Modern scene system
export * from './modernSceneManager.js';
export * from './modernIndex.js';

/**
 * Create a scene manager with default settings
 * @param {Object} options - Configuration options
 * @returns {SceneManager} Scene manager instance
 */
export function createSceneManager(options = {}) {
  return new SceneManager(options);
}

/**
 * Create a new scene with default settings
 * @param {Object} options - Scene options
 * @returns {Scene} Created scene
 */
export function createScene(options = {}) {
  return new Scene(options);
}

/**
 * Scene types
 */
export const SceneTypes = {
  DEFAULT: 'default',
  ENVIRONMENT: 'environment',
  CHARACTER: 'character',
  ARCHITECTURE: 'architecture',
  PRODUCT: 'product',
  ANIMATION: 'animation'
};

/**
 * Get scene type information
 * @param {string} type - Scene type
 * @returns {Object} Scene type information
 */
export function getSceneTypeInfo(type) {
  const typeInfo = {
    [SceneTypes.DEFAULT]: {
      name: 'Default',
      description: 'General purpose scene',
      defaultSettings: {
        camera: { position: { x: 5, y: 5, z: 5 } },
        lighting: { ambient: { intensity: 0.4 } }
      }
    },
    [SceneTypes.ENVIRONMENT]: {
      name: 'Environment',
      description: 'Outdoor environment scene',
      defaultSettings: {
        camera: { position: { x: 10, y: 10, z: 10 } },
        lighting: { ambient: { intensity: 0.6 } },
        environment: { fog: { enabled: true } }
      }
    },
    [SceneTypes.CHARACTER]: {
      name: 'Character',
      description: 'Character-focused scene',
      defaultSettings: {
        camera: { position: { x: 3, y: 2, z: 3 } },
        lighting: { directional: { intensity: 1.0 } }
      }
    },
    [SceneTypes.ARCHITECTURE]: {
      name: 'Architecture',
      description: 'Architectural visualization',
      defaultSettings: {
        camera: { position: { x: 8, y: 6, z: 8 } },
        lighting: { ambient: { intensity: 0.5 } }
      }
    },
    [SceneTypes.PRODUCT]: {
      name: 'Product',
      description: 'Product visualization',
      defaultSettings: {
        camera: { position: { x: 4, y: 3, z: 4 } },
        lighting: { directional: { intensity: 0.8 } }
      }
    },
    [SceneTypes.ANIMATION]: {
      name: 'Animation',
      description: 'Animation scene',
      defaultSettings: {
        camera: { position: { x: 6, y: 4, z: 6 } },
        lighting: { ambient: { intensity: 0.4 } }
      }
    }
  };

  return typeInfo[type] || typeInfo[SceneTypes.DEFAULT];
} 