/**
 * PropertyPanel - Panel for editing object properties
 */

export default class PropertyPanel {
  constructor(editor, container, options = {}) {
    this.editor = editor;
    this.container = container;
    this.options = {
      width: options.width || 300,
      collapsed: options.collapsed || false,
      ...options
    };

    this.element = null;
    this.currentObject = null;
    this.isCollapsed = this.options.collapsed;

    this.createPanel();
    this.setupEventListeners();
  }

  // Create property panel
  createPanel() {
    this.element = document.createElement('div');
    this.element.className = 'property-panel';
    this.element.style.cssText = `
      position: absolute;
      top: 0;
      right: 0;
      width: ${this.options.width}px;
      height: 100%;
      background: rgba(30, 30, 30, 0.95);
      border-left: 1px solid #444;
      backdrop-filter: blur(10px);
      z-index: 100;
      overflow-y: auto;
      padding: 10px;
      color: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    if (this.isCollapsed) {
      this.element.style.transform = 'translateX(100%)';
    }

    this.container.appendChild(this.element);
    this.createContent();
  }

  // Create panel content
  createContent() {
    this.element.innerHTML = `
      <div class="panel-header">
        <h3>Properties</h3>
        <button class="collapse-btn">−</button>
      </div>
      <div class="panel-content">
        <div class="no-selection">
          <p>No object selected</p>
          <p>Select an object to edit its properties</p>
        </div>
        <div class="object-properties" style="display: none;">
          <div class="property-group">
            <h4>Transform</h4>
            <div class="property-row">
              <label>Position X:</label>
              <input type="number" class="pos-x" step="0.1">
            </div>
            <div class="property-row">
              <label>Position Y:</label>
              <input type="number" class="pos-y" step="0.1">
            </div>
            <div class="property-row">
              <label>Position Z:</label>
              <input type="number" class="pos-z" step="0.1">
            </div>
            <div class="property-row">
              <label>Rotation X:</label>
              <input type="number" class="rot-x" step="0.1">
            </div>
            <div class="property-row">
              <label>Rotation Y:</label>
              <input type="number" class="rot-y" step="0.1">
            </div>
            <div class="property-row">
              <label>Rotation Z:</label>
              <input type="number" class="rot-z" step="0.1">
            </div>
            <div class="property-row">
              <label>Scale X:</label>
              <input type="number" class="scale-x" step="0.1" min="0.1">
            </div>
            <div class="property-row">
              <label>Scale Y:</label>
              <input type="number" class="scale-y" step="0.1" min="0.1">
            </div>
            <div class="property-row">
              <label>Scale Z:</label>
              <input type="number" class="scale-z" step="0.1" min="0.1">
            </div>
          </div>
          <div class="property-group">
            <h4>Material</h4>
            <div class="property-row">
              <label>Color:</label>
              <input type="color" class="material-color">
            </div>
            <div class="property-row">
              <label>Opacity:</label>
              <input type="range" class="material-opacity" min="0" max="1" step="0.1">
            </div>
            <div class="property-row">
              <label>Metalness:</label>
              <input type="range" class="material-metalness" min="0" max="1" step="0.1">
            </div>
            <div class="property-row">
              <label>Roughness:</label>
              <input type="range" class="material-roughness" min="0" max="1" step="0.1">
            </div>
          </div>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .property-panel .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #444;
        margin-bottom: 15px;
      }
      .property-panel .panel-header h3 {
        margin: 0;
        color: #fff;
      }
      .property-panel .collapse-btn {
        background: none;
        border: none;
        color: #fff;
        font-size: 18px;
        cursor: pointer;
        padding: 5px;
      }
      .property-panel .property-group {
        margin-bottom: 20px;
      }
      .property-panel .property-group h4 {
        margin: 0 0 10px 0;
        color: #ccc;
        font-size: 14px;
      }
      .property-panel .property-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .property-panel .property-row label {
        color: #ccc;
        font-size: 12px;
        min-width: 80px;
      }
      .property-panel .property-row input {
        background: #444;
        border: 1px solid #666;
        color: #fff;
        padding: 4px 8px;
        border-radius: 3px;
        font-size: 12px;
        width: 80px;
      }
      .property-panel .no-selection {
        text-align: center;
        color: #888;
        padding: 20px;
      }
      .property-panel .no-selection p {
        margin: 5px 0;
        font-size: 12px;
      }
    `;
    document.head.appendChild(style);
  }

  // Setup event listeners
  setupEventListeners() {
    // Collapse button
    const collapseBtn = this.element.querySelector('.collapse-btn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        this.toggle();
      });
    }

    // Property change listeners
    this.setupPropertyListeners();
  }

  // Setup property change listeners
  setupPropertyListeners() {
    const inputs = this.element.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('change', (event) => {
        this.onPropertyChange(event);
      });
    });
  }

  // Handle property changes
  onPropertyChange(event) {
    if (!this.currentObject) return;

    const input = event.target;
    const value = input.type === 'number' ? parseFloat(input.value) : input.value;

    if (input.classList.contains('pos-x')) {
      this.currentObject.position.x = value;
    } else if (input.classList.contains('pos-y')) {
      this.currentObject.position.y = value;
    } else if (input.classList.contains('pos-z')) {
      this.currentObject.position.z = value;
    } else if (input.classList.contains('rot-x')) {
      this.currentObject.rotation.x = value;
    } else if (input.classList.contains('rot-y')) {
      this.currentObject.rotation.y = value;
    } else if (input.classList.contains('rot-z')) {
      this.currentObject.rotation.z = value;
    } else if (input.classList.contains('scale-x')) {
      this.currentObject.scale.x = value;
    } else if (input.classList.contains('scale-y')) {
      this.currentObject.scale.y = value;
    } else if (input.classList.contains('scale-z')) {
      this.currentObject.scale.z = value;
    } else if (input.classList.contains('material-color')) {
      if (this.currentObject.material) {
        this.currentObject.material.color.setHex(value.replace('#', '0x'));
      }
    } else if (input.classList.contains('material-opacity')) {
      if (this.currentObject.material) {
        this.currentObject.material.opacity = value;
        this.currentObject.material.transparent = value < 1;
      }
    } else if (input.classList.contains('material-metalness')) {
      if (this.currentObject.material) {
        this.currentObject.material.metalness = value;
      }
    } else if (input.classList.contains('material-roughness')) {
      if (this.currentObject.material) {
        this.currentObject.material.roughness = value;
      }
    }
  }

  // Set current object
  setObject(object) {
    this.currentObject = object;
    this.updateDisplay();
  }

  // Clear current object
  clearObject() {
    this.currentObject = null;
    this.updateDisplay();
  }

  // Update display
  updateDisplay() {
    const noSelection = this.element.querySelector('.no-selection');
    const objectProperties = this.element.querySelector('.object-properties');

    if (this.currentObject) {
      noSelection.style.display = 'none';
      objectProperties.style.display = 'block';
      this.updateProperties();
    } else {
      noSelection.style.display = 'block';
      objectProperties.style.display = 'none';
    }
  }

  // Update property values
  updateProperties() {
    if (!this.currentObject) return;

    // Update transform inputs
    const posX = this.element.querySelector('.pos-x');
    const posY = this.element.querySelector('.pos-y');
    const posZ = this.element.querySelector('.pos-z');
    const rotX = this.element.querySelector('.rot-x');
    const rotY = this.element.querySelector('.rot-y');
    const rotZ = this.element.querySelector('.rot-z');
    const scaleX = this.element.querySelector('.scale-x');
    const scaleY = this.element.querySelector('.scale-y');
    const scaleZ = this.element.querySelector('.scale-z');

    if (posX) posX.value = this.currentObject.position.x.toFixed(2);
    if (posY) posY.value = this.currentObject.position.y.toFixed(2);
    if (posZ) posZ.value = this.currentObject.position.z.toFixed(2);
    if (rotX) rotX.value = this.currentObject.rotation.x.toFixed(2);
    if (rotY) rotY.value = this.currentObject.rotation.y.toFixed(2);
    if (rotZ) rotZ.value = this.currentObject.rotation.z.toFixed(2);
    if (scaleX) scaleX.value = this.currentObject.scale.x.toFixed(2);
    if (scaleY) scaleY.value = this.currentObject.scale.y.toFixed(2);
    if (scaleZ) scaleZ.value = this.currentObject.scale.z.toFixed(2);

    // Update material inputs
    if (this.currentObject.material) {
      const color = this.element.querySelector('.material-color');
      const opacity = this.element.querySelector('.material-opacity');
      const metalness = this.element.querySelector('.material-metalness');
      const roughness = this.element.querySelector('.material-roughness');

      if (color) color.value = '#' + this.currentObject.material.color.getHexString();
      if (opacity) opacity.value = this.currentObject.material.opacity || 1;
      if (metalness) metalness.value = this.currentObject.material.metalness || 0;
      if (roughness) roughness.value = this.currentObject.material.roughness || 0.5;
    }
  }

  // Toggle panel
  toggle() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.element.style.transform = 'translateX(100%)';
    } else {
      this.element.style.transform = 'translateX(0)';
    }
  }

  // Show panel
  show() {
    this.isCollapsed = false;
    this.element.style.transform = 'translateX(0)';
  }

  // Hide panel
  hide() {
    this.isCollapsed = true;
    this.element.style.transform = 'translateX(100%)';
  }

  // Update panel
  update() {
    if (this.currentObject) {
      this.updateProperties();
    }
  }

  // Dispose panel
  dispose() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
} 