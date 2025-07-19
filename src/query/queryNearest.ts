import { Vector3, Ray, Triangle } from 'three';
import { EditableMesh } from '../core/EditableMesh';

/**
 * Result of a nearest element query
 */
export interface NearestElementResult {
  /** Type of the nearest element */
  type: 'vertex' | 'edge' | 'face';
  /** Index of the nearest element */
  index: number;
  /** Distance to the nearest element */
  distance: number;
  /** Point on the element closest to the query point */
  point: Vector3;
  /** Barycentric coordinates (for face results) */
  barycentric?: Vector3;
  /** Parameter t along edge (for edge results, 0 at v1, 1 at v2) */
  parameter?: number;
}

/**
 * Options for nearest element queries
 */
export interface NearestElementOptions {
  /** Maximum distance to consider */
  maxDistance?: number;
  /** Whether to include vertices in the search */
  includeVertices?: boolean;
  /** Whether to include edges in the search */
  includeEdges?: boolean;
  /** Whether to include faces in the search */
  includeFaces?: boolean;
  /** Indices of vertices to include in the search (if undefined, all vertices are included) */
  vertexIndices?: Set<number>;
  /** Indices of edges to include in the search (if undefined, all edges are included) */
  edgeIndices?: Set<number>;
  /** Indices of faces to include in the search (if undefined, all faces are included) */
  faceIndices?: Set<number>;
}

/**
 * Finds the nearest element (vertex, edge, or face) to a point
 * @param mesh The mesh to search in
 * @param point The query point
 * @param options Query options
 * @returns The nearest element, or null if none found within maxDistance
 */
export function findNearestElement(
  mesh: EditableMesh,
  point: Vector3,
  options: NearestElementOptions = {}
): NearestElementResult | null {
  // Set default options
  const opts = {
    maxDistance: options.maxDistance ?? Infinity,
    includeVertices: options.includeVertices ?? true,
    includeEdges: options.includeEdges ?? true,
    includeFaces: options.includeFaces ?? true,
    vertexIndices: options.vertexIndices,
    edgeIndices: options.edgeIndices,
    faceIndices: options.faceIndices
  };
  
  let nearestResult: NearestElementResult | null = null;
  let minDistance = opts.maxDistance;
  
  // Check vertices
  if (opts.includeVertices) {
    const vertexResult = findNearestVertex(mesh, point, opts.vertexIndices, minDistance);
    if (vertexResult && vertexResult.distance < minDistance) {
      nearestResult = vertexResult;
      minDistance = vertexResult.distance;
    }
  }
  
  // Check edges
  if (opts.includeEdges) {
    const edgeResult = findNearestEdge(mesh, point, opts.edgeIndices, minDistance);
    if (edgeResult && edgeResult.distance < minDistance) {
      nearestResult = edgeResult;
      minDistance = edgeResult.distance;
    }
  }
  
  // Check faces
  if (opts.includeFaces) {
    const faceResult = findNearestFace(mesh, point, opts.faceIndices, minDistance);
    if (faceResult && faceResult.distance < minDistance) {
      nearestResult = faceResult;
      minDistance = faceResult.distance;
    }
  }
  
  return nearestResult;
}

/**
 * Finds the nearest vertex to a point
 * @param mesh The mesh to search in
 * @param point The query point
 * @param vertexIndices Optional set of vertex indices to include in the search
 * @param maxDistance Maximum distance to consider
 * @returns The nearest vertex, or null if none found within maxDistance
 */
