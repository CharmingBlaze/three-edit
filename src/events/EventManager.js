/**
 * @fileoverview Event Manager
 * Core event management system for the 3D editor
 */

/**
 * Event Manager for handling application-wide events
 */
export class EventManager {
  /**
   * Create an event manager
   * @param {Object} options - Configuration options
   * @param {boolean} options.debug - Enable debug logging
   * @param {number} options.maxListeners - Maximum listeners per event
   */
  constructor(options = {}) {
    const {
      debug = false,
      maxListeners = 50
    } = options;

    this.debug = debug;
    this.maxListeners = maxListeners;
    this.listeners = new Map();
    this.onceListeners = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @param {Object} options - Listener options
   * @returns {Function} Unsubscribe function
   */
  on(event, callback, options = {}) {
    const {
      priority = 0,
      context = null
    } = options;

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const eventListeners = this.listeners.get(event);
    
    if (eventListeners.length >= this.maxListeners) {
      console.warn(`Maximum listeners (${this.maxListeners}) reached for event: ${event}`);
    }

    const listener = { callback, priority, context };
    eventListeners.push(listener);
    
    // Sort by priority (higher priority first)
    eventListeners.sort((a, b) => b.priority - a.priority);

    if (this.debug) {
      console.log(`Event listener added: ${event}`);
    }

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Add one-time event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @param {Object} options - Listener options
   * @returns {Function} Unsubscribe function
   */
  once(event, callback, options = {}) {
    const wrappedCallback = (...args) => {
      callback.apply(options.context || this, args);
      this.off(event, wrappedCallback);
    };

    return this.on(event, wrappedCallback, options);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {boolean} Success status
   */
  off(event, callback) {
    if (!this.listeners.has(event)) {
      return false;
    }

    const eventListeners = this.listeners.get(event);
    const index = eventListeners.findIndex(listener => listener.callback === callback);
    
    if (index !== -1) {
      eventListeners.splice(index, 1);
      
      if (this.debug) {
        console.log(`Event listener removed: ${event}`);
      }
      
      return true;
    }

    return false;
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name
   * @returns {number} Number of listeners removed
   */
  removeAllListeners(event) {
    if (!this.listeners.has(event)) {
      return 0;
    }

    const count = this.listeners.get(event).length;
    this.listeners.delete(event);
    
    if (this.debug) {
      console.log(`Removed all listeners for event: ${event} (${count} listeners)`);
    }
    
    return count;
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {...*} args - Event arguments
   * @returns {boolean} Success status
   */
  emit(event, ...args) {
    if (this.debug) {
      console.log(`Emitting event: ${event}`, args);
    }

    // Add to history
    this.addToHistory(event, args);

    // Get listeners
    const eventListeners = this.listeners.get(event) || [];
    
    if (eventListeners.length === 0) {
      return false;
    }

    // Call listeners
    let hasError = false;
    eventListeners.forEach(listener => {
      try {
        listener.callback.apply(listener.context || this, args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
        hasError = true;
      }
    });

    return !hasError;
  }

  /**
   * Add event to history
   * @param {string} event - Event name
   * @param {Array} args - Event arguments
   */
  addToHistory(event, args) {
    this.eventHistory.push({
      event,
      args,
      timestamp: Date.now()
    });

    // Maintain history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Get event history
   * @param {Object} options - History options
   * @param {string} options.event - Filter by event name
   * @param {number} options.limit - Limit number of events
   * @param {number} options.since - Get events since timestamp
   * @returns {Array} Event history
   */
  getHistory(options = {}) {
    const {
      event = null,
      limit = null,
      since = null
    } = options;

    let history = [...this.eventHistory];

    // Filter by event
    if (event) {
      history = history.filter(entry => entry.event === event);
    }

    // Filter by timestamp
    if (since) {
      history = history.filter(entry => entry.timestamp >= since);
    }

    // Apply limit
    if (limit) {
      history = history.slice(-limit);
    }

    return history;
  }

  /**
   * Clear event history
   */
  clearHistory() {
    this.eventHistory = [];
  }

  /**
   * Get listener count for event
   * @param {string} event - Event name
   * @returns {number} Listener count
   */
  getListenerCount(event) {
    return this.listeners.get(event)?.length || 0;
  }

  /**
   * Get all registered events
   * @returns {string[]} Event names
   */
  getRegisteredEvents() {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get event statistics
   * @returns {Object} Event statistics
   */
  getStatistics() {
    const stats = {
      totalEvents: this.getRegisteredEvents().length,
      totalListeners: 0,
      historySize: this.eventHistory.length,
      maxHistorySize: this.maxHistorySize
    };

    this.listeners.forEach((listeners, event) => {
      stats.totalListeners += listeners.length;
    });

    return stats;
  }

  /**
   * Destroy event manager
   */
  destroy() {
    this.listeners.clear();
    this.onceListeners.clear();
    this.eventHistory = [];
  }
} 