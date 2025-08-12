/**
 * AxisHelper - XYZ axis lines/arrows
 * Provides world coordinate system visualization
 */

import * as THREE from 'three';

export interface AxisHelperOptions {
  size?: number;
  xColor?: number;
  yColor?: number;
  zColor?: number;
  opacity?: number;
  visible?: boolean;
  showLabels?: boolean;
  showArrows?: boolean;
}

const DEFAULT_OPTIONS: Required<AxisHelperOptions> = {
  size: 5,
  xColor: 0xff0000,
  yColor: 0x00ff00,
  zColor: 0x0000ff,
  opacity: 1.0,
  visible: true,
  showLabels: true,
  showArrows: true
};

/**
 * Create an XYZ axis helper
 */
export function AxisHelper(options: AxisHelperOptions = {}): THREE.Group {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { type: 'axis-helper', options: opts };
  
  // Create axis lines
  const axisGeometry = new THREE.BufferGeometry();
  const axisPositions: number[] = [];
  const axisColors: number[] = [];
  
  // X axis (red)
  axisPositions.push(0, 0, 0, opts.size, 0, 0);
  axisColors.push(opts.xColor, opts.xColor);
  
  // Y axis (green)
  axisPositions.push(0, 0, 0, 0, opts.size, 0);
  axisColors.push(opts.yColor, opts.yColor);
  
  // Z axis (blue)
  axisPositions.push(0, 0, 0, 0, 0, opts.size);
  axisColors.push(opts.zColor, opts.zColor);
  
  axisGeometry.setAttribute('position', new THREE.Float32BufferAttribute(axisPositions, 3));
  axisGeometry.setAttribute('color', new THREE.Float32BufferAttribute(axisColors, 3));
  
  const axisMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: opts.opacity
  });
  
  const axisLines = new THREE.LineSegments(axisGeometry, axisMaterial);
  group.add(axisLines);
  
  // Add arrow heads if requested
  if (opts.showArrows) {
    const arrowLength = opts.size * 0.2;
    const arrowHeadLength = opts.size * 0.1;
    
    // X arrow
    const xArrow = createArrow(opts.xColor, arrowLength, arrowHeadLength);
    xArrow.rotation.z = -Math.PI / 2;
    xArrow.position.x = opts.size;
    group.add(xArrow);
    
    // Y arrow
    const yArrow = createArrow(opts.yColor, arrowLength, arrowHeadLength);
    yArrow.position.y = opts.size;
    group.add(yArrow);
    
    // Z arrow
    const zArrow = createArrow(opts.zColor, arrowLength, arrowHeadLength);
    zArrow.rotation.x = Math.PI / 2;
    zArrow.position.z = opts.size;
    group.add(zArrow);
  }
  
  // Add labels if requested
  if (opts.showLabels) {
    const labelOffset = opts.size * 1.1;
    
    // X label
    const xLabel = createTextLabel('X', opts.xColor);
    xLabel.position.set(labelOffset, 0, 0);
    group.add(xLabel);
    
    // Y label
    const yLabel = createTextLabel('Y', opts.yColor);
    yLabel.position.set(0, labelOffset, 0);
    group.add(yLabel);
    
    // Z label
    const zLabel = createTextLabel('Z', opts.zColor);
    zLabel.position.set(0, 0, labelOffset);
    group.add(zLabel);
  }
  
  group.visible = opts.visible;
  
  return group;
}

/**
 * Create a simple arrow geometry
 */
function createArrow(color: number, length: number, headLength: number): THREE.Mesh {
  const arrowGeometry = new THREE.ConeGeometry(headLength * 0.5, headLength, 8);
  const arrowMaterial = new THREE.MeshBasicMaterial({ color });
  return new THREE.Mesh(arrowGeometry, arrowMaterial);
}

/**
 * Create a simple text label
 */
function createTextLabel(text: string, color: number): THREE.Mesh {
  // Simple cube as placeholder for text
  const labelGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const labelMaterial = new THREE.MeshBasicMaterial({ color });
  const label = new THREE.Mesh(labelGeometry, labelMaterial);
  
  // In a real implementation, you'd use TextGeometry or HTML overlay
  label.userData = { text, type: 'axis-label' };
  
  return label;
}

/**
 * Create a mini axis helper for viewport corners
 */
export function MiniAxisHelper(size: number = 1): THREE.Group {
  return AxisHelper({
    size,
    showLabels: false,
    showArrows: false,
    opacity: 0.7
  });
} 