/**
 * @fileoverview Rendering Types and Constants
 * Defines types, constants, and enums for the rendering system
 */

/**
 * Rendering quality levels
 */
export const RenderQuality = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  ULTRA: 'ultra'
};

/**
 * Post-processing effect types
 */
export const PostProcessType = {
  BLOOM: 'bloom',
  BLOOM: 'bloom',
  DEPTH_OF_FIELD: 'dof',
  MOTION_BLUR: 'motionBlur',
  CHROMATIC_ABERRATION: 'chromaticAberration',
  VIGNETTE: 'vignette',
  GRAIN: 'grain',
  SHARPNESS: 'sharpness'
};

/**
 * Shader types
 */
export const ShaderType = {
  VERTEX: 'vertex',
  FRAGMENT: 'fragment',
  COMPUTE: 'compute'
};

/**
 * Lighting types
 */
export const LightingType = {
  AMBIENT: 'ambient',
  DIRECTIONAL: 'directional',
  POINT: 'point',
  SPOT: 'spot',
  AREA: 'area'
};

/**
 * Render result structure
 */
export class RenderResult {
  constructor(success = true, data = null, error = null) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.timestamp = Date.now();
  }

  static success(data) {
    return new RenderResult(true, data);
  }

  static error(error) {
    return new RenderResult(false, null, error);
  }
}

/**
 * Post-processing effect configuration
 */
export class PostProcessEffect {
  constructor(type, enabled = true, parameters = {}) {
    this.type = type;
    this.enabled = enabled;
    this.parameters = parameters;
  }

  setParameter(name, value) {
    this.parameters[name] = value;
  }

  getParameter(name) {
    return this.parameters[name];
  }
}

/**
 * Shader configuration
 */
export class ShaderConfig {
  constructor(name, vertexShader, fragmentShader, uniforms = {}) {
    this.name = name;
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.uniforms = uniforms;
  }

  addUniform(name, type, value) {
    this.uniforms[name] = { type, value };
  }

  getUniform(name) {
    return this.uniforms[name];
  }
}

/**
 * Lighting configuration
 */
export class LightingConfig {
  constructor(type, color = 0xffffff, intensity = 1.0, position = null) {
    this.type = type;
    this.color = color;
    this.intensity = intensity;
    this.position = position;
    this.parameters = {};
  }

  setParameter(name, value) {
    this.parameters[name] = value;
  }

  getParameter(name) {
    return this.parameters[name];
  }
} 