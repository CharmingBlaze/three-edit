import { Color } from 'three';

/**
 * Interface for material properties
 */
export interface MaterialProperties {
  /** Material name */
  name?: string;
  /** Material color */
  color?: Color | string | number;
  /** Opacity (0-1) */
  opacity?: number;
  /** Whether the material is transparent */
  transparent?: boolean;
  /** Whether to render both sides */
  doubleSided?: boolean;
  /** Whether the material is wireframe */
  wireframe?: boolean;
  /** Custom user data */
  userData?: Record<string, any>;
}

/**
 * Class representing a material in the EditableMesh system
 */
export class Material {
  /** Material name */
  name: string;
  /** Material color */
  color: Color;
  /** Opacity (0-1) */
  opacity: number;
  /** Whether the material is transparent */
  transparent: boolean;
  /** Whether to render both sides */
  doubleSided: boolean;
  /** Whether the material is wireframe */
  wireframe: boolean;
  /** Custom user data */
  userData: Record<string, any>;
  
  /**
   * Creates a new Material
   * @param properties Material properties
   */
  constructor(properties: MaterialProperties = {}) {
    this.name = properties.name ?? 'Material';
    this.color = properties.color instanceof Color 
      ? properties.color.clone() 
      : new Color(properties.color ?? 0xcccccc);
    this.opacity = properties.opacity ?? 1.0;
    this.transparent = properties.transparent ?? (this.opacity < 1.0);
    this.doubleSided = properties.doubleSided ?? false;
    this.wireframe = properties.wireframe ?? false;
    this.userData = { ...properties.userData };
  }
  
  /**
   * Creates a clone of this material
   * @returns A new Material instance with the same properties
   */
  clone(): Material {
    return new Material({
      name: this.name,
      color: this.color.clone(),
      opacity: this.opacity,
      transparent: this.transparent,
      doubleSided: this.doubleSided,
      wireframe: this.wireframe,
      userData: { ...this.userData }
    });
  }
  
  /**
   * Sets the color of the material
   * @param color The new color
   * @returns This material for chaining
   */
  setColor(color: Color | string | number): Material {
    this.color = color instanceof Color ? color.clone() : new Color(color);
    return this;
  }
  
  /**
   * Sets the opacity of the material
   * @param opacity The new opacity (0-1)
   * @returns This material for chaining
   */
  setOpacity(opacity: number): Material {
    this.opacity = Math.max(0, Math.min(1, opacity));
    if (opacity < 1.0 && !this.transparent) {
      this.transparent = true;
    }
    return this;
  }
  
  /**
   * Sets whether the material is transparent
   * @param transparent Whether the material is transparent
   * @returns This material for chaining
   */
  setTransparent(transparent: boolean): Material {
    this.transparent = transparent;
    return this;
  }
  
  /**
   * Sets whether the material is double-sided
   * @param doubleSided Whether the material is double-sided
   * @returns This material for chaining
   */
  setDoubleSided(doubleSided: boolean): Material {
    this.doubleSided = doubleSided;
    return this;
  }
  
  /**
   * Sets whether the material is wireframe
   * @param wireframe Whether the material is wireframe
   * @returns This material for chaining
   */
  setWireframe(wireframe: boolean): Material {
    this.wireframe = wireframe;
    return this;
  }
}
