import { BufferGeometry, Float32BufferAttribute, Uint32BufferAttribute } from 'three';
import { EditableMesh } from '../core/EditableMesh.ts';
import { Face } from '../core/Face.ts';
import { triangulateFace } from '../utils/mathUtils.ts';

/**
 * Options for converting to BufferGeometry
 */
export interface ToBufferGeometryOptions {
  /** Whether to include vertex normals */
  includeNormals?: boolean;
  /** Whether to include UVs */
  includeUVs?: boolean;
  /** Whether to include face indices for materials */
  includeMaterialIndices?: boolean;
}

/**
 * Converts an EditableMesh to a Three.js BufferGeometry
 * @param mesh The EditableMesh to convert
 * @param options Conversion options
 * @returns A new BufferGeometry instance
 */
export function toBufferGeometry(
  mesh: EditableMesh,
  options: ToBufferGeometryOptions = {}
): BufferGeometry {
  const includeNormals = options.includeNormals ?? true;
  const includeUVs = options.includeUVs ?? true;
  const includeMaterialIndices = options.includeMaterialIndices ?? true;
  
  const geometry = new BufferGeometry();
  
  // Create position buffer
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const materialIndices: number[] = [];
  

  
  // Process each face
  mesh.faces.forEach((face) => {
    // Triangulate the face (simple fan triangulation)
    const triangles = triangulateFace(face);
    
    // Process each triangle
    triangles.forEach(triangle => {
      // Ensure proper winding order (CCW for Three.js)
      const orderedTriangle = ensureCCWWinding(triangle, face);
      
      // Process each vertex of the triangle
      orderedTriangle.forEach(vertexIndex => {
        const vertex = mesh.getVertex(vertexIndex);
        if (!vertex) return;
        
        // Add vertex position
        positions.push(vertex.x, vertex.y, vertex.z);
        
        // Add vertex normal if available and requested
        if (includeNormals) {
          if (vertex.normal) {
            normals.push(vertex.normal.x, vertex.normal.y, vertex.normal.z);
          } else {
            // Default normal pointing up
            normals.push(0, 1, 0);
          }
        }
        
        // Add UVs if available and requested
        if (includeUVs) {
          if (vertex.uv) {
            uvs.push(vertex.uv.u, vertex.uv.v);
          } else {
            // Default UV (0,0)
            uvs.push(0, 0);
          }
        }
        
        // Add to indices
        const bufferIndex = positions.length / 3 - 1;
        indices.push(bufferIndex);

        
        // Add material index if requested
        if (includeMaterialIndices) {
          materialIndices.push(face.materialIndex);
        }
      });
    });
  });
  
  // Set attributes
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  
  if (includeNormals && normals.length > 0) {
    geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  }
  
  if (includeUVs && uvs.length > 0) {
    geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  }
  
  // Set indices
  geometry.setIndex(indices);
  
  // Add material indices as a custom attribute if requested
  if (includeMaterialIndices && materialIndices.length > 0) {
    geometry.setAttribute('materialIndex', new Uint32BufferAttribute(materialIndices, 1));
  }
  
  // Compute vertex normals if not provided
  if (includeNormals && !mesh.vertices.some(v => v.normal)) {
    geometry.computeVertexNormals();
  }
  
  return geometry;
}

/**
 * Ensures proper counter-clockwise winding order for Three.js
 * @param triangle Array of three vertex indices
 * @param face The face containing the triangle
 * @returns Triangle with proper CCW winding order
 */
function ensureCCWWinding(triangle: number[], face: Face): number[] {
  // If the face has a normal, use it to determine proper winding
  if (face.normal) {

    
    // For a simple check, we can use the first three vertices of the face
    // to determine the expected winding order
    const faceV0 = face.vertices[0];
    const faceV1 = face.vertices[1];
    const faceV2 = face.vertices[2];
    
    // If the triangle vertices match the face vertices in order, keep as is
    if (triangle[0] === faceV0 && triangle[1] === faceV1 && triangle[2] === faceV2) {
      return triangle;
    }
    
    // If the triangle vertices match the face vertices in reverse order, flip
    if (triangle[0] === faceV2 && triangle[1] === faceV1 && triangle[2] === faceV0) {
      return [triangle[0], triangle[2], triangle[1]];
    }
  }
  
  // Default: return as is (assumes proper winding from triangulation)
  return triangle;
}


