/**
 * @fileoverview Math Utilities
 * Mathematical utility functions for the 3D editor
 * 
 * @deprecated Use the modular math functions from './math/' instead
 */

// Re-export all modular math functions for backward compatibility
export * from './math/index.js';

/**
 * Mathematical utility functions class
 * @deprecated Use individual functions from './math/' instead
 */
export class MathUtils {
  // Re-export all static methods from modular functions for backward compatibility
  static clamp = (await import('./math/basicMath.js')).clamp;
  static lerp = (await import('./math/basicMath.js')).lerp;
  static smoothLerp = (await import('./math/basicMath.js')).smoothLerp;
  static degToRad = (await import('./math/basicMath.js')).degToRad;
  static radToDeg = (await import('./math/basicMath.js')).radToDeg;
  static approximately = (await import('./math/basicMath.js')).approximately;
  static roundTo = (await import('./math/basicMath.js')).roundTo;
  
  static distance = (await import('./math/vectorMath.js')).distance;
  static distanceSquared = (await import('./math/vectorMath.js')).distanceSquared;
  static dot = (await import('./math/vectorMath.js')).dot;
  static cross = (await import('./math/vectorMath.js')).cross;
  static normalize = (await import('./math/vectorMath.js')).normalize;
  static length = (await import('./math/vectorMath.js')).length;
  static add = (await import('./math/vectorMath.js')).add;
  static subtract = (await import('./math/vectorMath.js')).subtract;
  static multiply = (await import('./math/vectorMath.js')).multiply;
  static angleBetween = (await import('./math/vectorMath.js')).angleBetween;
  
  static rotationMatrixX = (await import('./math/matrixMath.js')).rotationMatrixX;
  static rotationMatrixY = (await import('./math/matrixMath.js')).rotationMatrixY;
  static rotationMatrixZ = (await import('./math/matrixMath.js')).rotationMatrixZ;
  static translationMatrix = (await import('./math/matrixMath.js')).translationMatrix;
  static scaleMatrix = (await import('./math/matrixMath.js')).scaleMatrix;
  static transformVector = (await import('./math/matrixMath.js')).transformVector;
  static multiplyMatrices = (await import('./math/matrixMath.js')).multiplyMatrices;
  static identityMatrix = (await import('./math/matrixMath.js')).identityMatrix;
  
  static pointInBounds = (await import('./math/boundsMath.js')).pointInBounds;
  static calculateBounds = (await import('./math/boundsMath.js')).calculateBounds;
  static boundsCenter = (await import('./math/boundsMath.js')).boundsCenter;
  static boundsSize = (await import('./math/boundsMath.js')).boundsSize;
  static expandBounds = (await import('./math/boundsMath.js')).expandBounds;
  static boundsIntersect = (await import('./math/boundsMath.js')).boundsIntersect;
} 