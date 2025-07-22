/**
 * SmoothTool - Handles smoothing operations
 */

import * as THREE from 'three';

export default class SmoothTool {
  constructor(editor) {
    this.editor = editor;
  }

  // Smooth geometry using Laplacian smoothing
  smoothGeometry(geometry, iterations = 1, lambda = 0.5) {
    if (!geometry) return null;

    let smoothedGeometry = geometry;

    for (let i = 0; i < iterations; i++) {
      smoothedGeometry = this.smoothOnce(smoothedGeometry, lambda);
    }

    return smoothedGeometry;
  }

  // Smooth once
  smoothOnce(geometry, lambda = 0.5) {
    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.index;

    if (!indexAttribute) {
      console.warn('Smoothing requires indexed geometry');
      return geometry;
    }

    const positions = positionAttribute.array;
    const newPositions = new Float32Array(positions.length);
    const vertexNeighbors = this.getVertexNeighbors(geometry);
    const smoothedPositions = new Float32Array(positions.length);

    // Calculate smoothed positions
    for (let i = 0; i < positions.length; i += 3) {
      const vertexIndex = i / 3;
      const neighbors = vertexNeighbors.get(vertexIndex);

      if (neighbors && neighbors.length > 0) {
        let sumX = 0, sumY = 0, sumZ = 0;

        neighbors.forEach(neighborIndex => {
          sumX += positions[neighborIndex * 3];
          sumY += positions[neighborIndex * 3 + 1];
          sumZ += positions[neighborIndex * 3 + 2];
        });

        const avgX = sumX / neighbors.length;
        const avgY = sumY / neighbors.length;
        const avgZ = sumZ / neighbors.length;

        smoothedPositions[i] = positions[i] + lambda * (avgX - positions[i]);
        smoothedPositions[i + 1] = positions[i + 1] + lambda * (avgY - positions[i + 1]);
        smoothedPositions[i + 2] = positions[i + 2] + lambda * (avgZ - positions[i + 2]);
      } else {
        smoothedPositions[i] = positions[i];
        smoothedPositions[i + 1] = positions[i + 1];
        smoothedPositions[i + 2] = positions[i + 2];
      }
    }

    // Create new geometry
    const newGeometry = geometry.clone();
    newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(smoothedPositions, 3));
    newGeometry.computeVertexNormals();

