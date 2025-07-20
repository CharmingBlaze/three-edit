import { EditableMesh } from '../core/EditableMesh';
import { Skin } from '../core/Skin';
import { Vector3 } from '../utils/math';
import { calculateVertexDistance } from '../utils/mathUtils';

/**
 * Weight painting options
 */
export interface WeightPaintingOptions {
  radius?: number;
  falloff?: number;
  strength?: number;
  mode?: 'add' | 'subtract' | 'replace' | 'smooth';
  boneIndex?: number;
  maxInfluences?: number;
}

/**
 * Weight painting brush
 */
export class WeightPaintingBrush {
  public radius: number;
  public falloff: number;
  public strength: number;
  public mode: 'add' | 'subtract' | 'replace' | 'smooth';
  public boneIndex: number;

  constructor(options: WeightPaintingOptions = {}) {
    this.radius = options.radius || 1.0;
    this.falloff = options.falloff || 0.5;
    this.strength = options.strength || 1.0;
    this.mode = options.mode || 'add';
    this.boneIndex = options.boneIndex || 0;
  }

  /**
   * Paint weights at a specific position
   */
  paintWeights(
    mesh: EditableMesh,
    skin: Skin,
    position: Vector3,
    options: WeightPaintingOptions = {}
  ): void {
    const radius = options.radius || this.radius;
    const falloff = options.falloff || this.falloff;
    const strength = options.strength || this.strength;
    const mode = options.mode || this.mode;
    const boneIndex = options.boneIndex || this.boneIndex;
    const maxInfluences = options.maxInfluences || 4;

    // Find vertices within the brush radius
    const affectedVertices = this.findVerticesInRadius(mesh, position, radius);

    for (const vertexIndex of affectedVertices) {
      const vertex = mesh.getVertex(vertexIndex);
      if (!vertex) continue;

      // Calculate distance from brush center
      const distance = calculateVertexDistance(vertex, {
        x: position.x,
        y: position.y,
        z: position.z
      } as any);

      // Calculate falloff factor
      const falloffFactor = this.calculateFalloff(distance, radius, falloff);
      const paintStrength = strength * falloffFactor;

      // Apply weight painting
      this.applyWeightPainting(skin, vertexIndex, boneIndex, paintStrength, mode, maxInfluences);
    }
  }

  /**
   * Find vertices within the brush radius
   */
  private findVerticesInRadius(mesh: EditableMesh, position: Vector3, radius: number): number[] {
    const affectedVertices: number[] = [];

    for (let i = 0; i < mesh.vertices.length; i++) {
      const vertex = mesh.getVertex(i);
      if (!vertex) continue;

      const distance = calculateVertexDistance(vertex, {
        x: position.x,
        y: position.y,
        z: position.z
      } as any);

      if (distance <= radius) {
        affectedVertices.push(i);
      }
    }

    return affectedVertices;
  }

  /**
   * Calculate falloff factor based on distance
   */
  private calculateFalloff(distance: number, radius: number, falloff: number): number {
    if (distance >= radius) return 0;
    
    const normalizedDistance = distance / radius;
    const falloffStart = 1.0 - falloff;
    
    if (normalizedDistance <= falloffStart) {
      return 1.0;
    } else {
      const t = (normalizedDistance - falloffStart) / falloff;
      return 1.0 - t * t * (3.0 - 2.0 * t); // Smoothstep
    }
  }

  /**
   * Apply weight painting to a vertex
   */
  private applyWeightPainting(
    skin: Skin,
    vertexIndex: number,
    boneIndex: number,
    strength: number,
    mode: string,
    maxInfluences: number
  ): void {
    const currentWeights = skin.getVertexWeights(vertexIndex);
    const newWeights = [...currentWeights];

    // Find existing weight for this bone
    const existingWeightIndex = newWeights.findIndex(w => w.boneIndex === boneIndex);
    let currentWeight = existingWeightIndex >= 0 ? newWeights[existingWeightIndex].weight : 0;

    // Apply painting mode
    switch (mode) {
      case 'add':
        currentWeight = Math.min(1.0, currentWeight + strength);
        break;
      case 'subtract':
        currentWeight = Math.max(0.0, currentWeight - strength);
        break;
      case 'replace':
        currentWeight = strength;
        break;
      case 'smooth':
        // Smooth weights by averaging with neighbors
        currentWeight = this.smoothWeight(skin, vertexIndex, boneIndex, strength);
        break;
    }

    // Update or add weight
    if (existingWeightIndex >= 0) {
      newWeights[existingWeightIndex].weight = currentWeight;
    } else {
      newWeights.push({ boneIndex, weight: currentWeight });
    }

    // Normalize and limit influences
    this.normalizeWeights(newWeights, maxInfluences);

    // Apply the new weights
    skin.setVertexWeights(vertexIndex, newWeights);
  }

