/**
 * @fileoverview SceneManager Tests
 * Comprehensive tests for the SceneManager class
 */

import { EditableMesh } from '../EditableMesh.js';
import { SceneManager, Scene } from '../scene/SceneManager.js';

describe('SceneManager', () => {
  let sceneManager;

  beforeEach(() => {
    sceneManager = new SceneManager({
      maxScenes: 5,
      autoSave: true,
      validation: true
    });
  });

  afterEach(() => {
    sceneManager = null;
  });

  describe('Constructor', () => {
    test('should create SceneManager with default options', () => {
      const manager = new SceneManager();
      expect(manager.maxScenes).toBe(10);
      expect(manager.autoSave).toBe(false);
      expect(manager.validation).toBe(true);
    });

    test('should create SceneManager with custom options', () => {
      const manager = new SceneManager({
        maxScenes: 20,
        autoSave: true,
        validation: false
      });
      expect(manager.maxScenes).toBe(20);
      expect(manager.autoSave).toBe(true);
      expect(manager.validation).toBe(false);
    });
  });

  describe('Scene Management', () => {
    test('should add scene successfully', () => {
      const scene = sceneManager.addScene('TestScene', {
        description: 'A test scene',
        metadata: { version: '1.0' }
      });

      expect(scene).toBeInstanceOf(Scene);
      expect(scene.getName()).toBe('TestScene');
      expect(scene.getDescription()).toBe('A test scene');
      expect(scene.getMetadata().version).toBe('1.0');
    });

    test('should not add scene when limit reached', () => {
      // Add scenes up to limit
      for (let i = 0; i < 5; i++) {
        sceneManager.addScene(`Scene${i}`);
      }

      const extraScene = sceneManager.addScene('ExtraScene');
      expect(extraScene).toBeNull();
    });

    test('should get scene by ID', () => {
      const addedScene = sceneManager.addScene('TestScene');
      const retrievedScene = sceneManager.getScene(addedScene.getId());

      expect(retrievedScene).toBe(addedScene);
    });

    test('should return null for non-existent scene', () => {
      const scene = sceneManager.getScene('non-existent');
      expect(scene).toBeNull();
    });

    test('should get all scenes', () => {
      sceneManager.addScene('Scene1');
      sceneManager.addScene('Scene2');
      sceneManager.addScene('Scene3');

      const allScenes = sceneManager.getAllScenes();
      expect(allScenes).toHaveLength(3);
    });

    test('should remove scene successfully', () => {
      const scene = sceneManager.addScene('TestScene');
      const sceneId = scene.getId();

      const removed = sceneManager.removeScene(sceneId);
      expect(removed).toBe(true);
      expect(sceneManager.getScene(sceneId)).toBeNull();
    });

    test('should return false when removing non-existent scene', () => {
      const removed = sceneManager.removeScene('non-existent');
      expect(removed).toBe(false);
    });

    test('should check if scene exists', () => {
      const scene = sceneManager.addScene('TestScene');
      const sceneId = scene.getId();

      expect(sceneManager.hasScene(sceneId)).toBe(true);
      expect(sceneManager.hasScene('non-existent')).toBe(false);
    });

    test('should get scene count', () => {
      expect(sceneManager.getSceneCount()).toBe(0);

      sceneManager.addScene('Scene1');
      sceneManager.addScene('Scene2');

      expect(sceneManager.getSceneCount()).toBe(2);
    });
  });

  describe('Scene Operations', () => {
    let scene;

    beforeEach(() => {
      scene = sceneManager.addScene('TestScene');
    });

    test('should add mesh to scene', () => {
      const mesh = new EditableMesh({
        name: 'TestMesh',
        type: 'cube'
      });

      const added = scene.addMesh(mesh);
      expect(added).toBe(true);
      expect(scene.hasMesh(mesh.getId())).toBe(true);
    });

    test('should not add duplicate mesh', () => {
      const mesh = new EditableMesh({
        name: 'TestMesh',
        type: 'cube'
      });

      scene.addMesh(mesh);
      const addedAgain = scene.addMesh(mesh);
      expect(addedAgain).toBe(false);
    });

    test('should remove mesh from scene', () => {
      const mesh = new EditableMesh({
        name: 'TestMesh',
        type: 'cube'
      });

      scene.addMesh(mesh);
      const meshId = mesh.getId();

      const removed = scene.removeMesh(meshId);
      expect(removed).toBe(true);
      expect(scene.hasMesh(meshId)).toBe(false);
    });

    test('should return false when removing non-existent mesh', () => {
      const removed = scene.removeMesh('non-existent');
      expect(removed).toBe(false);
    });

    test('should get mesh by ID', () => {
      const mesh = new EditableMesh({
        name: 'TestMesh',
        type: 'cube'
      });

      scene.addMesh(mesh);
      const retrievedMesh = scene.getMesh(mesh.getId());

      expect(retrievedMesh).toBe(mesh);
    });

    test('should return null for non-existent mesh', () => {
      const mesh = scene.getMesh('non-existent');
      expect(mesh).toBeNull();
    });

    test('should get all meshes in scene', () => {
      const mesh1 = new EditableMesh({ name: 'Mesh1', type: 'cube' });
      const mesh2 = new EditableMesh({ name: 'Mesh2', type: 'sphere' });
      const mesh3 = new EditableMesh({ name: 'Mesh3', type: 'cylinder' });

      scene.addMesh(mesh1);
      scene.addMesh(mesh2);
      scene.addMesh(mesh3);

      const allMeshes = scene.getAllMeshes();
      expect(allMeshes).toHaveLength(3);
      expect(allMeshes).toContain(mesh1);
      expect(allMeshes).toContain(mesh2);
      expect(allMeshes).toContain(mesh3);
    });

    test('should get mesh count', () => {
      expect(scene.getMeshCount()).toBe(0);

      const mesh1 = new EditableMesh({ name: 'Mesh1', type: 'cube' });
      const mesh2 = new EditableMesh({ name: 'Mesh2', type: 'sphere' });

      scene.addMesh(mesh1);
      scene.addMesh(mesh2);

      expect(scene.getMeshCount()).toBe(2);
    });
  });

  describe('Scene Hierarchy', () => {
    let scene;
    let parentMesh, childMesh1, childMesh2;

    beforeEach(() => {
      scene = sceneManager.addScene('TestScene');
      
      parentMesh = new EditableMesh({ name: 'Parent', type: 'cube' });
      childMesh1 = new EditableMesh({ name: 'Child1', type: 'sphere' });
      childMesh2 = new EditableMesh({ name: 'Child2', type: 'cylinder' });

      scene.addMesh(parentMesh);
      scene.addMesh(childMesh1);
      scene.addMesh(childMesh2);
    });

    test('should set parent-child relationship', () => {
      const result = scene.setParent(childMesh1.getId(), parentMesh.getId());
      expect(result).toBe(true);

      const parent = scene.getParent(childMesh1.getId());
      expect(parent).toBe(parentMesh);
    });

    test('should get children of parent', () => {
      scene.setParent(childMesh1.getId(), parentMesh.getId());
      scene.setParent(childMesh2.getId(), parentMesh.getId());

      const children = scene.getChildren(parentMesh.getId());
      expect(children).toHaveLength(2);
      expect(children).toContain(childMesh1);
      expect(children).toContain(childMesh2);
    });

    test('should get parent of child', () => {
      scene.setParent(childMesh1.getId(), parentMesh.getId());

      const parent = scene.getParent(childMesh1.getId());
      expect(parent).toBe(parentMesh);
    });

    test('should return null for mesh without parent', () => {
      const parent = scene.getParent(parentMesh.getId());
      expect(parent).toBeNull();
    });

    test('should return empty array for mesh without children', () => {
      const children = scene.getChildren(childMesh1.getId());
      expect(children).toHaveLength(0);
    });

    test('should remove parent relationship', () => {
      scene.setParent(childMesh1.getId(), parentMesh.getId());
      scene.removeParent(childMesh1.getId());

      const parent = scene.getParent(childMesh1.getId());
      expect(parent).toBeNull();
    });

    test('should handle circular parent relationships', () => {
      // Set up circular relationship
      scene.setParent(childMesh1.getId(), parentMesh.getId());
      const result = scene.setParent(parentMesh.getId(), childMesh1.getId());

      expect(result).toBe(false);
    });
  });

  describe('Scene Properties', () => {
    let scene;

    beforeEach(() => {
      scene = sceneManager.addScene('TestScene');
    });

    test('should set and get scene name', () => {
      scene.setName('UpdatedScene');
      expect(scene.getName()).toBe('UpdatedScene');
    });

    test('should set and get scene description', () => {
      scene.setDescription('Updated description');
      expect(scene.getDescription()).toBe('Updated description');
    });

    test('should set and get scene metadata', () => {
      const metadata = {
        version: '2.0',
        author: 'Test User',
        created: Date.now()
      };

      scene.setMetadata(metadata);
      const retrievedMetadata = scene.getMetadata();

      expect(retrievedMetadata.version).toBe('2.0');
      expect(retrievedMetadata.author).toBe('Test User');
      expect(retrievedMetadata.created).toBe(metadata.created);
    });

    test('should get scene ID', () => {
      const sceneId = scene.getId();
      expect(typeof sceneId).toBe('string');
      expect(sceneId.length).toBeGreaterThan(0);
    });

    test('should get scene creation time', () => {
      const created = scene.getCreated();
      expect(created).toBeInstanceOf(Date);
    });

    test('should get scene modification time', () => {
      const modified = scene.getModified();
      expect(modified).toBeInstanceOf(Date);
    });
  });

  describe('Scene Validation', () => {
    let scene;

    beforeEach(() => {
      scene = sceneManager.addScene('TestScene');
    });

    test('should validate empty scene', () => {
      const validation = scene.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should validate scene with valid meshes', () => {
      const mesh = new EditableMesh({
        name: 'TestMesh',
        type: 'cube',
        geometry: { width: 1, height: 1, depth: 1 }
      });

      scene.addMesh(mesh);
      const validation = scene.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect invalid mesh in scene', () => {
      const invalidMesh = new EditableMesh({
        name: 'InvalidMesh',
        type: 'invalid-type'
      });

      scene.addMesh(invalidMesh);
      const validation = scene.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should validate scene hierarchy', () => {
      const parentMesh = new EditableMesh({ name: 'Parent', type: 'cube' });
      const childMesh = new EditableMesh({ name: 'Child', type: 'sphere' });

      scene.addMesh(parentMesh);
      scene.addMesh(childMesh);
      scene.setParent(childMesh.getId(), parentMesh.getId());

      const validation = scene.validate();
      expect(validation.isValid).toBe(true);
    });

    test('should detect circular references in hierarchy', () => {
      const mesh1 = new EditableMesh({ name: 'Mesh1', type: 'cube' });
      const mesh2 = new EditableMesh({ name: 'Mesh2', type: 'sphere' });

      scene.addMesh(mesh1);
      scene.addMesh(mesh2);

      // Create circular reference
      scene.setParent(mesh1.getId(), mesh2.getId());
      scene.setParent(mesh2.getId(), mesh1.getId());

      const validation = scene.validate();
      expect(validation.isValid).toBe(false);
    });
  });

  describe('Scene Serialization', () => {
    let scene;

    beforeEach(() => {
      scene = sceneManager.addScene('TestScene');
    });

    test('should serialize empty scene', () => {
      const serialized = scene.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.name).toBe('TestScene');
      expect(parsed.meshes).toHaveLength(0);
    });

    test('should serialize scene with meshes', () => {
      const mesh = new EditableMesh({
        name: 'TestMesh',
        type: 'cube',
        geometry: { width: 1, height: 1, depth: 1 }
      });

      scene.addMesh(mesh);
      const serialized = scene.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.meshes).toHaveLength(1);
      expect(parsed.meshes[0].name).toBe('TestMesh');
    });

    test('should serialize scene with hierarchy', () => {
      const parentMesh = new EditableMesh({ name: 'Parent', type: 'cube' });
      const childMesh = new EditableMesh({ name: 'Child', type: 'sphere' });

      scene.addMesh(parentMesh);
      scene.addMesh(childMesh);
      scene.setParent(childMesh.getId(), parentMesh.getId());

      const serialized = scene.serialize();
      const parsed = JSON.parse(serialized);

      expect(parsed.hierarchy).toBeDefined();
      expect(parsed.hierarchy[childMesh.getId()]).toBe(parentMesh.getId());
    });

    test('should deserialize scene', () => {
      const mesh = new EditableMesh({
        name: 'TestMesh',
        type: 'cube'
      });

      scene.addMesh(mesh);
      const serialized = scene.serialize();

      const newScene = Scene.deserialize(serialized);
      expect(newScene.getName()).toBe('TestScene');
      expect(newScene.getMeshCount()).toBe(1);
    });
  });

  describe('Scene Statistics', () => {
    let scene;

    beforeEach(() => {
      scene = sceneManager.addScene('TestScene');
    });

    test('should get statistics for empty scene', () => {
      const stats = scene.getStatistics();

      expect(stats.meshCount).toBe(0);
      expect(stats.vertexCount).toBe(0);
      expect(stats.faceCount).toBe(0);
      expect(stats.memoryUsage).toBeDefined();
    });

    test('should get statistics for scene with meshes', () => {
      const mesh1 = new EditableMesh({ name: 'Mesh1', type: 'cube' });
      const mesh2 = new EditableMesh({ name: 'Mesh2', type: 'sphere' });

      scene.addMesh(mesh1);
      scene.addMesh(mesh2);

      const stats = scene.getStatistics();

      expect(stats.meshCount).toBe(2);
      expect(stats.vertexCount).toBeGreaterThan(0);
      expect(stats.faceCount).toBeGreaterThan(0);
    });

    test('should get bounds for scene', () => {
      const mesh = new EditableMesh({
        name: 'TestMesh',
        type: 'cube',
        geometry: { width: 2, height: 2, depth: 2 }
      });

      mesh.setPosition(1, 1, 1);
      scene.addMesh(mesh);

      const bounds = scene.getBounds();
      expect(bounds.min.x).toBeLessThan(bounds.max.x);
      expect(bounds.min.y).toBeLessThan(bounds.max.y);
      expect(bounds.min.z).toBeLessThan(bounds.max.z);
    });

    test('should get center for scene', () => {
      const mesh = new EditableMesh({
        name: 'TestMesh',
        type: 'cube'
      });

      mesh.setPosition(1, 2, 3);
      scene.addMesh(mesh);

      const center = scene.getCenter();
      expect(center.x).toBe(1);
      expect(center.y).toBe(2);
      expect(center.z).toBe(3);
    });
  });

  describe('Scene Events', () => {
    let scene;

    beforeEach(() => {
      scene = sceneManager.addScene('TestScene');
    });

    test('should emit scene created event', () => {
      const eventListener = jest.fn();
      sceneManager.addEventListener('sceneCreated', eventListener);

      sceneManager.addScene('NewScene');
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          scene: expect.any(Scene)
        })
      );
    });

    test('should emit scene deleted event', () => {
      const scene = sceneManager.addScene('TestScene');
      const eventListener = jest.fn();
      sceneManager.addEventListener('sceneDeleted', eventListener);

      sceneManager.removeScene(scene.getId());
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          sceneId: scene.getId()
        })
      );
    });

    test('should emit mesh added event', () => {
      const mesh = new EditableMesh({ name: 'TestMesh', type: 'cube' });
      const eventListener = jest.fn();
      scene.addEventListener('meshAdded', eventListener);

      scene.addMesh(mesh);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          mesh
        })
      );
    });

    test('should emit mesh removed event', () => {
      const mesh = new EditableMesh({ name: 'TestMesh', type: 'cube' });
      scene.addMesh(mesh);
      
      const eventListener = jest.fn();
      scene.addEventListener('meshRemoved', eventListener);

      scene.removeMesh(mesh.getId());
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          meshId: mesh.getId()
        })
      );
    });
  });

  describe('Edge Cases', () => {
    test('should handle null/undefined parameters', () => {
      expect(() => sceneManager.addScene(null)).not.toThrow();
      expect(() => sceneManager.addScene(undefined)).not.toThrow();
    });

    test('should handle empty scene names', () => {
      const scene = sceneManager.addScene('');
      expect(scene.getName()).toBe('');
    });

    test('should handle special characters in scene names', () => {
      const specialName = 'Scene with spaces and special chars: !@#$%^&*()';
      const scene = sceneManager.addScene(specialName);
      expect(scene.getName()).toBe(specialName);
    });

    test('should handle very long scene names', () => {
      const longName = 'A'.repeat(1000);
      const scene = sceneManager.addScene(longName);
      expect(scene.getName()).toBe(longName);
    });

    test('should handle concurrent scene operations', () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(Promise.resolve(sceneManager.addScene(`Scene${i}`)));
      }

      return Promise.all(promises).then(() => {
        expect(sceneManager.getSceneCount()).toBe(5); // Limited by maxScenes
      });
    });
  });
}); 