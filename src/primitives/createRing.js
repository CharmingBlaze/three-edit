/**
 * @fileoverview Ring primitive creation function
 * Creates a ring with specified inner and outer radius and returns an EditableMesh
 */

import { EditableMesh, Vertex, Edge, Face, UV } from '../EditableMesh.js';

/**
 * Create a ring primitive
 * @param {Object} params - Ring parameters
 * @param {number} params.innerRadius - Inner radius, defaults to 0.3
 * @param {number} params.outerRadius - Outer radius, defaults to 0.7
 * @param {number} params.thetaSegments - Number of segments around the ring, defaults to 32
 * @param {number} params.phiSegments - Number of segments from inner to outer, defaults to 1
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
 * @param {string} params.name - Mesh name, defaults to 'Ring'
 * @returns {EditableMesh} Ring mesh
 */
export function createRing(params = {}) {
  const {
    innerRadius = 0.3,
    outerRadius = 0.7,
    thetaSegments = 32,
    phiSegments = 1,
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
    name = 'Ring'
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
  for (let i = 0; i <= thetaSegments; i++) {
    const theta = (i / thetaSegments) * 2 * Math.PI;

    for (let j = 0; j <= phiSegments; j++) {
      const phi = j / phiSegments;
      const radius = innerRadius + (outerRadius - innerRadius) * phi;

      const px = radius * Math.cos(theta);
      const py = 0; // Ring is flat in Y
      const pz = radius * Math.sin(theta);

      const pos = transformVertex(px, py, pz);
      const vertex = new Vertex(pos.x, pos.y, pos.z);
      vertex.setNormal(0, 1, 0); // Upward normal for ring
      vertices.push(vertex);
      mesh.addVertex(vertex);

      // Add UV coordinates
      const u = i / thetaSegments;
      const v = j / phiSegments;
      const uv = new UV(u, v, vertex.id);
      mesh.addUV(uv);
    }
  }

  // Create faces
  for (let i = 0; i < thetaSegments; i++) {
    for (let j = 0; j < phiSegments; j++) {
      const a = i * (phiSegments + 1) + j;
      const b = i * (phiSegments + 1) + j + 1;
      const c = (i + 1) * (phiSegments + 1) + j + 1;
      const d = (i + 1) * (phiSegments + 1) + j;

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

      // Set face normals
      face1.setNormal(0, 1, 0);
      face2.setNormal(0, 1, 0);

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
    console.warn('Ring validation issues:', validation.errors);
    mesh.fixIssues();
  }

  return mesh;
} 