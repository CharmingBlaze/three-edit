import { SceneNode } from '../SceneNode';
import { SceneGraph } from '../SceneGraph';

export interface FindNodeOptions {
  searchRoot?: SceneNode;
  includeInvisible?: boolean;
}

/**
 * Find a node by ID in a scene graph or subtree
 */
export function findNodeById(
  sceneGraph: SceneGraph | SceneNode,
  nodeId: string,
  options: FindNodeOptions = {}
): SceneNode | null {
  const {
    searchRoot,
    includeInvisible = true
  } = options;

  // If it's a SceneGraph, use its findNode method
  if ('findNode' in sceneGraph) {
    return sceneGraph.findNode(nodeId);
  }

  // Otherwise, search in the subtree
  if (searchRoot) {
    const root = searchRoot;
    // Quick check if the root is the target
    if (root.id === nodeId) {
      return includeInvisible || root.visible ? root : null;
    }
    // Recursive search
    return _findNodeByIdRecursive(root, nodeId, includeInvisible);
  } else {
    const root = sceneGraph as SceneNode;
    // Quick check if the root is the target
    if (root.id === nodeId) {
      return includeInvisible || root.visible ? root : null;
    }
    // Recursive search
    return _findNodeByIdRecursive(root, nodeId, includeInvisible);
  }
}

/**
 * Find multiple nodes by their IDs
 */
export function findNodesByIds(
  sceneGraph: SceneGraph | SceneNode,
  nodeIds: string[],
  options: FindNodeOptions = {}
): SceneNode[] {
  const found: SceneNode[] = [];
  
  for (const nodeId of nodeIds) {
    const node = findNodeById(sceneGraph, nodeId, options);
    if (node) {
      found.push(node);
    }
  }

  return found;
}

/**
 * Find all nodes that match a predicate function
 */
export function findNodesByPredicate(
  sceneGraph: SceneGraph | SceneNode,
  predicate: (node: SceneNode) => boolean,
  options: FindNodeOptions = {}
): SceneNode[] {
  const {
    searchRoot,
    includeInvisible = true
  } = options;

  const root = searchRoot || (sceneGraph as SceneNode);
  const results: SceneNode[] = [];

  _traverseAndCollect(root, (node) => {
    if (predicate(node) && (includeInvisible || node.visible)) {
      results.push(node);
    }
  });

  return results;
}

/**
 * Find the closest ancestor that matches a predicate
 */
export function findClosestAncestor(
  node: SceneNode,
  predicate: (node: SceneNode) => boolean
): SceneNode | null {
  let current: SceneNode | null = node.parent;
  
  while (current) {
    if (predicate(current)) {
      return current;
    }
    current = current.parent;
  }

  return null;
}

/**
 * Find the path from root to a specific node
 */
export function findNodePath(
  sceneGraph: SceneGraph | SceneNode,
  nodeId: string,
  options: FindNodeOptions = {}
): SceneNode[] {
  const node = findNodeById(sceneGraph, nodeId, options);
  if (!node) {
    return [];
  }

  const path: SceneNode[] = [];
  let current: SceneNode | null = node;

  while (current) {
    path.unshift(current);
    current = current.parent;
  }

  return path;
}

/**
 * Recursive helper to find a node by ID
 */
function _findNodeByIdRecursive(
  node: SceneNode,
  nodeId: string,
  includeInvisible: boolean
): SceneNode | null {
  // Check children
  for (const child of node.children) {
    if (child.id === nodeId) {
      return includeInvisible || child.visible ? child : null;
    }
    
    const found = _findNodeByIdRecursive(child, nodeId, includeInvisible);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Traverse and collect nodes that match a predicate
 */
function _traverseAndCollect(
  node: SceneNode,
  callback: (node: SceneNode) => void
): void {
  callback(node);
  
  for (const child of node.children) {
    _traverseAndCollect(child, callback);
  }
} 