export function findNearestVertex(
  mesh: EditableMesh,
  point: Vector3,
  vertexIndices?: Set<number>,
  maxDistance: number = Infinity
): NearestElementResult | null {
  let nearestIndex = -1;
  let minDistanceSquared = maxDistance * maxDistance;
  
  // Iterate through vertices
  for (let i = 0; i < mesh.vertices.length; i++) {
    // Skip if not in the specified indices
    if (vertexIndices && !vertexIndices.has(i)) {
      continue;
    }
    
    const vertex = mesh.vertices[i];
    const dx = vertex.x - point.x;
    const dy = vertex.y - point.y;
    const dz = vertex.z - point.z;
    const distanceSquared = dx * dx + dy * dy + dz * dz;
    
    if (distanceSquared < minDistanceSquared) {
      minDistanceSquared = distanceSquared;
      nearestIndex = i;
    }
  }
  
  if (nearestIndex === -1) {
    return null;
  }
  
  const nearestVertex = mesh.vertices[nearestIndex];
  const nearestPoint = new Vector3(nearestVertex.x, nearestVertex.y, nearestVertex.z);
  
  return {
    type: 'vertex',
    index: nearestIndex,
    distance: Math.sqrt(minDistanceSquared),
    point: nearestPoint
  };
}

/**
 * Finds the nearest edge to a point
 * @param mesh The mesh to search in
 * @param point The query point
 * @param edgeIndices Optional set of edge indices to include in the search
 * @param maxDistance Maximum distance to consider
 * @returns The nearest edge, or null if none found within maxDistance
 */
export function findNearestEdge(
  mesh: EditableMesh,
  point: Vector3,
  edgeIndices?: Set<number>,
  maxDistance: number = Infinity
): NearestElementResult | null {
  let nearestIndex = -1;
  let minDistanceSquared = maxDistance * maxDistance;
  let nearestPoint = new Vector3();
  let nearestParameter = 0;
  
  // Iterate through edges
  for (let i = 0; i < mesh.edges.length; i++) {
    // Skip if not in the specified indices
    if (edgeIndices && !edgeIndices.has(i)) {
      continue;
    }
    
    const edge = mesh.edges[i];
    const v1 = mesh.getVertex(edge.v1);
    const v2 = mesh.getVertex(edge.v2);
    
    if (!v1 || !v2) {
      continue;
    }
    
    // Create line segment
    const start = new Vector3(v1.x, v1.y, v1.z);
    const end = new Vector3(v2.x, v2.y, v2.z);
    
    // Find closest point on line segment
    const result = closestPointOnLineSegment(point, start, end);
    
    if (result.distanceSquared < minDistanceSquared) {
      minDistanceSquared = result.distanceSquared;
      nearestIndex = i;
      nearestPoint = result.point;
      nearestParameter = result.parameter;
    }
  }
  
  if (nearestIndex === -1) {
    return null;
  }
  
  return {
    type: 'edge',
    index: nearestIndex,
    distance: Math.sqrt(minDistanceSquared),
    point: nearestPoint,
    parameter: nearestParameter
  };
}

/**
 * Finds the nearest face to a point
 * @param mesh The mesh to search in
 * @param point The query point
 * @param faceIndices Optional set of face indices to include in the search
 * @param maxDistance Maximum distance to consider
 * @returns The nearest face, or null if none found within maxDistance
 */
export function findNearestFace(
  mesh: EditableMesh,
  point: Vector3,
  faceIndices?: Set<number>,
  maxDistance: number = Infinity
): NearestElementResult | null {
  let nearestIndex = -1;
  let minDistanceSquared = maxDistance * maxDistance;
  let nearestPoint = new Vector3();
  let nearestBarycentric = new Vector3();
  
  // Iterate through faces
  for (let i = 0; i < mesh.faces.length; i++) {
    // Skip if not in the specified indices
    if (faceIndices && !faceIndices.has(i)) {
      continue;
    }
    
    const face = mesh.faces[i];
    
    // Skip faces with fewer than 3 vertices
    if (face.vertices.length < 3) {
      continue;
    }
    
    // Triangulate the face and find the closest point
    const v0 = mesh.getVertex(face.vertices[0]);
    if (!v0) continue;
    
    const v0Pos = new Vector3(v0.x, v0.y, v0.z);
    
    for (let j = 1; j < face.vertices.length - 1; j++) {
      const v1 = mesh.getVertex(face.vertices[j]);
      const v2 = mesh.getVertex(face.vertices[j + 1]);
      
      if (!v1 || !v2) continue;
      
      const v1Pos = new Vector3(v1.x, v1.y, v1.z);
      const v2Pos = new Vector3(v2.x, v2.y, v2.z);
      
      // Create triangle
      const triangle = new Triangle(v0Pos, v1Pos, v2Pos);
      
      // Find closest point on triangle
      const result = closestPointOnTriangle(point, triangle);
      
      if (result.distanceSquared < minDistanceSquared) {
        minDistanceSquared = result.distanceSquared;
        nearestIndex = i;
        nearestPoint = result.point;
        nearestBarycentric = result.barycentric;
      }
    }
  }
  
  if (nearestIndex === -1) {
    return null;
  }
  
  return {
    type: 'face',
    index: nearestIndex,
    distance: Math.sqrt(minDistanceSquared),
    point: nearestPoint,
    barycentric: nearestBarycentric
  };
}

