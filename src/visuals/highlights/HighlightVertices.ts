/**
 * HighlightVertices - Highlights selected vertices
 * Creates visual indicators for selected vertex points
 */

import * as THREE from 'three';

export interface HighlightVerticesOptions {
  color?: number;
  opacity?: number;
  size?: number;
  shape?: 'sphere' | 'cube' | 'octahedron';
}

const DEFAULT_OPTIONS: Required<HighlightVerticesOptions> = {
  color: 0x00ff00,
  opacity: 0.8,
  size: 0.1,
  shape: 'sphere'
};

/**
 * Create vertex highlights for selected vertices
 */
export function HighlightVertices(
  mesh: THREE.Mesh,
  selectedIndices: number[],
  options: HighlightVerticesOptions = {}
): THREE.Group {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { type: 'vertex-highlights', count: selectedIndices.length };
  
  if (!mesh.geometry) return group;
  
  const positions = mesh.geometry.attributes.position;
  if (!positions || positions instanceof THREE.GLBufferAttribute) return group;
  
  // Create highlight for each selected vertex
  selectedIndices.forEach(index => {
    if (index >= 0 && index < positions.count) {
      const vertex = new THREE.Vector3();
      vertex.fromBufferAttribute(positions, index);
      
      // Transform vertex to world space
      vertex.applyMatrix4(mesh.matrixWorld);
      
      const highlight = createVertexHighlight(vertex, opts);
      highlight.userData.originalIndex = index;
      group.add(highlight);
    }
  });
  
  return group;
}

/**
 * Create a single vertex highlight
 */
function createVertexHighlight(
  position: THREE.Vector3, 
  options: Required<HighlightVerticesOptions>
): THREE.Mesh {
  let geometry: THREE.BufferGeometry;
  
  switch (options.shape) {
    case 'cube':
      geometry = new THREE.BoxGeometry(options.size, options.size, options.size);
      break;
    case 'octahedron':
      geometry = new THREE.OctahedronGeometry(options.size * 0.7);
      break;
    case 'sphere':
    default:
      geometry = new THREE.SphereGeometry(options.size, 8, 6);
      break;
  }
  
  const material = new THREE.MeshBasicMaterial({
    color: options.color,
    transparent: true,
    opacity: options.opacity,
    depthTest: false // Always render on top
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.userData = { type: 'vertex-highlight', originalPosition: position.clone() };
  
  return mesh;
}

/**
 * Update vertex highlight positions when mesh changes
 */
export function updateVertexHighlights(
  highlights: THREE.Group,
  mesh: THREE.Mesh,
  selectedIndices: number[]
): void {
  if (!mesh.geometry) return;
  
  const positions = mesh.geometry.attributes.position;
  if (!positions || positions instanceof THREE.GLBufferAttribute) return;
  
  // Clear existing highlights
  highlights.clear();
  
  // Recreate highlights with new positions
  selectedIndices.forEach(index => {
    if (index >= 0 && index < positions.count) {
      const vertex = new THREE.Vector3();
      vertex.fromBufferAttribute(positions, index);
      vertex.applyMatrix4(mesh.matrixWorld);
      
      const highlight = createVertexHighlight(vertex, {
        color: 0x00ff00,
        opacity: 0.8,
        size: 0.1,
        shape: 'sphere'
      });
      highlight.userData.originalIndex = index;
      highlights.add(highlight);
    }
  });
  
  highlights.userData.count = selectedIndices.length;
}

/**
 * Dispose vertex highlight resources
 */
export function disposeVertexHighlights(highlights: THREE.Group): void {
  highlights.traverse((child) => {
    if (child instanceof THREE.Mesh) {
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