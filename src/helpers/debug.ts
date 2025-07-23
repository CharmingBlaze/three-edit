/**
 * Debug utility functions for three-edit
 * Pure functions for development logging and mesh statistics
 */

import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { Edge } from '../core/Edge';
import { getMeshStatistics } from './mesh';
import { getEdgeStatistics } from './edge';
import { getNormalStatistics } from './normal';

export interface DebugOptions {
  verbose?: boolean;
  includeWarnings?: boolean;
  includeGeometry?: boolean;
  includeTopology?: boolean;
  includeMaterials?: boolean;
}

/**
 * Debug primitive creation with detailed information
 */
export function debugPrimitive(
  name: string,
  vertices: Vertex[],
  faces: Face[],
  edges: Edge[],
  options: DebugOptions = {}
): void {
  console.group(`🔧 Debug: ${name}`);
  
  // Basic statistics
  const meshStats = getMeshStatistics(vertices, faces, edges);
  const edgeStats = getEdgeStatistics(edges, vertices);
  const normalStats = getNormalStatistics(vertices);
  
  console.log(`📊 Basic Statistics:`);
  console.log(`  Vertices: ${meshStats.vertexCount}`);
  console.log(`  Faces: ${meshStats.faceCount}`);
  console.log(`  Edges: ${meshStats.edgeCount}`);
  console.log(`  Triangles: ${meshStats.triangleCount}`);
  
  if (options.includeMaterials) {
    console.log(`  Materials: ${meshStats.materialCount}`);
  }
  
  if (options.includeGeometry) {
    console.log(`  UVs: ${meshStats.uvCount}/${meshStats.vertexCount}`);
    console.log(`  Normals: ${meshStats.normalCount}/${meshStats.vertexCount}`);
    console.log(`  Orphaned vertices: ${meshStats.orphanedVertices}`);
    
    console.log(`📐 Bounding Box:`);
    console.log(`  Min: (${meshStats.boundingBox.min.x.toFixed(3)}, ${meshStats.boundingBox.min.y.toFixed(3)}, ${meshStats.boundingBox.min.z.toFixed(3)})`);
    console.log(`  Max: (${meshStats.boundingBox.max.x.toFixed(3)}, ${meshStats.boundingBox.max.y.toFixed(3)}, ${meshStats.boundingBox.max.z.toFixed(3)})`);
    console.log(`  Size: (${meshStats.boundingBox.size.x.toFixed(3)}, ${meshStats.boundingBox.size.y.toFixed(3)}, ${meshStats.boundingBox.size.z.toFixed(3)})`);
  }
  
  if (options.includeTopology) {
    console.log(`🔗 Edge Statistics:`);
    console.log(`  Average length: ${edgeStats.averageLength.toFixed(6)}`);
    console.log(`  Min length: ${edgeStats.minLength.toFixed(6)}`);
    console.log(`  Max length: ${edgeStats.maxLength.toFixed(6)}`);
  }
  
  if (options.includeWarnings) {
    printWarnings(vertices, faces, edges);
  }
  
  console.groupEnd();
}

/**
 * Print mesh statistics in a formatted way
 */
export function printMeshStats(
  vertices: Vertex[],
  faces: Face[],
  edges: Edge[],
  name: string = 'Mesh'
): void {
  const stats = getMeshStatistics(vertices, faces, edges);
  
  console.log(`📊 ${name} Statistics:`);
  console.log(`  Vertices: ${stats.vertexCount}`);
  console.log(`  Faces: ${stats.faceCount}`);
  console.log(`  Edges: ${stats.edgeCount}`);
  console.log(`  Triangles: ${stats.triangleCount}`);
  console.log(`  Materials: ${stats.materialCount}`);
  console.log(`  UVs: ${stats.uvCount}/${stats.vertexCount}`);
  console.log(`  Normals: ${stats.normalCount}/${stats.vertexCount}`);
  console.log(`  Orphaned vertices: ${stats.orphanedVertices}`);
  
  if (stats.boundingBox.size.length() > 0) {
    console.log(`  Bounding box: ${stats.boundingBox.size.x.toFixed(2)} × ${stats.boundingBox.size.y.toFixed(2)} × ${stats.boundingBox.size.z.toFixed(2)}`);
  }
}

