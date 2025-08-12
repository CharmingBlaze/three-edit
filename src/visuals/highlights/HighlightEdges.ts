/**
 * HighlightEdges - Highlights selected edges
 * Creates visual indicators for selected edge lines
 */

import * as THREE from 'three';

export interface HighlightEdgesOptions {
  color?: number;
  opacity?: number;
  lineWidth?: number;
  dashed?: boolean;
  dashSize?: number;
  gapSize?: number;
}

const DEFAULT_OPTIONS: Required<HighlightEdgesOptions> = {
  color: 0x00ff00,
  opacity: 0.8,
  lineWidth: 2,
  dashed: false,
  dashSize: 0.1,
  gapSize: 0.05
};

/**
 * Create edge highlights for selected edges
 */
export function HighlightEdges(
  mesh: THREE.Mesh,
  selectedEdges: Array<{ start: number; end: number }>,
  options: HighlightEdgesOptions = {}
): THREE.Group {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { type: 'edge-highlights', count: selectedEdges.length };
  
  if (!mesh.geometry) return group;
  
  const positions = mesh.geometry.attributes.position;
  if (!positions || positions instanceof THREE.GLBufferAttribute) return group;
  
  // Create highlight for each selected edge
  selectedEdges.forEach((edge, index) => {
    if (edge.start >= 0 && edge.start < positions.count && 
        edge.end >= 0 && edge.end < positions.count) {
      
      const start = new THREE.Vector3();
      const end = new THREE.Vector3();
      
      start.fromBufferAttribute(positions, edge.start);
      end.fromBufferAttribute(positions, edge.end);
      
      // Transform to world space
      start.applyMatrix4(mesh.matrixWorld);
      end.applyMatrix4(mesh.matrixWorld);
      
      const highlight = createEdgeHighlight(start, end, opts);
      highlight.userData.originalEdge = edge;
      highlight.userData.edgeIndex = index;
      group.add(highlight);
    }
  });
  
  return group;
}

/**
 * Create a single edge highlight
 */
function createEdgeHighlight(
  start: THREE.Vector3, 
  end: THREE.Vector3, 
  options: Required<HighlightEdgesOptions>
): THREE.Line {
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  
  let material: THREE.LineBasicMaterial | THREE.LineDashedMaterial;
  
  if (options.dashed) {
    material = new THREE.LineDashedMaterial({
      color: options.color,
      transparent: true,
      opacity: options.opacity,
      dashSize: options.dashSize,
      gapSize: options.gapSize,
      depthTest: false
    });
  } else {
    material = new THREE.LineBasicMaterial({
      color: options.color,
      transparent: true,
      opacity: options.opacity,
      depthTest: false
    });
  }
  
  const line = new THREE.Line(geometry, material);
  if (options.dashed) {
    line.computeLineDistances();
  }
  
  line.userData = { 
    type: 'edge-highlight', 
    start: start.clone(), 
    end: end.clone() 
  };
  
  return line;
}

/**
 * Update edge highlight positions when mesh changes
 */
export function updateEdgeHighlights(
  highlights: THREE.Group,
  mesh: THREE.Mesh,
  selectedEdges: Array<{ start: number; end: number }>
): void {
  if (!mesh.geometry) return;
  
  const positions = mesh.geometry.attributes.position;
  if (!positions || positions instanceof THREE.GLBufferAttribute) return;
  
  // Clear existing highlights
  highlights.clear();
  
  // Recreate highlights with new positions
  selectedEdges.forEach((edge, index) => {
    if (edge.start >= 0 && edge.start < positions.count && 
        edge.end >= 0 && edge.end < positions.count) {
      
      const start = new THREE.Vector3();
      const end = new THREE.Vector3();
      
      start.fromBufferAttribute(positions, edge.start);
      end.fromBufferAttribute(positions, edge.end);
      
      start.applyMatrix4(mesh.matrixWorld);
      end.applyMatrix4(mesh.matrixWorld);
      
      const highlight = createEdgeHighlight(start, end, {
        color: 0x00ff00,
        opacity: 0.8,
        lineWidth: 2,
        dashed: false,
        dashSize: 0.1,
        gapSize: 0.05
      });
      highlight.userData.originalEdge = edge;
      highlight.userData.edgeIndex = index;
      highlights.add(highlight);
    }
  });
  
  highlights.userData.count = selectedEdges.length;
}

/**
 * Dispose edge highlight resources
 */
export function disposeEdgeHighlights(highlights: THREE.Group): void {
  highlights.traverse((child) => {
    if (child instanceof THREE.Line) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });
  highlights.clear();
} 