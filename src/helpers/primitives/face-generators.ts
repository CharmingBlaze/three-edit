/**
 * Face Generators - Reusable functions for creating faces in primitives
 * These provide the building blocks for all primitive geometry
 */

import { Vector3 } from 'three';
import { Face } from '../../core';
import { FaceOptions } from './types';

/**
 * Create a basic face with vertex indices
 */
export function createFace(indices: number[], options?: FaceOptions): Face {
  return new Face(indices, [], {
    materialIndex: options?.materialIndex || 0,
    normal: options?.normal,
    userData: options?.userData || {}
  });
}

/**
 * Create a triangle face
 */
export function createTriangleFace(
  a: number, 
  b: number, 
  c: number, 
  options?: FaceOptions
): Face {
  return createFace([a, b, c], options);
}

/**
 * Create a quad face (as two triangles)
 */
export function createQuadFace(
  a: number, 
  b: number, 
  c: number, 
  d: number, 
  options?: FaceOptions
): Face[] {
  return [
    createTriangleFace(a, b, c, options),
    createTriangleFace(a, c, d, options)
  ];
}

/**
 * Create faces for a grid
 */
export function createGridFaces(
  widthSegments: number,
  heightSegments: number,
  materialIndex: number = 0
): Face[] {
  const faces: Face[] = [];
  
  for (let z = 0; z < heightSegments; z++) {
    for (let x = 0; x < widthSegments; x++) {
      const a = z * (widthSegments + 1) + x;
      const b = a + 1;
      const c = (z + 1) * (widthSegments + 1) + x;
      const d = c + 1;
      
      faces.push(...createQuadFace(a, b, c, d, { materialIndex }));
    }
  }
  
  return faces;
}

/**
 * Create faces for a circle
 */
export function createCircleFaces(
  segments: number,
  materialIndex: number = 0
): Face[] {
  const faces: Face[] = [];
  
  for (let i = 0; i < segments; i++) {
    const a = i;
    const b = (i + 1) % segments;
    const c = segments; // Center vertex
    
    faces.push(createTriangleFace(a, b, c, { materialIndex }));
  }
  
  return faces;
}

/**
 * Create faces for a sphere
 */
export function createSphereFaces(
  widthSegments: number,
  heightSegments: number,
  materialIndex: number = 0
): Face[] {
  const faces: Face[] = [];
  
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < widthSegments; x++) {
      const a = y * (widthSegments + 1) + x;
      const b = a + 1;
      const c = (y + 1) * (widthSegments + 1) + x;
      const d = c + 1;
      
      faces.push(...createQuadFace(a, b, c, d, { materialIndex }));
    }
  }
  
  return faces;
}

/**
 * Create faces for a cylinder
 */
export function createCylinderFaces(
  radialSegments: number,
  heightSegments: number,
  openEnded: boolean = false,
  materialIndex: number = 0
): Face[] {
  const faces: Face[] = [];
  
  // Side faces
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const a = y * (radialSegments + 1) + x;
      const b = a + 1;
      const c = (y + 1) * (radialSegments + 1) + x;
      const d = c + 1;
      
      faces.push(...createQuadFace(a, b, c, d, { materialIndex }));
    }
  }
  
  if (!openEnded) {
    // Top and bottom faces
    const topOffset = (heightSegments + 1) * (radialSegments + 1);
    const bottomOffset = topOffset + radialSegments + 1;
    
    // Top face
    for (let x = 0; x < radialSegments; x++) {
      const a = topOffset + x;
      const b = topOffset + (x + 1) % radialSegments;
      const c = topOffset + radialSegments; // Center vertex
      
      faces.push(createTriangleFace(a, b, c, { materialIndex }));
    }
    
    // Bottom face
    for (let x = 0; x < radialSegments; x++) {
      const a = bottomOffset + x;
      const b = bottomOffset + (x + 1) % radialSegments;
      const c = bottomOffset + radialSegments; // Center vertex
      
      faces.push(createTriangleFace(a, c, b, { materialIndex })); // Reversed winding
    }
  }
  
  return faces;
}

/**
 * Create faces for a torus
 */
export function createTorusFaces(
  radialSegments: number,
  tubularSegments: number,
  materialIndex: number = 0
): Face[] {
  const faces: Face[] = [];
  
  for (let j = 0; j < radialSegments; j++) {
    for (let i = 0; i < tubularSegments; i++) {
      const a = j * (tubularSegments + 1) + i;
      const b = a + 1;
      const c = (j + 1) * (tubularSegments + 1) + i;
      const d = c + 1;
      
      faces.push(...createQuadFace(a, b, c, d, { materialIndex }));
    }
  }
  
  return faces;
}

/**
 * Create faces for a box/cube
 */
