/**
 * StatusBar - Status bar component for the 3D editor
 */

export default class StatusBar {
  constructor(editor, container, options = {}) {
    this.editor = editor;
    this.container = container;
    this.options = {
      height: options.height || 30,
      ...options
    };

    this.element = null;
    this.statusText = null;
    this.progressBar = null;
    this.infoPanel = null;

    this.createStatusBar();
    this.setupEventListeners();
  }

  // Create status bar
  createStatusBar() {
    this.element = document.createElement('div');
    this.element.className = 'status-bar';
    this.element.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: ${this.options.height}px;
      background: rgba(30, 30, 30, 0.95);
      border-top: 1px solid #444;
      backdrop-filter: blur(10px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      color: #ccc;
    `;

    // Status text
    this.statusText = document.createElement('div');
    this.statusText.className = 'status-text';
    this.statusText.textContent = 'Ready';
    this.statusText.style.cssText = `
      flex: 1;
      margin-right: 15px;
    `;

    // Progress bar
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'progress-bar';
    this.progressBar.style.cssText = `
      width: 200px;
      height: 4px;
      background: #333;
      border-radius: 2px;
      overflow: hidden;
      display: none;
    `;

    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    progressFill.style.cssText = `
      height: 100%;
      background: #007acc;
      width: 0%;
      transition: width 0.3s ease;
    `;

    this.progressBar.appendChild(progressFill);

    // Info panel
    this.infoPanel = document.createElement('div');
    this.infoPanel.className = 'info-panel';
    this.infoPanel.style.cssText = `
      display: flex;
      gap: 20px;
      align-items: center;
    `;

    // Scene info
    this.sceneInfo = document.createElement('div');
    this.sceneInfo.className = 'scene-info';
    this.sceneInfo.textContent = 'Objects: 0';

    // Tool info
    this.toolInfo = document.createElement('div');
    this.toolInfo.className = 'tool-info';
    this.toolInfo.textContent = 'Tool: None';

    // Performance info
    this.performanceInfo = document.createElement('div');
    this.performanceInfo.className = 'performance-info';
    this.performanceInfo.textContent = 'FPS: 60';

    this.infoPanel.appendChild(this.sceneInfo);
    this.infoPanel.appendChild(this.toolInfo);
    this.infoPanel.appendChild(this.performanceInfo);

    this.element.appendChild(this.statusText);
    this.element.appendChild(this.progressBar);
    this.element.appendChild(this.infoPanel);

    this.container.appendChild(this.element);
  }

  // Setup event listeners
  setupEventListeners() {
    // Listen for editor events
    if (this.editor) {
      this.editor.addEventListener('toolActivated', (event) => {
        this.setToolInfo(event.detail.tool);
      });

      this.editor.addEventListener('geometryCreated', (event) => {
        this.updateSceneInfo();
      });

      this.editor.addEventListener('objectsDeleted', (event) => {
        this.updateSceneInfo();
      });
    }
  }

  // Set status text
  setStatus(text) {
    if (this.statusText) {
      this.statusText.textContent = text;
    }
  }

  // Show progress
  showProgress(progress = 0) {
    if (this.progressBar) {
      this.progressBar.style.display = 'block';
      const fill = this.progressBar.querySelector('.progress-fill');
      if (fill) {
        fill.style.width = `${progress}%`;
      }
    }
  }

  // Hide progress
  hideProgress() {
    if (this.progressBar) {
      this.progressBar.style.display = 'none';
    }
  }

  // Set tool info
  setToolInfo(toolName) {
    if (this.toolInfo) {
      this.toolInfo.textContent = `Tool: ${toolName}`;
    }
  }

  // Update scene info
  updateSceneInfo() {
    if (this.sceneInfo && this.editor) {
      const objects = this.editor.getSceneObjects();
      this.sceneInfo.textContent = `Objects: ${objects.length}`;
    }
  }

  // Update performance info
  updatePerformanceInfo(fps) {
    if (this.performanceInfo) {
      this.performanceInfo.textContent = `FPS: ${Math.round(fps)}`;
    }
  }

  // Show temporary message
  showMessage(message, duration = 3000) {
    this.setStatus(message);
    setTimeout(() => {
      this.setStatus('Ready');
    }, duration);
  }

  // Show error message
  showError(message, duration = 5000) {
    this.setStatus(`Error: ${message}`);
    setTimeout(() => {
      this.setStatus('Ready');
    }, duration);
  }

  // Show success message
  showSuccess(message, duration = 3000) {
    this.setStatus(`Success: ${message}`);
    setTimeout(() => {
      this.setStatus('Ready');
    }, duration);
  }

  // Update status bar
  update() {
    // Update scene info
    this.updateSceneInfo();

    // Update performance if available
    if (this.editor && this.editor.renderer) {
      // This would need to be implemented with actual FPS tracking
      // For now, just show a placeholder
      this.updatePerformanceInfo(60);
    }
  }

  // Get status text
  getStatusText() {
    return this.statusText ? this.statusText.textContent : '';
  }

  // Get progress value
  getProgress() {
    const fill = this.progressBar ? this.progressBar.querySelector('.progress-fill') : null;
    if (fill) {
      const width = fill.style.width;
      return parseInt(width) || 0;
    }
    return 0;
  }

  // Dispose status bar
  dispose() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
} 