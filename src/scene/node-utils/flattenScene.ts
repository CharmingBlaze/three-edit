import { SceneNode } from '../SceneNode';
import { SceneGraph } from '../SceneGraph';

export interface FlattenOptions {
  includeInvisible?: boolean;
  preserveTransforms?: boolean;
  filter?: (node: SceneNode) => boolean;
  maxDepth?: number;
}

interface InternalFlattenOptions {
  includeInvisible: boolean;
  preserveTransforms: boolean;
  filter?: (node: SceneNode) => boolean;
  maxDepth: number;
}

export interface FlattenedNode {
  node: SceneNode;
  depth: number;
  path: string[];
  worldMatrix: any; // Matrix4 from three.js
}

/**
 * Flatten the scene graph into a flat list of nodes
 */
export function flattenScene(
  sceneGraph: SceneGraph | SceneNode,
  options: FlattenOptions = {}
): FlattenedNode[] {
  const {
    includeInvisible = true,
    preserveTransforms = true,
    filter,
    maxDepth = Infinity
  } = options;

  const flattened: FlattenedNode[] = [];
  const root = 'root' in sceneGraph ? sceneGraph.root : sceneGraph;

  _flattenNode(root, [], 0, flattened, {
    includeInvisible,
    preserveTransforms,
    filter,
    maxDepth
  } as InternalFlattenOptions);

  return flattened;
}

/**
 * Flatten and return only nodes with meshes
 */
export function flattenMeshes(
  sceneGraph: SceneGraph | SceneNode,
  options: FlattenOptions = {}
): FlattenedNode[] {
  const meshFilter = (node: SceneNode) => node.mesh !== undefined;
  return flattenScene(sceneGraph, {
    ...options,
    filter: meshFilter
  });
}

/**
 * Create a flat hierarchy where all nodes are direct children of root
 */
export function createFlatHierarchy(
  sceneGraph: SceneGraph | SceneNode,
  options: FlattenOptions = {}
): SceneGraph {
  const flattened = flattenScene(sceneGraph, options);
  const newGraph = new SceneGraph({ name: 'FlattenedScene' });

  const originalRoot = 'root' in sceneGraph ? sceneGraph.root : sceneGraph;
  for (const { node } of flattened) {
    if (node === originalRoot) continue; // Skip the original root

    const clonedNode = node.clone();
    newGraph.addNode(clonedNode);
  }

  return newGraph;
}

/**
 * Get a hierarchical representation as a tree structure
 */
export function getHierarchyTree(
  sceneGraph: SceneGraph | SceneNode,
  options: FlattenOptions = {}
): any {
  const root = 'root' in sceneGraph ? sceneGraph.root : sceneGraph;
  return _buildTree(root, options);
}

/**
 * Get statistics about the flattened scene
 */
export function getFlattenStats(
  sceneGraph: SceneGraph | SceneNode,
  options: FlattenOptions = {}
): {
  totalNodes: number;
  visibleNodes: number;
  nodesWithMeshes: number;
  maxDepth: number;
  averageDepth: number;
} {
  const flattened = flattenScene(sceneGraph, options);
  const visibleNodes = flattened.filter(f => f.node.visible).length;
  const nodesWithMeshes = flattened.filter(f => f.node.mesh).length;
  const maxDepth = Math.max(...flattened.map(f => f.depth));
  const averageDepth = flattened.length > 0 
    ? flattened.reduce((sum, f) => sum + f.depth, 0) / flattened.length 
    : 0;

  return {
    totalNodes: flattened.length,
    visibleNodes,
    nodesWithMeshes,
    maxDepth,
    averageDepth
  };
}

/**
 * Recursively flatten a node and its children
 */
function _flattenNode(
  node: SceneNode,
  path: string[],
  depth: number,
  flattened: FlattenedNode[],
  options: InternalFlattenOptions
): void {
  const { includeInvisible, preserveTransforms, filter, maxDepth } = options;

  if (depth > maxDepth) return;
  if (!includeInvisible && !node.visible) return;

  const currentPath = [...path, node.name];
  
  // Only add to flattened array if node passes the filter
  if (!filter || filter(node)) {
    flattened.push({
      node,
      depth,
      path: currentPath,
      worldMatrix: preserveTransforms ? node.getWorldMatrix() : node.transform
    });
  }

  // Always traverse children, regardless of filter
  for (const child of node.children) {
    _flattenNode(child, currentPath, depth + 1, flattened, options);
  }
}

/**
 * Build a tree representation of the hierarchy
 */
function _buildTree(
  node: SceneNode,
  options: FlattenOptions
): any {
  const { includeInvisible = true, filter, maxDepth = Infinity } = options;
  
  if (!includeInvisible && !node.visible) return null;
  if (filter && !filter(node)) return null;

  const tree: any = {
    id: node.id,
    name: node.name,
    hasMesh: node.mesh !== undefined,
    visible: node.visible,
    tags: node.tags,
    depth: node.getDepth(),
    children: []
  };

  if (tree.depth < maxDepth) {
    for (const child of node.children) {
      const childTree = _buildTree(child, options);
      if (childTree) {
        tree.children.push(childTree);
      }
    }
  }

  return tree;
} 