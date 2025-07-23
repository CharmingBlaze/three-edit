import { describe, it, expect, beforeEach } from 'vitest';
import { Matrix4, Vector3, Euler } from 'three';
import { 
  SceneNode, 
  SceneGraph, 
  addChild, 
  removeChild, 
  findNodeById, 
  traverse, 
  flattenScene,
  toThreeScene 
} from '../scene';
import { createCube } from '../primitives/createCube';

describe('Scene Graph System', () => {
  let sceneGraph: SceneGraph;
  let rootNode: SceneNode;

  beforeEach(() => {
    sceneGraph = new SceneGraph({ name: 'TestScene' });
    rootNode = sceneGraph.root;
  });

  describe('SceneNode', () => {
    it('should create a node with default values', () => {
      const node = new SceneNode();
      
      expect(node.id).toBeDefined();
      expect(node.name).toMatch(/^Node_/);
      expect(node.parent).toBeNull();
      expect(node.children).toEqual([]);
      expect(node.transform).toBeInstanceOf(Matrix4);
      expect(node.mesh).toBeUndefined();
      expect(node.visible).toBe(true);
      expect(node.tags).toEqual([]);
    });

    it('should create a node with custom parameters', () => {
      const mesh = createCube();
      const node = new SceneNode({
        name: 'TestNode',
        mesh,
        visible: false,
        tags: ['test', 'cube']
      });

      expect(node.name).toBe('TestNode');
      expect(node.mesh).toBe(mesh);
      expect(node.visible).toBe(false);
      expect(node.tags).toEqual(['test', 'cube']);
    });

    it('should handle parent-child relationships', () => {
      const parent = new SceneNode({ name: 'Parent' });
      const child = new SceneNode({ name: 'Child' });

      parent.addChild(child);

      expect(child.parent).toBe(parent);
      expect(parent.children).toContain(child);
      expect(child.getDepth()).toBe(1);
    });

    it('should prevent self-referencing', () => {
      const node = new SceneNode();
      
      expect(() => node.addChild(node)).toThrow('Cannot add node as its own child');
    });

    it('should handle transform inheritance', () => {
      const parent = new SceneNode({ name: 'Parent' });
      const child = new SceneNode({ name: 'Child' });

      parent.setPosition(new Vector3(1, 2, 3));
      parent.addChild(child);
      child.setPosition(new Vector3(4, 5, 6));

      const childWorldPos = child.getWorldPosition();
      expect(childWorldPos.x).toBeCloseTo(5);
      expect(childWorldPos.y).toBeCloseTo(7);
      expect(childWorldPos.z).toBeCloseTo(9);
    });

    it('should find children by name', () => {
      const parent = new SceneNode({ name: 'Parent' });
      const child1 = new SceneNode({ name: 'Child1' });
      const child2 = new SceneNode({ name: 'Child2' });
      const grandchild = new SceneNode({ name: 'Grandchild' });

      parent.addChild(child1);
      parent.addChild(child2);
      child1.addChild(grandchild);

      expect(parent.findChildByName('Child1')).toBe(child1);
      expect(parent.findChildByName('Grandchild')).toBe(grandchild);
      expect(parent.findChildByName('Nonexistent')).toBeNull();
    });

    it('should find children by tag', () => {
      const parent = new SceneNode({ name: 'Parent' });
      const child1 = new SceneNode({ name: 'Child1', tags: ['test'] });
      const child2 = new SceneNode({ name: 'Child2', tags: ['test', 'special'] });
      const child3 = new SceneNode({ name: 'Child3', tags: ['other'] });

      parent.addChild(child1);
      parent.addChild(child2);
      parent.addChild(child3);

      const testNodes = parent.findChildrenByTag('test');
      expect(testNodes).toHaveLength(2);
      expect(testNodes).toContain(child1);
      expect(testNodes).toContain(child2);
    });
  });

  describe('SceneGraph', () => {
    it('should create a scene graph with root node', () => {
      expect(sceneGraph.root).toBeDefined();
      expect(sceneGraph.root.name).toBe('Root');
      expect(sceneGraph.findNode(sceneGraph.root.id)).toBe(sceneGraph.root);
    });

    it('should add nodes to the scene graph', () => {
      const node = new SceneNode({ name: 'TestNode' });
      sceneGraph.addNode(node);

      expect(sceneGraph.findNode(node.id)).toBe(node);
      expect(sceneGraph.root.children).toContain(node);
    });

    it('should remove nodes from the scene graph', () => {
      const node = new SceneNode({ name: 'TestNode' });
      sceneGraph.addNode(node);

      const removed = sceneGraph.removeNode(node.id);
      expect(removed).toBe(true);
      expect(sceneGraph.findNode(node.id)).toBeNull();
      expect(sceneGraph.root.children).not.toContain(node);
    });

    it('should find nodes by name', () => {
      const node = new SceneNode({ name: 'TestNode' });
      sceneGraph.addNode(node);

      expect(sceneGraph.findNodeByName('TestNode')).toBe(node);
      expect(sceneGraph.findNodeByName('Nonexistent')).toBeNull();
    });

    it('should find nodes by tag', () => {
      const node1 = new SceneNode({ name: 'Node1', tags: ['test'] });
      const node2 = new SceneNode({ name: 'Node2', tags: ['test', 'special'] });
      
      sceneGraph.addNode(node1);
      sceneGraph.addNode(node2);

      const testNodes = sceneGraph.findNodesByTag('test');
      expect(testNodes).toHaveLength(2);
    });

    it('should move nodes between parents', () => {
      const parent1 = new SceneNode({ name: 'Parent1' });
      const parent2 = new SceneNode({ name: 'Parent2' });
      const child = new SceneNode({ name: 'Child' });

      sceneGraph.addNode(parent1);
      sceneGraph.addNode(parent2);
      sceneGraph.addNode(child, parent1.id);

      expect(child.parent).toBe(parent1);

      const moved = sceneGraph.moveNode(child.id, parent2.id);
      expect(moved).toBe(true);
      expect(child.parent).toBe(parent2);
      expect(parent1.children).not.toContain(child);
      expect(parent2.children).toContain(child);
    });

    it('should prevent cycles when moving nodes', () => {
      const parent = new SceneNode({ name: 'Parent' });
      const child = new SceneNode({ name: 'Child' });

      sceneGraph.addNode(parent);
      sceneGraph.addNode(child, parent.id);

      const moved = sceneGraph.moveNode(parent.id, child.id);
      expect(moved).toBe(false); // Would create cycle
    });

    it('should traverse all nodes', () => {
      const node1 = new SceneNode({ name: 'Node1' });
      const node2 = new SceneNode({ name: 'Node2' });
      const node3 = new SceneNode({ name: 'Node3' });

      sceneGraph.addNode(node1);
      sceneGraph.addNode(node2, node1.id);
      sceneGraph.addNode(node3, node2.id);

      const visited: string[] = [];
      sceneGraph.traverse(node => {
        visited.push(node.name);
      });

      expect(visited).toContain('Root');
      expect(visited).toContain('Node1');
      expect(visited).toContain('Node2');
      expect(visited).toContain('Node3');
    });

    it('should get statistics', () => {
      const node1 = new SceneNode({ name: 'Node1', mesh: createCube() });
      const node2 = new SceneNode({ name: 'Node2' });

      sceneGraph.addNode(node1);
      sceneGraph.addNode(node2, node1.id);

      const stats = sceneGraph.getStatistics();
      expect(stats.totalNodes).toBe(3); // Root + 2 nodes
      expect(stats.nodesWithMeshes).toBe(1);
      expect(stats.maxDepth).toBe(2);
    });

    it('should validate scene graph structure', () => {
      const validation = sceneGraph.validate();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Node Utilities', () => {
    it('should safely add children', () => {
      const parent = new SceneNode({ name: 'Parent' });
      const child = new SceneNode({ name: 'Child' });

      const success = addChild(parent, child);
      expect(success).toBe(true);
      expect(child.parent).toBe(parent);
    });

    it('should safely remove children', () => {
      const parent = new SceneNode({ name: 'Parent' });
      const child = new SceneNode({ name: 'Child' });

      parent.addChild(child);
      const removed = removeChild(parent, child.id);
      
      expect(removed).toBe(child);
      expect(child.parent).toBeNull();
      expect(parent.children).not.toContain(child);
    });

    it('should find nodes by ID', () => {
      const node = new SceneNode({ name: 'TestNode' });
      sceneGraph.addNode(node);

      const found = findNodeById(sceneGraph, node.id);
      expect(found).toBe(node);
    });

    it('should traverse with different strategies', () => {
      const node1 = new SceneNode({ name: 'Node1' });
      const node2 = new SceneNode({ name: 'Node2' });

      sceneGraph.addNode(node1);
      sceneGraph.addNode(node2, node1.id);

      const preorder: string[] = [];
      traverse(sceneGraph, (node) => {
        preorder.push(node.name);
      }, { order: 'preorder' });

      expect(preorder[0]).toBe('Root');
      expect(preorder[1]).toBe('Node1');
      expect(preorder[2]).toBe('Node2');
    });
  });

  describe('Flattening', () => {
    it('should flatten scene graph', () => {
      const node1 = new SceneNode({ name: 'Node1' });
      const node2 = new SceneNode({ name: 'Node2' });

      sceneGraph.addNode(node1);
      sceneGraph.addNode(node2, node1.id);

      const flattened = flattenScene(sceneGraph);
      expect(flattened).toHaveLength(3); // Root + 2 nodes
      expect(flattened[0].node.name).toBe('Root');
      expect(flattened[1].node.name).toBe('Node1');
      expect(flattened[2].node.name).toBe('Node2');
    });

    it('should flatten only nodes with meshes', () => {
      const mesh = createCube();
      const node1 = new SceneNode({ name: 'Node1', mesh });
      const node2 = new SceneNode({ name: 'Node2' });

      sceneGraph.addNode(node1);
      sceneGraph.addNode(node2, node1.id);

      const flattened = flattenScene(sceneGraph, { 
        filter: (node) => node.mesh !== undefined 
      });
      expect(flattened).toHaveLength(1);
      expect(flattened[0].node.name).toBe('Node1');
    });
  });

  describe('Three.js Integration', () => {
    it('should convert scene graph to Three.js scene', () => {
      const node = new SceneNode({ name: 'TestNode', mesh: createCube() });
      sceneGraph.addNode(node);

      const threeScene = toThreeScene(sceneGraph);
      expect(threeScene).toBeDefined();
      expect(threeScene.children.length).toBeGreaterThan(0);
    });

    it('should handle nodes without meshes', () => {
      const node = new SceneNode({ name: 'TestNode' });
      sceneGraph.addNode(node);

      const threeScene = toThreeScene(sceneGraph);
      expect(threeScene).toBeDefined();
    });
  });
}); 