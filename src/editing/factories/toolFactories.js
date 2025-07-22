/**
 * @fileoverview Factories for creating editing tool instances.
 */
import { SelectTool } from '../tools/selectTool.js';
import { TransformTool } from '../tools/transformTool.js';

export function createSelectTool(options) {
  return new SelectTool(options);
}

export function createTransformTool(options) {
  return new TransformTool(options);
}
