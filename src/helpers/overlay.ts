/**
 * Overlay Helpers - Visual guides, measurement lines, and custom overlays
 * Provides measurement tools, axis indicators, bounding boxes, and visual guides
 */

import * as THREE from 'three';
import { Vector3, Color } from 'three';

/**
 * Overlay configuration options
 */
export interface OverlayOptions {
  color?: number;
  opacity?: number;
  lineWidth?: number;
  dashed?: boolean;
  dashSize?: number;
  gapSize?: number;
  visible?: boolean;
}

/**
 * Measurement line options
 */
export interface MeasurementOptions extends OverlayOptions {
  showDistance?: boolean;
  showAngle?: boolean;
  fontSize?: number;
  textColor?: number;
  precision?: number;
}

/**
 * Axis arrow options
 */
export interface AxisArrowOptions extends OverlayOptions {
  length?: number;
  headLength?: number;
  headWidth?: number;
  showLabels?: boolean;
  labelSize?: number;
}

/**
 * Default overlay options
 */
const DEFAULT_OVERLAY_OPTIONS: Required<OverlayOptions> = {
  color: 0xffffff,
  opacity: 0.8,
  lineWidth: 2,
  dashed: false,
  dashSize: 0.1,
  gapSize: 0.05,
  visible: true
};

/**
 * Default measurement options
 */
const DEFAULT_MEASUREMENT_OPTIONS: Required<MeasurementOptions> = {
  ...DEFAULT_OVERLAY_OPTIONS,
  showDistance: true,
  showAngle: false,
  fontSize: 0.1,
  textColor: 0xffffff,
  precision: 2
};

/**
 * Default axis arrow options
 */
const DEFAULT_AXIS_ARROW_OPTIONS: Required<AxisArrowOptions> = {
  ...DEFAULT_OVERLAY_OPTIONS,
  length: 5,
  headLength: 0.5,
  headWidth: 0.3,
  showLabels: true,
  labelSize: 0.2
};

/**
 * Create a measurement line between two points
 */
