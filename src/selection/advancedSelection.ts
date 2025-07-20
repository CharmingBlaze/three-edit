// Re-export from modular structure
export * from './types';
export * from './raySelection';
export * from './boxSelection';
export * from './lassoSelection';
export * from './connectedSelection';
export * from './similarSelection';

// Legacy exports for backward compatibility
import { selectByRay } from './raySelection';
import { selectByBox, selectByCircle } from './boxSelection';
import { selectByLasso } from './lassoSelection';
import { selectConnected } from './connectedSelection';
import { selectSimilar } from './similarSelection';

export {
  selectByRay,
  selectByBox,
  selectByCircle,
  selectByLasso,
  selectConnected,
  selectSimilar
}; 