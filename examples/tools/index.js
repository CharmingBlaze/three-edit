/**
 * Tools Module - Exports all 3D editing tools
 */

// Base tool class
export { default as BaseTool } from './BaseTool.js';

// Core tools
export { default as ObjectTool } from './ObjectTool.js';
export { default as MaterialsTool } from './MaterialsTool.js';
export { default as MeshTool } from './MeshTool.js';
export { default as CameraTool } from './CameraTool.js';
export { default as SelectionTool } from './SelectionTool.js';
export { default as TransformTool } from './TransformTool.js';

// Material tools
export { default as MaterialTool } from './MaterialTool.js';
export { default as UVTool } from './UVTool.js';

// Geometry tools
export { default as VertexTool } from './VertexTool.js';
export { default as EdgeTool } from './EdgeTool.js';
export { default as FaceTool } from './FaceTool.js';
export { default as NormalsTool } from './NormalsTool.js';

// Modification tools
export { default as ExtrudeTool } from './ExtrudeTool.js';
export { default as BevelTool } from './BevelTool.js';
export { default as BooleanTool } from './BooleanTool.js';
export { default as MirrorTool } from './MirrorTool.js';
export { default as ArrayTool } from './ArrayTool.js';

// Deformation tools
export { default as BendTool } from './BendTool.js';
export { default as TwistTool } from './TwistTool.js';
export { default as SmoothTool } from './SmoothTool.js';
export { default as SubdivisionTool } from './SubdivisionTool.js';

// Utility tools
export { default as utils } from './utils.js';

// Factory function to create tool instances
export function createTool(type, scene, camera, renderer, options = {}) {
  const toolClasses = {
    object: ObjectTool,
    materials: MaterialsTool,
    mesh: MeshTool,
    camera: CameraTool,
    selection: SelectionTool,
    transform: TransformTool,
    material: MaterialTool,
    uv: UVTool,
    vertex: VertexTool,
    edge: EdgeTool,
    face: FaceTool,
    normals: NormalsTool,
    extrude: ExtrudeTool,
    bevel: BevelTool,
    boolean: BooleanTool,
    mirror: MirrorTool,
    array: ArrayTool,
    bend: BendTool,
    twist: TwistTool,
    smooth: SmoothTool,
    subdivision: SubdivisionTool
  };

  const ToolClass = toolClasses[type.toLowerCase()];
  if (!ToolClass) {
    console.error(`Unknown tool type: ${type}`);
    return null;
  }

  return new ToolClass(scene, camera, renderer, options);
}

// Registry of available tool types
export const toolTypes = {
  object: 'Object',
  materials: 'Materials',
  mesh: 'Mesh',
  camera: 'Camera',
  selection: 'Selection',
  transform: 'Transform',
  material: 'Material',
  uv: 'UV',
  vertex: 'Vertex',
  edge: 'Edge',
  face: 'Face',
  normals: 'Normals',
  extrude: 'Extrude',
  bevel: 'Bevel',
  boolean: 'Boolean',
  mirror: 'Mirror',
  array: 'Array',
  bend: 'Bend',
  twist: 'Twist',
  smooth: 'Smooth',
  subdivision: 'Subdivision'
};

// Registry of tool categories
export const toolCategories = {
  core: ['object', 'materials', 'mesh', 'camera', 'selection', 'transform'],
  materials: ['material', 'uv'],
  geometry: ['vertex', 'edge', 'face', 'normals'],
  modification: ['extrude', 'bevel', 'boolean', 'mirror', 'array'],
  deformation: ['bend', 'twist', 'smooth', 'subdivision']
};

// Utility function to get all available tool types
export function getAvailableToolTypes() {
  return Object.keys(toolTypes);
}

// Utility function to get tool types by category
export function getToolTypesByCategory(category) {
  return toolCategories[category] || [];
}

// Utility function to get all categories
export function getToolCategories() {
  return Object.keys(toolCategories);
}

// Utility function to validate tool type
export function isValidToolType(type) {
  return type.toLowerCase() in toolTypes;
}

// Utility function to get tool description
export function getToolDescription(type) {
  const descriptions = {
    object: 'Object creation and management tool',
    materials: 'Material management and application tool',
    mesh: 'Mesh operations and manipulation tool',
    camera: 'Camera control and positioning tool',
    selection: 'Object selection and highlighting tool',
    transform: 'Object transformation tool (move, rotate, scale)',
    material: 'Material editing and properties tool',
    uv: 'UV mapping and texture coordinate tool',
    vertex: 'Vertex-level editing tool',
    edge: 'Edge-level editing tool',
    face: 'Face-level editing tool',
    normals: 'Normal vector editing tool',
    extrude: 'Geometry extrusion tool',
    bevel: 'Edge beveling tool',
    boolean: 'Boolean operations tool',
    mirror: 'Object mirroring tool',
    array: 'Object array and duplication tool',
    bend: 'Geometry bending tool',
    twist: 'Geometry twisting tool',
    smooth: 'Geometry smoothing tool',
    subdivision: 'Geometry subdivision tool'
  };
  
  return descriptions[type.toLowerCase()] || 'Unknown tool type';
}

// Default export for convenience
export default {
  // Base class
  BaseTool,
  
  // Core tools
  ObjectTool,
  MaterialsTool,
  MeshTool,
  CameraTool,
  SelectionTool,
  TransformTool,
  
  // Material tools
  MaterialTool,
  UVTool,
  
  // Geometry tools
  VertexTool,
  EdgeTool,
  FaceTool,
  NormalsTool,
  
  // Modification tools
  ExtrudeTool,
  BevelTool,
  BooleanTool,
  MirrorTool,
  ArrayTool,
  
  // Deformation tools
  BendTool,
  TwistTool,
  SmoothTool,
  SubdivisionTool,
  
  // Utilities
  utils,
  
  // Factory functions
  createTool,
  
  // Registries
  toolTypes,
  toolCategories,
  
  // Utility functions
  getAvailableToolTypes,
  getToolTypesByCategory,
  getToolCategories,
  isValidToolType,
  getToolDescription
};