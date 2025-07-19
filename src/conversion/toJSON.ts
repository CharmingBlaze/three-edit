import { EditableMesh } from '../core/EditableMesh';

/**
 * Interface for the JSON representation of a mesh
 */
export interface MeshJSON {
  /** Mesh identifier */
  id: string;
  /** Mesh name */
  name: string;
  /** Array of vertices */
  vertices: VertexJSON[];
  /** Array of edges */
  edges: EdgeJSON[];
  /** Array of faces */
  faces: FaceJSON[];
  /** Transformation matrix as a flat array (column-major) */
  matrix: number[];
  /** Optional metadata */
  metadata?: Record<string, any>;
}

/**
 * Interface for the JSON representation of a vertex
 */
export interface VertexJSON {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
  /** Z coordinate */
  z: number;
  /** Normal vector (optional) */
  normal?: [number, number, number];
  /** UV coordinates (optional) */
  uv?: { u: number; v: number };
  /** Custom user data */
  userData?: Record<string, any>;
}

/**
 * Interface for the JSON representation of an edge
 */
export interface EdgeJSON {
  /** Index of the first vertex */
  v1: number;
  /** Index of the second vertex */
  v2: number;
  /** Custom user data */
  userData?: Record<string, any>;
}

/**
 * Interface for the JSON representation of a face
 */
export interface FaceJSON {
  /** Indices of vertices that form the face */
  vertices: number[];
  /** Indices of edges that form the face */
  edges: number[];
  /** Material index */
  materialIndex: number;
  /** Normal vector (optional) */
  normal?: [number, number, number];
  /** Custom user data */
  userData?: Record<string, any>;
}

/**
 * Options for converting to JSON
 */
export interface ToJSONOptions {
  /** Whether to include metadata */
  includeMetadata?: boolean;
  /** Custom metadata to include */
  metadata?: Record<string, any>;
}

/**
 * Converts an EditableMesh to a JSON object
 * @param mesh The EditableMesh to convert
 * @param options Conversion options
 * @returns A JSON representation of the mesh
 */
export function toJSON(
  mesh: EditableMesh,
  options: ToJSONOptions = {}
): MeshJSON {
  const includeMetadata = options.includeMetadata ?? true;
  
  // Convert vertices to JSON
  const verticesJSON: VertexJSON[] = mesh.vertices.map(vertex => {
    const json: VertexJSON = {
      x: vertex.x,
      y: vertex.y,
      z: vertex.z,
      userData: { ...vertex.userData }
    };
    
    // Add normal if available
    if (vertex.normal) {
      json.normal = [vertex.normal.x, vertex.normal.y, vertex.normal.z];
    }
    
    // Add UV if available
    if (vertex.uv) {
      json.uv = { ...vertex.uv };
    }
    
    return json;
  });
  
  // Convert edges to JSON
  const edgesJSON: EdgeJSON[] = mesh.edges.map(edge => ({
    v1: edge.v1,
    v2: edge.v2,
    userData: { ...edge.userData }
  }));
  
  // Convert faces to JSON
  const facesJSON: FaceJSON[] = mesh.faces.map(face => {
    const json: FaceJSON = {
      vertices: [...face.vertices],
      edges: [...face.edges],
      materialIndex: face.materialIndex,
      userData: { ...face.userData }
    };
    
    // Add normal if available
    if (face.normal) {
      json.normal = [face.normal.x, face.normal.y, face.normal.z];
    }
    
    return json;
  });
  
  // Extract matrix elements
  const matrixElements = mesh.matrix.elements;
  
  // Create the final JSON object
  const meshJSON: MeshJSON = {
    id: mesh.id,
    name: mesh.name,
    vertices: verticesJSON,
    edges: edgesJSON,
    faces: facesJSON,
    matrix: [...matrixElements]
  };
  
  // Add metadata if requested
  if (includeMetadata) {
    meshJSON.metadata = {
      version: '1.0.0',
      type: 'EditableMesh',
      generator: 'three-edit',
      timestamp: new Date().toISOString(),
      ...options.metadata
    };
  }
  
  return meshJSON;
}

/**
 * Serializes an EditableMesh to a JSON string
 * @param mesh The EditableMesh to serialize
 * @param options Conversion options
 * @param space Number of spaces for indentation in the output JSON string
 * @returns A JSON string representation of the mesh
 */
export function toJSONString(
  mesh: EditableMesh,
  options: ToJSONOptions = {},
  space?: number
): string {
  const json = toJSON(mesh, options);
  return JSON.stringify(json, null, space);
}