/**
 * Finds the closest point on a line segment to a point
 * @param point The query point
 * @param start The start of the line segment
 * @param end The end of the line segment
 * @returns The closest point and parameter t along the line segment
 */
export function closestPointOnLineSegment(
  point: Vector3,
  start: Vector3,
  end: Vector3
): { point: Vector3, distanceSquared: number, parameter: number } {
  const line = end.clone().sub(start);
  const lineLength = line.length();
  
  // Handle degenerate line segment
  if (lineLength < 1e-10) {
    return {
      point: start.clone(),
      distanceSquared: point.distanceToSquared(start),
      parameter: 0
    };
  }
  
  // Normalize line direction
  line.divideScalar(lineLength);
  
  // Calculate parameter t along the line
  const pointToStart = point.clone().sub(start);
  const t = pointToStart.dot(line);
  
  // Clamp t to the line segment
  const parameter = Math.max(0, Math.min(lineLength, t));
  const normalizedParameter = parameter / lineLength;
  
  // Calculate closest point
  const closestPoint = start.clone().addScaledVector(line, parameter);
  const distanceSquared = point.distanceToSquared(closestPoint);
  
  return {
    point: closestPoint,
    distanceSquared,
    parameter: normalizedParameter
  };
}

/**
 * Finds the closest point on a triangle to a point
 * @param point The query point
 * @param triangle The triangle
 * @returns The closest point and barycentric coordinates
 */
