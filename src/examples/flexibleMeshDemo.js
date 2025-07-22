/**
 * Flexible Mesh Demo - Demonstrates the optional EditableMesh system
 * Shows how to create meshes with partial data and various configurations
 */

import { EditableMesh, Vertex, Edge, Face, UV } from '../EditableMesh.js';
import { editableMeshToMesh, editableMeshToWireframe } from '../threejsConverter.js';
import * as THREE from 'three';

/**
 * Demonstrate various ways to create EditableMesh instances
 * @param {THREE.Scene} scene - Three.js scene to add objects to
 * @returns {Object} Demo objects and information
 */
export function createFlexibleMeshDemo(scene) {
  const demoObjects = [];
  const demoInfo = [];

  // Example 1: Empty mesh (completely optional)
  const emptyMesh = new EditableMesh();
  console.log('Empty mesh created:', {
    vertices: emptyMesh.vertices.size,
    edges: emptyMesh.edges.size,
    faces: emptyMesh.faces.size,
    uvs: emptyMesh.uvs.size
  });

  // Example 2: Mesh with just vertices (point cloud)
  const pointCloudMesh = new EditableMesh({
    name: 'PointCloud',
    vertices: {
      'v1': new Vertex(0, 0, 0),
      'v2': new Vertex(1, 0, 0),
      'v3': new Vertex(0, 1, 0),
      'v4': new Vertex(1, 1, 0)
    }
  });
  console.log('Point cloud mesh created:', {
    vertices: pointCloudMesh.vertices.size,
    edges: pointCloudMesh.edges.size,
    faces: pointCloudMesh.faces.size
  });

  // Example 3: Mesh with vertices and faces (no edges)
  const faceOnlyMesh = new EditableMesh({
    name: 'FaceOnly',
    vertices: {
      'v1': new Vertex(0, 0, 0),
      'v2': new Vertex(1, 0, 0),
      'v3': new Vertex(0, 1, 0)
    },
    faces: {
      'f1': new Face(['v1', 'v2', 'v3'])
    }
  });
  console.log('Face-only mesh created:', {
    vertices: faceOnlyMesh.vertices.size,
    faces: faceOnlyMesh.faces.size
  });

  // Example 4: Mesh with custom material
  const customMaterialMesh = new EditableMesh({
    name: 'CustomMaterial',
    vertices: {
      'v1': new Vertex(0, 0, 0),
      'v2': new Vertex(1, 0, 0),
      'v3': new Vertex(0, 1, 0)
    },
    faces: {
      'f1': new Face(['v1', 'v2', 'v3'])
    },
    material: {
      name: 'Custom',
      type: 'phong',
      color: { r: 1.0, g: 0.0, b: 0.0 },
      roughness: 0.2,
      metalness: 0.8,
      opacity: 0.8,
      transparent: true,
      side: 'double'
    }
  });

  // Example 5: Mesh with partial UVs
  const partialUVMesh = new EditableMesh({
    name: 'PartialUV',
    vertices: {
      'v1': new Vertex(0, 0, 0),
      'v2': new Vertex(1, 0, 0),
      'v3': new Vertex(0, 1, 0)
    },
    faces: {
      'f1': new Face(['v1', 'v2', 'v3'])
    },
    uvs: {
      'v1': new UV(0, 0, 'v1'),
      'v2': new UV(1, 0, 'v2')
      // v3 has no UV - this is perfectly fine!
    }
  });

  // Example 6: Mesh with attributes
  const attributedMesh = new EditableMesh({
    name: 'Attributed',
    vertices: {
      'v1': new Vertex(0, 0, 0),
      'v2': new Vertex(1, 0, 0),
      'v3': new Vertex(0, 1, 0)
    },
    faces: {
      'f1': new Face(['v1', 'v2', 'v3'])
    },
    attributes: {
      'userData': { custom: 'data' },
      'metadata': { author: 'demo', version: '1.0' }
    }
  });

  // Example 7: Mesh from object data (not Maps)
  const objectDataMesh = new EditableMesh({
    name: 'ObjectData',
    vertices: {
      'v1': new Vertex(0, 0, 0),
      'v2': new Vertex(1, 0, 0),
      'v3': new Vertex(0, 1, 0)
    },
    faces: {
      'f1': new Face(['v1', 'v2', 'v3'])
    }
  });

  // Example 8: Complex mesh with everything
  const complexMesh = new EditableMesh({
    name: 'Complex',
    vertices: {
      'v1': new Vertex(0, 0, 0),
      'v2': new Vertex(1, 0, 0),
      'v3': new Vertex(0, 1, 0),
      'v4': new Vertex(1, 1, 0)
    },
    edges: {
      'e1': new Edge('v1', 'v2'),
      'e2': new Edge('v2', 'v3'),
      'e3': new Edge('v3', 'v1'),
      'e4': new Edge('v2', 'v4'),
      'e5': new Edge('v4', 'v3')
    },
    faces: {
      'f1': new Face(['v1', 'v2', 'v3']),
      'f2': new Face(['v2', 'v4', 'v3'])
    },
    uvs: {
      'v1': new UV(0, 0, 'v1'),
      'v2': new UV(1, 0, 'v2'),
      'v3': new UV(0, 1, 'v3'),
      'v4': new UV(1, 1, 'v4')
    },
    material: {
      name: 'ComplexMaterial',
      type: 'standard',
      color: { r: 0.5, g: 0.8, b: 1.0 },
      roughness: 0.3,
      metalness: 0.1
    },
    attributes: {
      'complexity': 'high',
      'tags': ['demo', 'complex']
    }
  });

  // Test validation and fixing
  console.log('Complex mesh validation:', complexMesh.validate());
  console.log('Complex mesh bounds:', complexMesh.calculateBoundingBox());

  // Create Three.js objects for visualization
  const meshes = [
    { mesh: pointCloudMesh, position: { x: -6, y: 0, z: 0 }, name: 'Point Cloud' },
    { mesh: faceOnlyMesh, position: { x: -4, y: 0, z: 0 }, name: 'Face Only' },
    { mesh: customMaterialMesh, position: { x: -2, y: 0, z: 0 }, name: 'Custom Material' },
    { mesh: partialUVMesh, position: { x: 0, y: 0, z: 0 }, name: 'Partial UV' },
    { mesh: attributedMesh, position: { x: 2, y: 0, z: 0 }, name: 'With Attributes' },
    { mesh: objectDataMesh, position: { x: 4, y: 0, z: 0 }, name: 'Object Data' },
    { mesh: complexMesh, position: { x: 6, y: 0, z: 0 }, name: 'Complex' }
  ];

  meshes.forEach(({ mesh, position, name }) => {
    try {
      // Create Three.js mesh
      const threeMesh = editableMeshToMesh(mesh, new THREE.MeshStandardMaterial({
        color: 0x808080,
        side: THREE.DoubleSide
      }));
      threeMesh.position.set(position.x, position.y, position.z);
      
      // Create wireframe
      const wireframe = editableMeshToWireframe(mesh, new THREE.LineBasicMaterial({ color: 0x000000 }));
      wireframe.position.set(position.x, position.y, position.z);
      
      // Add to scene
      scene.add(threeMesh);
      scene.add(wireframe);
      
      // Store demo info
      demoObjects.push({ threeMesh, wireframe, editableMesh: mesh });
      demoInfo.push({
        name,
        vertexCount: mesh.vertices.size,
        edgeCount: mesh.edges.size,
        faceCount: mesh.faces.size,
        uvCount: mesh.uvs.size,
        hasMaterial: !!mesh.material,
        hasAttributes: mesh.attributes.size > 0,
        position
      });
      
    } catch (error) {
      console.error(`Error creating ${name}:`, error);
    }
  });

  return {
    objects: demoObjects,
    info: demoInfo,
    examples: {
      emptyMesh,
      pointCloudMesh,
      faceOnlyMesh,
      customMaterialMesh,
      partialUVMesh,
      attributedMesh,
      objectDataMesh,
      complexMesh
    }
  };
}

