/**
 * Notification - Toast notification component
 */

export default class Notification {
  constructor(editor, container, options = {}) {
    this.editor = editor;
    this.container = container;
    this.options = {
      duration: options.duration || 3000,
      position: options.position || 'top-right',
      ...options
    };

    this.notifications = [];
    this.createContainer();
  }

  // Create notification container
  createContainer() {
    this.element = document.createElement('div');
    this.element.className = 'notification-container';
    this.element.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      pointer-events: none;
    `;

    this.container.appendChild(this.element);
  }

  // Show notification
  show(message, type = 'info', duration = null) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      background: rgba(40, 40, 40, 0.95);
      border: 1px solid #666;
      border-radius: 4px;
      padding: 12px 16px;
      margin-bottom: 10px;
      color: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      max-width: 300px;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      pointer-events: auto;
      cursor: pointer;
      transition: all 0.3s ease;
      transform: translateX(100%);
      opacity: 0;
    `;

    // Add icon based on type
    const icon = this.getIcon(type);
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">${icon}</span>
        <span>${message}</span>
      </div>
    `;

    this.element.appendChild(notification);
    this.notifications.push(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 10);

    // Auto remove
    const autoRemove = () => {
      this.remove(notification);
    };

    const timeout = setTimeout(autoRemove, duration || this.options.duration);

    // Click to dismiss
    notification.addEventListener('click', () => {
      clearTimeout(timeout);
      this.remove(notification);
    });

    return notification;
  }

  // Remove notification
  remove(notification) {
    if (notification.parentNode) {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';

      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
          this.notifications.splice(index, 1);
        }
      }, 300);
    }
  }

  // Get icon for notification type
  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  // Show success notification
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  // Show error notification
  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  // Show warning notification
  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  // Show info notification
  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  // Clear all notifications
  clear() {
    this.notifications.forEach(notification => {
      this.remove(notification);
    });
  }

  // Get notification count
  getCount() {
    return this.notifications.length;
  }

  // Dispose notifications
  dispose() {
    this.clear();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
} 