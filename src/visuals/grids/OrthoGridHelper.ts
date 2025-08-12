/**
 * OrthoGridHelper - 2D ortho/top/front/side grid
 * Provides grid overlays for orthographic camera views
 */

import * as THREE from 'three';

export interface OrthoGridHelperOptions {
  size?: number;
  divisions?: number;
  color?: number;
  centerColor?: number;
  opacity?: number;
  visible?: boolean;
  plane?: 'xy' | 'xz' | 'yz';
}

const DEFAULT_OPTIONS: Required<OrthoGridHelperOptions> = {
  size: 50,
  divisions: 50,
  color: 0x666666,
  centerColor: 0x333333,
  opacity: 0.3,
  visible: true,
  plane: 'xz'
};

/**
 * Create a 2D orthographic grid helper
 */
export function OrthoGridHelper(options: OrthoGridHelperOptions = {}): THREE.Group {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { type: 'ortho-grid', options: opts };
  
  const halfSize = opts.size / 2;
  const step = opts.size / opts.divisions;
  
  // Create grid lines based on plane
  const gridGeometry = new THREE.BufferGeometry();
  const gridPositions: number[] = [];
  
  switch (opts.plane) {
    case 'xy':
      // X lines (vertical in XY plane)
      for (let i = 0; i <= opts.divisions; i++) {
        const x = -halfSize + i * step;
        gridPositions.push(x, -halfSize, 0, x, halfSize, 0);
      }
      // Y lines (horizontal in XY plane)
      for (let i = 0; i <= opts.divisions; i++) {
        const y = -halfSize + i * step;
        gridPositions.push(-halfSize, y, 0, halfSize, y, 0);
      }
      break;
      
    case 'xz':
      // X lines (vertical in XZ plane)
      for (let i = 0; i <= opts.divisions; i++) {
        const x = -halfSize + i * step;
        gridPositions.push(x, 0, -halfSize, x, 0, halfSize);
      }
      // Z lines (horizontal in XZ plane)
      for (let i = 0; i <= opts.divisions; i++) {
        const z = -halfSize + i * step;
        gridPositions.push(-halfSize, 0, z, halfSize, 0, z);
      }
      break;
      
    case 'yz':
      // Y lines (vertical in YZ plane)
      for (let i = 0; i <= opts.divisions; i++) {
        const y = -halfSize + i * step;
        gridPositions.push(0, y, -halfSize, 0, y, halfSize);
      }
      // Z lines (horizontal in YZ plane)
      for (let i = 0; i <= opts.divisions; i++) {
        const z = -halfSize + i * step;
        gridPositions.push(0, -halfSize, z, 0, halfSize, z);
      }
      break;
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
  
  switch (opts.plane) {
    case 'xy':
      centerPositions.push(0, -halfSize, 0, 0, halfSize, 0); // Y center
      centerPositions.push(-halfSize, 0, 0, halfSize, 0, 0); // X center
      break;
    case 'xz':
      centerPositions.push(0, 0, -halfSize, 0, 0, halfSize); // Z center
      centerPositions.push(-halfSize, 0, 0, halfSize, 0, 0); // X center
      break;
    case 'yz':
      centerPositions.push(0, 0, -halfSize, 0, 0, halfSize); // Z center
      centerPositions.push(0, -halfSize, 0, 0, halfSize, 0); // Y center
      break;
  }
  
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
 * Create plane-specific grid helpers
 */
export function createTopGrid(options: Omit<OrthoGridHelperOptions, 'plane'> = {}): THREE.Group {
  return OrthoGridHelper({ ...options, plane: 'xz' });
}

export function createFrontGrid(options: Omit<OrthoGridHelperOptions, 'plane'> = {}): THREE.Group {
  return OrthoGridHelper({ ...options, plane: 'xy' });
}

export function createSideGrid(options: Omit<OrthoGridHelperOptions, 'plane'> = {}): THREE.Group {
  return OrthoGridHelper({ ...options, plane: 'yz' });
} 