export function closestPointOnTriangle(
  point: Vector3,
  triangle: Triangle
): { point: Vector3, distanceSquared: number, barycentric: Vector3 } {
  // Implementation based on Real-Time Collision Detection by Christer Ericson
  
  // Check if point is in vertex Voronoi regions
  const ab = triangle.b.clone().sub(triangle.a);
  const ac = triangle.c.clone().sub(triangle.a);
  const ap = point.clone().sub(triangle.a);
  
  const d1 = ab.dot(ap);
  const d2 = ac.dot(ap);
  
  // Barycentric coordinates
  let u = 0;
  let v = 0;
  let w = 0;
  
  // Check if P in vertex region outside A
  if (d1 <= 0 && d2 <= 0) {
    u = 1;
    v = 0;
    w = 0;
    return {
      point: triangle.a.clone(),
      distanceSquared: point.distanceToSquared(triangle.a),
      barycentric: new Vector3(u, v, w)
    };
  }
  
  // Check if P in vertex region outside B
  const bp = point.clone().sub(triangle.b);
  const d3 = ab.dot(bp);
  const d4 = ac.dot(bp);
  
  if (d3 >= 0 && d4 <= d3) {
    u = 0;
    v = 1;
    w = 0;
    return {
      point: triangle.b.clone(),
      distanceSquared: point.distanceToSquared(triangle.b),
      barycentric: new Vector3(u, v, w)
    };
  }
  
  // Check if P in edge region of AB
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    v = d1 / (d1 - d3);
    u = 1 - v;
    w = 0;
    const closestPoint = triangle.a.clone().addScaledVector(ab, v);
    return {
      point: closestPoint,
      distanceSquared: point.distanceToSquared(closestPoint),
      barycentric: new Vector3(u, v, w)
    };
  }
  
  // Check if P in vertex region outside C
  const cp = point.clone().sub(triangle.c);
  const d5 = ab.dot(cp);
  const d6 = ac.dot(cp);
  
  if (d6 >= 0 && d5 <= d6) {
    u = 0;
    v = 0;
    w = 1;
    return {
      point: triangle.c.clone(),
      distanceSquared: point.distanceToSquared(triangle.c),
      barycentric: new Vector3(u, v, w)
    };
  }
  
  // Check if P in edge region of AC
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    w = d2 / (d2 - d6);
    u = 1 - w;
    v = 0;
    const closestPoint = triangle.a.clone().addScaledVector(ac, w);
    return {
      point: closestPoint,
      distanceSquared: point.distanceToSquared(closestPoint),
      barycentric: new Vector3(u, v, w)
    };
  }
  
  // Check if P in edge region of BC
  const va = d3 * d6 - d5 * d4;
  const d43 = d4 - d3;
  const d56 = d5 - d6;
  
  if (va <= 0 && d43 >= 0 && d56 >= 0) {
    w = d43 / (d43 + d56);
    v = 1 - w;
    u = 0;
    const bc = triangle.c.clone().sub(triangle.b);
    const closestPoint = triangle.b.clone().addScaledVector(bc, w);
    return {
      point: closestPoint,
      distanceSquared: point.distanceToSquared(closestPoint),
      barycentric: new Vector3(u, v, w)
    };
  }
  
  // P inside face region. Compute closest point through barycentric coordinates
  const denom = 1.0 / (va + vb + vc);
  v = vb * denom;
  w = vc * denom;
  u = 1.0 - v - w;
  
  const closestPoint = triangle.a.clone()
    .multiplyScalar(u)
    .add(triangle.b.clone().multiplyScalar(v))
    .add(triangle.c.clone().multiplyScalar(w));
  
  return {
    point: closestPoint,
    distanceSquared: point.distanceToSquared(closestPoint),
    barycentric: new Vector3(u, v, w)
  };
}

/**
 * Finds elements intersected by a ray
 * @param mesh The mesh to search in
 * @param ray The ray to intersect with
 * @param options Query options
 * @returns Array of intersected elements, sorted by distance
 */
