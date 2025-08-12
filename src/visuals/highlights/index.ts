/**
 * Highlight Helpers - Visual distinction for selected/hovered elements
 * Creates and manages highlight meshes for vertices, edges, faces, and objects
 */

export { HighlightVertices, updateVertexHighlights, disposeVertexHighlights } from './HighlightVertices';
export { HighlightEdges, updateEdgeHighlights, disposeEdgeHighlights } from './HighlightEdges';
export { HighlightFaces, updateFaceHighlights, disposeFaceHighlights } from './HighlightFaces';
export { 
  HoverHighlightHelper, 
  showHoverHighlight, 
  hideHoverHighlight, 
  updateHoverHighlight,
  createVertexHoverHighlight,
  createEdgeHoverHighlight,
  disposeHoverHighlight 
} from './HoverHighlightHelper';

// Re-export types
export type { HighlightVerticesOptions } from './HighlightVertices';
export type { HighlightEdgesOptions } from './HighlightEdges';
export type { HighlightFacesOptions } from './HighlightFaces';
export type { HoverHighlightOptions } from './HoverHighlightHelper'; 