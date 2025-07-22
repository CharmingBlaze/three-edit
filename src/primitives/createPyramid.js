/**
 * @fileoverview Pyramid primitive creation function
 * Creates a pyramid with specified base size and height and returns an EditableMesh
 */

import { EditableMesh, Vertex, Edge, Face, UV } from '../EditableMesh.js';

/**
 * Create a pyramid primitive
 * @param {Object} params - Pyramid parameters
 * @param {number} params.baseSize - Base size (width and depth), defaults to 1
 * @param {number} params.height - Height, defaults to 1
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
 * @param {string} params.name - Mesh name, defaults to 'Pyramid'
 * @returns {EditableMesh} Pyramid mesh
 */
export function createPyramid(params = {}) {
  const {
    baseSize = 1,
    height = 1,
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
    name = 'Pyramid'
  } = params;

  const mesh = new EditableMesh({ name, material });
  
  const halfBase = (baseSize * scaleX) / 2;
  const halfHeight = (height * scaleY) / 2;

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
  const vertices = [];

  // Base vertices (square base)
  const pos1 = transformVertex(-halfBase, -halfHeight, -halfBase);
  const pos2 = transformVertex(halfBase, -halfHeight, -halfBase);
  const pos3 = transformVertex(halfBase, -halfHeight, halfBase);
  const pos4 = transformVertex(-halfBase, -halfHeight, halfBase);

  // Apex vertex
  const pos5 = transformVertex(0, halfHeight, 0);

  // Create vertex objects
  const v1 = new Vertex(pos1.x, pos1.y, pos1.z);
  const v2 = new Vertex(pos2.x, pos2.y, pos2.z);
  const v3 = new Vertex(pos3.x, pos3.y, pos3.z);
  const v4 = new Vertex(pos4.x, pos4.y, pos4.z);
  const v5 = new Vertex(pos5.x, pos5.y, pos5.z);

  // Set normals
  v1.setNormal(0, -1, 0); // Base normal
  v2.setNormal(0, -1, 0);
  v3.setNormal(0, -1, 0);
  v4.setNormal(0, -1, 0);
  v5.setNormal(0, 1, 0); // Apex normal

  vertices.push(v1, v2, v3, v4, v5);
  mesh.addVertex(v1);
  mesh.addVertex(v2);
  mesh.addVertex(v3);
  mesh.addVertex(v4);
  mesh.addVertex(v5);

  // Add UV coordinates
  mesh.addUV(new UV(0, 0, v1.id));
  mesh.addUV(new UV(1, 0, v2.id));
  mesh.addUV(new UV(1, 1, v3.id));
  mesh.addUV(new UV(0, 1, v4.id));
  mesh.addUV(new UV(0.5, 0.5, v5.id));

  // Create edges
  // Base edges
  mesh.addEdge(new Edge(v1.id, v2.id));
  mesh.addEdge(new Edge(v2.id, v3.id));
  mesh.addEdge(new Edge(v3.id, v4.id));
  mesh.addEdge(new Edge(v4.id, v1.id));

  // Side edges
  mesh.addEdge(new Edge(v1.id, v5.id));
  mesh.addEdge(new Edge(v2.id, v5.id));
  mesh.addEdge(new Edge(v3.id, v5.id));
  mesh.addEdge(new Edge(v4.id, v5.id));

  // Create faces
  // Base face
  const baseFace = new Face([v1.id, v2.id, v3.id, v4.id]);
  baseFace.setNormal(0, -1, 0);
  baseFace.calculateTangents(mesh.vertices, mesh.uvs);
  mesh.addFace(baseFace);

  // Side faces (triangular)
  const side1 = new Face([v1.id, v2.id, v5.id]);
  const side2 = new Face([v2.id, v3.id, v5.id]);
  const side3 = new Face([v3.id, v4.id, v5.id]);
  const side4 = new Face([v4.id, v1.id, v5.id]);

  // Calculate side face normals
  side1.calculateNormal(mesh.vertices);
  side2.calculateNormal(mesh.vertices);
  side3.calculateNormal(mesh.vertices);
  side4.calculateNormal(mesh.vertices);

  // Calculate tangents
  side1.calculateTangents(mesh.vertices, mesh.uvs);
  side2.calculateTangents(mesh.vertices, mesh.uvs);
  side3.calculateTangents(mesh.vertices, mesh.uvs);
  side4.calculateTangents(mesh.vertices, mesh.uvs);

  mesh.addFace(side1);
  mesh.addFace(side2);
  mesh.addFace(side3);
  mesh.addFace(side4);

  // Validate and fix any issues
  const validation = mesh.validate();
  if (!validation.isValid) {
    console.warn('Pyramid validation issues:', validation.errors);
    mesh.fixIssues();
  }

  return mesh;
} 