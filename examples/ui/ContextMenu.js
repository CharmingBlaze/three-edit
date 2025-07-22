/**
 * ContextMenu - Right-click context menu component
 */

export default class ContextMenu {
  constructor(editor, container, options = {}) {
    this.editor = editor;
    this.container = container;
    this.options = {
      ...options
    };

    this.element = null;
    this.isVisible = false;
    this.currentTarget = null;

    this.createMenu();
    this.setupEventListeners();
  }

  // Create context menu
  createMenu() {
    this.element = document.createElement('div');
    this.element.className = 'context-menu';
    this.element.style.cssText = `
      position: fixed;
      background: rgba(40, 40, 40, 0.95);
      border: 1px solid #666;
      border-radius: 4px;
      padding: 5px 0;
      min-width: 150px;
      z-index: 1000;
      display: none;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    this.container.appendChild(this.element);
  }

  // Setup event listeners
  setupEventListeners() {
    // Hide menu when clicking outside
    document.addEventListener('click', (event) => {
      if (!this.element.contains(event.target)) {
        this.hide();
      }
    });

    // Hide menu on escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.hide();
      }
    });
  }

  // Show context menu
  show(event, target = null) {
    event.preventDefault();
    this.currentTarget = target;

    // Clear previous content
    this.element.innerHTML = '';

    // Create menu items based on context
    this.createMenuItems();

    // Position menu
    const rect = this.element.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    // Adjust position if menu would go off screen
    let finalX = x;
    let finalY = y;

    if (x + rect.width > window.innerWidth) {
      finalX = x - rect.width;
    }

    if (y + rect.height > window.innerHeight) {
      finalY = y - rect.height;
    }

    this.element.style.left = finalX + 'px';
    this.element.style.top = finalY + 'px';
    this.element.style.display = 'block';
    this.isVisible = true;
  }

  // Hide context menu
  hide() {
    this.element.style.display = 'none';
    this.isVisible = false;
    this.currentTarget = null;
  }

  // Create menu items
  createMenuItems() {
    const items = this.getMenuItems();
    
    items.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'context-menu-item';
      menuItem.textContent = item.label;
      menuItem.style.cssText = `
        padding: 8px 15px;
        cursor: pointer;
        color: #fff;
        font-size: 12px;
        transition: background-color 0.2s;
      `;

      // Add hover effect
      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.backgroundColor = '#555';
      });

      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.backgroundColor = 'transparent';
      });

      // Add click handler
      menuItem.addEventListener('click', () => {
        if (item.action) {
          item.action(this.currentTarget);
        }
        this.hide();
      });

      this.element.appendChild(menuItem);
    });
  }

  // Get menu items based on context
  getMenuItems() {
    const items = [];

    if (this.currentTarget) {
      // Object-specific actions
      items.push(
        { label: 'Select', action: () => this.selectObject() },
        { label: 'Duplicate', action: () => this.duplicateObject() },
        { label: 'Delete', action: () => this.deleteObject() },
        { label: 'Rename', action: () => this.renameObject() },
        { label: 'Focus Camera', action: () => this.focusCamera() }
      );

      // Material actions
      if (this.currentTarget.material) {
        items.push(
          { label: 'Edit Material', action: () => this.editMaterial() },
          { label: 'Copy Material', action: () => this.copyMaterial() }
        );
      }

      // Geometry actions
      if (this.currentTarget.geometry) {
        items.push(
          { label: 'Edit Geometry', action: () => this.editGeometry() },
          { label: 'Export Geometry', action: () => this.exportGeometry() }
        );
      }
    } else {
      // Scene actions
      items.push(
        { label: 'Create Object', action: () => this.createObject() },
        { label: 'Import Scene', action: () => this.importScene() },
        { label: 'Export Scene', action: () => this.exportScene() },
        { label: 'Clear Scene', action: () => this.clearScene() }
      );
    }

    return items;
  }

  // Menu actions
  selectObject() {
    if (this.currentTarget && this.editor.tools) {
      const selectionTool = this.editor.tools.get('selection');
      if (selectionTool) {
        selectionTool.selectObject(this.currentTarget);
      }
    }
  }

  duplicateObject() {
    if (this.currentTarget) {
      const clone = this.currentTarget.clone();
      clone.position.add(new THREE.Vector3(1, 0, 0));
      this.editor.scene.add(clone);
    }
  }

  deleteObject() {
    if (this.currentTarget) {
      this.editor.scene.remove(this.currentTarget);
    }
  }

  renameObject() {
    if (this.currentTarget) {
      const newName = prompt('Enter new name:', this.currentTarget.name);
      if (newName) {
        this.currentTarget.name = newName;
      }
    }
  }

  focusCamera() {
    if (this.currentTarget && this.editor.camera) {
      const box = new THREE.Box3().setFromObject(this.currentTarget);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = this.editor.camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

      this.editor.camera.position.copy(center);
      this.editor.camera.position.z += cameraZ;
      this.editor.camera.lookAt(center);
    }
  }

  editMaterial() {
    // Open material editor
    console.log('Edit material for:', this.currentTarget.name);
  }

  copyMaterial() {
    if (this.currentTarget && this.currentTarget.material) {
      // Copy material to clipboard or storage
      console.log('Copy material for:', this.currentTarget.name);
    }
  }

  editGeometry() {
    // Open geometry editor
    console.log('Edit geometry for:', this.currentTarget.name);
  }

  exportGeometry() {
    if (this.currentTarget && this.currentTarget.geometry) {
      // Export geometry
      console.log('Export geometry for:', this.currentTarget.name);
    }
  }

  createObject() {
    // Open object creation dialog
    console.log('Create new object');
  }

  importScene() {
    // Open file dialog for scene import
    console.log('Import scene');
  }

  exportScene() {
    // Export current scene
    console.log('Export scene');
  }

  clearScene() {
    // Clear all objects from scene
    if (confirm('Are you sure you want to clear the scene?')) {
      this.editor.clearScene();
    }
  }

  // Check if menu is visible
  isMenuVisible() {
    return this.isVisible;
  }

  // Dispose menu
  dispose() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
} 