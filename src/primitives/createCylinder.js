/**
 * @fileoverview Cylinder primitive creation function
 * Creates a cylinder with specified radius, height and segments and returns an EditableMesh
 */

import { EditableMesh, Vertex, Edge, Face, UV } from '../EditableMesh.js';

/**
 * Create a cylinder primitive
 * @param {Object} params - Cylinder parameters
 * @param {number} params.radiusTop - Top radius, defaults to 0.5
 * @param {number} params.radiusBottom - Bottom radius, defaults to 0.5
 * @param {number} params.height - Height, defaults to 1
 * @param {number} params.radialSegments - Number of radial segments, defaults to 32
 * @param {number} params.heightSegments - Number of height segments, defaults to 1
 * @param {boolean} params.openEnded - Whether to create caps, defaults to false
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
 * @param {string} params.name - Mesh name, defaults to 'Cylinder'
 * @returns {EditableMesh} Cylinder mesh
 */
export function createCylinder(params = {}) {
  const {
    radiusTop = 0.5,
    radiusBottom = 0.5,
    height = 1,
    radialSegments = 32,
    heightSegments = 1,
    openEnded = false,
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
    name = 'Cylinder'
  } = params;

  const mesh = new EditableMesh({ name, material });
  
  const vertices = [];
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

  // Create vertices for the side faces
  for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments;
    const radius = radiusBottom + (radiusTop - radiusBottom) * v;
    const yPos = (v - 0.5) * height;

    for (let x = 0; x <= radialSegments; x++) {
      const u = x / radialSegments;
      const theta = u * 2 * Math.PI;

      const px = radius * Math.cos(theta);
      const py = yPos;
      const pz = radius * Math.sin(theta);

      const pos = transformVertex(px, py, pz);
      const vertex = new Vertex(pos.x, pos.y, pos.z);
      
      // Calculate normal for side faces
      const normalX = Math.cos(theta);
      const normalZ = Math.sin(theta);
      vertex.setNormal(normalX, 0, normalZ);
      
      vertices.push(vertex);
      mesh.addVertex(vertex);

      // Add UV coordinates
      const uv = new UV(u, v, vertex.id);
      mesh.addUV(uv);
    }
  }

  // Create side faces
  for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
      const a = y * (radialSegments + 1) + x;
      const b = y * (radialSegments + 1) + x + 1;
      const c = (y + 1) * (radialSegments + 1) + x + 1;
      const d = (y + 1) * (radialSegments + 1) + x;

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

      // Calculate face normals
      face1.calculateNormal(mesh.vertices);
      face2.calculateNormal(mesh.vertices);

      // Calculate tangents for normal mapping
      face1.calculateTangents(mesh.vertices, mesh.uvs);
      face2.calculateTangents(mesh.vertices, mesh.uvs);

      mesh.addFace(face1);
      mesh.addFace(face2);
    }
  }

  // Create caps if not open-ended
  if (!openEnded) {
    // Top cap
    if (radiusTop > 0) {
      const topCenterIndex = vertices.length;
      const topCenter = transformVertex(0, halfHeight, 0);
      const topCenterVertex = new Vertex(topCenter.x, topCenter.y, topCenter.z);
      topCenterVertex.setNormal(0, 1, 0);
      vertices.push(topCenterVertex);
      mesh.addVertex(topCenterVertex);

      const topUV = new UV(0.5, 0.5, topCenterVertex.id);
      mesh.addUV(topUV);

      for (let x = 0; x < radialSegments; x++) {
        const a = topCenterIndex;
        const b = heightSegments * (radialSegments + 1) + x;
        const c = heightSegments * (radialSegments + 1) + ((x + 1) % radialSegments);

        // Create edges
        const edge1 = new Edge(vertices[a].id, vertices[b].id);
        const edge2 = new Edge(vertices[b].id, vertices[c].id);
        const edge3 = new Edge(vertices[c].id, vertices[a].id);
        
        mesh.addEdge(edge1);
        mesh.addEdge(edge2);
        mesh.addEdge(edge3);

        // Create triangular face
        const face = new Face([vertices[a].id, vertices[b].id, vertices[c].id]);
        face.setNormal(0, 1, 0);
        face.calculateTangents(mesh.vertices, mesh.uvs);
        mesh.addFace(face);
      }
    }

    // Bottom cap
    if (radiusBottom > 0) {
      const bottomCenterIndex = vertices.length;
      const bottomCenter = transformVertex(0, -halfHeight, 0);
      const bottomCenterVertex = new Vertex(bottomCenter.x, bottomCenter.y, bottomCenter.z);
      bottomCenterVertex.setNormal(0, -1, 0);
      vertices.push(bottomCenterVertex);
      mesh.addVertex(bottomCenterVertex);

      const bottomUV = new UV(0.5, 0.5, bottomCenterVertex.id);
      mesh.addUV(bottomUV);

      for (let x = 0; x < radialSegments; x++) {
        const a = bottomCenterIndex;
        const b = ((x + 1) % radialSegments);
        const c = x;

        // Create edges
        const edge1 = new Edge(vertices[a].id, vertices[b].id);
        const edge2 = new Edge(vertices[b].id, vertices[c].id);
        const edge3 = new Edge(vertices[c].id, vertices[a].id);
        
        mesh.addEdge(edge1);
        mesh.addEdge(edge2);
        mesh.addEdge(edge3);

        // Create triangular face
        const face = new Face([vertices[a].id, vertices[b].id, vertices[c].id]);
        face.setNormal(0, -1, 0);
        face.calculateTangents(mesh.vertices, mesh.uvs);
        mesh.addFace(face);
      }
    }
  }

  // Validate and fix any issues
  const validation = mesh.validate();
  if (!validation.isValid) {
    console.warn('Cylinder validation issues:', validation.errors);
    mesh.fixIssues();
  }

  return mesh;
} 