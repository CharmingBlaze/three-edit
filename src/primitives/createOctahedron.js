/**
 * @fileoverview Octahedron primitive creation function
 * Creates an octahedron with specified radius and returns an EditableMesh
 */

import { EditableMesh, Vertex, Edge, Face, UV } from '../EditableMesh.js';

/**
 * Create an octahedron primitive
 * @param {Object} params - Octahedron parameters
 * @param {number} params.radius - Radius, defaults to 0.5
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
 * @param {string} params.name - Mesh name, defaults to 'Octahedron'
 * @returns {EditableMesh} Octahedron mesh
 */
export function createOctahedron(params = {}) {
  const {
    radius = 0.5,
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
    name = 'Octahedron'
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

  // Create vertices (6 vertices for octahedron)
  const positions = [
    [0, radius, 0],   // Top
    [0, -radius, 0],  // Bottom
    [radius, 0, 0],   // Right
    [-radius, 0, 0],  // Left
    [0, 0, radius],   // Front
    [0, 0, -radius]   // Back
  ];

  for (let i = 0; i < positions.length; i++) {
    const [px, py, pz] = positions[i];
    const pos = transformVertex(px, py, pz);
    const vertex = new Vertex(pos.x, pos.y, pos.z);
    
    // Calculate normal (normalized position)
    const length = Math.sqrt(px * px + py * py + pz * pz);
    vertex.setNormal(px / length, py / length, pz / length);
    
    vertices.push(vertex);
    mesh.addVertex(vertex);

    // Add UV coordinates
    const u = (i % 2) * 0.5;
    const v = Math.floor(i / 2) * 0.5;
    const uv = new UV(u, v, vertex.id);
    mesh.addUV(uv);
  }

  // Create faces (8 triangular faces)
  const faces = [
    [0, 2, 4], // Top-right-front
    [0, 4, 3], // Top-front-left
    [0, 3, 5], // Top-left-back
    [0, 5, 2], // Top-back-right
    [1, 4, 2], // Bottom-front-right
    [1, 3, 4], // Bottom-left-front
    [1, 5, 3], // Bottom-back-left
    [1, 2, 5]  // Bottom-right-back
  ];

  for (let i = 0; i < faces.length; i++) {
    const [a, b, c] = faces[i];
    
    // Create edges
    mesh.addEdge(new Edge(vertices[a].id, vertices[b].id));
    mesh.addEdge(new Edge(vertices[b].id, vertices[c].id));
    mesh.addEdge(new Edge(vertices[c].id, vertices[a].id));

    // Create face
    const face = new Face([vertices[a].id, vertices[b].id, vertices[c].id]);
    
    // Calculate face normal
    face.calculateNormal(mesh.vertices);
    
    // Calculate tangents for normal mapping
    face.calculateTangents(mesh.vertices, mesh.uvs);
    
    mesh.addFace(face);
  }

  // Validate and fix any issues
  const validation = mesh.validate();
  if (!validation.isValid) {
    console.warn('Octahedron validation issues:', validation.errors);
    mesh.fixIssues();
  }

  return mesh;
} 