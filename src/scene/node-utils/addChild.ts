import { SceneNode } from '../SceneNode';

export interface AddChildOptions {
  validateCycles?: boolean;
  updateTransforms?: boolean;
}

/**
 * Safely add a child node to a parent node
 */
export function addChild(
  parent: SceneNode,
  child: SceneNode,
  options: AddChildOptions = {}
): boolean {
  const {
    validateCycles = true,
    updateTransforms = true
  } = options;

  // Validate inputs
  if (!parent || !child) {
    return false;
  }

  // Check for self-reference
  if (parent === child) {
    throw new Error('Cannot add node as its own child');
  }

  // Check for cycles if validation is enabled
  if (validateCycles && child.isDescendantOf(parent)) {
    throw new Error('Adding child would create a cycle in the scene graph');
  }

  // Check if already a child
  if (child.parent === parent) {
    return true; // Already a child
  }

  // Remove from previous parent
  if (child.parent) {
    child.parent.removeChild(child.id);
  }

  // Add to new parent
  parent.addChild(child);

  return true;
}

/**
 * Add multiple children to a parent node
 */
export function addChildren(
  parent: SceneNode,
  children: SceneNode[],
  options: AddChildOptions = {}
): boolean[] {
  return children.map(child => addChild(parent, child, options));
} 