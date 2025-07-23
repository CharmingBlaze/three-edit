import { SceneNode } from './SceneNode';

export interface SceneGraphConfig {
  name?: string;
  autoUpdate?: boolean;
}

/**
 * Manages all nodes and provides graph traversal and manipulation
 */
export class SceneGraph {
  readonly id: string;
  name: string;
  root: SceneNode;
  private _nodes: Map<string, SceneNode>;
  private _autoUpdate: boolean;

  constructor(options: SceneGraphConfig = {}) {
    this.id = crypto.randomUUID();
    this.name = options.name ?? `SceneGraph_${this.id.slice(0, 8)}`;
    this.root = new SceneNode({ name: 'Root' });
    this._nodes = new Map();
    this._autoUpdate = options.autoUpdate ?? true;
    
    // Register root node
    this._nodes.set(this.root.id, this.root);
  }

  /**
   * Find a node by ID
   */
  findNode(id: string): SceneNode | null {
    return this._nodes.get(id) ?? null;
  }

  /**
   * Find a node by name (recursive search)
   */
  findNodeByName(name: string): SceneNode | null {
    return this.root.findChildByName(name);
  }

  /**
   * Find all nodes with a specific tag
   */
  findNodesByTag(tag: string): SceneNode[] {
    return this.root.findChildrenByTag(tag);
  }

  /**
   * Add a node to the scene graph
   */
  addNode(node: SceneNode, parentId?: string): void {
    if (this._nodes.has(node.id)) {
      throw new Error(`Node with ID ${node.id} already exists in scene graph`);
    }

    // Register the node
    this._nodes.set(node.id, node);

    // Add to parent or root
    const parent = parentId ? this.findNode(parentId) : this.root;
    if (!parent) {
      throw new Error(`Parent node with ID ${parentId} not found`);
    }

    parent.addChild(node);
  }

  /**
   * Remove a node from the scene graph
   */
  removeNode(id: string): boolean {
    const node = this.findNode(id);
    if (!node) {
      return false;
    }

    // Remove from parent
    if (node.parent) {
      node.parent.removeChild(id);
    }

    // Remove all descendants from registry
    this._removeNodeAndDescendants(node);

    return true;
  }

  /**
   * Move a node to a new parent
   */
  moveNode(nodeId: string, newParentId: string): boolean {
    const node = this.findNode(nodeId);
    const newParent = this.findNode(newParentId);

    if (!node || !newParent) {
      return false;
    }

    if (node === newParent || newParent.isDescendantOf(node)) {
      return false; // Would create cycle
    }

    // Remove from current parent
    if (node.parent) {
      node.parent.removeChild(nodeId);
    }

    // Add to new parent
    newParent.addChild(node);
    return true;
  }

  /**
   * Traverse all nodes in the scene graph
   */
  traverse(callback: (node: SceneNode) => void): void {
    this._traverseNode(this.root, callback);
  }

  /**
   * Traverse nodes with a filter function
   */
  traverseWithFilter(
    callback: (node: SceneNode) => void,
    filter: (node: SceneNode) => boolean
  ): void {
    this._traverseNodeWithFilter(this.root, callback, filter);
  }

  /**
   * Get all nodes in the scene graph
   */
  getAllNodes(): SceneNode[] {
    return Array.from(this._nodes.values());
  }

  /**
   * Get all nodes with meshes
   */
  getNodesWithMeshes(): SceneNode[] {
    return this.getAllNodes().filter(node => node.mesh);
  }

  /**
   * Get statistics about the scene graph
   */
  getStatistics(): {
    totalNodes: number;
    nodesWithMeshes: number;
    maxDepth: number;
    averageChildrenPerNode: number;
  } {
    const nodes = this.getAllNodes();
    const nodesWithMeshes = nodes.filter(node => node.mesh).length;
    
    let maxDepth = 0;
    let totalChildren = 0;
    
    for (const node of nodes) {
      maxDepth = Math.max(maxDepth, node.getDepth());
      totalChildren += node.children.length;
    }

    return {
      totalNodes: nodes.length,
      nodesWithMeshes,
      maxDepth,
      averageChildrenPerNode: nodes.length > 0 ? totalChildren / nodes.length : 0
    };
  }

  /**
   * Clear all nodes except the root
   */
  clear(): void {
    const nodesToRemove = this.getAllNodes().filter(node => node !== this.root);
    for (const node of nodesToRemove) {
      this.removeNode(node.id);
    }
  }

  /**
   * Clone the entire scene graph
   */
  clone(): SceneGraph {
    const cloned = new SceneGraph({ name: this.name });
    
    // Clone all nodes except root
    const nodeMap = new Map<string, SceneNode>();
    nodeMap.set(this.root.id, cloned.root);

    this.traverse(node => {
      if (node === this.root) return;

      const clonedNode = node.clone();
      nodeMap.set(node.id, clonedNode);

      // Find and set parent
      if (node.parent && node.parent !== this.root) {
        const clonedParent = nodeMap.get(node.parent.id);
        if (clonedParent) {
          clonedParent.addChild(clonedNode);
        }
      } else {
        cloned.root.addChild(clonedNode);
      }
    });

    return cloned;
  }

  /**
   * Validate the scene graph structure
   */
  validate(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (node: SceneNode): boolean => {
      if (recursionStack.has(node.id)) {
        return true;
      }
      if (visited.has(node.id)) {
        return false;
      }

      visited.add(node.id);
      recursionStack.add(node.id);

      for (const child of node.children) {
        if (hasCycle(child)) {
          return true;
        }
      }

      recursionStack.delete(node.id);
      return false;
    };

    if (hasCycle(this.root)) {
      errors.push('Scene graph contains cycles');
    }

    // Check for orphaned nodes
    const registeredNodes = new Set(this._nodes.keys());
    const reachableNodes = new Set<string>();

    this.traverse(node => {
      reachableNodes.add(node.id);
    });

    for (const nodeId of registeredNodes) {
      if (!reachableNodes.has(nodeId)) {
        errors.push(`Orphaned node found: ${nodeId}`);
      }
    }

    // Check for duplicate names
    const names = new Map<string, string>();
    this.traverse(node => {
      if (names.has(node.name)) {
        warnings.push(`Duplicate node name: ${node.name}`);
      } else {
        names.set(node.name, node.id);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Recursively traverse a node and its children
   */
  private _traverseNode(node: SceneNode, callback: (node: SceneNode) => void): void {
    callback(node);
    for (const child of node.children) {
      this._traverseNode(child, callback);
    }
  }

  /**
   * Recursively traverse a node with a filter
   */
  private _traverseNodeWithFilter(
    node: SceneNode,
    callback: (node: SceneNode) => void,
    filter: (node: SceneNode) => boolean
  ): void {
    if (filter(node)) {
      callback(node);
    }
    for (const child of node.children) {
      this._traverseNodeWithFilter(child, callback, filter);
    }
  }

  /**
   * Remove a node and all its descendants from the registry
   */
  private _removeNodeAndDescendants(node: SceneNode): void {
    // Remove children first
    for (const child of node.children) {
      this._removeNodeAndDescendants(child);
    }

    // Remove this node
    this._nodes.delete(node.id);
  }
} 