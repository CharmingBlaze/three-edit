/**
 * Grid Helpers - Grid generation, snapping guides, and spatial reference
 * Essential for modeling tools, snapping, alignment, and CAD workflows
 */

import * as THREE from 'three';
import { Vector3, Camera, PerspectiveCamera, OrthographicCamera } from 'three';

/**
 * Grid configuration options
 */
export interface EditorGridOptions {
  size?: number;
  divisions?: number;
  color?: number;
  centerColor?: number;
  opacity?: number;
  visible?: boolean;
  snapEnabled?: boolean;
  snapDistance?: number;
}

/**
 * Snap grid configuration
 */
export interface SnapGridOptions {
  size?: number;
  spacing?: number;
  color?: number;
  opacity?: number;
  visible?: boolean;
  dotSize?: number;
}

/**
 * Default grid options
 */
const DEFAULT_GRID_OPTIONS: Required<EditorGridOptions> = {
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
 * Default snap grid options
 */
const DEFAULT_SNAP_GRID_OPTIONS: Required<SnapGridOptions> = {
  size: 50,
  spacing: 1,
  color: 0x00ff00,
  opacity: 0.7,
  visible: true,
  dotSize: 0.05
};

/**
 * Create a base grid plane (similar to THREE.GridHelper but more configurable)
 */
export function createGridPlane(
  options: EditorGridOptions = {}
): THREE.Group {
  const opts = { ...DEFAULT_GRID_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { type: 'grid-plane', options: opts };
  
  const halfSize = opts.size / 2;
  const step = opts.size / opts.divisions;
  
  // Create grid lines
  const gridGeometry = new THREE.BufferGeometry();
  const gridPositions: number[] = [];
  
  // Vertical lines
  for (let i = 0; i <= opts.divisions; i++) {
    const x = -halfSize + i * step;
    const color = Math.abs(x) < step / 2 ? opts.centerColor : opts.color;
    
    gridPositions.push(x, -halfSize, 0, x, halfSize, 0);
  }
  
  // Horizontal lines
  for (let i = 0; i <= opts.divisions; i++) {
    const z = -halfSize + i * step;
    const color = Math.abs(z) < step / 2 ? opts.centerColor : opts.color;
    
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
  
  // Create center lines with different color
  const centerGeometry = new THREE.BufferGeometry();
  const centerPositions: number[] = [];
  
  // Center X line
  centerPositions.push(-halfSize, 0, 0, halfSize, 0, 0);
  // Center Z line
  centerPositions.push(0, 0, -halfSize, 0, 0, halfSize);
  
  centerGeometry.setAttribute('position', new THREE.Float32BufferAttribute(centerPositions, 3));
  
  const centerMaterial = new THREE.LineBasicMaterial({
    color: opts.centerColor,
    transparent: true,
    opacity: opts.opacity,
    linewidth: 2
  });
  
  const centerLines = new THREE.LineSegments(centerGeometry, centerMaterial);
  group.add(centerLines);
  
  group.visible = opts.visible;
  
  return group;
}

/**
 * Create a snap dots grid
 */
export function createSnapDotsGrid(
  options: SnapGridOptions = {}
): THREE.Points {
  const opts = { ...DEFAULT_SNAP_GRID_OPTIONS, ...options };
  
  const halfSize = opts.size / 2;
  const positions: number[] = [];
  
  // Create grid of dots
  for (let x = -halfSize; x <= halfSize; x += opts.spacing) {
    for (let z = -halfSize; z <= halfSize; z += opts.spacing) {
      positions.push(x, 0, z);
    }
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    color: opts.color,
    size: opts.dotSize,
    transparent: true,
    opacity: opts.opacity,
    sizeAttenuation: true
  });
  
  const points = new THREE.Points(geometry, material);
  points.userData = { type: 'snap-dots-grid', options: opts };
  points.visible = opts.visible;
  
  return points;
}

/**
 * Create a 3D snap grid (dots in 3D space)
 */
export function create3DSnapGrid(
  size: number = 50,
  spacing: number = 1,
  options: SnapGridOptions = {}
): THREE.Points {
  const opts = { ...DEFAULT_SNAP_GRID_OPTIONS, ...options };
  
  const halfSize = size / 2;
  const positions: number[] = [];
  
  // Create 3D grid of dots
  for (let x = -halfSize; x <= halfSize; x += spacing) {
    for (let y = -halfSize; y <= halfSize; y += spacing) {
      for (let z = -halfSize; z <= halfSize; z += spacing) {
        positions.push(x, y, z);
      }
    }
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    color: opts.color,
    size: opts.dotSize,
    transparent: true,
    opacity: opts.opacity,
    sizeAttenuation: true
  });
  
  const points = new THREE.Points(geometry, material);
  points.userData = { type: '3d-snap-grid', size, spacing, options: opts };
  points.visible = opts.visible;
  
  return points;
}

/**
 * Create a measurement grid (with numbered axes)
 */
export function createMeasurementGrid(
  size: number = 100,
  divisions: number = 20,
  options: EditorGridOptions = {}
): THREE.Group {
  const opts = { ...DEFAULT_GRID_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { type: 'measurement-grid', size, divisions, options: opts };
  
  // Create base grid
  const baseGrid = createGridPlane({ ...opts, size, divisions });
  group.add(baseGrid);
  
  // Add axis labels (simplified - in a real implementation you'd use text sprites)
  const step = size / divisions;
  const halfSize = size / 2;
  
  // Create axis indicators
  const axisGeometry = new THREE.BufferGeometry();
  const axisPositions: number[] = [];
  
  // X axis (red)
  axisPositions.push(0, 0, 0, halfSize + 5, 0, 0);
  // Y axis (green)
  axisPositions.push(0, 0, 0, 0, halfSize + 5, 0);
  // Z axis (blue)
  axisPositions.push(0, 0, 0, 0, 0, halfSize + 5);
  
  axisGeometry.setAttribute('position', new THREE.Float32BufferAttribute(axisPositions, 3));
  
  const axisMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.8,
    linewidth: 3
  });
  
  const axisLines = new THREE.LineSegments(axisGeometry, axisMaterial);
  group.add(axisLines);
  
  return group;
}

