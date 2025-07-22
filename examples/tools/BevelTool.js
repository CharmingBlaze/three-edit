/**
 * BevelTool - Handles bevel operations
 */

import * as THREE from 'three';

export default class BevelTool {
  constructor(editor) {
    this.editor = editor;
  }

  // Apply bevel to edges
  bevelEdges(geometry, bevelThickness = 0.1, bevelSize = 0.1, bevelSegments = 3) {
    if (!geometry) return null;

    const bevelSettings = {
      bevelEnabled: true,
      bevelThickness: bevelThickness,
      bevelSize: bevelSize,
      bevelSegments: bevelSegments,
      bevelOffset: 0
    };

    // Convert geometry to shape if possible
    const shape = this.geometryToShape(geometry);
    if (shape) {
      const extrudeGeometry = new THREE.ExtrudeGeometry(shape, bevelSettings);
      return new THREE.Mesh(extrudeGeometry);
    }

    return null;
  }

  // Apply bevel to a box
  bevelBox(box, bevelThickness = 0.1, bevelSize = 0.1) {
    if (!box || !box.geometry) return null;

    const geometry = box.geometry;
    const material = box.material;
    const params = geometry.parameters;

    // Create beveled box using custom geometry
    const beveledGeometry = this.createBeveledBoxGeometry(
      params.width || 1,
      params.height || 1,
      params.depth || 1,
      bevelThickness,
      bevelSize
    );

    const beveledBox = new THREE.Mesh(beveledGeometry, material);
    beveledBox.position.copy(box.position);
    beveledBox.rotation.copy(box.rotation);

    return beveledBox;
  }

  // Apply bevel to a cylinder
  bevelCylinder(cylinder, bevelThickness = 0.1, bevelSize = 0.1) {
    if (!cylinder || !cylinder.geometry) return null;

    const geometry = cylinder.geometry;
    const material = cylinder.material;
    const params = geometry.parameters;

    // Create beveled cylinder
    const beveledGeometry = this.createBeveledCylinderGeometry(
      params.radiusTop || 0.5,
      params.radiusBottom || 0.5,
      params.height || 1,
      bevelThickness,
      bevelSize
    );

    const beveledCylinder = new THREE.Mesh(beveledGeometry, material);
    beveledCylinder.position.copy(cylinder.position);
    beveledCylinder.rotation.copy(cylinder.rotation);

    return beveledCylinder;
  }

  // Create beveled box geometry
  createBeveledBoxGeometry(width, height, depth, bevelThickness, bevelSize) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const normals = [];
    const uvs = [];

    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDepth = depth / 2;

    // Create vertices for beveled box
    // This is a simplified version - in practice you'd need more sophisticated geometry generation
    const bevelOffset = Math.min(bevelThickness, bevelSize);

    // Front face
    vertices.push(
      -halfWidth + bevelOffset, -halfHeight + bevelOffset, halfDepth,
      halfWidth - bevelOffset, -halfHeight + bevelOffset, halfDepth,
      halfWidth - bevelOffset, halfHeight - bevelOffset, halfDepth,
      -halfWidth + bevelOffset, halfHeight - bevelOffset, halfDepth
    );

    // Back face
    vertices.push(
      -halfWidth + bevelOffset, -halfHeight + bevelOffset, -halfDepth,
      halfWidth - bevelOffset, -halfHeight + bevelOffset, -halfDepth,
      halfWidth - bevelOffset, halfHeight - bevelOffset, -halfDepth,
      -halfWidth + bevelOffset, halfHeight - bevelOffset, -halfDepth
    );

    // Add more vertices for beveled edges...
    // This is a simplified implementation

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    return geometry;
  }

  // Create beveled cylinder geometry
  createBeveledCylinderGeometry(radiusTop, radiusBottom, height, bevelThickness, bevelSize) {
    const geometry = new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      height,
      32, // radialSegments
      1,  // heightSegments
      false // openEnded
    );

    // Apply bevel by modifying vertices
    const positionAttribute = geometry.getAttribute('position');
    const positions = positionAttribute.array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      // Apply bevel effect (simplified)
      const distance = Math.sqrt(x * x + z * z);
      if (distance > 0) {
        const bevelFactor = Math.min(bevelThickness / distance, 1);
        positions[i] = x * (1 - bevelFactor);
        positions[i + 2] = z * (1 - bevelFactor);
      }
    }

    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();

    return geometry;
  }

  // Apply bevel to selected objects
  bevelSelected(bevelThickness = 0.1, bevelSize = 0.1) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const beveledObjects = [];

    selected.forEach(obj => {
      let beveled = null;

      if (obj.geometry.type === 'BoxGeometry') {
        beveled = this.bevelBox(obj, bevelThickness, bevelSize);
      } else if (obj.geometry.type === 'CylinderGeometry') {
        beveled = this.bevelCylinder(obj, bevelThickness, bevelSize);
      } else {
        beveled = this.bevelEdges(obj.geometry, bevelThickness, bevelSize);
        if (beveled) {
          beveled.position.copy(obj.position);
          beveled.rotation.copy(obj.rotation);
          beveled.material = obj.material;
        }
      }

      if (beveled) {
        this.editor.addObject(beveled);
        beveledObjects.push(beveled);
      }
    });

    return beveledObjects;
  }

  // Create bevel preview
  createBevelPreview(geometry, bevelThickness = 0.1, bevelSize = 0.1) {
    const previewGeometry = geometry.clone();
    const previewMaterial = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.5,
      wireframe: true
    });

    // Apply simplified bevel effect to preview
    const positionAttribute = previewGeometry.getAttribute('position');
    const positions = positionAttribute.array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      const distance = Math.sqrt(x * x + z * z);
      if (distance > 0) {
        const bevelFactor = Math.min(bevelThickness / distance, 1);
        positions[i] = x * (1 - bevelFactor);
        positions[i + 2] = z * (1 - bevelFactor);
      }
    }

    positionAttribute.needsUpdate = true;
    previewGeometry.computeVertexNormals();

    const preview = new THREE.Mesh(previewGeometry, previewMaterial);
    return preview;
  }

  // Helper method to convert geometry to shape
  geometryToShape(geometry) {
    // Simplified conversion - in practice you'd need more sophisticated analysis
    if (geometry.type === 'PlaneGeometry') {
      const width = geometry.parameters?.width || 1;
      const height = geometry.parameters?.height || 1;
      
      const shape = new THREE.Shape();
      shape.moveTo(-width/2, -height/2);
      shape.lineTo(width/2, -height/2);
      shape.lineTo(width/2, height/2);
      shape.lineTo(-width/2, height/2);
      shape.lineTo(-width/2, -height/2);
      
      return shape;
    }
    
    return null;
  }

  // Get bevel settings for different object types
  getDefaultBevelSettings(objectType) {
    const settings = {
      box: { thickness: 0.1, size: 0.1, segments: 3 },
      cylinder: { thickness: 0.05, size: 0.05, segments: 3 },
      sphere: { thickness: 0.02, size: 0.02, segments: 2 },
      default: { thickness: 0.1, size: 0.1, segments: 3 }
    };

    return settings[objectType] || settings.default;
  }
} 