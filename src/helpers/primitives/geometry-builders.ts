/**
 * Geometry Builders - Complete primitive creation functions
 * These combine vertex and face generators to create complete geometries
 */

import { Vector3 } from 'three';
import { Vertex, Face } from '../../core';
import { PrimitiveResult } from './types';
import * as vertexGenerators from './vertex-generators';
import * as faceGenerators from './face-generators';

/**
 * Build a plane geometry
 */
export function buildPlane(
  width: number = 1,
  height: number = 1,
  widthSegments: number = 1,
  heightSegments: number = 1,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices = vertexGenerators.createGridVertices(
    width, 
    height, 
    widthSegments, 
    heightSegments, 
    true
  );
  
  const faces = faceGenerators.createPlaneFaces(
    widthSegments, 
    heightSegments, 
    materialIndex
  );
  
  return {
    vertices,
    faces,
    vertexCount: vertices.length,
    faceCount: faces.length
  };
}

/**
 * Build a box/cube geometry
 */
export function buildBox(
  width: number = 1,
  height: number = 1,
  depth: number = 1,
  widthSegments: number = 1,
  heightSegments: number = 1,
  depthSegments: number = 1,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices = vertexGenerators.createBoxVertices(
    width, 
    height, 
    depth, 
    widthSegments, 
    heightSegments, 
    depthSegments
  );
  
  const faces = faceGenerators.createBoxFaces(
    widthSegments, 
    heightSegments, 
    depthSegments, 
    materialIndex
  );
  
  return {
    vertices,
    faces,
    vertexCount: vertices.length,
    faceCount: faces.length
  };
}

/**
 * Build a sphere geometry
 */
export function buildSphere(
  radius: number = 0.5,
  widthSegments: number = 8,
  heightSegments: number = 6,
  phiStart: number = 0,
  phiLength: number = Math.PI * 2,
  thetaStart: number = 0,
  thetaLength: number = Math.PI,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices = vertexGenerators.createSphereVertices(
    radius,
    widthSegments,
    heightSegments,
    phiStart,
    phiLength,
    thetaStart,
    thetaLength
  );
  
  const faces = faceGenerators.createSphereFaces(
    widthSegments,
    heightSegments,
    materialIndex
  );
  
  return {
    vertices,
    faces,
    vertexCount: vertices.length,
    faceCount: faces.length
  };
}

/**
 * Build a cylinder geometry
 */
export function buildCylinder(
  radiusTop: number = 0.5,
  radiusBottom: number = 0.5,
  height: number = 1,
  radialSegments: number = 8,
  heightSegments: number = 1,
  openEnded: boolean = false,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices = vertexGenerators.createCylinderVertices(
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    heightSegments,
    openEnded
  );
  
  const faces = faceGenerators.createCylinderFaces(
    radialSegments,
    heightSegments,
    openEnded,
    materialIndex
  );
  
  return {
    vertices,
    faces,
    vertexCount: vertices.length,
    faceCount: faces.length
  };
}

/**
 * Build a cone geometry
 */
export function buildCone(
  radius: number = 0.5,
  height: number = 1,
  radialSegments: number = 8,
  heightSegments: number = 1,
  openEnded: boolean = false,
  materialIndex: number = 0
): PrimitiveResult {
  return buildCylinder(0, radius, height, radialSegments, heightSegments, openEnded, materialIndex);
}

/**
 * Build a torus geometry
 */
export function buildTorus(
  radius: number = 0.5,
  tube: number = 0.2,
  radialSegments: number = 8,
  tubularSegments: number = 6,
  arc: number = Math.PI * 2,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices = vertexGenerators.createTorusVertices(
    radius,
    tube,
    radialSegments,
    tubularSegments,
    arc
  );
  
  const faces = faceGenerators.createTorusFaces(
    radialSegments,
    tubularSegments,
    materialIndex
  );
  
  return {
    vertices,
    faces,
    vertexCount: vertices.length,
    faceCount: faces.length
  };
}

/**
 * Build a circle geometry
 */
export function buildCircle(
  radius: number = 0.5,
  segments: number = 8,
  startAngle: number = 0,
  endAngle: number = Math.PI * 2,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices = vertexGenerators.createCircleVertices(
    radius,
    segments,
    startAngle,
    endAngle
  );
  
  const faces = faceGenerators.createCircleFaces(
    segments,
    materialIndex
  );
  
  return {
    vertices,
    faces,
    vertexCount: vertices.length,
    faceCount: faces.length
  };
}

/**
 * Build a ring geometry
 */
export function buildRing(
  innerRadius: number = 0.3,
  outerRadius: number = 0.5,
  radialSegments: number = 8,
  tubularSegments: number = 6,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices: Vertex[] = [];
  
  for (let i = 0; i <= radialSegments; i++) {
    const radius = innerRadius + (outerRadius - innerRadius) * (i / radialSegments);
    const circleVertices = vertexGenerators.createCircleVertices(
      radius,
      tubularSegments,
      0,
      Math.PI * 2
    );
    vertices.push(...circleVertices);
  }
  
  const faces = faceGenerators.createRingFaces(
    radialSegments,
    tubularSegments,
    materialIndex
  );
  
  return {
    vertices,
    faces,
    vertexCount: vertices.length,
    faceCount: faces.length
  };
}

/**
 * Build a capsule geometry
 */
