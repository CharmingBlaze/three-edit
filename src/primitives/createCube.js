/**
 * @fileoverview Cube primitive creation function
 * Creates a cube with specified dimensions and returns an EditableMesh
 */

import { EditableMesh, Vertex, Edge, Face, UV } from '../EditableMesh.js';

/**
 * Create a cube primitive
 * @param {Object} params - Cube parameters
 * @param {number} params.width - Width (X dimension), defaults to 1
 * @param {number} params.height - Height (Y dimension), defaults to 1
 * @param {number} params.depth - Depth (Z dimension), defaults to 1
 * @param {number} params.widthSegments - Number of segments along width, defaults to 1
 * @param {number} params.heightSegments - Number of segments along height, defaults to 1
 * @param {number} params.depthSegments - Number of segments along depth, defaults to 1
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
 * @param {string} params.name - Mesh name, defaults to 'Cube'
 * @returns {EditableMesh} Cube mesh
 */
export function createCube(params = {}) {
  const {
    width = 1,
    height = 1,
    depth = 1,
    widthSegments = 1,
    heightSegments = 1,
    depthSegments = 1,
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
    name = 'Cube'
  } = params;

  const mesh = new EditableMesh({ name, material });
  
  const halfWidth = (width * scaleX) / 2;
  const halfHeight = (height * scaleY) / 2;
  const halfDepth = (depth * scaleZ) / 2;

  // Create vertices for each face
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
  
  // Front face (Z = halfDepth) - Normal: (0, 0, 1)
  for (let y = 0; y <= heightSegments; y++) {
    for (let x = 0; x <= widthSegments; x++) {
      const pos = transformVertex(
        (x / widthSegments - 0.5) * width,
        (y / heightSegments - 0.5) * height,
        halfDepth
      );
      const vertex = new Vertex(pos.x, pos.y, pos.z);
      vertex.setNormal(0, 0, 1); // Front face normal
      vertices.push(vertex);
      mesh.addVertex(vertex);
      
      // Add UV coordinates
      const uv = new UV(x / widthSegments, y / heightSegments, vertex.id);
      mesh.addUV(uv);
    }
  }

  // Back face (Z = -halfDepth) - Normal: (0, 0, -1)
  for (let y = 0; y <= heightSegments; y++) {
    for (let x = 0; x <= widthSegments; x++) {
      const pos = transformVertex(
        (x / widthSegments - 0.5) * width,
        (y / heightSegments - 0.5) * height,
        -halfDepth
      );
      const vertex = new Vertex(pos.x, pos.y, pos.z);
      vertex.setNormal(0, 0, -1); // Back face normal
      vertices.push(vertex);
      mesh.addVertex(vertex);
      
      // Add UV coordinates
      const uv = new UV(x / widthSegments, y / heightSegments, vertex.id);
      mesh.addUV(uv);
    }
  }

  // Left face (X = -halfWidth) - Normal: (-1, 0, 0)
  for (let y = 0; y <= heightSegments; y++) {
    for (let z = 0; z <= depthSegments; z++) {
      const pos = transformVertex(
        -halfWidth,
        (y / heightSegments - 0.5) * height,
        (z / depthSegments - 0.5) * depth
      );
      const vertex = new Vertex(pos.x, pos.y, pos.z);
      vertex.setNormal(-1, 0, 0); // Left face normal
      vertices.push(vertex);
      mesh.addVertex(vertex);
      
      // Add UV coordinates
      const uv = new UV(z / depthSegments, y / heightSegments, vertex.id);
      mesh.addUV(uv);
    }
  }

  // Right face (X = halfWidth) - Normal: (1, 0, 0)
  for (let y = 0; y <= heightSegments; y++) {
    for (let z = 0; z <= depthSegments; z++) {
      const pos = transformVertex(
        halfWidth,
        (y / heightSegments - 0.5) * height,
        (z / depthSegments - 0.5) * depth
      );
      const vertex = new Vertex(pos.x, pos.y, pos.z);
      vertex.setNormal(1, 0, 0); // Right face normal
      vertices.push(vertex);
      mesh.addVertex(vertex);
      
      // Add UV coordinates
      const uv = new UV(z / depthSegments, y / heightSegments, vertex.id);
      mesh.addUV(uv);
    }
  }

  // Top face (Y = halfHeight) - Normal: (0, 1, 0)
  for (let z = 0; z <= depthSegments; z++) {
    for (let x = 0; x <= widthSegments; x++) {
      const pos = transformVertex(
        (x / widthSegments - 0.5) * width,
        halfHeight,
        (z / depthSegments - 0.5) * depth
      );
      const vertex = new Vertex(pos.x, pos.y, pos.z);
      vertex.setNormal(0, 1, 0); // Top face normal
      vertices.push(vertex);
      mesh.addVertex(vertex);
      
      // Add UV coordinates
      const uv = new UV(x / widthSegments, z / depthSegments, vertex.id);
      mesh.addUV(uv);
    }
  }

  // Bottom face (Y = -halfHeight) - Normal: (0, -1, 0)
  for (let z = 0; z <= depthSegments; z++) {
    for (let x = 0; x <= widthSegments; x++) {
      const pos = transformVertex(
        (x / widthSegments - 0.5) * width,
        -halfHeight,
        (z / depthSegments - 0.5) * depth
      );
      const vertex = new Vertex(pos.x, pos.y, pos.z);
      vertex.setNormal(0, -1, 0); // Bottom face normal
      vertices.push(vertex);
      mesh.addVertex(vertex);
      
      // Add UV coordinates
      const uv = new UV(x / widthSegments, z / depthSegments, vertex.id);
      mesh.addUV(uv);
    }
  }

  // Create faces for each face of the cube
  const vertexCount = (widthSegments + 1) * (heightSegments + 1);
  const frontStart = 0;
  const backStart = vertexCount;
  const leftStart = backStart + vertexCount;
  const rightStart = leftStart + (heightSegments + 1) * (depthSegments + 1);
  const topStart = rightStart + (heightSegments + 1) * (depthSegments + 1);
  const bottomStart = topStart + (depthSegments + 1) * (widthSegments + 1);

  // Helper function to create faces for a grid with proper normals
  function createGridFaces(startIndex, widthSegs, heightSegs, widthVerts, faceNormal) {
    for (let y = 0; y < heightSegs; y++) {
      for (let x = 0; x < widthSegs; x++) {
        const a = startIndex + y * widthVerts + x;
        const b = startIndex + y * widthVerts + x + 1;
        const c = startIndex + (y + 1) * widthVerts + x + 1;
        const d = startIndex + (y + 1) * widthVerts + x;
        
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
        
        // Create two triangular faces with proper normals
        const face1 = new Face([vertices[a].id, vertices[b].id, vertices[c].id]);
        const face2 = new Face([vertices[a].id, vertices[c].id, vertices[d].id]);
        
        face1.setNormal(faceNormal.x, faceNormal.y, faceNormal.z);
        face2.setNormal(faceNormal.x, faceNormal.y, faceNormal.z);
        
        // Calculate tangents for normal mapping
        face1.calculateTangents(mesh.vertices, mesh.uvs);
        face2.calculateTangents(mesh.vertices, mesh.uvs);
        
        mesh.addFace(face1);
        mesh.addFace(face2);
      }
    }
  }

  // Create faces for each side with proper normals
  createGridFaces(frontStart, widthSegments, heightSegments, widthSegments + 1, { x: 0, y: 0, z: 1 });
  createGridFaces(backStart, widthSegments, heightSegments, widthSegments + 1, { x: 0, y: 0, z: -1 });
  createGridFaces(leftStart, depthSegments, heightSegments, depthSegments + 1, { x: -1, y: 0, z: 0 });
  createGridFaces(rightStart, depthSegments, heightSegments, depthSegments + 1, { x: 1, y: 0, z: 0 });
  createGridFaces(topStart, widthSegments, depthSegments, widthSegments + 1, { x: 0, y: 1, z: 0 });
  createGridFaces(bottomStart, widthSegments, depthSegments, widthSegments + 1, { x: 0, y: -1, z: 0 });

  // Validate and fix any issues
  const validation = mesh.validate();
  if (!validation.isValid) {
    console.warn('Cube validation issues:', validation.errors);
    mesh.fixIssues();
  }

  return mesh;
} 