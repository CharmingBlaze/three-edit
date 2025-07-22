/**
 * SubdivisionTool - Handles subdivision operations
 */

import * as THREE from 'three';

export default class SubdivisionTool {
  constructor(editor) {
    this.editor = editor;
  }

  // Subdivide geometry
  subdivideGeometry(geometry, iterations = 1) {
    if (!geometry) return null;

    let subdividedGeometry = geometry;

    for (let i = 0; i < iterations; i++) {
      subdividedGeometry = this.subdivideOnce(subdividedGeometry);
    }

    return subdividedGeometry;
  }

  // Subdivide once
  subdivideOnce(geometry) {
    const positionAttribute = geometry.getAttribute('position');
    const normalAttribute = geometry.getAttribute('normal');
    const uvAttribute = geometry.getAttribute('uv');
    const indexAttribute = geometry.index;

    if (!indexAttribute) {
      console.warn('Subdivision requires indexed geometry');
      return geometry;
    }

    const newPositions = [];
    const newNormals = [];
    const newUvs = [];
    const newIndices = [];

    // Create edge map
    const edgeMap = new Map();
    const edgeToVertex = new Map();

    // Process each triangle
    for (let i = 0; i < indexAttribute.count; i += 3) {
      const a = indexAttribute.getX(i);
      const b = indexAttribute.getX(i + 1);
      const c = indexAttribute.getX(i + 2);

      // Get edge midpoints
      const ab = this.getEdgeMidpoint(a, b, positionAttribute, edgeMap, edgeToVertex);
      const bc = this.getEdgeMidpoint(b, c, positionAttribute, edgeMap, edgeToVertex);
      const ca = this.getEdgeMidpoint(c, a, positionAttribute, edgeMap, edgeToVertex);

      // Create 4 new triangles
      const triangles = [
        [a, ab, ca],
        [ab, b, bc],
        [ca, bc, c],
        [ab, bc, ca]
      ];

      triangles.forEach(triangle => {
        triangle.forEach(vertex => {
          newIndices.push(vertex);
        });
      });
    }

    // Create new geometry
    const newGeometry = new THREE.BufferGeometry();
    
    // Add positions
    for (let i = 0; i < edgeToVertex.size; i++) {
      const vertex = edgeToVertex.get(i);
      newPositions.push(vertex.x, vertex.y, vertex.z);
    }

    newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    newGeometry.setIndex(newIndices);
    newGeometry.computeVertexNormals();

    return newGeometry;
  }

  // Get edge midpoint
  getEdgeMidpoint(a, b, positionAttribute, edgeMap, edgeToVertex) {
    const edgeKey = a < b ? `${a}-${b}` : `${b}-${a}`;
    
    if (edgeMap.has(edgeKey)) {
      return edgeMap.get(edgeKey);
    }

    // Calculate midpoint
    const posA = new THREE.Vector3(
      positionAttribute.getX(a),
      positionAttribute.getY(a),
      positionAttribute.getZ(a)
    );
    const posB = new THREE.Vector3(
      positionAttribute.getX(b),
      positionAttribute.getY(b),
      positionAttribute.getZ(b)
    );

    const midpoint = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
    
    const vertexIndex = edgeToVertex.size;
    edgeMap.set(edgeKey, vertexIndex);
    edgeToVertex.set(vertexIndex, midpoint);
    
    return vertexIndex;
  }

  // Apply subdivision to object
  subdivideObject(object, iterations = 1) {
    if (!object || !object.geometry) return null;

    const subdividedGeometry = this.subdivideGeometry(object.geometry, iterations);
    
    if (subdividedGeometry) {
      const subdividedObject = new THREE.Mesh(subdividedGeometry, object.material);
      subdividedObject.position.copy(object.position);
      subdividedObject.rotation.copy(object.rotation);
      subdividedObject.scale.copy(object.scale);
      
      return subdividedObject;
    }

    return null;
  }

  // Apply subdivision to selected objects
  subdivideSelected(iterations = 1) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const subdividedObjects = [];

    selected.forEach(obj => {
      const subdivided = this.subdivideObject(obj, iterations);
      if (subdivided) {
        this.editor.addObject(subdivided);
        subdividedObjects.push(subdivided);
      }
    });

    return subdividedObjects;
  }

  // Create subdivision preview
  createSubdivisionPreview(object, iterations = 1) {
    const preview = this.subdivideObject(object, iterations);
    
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

  // Get subdivision info
  getSubdivisionInfo(geometry) {
    if (!geometry) return null;

    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.index;

    return {
      vertexCount: positionAttribute ? positionAttribute.count : 0,
      faceCount: indexAttribute ? indexAttribute.count / 3 : 0,
      edgeCount: indexAttribute ? indexAttribute.count / 2 : 0
    };
  }

  // Check if geometry can be subdivided
  canSubdivide(geometry) {
    return geometry && geometry.index && geometry.index.count > 0;
  }

  // Get recommended subdivision iterations
  getRecommendedIterations(geometry) {
    const info = this.getSubdivisionInfo(geometry);
    if (!info) return 1;

    const vertexCount = info.vertexCount;
    
    if (vertexCount < 100) return 2;
    if (vertexCount < 1000) return 1;
    return 1;
  }
} 