export function createMeasurementLine(
  start: Vector3,
  end: Vector3,
  options: MeasurementOptions = {}
): THREE.Group {
  const opts = { ...DEFAULT_MEASUREMENT_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { type: 'measurement-line', start: start.clone(), end: end.clone(), options: opts };
  
  // Create the line
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
  group.add(line);
  
  // Add distance text if enabled
  if (opts.showDistance) {
    const distance = start.distanceTo(end);
    const distanceText = createDistanceText(
      start.clone().lerp(end, 0.5), // Midpoint
      distance,
      opts
    );
    group.add(distanceText);
  }
  
  group.visible = opts.visible;
  
  return group;
}

/**
 * Create distance text sprite
 */
function createDistanceText(
  position: Vector3,
  distance: number,
  options: MeasurementOptions
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  
  canvas.width = 256;
  canvas.height = 64;
  
  const text = `${distance.toFixed(options.precision)}`;
  
  context.fillStyle = `#${options.textColor.toString(16).padStart(6, '0')}`;
  context.font = `${options.fontSize * 100}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: options.opacity,
    depthTest: false
  });
  
  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  sprite.scale.setScalar(options.fontSize);
  
  return sprite;
}

/**
 * Create an angle measurement between three points
 */
export function createAngleMeasurement(
  center: Vector3,
  point1: Vector3,
  point2: Vector3,
  options: MeasurementOptions = {}
): THREE.Group {
  const opts = { ...DEFAULT_MEASUREMENT_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { type: 'angle-measurement', center: center.clone(), point1: point1.clone(), point2: point2.clone(), options: opts };
  
  // Calculate angle
  const v1 = new Vector3().subVectors(point1, center);
  const v2 = new Vector3().subVectors(point2, center);
  const angle = v1.angleTo(v2);
  
  // Create arc geometry
  const radius = Math.min(v1.length(), v2.length()) * 0.3;
  const segments = Math.max(8, Math.round(angle * 10));
  
  const arcGeometry = new THREE.BufferGeometry();
  const arcPositions: number[] = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const currentAngle = t * angle;
    
    // Rotate v1 by current angle
    const rotated = v1.clone().applyAxisAngle(new Vector3().crossVectors(v1, v2).normalize(), currentAngle);
    const point = center.clone().add(rotated.normalize().multiplyScalar(radius));
    
    arcPositions.push(point.x, point.y, point.z);
  }
  
  arcGeometry.setAttribute('position', new THREE.Float32BufferAttribute(arcPositions, 3));
  
  const arcMaterial = new THREE.LineBasicMaterial({
    color: opts.color,
    transparent: true,
    opacity: opts.opacity,
    depthTest: false
  });
  
  const arc = new THREE.Line(arcGeometry, arcMaterial);
  group.add(arc);
  
  // Add angle text
  if (opts.showAngle) {
    const angleText = createAngleText(
      center.clone().add(new Vector3().addVectors(v1, v2).normalize().multiplyScalar(radius * 0.7)),
      angle,
      opts
    );
    group.add(angleText);
  }
  
  group.visible = opts.visible;
  
  return group;
}

/**
 * Create angle text sprite
 */
function createAngleText(
  position: Vector3,
  angle: number,
  options: MeasurementOptions
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  
  canvas.width = 256;
  canvas.height = 64;
  
  const text = `${(angle * 180 / Math.PI).toFixed(options.precision)}°`;
  
  context.fillStyle = `#${options.textColor.toString(16).padStart(6, '0')}`;
  context.font = `${options.fontSize * 100}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: options.opacity,
    depthTest: false
  });
  
  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  sprite.scale.setScalar(options.fontSize);
  
  return sprite;
}

/**
 * Create axis arrows (X, Y, Z)
 */
export function createAxisArrows(
  position: Vector3 = new Vector3(0, 0, 0),
  options: AxisArrowOptions = {}
): THREE.Group {
  const opts = { ...DEFAULT_AXIS_ARROW_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { type: 'axis-arrows', position: position.clone(), options: opts };
  
  // X axis (red)
  const xArrow = createArrow(
    position,
    new Vector3(opts.length, 0, 0),
    0xff0000,
    opts
  );
  group.add(xArrow);
  
  // Y axis (green)
  const yArrow = createArrow(
    position,
    new Vector3(0, opts.length, 0),
    0x00ff00,
    opts
  );
  group.add(yArrow);
  
  // Z axis (blue)
  const zArrow = createArrow(
    position,
    new Vector3(0, 0, opts.length),
    0x0000ff,
    opts
  );
  group.add(zArrow);
  
  // Add labels if enabled
  if (opts.showLabels) {
    const xLabel = createAxisLabel('X', position.clone().add(new Vector3(opts.length + 0.5, 0, 0)), 0xff0000, opts);
    const yLabel = createAxisLabel('Y', position.clone().add(new Vector3(0, opts.length + 0.5, 0)), 0x00ff00, opts);
    const zLabel = createAxisLabel('Z', position.clone().add(new Vector3(0, 0, opts.length + 0.5)), 0x0000ff, opts);
    
    group.add(xLabel);
    group.add(yLabel);
    group.add(zLabel);
  }
  
  group.visible = opts.visible;
  
  return group;
}

/**
 * Create a single arrow
 */
function createArrow(
  start: Vector3,
  direction: Vector3,
  color: number,
  options: AxisArrowOptions
): THREE.Group {
  const group = new THREE.Group();
  
  // Create shaft
  const shaftGeometry = new THREE.CylinderGeometry(0.02, 0.02, options.length, 8);
  const shaftMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: options.opacity,
    depthTest: false
  });
  
  const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
  shaft.position.copy(start).add(direction.clone().multiplyScalar(0.5));
  shaft.lookAt(start.clone().add(direction));
  group.add(shaft);
  
  // Create arrowhead
  const headGeometry = new THREE.ConeGeometry(options.headWidth, options.headLength, 8);
  const headMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: options.opacity,
    depthTest: false
  });
  
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.copy(start).add(direction);
  head.lookAt(start.clone().add(direction));
  group.add(head);
  
  return group;
}

/**
 * Create axis label
 */
function createAxisLabel(
  text: string,
  position: Vector3,
  color: number,
  options: AxisArrowOptions
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  
  canvas.width = 64;
  canvas.height = 64;
  
  context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
  context.font = `${options.labelSize * 100}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: options.opacity,
    depthTest: false
  });
  
  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  sprite.scale.setScalar(options.labelSize);
  
  return sprite;
}

/**
 * Create a selection bounding box
 */
export function createSelectionBoundingBox(
  boundingBox: THREE.Box3,
  options: OverlayOptions = {}
): THREE.LineSegments {
  const opts = { ...DEFAULT_OVERLAY_OPTIONS, ...options };
  
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
  
  // Position at center of bounding box
  const center = new Vector3();
  boundingBox.getCenter(center);
  lineSegments.position.copy(center);
  
  lineSegments.userData = { type: 'selection-bounding-box', boundingBox: boundingBox.clone(), options: opts };
  lineSegments.visible = opts.visible;
  
  return lineSegments;
}

