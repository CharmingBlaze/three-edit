// Browser entry point - exposes THREE globally and exports ThreeEdit
import * as THREE from 'three';

// Expose THREE globally for browser usage
(window as any).THREE = THREE;

// Import all ThreeEdit functionality
import * as ThreeEditExports from './index';

// Create and expose ThreeEdit global object
const ThreeEdit = ThreeEditExports;
(window as any).ThreeEdit = ThreeEdit;

// Export all ThreeEdit functionality
export * from './index'; 