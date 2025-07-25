/**
 * Geometry utility functions for three-edit
 * Pure functions for triangulation, vertex merging, and extrusion operations
 */

import { EditableMesh } from '../core/EditableMesh';
import { Vertex } from '../core/Vertex';
import { Face } from '../core/Face';
import { Matrix4, Vector3 } from 'three';
import { distanceSquared3D, isValidTriangle } from './math';

/**
 * Merge vertices that are close to each other
 */
export function mergeVertices(
  vertices: Vertex[],
  faces: Face[],
  threshold: number = 1e-6
): {
  newVertices: Vertex[];
  newFaces: Face[];
  vertexMap: number[];
} {
  const vertexMap: number[] = [];
  const newVertices: Vertex[] = [];
  const thresholdSquared = threshold * threshold;
  
  // Create vertex map
  for (let i = 0; i < vertices.length; i++) {
    let found = false;
    
    for (let j = 0; j < newVertices.length; j++) {
      const distance = distanceSquared3D(
        new Vector3(vertices[i].x, vertices[i].y, vertices[i].z),
        new Vector3(newVertices[j].x, newVertices[j].y, newVertices[j].z)
      );
      
      if (distance <= thresholdSquared) {
        vertexMap[i] = j;
        found = true;
        break;
      }
    }
    
    if (!found) {
      vertexMap[i] = newVertices.length;
      newVertices.push(vertices[i].clone());
    }
  }
  
  // Update faces with new vertex indices
  const newFaces: Face[] = [];
  for (const face of faces) {
    const newVertexIndices = face.vertices.map(oldIndex => vertexMap[oldIndex]);
    
    // Remove duplicate consecutive vertices
    const uniqueVertices: number[] = [];
    for (let i = 0; i < newVertexIndices.length; i++) {
      const current = newVertexIndices[i];
      const next = newVertexIndices[(i + 1) % newVertexIndices.length];
      
      if (current !== next) {
        uniqueVertices.push(current);
      }
    }
    
    // Only create face if it has at least 3 vertices
    if (uniqueVertices.length >= 3) {
      const newFace = new Face(
        uniqueVertices,
        [], // Edges will be updated by the mesh
        {
          materialIndex: face.materialIndex,
          normal: face.normal?.clone(),
          userData: { ...face.userData }
        }
      );
      newFaces.push(newFace);
    }
  }
  
  return { newVertices, newFaces, vertexMap };
}

/**
 * Triangulate a polygon (face with more than 3 vertices)
 */