  /**
   * Smooth weights by averaging with neighboring vertices
   */
  private smoothWeight(skin: Skin, vertexIndex: number, boneIndex: number, strength: number): number {
    // This is a simplified smoothing - in a real implementation,
    // you would find connected vertices and average their weights
    const currentWeights = skin.getVertexWeights(vertexIndex);
    const currentWeight = currentWeights.find(w => w.boneIndex === boneIndex)?.weight || 0;
    
    // Simple smoothing by reducing the weight
    return currentWeight * (1.0 - strength);
  }

  /**
   * Normalize weights to sum to 1.0 and limit the number of influences
   */
  private normalizeWeights(weights: { boneIndex: number; weight: number }[], maxInfluences: number): void {
    // Remove zero weights
    const nonZeroWeights = weights.filter(w => w.weight > 0);
    
    // Sort by weight (highest first)
    nonZeroWeights.sort((a, b) => b.weight - a.weight);
    
    // Limit to max influences
    const limitedWeights = nonZeroWeights.slice(0, maxInfluences);
    
    // Normalize to sum to 1.0
    const totalWeight = limitedWeights.reduce((sum, w) => sum + w.weight, 0);
    if (totalWeight > 0) {
      limitedWeights.forEach(w => w.weight /= totalWeight);
    }
    
    // Update the original array
    weights.length = 0;
    weights.push(...limitedWeights);
  }
}

/**
 * Weight painting operations
 */
export class WeightPaintingOperations {
  /**
   * Paint weights on a mesh
   */
  static paintWeights(
    mesh: EditableMesh,
    skin: Skin,
    position: Vector3,
    options: WeightPaintingOptions = {}
  ): void {
    const brush = new WeightPaintingBrush(options);
    brush.paintWeights(mesh, skin, position, options);
  }

  /**
   * Auto-weight vertices based on bone proximity
   */
  static autoWeight(
    mesh: EditableMesh,
    skin: Skin,
    options: {
      maxDistance?: number;
      maxInfluences?: number;
    } = {}
  ): void {
    const maxDistance = options.maxDistance || 2.0;
    const maxInfluences = options.maxInfluences || 4;

    for (let vertexIndex = 0; vertexIndex < mesh.vertices.length; vertexIndex++) {
      const vertex = mesh.getVertex(vertexIndex);
      if (!vertex) continue;

      const weights: { boneIndex: number; weight: number }[] = [];

      // Calculate weights based on distance to bones
      for (let boneIndex = 0; boneIndex < skin.skeleton.bones.length; boneIndex++) {
        const bone = skin.skeleton.bones[boneIndex];
        const bonePosition = bone.getWorldPosition();
        
        const distance = calculateVertexDistance(vertex, {
          x: bonePosition.x,
          y: bonePosition.y,
          z: bonePosition.z
        } as any);

        if (distance <= maxDistance) {
          const weight = Math.max(0, 1.0 - distance / maxDistance);
          weights.push({ boneIndex, weight });
        }
      }

      // Sort by weight and limit influences
      weights.sort((a, b) => b.weight - a.weight);
      weights.splice(maxInfluences);

      // Normalize weights
      const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
      if (totalWeight > 0) {
        weights.forEach(w => w.weight /= totalWeight);
      }

      // Apply weights
      skin.setVertexWeights(vertexIndex, weights);
    }
  }

  /**
   * Mirror weights from one side to another
   */
  static mirrorWeights(
    mesh: EditableMesh,
    skin: Skin,
    mirrorAxis: 'x' | 'y' | 'z',
    mirrorPlane = 0
  ): void {
    for (let vertexIndex = 0; vertexIndex < mesh.vertices.length; vertexIndex++) {
      const vertex = mesh.getVertex(vertexIndex);
      if (!vertex) continue;

      // Check if vertex is on the side we want to mirror from
      let shouldMirror = false;
      switch (mirrorAxis) {
        case 'x':
          shouldMirror = vertex.x > mirrorPlane;
          break;
        case 'y':
          shouldMirror = vertex.y > mirrorPlane;
          break;
        case 'z':
          shouldMirror = vertex.z > mirrorPlane;
          break;
      }

      if (shouldMirror) {
        // Find the mirrored vertex
        const mirroredVertexIndex = this.findMirroredVertex(mesh, vertex, mirrorAxis, mirrorPlane);
        if (mirroredVertexIndex !== -1) {
          // Copy weights from original to mirrored vertex
          const originalWeights = skin.getVertexWeights(vertexIndex);
          const mirroredWeights = originalWeights.map(w => ({
            boneIndex: this.mirrorBoneIndex(w.boneIndex),
            weight: w.weight
          }));
          skin.setVertexWeights(mirroredVertexIndex, mirroredWeights);
        }
      }
    }
  }