/**
 * Update grid scale based on camera zoom level
 */
export function updateGridScale(
  camera: Camera, 
  grid: THREE.Object3D,
  minScale: number = 0.1,
  maxScale: number = 10
): void {
  if (grid.userData.type !== 'grid-plane' && 
      grid.userData.type !== 'measurement-grid') {
    return;
  }
  
  let distance: number;
  
  if (camera instanceof PerspectiveCamera) {
    // For perspective camera, use distance to origin
    distance = camera.position.length();
  } else if (camera instanceof OrthographicCamera) {
    // For orthographic camera, use zoom level
    distance = 1 / camera.zoom;
  } else {
    return;
  }
  
  // Calculate appropriate scale based on distance
  const scale = Math.max(minScale, Math.min(maxScale, distance / 10));
  
  // Update grid divisions based on scale
  const options = grid.userData.options;
  const newDivisions = Math.max(10, Math.min(200, Math.round(options.divisions / scale)));
  
  // Recreate grid with new divisions if needed
  if (newDivisions !== options.divisions) {
    options.divisions = newDivisions;
    
    // Remove old grid children
    const children = [...grid.children];
    children.forEach(child => {
      if ('geometry' in child && child.geometry && typeof (child.geometry as any).dispose === 'function') {
        (child.geometry as any).dispose();
      }
      if ('material' in child && child.material && typeof (child.material as any).dispose === 'function') {
        (child.material as any).dispose();
      }
      grid.remove(child);
    });
    
    // Recreate grid
    const newGrid = createGridPlane(options);
    grid.children.push(...newGrid.children);
  }
}

/**
 * Determine if grid should be visible based on camera mode
 */
export function shouldShowGrid(camera: Camera): boolean {
  if (camera instanceof OrthographicCamera) {
    // Always show grid in orthographic mode
    return true;
  } else if (camera instanceof PerspectiveCamera) {
    // Show grid in perspective mode when looking down
    const angle = Math.abs(camera.position.y) / camera.position.length();
    return angle > 0.7; // Show when camera is more horizontal than vertical
  }
  
  return true;
}

/**
 * Create a snap target at a specific position
 */
export function createSnapTarget(
  position: Vector3,
  size: number = 0.2,
  color: number = 0x00ff00
): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(size, 8, 6);
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.8,
    depthTest: false
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.userData = { type: 'snap-target', originalPosition: position.clone() };
  
  return mesh;
}