export function triangulatePolygon(vertices: Vertex[], face: Face): Face[] {
  if (face.vertices.length <= 3) {
    return [face.clone()];
  }
  
  const triangles: Face[] = [];
  const faceVertices = face.vertices.map(index => vertices[index]).filter(Boolean);
  
  if (faceVertices.length < 3) {
    return [];
  }
  
  // Simple ear clipping triangulation
  const indices = [...face.vertices];
  
  while (indices.length > 3) {
    let bestEar = -1;
    let bestAngle = -1;
    
    // Find the best ear (triangle with largest angle)
    for (let i = 0; i < indices.length; i++) {
      const prev = indices[(i - 1 + indices.length) % indices.length];
      const current = indices[i];
      const next = indices[(i + 1) % indices.length];
      
      const v1 = vertices[prev];
      const v2 = vertices[current];
      const v3 = vertices[next];
      
      if (v1 && v2 && v3) {
        // Check if this forms a valid triangle
        if (isValidTriangle(new Vector3(v1.x, v1.y, v1.z), new Vector3(v2.x, v2.y, v2.z), new Vector3(v3.x, v3.y, v3.z))) {
          // Check if no other vertices are inside this triangle
          let isEar = true;
          for (let j = 0; j < indices.length; j++) {
            if (j !== i && j !== (i - 1 + indices.length) % indices.length && j !== (i + 1) % indices.length) {
              const testVertex = vertices[indices[j]];
              if (testVertex && pointInTriangle(testVertex, v1, v2, v3)) {
                isEar = false;
                break;
              }
            }
          }
          
          if (isEar) {
            const angle = calculateAngle(v1, v2, v3);
            if (angle > bestAngle) {
              bestAngle = angle;
              bestEar = i;
            }
          }
        }
      }
    }
    
    if (bestEar === -1) {
      // Fallback: just take the first valid triangle
      for (let i = 0; i < indices.length; i++) {
        const prev = indices[(i - 1 + indices.length) % indices.length];
        const current = indices[i];
        const next = indices[(i + 1) % indices.length];
        
        const v1 = vertices[prev];
        const v2 = vertices[current];
        const v3 = vertices[next];
        
        if (v1 && v2 && v3 && isValidTriangle(new Vector3(v1.x, v1.y, v1.z), new Vector3(v2.x, v2.y, v2.z), new Vector3(v3.x, v3.y, v3.z))) {
          bestEar = i;
          break;
        }
      }
      
      if (bestEar === -1) {
        // Cannot triangulate this polygon
        break;
      }
    }
    
    // Create triangle
    const prev = indices[(bestEar - 1 + indices.length) % indices.length];
    const current = indices[bestEar];
    const next = indices[(bestEar + 1) % indices.length];
    
    const triangle = new Face(
      [prev, current, next],
      [], // Edges will be updated by the mesh
      {
        materialIndex: face.materialIndex,
        normal: face.normal?.clone(),
        userData: { ...face.userData }
      }
    );
    triangles.push(triangle);
    
    // Remove the ear vertex
    indices.splice(bestEar, 1);
  }
  
  // Add the final triangle
  if (indices.length === 3) {
    const triangle = new Face(
      indices,
      [], // Edges will be updated by the mesh
      {
        materialIndex: face.materialIndex,
        normal: face.normal?.clone(),
        userData: { ...face.userData }
      }
    );
    triangles.push(triangle);
  }
  
  return triangles;
}

/**
 * Check if a point is inside a triangle
 */
function pointInTriangle(point: Vertex, a: Vertex, b: Vertex, c: Vertex): boolean {
  const v0 = new Vector3(c.x - a.x, c.y - a.y, c.z - a.z);
  const v1 = new Vector3(b.x - a.x, b.y - a.y, b.z - a.z);
  const v2 = new Vector3(point.x - a.x, point.y - a.y, point.z - a.z);
  
  const dot00 = v0.dot(v0);
  const dot01 = v0.dot(v1);
  const dot02 = v0.dot(v2);
  const dot11 = v1.dot(v1);
  const dot12 = v1.dot(v2);
  
  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  
  return u >= 0 && v >= 0 && u + v <= 1;
}

/**
 * Calculate angle at vertex b between edges ba and bc
 */
function calculateAngle(a: Vertex, b: Vertex, c: Vertex): number {
  const ba = new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
  const bc = new Vector3(c.x - b.x, c.y - b.y, c.z - b.z);
  
  ba.normalize();
  bc.normalize();
  
  const dot = ba.dot(bc);
  return Math.acos(Math.max(-1, Math.min(1, dot)));
}

/**
 * Subdivide a face by adding a vertex at the center
 */
export function subdivideFace(
  vertices: Vertex[],
  face: Face,
  addCenterVertex: boolean = true
): {
  newVertices: Vertex[];
  newFaces: Face[];
} {
  const newVertices: Vertex[] = [];
  const newFaces: Face[] = [];
  
  if (face.vertices.length < 3) {
    return { newVertices, newFaces };
  }
  
  // Calculate face center
  let centerX = 0, centerY = 0, centerZ = 0;
  for (const vertexIndex of face.vertices) {
    const vertex = vertices[vertexIndex];
    if (vertex) {
      centerX += vertex.x;
      centerY += vertex.y;
      centerZ += vertex.z;
    }
  }
  
  centerX /= face.vertices.length;
  centerY /= face.vertices.length;
  centerZ /= face.vertices.length;
  
  let centerVertexIndex = -1;
  
  if (addCenterVertex) {
    // Create center vertex
    const centerVertex = new Vertex(centerX, centerY, centerZ, {
      userData: { ...face.userData }
    });
    newVertices.push(centerVertex);
    centerVertexIndex = vertices.length + newVertices.length - 1;
  }
  
  // Create new faces
  if (addCenterVertex) {
    // Create triangles from center to each edge
    for (let i = 0; i < face.vertices.length; i++) {
      const v1 = face.vertices[i];
      const v2 = face.vertices[(i + 1) % face.vertices.length];
      
      const triangle = new Face(
        [v1, v2, centerVertexIndex],
        [], // Edges will be updated by the mesh
        {
          materialIndex: face.materialIndex,
          normal: face.normal?.clone(),
          userData: { ...face.userData }
        }
      );
      newFaces.push(triangle);
    }
  } else {
    // Create triangles by connecting opposite vertices
    for (let i = 1; i < face.vertices.length - 1; i++) {
      const triangle = new Face(
        [face.vertices[0], face.vertices[i], face.vertices[i + 1]],
        [], // Edges will be updated by the mesh
        {
          materialIndex: face.materialIndex,
          normal: face.normal?.clone(),
          userData: { ...face.userData }
        }
      );
      newFaces.push(triangle);
    }
  }
  
  return { newVertices, newFaces };
}