export function findRayIntersections(
  mesh: EditableMesh,
  ray: Ray,
  options: {
    maxDistance?: number;
    includeVertices?: boolean;
    includeEdges?: boolean;
    includeFaces?: boolean;
    vertexIndices?: Set<number>;
    edgeIndices?: Set<number>;
    faceIndices?: Set<number>;
    vertexRadius?: number;
  } = {}
): Array<{
  type: 'vertex' | 'edge' | 'face';
  index: number;
  distance: number;
  point: Vector3;
  barycentric?: Vector3;
  parameter?: number;
}> {
  // Set default options
  const opts = {
    maxDistance: options.maxDistance ?? Infinity,
    includeVertices: options.includeVertices ?? true,
    includeEdges: options.includeEdges ?? true,
    includeFaces: options.includeFaces ?? true,
    vertexIndices: options.vertexIndices,
    edgeIndices: options.edgeIndices,
    faceIndices: options.faceIndices,
    vertexRadius: options.vertexRadius ?? 0.1
  };
  
  const intersections: Array<{
    type: 'vertex' | 'edge' | 'face';
    index: number;
    distance: number;
    point: Vector3;
    barycentric?: Vector3;
    parameter?: number;
  }> = [];
  
  // Check vertices (as spheres)
  if (opts.includeVertices) {
    for (let i = 0; i < mesh.vertices.length; i++) {
      // Skip if not in the specified indices
      if (opts.vertexIndices && !opts.vertexIndices.has(i)) {
        continue;
      }
      
      const vertex = mesh.vertices[i];
      const vertexPos = new Vector3(vertex.x, vertex.y, vertex.z);
      
      // Check ray-sphere intersection
      const sphere = { center: vertexPos, radius: opts.vertexRadius };
      const intersection = rayIntersectsSphere(ray, sphere);
      
      if (intersection && intersection.distance <= opts.maxDistance) {
        intersections.push({
          type: 'vertex',
          index: i,
          distance: intersection.distance,
          point: intersection.point
        });
      }
    }
  }
  
  // Check faces
  if (opts.includeFaces) {
    for (let i = 0; i < mesh.faces.length; i++) {
      // Skip if not in the specified indices
      if (opts.faceIndices && !opts.faceIndices.has(i)) {
        continue;
      }
      
      const face = mesh.faces[i];
      
      // Skip faces with fewer than 3 vertices
      if (face.vertices.length < 3) {
        continue;
      }
      
      // Triangulate the face and check intersections
      const v0 = mesh.getVertex(face.vertices[0]);
      if (!v0) continue;
      
      const v0Pos = new Vector3(v0.x, v0.y, v0.z);
      
      for (let j = 1; j < face.vertices.length - 1; j++) {
        const v1 = mesh.getVertex(face.vertices[j]);
        const v2 = mesh.getVertex(face.vertices[j + 1]);
        
        if (!v1 || !v2) continue;
        
        const v1Pos = new Vector3(v1.x, v1.y, v1.z);
        const v2Pos = new Vector3(v2.x, v2.y, v2.z);
        
        // Create triangle
        const triangle = new Triangle(v0Pos, v1Pos, v2Pos);
        
        // Check ray-triangle intersection
        const intersection = rayIntersectsTriangle(ray, triangle);
        
        if (intersection && intersection.distance <= opts.maxDistance) {
          intersections.push({
            type: 'face',
            index: i,
            distance: intersection.distance,
            point: intersection.point,
            barycentric: intersection.barycentric
          });
        }
      }
    }
  }
  
  // Check edges
  if (opts.includeEdges) {
    for (let i = 0; i < mesh.edges.length; i++) {
      // Skip if not in the specified indices
      if (opts.edgeIndices && !opts.edgeIndices.has(i)) {
        continue;
      }
      
      const edge = mesh.edges[i];
      const v1 = mesh.getVertex(edge.v1);
      const v2 = mesh.getVertex(edge.v2);
      
      if (!v1 || !v2) {
        continue;
      }
      
      // Create line segment
      const start = new Vector3(v1.x, v1.y, v1.z);
      const end = new Vector3(v2.x, v2.y, v2.z);
      
      // Check ray-line segment intersection
      const intersection = rayIntersectsLineSegment(ray, start, end);
      
      if (intersection && intersection.distance <= opts.maxDistance) {
        intersections.push({
          type: 'edge',
          index: i,
          distance: intersection.distance,
          point: intersection.point,
          parameter: intersection.parameter
        });
      }
    }
  }
  
  // Sort intersections by distance
  intersections.sort((a, b) => a.distance - b.distance);
  
  return intersections;
}

/**
 * Checks if a ray intersects a sphere
 * @param ray The ray
 * @param sphere The sphere
 * @returns Intersection information, or null if no intersection
 */
function rayIntersectsSphere(
  ray: Ray,
  sphere: { center: Vector3, radius: number }
): { distance: number, point: Vector3 } | null {
  const v1 = sphere.center.clone().sub(ray.origin);
  const tca = v1.dot(ray.direction);
  
  // If tca is negative, the sphere is behind the ray
  if (tca < 0) {
    return null;
  }
  
  const d2 = v1.dot(v1) - tca * tca;
  const radiusSquared = sphere.radius * sphere.radius;
  
  // If d2 is greater than radius^2, the ray misses the sphere
  if (d2 > radiusSquared) {
    return null;
  }
  
  const thc = Math.sqrt(radiusSquared - d2);
  
  // Calculate intersection distances
  const t0 = tca - thc;
  const t1 = tca + thc;
  
  // If both t0 and t1 are negative, the sphere is behind the ray
  if (t0 < 0 && t1 < 0) {
    return null;
  }
  
  // Use the smaller non-negative value
  const t = t0 < 0 ? t1 : t0;
  
  const point = ray.origin.clone().addScaledVector(ray.direction, t);
  
  return {
    distance: t,
    point
  };
}

