// Re-export from modular structure
export * from './boolean/types';
export * from './boolean/csgOperations';
export * from './boolean/modifier';
export * from './boolean/history';
export * from './boolean/utils';

// Legacy exports for backward compatibility
import { performCSG } from './boolean/csgOperations';
import { applyBooleanModifier, advancedIntersection } from './boolean/modifier';
import { BooleanHistoryManager } from './boolean/history';

// Create legacy function names for backward compatibility
const csgUnion = (meshA: any, meshB: any, options?: any) => performCSG(meshA, meshB, 'union', options);
const csgIntersection = (meshA: any, meshB: any, options?: any) => performCSG(meshA, meshB, 'intersection', options);
const csgDifference = (meshA: any, meshB: any, options?: any) => performCSG(meshA, meshB, 'difference', options);
const csgXOR = (meshA: any, meshB: any, options?: any) => {
  // XOR = (A ∪ B) - (A ∩ B)
  // This is equivalent to the union minus the intersection
  try {
    const unionResult = performCSG(meshA, meshB, 'union', options);
    const intersectionResult = performCSG(meshA, meshB, 'intersection', options);
    
    // Subtract intersection from union to get XOR
    const xorResult = performCSG(unionResult, intersectionResult, 'difference', options);
    
    return xorResult;
  } catch (error) {
    // Return a copy of meshA if XOR operation fails
    return meshA.clone();
  }
};

export {
  csgUnion,
  csgIntersection,
  csgDifference,
  csgXOR,
  applyBooleanModifier,
  advancedIntersection,
  BooleanHistoryManager
}; 