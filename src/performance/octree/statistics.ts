import { OctreeNode, OctreeStatistics } from './types';

/**
 * Calculate octree statistics
 */
export function calculateOctreeStatistics(root: OctreeNode): OctreeStatistics {
  const stats = calculateStatistics(root);
  const memoryUsage = calculateOctreeMemoryUsage(root);
  const distribution = calculateDepthDistribution(root);
  const nodeDistribution = Array.from({ length: stats.maxDepth + 1 }, (_, i) => distribution.get(i) ?? 0);
  
  return {
    totalNodes: stats.totalNodes,
    leafNodes: stats.leafNodes,
    maxDepth: stats.maxDepth,
    averageDepth: calculateAverageDepth(root),
    totalVertices: calculateTotalVertices(root),
    totalFaces: calculateTotalFaces(root),
    memoryUsage,
    nodeDistribution,
    totalObjects: stats.totalObjects,
    averageObjectsPerLeaf: stats.totalObjects / Math.max(stats.leafNodes, 1)
  };
}

/**
 * Calculate detailed statistics for octree
 */
export function calculateStatistics(node: OctreeNode): {
  totalNodes: number;
  leafNodes: number;
  maxDepth: number;
  totalObjects: number;
} {
  let totalNodes = 1;
  let leafNodes = node.isLeaf ? 1 : 0;
  let maxDepth = node.currentDepth;
  let totalObjects = node.vertices.length + node.faces.length;

  // Recursively calculate statistics for children
  for (const child of node.children) {
    const childStats = calculateStatistics(child);
    totalNodes += childStats.totalNodes;
    leafNodes += childStats.leafNodes;
    maxDepth = Math.max(maxDepth, childStats.maxDepth);
    totalObjects += childStats.totalObjects;
  }

  return {
    totalNodes,
    leafNodes,
    maxDepth,
    totalObjects
  };
}

/**
 * Calculate memory usage of octree
 */
export function calculateOctreeMemoryUsage(root: OctreeNode): number {
  let memoryUsage = 0;
  
  // Estimate memory per node
  const nodeMemory = 8 * 8 + 4 + 4 + 4 + 4 + 4 + 4; // center(24) + size(8) + children array + vertices array + faces array + isLeaf + maxDepth + currentDepth
  
  function calculateNodeMemory(node: OctreeNode): number {
    let totalMemory = nodeMemory;
    
    // Add memory for vertices and faces arrays
    totalMemory += node.vertices.length * 8; // Rough estimate for vertex references
    totalMemory += node.faces.length * 8; // Rough estimate for face references
    
    // Recursively calculate for children
    for (const child of node.children) {
      totalMemory += calculateNodeMemory(child);
    }
    
    return totalMemory;
  }
  
  return calculateNodeMemory(root);
}

/**
 * Calculate octree depth distribution
 */
export function calculateDepthDistribution(root: OctreeNode): Map<number, number> {
  const distribution = new Map<number, number>();
  
  function traverse(node: OctreeNode): void {
    const depth = node.currentDepth;
    distribution.set(depth, (distribution.get(depth) ?? 0) + 1);
    
    for (const child of node.children) {
      traverse(child);
    }
  }
  
  traverse(root);
  return distribution;
}

/**
 * Calculate octree balance factor
 */
export function calculateOctreeBalance(root: OctreeNode): number {
  const stats = calculateStatistics(root);
  const idealNodes = Math.pow(8, stats.maxDepth);
  const actualNodes = stats.totalNodes;
  
  return actualNodes / idealNodes;
}

/**
 * Calculate average objects per node
 */
export function calculateAverageObjectsPerNode(root: OctreeNode): number {
  const stats = calculateStatistics(root);
  return stats.totalObjects / stats.totalNodes;
} 

/**
 * Calculate average depth of octree
 */
function calculateAverageDepth(root: OctreeNode): number {
  let totalDepth = 0;
  let nodeCount = 0;
  
  function traverse(node: OctreeNode): void {
    totalDepth += node.currentDepth;
    nodeCount++;
    
    for (const child of node.children) {
      traverse(child);
    }
  }
  
  traverse(root);
  return nodeCount > 0 ? totalDepth / nodeCount : 0;
}

/**
 * Calculate total vertices in octree
 */
function calculateTotalVertices(root: OctreeNode): number {
  let totalVertices = root.vertices.length;
  
  for (const child of root.children) {
    totalVertices += calculateTotalVertices(child);
  }
  
  return totalVertices;
}

/**
 * Calculate total faces in octree
 */
function calculateTotalFaces(root: OctreeNode): number {
  let totalFaces = root.faces.length;
  
  for (const child of root.children) {
    totalFaces += calculateTotalFaces(child);
  }
  
  return totalFaces;
} 