/**
 * Checks if a ray intersects a triangle
 * @param ray The ray
 * @param triangle The triangle
 * @returns Intersection information, or null if no intersection
 */
function rayIntersectsTriangle(
  ray: Ray,
  triangle: Triangle
): { distance: number, point: Vector3, barycentric: Vector3 } | null {
  // Möller–Trumbore algorithm
  const edge1 = triangle.b.clone().sub(triangle.a);
  const edge2 = triangle.c.clone().sub(triangle.a);
  const pvec = new Vector3().crossVectors(ray.direction, edge2);
  const det = edge1.dot(pvec);
  
  // Ray is parallel to triangle
  if (Math.abs(det) < 1e-10) {
    return null;
  }
  
  const invDet = 1 / det;
  const tvec = ray.origin.clone().sub(triangle.a);
  const u = tvec.dot(pvec) * invDet;
  
  // Intersection is outside triangle
  if (u < 0 || u > 1) {
    return null;
  }
  
  const qvec = new Vector3().crossVectors(tvec, edge1);
  const v = ray.direction.dot(qvec) * invDet;
  
  // Intersection is outside triangle
  if (v < 0 || u + v > 1) {
    return null;
  }
  
  // Calculate distance
  const t = edge2.dot(qvec) * invDet;
  
  // Intersection is behind ray origin
  if (t < 0) {
    return null;
  }
  
  const point = ray.origin.clone().addScaledVector(ray.direction, t);
  const w = 1 - u - v;
  
  return {
    distance: t,
    point,
    barycentric: new Vector3(w, u, v)
  };
}

/**
 * Checks if a ray intersects a line segment
 * @param ray The ray
 * @param start The start of the line segment
 * @param end The end of the line segment
 * @returns Intersection information, or null if no intersection
 */
function rayIntersectsLineSegment(
  ray: Ray,
  start: Vector3,
  end: Vector3
): { distance: number, point: Vector3, parameter: number } | null {
  // Line segment direction
  const segmentDir = end.clone().sub(start);
  const segmentLength = segmentDir.length();
  
  // Handle degenerate line segment
  if (segmentLength < 1e-10) {
    return null;
  }
  
  // Normalize segment direction
  segmentDir.divideScalar(segmentLength);
  
  // Calculate closest points between ray and line segment
  const v13 = ray.origin.clone().sub(start);
  const v43 = ray.direction;
  const v21 = segmentDir;
  
  const d1343 = v13.dot(v43);
  const d4321 = v43.dot(v21);
  const d1321 = v13.dot(v21);
  const d4343 = v43.dot(v43);
  const d2121 = v21.dot(v21);
  
  const denom = d2121 * d4343 - d4321 * d4321;
  
  // Lines are parallel
  if (Math.abs(denom) < 1e-10) {
    return null;
  }
  
  const numer = d1343 * d4321 - d1321 * d4343;
  
  const mua = numer / denom;
  const mub = (d1343 + d4321 * mua) / d4343;
  
  // Check if intersection is within line segment
  if (mua < 0 || mua > segmentLength || mub < 0) {
    return null;
  }
  
  // Calculate intersection points
  const pa = start.clone().addScaledVector(segmentDir, mua);
  const pb = ray.origin.clone().addScaledVector(ray.direction, mub);
  
  // Check if points are close enough
  const distanceSquared = pa.distanceToSquared(pb);
  const threshold = 1e-6;
  
  if (distanceSquared > threshold) {
    return null;
  }
  
  return {
    distance: mub,
    point: pb,
    parameter: mua / segmentLength
  };
}
