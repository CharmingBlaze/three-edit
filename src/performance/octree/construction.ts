import { Vector3, Box3 } from 'three';
import { EditableMesh, Vertex, Face } from '../../core/index.ts';
import { OctreeNode, OctreeOptions, BoundingBox } from './types';

/**
 * Build octree from mesh
 */
export function buildOctree(mesh: EditableMesh, options: OctreeOptions): OctreeNode {
  const bbox = calculateBoundingBox(mesh);
  const center = new Vector3();
  center.addVectors(bbox.min, bbox.max).multiplyScalar(0.5);
  
  const size = Math.max(
    bbox.max.x - bbox.min.x,
    bbox.max.y - bbox.min.y,
    bbox.max.z - bbox.min.z
  );

  const root: OctreeNode = {
    center,
    size,
    children: [],
    vertices: [],
    faces: [],
    isLeaf: true,
    maxDepth: options.maxDepth ?? 8,
    currentDepth: 0
  };

  insertMeshData(root, mesh, options);
  return root;
}

/**
 * Insert mesh data into octree node
 */
export function insertMeshData(
  node: OctreeNode,
  mesh: EditableMesh,
  options: OctreeOptions
): void {
  // Insert vertices
  for (const vertex of mesh.vertices) {
    if (isPointInNode(node, vertex)) {
      node.vertices.push(vertex);
    }
  }

  // Insert faces
  if (options.enableFaceIndexing) {
    for (const face of mesh.faces) {
      if (isFaceInNode(node, face)) {
        node.faces.push(face);
      }
    }
  }

  // Subdivide if necessary
  if (shouldSubdivide(node, options)) {
    subdivide(node, mesh, options);
  }
}

/**
 * Check if point is within node bounds
 */
export function isPointInNode(node: OctreeNode, vertex: Vertex): boolean {
  const halfSize = node.size / 2;
  return (
    Math.abs(vertex.x - node.center.x) <= halfSize &&
    Math.abs(vertex.y - node.center.y) <= halfSize &&
    Math.abs(vertex.z - node.center.z) <= halfSize
  );
}

/**
 * Check if face is within node bounds
 */
export function isFaceInNode(node: OctreeNode, face: Face): boolean {
  const faceBbox = calculateFaceBoundingBox(face);
  const nodeBbox: BoundingBox = {
    min: new Vector3(
      node.center.x - node.size / 2,
      node.center.y - node.size / 2,
      node.center.z - node.size / 2
    ),
    max: new Vector3(
      node.center.x + node.size / 2,
      node.center.y + node.size / 2,
      node.center.z + node.size / 2
    )
  };

  return boundingBoxesOverlap(faceBbox, nodeBbox);
}

/**
 * Determine if node should be subdivided
 */
export function shouldSubdivide(node: OctreeNode, options: OctreeOptions): boolean {
  return (
    node.currentDepth < node.maxDepth &&
    node.size > (options.minNodeSize ?? 0.1) &&
    (node.vertices.length + node.faces.length) > (options.maxObjectsPerNode ?? 10)
  );
}

/**
 * Subdivide octree node
 */
export function subdivide(
  node: OctreeNode,
  mesh: EditableMesh,
  options: OctreeOptions
): void {
  const halfSize = node.size / 2;
  const quarterSize = node.size / 4;

  // Create 8 children
  for (let x = -1; x <= 1; x += 2) {
    for (let y = -1; y <= 1; y += 2) {
      for (let z = -1; z <= 1; z += 2) {
        const childCenter = new Vector3(
          node.center.x + x * quarterSize,
          node.center.y + y * quarterSize,
          node.center.z + z * quarterSize
        );

        const child: OctreeNode = {
          center: childCenter,
          size: halfSize,
          children: [],
          vertices: [],
          faces: [],
          isLeaf: true,
          maxDepth: node.maxDepth,
          currentDepth: node.currentDepth + 1
        };

        node.children.push(child);
      }
    }
  }

  node.isLeaf = false;
  redistributeData(node, mesh, options);
}

/**
 * Redistribute data to children
 */
export function redistributeData(
  node: OctreeNode,
  mesh: EditableMesh,
  options: OctreeOptions
): void {
  // Redistribute vertices
  for (const vertex of node.vertices) {
    for (const child of node.children) {
      if (isPointInNode(child, vertex)) {
        child.vertices.push(vertex);
      }
    }
  }

  // Redistribute faces
  if (options.enableFaceIndexing) {
    for (const face of node.faces) {
      for (const child of node.children) {
        if (isFaceInNode(child, face)) {
          child.faces.push(face);
        }
      }
    }
  }

  // Clear parent data
  node.vertices = [];
  node.faces = [];

  // Recursively subdivide children if necessary
  for (const child of node.children) {
    if (shouldSubdivide(child, options)) {
      subdivide(child, mesh, options);
    }
  }
}

/**
 * Calculate bounding box for mesh
 */
export function calculateBoundingBox(mesh: EditableMesh): Box3 {
  const bbox = new Box3();
  
  for (const vertex of mesh.vertices) {
    bbox.expandByPoint(new Vector3(vertex.x, vertex.y, vertex.z));
  }
  
  return bbox;
}

/**
 * Calculate bounding box for face
 */
export function calculateFaceBoundingBox(face: Face): BoundingBox {
  const min = new Vector3(Infinity, Infinity, Infinity);
  const max = new Vector3(-Infinity, -Infinity, -Infinity);

  // Calculate bounding box from face vertices
  for (const _vertexIndex of face.vertices) {
    // This would need access to the mesh to get vertex positions
    // For now, return a default bounding box
    min.set(-1, -1, -1);
    max.set(1, 1, 1);
    break;
  }

  return { min, max };
}

/**
 * Calculate face center
 */
export function calculateFaceCenter(_face: Face): Vector3 {
  // Calculate center from face vertices
  const center = new Vector3(0, 0, 0);
  
  // This would need access to the mesh to get vertex positions
  // For now, return origin
  return center;
}

/**
 * Check if bounding boxes overlap
 */
export function boundingBoxesOverlap(
  bbox1: BoundingBox,
  bbox2: BoundingBox
): boolean {
  return (
    bbox1.min.x <= bbox2.max.x &&
    bbox1.max.x >= bbox2.min.x &&
    bbox1.min.y <= bbox2.max.y &&
    bbox1.max.y >= bbox2.min.y &&
    bbox1.min.z <= bbox2.max.z &&
    bbox1.max.z >= bbox2.min.z
  );
} 