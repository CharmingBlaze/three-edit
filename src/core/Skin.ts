import { Bone } from './Bone';
import { Skeleton } from './Skeleton';
import { Matrix4, Vector3 } from '../utils/math';

/**
 * Vertex weight structure
 */
export interface VertexWeight {
  boneIndex: number;
  weight: number;
}

/**
 * Skin structure for managing vertex weights and bone influences
 */
export class Skin {
  public name: string;
  public skeleton: Skeleton;
  public vertexWeights: VertexWeight[][];
  public bindShapeMatrix: Matrix4;
  public bindShapeMatrixInverse: Matrix4;

  constructor(name: string, skeleton: Skeleton) {
    this.name = name;
    this.skeleton = skeleton;
    this.vertexWeights = [];
    this.bindShapeMatrix = new Matrix4();
    this.bindShapeMatrixInverse = new Matrix4();
  }

  /**
   * Set the bind shape matrix
   */
  setBindShapeMatrix(matrix: Matrix4): void {
    this.bindShapeMatrix.copy(matrix);
    this.bindShapeMatrixInverse.copy(matrix).invert();
  }

  /**
   * Add vertex weights for a vertex
   */
  addVertexWeights(vertexIndex: number, weights: VertexWeight[]): void {
    // Normalize weights to sum to 1.0
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    if (totalWeight > 0) {
      weights.forEach(w => w.weight /= totalWeight);
    }

    // Sort by weight (highest first) and limit to 4 influences
    weights.sort((a, b) => b.weight - a.weight);
    weights = weights.slice(0, 4);

    // Ensure we have enough space
    while (this.vertexWeights.length <= vertexIndex) {
      this.vertexWeights.push([]);
    }

    this.vertexWeights[vertexIndex] = weights;
  }

  /**
   * Get vertex weights for a vertex
   */
  getVertexWeights(vertexIndex: number): VertexWeight[] {
    if (vertexIndex < this.vertexWeights.length) {
      return this.vertexWeights[vertexIndex];
    }
    return [];
  }

  /**
   * Set vertex weights for a vertex
   */
  setVertexWeights(vertexIndex: number, weights: VertexWeight[]): void {
    this.addVertexWeights(vertexIndex, weights);
  }

  /**
   * Remove vertex weights for a vertex
   */
  removeVertexWeights(vertexIndex: number): void {
    if (vertexIndex < this.vertexWeights.length) {
      this.vertexWeights[vertexIndex] = [];
    }
  }

  /**
   * Get all bone influences for a vertex
   */
  getBoneInfluences(vertexIndex: number): { bone: Bone; weight: number }[] {
    const weights = this.getVertexWeights(vertexIndex);
    return weights.map(w => ({
      bone: this.skeleton.bones[w.boneIndex],
      weight: w.weight
    }));
  }

  /**
   * Apply skinning to a vertex position
   */
  applySkinning(vertexIndex: number, originalPosition: Vector3): Vector3 {
    const weights = this.getVertexWeights(vertexIndex);
    if (weights.length === 0) {
      return originalPosition.clone();
    }

    const skinnedPosition = new Vector3();
    let totalWeight = 0;

    for (const weight of weights) {
      if (weight.weight > 0) {
        const bone = this.skeleton.bones[weight.boneIndex];
        if (bone) {
          // Transform vertex by bone matrix
          const transformedPosition = this.transformVertexByBone(
            originalPosition,
            bone
          );
          
          // Add weighted contribution
          skinnedPosition.add(transformedPosition.multiplyScalar(weight.weight));
          totalWeight += weight.weight;
        }
      }
    }

    // If no valid weights, return original position
    if (totalWeight === 0) {
      return originalPosition.clone();
    }

    // Normalize by total weight
    if (totalWeight < 1.0) {
      const remainingWeight = 1.0 - totalWeight;
      skinnedPosition.add(originalPosition.multiplyScalar(remainingWeight));
    }

    return skinnedPosition;
  }

  /**
   * Transform a vertex by a bone matrix
   */
  private transformVertexByBone(vertex: Vector3, bone: Bone): Vector3 {
    // Apply bind shape matrix
    const bindShapeVertex = this.applyMatrix(vertex, this.bindShapeMatrix);
    
    // Apply bone's inverse bind matrix
    const boneSpaceVertex = this.applyMatrix(bindShapeVertex, bone.inverseBindMatrix);
    
    // Apply bone's current world matrix
    const skinnedVertex = this.applyMatrix(boneSpaceVertex, bone.worldMatrix);
    
    return skinnedVertex;
  }

  /**
   * Apply a matrix to a vertex
   */
  private applyMatrix(vertex: Vector3, matrix: Matrix4): Vector3 {
    const elements = matrix.elements;
    const x = vertex.x;
    const y = vertex.y;
    const z = vertex.z;

    const transformedX = elements[0] * x + elements[4] * y + elements[8] * z + elements[12];
    const transformedY = elements[1] * x + elements[5] * y + elements[9] * z + elements[13];
    const transformedZ = elements[2] * x + elements[6] * y + elements[10] * z + elements[14];

    return new Vector3(transformedX, transformedY, transformedZ);
  }

