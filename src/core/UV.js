/**
 * @fileoverview UV Class
 * Represents UV coordinates for texture mapping
 */

/**
 * Represents UV coordinates for texture mapping
 */
export class UV {
  /**
   * @param {number} u - U coordinate (horizontal)
   * @param {number} v - V coordinate (vertical)
   * @param {string} vertexId - Associated vertex ID
   */
  constructor(u, v, vertexId) {
    this.u = u;
    this.v = v;
    this.vertexId = vertexId;
  }

  /**
   * Clone this UV coordinate
   * @returns {UV} New UV instance
   */
  clone() {
    return new UV(this.u, this.v, this.vertexId);
  }

  /**
   * Get UV coordinates as array
   * @returns {number[]} [u, v]
   */
  toArray() {
    return [this.u, this.v];
  }

  /**
   * Set UV coordinates from array
   * @param {number[]} array - [u, v]
   */
  fromArray(array) {
    this.u = array[0];
    this.v = array[1];
  }

  /**
   * Add another UV coordinate to this one
   * @param {UV} other - UV coordinate to add
   * @returns {UV} This UV coordinate (for chaining)
   */
  add(other) {
    this.u += other.u;
    this.v += other.v;
    return this;
  }

  /**
   * Subtract another UV coordinate from this one
   * @param {UV} other - UV coordinate to subtract
   * @returns {UV} This UV coordinate (for chaining)
   */
  subtract(other) {
    this.u -= other.u;
    this.v -= other.v;
    return this;
  }

  /**
   * Multiply this UV coordinate by a scalar
   * @param {number} scalar - Scalar value
   * @returns {UV} This UV coordinate (for chaining)
   */
  multiplyScalar(scalar) {
    this.u *= scalar;
    this.v *= scalar;
    return this;
  }

  /**
   * Scale this UV coordinate around a center point
   * @param {number} scaleU - U scale factor
   * @param {number} scaleV - V scale factor
   * @param {number} [centerU=0.5] - U center point
   * @param {number} [centerV=0.5] - V center point
   * @returns {UV} This UV coordinate (for chaining)
   */
  scale(scaleU, scaleV, centerU = 0.5, centerV = 0.5) {
    this.u = (this.u - centerU) * scaleU + centerU;
    this.v = (this.v - centerV) * scaleV + centerV;
    return this;
  }

  /**
   * Rotate this UV coordinate around a center point
   * @param {number} angle - Rotation angle in radians
   * @param {number} [centerU=0.5] - U center point
   * @param {number} [centerV=0.5] - V center point
   * @returns {UV} This UV coordinate (for chaining)
   */
  rotate(angle, centerU = 0.5, centerV = 0.5) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    const u = this.u - centerU;
    const v = this.v - centerV;
    
    this.u = u * cos - v * sin + centerU;
    this.v = u * sin + v * cos + centerV;
    
    return this;
  }

  /**
   * Translate this UV coordinate
   * @param {number} offsetU - U offset
   * @param {number} offsetV - V offset
   * @returns {UV} This UV coordinate (for chaining)
   */
  translate(offsetU, offsetV) {
    this.u += offsetU;
    this.v += offsetV;
    return this;
  }

  /**
   * Clamp UV coordinates to valid range [0, 1]
   * @returns {UV} This UV coordinate (for chaining)
   */
  clamp() {
    this.u = Math.max(0, Math.min(1, this.u));
    this.v = Math.max(0, Math.min(1, this.v));
    return this;
  }

  /**
   * Wrap UV coordinates (repeat texture)
   * @returns {UV} This UV coordinate (for chaining)
   */
  wrap() {
    this.u = ((this.u % 1) + 1) % 1;
    this.v = ((this.v % 1) + 1) % 1;
    return this;
  }

  /**
   * Mirror UV coordinates
   * @param {boolean} [mirrorU=false] - Mirror in U direction
   * @param {boolean} [mirrorV=false] - Mirror in V direction
   * @returns {UV} This UV coordinate (for chaining)
   */
  mirror(mirrorU = false, mirrorV = false) {
    if (mirrorU) {
      this.u = 1 - this.u;
    }
    if (mirrorV) {
      this.v = 1 - this.v;
    }
    return this;
  }

  /**
   * Get distance to another UV coordinate
   * @param {UV} other - Other UV coordinate
   * @returns {number} Distance
   */
  distanceTo(other) {
    const du = this.u - other.u;
    const dv = this.v - other.v;
    return Math.sqrt(du * du + dv * dv);
  }

  /**
   * Get squared distance to another UV coordinate (faster than distanceTo)
   * @param {UV} other - Other UV coordinate
   * @returns {number} Squared distance
   */
  distanceToSquared(other) {
    const du = this.u - other.u;
    const dv = this.v - other.v;
    return du * du + dv * dv;
  }

  /**
   * Check if this UV coordinate equals another
   * @param {UV} other - Other UV coordinate
   * @param {number} [tolerance=1e-6] - Tolerance for comparison
   * @returns {boolean} True if coordinates are equal within tolerance
   */
  equals(other, tolerance = 1e-6) {
    return Math.abs(this.u - other.u) < tolerance && 
           Math.abs(this.v - other.v) < tolerance;
  }

  /**
   * Interpolate between this UV coordinate and another
   * @param {UV} other - Other UV coordinate
   * @param {number} t - Interpolation factor (0-1)
   * @returns {UV} New interpolated UV coordinate
   */
  lerp(other, t) {
    return new UV(
      this.u + (other.u - this.u) * t,
      this.v + (other.v - this.v) * t,
      this.vertexId
    );
  }

  /**
   * Check if UV coordinates are valid (within [0, 1] range)
   * @returns {boolean} True if coordinates are valid
   */
  isValid() {
    return this.u >= 0 && this.u <= 1 && this.v >= 0 && this.v <= 1;
  }

  /**
   * Get the center point between this UV and another
   * @param {UV} other - Other UV coordinate
   * @returns {UV} Center UV coordinate
   */
  getCenter(other) {
    return new UV(
      (this.u + other.u) / 2,
      (this.v + other.v) / 2,
      this.vertexId
    );
  }

  /**
   * Convert to string representation
   * @returns {string} String representation
   */
  toString() {
    return `UV(${this.u.toFixed(3)}, ${this.v.toFixed(3)})`;
  }
} 