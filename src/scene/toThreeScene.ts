import { Scene, Object3D, Mesh, Group } from 'three';
import { SceneGraph, SceneNode } from './index';
import { EditableMesh } from '../core/EditableMesh';
import { toBufferGeometry } from '../conversion/toBufferGeometry';

export interface ToThreeSceneOptions {
  includeInvisible?: boolean;
  preserveTransforms?: boolean;
  createGroups?: boolean;
  materialFactory?: (mesh: EditableMesh) => any; // THREE.Material
}

/**
 * Convert a SceneGraph to a Three.js Scene
 */
export function toThreeScene(
  sceneGraph: SceneGraph,
  options: ToThreeSceneOptions = {}
): Scene {
  const {
    includeInvisible = false,
    preserveTransforms = true,
    createGroups = true,
    materialFactory
  } = options;

  const threeScene = new Scene();
  const rootObject = _convertNodeToThree(
    sceneGraph.root,
    {
      includeInvisible,
      preserveTransforms,
      createGroups,
      materialFactory: materialFactory || (() => undefined)
    }
  );

  threeScene.add(rootObject);
  return threeScene;
}

/**
 * Convert a SceneNode to a Three.js Object3D
 */
export function nodeToThreeObject(
  node: SceneNode,
  options: ToThreeSceneOptions = {}
): Object3D {
  const defaultOptions: Required<ToThreeSceneOptions> = {
    includeInvisible: false,
    preserveTransforms: true,
    createGroups: true,
    materialFactory: () => undefined
  };
  
  return _convertNodeToThree(node, { ...defaultOptions, ...options });
}

/**
 * Convert multiple SceneNodes to Three.js Object3D array
 */
export function nodesToThreeObjects(
  nodes: SceneNode[],
  options: ToThreeSceneOptions = {}
): Object3D[] {
  const defaultOptions: Required<ToThreeSceneOptions> = {
    includeInvisible: false,
    preserveTransforms: true,
    createGroups: true,
    materialFactory: () => undefined
  };
  
  return nodes.map(node => _convertNodeToThree(node, { ...defaultOptions, ...options }));
}

/**
 * Internal function to convert a node to Three.js object
 */
function _convertNodeToThree(
  node: SceneNode,
  options: Required<ToThreeSceneOptions>
): Object3D {
  const { includeInvisible, preserveTransforms, createGroups, materialFactory } = options;

  // Skip invisible nodes if not including them
  if (!includeInvisible && !node.visible) {
    return new Group(); // Return empty group
  }

  let threeObject: Object3D;

  // Create appropriate Three.js object based on node content
  if (node.mesh) {
    // Node has a mesh - create a Mesh object
    const geometry = toBufferGeometry(node.mesh);
    const material = materialFactory ? materialFactory(node.mesh) : undefined;
    
    if (material) {
      threeObject = new Mesh(geometry, material);
    } else {
      // Create a group if no material is provided
      threeObject = new Group();
    }
  } else if (node.children.length > 0 && createGroups) {
    // Node has children - create a Group
    threeObject = new Group();
  } else {
    // Empty node - create a Group
    threeObject = new Group();
  }

  // Set transform
  if (preserveTransforms) {
    threeObject.matrix.copy(node.getWorldMatrix());
    threeObject.matrixAutoUpdate = false;
  } else {
    threeObject.matrix.copy(node.transform);
    threeObject.matrixAutoUpdate = false;
  }

  // Set properties
  threeObject.name = node.name;
  threeObject.visible = node.visible;
  threeObject.userData = { ...node.userData };

  // Add children
  for (const child of node.children) {
    const childObject = _convertNodeToThree(child, options);
    if (childObject.children.length > 0 || childObject.type !== 'Group') {
      threeObject.add(childObject);
    }
  }

  return threeObject;
}

/**
 * Create a default material factory
 */
export function createDefaultMaterialFactory(): (mesh: EditableMesh) => any {
  return (mesh: EditableMesh) => {
    // Return a basic material - this can be customized
    return {
      color: 0x888888,
      side: 2, // THREE.DoubleSide
      transparent: false,
      opacity: 1.0
    };
  };
} 