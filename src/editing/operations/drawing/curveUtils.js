/**
 * @fileoverview Curve generation utilities
 * Provides utility functions for generating various types of curves
 */

import * as THREE from 'three';

/**
 * Generate curve points based on type
 * @param {Array<THREE.Vector3>} controlPoints - Control points
 * @param {number} segments - Number of segments
 * @param {string} type - Curve type
 * @returns {Array<THREE.Vector3>} Generated curve points
 */
export function generateCurvePoints(controlPoints, segments, type) {
  switch (type) {
    case 'linear':
      return generateLinearCurve(controlPoints, segments);
    case 'bezier':
      return generateBezierCurve(controlPoints, segments);
    case 'catmull-rom':
      return generateCatmullRomCurve(controlPoints, segments);
    default:
      throw new Error(`Unknown curve type: ${type}`);
  }
}

/**
 * Generate linear curve points
 * @param {Array<THREE.Vector3>} controlPoints - Control points
 * @param {number} segments - Number of segments
 * @returns {Array<THREE.Vector3>} Linear curve points
 */
function generateLinearCurve(controlPoints, segments) {
  const points = [];
  
  for (let i = 0; i < controlPoints.length - 1; i++) {
    const start = controlPoints[i];
    const end = controlPoints[i + 1];
    
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      points.push(interpolatePoints(start, end, t));
    }
  }
  
  return points;
}

/**
 * Generate Bezier curve points
 * @param {Array<THREE.Vector3>} controlPoints - Control points
 * @param {number} segments - Number of segments
 * @returns {Array<THREE.Vector3>} Bezier curve points
 */
function generateBezierCurve(controlPoints, segments) {
  const points = [];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    points.push(calculateBezierPoint(controlPoints, t));
  }
  
  return points;
}

/**
 * Generate Catmull-Rom curve points
 * @param {Array<THREE.Vector3>} controlPoints - Control points
 * @param {number} segments - Number of segments
 * @returns {Array<THREE.Vector3>} Catmull-Rom curve points
 */
function generateCatmullRomCurve(controlPoints, segments) {
  const points = [];
  
  for (let i = 0; i < controlPoints.length - 1; i++) {
    const p0 = i > 0 ? controlPoints[i - 1] : controlPoints[i];
    const p1 = controlPoints[i];
    const p2 = controlPoints[i + 1];
    const p3 = i < controlPoints.length - 2 ? controlPoints[i + 2] : p2;
    
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      points.push(calculateCatmullRomPoint(p0, p1, p2, p3, t));
    }
  }
  
  return points;
}

/**
 * Calculate Bezier curve point
 * @param {Array<THREE.Vector3>} points - Control points
 * @param {number} t - Parameter t (0-1)
 * @returns {THREE.Vector3} Bezier curve point
 */
function calculateBezierPoint(points, t) {
  if (points.length === 1) return points[0];
  
  const newPoints = [];
  for (let i = 0; i < points.length - 1; i++) {
    newPoints.push(interpolatePoints(points[i], points[i + 1], t));
  }
  
  return calculateBezierPoint(newPoints, t);
}

/**
 * Calculate Catmull-Rom curve point
 * @param {THREE.Vector3} p0 - First control point
 * @param {THREE.Vector3} p1 - Second control point
 * @param {THREE.Vector3} p2 - Third control point
 * @param {THREE.Vector3} p3 - Fourth control point
 * @param {number} t - Parameter t (0-1)
 * @returns {THREE.Vector3} Catmull-Rom curve point
 */
function calculateCatmullRomPoint(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  
  const result = new THREE.Vector3();
  result.addScaledVector(p0, -0.5 * t3 + t2 - 0.5 * t);
  result.addScaledVector(p1, 1.5 * t3 - 2.5 * t2 + 1);
  result.addScaledVector(p2, -1.5 * t3 + 2 * t2 + 0.5 * t);
  result.addScaledVector(p3, 0.5 * t3 - 0.5 * t2);
  
  return result;
}

/**
 * Interpolate between two points
 * @param {THREE.Vector3} start - Start point
 * @param {THREE.Vector3} end - End point
 * @param {number} t - Interpolation factor (0-1)
 * @returns {THREE.Vector3} Interpolated point
 */
function interpolatePoints(start, end, t) {
  return start.clone().lerp(end, t);
} 