export function buildCapsule(
  radius: number = 0.5,
  height: number = 1,
  radialSegments: number = 8,
  heightSegments: number = 1,
  materialIndex: number = 0
): PrimitiveResult {
  const halfHeight = height / 2;
  const vertices: Vertex[] = [];
  
  // Top hemisphere
  const topSphereVertices = vertexGenerators.createSphereVertices(
    radius,
    radialSegments,
    heightSegments,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  
  // Transform top sphere vertices
  topSphereVertices.forEach(vertex => {
    vertex.y += halfHeight;
  });
  vertices.push(...topSphereVertices);
  
  // Bottom hemisphere
  const bottomSphereVertices = vertexGenerators.createSphereVertices(
    radius,
    radialSegments,
    heightSegments,
    0,
    Math.PI * 2,
    Math.PI / 2,
    Math.PI
  );
  
  // Transform bottom sphere vertices
  bottomSphereVertices.forEach(vertex => {
    vertex.y -= halfHeight;
  });
  vertices.push(...bottomSphereVertices);
  
  // Create faces (simplified - would need proper face generation for capsule)
  const faces = faceGenerators.createSphereFaces(
    radialSegments,
    heightSegments * 2,
    materialIndex
  );
  
  return {
    vertices,
    faces,
    vertexCount: vertices.length,
    faceCount: faces.length
  };
}

/**
 * Build a pyramid geometry
 */
export function buildPyramid(
  width: number = 1,
  height: number = 1,
  depth: number = 1,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices: Vertex[] = [];
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  
  // Base vertices
  vertices.push(
    vertexGenerators.createVertex(-halfWidth, 0, -halfDepth), // 0
    vertexGenerators.createVertex(halfWidth, 0, -halfDepth),  // 1
    vertexGenerators.createVertex(halfWidth, 0, halfDepth),   // 2
    vertexGenerators.createVertex(-halfWidth, 0, halfDepth)   // 3
  );
  
  // Apex vertex
  vertices.push(vertexGenerators.createVertex(0, height, 0)); // 4
  
  const faces: Face[] = [];
  
  // Base face
  faces.push(faceGenerators.createTriangleFace(0, 2, 1, { materialIndex }));
  faces.push(faceGenerators.createTriangleFace(0, 3, 2, { materialIndex }));
  
  // Side faces
  faces.push(faceGenerators.createTriangleFace(0, 1, 4, { materialIndex }));
  faces.push(faceGenerators.createTriangleFace(1, 2, 4, { materialIndex }));
  faces.push(faceGenerators.createTriangleFace(2, 3, 4, { materialIndex }));
  faces.push(faceGenerators.createTriangleFace(3, 0, 4, { materialIndex }));
  
  return {
    vertices,
    faces,
    vertexCount: vertices.length,
    faceCount: faces.length
  };
}

/**
 * Build a tetrahedron geometry
 */
export function buildTetrahedron(
  radius: number = 0.5,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices: Vertex[] = [];
  const sqrt3 = Math.sqrt(3);
  const sqrt6 = Math.sqrt(6);
  
  // Tetrahedron vertices
  vertices.push(
    vertexGenerators.createVertex(0, radius, 0),                    // Top
    vertexGenerators.createVertex(-radius / sqrt3, -radius / 3, -2 * radius / sqrt6), // Bottom left back
    vertexGenerators.createVertex(-radius / sqrt3, -radius / 3, 2 * radius / sqrt6),  // Bottom left front
    vertexGenerators.createVertex(2 * radius / sqrt3, -radius / 3, 0)                 // Bottom right
  );
  
  const faces: Face[] = [];
  
  // All faces are triangles
  faces.push(faceGenerators.createTriangleFace(0, 1, 2, { materialIndex })); // Front
  faces.push(faceGenerators.createTriangleFace(0, 2, 3, { materialIndex })); // Right
  faces.push(faceGenerators.createTriangleFace(0, 3, 1, { materialIndex })); // Left
  faces.push(faceGenerators.createTriangleFace(1, 3, 2, { materialIndex })); // Bottom
  
  return {
    vertices,
    faces,
    vertexCount: vertices.length,
    faceCount: faces.length
  };
}

/**
 * Build an octahedron geometry
 */
export function buildOctahedron(
  radius: number = 0.5,
  materialIndex: number = 0
): PrimitiveResult {
  const vertices: Vertex[] = [];
  
  // Octahedron vertices
  vertices.push(
    vertexGenerators.createVertex(0, radius, 0),   // Top
    vertexGenerators.createVertex(0, -radius, 0),  // Bottom
    vertexGenerators.createVertex(radius, 0, 0),   // Right
    vertexGenerators.createVertex(-radius, 0, 0),  // Left
    vertexGenerators.createVertex(0, 0, radius),   // Front
    vertexGenerators.createVertex(0, 0, -radius)   // Back
  );
  
  const faces: Face[] = [];
  
  // All faces are triangles
  faces.push(faceGenerators.createTriangleFace(0, 2, 4, { materialIndex })); // Top front right
  faces.push(faceGenerators.createTriangleFace(0, 4, 3, { materialIndex })); // Top front left
  faces.push(faceGenerators.createTriangleFace(0, 3, 5, { materialIndex })); // Top back left
  faces.push(faceGenerators.createTriangleFace(0, 5, 2, { materialIndex })); // Top back right
  faces.push(faceGenerators.createTriangleFace(1, 4, 2, { materialIndex })); // Bottom front right
  faces.push(faceGenerators.createTriangleFace(1, 3, 4, { materialIndex })); // Bottom front left
  faces.push(faceGenerators.createTriangleFace(1, 5, 3, { materialIndex })); // Bottom back left
  faces.push(faceGenerators.createTriangleFace(1, 2, 5, { materialIndex })); // Bottom back right
  
  return {
    vertices,
    faces,
    vertexCount: vertices.length,
    faceCount: faces.length
  };
} 