/**
 * Find nearest snap point on grid
 */
export function findNearestSnapPoint(
  position: Vector3,
  gridSpacing: number = 1,
  snapDistance: number = 0.5
): Vector3 | null {
  // Snap to grid
  const snappedX = Math.round(position.x / gridSpacing) * gridSpacing;
  const snappedY = Math.round(position.y / gridSpacing) * gridSpacing;
  const snappedZ = Math.round(position.z / gridSpacing) * gridSpacing;
  
  const snappedPosition = new Vector3(snappedX, snappedY, snappedZ);
  const distance = position.distanceTo(snappedPosition);
  
  if (distance <= snapDistance) {
    return snappedPosition;
  }
  
  return null;
}

/**
 * Create a temporary snap indicator
 */
export function createSnapIndicator(
  position: Vector3,
  type: 'vertex' | 'edge' | 'face' = 'vertex'
): THREE.Object3D {
  switch (type) {
    case 'vertex':
      return createSnapTarget(position, 0.1, 0x00ff00);
    case 'edge':
      return createSnapTarget(position, 0.15, 0x0000ff);
    case 'face':
      return createSnapTarget(position, 0.2, 0xff0000);
    default:
      return createSnapTarget(position);
  }
}

/**
 * Update grid visibility based on camera
 */
export function updateGridVisibility(
  camera: Camera,
  grid: THREE.Object3D
): void {
  const shouldShow = shouldShowGrid(camera);
  
  if (grid.userData.type === 'grid-plane' || 
      grid.userData.type === 'measurement-grid' ||
      grid.userData.type === 'snap-dots-grid' ||
      grid.userData.type === '3d-snap-grid') {
    grid.visible = shouldShow;
  }
}

/**
 * Create a grid for a specific plane (XY, XZ, YZ)
 */
export function createPlaneGrid(
  plane: 'xy' | 'xz' | 'yz',
  options: EditorGridOptions = {}
): THREE.Group {
  const opts = { ...DEFAULT_GRID_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { type: 'plane-grid', plane, options: opts };
  
  const halfSize = opts.size / 2;
  const step = opts.size / opts.divisions;
  
  // Create grid lines based on plane
  const gridGeometry = new THREE.BufferGeometry();
  const gridPositions: number[] = [];
  
  switch (plane) {
    case 'xy':
      // Vertical lines (X)
      for (let i = 0; i <= opts.divisions; i++) {
        const x = -halfSize + i * step;
        gridPositions.push(x, -halfSize, 0, x, halfSize, 0);
      }
      // Horizontal lines (Y)
      for (let i = 0; i <= opts.divisions; i++) {
        const y = -halfSize + i * step;
        gridPositions.push(-halfSize, y, 0, halfSize, y, 0);
      }
      break;
      
    case 'xz':
      // Vertical lines (X)
      for (let i = 0; i <= opts.divisions; i++) {
        const x = -halfSize + i * step;
        gridPositions.push(x, 0, -halfSize, x, 0, halfSize);
      }
      // Horizontal lines (Z)
      for (let i = 0; i <= opts.divisions; i++) {
        const z = -halfSize + i * step;
        gridPositions.push(-halfSize, 0, z, halfSize, 0, z);
      }
      break;
      
    case 'yz':
      // Vertical lines (Y)
      for (let i = 0; i <= opts.divisions; i++) {
        const y = -halfSize + i * step;
        gridPositions.push(0, y, -halfSize, 0, y, halfSize);
      }
      // Horizontal lines (Z)
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
  
  group.visible = opts.visible;
  
  return group;
}

/**
 * Dispose of grid resources
 */
export function disposeGrid(grid: THREE.Object3D): void {
  if (grid.userData.type && grid.userData.type.includes('grid')) {
    const children = [...grid.children];
    children.forEach(child => {
      if ('geometry' in child && child.geometry && typeof (child.geometry as any).dispose === 'function') {
        (child.geometry as any).dispose();
      }
      if ('material' in child && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material: any) => material.dispose());
        } else if (typeof (child.material as any).dispose === 'function') {
          (child.material as any).dispose();
        }
      }
    });
    
    if (grid.parent) {
      grid.parent.remove(grid);
    }
  }
} 