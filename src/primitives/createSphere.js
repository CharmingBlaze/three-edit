/**
 * @fileoverview Sphere primitive creation function
 * Creates a sphere with specified radius and segments and returns an EditableMesh
 */

import { EditableMesh, Vertex, Edge, Face, UV } from '../EditableMesh.js';

/**
 * Create a sphere primitive
 * @param {Object} params - Sphere parameters
 * @param {number} params.radius - Sphere radius, defaults to 0.5
 * @param {number} params.widthSegments - Number of horizontal segments, defaults to 32
 * @param {number} params.heightSegments - Number of vertical segments, defaults to 16
 * @param {number} params.x - X position, defaults to 0
 * @param {number} params.y - Y position, defaults to 0
 * @param {number} params.z - Z position, defaults to 0
 * @param {number} params.scaleX - X scale, defaults to 1
 * @param {number} params.scaleY - Y scale, defaults to 1
 * @param {number} params.scaleZ - Z scale, defaults to 1
 * @param {number} params.rotationX - X rotation in radians, defaults to 0
 * @param {number} params.rotationY - Y rotation in radians, defaults to 0
 * @param {number} params.rotationZ - Z rotation in radians, defaults to 0
 * @param {Object} params.material - Material properties, defaults to standard material
 * @param {string} params.name - Mesh name, defaults to 'Sphere'
 * @returns {EditableMesh} Sphere mesh
 */
export function createSphere(params = {}) {
  const {
    radius = 0.5,
    widthSegments = 32,
    heightSegments = 16,
    x = 0,
    y = 0,
    z = 0,
    scaleX = 1,
    scaleY = 1,
    scaleZ = 1,
    rotationX = 0,
    rotationY = 0,
    rotationZ = 0,
    material = {
      name: 'Default',
      type: 'standard',
      color: { r: 0.8, g: 0.8, b: 0.8 },
      roughness: 0.5,
      metalness: 0.0
    },
    name = 'Sphere'
  } = params;

  const mesh = new EditableMesh({ name, material });
  
  const vertices = [];

  // Helper function to apply transformations to a vertex
  function transformVertex(px, py, pz) {
    // Apply scale
    let tx = px * scaleX;
    let ty = py * scaleY;
    let tz = pz * scaleZ;
    
    // Apply rotation (simplified - for full 3D rotation you'd use matrices)
    if (rotationX !== 0) {
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const oldY = ty;
      const oldZ = tz;
      ty = oldY * cosX - oldZ * sinX;
      tz = oldY * sinX + oldZ * cosX;
    }
    if (rotationY !== 0) {
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const oldX = tx;
      const oldZ = tz;
      tx = oldX * cosY + oldZ * sinY;
      tz = -oldX * sinY + oldZ * cosY;
    }
    if (rotationZ !== 0) {
      const cosZ = Math.cos(rotationZ);
      const sinZ = Math.sin(rotationZ);
      const oldX = tx;
      const oldY = ty;
      tx = oldX * cosZ - oldY * sinZ;
      ty = oldX * sinZ + oldY * cosZ;
    }
    
    // Apply position
    tx += x;
    ty += y;
    tz += z;
    
    return { x: tx, y: ty, z: tz };
  }

  // Create vertices
  for (let y = 0; y <= heightSegments; y++) {
    const phi = (y / heightSegments) * Math.PI;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    for (let x = 0; x <= widthSegments; x++) {
      const theta = (x / widthSegments) * 2 * Math.PI;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      const px = radius * sinPhi * cosTheta;
      const py = radius * cosPhi;
      const pz = radius * sinPhi * sinTheta;

      const pos = transformVertex(px, py, pz);
      const vertex = new Vertex(pos.x, pos.y, pos.z);
      
      // Calculate normal (same as position for unit sphere, then scale by radius)
      const nx = sinPhi * cosTheta;
      const ny = cosPhi;
      const nz = sinPhi * sinTheta;
      vertex.setNormal(nx, ny, nz);
      
      vertices.push(vertex);
      mesh.addVertex(vertex);

      // Add UV coordinates
      const u = x / widthSegments;
      const v = y / heightSegments;
      const uv = new UV(u, v, vertex.id);
      mesh.addUV(uv);
    }
  }

  // Create faces
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < widthSegments; x++) {
      const a = y * (widthSegments + 1) + x;
      const b = y * (widthSegments + 1) + x + 1;
      const c = (y + 1) * (widthSegments + 1) + x + 1;
      const d = (y + 1) * (widthSegments + 1) + x;

      // Create edges for this quad
      const edge1 = new Edge(vertices[a].id, vertices[b].id);
      const edge2 = new Edge(vertices[b].id, vertices[c].id);
      const edge3 = new Edge(vertices[c].id, vertices[d].id);
      const edge4 = new Edge(vertices[d].id, vertices[a].id);
      const edge5 = new Edge(vertices[a].id, vertices[c].id); // Diagonal for triangulation
      
      mesh.addEdge(edge1);
      mesh.addEdge(edge2);
      mesh.addEdge(edge3);
      mesh.addEdge(edge4);
      mesh.addEdge(edge5);

      // Create two triangular faces
      const face1 = new Face([vertices[a].id, vertices[b].id, vertices[c].id]);
      const face2 = new Face([vertices[a].id, vertices[c].id, vertices[d].id]);

      // Calculate face normals from the vertices
      face1.calculateNormal(mesh.vertices);
      face2.calculateNormal(mesh.vertices);

      // Calculate tangents for normal mapping
      face1.calculateTangents(mesh.vertices, mesh.uvs);
      face2.calculateTangents(mesh.vertices, mesh.uvs);

      mesh.addFace(face1);
      mesh.addFace(face2);
    }
  }

  // Validate and fix any issues
  const validation = mesh.validate();
  if (!validation.isValid) {
    console.warn('Sphere validation issues:', validation.errors);
    mesh.fixIssues();
  }

  return mesh;
} 