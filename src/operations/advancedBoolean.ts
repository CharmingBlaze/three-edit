// Re-export from modular structure
export * from './boolean/csgOperations';
export * from './boolean/modifier';
export * from './boolean/history';
export * from './boolean/utils';

// Legacy exports for backward compatibility
import { performCSGOperation } from './boolean/csgOperations';
import { applyBooleanModifier, advancedIntersection } from './boolean/modifier';
import { BooleanHistoryManager } from './boolean/history';

// Create legacy function names for backward compatibility
const csgUnion = (meshA: any, meshB: any, options?: any): any => {
  const result = performCSGOperation(meshA, meshB, 'union', options);
  return result.mesh;
};

const csgIntersection = (meshA: any, meshB: any, options?: any): any => {
  const result = performCSGOperation(meshA, meshB, 'intersection', options);
  return result.mesh;
};

const csgDifference = (meshA: any, meshB: any, options?: any): any => {
  const result = performCSGOperation(meshA, meshB, 'difference', options);
  return result.mesh;
};

const csgXOR = (meshA: any, meshB: any, options?: any): any => {
  // XOR = (A ∪ B) - (A ∩ B)
  // This is equivalent to the union minus the intersection
  try {
    const unionResult = performCSGOperation(meshA, meshB, 'union', options);
    const intersectionResult = performCSGOperation(meshA, meshB, 'intersection', options);
    
    // Subtract intersection from union to get XOR
    const xorResult = performCSGOperation(unionResult.mesh, intersectionResult.mesh, 'difference', options);
    
    return xorResult.mesh;
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