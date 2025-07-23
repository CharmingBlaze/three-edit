/**
 * Scene Graph System for three-edit
 * 
 * Provides hierarchical parent-child relationships between 3D objects
 * with transform inheritance, mesh binding, and graph traversal utilities.
 */

// Core classes
export { SceneNode, type SceneNodeParams } from './SceneNode';
export { SceneGraph, type SceneGraphConfig } from './SceneGraph';

// Node utilities
export { addChild, addChildren, type AddChildOptions } from './node-utils/addChild';
export { removeChild, removeChildren, removeAllChildren, type RemoveChildOptions } from './node-utils/removeChild';
export { 
  findNodeById, 
  findNodesByIds, 
  findNodesByPredicate, 
  findClosestAncestor, 
  findNodePath,
  type FindNodeOptions 
} from './node-utils/findNodeById';

// Traversal utilities
export { 
  traverse, 
  collectNodes, 
  findFirstNode, 
  getLeafNodes, 
  getNodesAtDepth, 
  getMaxDepth,
  type TraverseOptions,
  type TraversalOrder 
} from './node-utils/traverse';

// Flattening utilities
export { 
  flattenScene, 
  flattenMeshes, 
  createFlatHierarchy, 
  getHierarchyTree, 
  getFlattenStats,
  type FlattenOptions,
  type FlattenedNode 
} from './node-utils/flattenScene';

// Three.js integration
export { 
  toThreeScene, 
  nodeToThreeObject, 
  nodesToThreeObjects, 
  createDefaultMaterialFactory,
  type ToThreeSceneOptions 
} from './toThreeScene';

// Re-export Three.js types for convenience
export type { Matrix4, Vector3, Quaternion, Euler } from 'three'; 