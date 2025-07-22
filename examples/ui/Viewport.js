/**
 * Viewport - Main 3D viewport component
 */

export default class Viewport {
  constructor(editor, container, options = {}) {
    this.editor = editor;
    this.container = container;
    this.options = {
      backgroundColor: options.backgroundColor || 0x1a1a1a,
      showGrid: options.showGrid !== false,
      showAxes: options.showAxes !== false,
      ...options
    };

    this.element = null;
    this.canvas = null;
    this.overlay = null;

    this.createViewport();
    this.setupOverlay();
  }

  // Create viewport element
  createViewport() {
    this.element = document.createElement('div');
    this.element.className = 'editor-viewport';
    this.element.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #1a1a1a;
      overflow: hidden;
    `;

    // Add canvas from renderer
    if (this.editor.renderer) {
      this.canvas = this.editor.renderer.domElement;
      this.canvas.style.cssText = `
        width: 100%;
        height: 100%;
        display: block;
      `;
      this.element.appendChild(this.canvas);
    }

    this.container.appendChild(this.element);
  }

  // Setup overlay for UI elements
  setupOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'viewport-overlay';
    this.overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 10;
    `;

    this.element.appendChild(this.overlay);
  }

  // Add overlay element
  addOverlay(element) {
    if (this.overlay) {
      element.style.pointerEvents = 'auto';
      this.overlay.appendChild(element);
    }
  }

  // Remove overlay element
  removeOverlay(element) {
    if (this.overlay && element.parentNode === this.overlay) {
      this.overlay.removeChild(element);
    }
  }

  // Set background color
  setBackgroundColor(color) {
    if (this.editor.renderer) {
      this.editor.renderer.setClearColor(color);
    }
  }

  // Show grid
  showGrid() {
    if (this.options.showGrid && this.editor.scene) {
      const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
      gridHelper.name = 'grid';
      this.editor.scene.add(gridHelper);
    }
  }

  // Hide grid
  hideGrid() {
    if (this.editor.scene) {
      const grid = this.editor.scene.getObjectByName('grid');
      if (grid) {
        this.editor.scene.remove(grid);
      }
    }
  }

  // Show axes
  showAxes() {
    if (this.options.showAxes && this.editor.scene) {
      const axesHelper = new THREE.AxesHelper(2);
      axesHelper.name = 'axes';
      this.editor.scene.add(axesHelper);
    }
  }

  // Hide axes
  hideAxes() {
    if (this.editor.scene) {
      const axes = this.editor.scene.getObjectByName('axes');
      if (axes) {
        this.editor.scene.remove(axes);
      }
    }
  }

  // Resize viewport
  resize(width, height) {
    if (this.editor.camera) {
      this.editor.camera.aspect = width / height;
      this.editor.camera.updateProjectionMatrix();
    }

    if (this.editor.renderer) {
      this.editor.renderer.setSize(width, height);
    }
  }

  // Get viewport size
  getSize() {
    return {
      width: this.element.clientWidth,
      height: this.element.clientHeight
    };
  }

  // Get canvas element
  getCanvas() {
    return this.canvas;
  }

  // Get overlay element
  getOverlay() {
    return this.overlay;
  }

  // Update viewport
  update() {
    // Update any overlay elements
    if (this.overlay) {
      const elements = this.overlay.children;
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.update) {
          element.update();
        }
      }
    }
  }

  // Dispose viewport
  dispose() {
    if (this.overlay) {
      this.overlay.innerHTML = '';
    }

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
} 