  /**
   * Find the mirrored vertex
   */
  private static findMirroredVertex(
    mesh: EditableMesh,
    vertex: any,
    mirrorAxis: string,
    mirrorPlane: number
  ): number {
    const tolerance = 0.001;
    
    for (let i = 0; i < mesh.vertices.length; i++) {
      const otherVertex = mesh.getVertex(i);
      if (!otherVertex) continue;

      let isMirrored = false;
      switch (mirrorAxis) {
        case 'x':
          isMirrored = Math.abs(otherVertex.x - (2 * mirrorPlane - vertex.x)) < tolerance &&
                      Math.abs(otherVertex.y - vertex.y) < tolerance &&
                      Math.abs(otherVertex.z - vertex.z) < tolerance;
          break;
        case 'y':
          isMirrored = Math.abs(otherVertex.x - vertex.x) < tolerance &&
                      Math.abs(otherVertex.y - (2 * mirrorPlane - vertex.y)) < tolerance &&
                      Math.abs(otherVertex.z - vertex.z) < tolerance;
          break;
        case 'z':
          isMirrored = Math.abs(otherVertex.x - vertex.x) < tolerance &&
                      Math.abs(otherVertex.y - vertex.y) < tolerance &&
                      Math.abs(otherVertex.z - (2 * mirrorPlane - vertex.z)) < tolerance;
          break;
      }

      if (isMirrored) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Mirror bone index (for left/right bones)
   */
  private static mirrorBoneIndex(boneIndex: number): number {
    // This is a simplified implementation
    // In a real system, you would have a mapping of left/right bone pairs
    const boneName = `Bone${boneIndex}`; // This would be the actual bone name
    
    // Example: mirror left/right bones
    if (boneName.includes('Left')) {
      return boneIndex + 1; // Assuming right bone is next
    } else if (boneName.includes('Right')) {
      return boneIndex - 1; // Assuming left bone is previous
    }
    
    return boneIndex;
  }

  /**
   * Smooth weights across the mesh
   */
  static smoothWeights(
    mesh: EditableMesh,
    skin: Skin,
    iterations = 1,
    strength = 0.5
  ): void {
    for (let iteration = 0; iteration < iterations; iteration++) {
      const smoothedWeights: { boneIndex: number; weight: number }[][] = [];

      for (let vertexIndex = 0; vertexIndex < mesh.vertices.length; vertexIndex++) {
        const currentWeights = skin.getVertexWeights(vertexIndex);
        const smoothedWeight = this.smoothVertexWeights(skin, currentWeights, strength);
        smoothedWeights[vertexIndex] = smoothedWeight;
      }

      // Apply smoothed weights
      for (let vertexIndex = 0; vertexIndex < mesh.vertices.length; vertexIndex++) {
        skin.setVertexWeights(vertexIndex, smoothedWeights[vertexIndex]);
      }
    }
  }

  /**
   * Smooth weights for a single vertex
   */
  private static smoothVertexWeights(
    skin: Skin,
    currentWeights: { boneIndex: number; weight: number }[],
    strength: number
  ): { boneIndex: number; weight: number }[] {
    // This is a simplified smoothing implementation
    // In a real system, you would find connected vertices and average their weights
    
    const boneCount = skin.skeleton.bones.length;
    const smoothedWeights = new Array(boneCount).fill(0);

    // Average with current weights (simplified)
    for (const weight of currentWeights) {
      smoothedWeights[weight.boneIndex] = weight.weight * (1.0 - strength);
    }

    // Convert back to weight array
    const result: { boneIndex: number; weight: number }[] = [];
    for (let i = 0; i < boneCount; i++) {
      if (smoothedWeights[i] > 0) {
        result.push({ boneIndex: i, weight: smoothedWeights[i] });
      }
    }

    return result;
  }
} 