import { BufferGeometry, Vector3, BufferAttribute, InterleavedBufferAttribute } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Edge } from '../core/Edge';
import { Face } from '../core/Face';

/**
 * Options for converting from BufferGeometry
 */
export interface FromBufferGeometryOptions {
  /** Whether to import vertex normals if available */
  importNormals?: boolean;
  /** Whether to import UVs if available */
  importUVs?: boolean;
  /** Whether to import material indices if available */
  importMaterialIndices?: boolean;
  /** Name for the created mesh */
  name?: string;
}

/**
 * Converts a Three.js BufferGeometry to an EditableMesh
 * @param geometry The BufferGeometry to convert
 * @param options Conversion options
 * @returns A new EditableMesh instance
 */
export function fromBufferGeometry(
  geometry: BufferGeometry,
  options: FromBufferGeometryOptions = {}
): EditableMesh {
  const importNormals = options.importNormals ?? true;
  const importUVs = options.importUVs ?? true;
  const importMaterialIndices = options.importMaterialIndices ?? true;
  const name = options.name ?? 'ConvertedMesh';
  
  // Create a new EditableMesh
  const mesh = new EditableMesh({ name });
  
  // Get attributes from the geometry
  const positionAttr = geometry.getAttribute('position');
  
  // Check if we have valid position attributes
  if (!positionAttr) {
    throw new Error('BufferGeometry must have position attributes');
  }
  
  // Helper function to check if attribute has getX/Y/Z methods
  function hasGetMethods(attr: any): attr is BufferAttribute | InterleavedBufferAttribute {
    return attr && typeof attr.getX === 'function' && typeof attr.getY === 'function' && typeof attr.getZ === 'function';
  }
  
  if (!hasGetMethods(positionAttr)) {
    throw new Error('Position attribute must have getX/Y/Z methods');
  }
  const normalAttr = importNormals ? geometry.getAttribute('normal') : null;
  const uvAttr = importUVs ? geometry.getAttribute('uv') : null;
  const materialIndexAttr = importMaterialIndices ? geometry.getAttribute('materialIndex') : null;
  const indexAttr = geometry.getIndex();
  
  if (!positionAttr) {
    throw new Error('BufferGeometry must have a position attribute');
  }
  
  // Maps from BufferGeometry vertex index to EditableMesh vertex index
  const vertexMap = new Map<number, number>();
  
  // Create vertices
  const vertexCount = positionAttr.count;
  for (let i = 0; i < vertexCount; i++) {
    // Safely access position attributes
    const x = positionAttr.getX(i);
    const y = positionAttr.getY(i);
    const z = positionAttr.getZ(i);
    
    // Create vertex
    const vertex = new Vertex(x, y, z);
    
    // Add normal if available
    if (normalAttr && hasGetMethods(normalAttr)) {
      const nx = normalAttr.getX(i);
      const ny = normalAttr.getY(i);
      const nz = normalAttr.getZ(i);
      vertex.normal = new Vector3(nx, ny, nz);
    }
    
    // Add UV if available
    if (uvAttr && hasGetMethods(uvAttr)) {
      const u = uvAttr.getX(i);
      const v = uvAttr.getY(i);
      vertex.uv = { u, v };
    }
    
    // Add vertex to mesh
    const vertexIndex = mesh.addVertex(vertex);
    vertexMap.set(i, vertexIndex);
  }
  
  // Process faces
  if (indexAttr) {
    // Indexed geometry
    const indexCount = indexAttr.count;
    
    // Assuming triangles (3 indices per face)
    for (let i = 0; i < indexCount; i += 3) {
      // Get vertex indices for this face
      if (!hasGetMethods(indexAttr)) {
        continue; // Skip if we can't get indices
      }
      
      const a = indexAttr.getX(i);
      const b = indexAttr.getX(i + 1);
      const c = indexAttr.getX(i + 2);
      
      // Map to EditableMesh vertex indices
      const va = vertexMap.get(a) ?? -1;
      const vb = vertexMap.get(b) ?? -1;
      const vc = vertexMap.get(c) ?? -1;
      
      if (va === -1 || vb === -1 || vc === -1) continue;
      
      // Create edges
      const edgeAB = mesh.addEdge(new Edge(va, vb));
      const edgeBC = mesh.addEdge(new Edge(vb, vc));
      const edgeCA = mesh.addEdge(new Edge(vc, va));
      
      // Get material index if available
      let materialIndex = 0;
      if (materialIndexAttr && hasGetMethods(materialIndexAttr) && i / 3 < materialIndexAttr.count) {
        materialIndex = materialIndexAttr.getX(Math.floor(i / 3));
      }
      
      // Create face
      mesh.addFace(
        new Face(
          [va, vb, vc],
          [edgeAB, edgeBC, edgeCA],
          { materialIndex }
        )
      );
    }
  } else {
    // Non-indexed geometry
    // Assuming triangles (3 vertices per face)
    for (let i = 0; i < vertexCount; i += 3) {
      const va = vertexMap.get(i) ?? -1;
      const vb = vertexMap.get(i + 1) ?? -1;
      const vc = vertexMap.get(i + 2) ?? -1;
      
      if (va === -1 || vb === -1 || vc === -1) continue;
      
      // Create edges
      const edgeAB = mesh.addEdge(new Edge(va, vb));
      const edgeBC = mesh.addEdge(new Edge(vb, vc));
      const edgeCA = mesh.addEdge(new Edge(vc, va));
      
      // Get material index if available
      let materialIndex = 0;
      if (materialIndexAttr && hasGetMethods(materialIndexAttr) && i / 3 < materialIndexAttr.count) {
        materialIndex = materialIndexAttr.getX(Math.floor(i / 3));
      }
      
      // Create face
      mesh.addFace(
        new Face(
          [va, vb, vc],
          [edgeAB, edgeBC, edgeCA],
          { materialIndex }
        )
      );
    }
  }
  
  return mesh;
}

