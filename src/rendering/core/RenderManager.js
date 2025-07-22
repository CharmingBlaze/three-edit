/**
 * @fileoverview Render Manager
 * Manages rendering operations, post-processing, and visual effects
 */

import { RenderQuality, RenderResult } from '../types/RenderingTypes.js';

/**
 * Render Manager class
 * Handles rendering operations and post-processing effects
 */
export class RenderManager {
  constructor(renderer = null) {
    this.renderer = renderer;
    this.scene = null;
    this.camera = null;
    this.postProcessors = [];
    this.quality = RenderQuality.MEDIUM;
    this.enabled = true;
  }

  /**
   * Set the Three.js renderer
   */
  setRenderer(renderer) {
    this.renderer = renderer;
    return RenderResult.success({ renderer: 'set' });
  }

  /**
   * Set the scene and camera
   */
  setScene(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    return RenderResult.success({ scene: 'set', camera: 'set' });
  }

  /**
   * Add a post-processor
   */
  addPostProcessor(postProcessor) {
    if (!postProcessor) {
      return RenderResult.error('Post-processor is required');
    }

    this.postProcessors.push(postProcessor);
    return RenderResult.success({ 
      postProcessor: 'added', 
      count: this.postProcessors.length 
    });
  }

  /**
   * Remove a post-processor
   */
  removePostProcessor(index) {
    if (index >= 0 && index < this.postProcessors.length) {
      this.postProcessors.splice(index, 1);
      return RenderResult.success({ 
        postProcessor: 'removed', 
        count: this.postProcessors.length 
      });
    }
    return RenderResult.error('Invalid post-processor index');
  }

  /**
   * Set rendering quality
   */
  setQuality(quality) {
    if (Object.values(RenderQuality).includes(quality)) {
      this.quality = quality;
      return RenderResult.success({ quality: 'set' });
    }
    return RenderResult.error('Invalid quality level');
  }

  /**
   * Enable or disable rendering
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    return RenderResult.success({ enabled: 'set' });
  }

  /**
   * Render the scene
   */
  render() {
    if (!this.enabled || !this.renderer || !this.scene || !this.camera) {
      return RenderResult.error('Rendering not properly configured');
    }

    try {
      // Apply post-processing effects
      if (this.postProcessors.length > 0) {
        this.applyPostProcessing();
      } else {
        this.renderer.render(this.scene, this.camera);
      }

      return RenderResult.success({ rendered: true });
    } catch (error) {
      return RenderResult.error(`Rendering failed: ${error.message}`);
    }
  }

  /**
   * Apply post-processing effects
   */
  applyPostProcessing() {
    // This is a simplified implementation
    // In a real implementation, you would use render targets and shaders
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Get rendering statistics
   */
  getStats() {
    if (!this.renderer) {
      return RenderResult.error('No renderer available');
    }

    const stats = {
      quality: this.quality,
      enabled: this.enabled,
      postProcessors: this.postProcessors.length,
      renderer: this.renderer ? 'available' : 'not set',
      scene: this.scene ? 'available' : 'not set',
      camera: this.camera ? 'available' : 'not set'
    };

    return RenderResult.success(stats);
  }

  /**
   * Clear all post-processors
   */
  clearPostProcessors() {
    this.postProcessors = [];
    return RenderResult.success({ postProcessors: 'cleared' });
  }

  /**
   * Get post-processor at index
   */
  getPostProcessor(index) {
    if (index >= 0 && index < this.postProcessors.length) {
      return RenderResult.success(this.postProcessors[index]);
    }
    return RenderResult.error('Invalid post-processor index');
  }
} 