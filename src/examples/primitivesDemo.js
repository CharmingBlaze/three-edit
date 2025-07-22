/**
 * @fileoverview Primitives Demo
 * Demonstrates all refactored primitives with flexible parameter systems
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/controls/TransformControls.js';

import {
  createCube,
  createSphere,
  createPlane,
  createCylinder,
  createCone,
  createTorus,
  createRing,
  createPyramid,
  createOctahedron,
  createIcosahedron,
  createPrimitive,
  getAvailablePrimitives,
  getDefaultParams
} from '../primitives/index.js';

import { convertToThreeJS } from '../threejsConverter.js';

/**
 * Primitives Demo Class
 * Demonstrates all primitives with flexible parameters
 */
export class PrimitivesDemo {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.transformControls = null;
    this.meshes = [];
    this.currentMesh = null;
    
    this.init();
    this.createPrimitives();
    this.animate();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.controls.enabled = !event.value;
    });
    this.scene.add(this.transformControls);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(gridHelper);

    // Event listeners
    window.addEventListener('resize', () => this.onWindowResize());
    this.renderer.domElement.addEventListener('click', (event) => this.onMouseClick(event));
  }

  createPrimitives() {
    // Clear existing meshes
    this.meshes.forEach(mesh => {
      this.scene.remove(mesh);
    });
    this.meshes = [];

    // Create all primitives with different parameters
    const primitives = [
      // Basic primitives
      {
        name: 'Basic Cube',
        mesh: createCube({
          width: 1, height: 1, depth: 1,
          x: -4, y: 0, z: 0,
          material: { color: { r: 1, g: 0.5, b: 0.5 } }
        })
      },
      {
        name: 'Scaled Sphere',
        mesh: createSphere({
          radius: 0.5,
          widthSegments: 32, heightSegments: 16,
          x: -2, y: 0, z: 0,
          scaleX: 1.5, scaleY: 1, scaleZ: 1.5,
          material: { color: { r: 0.5, g: 1, b: 0.5 } }
        })
      },
      {
        name: 'Rotated Plane',
        mesh: createPlane({
          width: 2, height: 2,
          widthSegments: 4, heightSegments: 4,
          x: 0, y: 0, z: 0,
          rotationX: Math.PI / 6,
          material: { color: { r: 0.5, g: 0.5, b: 1 } }
        })
      },

      // Cylindrical primitives
      {
        name: 'Cylinder',
        mesh: createCylinder({
          radiusTop: 0.3, radiusBottom: 0.5, height: 1.5,
          radialSegments: 16, heightSegments: 3,
          x: 2, y: 0, z: 0,
          material: { color: { r: 1, g: 1, b: 0.5 } }
        })
      },
      {
        name: 'Cone',
        mesh: createCone({
          radius: 0.5, height: 1.2,
          radialSegments: 16, heightSegments: 3,
          x: 4, y: 0, z: 0,
          material: { color: { r: 1, g: 0.5, b: 1 } }
        })
      },
      {
        name: 'Torus',
        mesh: createTorus({
          radius: 0.8, tube: 0.2,
          radialSegments: 24, tubularSegments: 16,
          x: -4, y: 0, z: 2,
          material: { color: { r: 0.5, g: 1, b: 1 } }
        })
      },
      {
        name: 'Ring',
        mesh: createRing({
          innerRadius: 0.3, outerRadius: 0.6,
          thetaSegments: 32, phiSegments: 1,
          x: -2, y: 0, z: 2,
          material: { color: { r: 1, g: 1, b: 0.5 } }
        })
      },

      // Polyhedral primitives
      {
        name: 'Pyramid',
        mesh: createPyramid({
          baseSize: 1, height: 1.2,
          x: 0, y: 0, z: 2,
          material: { color: { r: 1, g: 0.8, b: 0.5 } }
        })
      },
      {
        name: 'Octahedron',
        mesh: createOctahedron({
          radius: 0.6,
          x: 2, y: 0, z: 2,
          material: { color: { r: 0.8, g: 0.5, b: 1 } }
        })
      },
      {
        name: 'Icosahedron',
        mesh: createIcosahedron({
          radius: 0.5,
          x: 4, y: 0, z: 2,
          material: { color: { r: 0.5, g: 0.8, b: 1 } }
        })
      }
    ];

    // Convert and add to scene
    primitives.forEach(({ name, mesh }) => {
      const threeMesh = convertToThreeJS(mesh);
      threeMesh.userData = { name, originalMesh: mesh };
      threeMesh.castShadow = true;
      threeMesh.receiveShadow = true;
      
      this.scene.add(threeMesh);
      this.meshes.push(threeMesh);
    });

    console.log('Created primitives:', primitives.map(p => p.name));
    console.log('Available primitives:', getAvailablePrimitives());
  }

  onMouseClick(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, this.camera);
    const intersects = raycaster.intersectObjects(this.meshes);

    if (intersects.length > 0) {
      const selectedMesh = intersects[0].object;
      this.selectMesh(selectedMesh);
    } else {
      this.deselectMesh();
    }
  }

  selectMesh(mesh) {
    if (this.currentMesh) {
      this.transformControls.detach();
    }
    
    this.currentMesh = mesh;
    this.transformControls.attach(mesh);
    
    console.log('Selected:', mesh.userData.name);
    console.log('Mesh info:', {
      vertices: mesh.userData.originalMesh.vertices.size,
      faces: mesh.userData.originalMesh.faces.size,
      edges: mesh.userData.originalMesh.edges.size,
      uvs: mesh.userData.originalMesh.uvs.size
    });
  }

  deselectMesh() {
    if (this.currentMesh) {
      this.transformControls.detach();
      this.currentMesh = null;
    }
  }

  onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // Utility methods for testing
  createRandomPrimitive() {
    const types = getAvailablePrimitives();
    const randomType = types[Math.floor(Math.random() * types.length)];
    const defaultParams = getDefaultParams(randomType);
    
    // Add random position
    defaultParams.x = (Math.random() - 0.5) * 10;
    defaultParams.y = (Math.random() - 0.5) * 10;
    defaultParams.z = (Math.random() - 0.5) * 10;
    
    const mesh = createPrimitive(randomType, defaultParams);
    const threeMesh = convertToThreeJS(mesh);
    threeMesh.userData = { name: `Random ${randomType}`, originalMesh: mesh };
    threeMesh.castShadow = true;
    threeMesh.receiveShadow = true;
    
    this.scene.add(threeMesh);
    this.meshes.push(threeMesh);
    
    console.log(`Created random ${randomType} at`, defaultParams.x, defaultParams.y, defaultParams.z);
  }

  clearAll() {
    this.meshes.forEach(mesh => {
      this.scene.remove(mesh);
    });
    this.meshes = [];
    this.deselectMesh();
  }

  // Export methods for external use
  getScene() { return this.scene; }
  getCamera() { return this.camera; }
  getRenderer() { return this.renderer; }
  getMeshes() { return this.meshes; }
} 