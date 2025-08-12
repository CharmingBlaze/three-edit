/**
 * HoverHighlightHelper - Visual feedback on hover
 * Provides temporary highlights for elements under the mouse cursor
 */

import * as THREE from 'three';

export interface HoverHighlightOptions {
  color?: number;
  opacity?: number;
  size?: number;
  duration?: number;
  pulse?: boolean;
}

const DEFAULT_OPTIONS: Required<HoverHighlightOptions> = {
  color: 0xffff00,
  opacity: 0.6,
  size: 0.12,
  duration: 0.3,
  pulse: true
};

/**
 * Create a hover highlight helper
 */
export function HoverHighlightHelper(options: HoverHighlightOptions = {}): THREE.Group {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { 
    type: 'hover-highlight', 
    options: opts,
    active: false,
    startTime: 0
  };
  
  // Create invisible highlight that will be positioned when needed
  const geometry = new THREE.SphereGeometry(opts.size, 8, 6);
  const material = new THREE.MeshBasicMaterial({
    color: opts.color,
    transparent: true,
    opacity: opts.opacity,
    depthTest: false
  });
  
  const highlight = new THREE.Mesh(geometry, material);
  highlight.visible = false;
  highlight.userData = { type: 'hover-marker' };
  
  group.add(highlight);
  
  return group;
}

/**
 * Show hover highlight at position
 */
export function showHoverHighlight(
  highlight: THREE.Group,
  position: THREE.Vector3,
  type: 'vertex' | 'edge' | 'face' = 'vertex'
): void {
  const marker = highlight.children[0] as THREE.Mesh;
  if (!marker) return;
  
  marker.position.copy(position);
  marker.visible = true;
  
  // Update geometry based on type
  const options = highlight.userData.options;
  
  switch (type) {
    case 'vertex':
      marker.geometry.dispose();
      marker.geometry = new THREE.SphereGeometry(options.size, 8, 6);
      break;
    case 'edge':
      marker.geometry.dispose();
      marker.geometry = new THREE.CylinderGeometry(options.size * 0.3, options.size * 0.3, options.size * 2, 8);
      break;
    case 'face':
      marker.geometry.dispose();
      marker.geometry = new THREE.BoxGeometry(options.size * 2, options.size * 2, options.size * 0.1);
      break;
  }
  
  highlight.userData.active = true;
  highlight.userData.startTime = Date.now();
  highlight.userData.hoverType = type;
}

/**
 * Hide hover highlight
 */
export function hideHoverHighlight(highlight: THREE.Group): void {
  const marker = highlight.children[0] as THREE.Mesh;
  if (marker) {
    marker.visible = false;
  }
  
  highlight.userData.active = false;
  highlight.userData.hoverType = null;
}

/**
 * Update hover highlight animation
 */
export function updateHoverHighlight(highlight: THREE.Group): void {
  if (!highlight.userData.active) return;
  
  const marker = highlight.children[0] as THREE.Mesh;
  if (!marker || !marker.visible) return;
  
  const options = highlight.userData.options;
  const elapsed = (Date.now() - highlight.userData.startTime) / 1000;
  
  if (options.pulse) {
    // Pulse animation
    const pulse = 1 + 0.2 * Math.sin(elapsed * 10);
    marker.scale.setScalar(pulse);
  }
  
  // Fade out after duration
  if (elapsed > options.duration) {
    const fadeOut = Math.max(0, 1 - (elapsed - options.duration) / 0.5);
    if (marker.material instanceof THREE.Material) {
      marker.material.opacity = options.opacity * fadeOut;
    }
    
    if (fadeOut <= 0) {
      hideHoverHighlight(highlight);
    }
  }
}

/**
 * Create a vertex hover highlight
 */
export function createVertexHoverHighlight(position: THREE.Vector3, options: HoverHighlightOptions = {}): THREE.Mesh {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const geometry = new THREE.SphereGeometry(opts.size, 8, 6);
  const material = new THREE.MeshBasicMaterial({
    color: opts.color,
    transparent: true,
    opacity: opts.opacity,
    depthTest: false
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.userData = { type: 'vertex-hover', originalPosition: position.clone() };
  
  return mesh;
}

/**
 * Create an edge hover highlight
 */
export function createEdgeHoverHighlight(
  start: THREE.Vector3, 
  end: THREE.Vector3, 
  options: HoverHighlightOptions = {}
): THREE.Line {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const material = new THREE.LineBasicMaterial({
    color: opts.color,
    transparent: true,
    opacity: opts.opacity,
    depthTest: false
  });
  
  const line = new THREE.Line(geometry, material);
  line.userData = { 
    type: 'edge-hover', 
    start: start.clone(), 
    end: end.clone() 
  };
  
  return line;
}

/**
 * Dispose hover highlight resources
 */
export function disposeHoverHighlight(highlight: THREE.Group): void {
  highlight.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
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
  highlight.clear();
} 