export function createBoxFaces(
  widthSegments: number,
  heightSegments: number,
  depthSegments: number,
  materialIndex: number = 0
): Face[] {
  const faces: Face[] = [];
  const verticesPerFace = (widthSegments + 1) * (heightSegments + 1);
  
  // Front face
  const frontOffset = 0;
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < widthSegments; x++) {
      const a = frontOffset + y * (widthSegments + 1) + x;
      const b = a + 1;
      const c = frontOffset + (y + 1) * (widthSegments + 1) + x;
      const d = c + 1;
      
      faces.push(...createQuadFace(a, b, c, d, { materialIndex }));
    }
  }
  
  // Back face
  const backOffset = verticesPerFace;
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < widthSegments; x++) {
      const a = backOffset + y * (widthSegments + 1) + x;
      const b = a + 1;
      const c = backOffset + (y + 1) * (widthSegments + 1) + x;
      const d = c + 1;
      
      faces.push(...createQuadFace(a, c, b, d, { materialIndex })); // Reversed winding
    }
  }
  
  // Top face
  const topOffset = backOffset + verticesPerFace;
  for (let z = 0; z < depthSegments; z++) {
    for (let x = 0; x < widthSegments; x++) {
      const a = topOffset + z * (widthSegments + 1) + x;
      const b = a + 1;
      const c = topOffset + (z + 1) * (widthSegments + 1) + x;
      const d = c + 1;
      
      faces.push(...createQuadFace(a, b, c, d, { materialIndex }));
    }
  }
  
  // Bottom face
  const bottomOffset = topOffset + verticesPerFace;
  for (let z = 0; z < depthSegments; z++) {
    for (let x = 0; x < widthSegments; x++) {
      const a = bottomOffset + z * (widthSegments + 1) + x;
      const b = a + 1;
      const c = bottomOffset + (z + 1) * (widthSegments + 1) + x;
      const d = c + 1;
      
      faces.push(...createQuadFace(a, c, b, d, { materialIndex })); // Reversed winding
    }
  }
  
  // Right face
  const rightOffset = bottomOffset + verticesPerFace;
  for (let z = 0; z < depthSegments; z++) {
    for (let y = 0; y < heightSegments; y++) {
      const a = rightOffset + z * (heightSegments + 1) + y;
      const b = a + 1;
      const c = rightOffset + (z + 1) * (heightSegments + 1) + y;
      const d = c + 1;
      
      faces.push(...createQuadFace(a, b, c, d, { materialIndex }));
    }
  }
  
  // Left face
  const leftOffset = rightOffset + verticesPerFace;
  for (let z = 0; z < depthSegments; z++) {
    for (let y = 0; y < heightSegments; y++) {
      const a = leftOffset + z * (heightSegments + 1) + y;
      const b = a + 1;
      const c = leftOffset + (z + 1) * (heightSegments + 1) + y;
      const d = c + 1;
      
      faces.push(...createQuadFace(a, c, b, d, { materialIndex })); // Reversed winding
    }
  }
  
  return faces;
}

/**
 * Create faces for a plane (single face)
 */
export function createPlaneFaces(
  widthSegments: number,
  heightSegments: number,
  materialIndex: number = 0
): Face[] {
  return createGridFaces(widthSegments, heightSegments, materialIndex);
}

/**
 * Create faces for a ring (donut shape)
 */
export function createRingFaces(
  innerSegments: number,
  outerSegments: number,
  materialIndex: number = 0
): Face[] {
  const faces: Face[] = [];
  
  for (let i = 0; i < innerSegments; i++) {
    for (let j = 0; j < outerSegments; j++) {
      const a = i * (outerSegments + 1) + j;
      const b = a + 1;
      const c = (i + 1) * (outerSegments + 1) + j;
      const d = c + 1;
      
      faces.push(...createQuadFace(a, b, c, d, { materialIndex }));
    }
  }
  
  return faces;
}

/**
 * Create faces for a cone
 */
export function createConeFaces(
  radialSegments: number,
  heightSegments: number,
  openEnded: boolean = false,
  materialIndex: number = 0
): Face[] {
  const faces: Face[] = [];
  
  // Side faces
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const a = y * (radialSegments + 1) + x;
      const b = a + 1;
      const c = (y + 1) * (radialSegments + 1) + x;
      const d = c + 1;
      
      faces.push(...createQuadFace(a, b, c, d, { materialIndex }));
    }
  }
  
  if (!openEnded) {
    // Bottom face
    const bottomOffset = (heightSegments + 1) * (radialSegments + 1);
    for (let x = 0; x < radialSegments; x++) {
      const a = bottomOffset + x;
      const b = bottomOffset + (x + 1) % radialSegments;
      const c = bottomOffset + radialSegments; // Center vertex
      
      faces.push(createTriangleFace(a, c, b, { materialIndex })); // Reversed winding
    }
  }
  
  return faces;
} 