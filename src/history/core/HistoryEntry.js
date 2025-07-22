/**
 * @fileoverview History Entry for 3D Editor
 * Represents a single history entry with operation data and metadata
 */

/**
 * History Entry Class
 * Represents a single operation in the history stack
 */
export class HistoryEntry {
  /**
   * Create a new history entry
   * @param {Object} config - Entry configuration
   * @param {string} config.id - Entry ID
   * @param {string} config.type - Operation type
   * @param {Object} config.data - Operation data
   * @param {Object} config.metadata - Entry metadata
   * @param {number} config.timestamp - Entry timestamp
   * @param {string} config.description - Human-readable description
   * @param {number} config.priority - Entry priority
   * @param {boolean} config.mergeable - Whether entry can be merged
   * @param {string} config.branch - Branch name
   */
  constructor(config = {}) {
    const {
      id = this.generateId(),
      type = 'unknown',
      data = {},
      metadata = {},
      timestamp = Date.now(),
      description = '',
      priority = 0,
      mergeable = false,
      branch = 'main'
    } = config;

    this.id = id;
    this.type = type;
    this.data = { ...data };
    this.metadata = { ...metadata };
    this.timestamp = timestamp;
    this.description = description;
    this.priority = priority;
    this.mergeable = mergeable;
    this.branch = branch;
    this.size = 0;
    this.compressed = false;
  }

  /**
   * Generate unique entry ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clone the history entry
   * @returns {HistoryEntry} Cloned entry
   */
  clone() {
    return new HistoryEntry({
      id: this.id,
      type: this.type,
      data: { ...this.data },
      metadata: { ...this.metadata },
      timestamp: this.timestamp,
      description: this.description,
      priority: this.priority,
      mergeable: this.mergeable,
      branch: this.branch
    });
  }

  /**
   * Get entry size in bytes
   * @returns {number} Entry size
   */
  getSize() {
    if (this.size > 0) {
      return this.size;
    }

    const serialized = JSON.stringify(this);
    this.size = new Blob([serialized]).size;
    return this.size;
  }

  /**
   * Check if entry can be merged with another
   * @param {HistoryEntry} other - Other entry to check
   * @returns {boolean} True if entries can be merged
   */
  canMergeWith(other) {
    if (!this.mergeable || !other.mergeable) {
      return false;
    }

    if (this.type !== other.type) {
      return false;
    }

    if (this.branch !== other.branch) {
      return false;
    }

    // Check if entries are close in time (within 1 second)
    const timeDiff = Math.abs(this.timestamp - other.timestamp);
    if (timeDiff > 1000) {
      return false;
    }

    return true;
  }

  /**
   * Merge with another entry
   * @param {HistoryEntry} other - Entry to merge with
   * @returns {HistoryEntry} Merged entry
   */
  merge(other) {
    if (!this.canMergeWith(other)) {
      throw new Error('Cannot merge these entries');
    }

    const merged = this.clone();
    merged.timestamp = Math.max(this.timestamp, other.timestamp);
    merged.description = `${this.description} + ${other.description}`;
    
    // Merge data based on type
    switch (this.type) {
      case 'vertex_move':
        merged.data.vertices = { ...this.data.vertices, ...other.data.vertices };
        break;
      case 'face_create':
        merged.data.faces = [...(this.data.faces || []), ...(other.data.faces || [])];
        break;
      case 'edge_delete':
        merged.data.edges = [...(this.data.edges || []), ...(other.data.edges || [])];
        break;
      default:
        merged.data = { ...this.data, ...other.data };
    }

    return merged;
  }

  /**
   * Compress entry data
   * @returns {boolean} Success status
   */
  compress() {
    if (this.compressed) {
      return true;
    }

    try {
      // Simple compression: remove unnecessary data
      if (this.data.vertices) {
        Object.keys(this.data.vertices).forEach(key => {
          const vertex = this.data.vertices[key];
          if (vertex.x === 0 && vertex.y === 0 && vertex.z === 0) {
            delete this.data.vertices[key];
          }
        });
      }

      this.compressed = true;
      this.size = 0; // Reset size for recalculation
      return true;
    } catch (error) {
      console.error('Failed to compress history entry:', error);
      return false;
    }
  }

  /**
   * Decompress entry data
   * @returns {boolean} Success status
   */
  decompress() {
    if (!this.compressed) {
      return true;
    }

    try {
      // Restore compressed data
      this.compressed = false;
      this.size = 0; // Reset size for recalculation
      return true;
    } catch (error) {
      console.error('Failed to decompress history entry:', error);
      return false;
    }
  }

  /**
   * Validate entry data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Check required fields
    if (!this.id) {
      errors.push('Entry ID is required');
    }

    if (!this.type) {
      errors.push('Entry type is required');
    }

    if (!this.timestamp || this.timestamp <= 0) {
      errors.push('Valid timestamp is required');
    }

    // Check data integrity
    if (!this.data || typeof this.data !== 'object') {
      errors.push('Entry data must be an object');
    }

    // Check metadata
    if (!this.metadata || typeof this.metadata !== 'object') {
      warnings.push('Entry metadata should be an object');
    }

    // Check size limits
    const size = this.getSize();
    if (size > 1024 * 1024) { // 1MB limit
      warnings.push('Entry size is very large');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      size
    };
  }

  /**
   * Get entry summary
   * @returns {Object} Entry summary
   */
  getSummary() {
    return {
      id: this.id,
      type: this.type,
      description: this.description,
      timestamp: this.timestamp,
      size: this.getSize(),
      branch: this.branch,
      mergeable: this.mergeable,
      compressed: this.compressed
    };
  }

  /**
   * Serialize entry to JSON
   * @returns {string} Serialized entry
   */
  toJSON() {
    return JSON.stringify({
      id: this.id,
      type: this.type,
      data: this.data,
      metadata: this.metadata,
      timestamp: this.timestamp,
      description: this.description,
      priority: this.priority,
      mergeable: this.mergeable,
      branch: this.branch,
      compressed: this.compressed
    });
  }

  /**
   * Create entry from JSON
   * @param {string} json - Serialized entry
   * @returns {HistoryEntry} Created entry
   */
  static fromJSON(json) {
    try {
      const data = JSON.parse(json);
      return new HistoryEntry(data);
    } catch (error) {
      console.error('Failed to create entry from JSON:', error);
      return null;
    }
  }
} 