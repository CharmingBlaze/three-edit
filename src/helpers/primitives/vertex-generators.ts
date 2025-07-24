/**
 * Vertex Generators - Reusable functions for creating vertices in primitives
 * These provide the building blocks for all primitive geometry
 */

import { Vector3, Vector2 } from 'three';
import { Vertex } from '../../core';
import { VertexOptions } from './types';
import { UVCoord } from '../../uv/types';

/**
 * Create a basic vertex with position
 */
export function createVertex(x: number, y: number, z: number, options?: VertexOptions): Vertex {
  // Convert Vector2 UV to UVCoord if needed
  const uv = options?.uv ? 
    (typeof options.uv === 'object' && 'u' in options.uv && 'v' in options.uv) ? 
      { u: (options.uv as any).u, v: (options.uv as any).v } : 
      { u: (options.uv as any).x, v: (options.uv as any).y } : 
    undefined;
    
  return new Vertex(x, y, z, {
    uv,
    normal: options?.normal,
    color: options?.color,
    userData: options?.userData || {}
  });
}

/**
 * Create a vertex with UV coordinates
 */
export function createVertexWithUV(
  x: number, 
  y: number, 
  z: number, 
  u: number, 
  v: number, 
  options?: VertexOptions
): Vertex {
  return createVertex(x, y, z, {
    ...options,
    uv: { u, v } as UVCoord
  });
}

/**
 * Create a vertex with normal
 */
export function createVertexWithNormal(
  x: number, 
  y: number, 
  z: number, 
  normal: Vector3, 
  options?: VertexOptions
): Vertex {
  return createVertex(x, y, z, {
    ...options,
    normal: normal.clone()
  });
}

/**
 * Create a vertex with color
 */
export function createVertexWithColor(
  x: number, 
  y: number, 
  z: number, 
  color: Vector3, 
  options?: VertexOptions
): Vertex {
  return createVertex(x, y, z, {
    ...options,
    color: color.clone()
  });
}

/**
 * Create vertices in a grid pattern
 */
export function createGridVertices(
  width: number,
  height: number,
  widthSegments: number = 1,
  heightSegments: number = 1,
  center: boolean = true
): Vertex[] {
  const vertices: Vertex[] = [];
  const segmentWidth = width / widthSegments;
  const segmentHeight = height / heightSegments;
  
  const offsetX = center ? -width / 2 : 0;
  const offsetZ = center ? -height / 2 : 0;
  
  for (let z = 0; z <= heightSegments; z++) {
    for (let x = 0; x <= widthSegments; x++) {
      const vertexX = offsetX + x * segmentWidth;
      const vertexZ = offsetZ + z * segmentHeight;
      const u = x / widthSegments;
      const v = z / heightSegments;
      
      vertices.push(createVertexWithUV(vertexX, 0, vertexZ, u, v));
    }
  }
  
  return vertices;
}

/**
 * Create vertices in a circle pattern
 */
export function createCircleVertices(
  radius: number,
  segments: number,
  startAngle: number = 0,
  endAngle: number = Math.PI * 2,
  center: Vector3 = new Vector3(0, 0, 0)
): Vertex[] {
  const vertices: Vertex[] = [];
  const angleStep = (endAngle - startAngle) / segments;
  
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + i * angleStep;
    const x = center.x + radius * Math.cos(angle);
    const z = center.z + radius * Math.sin(angle);
    const u = (angle - startAngle) / (endAngle - startAngle);
    
    vertices.push(createVertexWithUV(x, center.y, z, u, 0));
  }
  
  return vertices;
}

/**
 * Create vertices in a sphere pattern
 */
export function createSphereVertices(
  radius: number,
  widthSegments: number,
  heightSegments: number,
  phiStart: number = 0,
  phiLength: number = Math.PI * 2,
  thetaStart: number = 0,
  thetaLength: number = Math.PI,
  center: Vector3 = new Vector3(0, 0, 0)
): Vertex[] {
  const vertices: Vertex[] = [];
  
  for (let y = 0; y <= heightSegments; y++) {
    const theta = thetaStart + (y / heightSegments) * thetaLength;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    
    for (let x = 0; x <= widthSegments; x++) {
      const phi = phiStart + (x / widthSegments) * phiLength;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      
      const vertexX = center.x + radius * cosPhi * sinTheta;
      const vertexY = center.y + radius * cosTheta;
      const vertexZ = center.z + radius * sinPhi * sinTheta;
      
      const normal = new Vector3(cosPhi * sinTheta, cosTheta, sinPhi * sinTheta);
      const u = x / widthSegments;
      const v = y / heightSegments;
      
      vertices.push(createVertexWithUV(vertexX, vertexY, vertexZ, u, v, { normal }));
    }
  }
  
  return vertices;
}

/**
 * Create vertices in a cylinder pattern
 */
export function createCylinderVertices(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  radialSegments: number,
  heightSegments: number,
  openEnded: boolean = false,
  thetaStart: number = 0,
  thetaLength: number = Math.PI * 2,
  center: Vector3 = new Vector3(0, 0, 0)
): Vertex[] {
  const vertices: Vertex[] = [];
  const halfHeight = height / 2;
  
  for (let y = 0; y <= heightSegments; y++) {
    const radius = radiusTop + (radiusBottom - radiusTop) * (y / heightSegments);
    const vertexY = center.y + halfHeight - (y / heightSegments) * height;
    
    for (let x = 0; x <= radialSegments; x++) {
      const theta = thetaStart + (x / radialSegments) * thetaLength;
      const vertexX = center.x + radius * Math.cos(theta);
      const vertexZ = center.z + radius * Math.sin(theta);
      
      const normal = new Vector3(Math.cos(theta), 0, Math.sin(theta));
      const u = x / radialSegments;
      const v = y / heightSegments;
      
      vertices.push(createVertexWithUV(vertexX, vertexY, vertexZ, u, v, { normal }));
    }
  }
  
  return vertices;
}