/**
 * Demonstrate safe operations on partial meshes
 * @returns {Object} Results of safe operations
 */
export function demonstrateSafeOperations() {
  const results = {
    operations: [],
    errors: []
  };

  // Test 1: Safe operations on empty mesh
  const emptyMesh = new EditableMesh();
  try {
    emptyMesh.calculateBoundingBox();
    emptyMesh.validate();
    emptyMesh.fixIssues();
    results.operations.push('Empty mesh operations completed safely');
  } catch (error) {
    results.errors.push(`Empty mesh error: ${error.message}`);
  }

  // Test 2: Safe operations on vertex-only mesh
  const vertexOnlyMesh = new EditableMesh({
    vertices: {
      'v1': new Vertex(0, 0, 0),
      'v2': new Vertex(1, 0, 0)
    }
  });
  try {
    vertexOnlyMesh.calculateBoundingBox();
    vertexOnlyMesh.validate();
    results.operations.push('Vertex-only mesh operations completed safely');
  } catch (error) {
    results.errors.push(`Vertex-only mesh error: ${error.message}`);
  }

  // Test 3: Safe operations on face-only mesh
  const faceOnlyMesh = new EditableMesh({
    vertices: {
      'v1': new Vertex(0, 0, 0),
      'v2': new Vertex(1, 0, 0),
      'v3': new Vertex(0, 1, 0)
    },
    faces: {
      'f1': new Face(['v1', 'v2', 'v3'])
    }
  });
  try {
    faceOnlyMesh.calculateSmoothNormals();
    faceOnlyMesh.validate();
    results.operations.push('Face-only mesh operations completed safely');
  } catch (error) {
    results.errors.push(`Face-only mesh error: ${error.message}`);
  }

  // Test 4: Safe operations with missing references
  const incompleteMesh = new EditableMesh({
    vertices: {
      'v1': new Vertex(0, 0, 0)
    },
    faces: {
      'f1': new Face(['v1', 'missing', 'v2']) // References non-existent vertices
    }
  });
  try {
    const validation = incompleteMesh.validate();
    if (!validation.isValid) {
      incompleteMesh.fixIssues();
      results.operations.push('Incomplete mesh was fixed automatically');
    }
  } catch (error) {
    results.errors.push(`Incomplete mesh error: ${error.message}`);
  }

  return results;
}