    return newGeometry;
  }

  // Get vertex neighbors
  getVertexNeighbors(geometry) {
    const indexAttribute = geometry.index;
    const neighbors = new Map();

    for (let i = 0; i < indexAttribute.count; i += 3) {
      const a = indexAttribute.getX(i);
      const b = indexAttribute.getX(i + 1);
      const c = indexAttribute.getX(i + 2);

      // Add neighbors for each vertex
      this.addNeighbor(neighbors, a, b);
      this.addNeighbor(neighbors, a, c);
      this.addNeighbor(neighbors, b, a);
      this.addNeighbor(neighbors, b, c);
      this.addNeighbor(neighbors, c, a);
      this.addNeighbor(neighbors, c, b);
    }

    return neighbors;
  }

  // Add neighbor
  addNeighbor(neighbors, vertex, neighbor) {
    if (!neighbors.has(vertex)) {
      neighbors.set(vertex, []);
    }
    
    const neighborList = neighbors.get(vertex);
    if (!neighborList.includes(neighbor)) {
      neighborList.push(neighbor);
    }
  }

  // Apply smoothing to object
  smoothObject(object, iterations = 1, lambda = 0.5) {
    if (!object || !object.geometry) return null;

    const smoothedGeometry = this.smoothGeometry(object.geometry, iterations, lambda);
    
    if (smoothedGeometry) {
      const smoothedObject = new THREE.Mesh(smoothedGeometry, object.material);
      smoothedObject.position.copy(object.position);
      smoothedObject.rotation.copy(object.rotation);
      smoothedObject.scale.copy(object.scale);
      
      return smoothedObject;
    }

    return null;
  }

  // Apply smoothing to selected objects
  smoothSelected(iterations = 1, lambda = 0.5) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const smoothedObjects = [];

    selected.forEach(obj => {
      const smoothed = this.smoothObject(obj, iterations, lambda);
      if (smoothed) {
        this.editor.addObject(smoothed);
        smoothedObjects.push(smoothed);
      }
    });

    return smoothedObjects;
  }

  // Create smooth preview
  createSmoothPreview(object, iterations = 1, lambda = 0.5) {
    const preview = this.smoothObject(object, iterations, lambda);
    
    if (preview) {
      // Make preview semi-transparent
      if (preview.material) {
        preview.material.transparent = true;
        preview.material.opacity = 0.5;
      }
      
      return preview;
    }

    return null;
  }

  // Preserve sharp edges during smoothing
  smoothWithSharpEdges(geometry, iterations = 1, lambda = 0.5, sharpAngle = Math.PI / 6) {
    if (!geometry) return null;

    let smoothedGeometry = geometry;

    for (let i = 0; i < iterations; i++) {
      smoothedGeometry = this.smoothOnceWithSharpEdges(smoothedGeometry, lambda, sharpAngle);
    }

    return smoothedGeometry;
  }

  // Smooth once with sharp edge preservation
  smoothOnceWithSharpEdges(geometry, lambda = 0.5, sharpAngle = Math.PI / 6) {
    const positionAttribute = geometry.getAttribute('position');
    const normalAttribute = geometry.getAttribute('normal');
    const indexAttribute = geometry.index;

    if (!indexAttribute || !normalAttribute) {
      return this.smoothOnce(geometry, lambda);
    }

    const positions = positionAttribute.array;
    const normals = normalAttribute.array;
    const vertexNeighbors = this.getVertexNeighbors(geometry);
    const smoothedPositions = new Float32Array(positions.length);

    // Calculate smoothed positions with sharp edge detection
    for (let i = 0; i < positions.length; i += 3) {
      const vertexIndex = i / 3;
      const neighbors = vertexNeighbors.get(vertexIndex);

      if (neighbors && neighbors.length > 0) {
        // Check if this vertex is on a sharp edge
        const isSharpEdge = this.isSharpEdge(vertexIndex, neighbors, normals, sharpAngle);

        if (isSharpEdge) {
          // Preserve original position for sharp edges
          smoothedPositions[i] = positions[i];
          smoothedPositions[i + 1] = positions[i + 1];
          smoothedPositions[i + 2] = positions[i + 2];
        } else {
          // Apply smoothing
          let sumX = 0, sumY = 0, sumZ = 0;

          neighbors.forEach(neighborIndex => {
            sumX += positions[neighborIndex * 3];
            sumY += positions[neighborIndex * 3 + 1];
            sumZ += positions[neighborIndex * 3 + 2];
          });

          const avgX = sumX / neighbors.length;
          const avgY = sumY / neighbors.length;
          const avgZ = sumZ / neighbors.length;

          smoothedPositions[i] = positions[i] + lambda * (avgX - positions[i]);
          smoothedPositions[i + 1] = positions[i + 1] + lambda * (avgY - positions[i + 1]);
          smoothedPositions[i + 2] = positions[i + 2] + lambda * (avgZ - positions[i + 2]);
        }
      } else {
        smoothedPositions[i] = positions[i];
        smoothedPositions[i + 1] = positions[i + 1];
        smoothedPositions[i + 2] = positions[i + 2];
      }
    }

    // Create new geometry
    const newGeometry = geometry.clone();
    newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(smoothedPositions, 3));
    newGeometry.computeVertexNormals();

    return newGeometry;
  }

  // Check if vertex is on a sharp edge
  isSharpEdge(vertexIndex, neighbors, normals, sharpAngle) {
    const vertexNormal = new THREE.Vector3(
      normals[vertexIndex * 3],
      normals[vertexIndex * 3 + 1],
      normals[vertexIndex * 3 + 2]
    );

    for (const neighborIndex of neighbors) {
      const neighborNormal = new THREE.Vector3(
        normals[neighborIndex * 3],
        normals[neighborIndex * 3 + 1],
        normals[neighborIndex * 3 + 2]
      );

      const angle = vertexNormal.angleTo(neighborNormal);
      if (angle > sharpAngle) {
        return true;
      }
    }

    return false;
  }

  // Get smoothing info
  getSmoothingInfo(geometry) {
    if (!geometry) return null;

    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.index;

    return {
      vertexCount: positionAttribute ? positionAttribute.count : 0,
      faceCount: indexAttribute ? indexAttribute.count / 3 : 0,
      canSmooth: indexAttribute && indexAttribute.count > 0
    };
  }

  // Get recommended smoothing parameters
  getRecommendedParameters(geometry) {
    const info = this.getSmoothingInfo(geometry);
    if (!info) return { iterations: 1, lambda: 0.5 };

    const vertexCount = info.vertexCount;
    
    if (vertexCount < 100) return { iterations: 2, lambda: 0.7 };
    if (vertexCount < 1000) return { iterations: 1, lambda: 0.5 };
    return { iterations: 1, lambda: 0.3 };
  }
} 