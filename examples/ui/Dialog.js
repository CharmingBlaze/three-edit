/**
 * Dialog - Modal dialog component
 */

export default class Dialog {
  constructor(editor, container, options = {}) {
    this.editor = editor;
    this.container = container;
    this.options = {
      title: options.title || 'Dialog',
      content: options.content || '',
      buttons: options.buttons || [],
      width: options.width || 400,
      height: options.height || 300,
      ...options
    };

    this.element = null;
    this.overlay = null;
    this.isVisible = false;
    this.onClose = null;

    this.createDialog();
  }

  // Create dialog
  createDialog() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'dialog-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: none;
      backdrop-filter: blur(2px);
    `;

    // Create dialog
    this.element = document.createElement('div');
    this.element.className = 'dialog';
    this.element.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${this.options.width}px;
      max-height: ${this.options.height}px;
      background: rgba(40, 40, 40, 0.95);
      border: 1px solid #666;
      border-radius: 8px;
      z-index: 1001;
      display: none;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      color: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    this.container.appendChild(this.overlay);
    this.overlay.appendChild(this.element);
  }

  // Show dialog
  show(content = null, buttons = null) {
    if (content) {
      this.options.content = content;
    }
    if (buttons) {
      this.options.buttons = buttons;
    }

    this.createContent();
    this.overlay.style.display = 'block';
    this.element.style.display = 'block';
    this.isVisible = true;

    // Focus first input if any
    const firstInput = this.element.querySelector('input, textarea, select');
    if (firstInput) {
      firstInput.focus();
    }
  }

  // Hide dialog
  hide() {
    this.overlay.style.display = 'none';
    this.element.style.display = 'none';
    this.isVisible = false;

    if (this.onClose) {
      this.onClose();
    }
  }

  // Create dialog content
  createContent() {
    this.element.innerHTML = `
      <div class="dialog-header">
        <h3>${this.options.title}</h3>
        <button class="dialog-close">&times;</button>
      </div>
      <div class="dialog-content">
        ${this.options.content}
      </div>
      <div class="dialog-footer">
        ${this.createButtons()}
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #444;
      }
      .dialog-header h3 {
        margin: 0;
        color: #fff;
        font-size: 16px;
      }
      .dialog-close {
        background: none;
        border: none;
        color: #ccc;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
      }
      .dialog-close:hover {
        background-color: #555;
      }
      .dialog-content {
        padding: 20px;
        max-height: 400px;
        overflow-y: auto;
      }
      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 15px 20px;
        border-top: 1px solid #444;
      }
      .dialog-button {
        background: #555;
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s;
      }
      .dialog-button:hover {
        background: #666;
      }
      .dialog-button.primary {
        background: #007acc;
      }
      .dialog-button.primary:hover {
        background: #005a9e;
      }
      .dialog-button.danger {
        background: #d32f2f;
      }
      .dialog-button.danger:hover {
        background: #b71c1c;
      }
      .dialog-input {
        width: 100%;
        padding: 8px 12px;
        background: #333;
        border: 1px solid #555;
        color: white;
        border-radius: 4px;
        font-size: 14px;
        margin-bottom: 10px;
      }
      .dialog-input:focus {
        outline: none;
        border-color: #007acc;
      }
      .dialog-label {
        display: block;
        margin-bottom: 5px;
        color: #ccc;
        font-size: 12px;
      }
    `;
    document.head.appendChild(style);

    // Setup event listeners
    this.setupEventListeners();
  }

  // Create buttons
  createButtons() {
    if (this.options.buttons.length === 0) {
      return '<button class="dialog-button primary" data-action="ok">OK</button>';
    }

    return this.options.buttons.map(button => {
      const className = `dialog-button ${button.class || ''}`;
      return `<button class="${className}" data-action="${button.action}">${button.label}</button>`;
    }).join('');
  }

  // Setup event listeners
  setupEventListeners() {
    // Close button
    const closeBtn = this.element.querySelector('.dialog-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    // Button clicks
    const buttons = this.element.querySelectorAll('.dialog-button');
    buttons.forEach(button => {
      button.addEventListener('click', (event) => {
        const action = event.target.dataset.action;
        this.handleButtonClick(action);
      });
    });

    // Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });

    // Click outside to close
    this.overlay.addEventListener('click', (event) => {
      if (event.target === this.overlay) {
        this.hide();
      }
    });
  }

  // Handle button click
  handleButtonClick(action) {
    switch (action) {
      case 'ok':
      case 'close':
        this.hide();
        break;
      case 'cancel':
        this.hide();
        break;
      default:
        // Custom action
        if (this.options.onButtonClick) {
          this.options.onButtonClick(action);
        }
        break;
    }
  }

  // Create input dialog
  static createInputDialog(editor, container, title, defaultValue = '', placeholder = '') {
    const dialog = new Dialog(editor, container, {
      title: title,
      content: `
        <label class="dialog-label">${title}:</label>
        <input type="text" class="dialog-input" value="${defaultValue}" placeholder="${placeholder}">
      `,
      buttons: [
        { label: 'Cancel', action: 'cancel' },
        { label: 'OK', action: 'ok', class: 'primary' }
      ]
    });

    return new Promise((resolve) => {
      dialog.options.onButtonClick = (action) => {
        if (action === 'ok') {
          const input = dialog.element.querySelector('.dialog-input');
          resolve(input.value);
        } else {
          resolve(null);
        }
      };
      dialog.show();
    });
  }

  // Create confirmation dialog
  static createConfirmDialog(editor, container, title, message) {
    const dialog = new Dialog(editor, container, {
      title: title,
      content: `<p>${message}</p>`,
      buttons: [
        { label: 'Cancel', action: 'cancel' },
        { label: 'Confirm', action: 'confirm', class: 'danger' }
      ]
    });

    return new Promise((resolve) => {
      dialog.options.onButtonClick = (action) => {
        resolve(action === 'confirm');
      };
      dialog.show();
    });
  }

  // Create alert dialog
  static createAlertDialog(editor, container, title, message) {
    const dialog = new Dialog(editor, container, {
      title: title,
      content: `<p>${message}</p>`,
      buttons: [
        { label: 'OK', action: 'ok', class: 'primary' }
      ]
    });

    return new Promise((resolve) => {
      dialog.options.onButtonClick = () => {
        resolve();
      };
      dialog.show();
    });
  }

  // Check if dialog is visible
  isDialogVisible() {
    return this.isVisible;
  }

  // Set on close callback
  setOnClose(callback) {
    this.onClose = callback;
  }

  // Dispose dialog
  dispose() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
} 