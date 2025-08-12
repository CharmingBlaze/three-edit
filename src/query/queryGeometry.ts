import { Vector3, Box3, Sphere } from 'three';
import { EditableMesh } from '../core/EditableMesh';
import { Face } from '../core/Face';
import { Vertex } from '../core/Vertex';

/**
 * Result of a geometry query
 */
export interface GeometryQueryResult {
  /** Bounding box of the mesh or selection */
  boundingBox: Box3;
  /** Bounding sphere of the mesh or selection */
  boundingSphere: Sphere;
  /** Center point of the mesh or selection */
  center: Vector3;
  /** Total volume of the mesh or selection (if closed) */
  volume: number;
  /** Total surface area of the mesh or selection */
  surfaceArea: number;
  /** Statistics about the mesh or selection */
  stats: {
    /** Number of vertices */
    vertexCount: number;
    /** Number of edges */
    edgeCount: number;
    /** Number of faces */
    faceCount: number;
    /** Number of triangles (after triangulation) */
    triangleCount: number;
    /** Average edge length */
    averageEdgeLength: number;
    /** Minimum edge length */
    minEdgeLength: number;
    /** Maximum edge length */
    maxEdgeLength: number;
    /** Average face area */
    averageFaceArea: number;
    /** Minimum face area */
    minFaceArea: number;
    /** Maximum face area */
    maxFaceArea: number;
  };
}

/**
 * Options for geometry queries
 */
export interface GeometryQueryOptions {
  /** Whether to compute volume (may be slow for complex meshes) */
  computeVolume?: boolean;
  /** Whether to compute surface area */
  computeSurfaceArea?: boolean;
  /** Whether to compute detailed statistics */
  computeStats?: boolean;
  /** Indices of vertices to include in the query (if undefined, all vertices are included) */
  vertexIndices?: Set<number>;
  /** Indices of faces to include in the query (if undefined, all faces are included) */
  faceIndices?: Set<number>;
}

/**
 * Queries geometry information about a mesh
 * @param mesh The mesh to query
 * @param options Query options
 * @returns Geometry query result
 */
export function queryGeometry(
  mesh: EditableMesh,
  options: GeometryQueryOptions = {}
): GeometryQueryResult {
  // Set default options
  const opts = {
    computeVolume: options.computeVolume ?? true,
    computeSurfaceArea: options.computeSurfaceArea ?? true,
    computeStats: options.computeStats ?? true,
    vertexIndices: options.vertexIndices,
    faceIndices: options.faceIndices
  };
  
  // Initialize result
  const result: GeometryQueryResult = {
    boundingBox: new Box3(),
    boundingSphere: new Sphere(),
    center: new Vector3(),
    volume: 0,
    surfaceArea: 0,
    stats: {
      vertexCount: 0,
      edgeCount: 0,
      faceCount: 0,
      triangleCount: 0,
      averageEdgeLength: 0,
      minEdgeLength: Infinity,
      maxEdgeLength: 0,
      averageFaceArea: 0,
      minFaceArea: Infinity,
      maxFaceArea: 0
    }
  };
  
  // Get vertices to include in the query
  let vertices: Vertex[];
  if (opts.vertexIndices) {
    vertices = Array.from(opts.vertexIndices)
      .map(index => mesh.getVertex(index))
      .filter((vertex): vertex is Vertex => vertex !== undefined);
  } else {
    vertices = mesh.vertices;
  }
  
  // Get faces to include in the query
  let faces: Face[];
  if (opts.faceIndices) {
    faces = Array.from(opts.faceIndices)
      .map(index => mesh.getFace(index))
      .filter((face): face is Face => face !== undefined);
  } else {
    faces = mesh.faces;
  }
  
  // Compute bounding box and sphere
  if (vertices.length > 0) {
    const points = vertices.map(v => new Vector3(v.x, v.y, v.z));
    result.boundingBox.setFromPoints(points);
    result.boundingSphere.setFromPoints(points);
    result.center.copy(result.boundingBox.getCenter(new Vector3()));
  }
  
  // Update statistics
  result.stats.vertexCount = vertices.length;
  result.stats.faceCount = faces.length;
  
  // Compute detailed statistics if requested
  if (opts.computeStats) {
    // Count unique edges
    const uniqueEdges = new Set<string>();
    let totalEdgeLength = 0;
    
    // Process faces for statistics
    let totalFaceArea = 0;
    let triangleCount = 0;
    
    for (const face of faces) {
      // Count triangles (n-2 triangles per n-gon)
      const faceTriangles = face.vertices.length - 2;
      triangleCount += faceTriangles;
      
      // Process edges
      for (let i = 0; i < face.vertices.length; i++) {
        const v1Index = face.vertices[i];
        const v2Index = face.vertices[(i + 1) % face.vertices.length];
        
        // Create a unique edge identifier (always use smaller index first)
        const edgeKey = v1Index < v2Index
          ? `${v1Index}-${v2Index}`
          : `${v2Index}-${v1Index}`;
        
        if (!uniqueEdges.has(edgeKey)) {
          uniqueEdges.add(edgeKey);
          
          // Compute edge length
          const v1 = mesh.getVertex(v1Index);
          const v2 = mesh.getVertex(v2Index);
          
          if (v1 && v2) {
            const dx = v2.x - v1.x;
            const dy = v2.y - v1.y;
            const dz = v2.z - v1.z;
            const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            totalEdgeLength += length;
            result.stats.minEdgeLength = Math.min(result.stats.minEdgeLength, length);
            result.stats.maxEdgeLength = Math.max(result.stats.maxEdgeLength, length);
          }
        }
      }
      
      // Compute face area
      const faceArea = computeFaceArea(mesh, face);
      totalFaceArea += faceArea;
      
      result.stats.minFaceArea = Math.min(result.stats.minFaceArea, faceArea);
      result.stats.maxFaceArea = Math.max(result.stats.maxFaceArea, faceArea);
    }
    
    // Update edge statistics
    result.stats.edgeCount = uniqueEdges.size;
    result.stats.averageEdgeLength = uniqueEdges.size > 0
      ? totalEdgeLength / uniqueEdges.size
      : 0;
    
    // Update face statistics
    result.stats.triangleCount = triangleCount;
    result.stats.averageFaceArea = faces.length > 0
      ? totalFaceArea / faces.length
      : 0;
    
    // Set surface area
    if (opts.computeSurfaceArea) {
      result.surfaceArea = totalFaceArea;
    }
  }
  
  // Compute volume if requested and mesh is closed
  if (opts.computeVolume) {
    result.volume = computeMeshVolume(mesh, faces);
  }
  
  // Handle edge cases for min values
  if (result.stats.minEdgeLength === Infinity) {
    result.stats.minEdgeLength = 0;
  }
  
  if (result.stats.minFaceArea === Infinity) {
    result.stats.minFaceArea = 0;
  }
  
  return result;
}