/**
 * Create vertices in a torus pattern
 */
export function createTorusVertices(
  radius: number,
  tube: number,
  radialSegments: number,
  tubularSegments: number,
  arc: number = Math.PI * 2,
  center: Vector3 = new Vector3(0, 0, 0)
): Vertex[] {
  const vertices: Vertex[] = [];
  
  for (let j = 0; j <= radialSegments; j++) {
    const u = j / radialSegments * arc;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);
    
    for (let i = 0; i <= tubularSegments; i++) {
      const v = i / tubularSegments * Math.PI * 2;
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);
      
      const vertexX = center.x + (radius + tube * cosV) * cosU;
      const vertexY = center.y + (radius + tube * cosV) * sinU;
      const vertexZ = center.z + tube * sinV;
      
      const normal = new Vector3(cosV * cosU, cosV * sinU, sinV);
      const uCoord = j / radialSegments;
      const vCoord = i / tubularSegments;
      
      vertices.push(createVertexWithUV(vertexX, vertexY, vertexZ, uCoord, vCoord, { normal }));
    }
  }
  
  return vertices;
}

/**
 * Create vertices for a box/cube
 */
export function createBoxVertices(
  width: number,
  height: number,
  depth: number,
  widthSegments: number = 1,
  heightSegments: number = 1,
  depthSegments: number = 1,
  center: Vector3 = new Vector3(0, 0, 0)
): Vertex[] {
  const vertices: Vertex[] = [];
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDepth = depth / 2;
  
  // Front face
  for (let y = 0; y <= heightSegments; y++) {
    for (let x = 0; x <= widthSegments; x++) {
      const vertexX = center.x + (x / widthSegments - 0.5) * width;
      const vertexY = center.y + (y / heightSegments - 0.5) * height;
      const vertexZ = center.z + halfDepth;
      const u = x / widthSegments;
      const v = y / heightSegments;
      const normal = new Vector3(0, 0, 1);
      
      vertices.push(createVertexWithUV(vertexX, vertexY, vertexZ, u, v, { normal }));
    }
  }
  
  // Back face
  for (let y = 0; y <= heightSegments; y++) {
    for (let x = 0; x <= widthSegments; x++) {
      const vertexX = center.x + (x / widthSegments - 0.5) * width;
      const vertexY = center.y + (y / heightSegments - 0.5) * height;
      const vertexZ = center.z - halfDepth;
      const u = x / widthSegments;
      const v = y / heightSegments;
      const normal = new Vector3(0, 0, -1);
      
      vertices.push(createVertexWithUV(vertexX, vertexY, vertexZ, u, v, { normal }));
    }
  }
  
  // Top face
  for (let z = 0; z <= depthSegments; z++) {
    for (let x = 0; x <= widthSegments; x++) {
      const vertexX = center.x + (x / widthSegments - 0.5) * width;
      const vertexY = center.y + halfHeight;
      const vertexZ = center.z + (z / depthSegments - 0.5) * depth;
      const u = x / widthSegments;
      const v = z / depthSegments;
      const normal = new Vector3(0, 1, 0);
      
      vertices.push(createVertexWithUV(vertexX, vertexY, vertexZ, u, v, { normal }));
    }
  }
  
  // Bottom face
  for (let z = 0; z <= depthSegments; z++) {
    for (let x = 0; x <= widthSegments; x++) {
      const vertexX = center.x + (x / widthSegments - 0.5) * width;
      const vertexY = center.y - halfHeight;
      const vertexZ = center.z + (z / depthSegments - 0.5) * depth;
      const u = x / widthSegments;
      const v = z / depthSegments;
      const normal = new Vector3(0, -1, 0);
      
      vertices.push(createVertexWithUV(vertexX, vertexY, vertexZ, u, v, { normal }));
    }
  }
  
  // Right face
  for (let z = 0; z <= depthSegments; z++) {
    for (let y = 0; y <= heightSegments; y++) {
      const vertexX = center.x + halfWidth;
      const vertexY = center.y + (y / heightSegments - 0.5) * height;
      const vertexZ = center.z + (z / depthSegments - 0.5) * depth;
      const u = z / depthSegments;
      const v = y / heightSegments;
      const normal = new Vector3(1, 0, 0);
      
      vertices.push(createVertexWithUV(vertexX, vertexY, vertexZ, u, v, { normal }));
    }
  }
  
  // Left face
  for (let z = 0; z <= depthSegments; z++) {
    for (let y = 0; y <= heightSegments; y++) {
      const vertexX = center.x - halfWidth;
      const vertexY = center.y + (y / heightSegments - 0.5) * height;
      const vertexZ = center.z + (z / depthSegments - 0.5) * depth;
      const u = z / depthSegments;
      const v = y / heightSegments;
      const normal = new Vector3(-1, 0, 0);
      
      vertices.push(createVertexWithUV(vertexX, vertexY, vertexZ, u, v, { normal }));
    }
  }
  
  return vertices;
} 