/**
 * Create face normal arrows
 */
export function createFaceNormalArrows(
  faces: { vertices: Vector3[] }[],
  options: OverlayOptions = {}
): THREE.Group {
  const opts = { ...DEFAULT_OVERLAY_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { type: 'face-normal-arrows', options: opts };
  
  faces.forEach(face => {
    if (face.vertices.length >= 3) {
      // Calculate face center
      const center = new Vector3();
      face.vertices.forEach(vertex => center.add(vertex));
      center.divideScalar(face.vertices.length);
      
      // Calculate face normal
      const v1 = new Vector3().subVectors(face.vertices[1], face.vertices[0]);
      const v2 = new Vector3().subVectors(face.vertices[2], face.vertices[0]);
      const normal = new Vector3().crossVectors(v1, v2).normalize();
      
      // Create normal arrow
      const arrow = createArrow(
        center,
        normal.clone().multiplyScalar(0.5),
        opts.color,
        { length: 0.5, headLength: 0.1, headWidth: 0.05, opacity: opts.opacity }
      );
      group.add(arrow);
    }
  });
  
  group.visible = opts.visible;
  
  return group;
}

/**
 * Create a custom overlay line
 */
export function createOverlayLine(
  points: Vector3[],
  options: OverlayOptions = {}
): THREE.Line {
  const opts = { ...DEFAULT_OVERLAY_OPTIONS, ...options };
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
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
  
  line.userData = { type: 'overlay-line', points: points.map(p => p.clone()), options: opts };
  line.visible = opts.visible;
  
  return line;
}

/**
 * Create a custom overlay point
 */
export function createOverlayPoint(
  position: Vector3,
  size: number = 0.1,
  options: OverlayOptions = {}
): THREE.Mesh {
  const opts = { ...DEFAULT_OVERLAY_OPTIONS, ...options };
  
  const geometry = new THREE.SphereGeometry(size, 8, 6);
  const material = new THREE.MeshBasicMaterial({
    color: opts.color,
    transparent: true,
    opacity: opts.opacity,
    depthTest: false
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  
  mesh.userData = { type: 'overlay-point', position: position.clone(), options: opts };
  mesh.visible = opts.visible;
  
  return mesh;
}

/**
 * Update overlay visibility
 */
export function updateOverlayVisibility(
  overlay: THREE.Object3D,
  visible: boolean
): void {
  if (overlay.userData.type && overlay.userData.type.includes('overlay')) {
    overlay.visible = visible;
  }
}

/**
 * Update overlay color
 */
export function updateOverlayColor(
  overlay: THREE.Object3D,
  newColor: number
): void {
  if (overlay.userData.type && overlay.userData.type.includes('overlay')) {
    if (overlay instanceof THREE.Mesh && overlay.material instanceof THREE.Material) {
      (overlay.material as any).color.setHex(newColor);
    } else if (overlay instanceof THREE.Line && overlay.material instanceof THREE.Material) {
      (overlay.material as any).color.setHex(newColor);
    } else if (overlay instanceof THREE.LineSegments && overlay.material instanceof THREE.Material) {
      (overlay.material as any).color.setHex(newColor);
    }
  }
}

/**
 * Dispose of overlay resources
 */
export function disposeOverlay(overlay: THREE.Object3D): void {
  if (overlay.userData.type && overlay.userData.type.includes('overlay')) {
    if (overlay instanceof THREE.Mesh) {
      overlay.geometry.dispose();
      if (Array.isArray(overlay.material)) {
        overlay.material.forEach(material => material.dispose());
      } else {
        overlay.material.dispose();
      }
    } else if (overlay instanceof THREE.Line || overlay instanceof THREE.LineSegments) {
      overlay.geometry.dispose();
      if (overlay.material instanceof THREE.Material) {
        overlay.material.dispose();
      }
    } else if (overlay instanceof THREE.Sprite) {
      if (overlay.material instanceof THREE.SpriteMaterial && overlay.material.map) {
        overlay.material.map.dispose();
      }
      overlay.material.dispose();
    }
    
    if (overlay.parent) {
      overlay.parent.remove(overlay);
    }
  }
}

/**
 * Dispose of multiple overlays
 */
export function disposeOverlays(overlays: THREE.Object3D[]): void {
  overlays.forEach(overlay => disposeOverlay(overlay));
} 