  /**
   * Get the number of vertices with weights
   */
  getVertexCount(): number {
    return this.vertexWeights.length;
  }

  /**
   * Get the total number of bone influences
   */
  getTotalInfluences(): number {
    return this.vertexWeights.reduce((total, weights) => total + weights.length, 0);
  }

  /**
   * Get the average number of influences per vertex
   */
  getAverageInfluences(): number {
    const totalVertices = this.vertexWeights.length;
    if (totalVertices === 0) return 0;
    
    return this.getTotalInfluences() / totalVertices;
  }

  /**
   * Clone the skin
   */
  clone(): Skin {
    const cloned = new Skin(this.name, this.skeleton);
    cloned.bindShapeMatrix.copy(this.bindShapeMatrix);
    cloned.bindShapeMatrixInverse.copy(this.bindShapeMatrixInverse);
    
    for (let i = 0; i < this.vertexWeights.length; i++) {
      cloned.vertexWeights[i] = this.vertexWeights[i].map(w => ({
        boneIndex: w.boneIndex,
        weight: w.weight
      }));
    }
    
    return cloned;
  }

  /**
   * Validate the skin data
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check if skeleton exists
    if (!this.skeleton) {
      errors.push('Skin has no skeleton');
    }
    
    // Check bone indices
    for (let i = 0; i < this.vertexWeights.length; i++) {
      const weights = this.vertexWeights[i];
      for (const weight of weights) {
        if (weight.boneIndex < 0 || weight.boneIndex >= this.skeleton.bones.length) {
          errors.push(`Invalid bone index ${weight.boneIndex} for vertex ${i}`);
        }
        if (weight.weight < 0 || weight.weight > 1) {
          errors.push(`Invalid weight ${weight.weight} for vertex ${i}`);
        }
      }
      
      // Check if weights sum to approximately 1.0
      const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
      if (Math.abs(totalWeight - 1.0) > 0.01 && weights.length > 0) {
        errors.push(`Weights for vertex ${i} do not sum to 1.0 (sum: ${totalWeight})`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get skin statistics
   */
  getStatistics(): {
    vertexCount: number;
    totalInfluences: number;
    averageInfluences: number;
    maxInfluences: number;
    boneUsage: Map<number, number>;
  } {
    const vertexCount = this.vertexWeights.length;
    const totalInfluences = this.getTotalInfluences();
    const averageInfluences = this.getAverageInfluences();
    const maxInfluences = Math.max(...this.vertexWeights.map(weights => weights.length));

    // Calculate bone usage
    const boneUsage = new Map<number, number>();
    for (let i = 0; i < this.skeleton.bones.length; i++) {
      boneUsage.set(i, 0);
    }

    for (const weights of this.vertexWeights) {
      for (const weight of weights) {
        const currentUsage = boneUsage.get(weight.boneIndex) || 0;
        boneUsage.set(weight.boneIndex, currentUsage + 1);
      }
    }

    return {
      vertexCount,
      totalInfluences,
      averageInfluences,
      maxInfluences,
      boneUsage
    };
  }

  /**
   * Get vertices influenced by a specific bone
   */
  getVerticesInfluencedByBone(boneIndex: number): number[] {
    const influencedVertices: number[] = [];
    
    for (let i = 0; i < this.vertexWeights.length; i++) {
      const weights = this.vertexWeights[i];
      const hasInfluence = weights.some(w => w.boneIndex === boneIndex && w.weight > 0);
      if (hasInfluence) {
        influencedVertices.push(i);
      }
    }
    
    return influencedVertices;
  }

  /**
   * Get the strongest bone influence for each vertex
   */
  getStrongestInfluences(): { vertexIndex: number; boneIndex: number; weight: number }[] {
    const strongestInfluences: { vertexIndex: number; boneIndex: number; weight: number }[] = [];
    
    for (let i = 0; i < this.vertexWeights.length; i++) {
      const weights = this.vertexWeights[i];
      if (weights.length > 0) {
        const strongest = weights.reduce((max, current) => 
          current.weight > max.weight ? current : max
        );
        strongestInfluences.push({
          vertexIndex: i,
          boneIndex: strongest.boneIndex,
          weight: strongest.weight
        });
      }
    }
    
    return strongestInfluences;
  }

  /**
   * Get vertices with no bone influences
   */
  getUninfluencedVertices(): number[] {
    const uninfluencedVertices: number[] = [];
    
    for (let i = 0; i < this.vertexWeights.length; i++) {
      const weights = this.vertexWeights[i];
      if (weights.length === 0) {
        uninfluencedVertices.push(i);
      }
    }
    
    return uninfluencedVertices;
  }

  /**
   * Get vertices with single bone influence
   */
  getSingleInfluenceVertices(): number[] {
    const singleInfluenceVertices: number[] = [];
    
    for (let i = 0; i < this.vertexWeights.length; i++) {
      const weights = this.vertexWeights[i];
      if (weights.length === 1) {
        singleInfluenceVertices.push(i);
      }
    }
    
    return singleInfluenceVertices;
  }

