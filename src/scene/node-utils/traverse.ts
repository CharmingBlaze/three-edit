import { SceneNode } from '../SceneNode';
import { SceneGraph } from '../SceneGraph';

export type TraversalOrder = 'preorder' | 'postorder' | 'breadth-first';

export interface TraverseOptions {
  order?: TraversalOrder;
  includeInvisible?: boolean;
  maxDepth?: number;
  filter?: (node: SceneNode) => boolean;
}

interface InternalTraverseOptions {
  includeInvisible: boolean;
  maxDepth: number;
  filter?: (node: SceneNode) => boolean;
}

/**
 * Traverse the scene graph with various strategies
 */
export function traverse(
  sceneGraph: SceneGraph | SceneNode,
  callback: (node: SceneNode, depth: number) => void,
  options: TraverseOptions = {}
): void {
  const {
    order = 'preorder',
    includeInvisible = true,
    maxDepth = Infinity,
    filter
  } = options;

  const root = 'root' in sceneGraph ? sceneGraph.root : sceneGraph;

  const internalOptions: InternalTraverseOptions = { includeInvisible, maxDepth, filter };
  
  switch (order) {
    case 'preorder':
      _traversePreorder(root, callback, 0, internalOptions);
      break;
    case 'postorder':
      _traversePostorder(root, callback, 0, internalOptions);
      break;
    case 'breadth-first':
      _traverseBreadthFirst(root, callback, internalOptions);
      break;
  }
}

/**
 * Collect all nodes that match a predicate
 */
export function collectNodes(
  sceneGraph: SceneGraph | SceneNode,
  predicate: (node: SceneNode) => boolean,
  options: TraverseOptions = {}
): SceneNode[] {
  const nodes: SceneNode[] = [];
  
  traverse(sceneGraph, (node) => {
    if (predicate(node)) {
      nodes.push(node);
    }
  }, { ...options, filter: predicate });

  return nodes;
}

/**
 * Find the first node that matches a predicate
 */
export function findFirstNode(
  sceneGraph: SceneGraph | SceneNode,
  predicate: (node: SceneNode) => boolean,
  options: TraverseOptions = {}
): SceneNode | null {
  let found: SceneNode | null = null;
  
  traverse(sceneGraph, (node) => {
    if (!found && predicate(node)) {
      found = node;
    }
  }, { ...options, filter: predicate });

  return found;
}

/**
 * Get all leaf nodes (nodes with no children)
 */
export function getLeafNodes(
  sceneGraph: SceneGraph | SceneNode,
  options: TraverseOptions = {}
): SceneNode[] {
  return collectNodes(sceneGraph, (node) => node.children.length === 0, options);
}

/**
 * Get all nodes at a specific depth
 */
export function getNodesAtDepth(
  sceneGraph: SceneGraph | SceneNode,
  targetDepth: number,
  options: TraverseOptions = {}
): SceneNode[] {
  return collectNodes(sceneGraph, (node) => {
    const depth = node.getDepth();
    return depth === targetDepth;
  }, options);
}

/**
 * Get the maximum depth of the scene graph
 */
export function getMaxDepth(
  sceneGraph: SceneGraph | SceneNode,
  options: TraverseOptions = {}
): number {
  let maxDepth = 0;
  
  traverse(sceneGraph, (node, depth) => {
    maxDepth = Math.max(maxDepth, depth);
  }, options);

  return maxDepth;
}

/**
 * Preorder traversal (parent before children)
 */
function _traversePreorder(
  node: SceneNode,
  callback: (node: SceneNode, depth: number) => void,
  depth: number,
  options: InternalTraverseOptions
): void {
  const { includeInvisible, maxDepth, filter } = options;

  if (depth > maxDepth) return;
  if (!includeInvisible && !node.visible) return;
  if (filter && !filter(node)) return;

  callback(node, depth);

  for (const child of node.children) {
    _traversePreorder(child, callback, depth + 1, options);
  }
}

/**
 * Postorder traversal (children before parent)
 */
function _traversePostorder(
  node: SceneNode,
  callback: (node: SceneNode, depth: number) => void,
  depth: number,
  options: InternalTraverseOptions
): void {
  const { includeInvisible, maxDepth, filter } = options;

  if (depth > maxDepth) return;
  if (!includeInvisible && !node.visible) return;
  if (filter && !filter(node)) return;

  for (const child of node.children) {
    _traversePostorder(child, callback, depth + 1, options);
  }

  callback(node, depth);
}

/**
 * Breadth-first traversal (level by level)
 */
function _traverseBreadthFirst(
  root: SceneNode,
  callback: (node: SceneNode, depth: number) => void,
  options: InternalTraverseOptions
): void {
  const { includeInvisible, maxDepth, filter } = options;
  const queue: Array<{ node: SceneNode; depth: number }> = [{ node: root, depth: 0 }];

  while (queue.length > 0) {
    const { node, depth } = queue.shift()!;

    if (depth > maxDepth) continue;
    if (!includeInvisible && !node.visible) continue;
    if (filter && !filter(node)) continue;

    callback(node, depth);

    for (const child of node.children) {
      queue.push({ node: child, depth: depth + 1 });
    }
  }
} 