/**
 * BoundingBoxHelper - Shows bounding box
 * Visualizes the bounding box of objects or selections
 */

import * as THREE from 'three';

export interface BoundingBoxHelperOptions {
  color?: number;
  opacity?: number;
  lineWidth?: number;
  dashed?: boolean;
  dashSize?: number;
  gapSize?: number;
  showCenter?: boolean;
  centerColor?: number;
  centerSize?: number;
}

const DEFAULT_OPTIONS: Required<BoundingBoxHelperOptions> = {
  color: 0x00ff00,
  opacity: 0.8,
  lineWidth: 1,
  dashed: false,
  dashSize: 0.1,
  gapSize: 0.05,
  showCenter: true,
  centerColor: 0xff0000,
  centerSize: 0.1
};

/**
 * Create a bounding box helper
 */
export function BoundingBoxHelper(
  boundingBox: THREE.Box3,
  options: BoundingBoxHelperOptions = {}
): THREE.Group {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const group = new THREE.Group();
  group.userData = { type: 'bounding-box-helper', options: opts };
  
  // Create box wireframe
  const boxGeometry = new THREE.BoxGeometry(
    boundingBox.max.x - boundingBox.min.x,
    boundingBox.max.y - boundingBox.min.y,
    boundingBox.max.z - boundingBox.min.z
  );
  
  let material: THREE.LineBasicMaterial | THREE.LineDashedMaterial;
  
  if (opts.dashed) {
    material = new THREE.LineDashedMaterial({
      color: opts.color,
      transparent: true,
      opacity: opts.opacity,
      dashSize: opts.dashSize,
      gapSize: opts.gapSize
    });
  } else {
    material = new THREE.LineBasicMaterial({
      color: opts.color,
      transparent: true,
      opacity: opts.opacity
    });
  }
  
  const wireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(boxGeometry),
    material
  );
  
  if (opts.dashed) {
    wireframe.computeLineDistances();
  }
  
  // Position at center of bounding box
  const center = boundingBox.getCenter(new THREE.Vector3());
  wireframe.position.copy(center);
  
  group.add(wireframe);
  
  // Add center point if requested
  if (opts.showCenter) {
    const centerGeometry = new THREE.SphereGeometry(opts.centerSize, 8, 6);
    const centerMaterial = new THREE.MeshBasicMaterial({
      color: opts.centerColor,
      transparent: true,
      opacity: opts.opacity
    });
    
    const centerMesh = new THREE.Mesh(centerGeometry, centerMaterial);
    centerMesh.position.copy(center);
    group.add(centerMesh);
  }
  
  return group;
}

/**
 * Create bounding box helper from mesh
 */
export function createMeshBoundingBoxHelper(
  mesh: THREE.Mesh,
  options: BoundingBoxHelperOptions = {}
): THREE.Group {
  if (!mesh.geometry) {
    return new THREE.Group();
  }
  
  const boundingBox = new THREE.Box3();
  boundingBox.setFromObject(mesh);
  
  return BoundingBoxHelper(boundingBox, options);
}

/**
 * Create bounding box helper from multiple objects
 */
export function createMultiObjectBoundingBoxHelper(
  objects: THREE.Object3D[],
  options: BoundingBoxHelperOptions = {}
): THREE.Group {
  if (objects.length === 0) {
    return new THREE.Group();
  }
  
  const boundingBox = new THREE.Box3();
  
  objects.forEach(obj => {
    obj.updateMatrixWorld(true);
    boundingBox.expandByObject(obj);
  });
  
  return BoundingBoxHelper(boundingBox, options);
}

/**
 * Update bounding box helper
 */
export function updateBoundingBoxHelper(
  helper: THREE.Group,
  boundingBox: THREE.Box3
): void {
  // Clear existing geometry
  helper.clear();
  
  const options = helper.userData.options;
  if (!options) return;
  
  // Recreate with new bounding box
  const newHelper = BoundingBoxHelper(boundingBox, options);
  
  // Copy children from new helper
  while (newHelper.children.length > 0) {
    helper.add(newHelper.children[0]);
  }
}

/**
 * Dispose bounding box helper resources
 */
export function disposeBoundingBoxHelper(helper: THREE.Group): void {
  helper.traverse((child) => {
    if (child instanceof THREE.LineSegments || child instanceof THREE.Mesh) {
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
  helper.clear();
} 