/**
 * Computes the area of a face
 * @param mesh The mesh containing the face
 * @param face The face to compute the area of
 * @returns The area of the face
 */
export function computeFaceArea(mesh: EditableMesh, face: Face): number {
  if (face.vertices.length < 3) {
    return 0;
  }
  
  // For triangles, use the standard formula
  if (face.vertices.length === 3) {
    const v0 = mesh.getVertex(face.vertices[0]);
    const v1 = mesh.getVertex(face.vertices[1]);
    const v2 = mesh.getVertex(face.vertices[2]);
    
    if (!v0 || !v1 || !v2) {
      return 0;
    }
    
    const a = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
    const b = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);
    const cross = new Vector3().crossVectors(a, b);
    
    return cross.length() * 0.5;
  }
  
  // For n-gons, triangulate and sum the areas
  let area = 0;
  const v0 = mesh.getVertex(face.vertices[0]);
  
  if (!v0) {
    return 0;
  }
  
  for (let i = 1; i < face.vertices.length - 1; i++) {
    const v1 = mesh.getVertex(face.vertices[i]);
    const v2 = mesh.getVertex(face.vertices[i + 1]);
    
    if (!v1 || !v2) {
      continue;
    }
    
    const a = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
    const b = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);
    const cross = new Vector3().crossVectors(a, b);
    
    area += cross.length() * 0.5;
  }
  
  return area;
}

/**
 * Computes the volume of a mesh
 * @param mesh The mesh to compute the volume of
 * @param faces The faces to include in the computation
 * @returns The volume of the mesh
 */
export function computeMeshVolume(mesh: EditableMesh, faces: Face[]): number {
  // This uses the divergence theorem to compute the volume
  // For a closed mesh, the volume is the sum of the signed volumes of tetrahedra
  // formed by the origin and each triangle
  let volume = 0;
  
  for (const face of faces) {
    if (face.vertices.length < 3) {
      continue;
    }
    
    const v0 = mesh.getVertex(face.vertices[0]);
    
    if (!v0) {
      continue;
    }
    
    for (let i = 1; i < face.vertices.length - 1; i++) {
      const v1 = mesh.getVertex(face.vertices[i]);
      const v2 = mesh.getVertex(face.vertices[i + 1]);
      
      if (!v1 || !v2) {
        continue;
      }
      
      // Compute the signed volume of the tetrahedron
      const signedVolume = (
        v0.x * (v1.y * v2.z - v2.y * v1.z) +
        v0.y * (v2.x * v1.z - v1.x * v2.z) +
        v0.z * (v1.x * v2.y - v2.x * v1.y)
      ) / 6.0;
      
      volume += signedVolume;
    }
  }
  
  // Return the absolute value (the sign depends on the orientation of the mesh)
  return Math.abs(volume);
}
