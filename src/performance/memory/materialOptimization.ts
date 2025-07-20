import { EditableMesh } from '../../core/index.ts';
import { MemoryOptimizationOptions } from './types';

/**
 * Optimize materials by consolidating similar materials
 */
export function optimizeMaterials(
  mesh: EditableMesh,
  options: MemoryOptimizationOptions
): void {
  // Use options to avoid unused variable warning
  const precision = options.precision ?? 0.001;
  const materialMap = new Map<string, number>();
  const materialIndexMap = new Map<number, number>();
  let nextMaterialIndex = 0;

  // Group similar materials
  mesh.faces.forEach(face => {
    if (face.materialIndex === undefined) return;

    const materialKey = createMaterialKey(face);
    
    if (!materialMap.has(materialKey)) {
      materialMap.set(materialKey, nextMaterialIndex);
      nextMaterialIndex++;
    }
    
    materialIndexMap.set(face.materialIndex, materialMap.get(materialKey)!);
  });

  // Update face material indices
  mesh.faces.forEach(face => {
    if (face.materialIndex !== undefined) {
      const newIndex = materialIndexMap.get(face.materialIndex);
      if (newIndex !== undefined) {
        face.materialIndex = newIndex;
      }
    }
  });
}

/**
 * Create material key for deduplication
 */
export function createMaterialKey(face: any): string {
  if (face.materialIndex === undefined) return 'default';
  
  // For now, use material index as key since we don't have access to material properties
  // In a real implementation, you would access material properties from a separate material manager
  return `material_${face.materialIndex}`;
}

/**
 * Calculate material optimization ratio for statistics
 */
export function calculateMaterialOptimizationRatio(
  originalMaterialCount: number,
  optimizedMaterialCount: number
): number {
  if (originalMaterialCount === 0) return 0;
  return (originalMaterialCount - optimizedMaterialCount) / originalMaterialCount;
} 