/**
 * Extrude a face along a direction
 */
export function extrudeFace(
  vertices: Vertex[],
  face: Face,
  direction: Vector3,
  distance: number
): {
  newVertices: Vertex[];
  newFaces: Face[];
} {
  const newVertices: Vertex[] = [];
  const newFaces: Face[] = [];
  
  if (face.vertices.length < 3) {
    return { newVertices, newFaces };
  }
  
  // Create extruded vertices
  const extrudedIndices: number[] = [];
  for (const vertexIndex of face.vertices) {
    const vertex = vertices[vertexIndex];
    if (vertex) {
      const extrudedVertex = new Vertex(
        vertex.x + direction.x * distance,
        vertex.y + direction.y * distance,
        vertex.z + direction.z * distance,
        {
          uv: vertex.uv ? { u: vertex.uv.u, v: vertex.uv.v } : undefined,
          normal: vertex.normal?.clone(),
          color: vertex.color?.clone(),
          userData: { ...vertex.userData }
        }
      );
      newVertices.push(extrudedVertex);
      extrudedIndices.push(vertices.length + newVertices.length - 1);
    }
  }
  
  // Create side faces (quads)
  for (let i = 0; i < face.vertices.length; i++) {
    const v1 = face.vertices[i];
    const v2 = face.vertices[(i + 1) % face.vertices.length];
    const v3 = extrudedIndices[(i + 1) % extrudedIndices.length];
    const v4 = extrudedIndices[i];
    
    // Create two triangles for the quad
    const triangle1 = new Face(
      [v1, v2, v3],
      [], // Edges will be updated by the mesh
      {
        materialIndex: face.materialIndex,
        normal: face.normal?.clone(),
        userData: { ...face.userData }
      }
    );
    
    const triangle2 = new Face(
      [v1, v3, v4],
      [], // Edges will be updated by the mesh
      {
        materialIndex: face.materialIndex,
        normal: face.normal?.clone(),
        userData: { ...face.userData }
      }
    );
    
    newFaces.push(triangle1, triangle2);
  }
  
  // Create extruded face (reversed winding)
  const extrudedFace = new Face(
    [...extrudedIndices].reverse(),
    [], // Edges will be updated by the mesh
    {
      materialIndex: face.materialIndex,
      normal: face.normal?.clone().multiplyScalar(-1), // Reverse normal
      userData: { ...face.userData }
    }
  );
  newFaces.push(extrudedFace);
  
  return { newVertices, newFaces };
}

/**
 * Calculate bounding box for vertices
 */
/**
 * Compute the centroid of a face
 */
export function computeCentroid(face: Face, vertices: Vertex[]): Vector3 {
  const faceVertices = face.vertices.map(index => vertices[index]).filter(Boolean);
  if (faceVertices.length === 0) {
    return new Vector3(0, 0, 0);
  }
  
  const centroid = new Vector3(0, 0, 0);
  for (const vertex of faceVertices) {
    centroid.add(new Vector3(vertex.x, vertex.y, vertex.z));
  }
  centroid.divideScalar(faceVertices.length);
  
  return centroid;
}

