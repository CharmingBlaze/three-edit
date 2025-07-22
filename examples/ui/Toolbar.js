/**
 * Toolbar - Main toolbar with editing tools and actions
 */

export default class Toolbar {
  constructor(editor, container) {
    this.editor = editor;
    this.container = container;
    this.tools = new Map();
    this.activeTool = null;
    
    this.createToolbar();
    this.setupEventListeners();
  }

  createToolbar() {
    this.element = document.createElement('div');
    this.element.className = 'editor-toolbar';
    this.element.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: #2a2a2a;
      border-bottom: 1px solid #444;
      display: flex;
      align-items: center;
      padding: 0 10px;
      z-index: 1000;
      font-family: Arial, sans-serif;
      font-size: 12px;
    `;

    this.createFileTools();
    this.createEditTools();
    this.createViewTools();
    this.createTransformTools();
    this.createGeometryTools();
    this.createModifierTools();
    this.createRenderTools();

    this.container.appendChild(this.element);
  }

  createFileTools() {
    const fileGroup = this.createToolGroup('File');
    
    this.addToolButton(fileGroup, 'New', '📄', () => this.newScene());
    this.addToolButton(fileGroup, 'Open', '📂', () => this.openFile());
    this.addToolButton(fileGroup, 'Save', '💾', () => this.saveFile());
    this.addToolButton(fileGroup, 'Export', '📤', () => this.exportScene());
  }

  createEditTools() {
    const editGroup = this.createToolGroup('Edit');
    
    this.addToolButton(editGroup, 'Undo', '↶', () => this.editor.undo());
    this.addToolButton(editGroup, 'Redo', '↷', () => this.editor.redo());
    this.addSeparator(editGroup);
    this.addToolButton(editGroup, 'Cut', '✂️', () => this.cut());
    this.addToolButton(editGroup, 'Copy', '📋', () => this.copy());
    this.addToolButton(editGroup, 'Paste', '📋', () => this.paste());
    this.addToolButton(editGroup, 'Delete', '🗑️', () => this.delete());
  }

  createViewTools() {
    const viewGroup = this.createToolGroup('View');
    
    this.addToolButton(viewGroup, 'Front', '👁️', () => this.editor.cameraManager.setFrontView());
    this.addToolButton(viewGroup, 'Top', '👁️', () => this.editor.cameraManager.setTopView());
    this.addToolButton(viewGroup, 'Side', '👁️', () => this.editor.cameraManager.setRightView());
    this.addToolButton(viewGroup, 'Isometric', '👁️', () => this.editor.cameraManager.setIsometricView());
    this.addSeparator(viewGroup);
    this.addToolButton(viewGroup, 'Focus', '🎯', () => this.focusSelection());
  }

  createTransformTools() {
    const transformGroup = this.createToolGroup('Transform');
    
    this.addToolButton(transformGroup, 'Select', '👆', () => this.setActiveTool('select'));
    this.addToolButton(transformGroup, 'Move', '↔️', () => this.setActiveTool('move'));
    this.addToolButton(transformGroup, 'Rotate', '🔄', () => this.setActiveTool('rotate'));
    this.addToolButton(transformGroup, 'Scale', '📏', () => this.setActiveTool('scale'));
  }

  createGeometryTools() {
    const geometryGroup = this.createToolGroup('Geometry');
    
    this.addToolButton(geometryGroup, 'Box', '📦', () => this.createGeometry('box'));
    this.addToolButton(geometryGroup, 'Sphere', '⚪', () => this.createGeometry('sphere'));
    this.addToolButton(geometryGroup, 'Cylinder', '🔲', () => this.createGeometry('cylinder'));
    this.addToolButton(geometryGroup, 'Cone', '🔺', () => this.createGeometry('cone'));
    this.addToolButton(geometryGroup, 'Plane', '⬜', () => this.createGeometry('plane'));
  }

  createModifierTools() {
    const modifierGroup = this.createToolGroup('Modifiers');
    
    this.addToolButton(modifierGroup, 'Extrude', '📈', () => this.applyModifier('extrude'));
    this.addToolButton(modifierGroup, 'Bevel', '🔲', () => this.applyModifier('bevel'));
    this.addToolButton(modifierGroup, 'Boolean', '🔗', () => this.applyModifier('boolean'));
    this.addToolButton(modifierGroup, 'Mirror', '🪞', () => this.applyModifier('mirror'));
    this.addToolButton(modifierGroup, 'Array', '📋', () => this.applyModifier('array'));
  }

  createRenderTools() {
    const renderGroup = this.createToolGroup('Render');
    
    this.addToolButton(renderGroup, 'Render', '🎨', () => this.render());
    this.addToolButton(renderGroup, 'Screenshot', '📸', () => this.screenshot());
    this.addToolButton(renderGroup, 'Animation', '🎬', () => this.animate());
  }

  createToolGroup(name) {
    const group = document.createElement('div');
    group.className = 'toolbar-group';
    group.style.cssText = `
      display: flex;
      align-items: center;
      margin-right: 20px;
      border-right: 1px solid #444;
      padding-right: 20px;
    `;

    const label = document.createElement('span');
    label.textContent = name;
    label.style.cssText = `
      color: #888;
      margin-right: 10px;
      font-weight: bold;
      font-size: 10px;
    `;
    group.appendChild(label);

    this.element.appendChild(group);
    return group;
  }

  addToolButton(group, name, icon, callback) {
    const button = document.createElement('button');
    button.innerHTML = icon;
    button.title = name;
    button.style.cssText = `
      background: #3a3a3a;
      border: 1px solid #555;
      color: #fff;
      padding: 5px 8px;
      margin: 0 2px;
      cursor: pointer;
      border-radius: 3px;
      font-size: 14px;
      transition: all 0.2s;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.background = '#4a4a4a';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = '#3a3a3a';
    });

    button.addEventListener('click', callback);

    group.appendChild(button);
    this.tools.set(name, button);
    return button;
  }

  addSeparator(group) {
    const separator = document.createElement('div');
    separator.style.cssText = `
      width: 1px;
      height: 20px;
      background: #555;
      margin: 0 10px;
    `;
    group.appendChild(separator);
  }

  setActiveTool(toolName) {
    // Remove active state from all tools
    this.tools.forEach(button => {
      button.style.background = '#3a3a3a';
    });

    // Set active state for selected tool
    const activeButton = this.tools.get(toolName);
    if (activeButton) {
      activeButton.style.background = '#007acc';
    }

    this.activeTool = toolName;
    this.editor.eventManager.emit('toolChanged', { tool: toolName });
  }

  // File operations
  newScene() {
    if (confirm('Are you sure you want to create a new scene? All unsaved changes will be lost.')) {
      this.editor.sceneManager.clearScene();
      this.editor.historyManager.clear();
    }
  }

  openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.gltf,.glb';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        this.loadFile(file);
      }
    };
    input.click();
  }

  saveFile() {
    const sceneData = this.editor.exportScene();
    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scene.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  exportScene() {
    // Implement scene export functionality
    console.log('Export scene');
  }

  // Edit operations
  cut() {
    const selected = this.editor.selectionManager.getSelectedObjects();
    if (selected.length > 0) {
      this.copy();
      selected.forEach(obj => this.editor.removeObject(obj));
    }
  }

  copy() {
    const selected = this.editor.selectionManager.getSelectedObjects();
    if (selected.length > 0) {
      localStorage.setItem('editorClipboard', JSON.stringify(selected.map(obj => obj.toJSON())));
    }
  }

  paste() {
    const clipboard = localStorage.getItem('editorClipboard');
    if (clipboard) {
      const objects = JSON.parse(clipboard);
      objects.forEach(objData => {
        // Recreate objects from clipboard data
        console.log('Paste object:', objData);
      });
    }
  }

  delete() {
    const selected = this.editor.selectionManager.getSelectedObjects();
    selected.forEach(obj => this.editor.removeObject(obj));
  }

  // View operations
  focusSelection() {
    const selected = this.editor.selectionManager.getSelectedObjects();
    if (selected.length > 0) {
      const center = this.editor.selectionManager.getSelectionCenter();
      this.editor.cameraManager.animateTo(
        center.clone().add(new THREE.Vector3(5, 5, 5)),
        center,
        1000
      );
    }
  }

  // Geometry creation
  createGeometry(type) {
    const geometryInstance = this.editor.geometry.get(type);
    if (geometryInstance) {
      const geometry = geometryInstance.create();
      if (geometry) {
        this.editor.createGeometry(type);
      }
    } else {
      console.warn(`Geometry type '${type}' not found`);
    }
  }

  // Modifier operations
  applyModifier(type) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    if (selected.length === 0) {
      alert('Please select an object to apply modifier');
      return;
    }

    switch (type) {
      case 'extrude':
        // Apply extrude modifier
        break;
      case 'bevel':
        // Apply bevel modifier
        break;
      case 'boolean':
        // Apply boolean modifier
        break;
      case 'mirror':
        // Apply mirror modifier
        break;
      case 'array':
        // Apply array modifier
        break;
    }
  }

  // Render operations
  render() {
    console.log('Render scene');
  }

  screenshot() {
    const dataURL = this.editor.rendererManager.takeScreenshot();
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'screenshot.png';
    a.click();
  }

  animate() {
    console.log('Start animation');
  }

  // Event listeners
  setupEventListeners() {
    // Listen for tool changes
    this.editor.eventManager.on('toolChanged', (data) => {
      console.log('Tool changed to:', data.tool);
    });
  }

  // Utility methods
  showNotification(message, type = 'info') {
    // Implement notification system
    console.log(`${type}: ${message}`);
  }

  dispose() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
} 