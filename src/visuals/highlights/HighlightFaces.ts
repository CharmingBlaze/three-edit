/**
 * HighlightFaces - Highlights selected faces
 * Creates visual indicators for selected face surfaces
 */

import * as THREE from 'three';

export interface HighlightFacesOptions {
  color?: number;
  opacity?: number;
  wireframe?: boolean;
  wireframeColor?: number;
  wireframeOpacity?: number;
}

const DEFAULT_OPTIONS: Required<HighlightFacesOptions> = {
  color: 0x00ff00,
  opacity: 0.3,
  wireframe: true,
  wireframeColor: 0x00ff00,
  wireframeOpacity: 0.8
};

/**
 * Create face highlights for selected faces
 */
export function HighlightFaces(
  mesh: THREE.Mesh,
  selectedFaces: number[],
  options: HighlightFacesOptions = {}
): THREE.Group {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { type: 'face-highlights', count: selectedFaces.length };
  
  if (!mesh.geometry) return group;
  
  const positions = mesh.geometry.attributes.position;
  const indices = mesh.geometry.index;
  
  if (!positions || positions instanceof THREE.GLBufferAttribute) return group;
  
  // Create highlight for each selected face
  selectedFaces.forEach((faceIndex, index) => {
    if (indices) {
      // Indexed geometry
      const vertexIndices = getFaceVertexIndices(indices, faceIndex);
      if (vertexIndices) {
        const vertices = vertexIndices.map(i => {
          const vertex = new THREE.Vector3();
          vertex.fromBufferAttribute(positions, i);
          vertex.applyMatrix4(mesh.matrixWorld);
          return vertex;
        });
        
        const highlight = createFaceHighlight(vertices, opts);
        highlight.userData.originalFace = faceIndex;
        highlight.userData.faceIndex = index;
        group.add(highlight);
      }
    } else {
      // Non-indexed geometry (assumes triangles)
      const baseIndex = faceIndex * 3;
      if (baseIndex + 2 < positions.count) {
        const vertices = [];
        for (let i = 0; i < 3; i++) {
          const vertex = new THREE.Vector3();
          vertex.fromBufferAttribute(positions, baseIndex + i);
          vertex.applyMatrix4(mesh.matrixWorld);
          vertices.push(vertex);
        }
        
        const highlight = createFaceHighlight(vertices, opts);
        highlight.userData.originalFace = faceIndex;
        highlight.userData.faceIndex = index;
        group.add(highlight);
      }
    }
  });
  
  return group;
}

/**
 * Get vertex indices for a face
 */
function getFaceVertexIndices(indices: THREE.BufferAttribute, faceIndex: number): number[] | null {
  const baseIndex = faceIndex * 3;
  if (baseIndex + 2 >= indices.count) return null;
  
  return [
    indices.getX(baseIndex),
    indices.getX(baseIndex + 1),
    indices.getX(baseIndex + 2)
  ];
}

/**
 * Create a single face highlight
 */
function createFaceHighlight(
  vertices: THREE.Vector3[], 
  options: Required<HighlightFacesOptions>
): THREE.Group {
  const group = new THREE.Group();
  
  // Create face surface
  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(vertices);
  
  const material = new THREE.MeshBasicMaterial({
    color: options.color,
    transparent: true,
    opacity: options.opacity,
    side: THREE.DoubleSide,
    depthTest: false
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);
  
  // Create wireframe if requested
  if (options.wireframe) {
    const wireframeGeometry = new THREE.BufferGeometry();
    wireframeGeometry.setFromPoints(vertices);
    
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: options.wireframeColor,
      transparent: true,
      opacity: options.wireframeOpacity,
      depthTest: false
    });
    
    const wireframe = new THREE.LineLoop(wireframeGeometry, wireframeMaterial);
    group.add(wireframe);
  }
  
  group.userData = { 
    type: 'face-highlight', 
    vertices: vertices.map(v => v.clone()) 
  };
  
  return group;
}

/**
 * Update face highlight positions when mesh changes
 */
export function updateFaceHighlights(
  highlights: THREE.Group,
  mesh: THREE.Mesh,
  selectedFaces: number[]
): void {
  if (!mesh.geometry) return;
  
  const positions = mesh.geometry.attributes.position;
  const indices = mesh.geometry.index;
  
  if (!positions || positions instanceof THREE.GLBufferAttribute) return;
  
  // Clear existing highlights
  highlights.clear();
  
  // Recreate highlights with new positions
  selectedFaces.forEach((faceIndex, index) => {
    if (indices) {
      const vertexIndices = getFaceVertexIndices(indices, faceIndex);
      if (vertexIndices) {
        const vertices = vertexIndices.map(i => {
          const vertex = new THREE.Vector3();
          vertex.fromBufferAttribute(positions, i);
          vertex.applyMatrix4(mesh.matrixWorld);
          return vertex;
        });
        
        const highlight = createFaceHighlight(vertices, {
          color: 0x00ff00,
          opacity: 0.3,
          wireframe: true,
          wireframeColor: 0x00ff00,
          wireframeOpacity: 0.8
        });
        highlight.userData.originalFace = faceIndex;
        highlight.userData.faceIndex = index;
        highlights.add(highlight);
      }
    } else {
      const baseIndex = faceIndex * 3;
      if (baseIndex + 2 < positions.count) {
        const vertices = [];
        for (let i = 0; i < 3; i++) {
          const vertex = new THREE.Vector3();
          vertex.fromBufferAttribute(positions, baseIndex + i);
          vertex.applyMatrix4(mesh.matrixWorld);
          vertices.push(vertex);
        }
        
        const highlight = createFaceHighlight(vertices, {
          color: 0x00ff00,
          opacity: 0.3,
          wireframe: true,
          wireframeColor: 0x00ff00,
          wireframeOpacity: 0.8
        });
        highlight.userData.originalFace = faceIndex;
        highlight.userData.faceIndex = index;
        highlights.add(highlight);
      }
    }
  });
  
  highlights.userData.count = selectedFaces.length;
}

/**
 * Dispose face highlight resources
 */
export function disposeFaceHighlights(highlights: THREE.Group): void {
  highlights.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.LineLoop) {
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