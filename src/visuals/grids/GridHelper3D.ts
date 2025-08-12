/**
 * GridHelper3D - 3D grid like Blender/THREE.GridHelper
 * Provides a configurable 3D grid for spatial reference and snapping
 */

import * as THREE from 'three';

export interface GridHelper3DOptions {
  size?: number;
  divisions?: number;
  color?: number;
  centerColor?: number;
  opacity?: number;
  visible?: boolean;
  snapEnabled?: boolean;
  snapDistance?: number;
}

const DEFAULT_OPTIONS: Required<GridHelper3DOptions> = {
  size: 100,
  divisions: 100,
  color: 0x888888,
  centerColor: 0x444444,
  opacity: 0.5,
  visible: true,
  snapEnabled: true,
  snapDistance: 0.1
};

/**
 * Create a 3D grid helper for spatial reference
 */
export function GridHelper3D(options: GridHelper3DOptions = {}): THREE.Group {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { type: 'grid-3d', options: opts };
  
  const halfSize = opts.size / 2;
  const step = opts.size / opts.divisions;
  
  // Create grid lines
  const gridGeometry = new THREE.BufferGeometry();
  const gridPositions: number[] = [];
  
  // Vertical lines (X axis)
  for (let i = 0; i <= opts.divisions; i++) {
    const x = -halfSize + i * step;
    gridPositions.push(x, -halfSize, 0, x, halfSize, 0);
  }
  
  // Horizontal lines (Z axis)
  for (let i = 0; i <= opts.divisions; i++) {
    const z = -halfSize + i * step;
    gridPositions.push(-halfSize, 0, z, halfSize, 0, z);
  }
  
  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
  
  const gridMaterial = new THREE.LineBasicMaterial({
    color: opts.color,
    transparent: true,
    opacity: opts.opacity
  });
  
  const gridLines = new THREE.LineSegments(gridGeometry, gridMaterial);
  group.add(gridLines);
  
  // Add center lines with different color
  const centerGeometry = new THREE.BufferGeometry();
  const centerPositions: number[] = [];
  
  // Center X line
  centerPositions.push(0, -halfSize, 0, 0, halfSize, 0);
  // Center Z line
  centerPositions.push(-halfSize, 0, 0, halfSize, 0, 0);
  
  centerGeometry.setAttribute('position', new THREE.Float32BufferAttribute(centerPositions, 3));
  
  const centerMaterial = new THREE.LineBasicMaterial({
    color: opts.centerColor,
    transparent: true,
    opacity: opts.opacity
  });
  
  const centerLines = new THREE.LineSegments(centerGeometry, centerMaterial);
  group.add(centerLines);
  
  group.visible = opts.visible;
  
  return group;
}

/**
 * Update grid scale based on camera distance
 */
export function updateGridScale(
  camera: THREE.Camera, 
  grid: THREE.Object3D,
  minScale: number = 0.1,
  maxScale: number = 10
): void {
  if (!grid.userData.options) return;
  
  const distance = camera.position.distanceTo(grid.position);
  const targetScale = Math.max(minScale, Math.min(maxScale, distance / 50));
  
  grid.scale.setScalar(targetScale);
}

/**
 * Check if grid should be visible based on camera
 */
export function shouldShowGrid(camera: THREE.Camera): boolean {
  // Hide grid when camera is too close or too far
  const distance = camera.position.length();
  return distance > 0.1 && distance < 1000;
}

/**
 * Dispose grid resources
 */
export function disposeGrid(grid: THREE.Object3D): void {
  grid.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
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
} 