/**
 * Merges duplicate vertices in an EditableMesh
 * This is useful after converting from BufferGeometry, which may have duplicate vertices
 * @param mesh The mesh to process
 * @param threshold The distance threshold for considering vertices as duplicates
 * @returns A new mesh with merged vertices
 */
export function mergeVertices(
  mesh: EditableMesh,
  threshold: number = 0.0001
): EditableMesh {
  // Map to store unique vertices and their indices
  const uniqueVertices = new Map<string, number>();
  
  // Map from old vertex indices to new vertex indices
  const vertexMap = new Map<number, number>();
  
  // Create new vertices array
  const newVertices: Vertex[] = [];
  
  // Process each vertex
  mesh.vertices.forEach((vertex, index) => {
    // Create a key for the vertex based on its position
    // Round to reduce floating point precision issues
    const x = Math.round(vertex.x / threshold) * threshold;
    const y = Math.round(vertex.y / threshold) * threshold;
    const z = Math.round(vertex.z / threshold) * threshold;
    const key = `${x},${y},${z}`;
    
    if (uniqueVertices.has(key)) {
      // Duplicate vertex, map to existing one
      vertexMap.set(index, uniqueVertices.get(key)!);
    } else {
      // New unique vertex
      const newIndex = newVertices.length;
      newVertices.push(vertex);
      uniqueVertices.set(key, newIndex);
      vertexMap.set(index, newIndex);
    }
  });
  
  // Update edges with new vertex indices
  const newEdges = mesh.edges.map(edge => {
    return new Edge(
      vertexMap.get(edge.v1) ?? edge.v1,
      vertexMap.get(edge.v2) ?? edge.v2,
      { ...edge.userData }
    );
  });
  
  // Update faces with new vertex indices
  const newFaces = mesh.faces.map(face => {
    const newVertices = face.vertices.map(v => vertexMap.get(v) ?? v);
    return new Face(
      newVertices,
      [], // Edges will need to be re-calculated
      {
        materialIndex: face.materialIndex,
        normal: face.normal?.clone(),
        userData: { ...face.userData }
      }
    );
  });
  
  // Create a new mesh with the updated data
  const newMesh = new EditableMesh({
    id: mesh.id,
    name: mesh.name,
    vertices: newVertices,
    edges: newEdges,
    faces: newFaces,
    matrix: mesh.matrix.clone()
  });
  
  return newMesh;
}