  /**
   * Get vertices with multiple bone influences
   */
  getMultiInfluenceVertices(): number[] {
    const multiInfluenceVertices: number[] = [];
    
    for (let i = 0; i < this.vertexWeights.length; i++) {
      const weights = this.vertexWeights[i];
      if (weights.length > 1) {
        multiInfluenceVertices.push(i);
      }
    }
    
    return multiInfluenceVertices;
  }

  /**
   * Optimize weights by removing very small influences
   */
  optimizeWeights(threshold = 0.01): number {
    let removedCount = 0;
    
    for (let i = 0; i < this.vertexWeights.length; i++) {
      const weights = this.vertexWeights[i];
      const filteredWeights = weights.filter(w => w.weight >= threshold);
      
      if (filteredWeights.length !== weights.length) {
        removedCount += weights.length - filteredWeights.length;
        
        // Renormalize remaining weights
        const totalWeight = filteredWeights.reduce((sum, w) => sum + w.weight, 0);
        if (totalWeight > 0) {
          filteredWeights.forEach(w => w.weight /= totalWeight);
        }
        
        this.vertexWeights[i] = filteredWeights;
      }
    }
    
    return removedCount;
  }

  /**
   * Normalize all vertex weights
   */
  normalizeAllWeights(): void {
    for (let i = 0; i < this.vertexWeights.length; i++) {
      const weights = this.vertexWeights[i];
      if (weights.length > 0) {
        const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
        if (totalWeight > 0) {
          weights.forEach(w => w.weight /= totalWeight);
        }
      }
    }
  }

  /**
   * Limit the number of influences per vertex
   */
  limitInfluences(maxInfluences: number): number {
    let removedCount = 0;
    
    for (let i = 0; i < this.vertexWeights.length; i++) {
      const weights = this.vertexWeights[i];
      if (weights.length > maxInfluences) {
        // Sort by weight (highest first) and keep only the top influences
        weights.sort((a, b) => b.weight - a.weight);
        const removed = weights.splice(maxInfluences);
        removedCount += removed.length;
        
        // Renormalize remaining weights
        const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
        if (totalWeight > 0) {
          weights.forEach(w => w.weight /= totalWeight);
        }
      }
    }
    
    return removedCount;
  }

  /**
   * Get weight distribution statistics
   */
  getWeightDistribution(): {
    minWeight: number;
    maxWeight: number;
    averageWeight: number;
    weightRanges: { range: string; count: number }[];
  } {
    const allWeights: number[] = [];
    
    for (const weights of this.vertexWeights) {
      for (const weight of weights) {
        allWeights.push(weight.weight);
      }
    }
    
    if (allWeights.length === 0) {
      return {
        minWeight: 0,
        maxWeight: 0,
        averageWeight: 0,
        weightRanges: []
      };
    }
    
    const minWeight = Math.min(...allWeights);
    const maxWeight = Math.max(...allWeights);
    const averageWeight = allWeights.reduce((sum, w) => sum + w, 0) / allWeights.length;
    
    // Create weight ranges
    const ranges = [
      { min: 0, max: 0.1, label: '0.0-0.1' },
      { min: 0.1, max: 0.3, label: '0.1-0.3' },
      { min: 0.3, max: 0.5, label: '0.3-0.5' },
      { min: 0.5, max: 0.7, label: '0.5-0.7' },
      { min: 0.7, max: 0.9, label: '0.7-0.9' },
      { min: 0.9, max: 1.0, label: '0.9-1.0' }
    ];
    
    const weightRanges = ranges.map(range => {
      const count = allWeights.filter(w => w >= range.min && w < range.max).length;
      return { range: range.label, count };
    });
    
    return {
      minWeight,
      maxWeight,
      averageWeight,
      weightRanges
    };
  }

  /**
   * Check if a vertex has any bone influences
   */
  hasInfluences(vertexIndex: number): boolean {
    return this.vertexWeights[vertexIndex]?.length > 0;
  }

  /**
   * Get the number of influences for a vertex
   */
  getInfluenceCount(vertexIndex: number): number {
    return this.vertexWeights[vertexIndex]?.length || 0;
  }

  /**
   * Get the total weight for a vertex
   */
  getTotalWeight(vertexIndex: number): number {
    const weights = this.vertexWeights[vertexIndex];
    if (!weights) return 0;
    return weights.reduce((sum, w) => sum + w.weight, 0);
  }

  /**
   * Check if weights are properly normalized for a vertex
   */
  isNormalized(vertexIndex: number, tolerance = 0.01): boolean {
    const totalWeight = this.getTotalWeight(vertexIndex);
    return Math.abs(totalWeight - 1.0) <= tolerance;
  }

  /**
   * Get all vertices that are not properly normalized
   */
  getNonNormalizedVertices(tolerance = 0.01): number[] {
    const nonNormalizedVertices: number[] = [];
    
    for (let i = 0; i < this.vertexWeights.length; i++) {
      if (!this.isNormalized(i, tolerance)) {
        nonNormalizedVertices.push(i);
      }
    }
    
    return nonNormalizedVertices;
  }
} 