/**
 * Print warnings for common mesh issues
 */
export function printWarnings(vertices: Vertex[], faces: Face[], edges: Edge[]): void {
  const warnings: string[] = [];
  
  // Check for orphaned vertices
  const orphaned = findOrphanedVertices(vertices, faces);
  if (orphaned.length > 0) {
    warnings.push(`⚠️  ${orphaned.length} orphaned vertices found`);
  }
  
  // Check for degenerate faces
  let degenerateFaces = 0;
  for (const face of faces) {
    if (face.vertices.length < 3) {
      degenerateFaces++;
    }
  }
  if (degenerateFaces > 0) {
    warnings.push(`⚠️  ${degenerateFaces} degenerate faces found`);
  }
  
  // Check for missing UVs
  const uvCount = vertices.filter(v => v.uv !== undefined).length;
  if (uvCount === 0) {
    warnings.push(`⚠️  No UV coordinates found`);
  } else if (uvCount < vertices.length) {
    warnings.push(`⚠️  Only ${uvCount}/${vertices.length} vertices have UVs`);
  }
  
  // Check for missing normals
  const normalCount = vertices.filter(v => v.normal !== undefined).length;
  if (normalCount === 0) {
    warnings.push(`⚠️  No normals found`);
  } else if (normalCount < vertices.length) {
    warnings.push(`⚠️  Only ${normalCount}/${vertices.length} vertices have normals`);
  }
  
  // Check for invalid vertex references
  let invalidReferences = 0;
  for (const face of faces) {
    for (const vertexIndex of face.vertices) {
      if (vertexIndex < 0 || vertexIndex >= vertices.length) {
        invalidReferences++;
      }
    }
  }
  if (invalidReferences > 0) {
    warnings.push(`⚠️  ${invalidReferences} invalid vertex references found`);
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  Warnings:`);
    warnings.forEach(warning => console.log(`  ${warning}`));
  } else {
    console.log(`✅ No warnings found`);
  }
}

/**
 * Log warnings for common issues
 */
export function logWarnings(vertices: Vertex[], faces: Face[], edges: Edge[]): void {
  printWarnings(vertices, faces, edges);
}

/**
 * Color code faces by material for debugging
 */
export function colorCodeFaces(faces: Face[]): void {
  const materialColors: Record<number, string> = {};
  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FF8000', '#8000FF', '#00FF80', '#FF0080', '#80FF00', '#0080FF'
  ];
  
  console.log(`🎨 Face Material Distribution:`);
  
  for (const face of faces) {
    const materialIndex = face.materialIndex || 0;
    
    if (!materialColors[materialIndex]) {
      materialColors[materialIndex] = colors[Object.keys(materialColors).length % colors.length];
    }
    
    const color = materialColors[materialIndex];
    console.log(`  Face ${faces.indexOf(face)}: Material ${materialIndex} ${color}`);
  }
  
  console.log(`📊 Material Summary:`);
  for (const [materialIndex, color] of Object.entries(materialColors)) {
    const count = faces.filter(f => (f.materialIndex || 0) === parseInt(materialIndex)).length;
    console.log(`  Material ${materialIndex}: ${count} faces ${color}`);
  }
}

/**
 * Debug vertex positions
 */
export function debugVertexPositions(vertices: Vertex[], maxVertices: number = 10): void {
  console.log(`📍 Vertex Positions (showing first ${Math.min(maxVertices, vertices.length)}):`);
  
  for (let i = 0; i < Math.min(maxVertices, vertices.length); i++) {
    const vertex = vertices[i];
    console.log(`  Vertex ${i}: (${vertex.x.toFixed(3)}, ${vertex.y.toFixed(3)}, ${vertex.z.toFixed(3)})`);
  }
  
  if (vertices.length > maxVertices) {
    console.log(`  ... and ${vertices.length - maxVertices} more vertices`);
  }
}

/**
 * Debug face connectivity
 */
export function debugFaceConnectivity(faces: Face[], maxFaces: number = 10): void {
  console.log(`🔗 Face Connectivity (showing first ${Math.min(maxFaces, faces.length)}):`);
  
  for (let i = 0; i < Math.min(maxFaces, faces.length); i++) {
    const face = faces[i];
    console.log(`  Face ${i}: vertices [${face.vertices.join(', ')}], material ${face.materialIndex || 0}`);
  }
  
  if (faces.length > maxFaces) {
    console.log(`  ... and ${faces.length - maxFaces} more faces`);
  }
}

/**
 * Debug edge connectivity
 */
export function debugEdgeConnectivity(edges: Edge[], maxEdges: number = 10): void {
  console.log(`🔗 Edge Connectivity (showing first ${Math.min(maxEdges, edges.length)}):`);
  
  for (let i = 0; i < Math.min(maxEdges, edges.length); i++) {
    const edge = edges[i];
    console.log(`  Edge ${i}: ${edge.v1} -> ${edge.v2}`);
  }
  
  if (edges.length > maxEdges) {
    console.log(`  ... and ${edges.length - maxEdges} more edges`);
  }
}

/**
 * Performance timing helper
 */
export function timeOperation<T>(name: string, operation: () => T): T {
  const start = performance.now();
  const result = operation();
  const end = performance.now();
  const duration = end - start;
  
  console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
  
  return result;
}

/**
 * Memory usage helper (approximate)
 */
export function estimateMemoryUsage(
  vertices: Vertex[],
  faces: Face[],
  edges: Edge[]
): {
  vertices: number;
  faces: number;
  edges: number;
  total: number;
} {
  // Rough estimates for memory usage
  const vertexSize = 3 * 8 + 8 + 8 + 8 + 16; // position + normal + uv + color + overhead
  const faceSize = 16 + 8 + 8 + 16; // vertices + material + normal + overhead
  const edgeSize = 8 + 8 + 16; // v1 + v2 + overhead
  
  const vertexMemory = vertices.length * vertexSize;
  const faceMemory = faces.length * faceSize;
  const edgeMemory = edges.length * edgeSize;
  const totalMemory = vertexMemory + faceMemory + edgeMemory;
  
  return {
    vertices: vertexMemory,
    faces: faceMemory,
    edges: edgeMemory,
    total: totalMemory
  };
}

/**
 * Print memory usage
 */
export function printMemoryUsage(vertices: Vertex[], faces: Face[], edges: Edge[]): void {
  const usage = estimateMemoryUsage(vertices, faces, edges);
  
  console.log(`💾 Memory Usage (estimated):`);
  console.log(`  Vertices: ${(usage.vertices / 1024).toFixed(2)} KB`);
  console.log(`  Faces: ${(usage.faces / 1024).toFixed(2)} KB`);
  console.log(`  Edges: ${(usage.edges / 1024).toFixed(2)} KB`);
  console.log(`  Total: ${(usage.total / 1024).toFixed(2)} KB`);
}

// Helper function for finding orphaned vertices
function findOrphanedVertices(vertices: Vertex[], faces: Face[]): number[] {
  const usedVertices = new Set<number>();
  
  for (const face of faces) {
    for (const vertexIndex of face.vertices) {
      usedVertices.add(vertexIndex);
    }
  }
  
  const orphaned: number[] = [];
  for (let i = 0; i < vertices.length; i++) {
    if (!usedVertices.has(i)) {
      orphaned.push(i);
    }
  }
  
  return orphaned;
} 