/**
 * Sidebar - Side panel component for the 3D editor
 */

export default class Sidebar {
  constructor(editor, container, options = {}) {
    this.editor = editor;
    this.container = container;
    this.options = {
      position: options.position || 'left',
      width: options.width || 250,
      collapsed: options.collapsed || false,
      ...options
    };

    this.element = null;
    this.panels = new Map();
    this.isCollapsed = this.options.collapsed;

    this.createSidebar();
    this.setupEventListeners();
  }

  // Create sidebar element
  createSidebar() {
    this.element = document.createElement('div');
    this.element.className = 'editor-sidebar';
    this.element.style.cssText = `
      position: absolute;
      top: 0;
      ${this.options.position}: 0;
      width: ${this.options.width}px;
      height: 100%;
      background: rgba(30, 30, 30, 0.95);
      border-right: 1px solid #444;
      backdrop-filter: blur(10px);
      z-index: 100;
      transition: transform 0.3s ease;
      overflow-y: auto;
      overflow-x: hidden;
    `;

    if (this.isCollapsed) {
      this.element.style.transform = `translateX(${this.options.position === 'left' ? '-' : ''}${this.options.width}px)`;
    }

    this.container.appendChild(this.element);
  }

  // Add panel to sidebar
  addPanel(name, panel) {
    this.panels.set(name, panel);
    if (this.element) {
      this.element.appendChild(panel.element);
    }
  }

  // Remove panel from sidebar
  removePanel(name) {
    const panel = this.panels.get(name);
    if (panel && this.element) {
      this.element.removeChild(panel.element);
      this.panels.delete(name);
    }
  }

  // Toggle sidebar collapse
  toggle() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.element.style.transform = `translateX(${this.options.position === 'left' ? '-' : ''}${this.options.width}px)`;
    } else {
      this.element.style.transform = 'translateX(0)';
    }
  }

  // Show sidebar
  show() {
    this.isCollapsed = false;
    this.element.style.transform = 'translateX(0)';
  }

  // Hide sidebar
  hide() {
    this.isCollapsed = true;
    this.element.style.transform = `translateX(${this.options.position === 'left' ? '-' : ''}${this.options.width}px)`;
  }

  // Setup event listeners
  setupEventListeners() {
    // Keyboard shortcut to toggle sidebar
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab' && event.ctrlKey) {
        event.preventDefault();
        this.toggle();
      }
    });
  }

  // Update sidebar content
  update() {
    this.panels.forEach(panel => {
      if (panel.update) {
        panel.update();
      }
    });
  }

  // Get panel by name
  getPanel(name) {
    return this.panels.get(name);
  }

  // Get all panels
  getPanels() {
    return Array.from(this.panels.values());
  }

  // Dispose sidebar
  dispose() {
    this.panels.forEach(panel => {
      if (panel.dispose) {
        panel.dispose();
      }
    });
    this.panels.clear();

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
} 