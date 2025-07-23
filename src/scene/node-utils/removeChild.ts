import { SceneNode } from '../SceneNode';

export interface RemoveChildOptions {
  preserveChildren?: boolean;
  updateTransforms?: boolean;
}

/**
 * Safely remove a child node from its parent
 */
export function removeChild(
  parent: SceneNode,
  childId: string,
  options: RemoveChildOptions = {}
): SceneNode | null {
  const {
    preserveChildren = false,
    updateTransforms = true
  } = options;

  // Validate inputs
  if (!parent || !childId) {
    return null;
  }

  // Find the child
  const child = parent.children.find(c => c.id === childId);
  if (!child) {
    return null;
  }

  // Handle children if preservation is requested
  if (preserveChildren && child.children.length > 0) {
    // Move all children to the parent
    const childrenToMove = [...child.children];
    for (const grandChild of childrenToMove) {
      parent.addChild(grandChild);
    }
  }

  // Remove the child
  const success = parent.removeChild(childId);
  if (!success) {
    return null;
  }

  return child;
}

/**
 * Remove multiple children from a parent node
 */
export function removeChildren(
  parent: SceneNode,
  childIds: string[],
  options: RemoveChildOptions = {}
): SceneNode[] {
  const removed: SceneNode[] = [];
  
  for (const childId of childIds) {
    const child = removeChild(parent, childId, options);
    if (child) {
      removed.push(child);
    }
  }

  return removed;
}

/**
 * Remove all children from a parent node
 */
export function removeAllChildren(
  parent: SceneNode,
  options: RemoveChildOptions = {}
): SceneNode[] {
  const childIds = parent.children.map(child => child.id);
  return removeChildren(parent, childIds, options);
} 