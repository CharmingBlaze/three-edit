/**
 * CameraTool - Manages camera operations and controls
 */

import * as THREE from 'three';
import BaseTool from './BaseTool.js';

export default class CameraTool extends BaseTool {
  constructor(scene, camera, renderer, options = {}) {
    super(scene, camera, renderer, {
      name: 'CameraTool',
      description: 'Camera control and manipulation tool',
      icon: '📷',
      category: 'camera',
      ...options
    });

    // Camera settings
    this.cameraSettings = {
      fov: camera.fov || 75,
      near: camera.near || 0.1,
      far: camera.far || 1000,
      aspect: camera.aspect || 1
    };

    // Camera controls
    this.controls = null;
    this.isOrbiting = false;
    this.isPanning = false;
    this.isZooming = false;

    // Camera presets
    this.presets = {
      front: { position: [0, 0, 5], rotation: [0, 0, 0] },
      back: { position: [0, 0, -5], rotation: [0, Math.PI, 0] },
      left: { position: [-5, 0, 0], rotation: [0, -Math.PI / 2, 0] },
      right: { position: [5, 0, 0], rotation: [0, Math.PI / 2, 0] },
      top: { position: [0, 5, 0], rotation: [-Math.PI / 2, 0, 0] },
      bottom: { position: [0, -5, 0], rotation: [Math.PI / 2, 0, 0] },
      isometric: { position: [5, 5, 5], rotation: [-Math.PI / 4, Math.PI / 4, 0] }
    };

    // Camera history
    this.cameraHistory = [];
    this.maxCameraHistory = 10;
  }

