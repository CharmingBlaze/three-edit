import { Matrix4, Vector3 } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Vertex } from '../core/Vertex.ts';
import { Edge } from '../core/Edge.ts';
import { Face } from '../core/Face.ts';
import { MeshJSON, VertexJSON, EdgeJSON, FaceJSON } from './toJSON';

/**
 * Options for converting from JSON
 */
export interface FromJSONOptions {
  /** Whether to validate the JSON structure */
  validate?: boolean;
  /** Whether to preserve the original mesh ID */
  preserveId?: boolean;
}

/**
 * Converts a JSON object to an EditableMesh
 * @param json The JSON representation of the mesh
 * @param options Conversion options
 * @returns A new EditableMesh instance
 */
export function fromJSON(
  json: MeshJSON,
  options: FromJSONOptions = {}
): EditableMesh {
  const validate = options.validate ?? true;
  const preserveId = options.preserveId ?? false;
  
  // Validate JSON structure if requested
  if (validate) {
    validateJSON(json);
  }
  
  // Create vertices
  const vertices = json.vertices.map((vertexJSON: VertexJSON) => {
    const vertex = new Vertex(vertexJSON.x, vertexJSON.y, vertexJSON.z);
    
    // Add normal if available
    if (vertexJSON.normal) {
      vertex.normal = new Vector3(...vertexJSON.normal);
    }
    
    // Add UV if available
    if (vertexJSON.uv) {
      vertex.uv = { ...vertexJSON.uv };
    }
    
    // Add user data if available
    if (vertexJSON.userData) {
      vertex.userData = { ...vertexJSON.userData };
    }
    
    return vertex;
  });
  
  // Create edges
  const edges = json.edges.map((edgeJSON: EdgeJSON) => {
    const edge = new Edge(edgeJSON.v1, edgeJSON.v2);
    
    // Add user data if available
    if (edgeJSON.userData) {
      edge.userData = { ...edgeJSON.userData };
    }
    
    return edge;
  });
  
  // Create faces
  const faces = json.faces.map((faceJSON: FaceJSON) => {
    const face = new Face(
      [...faceJSON.vertices],
      [...faceJSON.edges],
      { materialIndex: faceJSON.materialIndex }
    );
    
    // Add normal if available
    if (faceJSON.normal) {
      face.normal = new Vector3(...faceJSON.normal);
    }
    
    // Add user data if available
    if (faceJSON.userData) {
      face.userData = { ...faceJSON.userData };
    }
    
    return face;
  });
  
  // Create matrix
  const matrix = new Matrix4().fromArray(json.matrix);
  
  // Create the mesh
  const mesh = new EditableMesh({
    id: preserveId ? json.id : undefined,
    name: json.name,
    vertices,
    edges,
    faces,
    matrix
  });
  
  return mesh;
}

/**
 * Parses a JSON string and converts it to an EditableMesh
 * @param jsonString The JSON string representation of the mesh
 * @param options Conversion options
 * @returns A new EditableMesh instance
 */
export function fromJSONString(
  jsonString: string,
  options: FromJSONOptions = {}
): EditableMesh {
  const json = JSON.parse(jsonString) as MeshJSON;
  return fromJSON(json, options);
}

/**
 * Validates the JSON structure for an EditableMesh
 * @param json The JSON object to validate
 * @throws Error if the JSON structure is invalid
 */
function validateJSON(json: any): void {
  // Check required top-level properties
  if (!json.id || typeof json.id !== 'string') {
    throw new Error('Invalid JSON: missing or invalid id');
  }
  
  if (!json.name || typeof json.name !== 'string') {
    throw new Error('Invalid JSON: missing or invalid name');
  }
  
  if (!Array.isArray(json.vertices)) {
    throw new Error('Invalid JSON: vertices must be an array');
  }
  
  if (!Array.isArray(json.edges)) {
    throw new Error('Invalid JSON: edges must be an array');
  }
  
  if (!Array.isArray(json.faces)) {
    throw new Error('Invalid JSON: faces must be an array');
  }
  
  if (!Array.isArray(json.matrix) || json.matrix.length !== 16) {
    throw new Error('Invalid JSON: matrix must be an array of 16 numbers');
  }
  
  // Check vertices
  json.vertices.forEach((vertex: any, index: number) => {
    if (typeof vertex.x !== 'number' || 
        typeof vertex.y !== 'number' || 
        typeof vertex.z !== 'number') {
      throw new Error(`Invalid JSON: vertex ${index} has invalid coordinates`);
    }
    
    if (vertex.normal && (!Array.isArray(vertex.normal) || vertex.normal.length !== 3)) {
      throw new Error(`Invalid JSON: vertex ${index} has invalid normal`);
    }
    
    if (vertex.uv && (typeof vertex.uv.u !== 'number' || typeof vertex.uv.v !== 'number')) {
      throw new Error(`Invalid JSON: vertex ${index} has invalid UV coordinates`);
    }
  });
  
  // Check edges
  json.edges.forEach((edge: any, index: number) => {
    if (typeof edge.v1 !== 'number' || typeof edge.v2 !== 'number') {
      throw new Error(`Invalid JSON: edge ${index} has invalid vertex indices`);
    }
    
    if (edge.v1 < 0 || edge.v1 >= json.vertices.length || 
        edge.v2 < 0 || edge.v2 >= json.vertices.length) {
      throw new Error(`Invalid JSON: edge ${index} references non-existent vertices`);
    }
  });
  
  // Check faces
  json.faces.forEach((face: any, index: number) => {
    if (!Array.isArray(face.vertices) || face.vertices.length < 3) {
      throw new Error(`Invalid JSON: face ${index} has invalid vertices`);
    }
    
    if (!Array.isArray(face.edges) || face.edges.length < 3) {
      throw new Error(`Invalid JSON: face ${index} has invalid edges`);
    }
    
    if (typeof face.materialIndex !== 'number') {
      throw new Error(`Invalid JSON: face ${index} has invalid materialIndex`);
    }
    
    // Check vertex references
    face.vertices.forEach((vertexIndex: any, vIndex: number) => {
      if (typeof vertexIndex !== 'number' || 
          vertexIndex < 0 || 
          vertexIndex >= json.vertices.length) {
        throw new Error(`Invalid JSON: face ${index} references non-existent vertex at position ${vIndex}`);
      }
    });
    
    // Check edge references
    face.edges.forEach((edgeIndex: any, eIndex: number) => {
      if (typeof edgeIndex !== 'number' || 
          edgeIndex < 0 || 
          edgeIndex >= json.edges.length) {
        throw new Error(`Invalid JSON: face ${index} references non-existent edge at position ${eIndex}`);
      }
    });
    
    if (face.normal && (!Array.isArray(face.normal) || face.normal.length !== 3)) {
      throw new Error(`Invalid JSON: face ${index} has invalid normal`);
    }
  });
}