/**
 * Demonstrate flexible mesh creation patterns
 * @returns {Object} Various mesh creation examples
 */
export function demonstrateFlexibleCreation() {
  const examples = {};

  // Pattern 1: Minimal mesh
  examples.minimal = new EditableMesh();

  // Pattern 2: Points only
  examples.points = new EditableMesh({
    vertices: {
      'p1': new Vertex(0, 0, 0),
      'p2': new Vertex(1, 1, 1),
      'p3': new Vertex(-1, 0, 1)
    }
  });

  // Pattern 3: Wireframe only
  examples.wireframe = new EditableMesh({
    vertices: {
      'v1': new Vertex(0, 0, 0),
      'v2': new Vertex(1, 0, 0),
      'v3': new Vertex(0, 1, 0)
    },
    edges: {
      'e1': new Edge('v1', 'v2'),
      'e2': new Edge('v2', 'v3'),
      'e3': new Edge('v3', 'v1')
    }
  });

  // Pattern 4: Faces without edges
  examples.facesOnly = new EditableMesh({
    vertices: {
      'v1': new Vertex(0, 0, 0),
      'v2': new Vertex(1, 0, 0),
      'v3': new Vertex(0, 1, 0)
    },
    faces: {
      'f1': new Face(['v1', 'v2', 'v3'])
    }
  });

  // Pattern 5: With custom attributes
  examples.withAttributes = new EditableMesh({
    name: 'CustomAttributes',
    vertices: {
      'v1': new Vertex(0, 0, 0)
    },
    attributes: {
      'userData': { custom: 'value' },
      'metadata': { version: '1.0' }
    }
  });

  // Pattern 6: With custom material
  examples.withMaterial = new EditableMesh({
    name: 'CustomMaterial',
    vertices: {
      'v1': new Vertex(0, 0, 0)
    },
    material: {
      name: 'Custom',
      type: 'phong',
      color: { r: 1.0, g: 0.0, b: 0.0 }
    }
  });

  return examples;
} 