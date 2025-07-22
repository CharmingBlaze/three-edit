/**
 * UI Utilities - Helper functions for UI components
 */

/**
 * Create a button element
 * @param {string} text - Button text
 * @param {Object} options - Button options
 * @returns {HTMLElement} Button element
 */
export function createButton(text, options = {}) {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = options.className || 'ui-button';
  
  const style = options.style || {};
  Object.assign(button.style, {
    background: '#555',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background-color 0.2s',
    ...style
  });

  if (options.onClick) {
    button.addEventListener('click', options.onClick);
  }

  return button;
}

/**
 * Create an input element
 * @param {string} type - Input type
 * @param {Object} options - Input options
 * @returns {HTMLElement} Input element
 */
export function createInput(type, options = {}) {
  const input = document.createElement('input');
  input.type = type;
  input.className = options.className || 'ui-input';
  
  if (options.placeholder) {
    input.placeholder = options.placeholder;
  }
  
  if (options.value) {
    input.value = options.value;
  }

  const style = options.style || {};
  Object.assign(input.style, {
    background: '#333',
    border: '1px solid #555',
    color: 'white',
    padding: '6px 10px',
    borderRadius: '3px',
    fontSize: '12px',
    ...style
  });

  if (options.onChange) {
    input.addEventListener('change', options.onChange);
  }

  return input;
}

/**
 * Create a label element
 * @param {string} text - Label text
 * @param {Object} options - Label options
 * @returns {HTMLElement} Label element
 */
export function createLabel(text, options = {}) {
  const label = document.createElement('label');
  label.textContent = text;
  label.className = options.className || 'ui-label';
  
  const style = options.style || {};
  Object.assign(label.style, {
    color: '#ccc',
    fontSize: '12px',
    marginBottom: '5px',
    display: 'block',
    ...style
  });

  return label;
}

/**
 * Create a select element
 * @param {Array} options - Select options
 * @param {Object} config - Select configuration
 * @returns {HTMLElement} Select element
 */
export function createSelect(options, config = {}) {
  const select = document.createElement('select');
  select.className = config.className || 'ui-select';
  
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    select.appendChild(optionElement);
  });

  const style = config.style || {};
  Object.assign(select.style, {
    background: '#333',
    border: '1px solid #555',
    color: 'white',
    padding: '6px 10px',
    borderRadius: '3px',
    fontSize: '12px',
    ...style
  });

  if (config.onChange) {
    select.addEventListener('change', config.onChange);
  }

  return select;
}

/**
 * Create a checkbox element
 * @param {string} text - Checkbox text
 * @param {Object} options - Checkbox options
 * @returns {HTMLElement} Checkbox container
 */
export function createCheckbox(text, options = {}) {
  const container = document.createElement('div');
  container.className = options.className || 'ui-checkbox';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = options.checked || false;
  
  const label = document.createElement('label');
  label.textContent = text;
  
  container.appendChild(checkbox);
  container.appendChild(label);
  
  Object.assign(container.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#ccc',
    fontSize: '12px',
    ...options.style
  });

  if (options.onChange) {
    checkbox.addEventListener('change', options.onChange);
  }

  return container;
}

/**
 * Create a slider element
 * @param {Object} options - Slider options
 * @returns {HTMLElement} Slider element
 */
export function createSlider(options = {}) {
  const container = document.createElement('div');
  container.className = options.className || 'ui-slider';
  
  const label = document.createElement('label');
  label.textContent = options.label || '';
  
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = options.min || 0;
  slider.max = options.max || 100;
  slider.value = options.value || 0;
  slider.step = options.step || 1;
  
  const value = document.createElement('span');
  value.textContent = slider.value;
  
  container.appendChild(label);
  container.appendChild(slider);
  container.appendChild(value);
  
  Object.assign(container.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#ccc',
    fontSize: '12px',
    ...options.style
  });

  Object.assign(slider.style, {
    flex: 1,
    background: '#333',
    border: '1px solid #555',
    borderRadius: '3px',
    height: '6px',
    outline: 'none'
  });

  slider.addEventListener('input', () => {
    value.textContent = slider.value;
    if (options.onChange) {
      options.onChange(parseFloat(slider.value));
    }
  });

  return container;
}

/**
 * Create a color picker element
 * @param {string} color - Initial color
 * @param {Object} options - Color picker options
 * @returns {HTMLElement} Color picker element
 */
export function createColorPicker(color = '#ffffff', options = {}) {
  const container = document.createElement('div');
  container.className = options.className || 'ui-color-picker';
  
  const label = document.createElement('label');
  label.textContent = options.label || 'Color:';
  
  const picker = document.createElement('input');
  picker.type = 'color';
  picker.value = color;
  
  container.appendChild(label);
  container.appendChild(picker);
  
  Object.assign(container.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#ccc',
    fontSize: '12px',
    ...options.style
  });

  picker.addEventListener('change', () => {
    if (options.onChange) {
      options.onChange(picker.value);
    }
  });

  return container;
}

/**
 * Create a group container
 * @param {string} title - Group title
 * @param {Array} children - Child elements
 * @param {Object} options - Group options
 * @returns {HTMLElement} Group container
 */
export function createGroup(title, children = [], options = {}) {
  const container = document.createElement('div');
  container.className = options.className || 'ui-group';
  
  const header = document.createElement('div');
  header.className = 'ui-group-header';
  header.textContent = title;
  
  const content = document.createElement('div');
  content.className = 'ui-group-content';
  
  children.forEach(child => {
    content.appendChild(child);
  });
  
  container.appendChild(header);
  container.appendChild(content);
  
  Object.assign(container.style, {
    border: '1px solid #444',
    borderRadius: '4px',
    marginBottom: '10px',
    ...options.style
  });

  Object.assign(header.style, {
    background: '#444',
    padding: '8px 12px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 'bold',
    borderBottom: '1px solid #555'
  });

  Object.assign(content.style, {
    padding: '10px',
    background: '#333'
  });

  return container;
}

/**
 * Create a modal dialog
 * @param {string} title - Dialog title
 * @param {HTMLElement} content - Dialog content
 * @param {Array} buttons - Dialog buttons
 * @returns {Promise} Promise that resolves when dialog is closed
 */
export function createModal(title, content, buttons = []) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: #333;
      border: 1px solid #555;
      border-radius: 8px;
      padding: 20px;
      min-width: 300px;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
    `;

    const header = document.createElement('h3');
    header.textContent = title;
    header.style.cssText = `
      margin: 0 0 15px 0;
      color: #fff;
      font-size: 16px;
    `;

    const contentDiv = document.createElement('div');
    contentDiv.appendChild(content);
    contentDiv.style.marginBottom = '20px';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    `;

    buttons.forEach(button => {
      const btn = createButton(button.text, {
        onClick: () => {
          document.body.removeChild(overlay);
          resolve(button.value);
        }
      });
      buttonContainer.appendChild(btn);
    });

    modal.appendChild(header);
    modal.appendChild(contentDiv);
    modal.appendChild(buttonContainer);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        document.body.removeChild(overlay);
        resolve(null);
      }
    });
  });
}

/**
 * Show a toast notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    border: 1px solid #555;
    border-radius: 4px;
    padding: 12px 16px;
    color: white;
    font-size: 14px;
    z-index: 1001;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.innerHTML = `${icons[type] || icons.info} ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);

  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
} 