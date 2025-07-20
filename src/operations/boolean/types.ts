import { EditableMesh } from '../../core/EditableMesh.ts';

/**
 * CSG operation options
 */
export interface CSGOptions {
  tolerance?: number;
  preserveMaterials?: boolean;
  mergeVertices?: boolean;
  validateResult?: boolean;
}

/**
 * Boolean modifier options
 */
export interface BooleanModifierOptions extends CSGOptions {
  operation: 'union' | 'intersection' | 'difference' | 'xor';
  modifierMesh: EditableMesh;
  transformModifier?: boolean;
  preserveOriginal?: boolean;
}

/**
 * Advanced intersection options
 */
export interface AdvancedIntersectionOptions extends CSGOptions {
  partialIntersection?: boolean;
  createBoundary?: boolean;
  splitFaces?: boolean;
}

/**
 * Boolean history entry
 */
export interface BooleanHistoryEntry {
  operation: string;
  timestamp: number;
  originalMesh: EditableMesh;
  resultMesh: EditableMesh;
  options: BooleanModifierOptions | AdvancedIntersectionOptions | CSGOptions;
}

/**
 * Boolean history
 */
export interface BooleanHistory {
  entries: BooleanHistoryEntry[];
  maxEntries?: number;
} 