  // Setup camera controls
  setupControls() {
    try {
      // Import OrbitControls dynamically
      import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        // Configure controls
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.enableRotate = true;
        
        // Set limits
        this.controls.minDistance = 0.1;
        this.controls.maxDistance = 1000;
        this.controls.minPolarAngle = 0;
        this.controls.maxPolarAngle = Math.PI;
        
        this.emit('controlsSetup', { controls: this.controls, tool: this });
      });
    } catch (error) {
      console.error('Failed to setup camera controls:', error);
    }
  }

  // Set camera position
  setCameraPosition(position) {
    if (!position) return false;

    try {
      this.camera.position.set(position.x || 0, position.y || 0, position.z || 0);
      this.addToCameraHistory();
      this.emit('cameraMoved', { position: this.camera.position.clone(), tool: this });
      return true;
    } catch (error) {
      console.error('Failed to set camera position:', error);
      return false;
    }
  }

  // Set camera rotation
  setCameraRotation(rotation) {
    if (!rotation) return false;

    try {
      this.camera.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);
      this.addToCameraHistory();
      this.emit('cameraRotated', { rotation: this.camera.rotation.clone(), tool: this });
      return true;
    } catch (error) {
      console.error('Failed to set camera rotation:', error);
      return false;
    }
  }

  // Set camera target
  setCameraTarget(target) {
    if (!target || !this.controls) return false;

    try {
      this.controls.target.set(target.x || 0, target.y || 0, target.z || 0);
      this.controls.update();
      this.addToCameraHistory();
      this.emit('cameraTargetChanged', { target: this.controls.target.clone(), tool: this });
      return true;
    } catch (error) {
      console.error('Failed to set camera target:', error);
      return false;
    }
  }

  // Look at object
  lookAtObject(object) {
    if (!object) return false;

    try {
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * 2;

      // Position camera
      this.camera.position.copy(center);
      this.camera.position.z += distance;

      // Set target
      if (this.controls) {
        this.controls.target.copy(center);
        this.controls.update();
      }

      this.addToCameraHistory();
      this.emit('cameraLookedAt', { object, center, tool: this });
      return true;
    } catch (error) {
      console.error('Failed to look at object:', error);
      return false;
    }
  }

  // Apply camera preset
  applyPreset(presetName) {
    const preset = this.presets[presetName];
    if (!preset) return false;

    try {
      this.camera.position.set(...preset.position);
      this.camera.rotation.set(...preset.rotation);
      
      if (this.controls) {
        this.controls.target.set(0, 0, 0);
        this.controls.update();
      }

      this.addToCameraHistory();
      this.emit('presetApplied', { preset: presetName, tool: this });
      return true;
    } catch (error) {
      console.error('Failed to apply camera preset:', error);
      return false;
    }
  }

  // Reset camera
  resetCamera() {
    try {
      this.camera.position.set(0, 0, 5);
      this.camera.rotation.set(0, 0, 0);
      
      if (this.controls) {
        this.controls.target.set(0, 0, 0);
        this.controls.update();
      }

      this.addToCameraHistory();
      this.emit('cameraReset', { tool: this });
      return true;
    } catch (error) {
      console.error('Failed to reset camera:', error);
      return false;
    }
  }

  // Zoom camera
  zoomCamera(factor) {
    if (!factor) return false;

    try {
      const distance = this.camera.position.length();
      const newDistance = distance * factor;
      
      this.camera.position.normalize().multiplyScalar(newDistance);
      
      this.addToCameraHistory();
      this.emit('cameraZoomed', { factor, newDistance, tool: this });
      return true;
    } catch (error) {
      console.error('Failed to zoom camera:', error);
      return false;
    }
  }

  // Pan camera
  panCamera(direction) {
    if (!direction) return false;

    try {
      const panDistance = 1;
      const panVector = new THREE.Vector3(direction.x || 0, direction.y || 0, direction.z || 0);
      panVector.multiplyScalar(panDistance);
      
      this.camera.position.add(panVector);
      
      if (this.controls) {
        this.controls.target.add(panVector);
        this.controls.update();
      }

      this.addToCameraHistory();
      this.emit('cameraPanned', { direction: panVector, tool: this });
      return true;
    } catch (error) {
      console.error('Failed to pan camera:', error);
      return false;
    }
  }

  // Orbit camera
  orbitCamera(horizontalAngle, verticalAngle) {
    try {
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(this.camera.position);
      
      spherical.theta += horizontalAngle || 0;
      spherical.phi += verticalAngle || 0;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      
      this.camera.position.setFromSpherical(spherical);
      this.camera.lookAt(this.controls ? this.controls.target : new THREE.Vector3());
      
      this.addToCameraHistory();
      this.emit('cameraOrbited', { horizontalAngle, verticalAngle, tool: this });
      return true;
    } catch (error) {
      console.error('Failed to orbit camera:', error);
      return false;
    }
  }

  // Get camera info
  getCameraInfo() {
    return {
      position: this.camera.position.toArray(),
      rotation: this.camera.rotation.toArray(),
      fov: this.camera.fov,
      near: this.camera.near,
      far: this.camera.far,
      aspect: this.camera.aspect,
      target: this.controls ? this.controls.target.toArray() : [0, 0, 0],
      distance: this.camera.position.length()
    };
  }

  // Get available presets
  getAvailablePresets() {
    return Object.keys(this.presets);
  }

  // Add camera to history
  addToCameraHistory() {
    const cameraState = {
      position: this.camera.position.clone(),
      rotation: this.camera.rotation.clone(),
      target: this.controls ? this.controls.target.clone() : new THREE.Vector3(),
      timestamp: Date.now()
    };

    this.cameraHistory.push(cameraState);
    
    if (this.cameraHistory.length > this.maxCameraHistory) {
      this.cameraHistory.shift();
    }
  }

  // Restore camera from history
  restoreFromHistory(index) {
    if (index < 0 || index >= this.cameraHistory.length) return false;

    try {
      const state = this.cameraHistory[index];
      this.camera.position.copy(state.position);
      this.camera.rotation.copy(state.rotation);
      
      if (this.controls) {
        this.controls.target.copy(state.target);
        this.controls.update();
      }

      this.emit('cameraRestored', { state, tool: this });
      return true;
    } catch (error) {
      console.error('Failed to restore camera from history:', error);
      return false;
    }
  }

  // Update camera
  update() {
    if (this.controls) {
      this.controls.update();
    }
  }

  // Override activate
  activate() {
    super.activate();
    this.setupControls();
  }

  // Override deactivate
  deactivate() {
    super.deactivate();
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
  }

  // Get supported operations
  getSupportedOperations() {
    return [
      'setCameraPosition', 'setCameraRotation', 'setCameraTarget',
      'lookAtObject', 'applyPreset', 'resetCamera', 'zoomCamera',
      'panCamera', 'orbitCamera', 'getCameraInfo', 'getAvailablePresets'
    ];
  }

  // Get operation description
  getOperationDescription(operation) {
    const descriptions = {
      setCameraPosition: 'Set camera position',
      setCameraRotation: 'Set camera rotation',
      setCameraTarget: 'Set camera target point',
      lookAtObject: 'Look at specific object',
      applyPreset: 'Apply camera preset',
      resetCamera: 'Reset camera to default position',
      zoomCamera: 'Zoom camera in/out',
      panCamera: 'Pan camera in direction',
      orbitCamera: 'Orbit camera around target',
      getCameraInfo: 'Get current camera information',
      getAvailablePresets: 'Get available camera presets'
    };
    
    return descriptions[operation] || 'Unknown operation';
  }
} 