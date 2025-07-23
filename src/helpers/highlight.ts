/**
 * Highlight Helpers - Visual distinction for selected/hovered elements
 * Creates and manages highlight meshes for vertices, edges, faces, and objects
 */

import * as THREE from 'three';
import { Vector3 } from 'three';

/**
 * Highlight configuration options
 */
export interface HighlightOptions {
  color?: number;
  opacity?: number;
  size?: number;
  lineWidth?: number;
  dashed?: boolean;
  dashSize?: number;
  gapSize?: number;
}

/**
 * Default highlight options
 */
const DEFAULT_HIGHLIGHT_OPTIONS: Required<HighlightOptions> = {
  color: 0x00ff00,
  opacity: 0.8,
  size: 0.1,
  lineWidth: 2,
  dashed: false,
  dashSize: 0.1,
  gapSize: 0.05
};

/**
 * Create a vertex highlight (small sphere)
 */
export function createVertexHighlight(
  position: Vector3, 
  options: HighlightOptions = {}
): THREE.Mesh {
  const opts = { ...DEFAULT_HIGHLIGHT_OPTIONS, ...options };
  
  const geometry = new THREE.SphereGeometry(opts.size, 8, 6);
  const material = new THREE.MeshBasicMaterial({
    color: opts.color,
    transparent: true,
    opacity: opts.opacity,
    depthTest: false // Always render on top
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.userData = { type: 'vertex-highlight', originalPosition: position.clone() };
  
  return mesh;
}

/**
 * Create an edge highlight (line)
 */
export function createEdgeHighlight(
  start: Vector3, 
  end: Vector3, 
  options: HighlightOptions = {}
): THREE.Line {
  const opts = { ...DEFAULT_HIGHLIGHT_OPTIONS, ...options };
  
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  
  let material: THREE.LineBasicMaterial | THREE.LineDashedMaterial;
  
  if (opts.dashed) {
    material = new THREE.LineDashedMaterial({
      color: opts.color,
      transparent: true,
      opacity: opts.opacity,
      dashSize: opts.dashSize,
      gapSize: opts.gapSize,
      depthTest: false
    });
  } else {
    material = new THREE.LineBasicMaterial({
      color: opts.color,
      transparent: true,
      opacity: opts.opacity,
      depthTest: false
    });
  }
  
  const line = new THREE.Line(geometry, material);
  if (opts.dashed) {
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
 * Create a face highlight (transparent plane)
 */
export function createFaceHighlight(
  vertices: Vector3[], 
  options: HighlightOptions = {}
): THREE.Mesh {
  const opts = { ...DEFAULT_HIGHLIGHT_OPTIONS, ...options };
  
  // Create face geometry from vertices
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(vertices.length * 3);
  
  for (let i = 0; i < vertices.length; i++) {
    positions[i * 3] = vertices[i].x;
    positions[i * 3 + 1] = vertices[i].y;
    positions[i * 3 + 2] = vertices[i].z;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  // Create faces (triangulate if needed)
  if (vertices.length === 3) {
    geometry.setIndex([0, 1, 2]);
  } else if (vertices.length === 4) {
    geometry.setIndex([0, 1, 2, 0, 2, 3]);
  } else {
    // Simple triangulation for polygons
    const indices: number[] = [];
    for (let i = 1; i < vertices.length - 1; i++) {
      indices.push(0, i, i + 1);
    }
    geometry.setIndex(indices);
  }
  
  geometry.computeVertexNormals();
  
  const material = new THREE.MeshBasicMaterial({
    color: opts.color,
    transparent: true,
    opacity: opts.opacity * 0.3, // Face highlights are more transparent
    side: THREE.DoubleSide,
    depthTest: false
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = { 
    type: 'face-highlight', 
    vertices: vertices.map(v => v.clone()) 
  };
  
  return mesh;
}

/**
 * Create a bounding box highlight
 */
export function createBoundingBoxHighlight(
  boundingBox: THREE.Box3,
  options: HighlightOptions = {}
): THREE.LineSegments {
  const opts = { ...DEFAULT_HIGHLIGHT_OPTIONS, ...options };
  
  const geometry = new THREE.BoxGeometry(
    boundingBox.max.x - boundingBox.min.x,
    boundingBox.max.y - boundingBox.min.y,
    boundingBox.max.z - boundingBox.min.z
  );
  
  const material = new THREE.LineBasicMaterial({
    color: opts.color,
    transparent: true,
    opacity: opts.opacity,
    depthTest: false
  });
  
  const wireframe = new THREE.WireframeGeometry(geometry);
  const lineSegments = new THREE.LineSegments(wireframe, material);
  
  // Position the wireframe at the center of the bounding box
  const center = new Vector3();
  boundingBox.getCenter(center);
  lineSegments.position.copy(center);
  
  lineSegments.userData = { 
    type: 'bounding-box-highlight', 
    boundingBox: boundingBox.clone() 
  };
  
  return lineSegments;
}

/**
 * Create a selection outline (similar to Blender's selection)
 */
export function createSelectionOutline(
  mesh: THREE.Mesh,
  options: HighlightOptions = {}
): THREE.LineSegments {
  const opts = { ...DEFAULT_HIGHLIGHT_OPTIONS, ...options };
  
  const geometry = mesh.geometry.clone();
  const material = new THREE.LineBasicMaterial({
    color: opts.color,
    transparent: true,
    opacity: opts.opacity,
    depthTest: false
  });
  
  const wireframe = new THREE.WireframeGeometry(geometry);
  const lineSegments = new THREE.LineSegments(wireframe, material);
  
  // Copy the mesh's transform
  lineSegments.position.copy(mesh.position);
  lineSegments.rotation.copy(mesh.rotation);
  lineSegments.scale.copy(mesh.scale);
  
  lineSegments.userData = { 
    type: 'selection-outline', 
    targetMesh: mesh 
  };
  
  return lineSegments;
}

/**
 * Update vertex highlight position
 */
export function updateVertexHighlight(
  highlight: THREE.Mesh, 
  newPosition: Vector3
): void {
  if (highlight.userData.type === 'vertex-highlight') {
    highlight.position.copy(newPosition);
    highlight.userData.originalPosition = newPosition.clone();
  }
}

/**
 * Update edge highlight positions
 */
export function updateEdgeHighlight(
  highlight: THREE.Line, 
  newStart: Vector3, 
  newEnd: Vector3
): void {
  if (highlight.userData.type === 'edge-highlight') {
    const geometry = highlight.geometry as THREE.BufferGeometry;
    const positionAttribute = geometry.attributes.position;
    if (positionAttribute instanceof THREE.BufferAttribute) {
      const positions = positionAttribute.array as Float32Array;
      
      positions[0] = newStart.x;
      positions[1] = newStart.y;
      positions[2] = newStart.z;
      positions[3] = newEnd.x;
      positions[4] = newEnd.y;
      positions[5] = newEnd.z;
      
      geometry.attributes.position.needsUpdate = true;
      highlight.userData.start = newStart.clone();
      highlight.userData.end = newEnd.clone();
    }
  }
}

/**
 * Update face highlight vertices
 */
export function updateFaceHighlight(
  highlight: THREE.Mesh, 
  newVertices: Vector3[]
): void {
  if (highlight.userData.type === 'face-highlight') {
    const geometry = highlight.geometry as THREE.BufferGeometry;
    const positions = new Float32Array(newVertices.length * 3);
    
    for (let i = 0; i < newVertices.length; i++) {
      positions[i * 3] = newVertices[i].x;
      positions[i * 3 + 1] = newVertices[i].y;
      positions[i * 3 + 2] = newVertices[i].z;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Update indices if vertex count changed
    if (newVertices.length === 3) {
      geometry.setIndex([0, 1, 2]);
    } else if (newVertices.length === 4) {
      geometry.setIndex([0, 1, 2, 0, 2, 3]);
    } else {
      const indices: number[] = [];
      for (let i = 1; i < newVertices.length - 1; i++) {
        indices.push(0, i, i + 1);
      }
      geometry.setIndex(indices);
    }
    
    geometry.computeVertexNormals();
    highlight.userData.vertices = newVertices.map(v => v.clone());
  }
}

/**
 * Update highlight color
 */
export function updateHighlightColor(
  highlight: THREE.Object3D, 
  newColor: number
): void {
  if (highlight instanceof THREE.Mesh && highlight.material instanceof THREE.Material) {
    (highlight.material as any).color.setHex(newColor);
  } else if (highlight instanceof THREE.Line && highlight.material instanceof THREE.Material) {
    (highlight.material as any).color.setHex(newColor);
  } else if (highlight instanceof THREE.LineSegments && highlight.material instanceof THREE.Material) {
    (highlight.material as any).color.setHex(newColor);
  }
}

/**
 * Update highlight opacity
 */
export function updateHighlightOpacity(
  highlight: THREE.Object3D, 
  newOpacity: number
): void {
  if (highlight instanceof THREE.Mesh && highlight.material instanceof THREE.Material) {
    (highlight.material as any).opacity = newOpacity;
  } else if (highlight instanceof THREE.Line && highlight.material instanceof THREE.Material) {
    (highlight.material as any).opacity = newOpacity;
  } else if (highlight instanceof THREE.LineSegments && highlight.material instanceof THREE.Material) {
    (highlight.material as any).opacity = newOpacity;
  }
}

/**
 * Dispose of a highlight object and its resources
 */
export function disposeHighlightObject(obj: THREE.Object3D): void {
  if (obj instanceof THREE.Mesh) {
    obj.geometry.dispose();
    if (Array.isArray(obj.material)) {
      obj.material.forEach(material => material.dispose());
    } else {
      obj.material.dispose();
    }
  } else if (obj instanceof THREE.Line || obj instanceof THREE.LineSegments) {
    obj.geometry.dispose();
    if (obj.material instanceof THREE.Material) {
      obj.material.dispose();
    }
  }
  
  // Remove from parent
  if (obj.parent) {
    obj.parent.remove(obj);
  }
}

/**
 * Dispose of multiple highlight objects
 */
export function disposeHighlightObjects(objects: THREE.Object3D[]): void {
  objects.forEach(obj => disposeHighlightObject(obj));
}

/**
 * Create a highlight group for managing multiple highlights
 */
export function createHighlightGroup(): THREE.Group {
  const group = new THREE.Group();
  group.userData = { type: 'highlight-group' };
  return group;
}

/**
 * Add highlight to a group
 */
export function addHighlightToGroup(
  group: THREE.Group, 
  highlight: THREE.Object3D
): void {
  if (group.userData.type === 'highlight-group') {
    group.add(highlight);
  }
}

/**
 * Remove highlight from a group
 */
export function removeHighlightFromGroup(
  group: THREE.Group, 
  highlight: THREE.Object3D
): void {
  if (group.userData.type === 'highlight-group') {
    group.remove(highlight);
  }
}

/**
 * Clear all highlights from a group
 */
export function clearHighlightGroup(group: THREE.Group): void {
  if (group.userData.type === 'highlight-group') {
    const children = [...group.children];
    children.forEach(child => {
      disposeHighlightObject(child);
    });
  }
}

/**
 * Get all highlights of a specific type from a group
 */
export function getHighlightsByType(
  group: THREE.Group, 
  type: string
): THREE.Object3D[] {
  if (group.userData.type === 'highlight-group') {
    return group.children.filter(child => child.userData.type === type);
  }
  return [];
} 