export function calculateBoundingBox(vertices: Vertex[]): {
  min: Vector3;
  max: Vector3;
  center: Vector3;
  size: Vector3;
} {
  if (vertices.length === 0) {
    return {
      min: new Vector3(0, 0, 0),
      max: new Vector3(0, 0, 0),
      center: new Vector3(0, 0, 0),
      size: new Vector3(0, 0, 0)
    };
  }
  
  const min = new Vector3(Infinity, Infinity, Infinity);
  const max = new Vector3(-Infinity, -Infinity, -Infinity);
  
  vertices.forEach(vertex => {
    min.x = Math.min(min.x, vertex.x);
    min.y = Math.min(min.y, vertex.y);
    min.z = Math.min(min.z, vertex.z);
    
    max.x = Math.max(max.x, vertex.x);
    max.y = Math.max(max.y, vertex.y);
    max.z = Math.max(max.z, vertex.z);
  });
  
  const center = new Vector3().addVectors(min, max).multiplyScalar(0.5);
  const size = new Vector3().subVectors(max, min);
  
  return { min, max, center, size };
}

/**
 * Center vertices around a point
 */
export function centerVertices(vertices: Vertex[], center: Vector3): void {
  vertices.forEach(vertex => {
    vertex.x -= center.x;
    vertex.y -= center.y;
    vertex.z -= center.z;
  });
}

/**
 * Scale vertices
 */
export function scaleVertices(vertices: Vertex[], scale: Vector3): void {
  vertices.forEach(vertex => {
    vertex.x *= scale.x;
    vertex.y *= scale.y;
    vertex.z *= scale.z;
  });
}

/**
 * Rotate vertices around an axis
 */
export function rotateVertices(
  vertices: Vertex[],
  axis: Vector3,
  angle: number
): void {
  vertices.forEach(vertex => {
    const position = new Vector3(vertex.x, vertex.y, vertex.z);
    position.applyAxisAngle(axis, angle);
    vertex.x = position.x;
    vertex.y = position.y;
    vertex.z = position.z;
  });
}

/**
 * Applies a transformation matrix to all vertices in a mesh.
 * @param mesh - The mesh to transform.
 * @param matrix - The transformation matrix to apply.
 */
export function transformVertices(mesh: EditableMesh, matrix: Matrix4) {
  mesh.vertices.forEach(vertex => {
    const vec = new Vector3(vertex.x, vertex.y, vertex.z);
    vec.applyMatrix4(matrix);
    vertex.x = vec.x;
    vertex.y = vec.y;
    vertex.z = vec.z;
  });
}

/**
 * Create a grid of vertices
 */
export function createVertexGrid(
  width: number,
  height: number,
  generator: (x: number, y: number) => { x: number; y: number; z: number }
): Vertex[][] {
  const grid: Vertex[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: Vertex[] = [];
    for (let x = 0; x < width; x++) {
      const position = generator(x, y);
      const vertex = new Vertex(position.x, position.y, position.z);
      row.push(vertex);
    }
    grid.push(row);
  }
  
  return grid;
}

/**
 * Create faces from a vertex grid
 */
export function createFacesFromGrid(
  grid: Vertex[][],
  materialIndex: number = 0
): Face[] {
  const faces: Face[] = [];
  const height = grid.length;
  const width = grid[0]?.length || 0;
  
  if (height < 2 || width < 2) {
    return faces;
  }
  
  // Convert grid to flat vertex array and create index mapping
  const vertices: Vertex[] = [];
  const indexMap: number[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      vertices.push(grid[y][x]);
      row.push(vertices.length - 1);
    }
    indexMap.push(row);
  }
  
  // Create faces (quads as two triangles)
  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const v00 = indexMap[y][x];
      const v01 = indexMap[y][x + 1];
      const v10 = indexMap[y + 1][x];
      const v11 = indexMap[y + 1][x + 1];
      
      // First triangle
      const face1 = new Face(
        [v00, v01, v10],
        [], // Edges will be updated by the mesh
        {
          materialIndex,
          userData: {}
        }
      );
      
      // Second triangle
      const face2 = new Face(
        [v01, v11, v10],
        [], // Edges will be updated by the mesh
        {
          materialIndex,
          userData: {}
        }
      );
      
      faces.push(face1, face2);
    }
  }
  
  return faces;
} 