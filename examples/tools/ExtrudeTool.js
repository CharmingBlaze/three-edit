/**
 * ExtrudeTool - Handles extrusion operations
 */

import * as THREE from 'three';

export default class ExtrudeTool {
  constructor(editor) {
    this.editor = editor;
  }

  // Extrude a face along its normal
  extrudeFace(face, distance = 1) {
    if (!face || !face.geometry) return null;

    const geometry = face.geometry.clone();
    const material = face.material;
    
    // Create extrusion geometry
    const extrudeSettings = {
      steps: 1,
      depth: distance,
      bevelEnabled: false
    };

    // Convert geometry to shape if possible
    const shape = this.geometryToShape(geometry);
    if (shape) {
      const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const extrudedMesh = new THREE.Mesh(extrudeGeometry, material);
      
      // Position the extruded mesh
      const faceCenter = this.getFaceCenter(face);
      extrudedMesh.position.copy(faceCenter);
      
      return extrudedMesh;
    }

    return null;
  }

  // Extrude along a path
  extrudeAlongPath(geometry, path, steps = 50) {
    if (!geometry || !path) return null;

    const extrudeSettings = {
      steps: steps,
      bevelEnabled: false,
      extrudePath: path
    };

    // Convert geometry to shape
    const shape = this.geometryToShape(geometry);
    if (shape) {
      const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      return new THREE.Mesh(extrudeGeometry);
    }

    return null;
  }

  // Extrude with bevel
  extrudeWithBevel(geometry, depth = 1, bevelThickness = 0.1, bevelSize = 0.1) {
    if (!geometry) return null;

    const extrudeSettings = {
      steps: 1,
      depth: depth,
      bevelEnabled: true,
      bevelThickness: bevelThickness,
      bevelSize: bevelSize,
      bevelSegments: 3
    };

    const shape = this.geometryToShape(geometry);
    if (shape) {
      const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      return new THREE.Mesh(extrudeGeometry);
    }

    return null;
  }

  // Extrude a plane to create a box
  extrudePlaneToBox(plane, depth = 1) {
    if (!plane || !plane.geometry) return null;

    const geometry = plane.geometry;
    const material = plane.material;

    // Create box geometry with the plane dimensions
    const boxGeometry = new THREE.BoxGeometry(
      geometry.parameters?.width || 1,
      depth,
      geometry.parameters?.height || 1
    );

    const box = new THREE.Mesh(boxGeometry, material);
    box.position.copy(plane.position);
    box.rotation.copy(plane.rotation);

    return box;
  }

  // Extrude a circle to create a cylinder
  extrudeCircleToCylinder(circle, height = 1) {
    if (!circle || !circle.geometry) return null;

    const geometry = circle.geometry;
    const material = circle.material;
    const radius = geometry.parameters?.radius || 0.5;

    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const cylinder = new THREE.Mesh(cylinderGeometry, material);
    
    cylinder.position.copy(circle.position);
    cylinder.rotation.copy(circle.rotation);

    return cylinder;
  }

  // Extrude a shape with custom settings
  extrudeShape(shape, settings = {}) {
    const defaultSettings = {
      steps: 1,
      depth: 1,
      bevelEnabled: false,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 3
    };

    const extrudeSettings = { ...defaultSettings, ...settings };
    const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    return new THREE.Mesh(extrudeGeometry);
  }

  // Helper method to convert geometry to shape
  geometryToShape(geometry) {
    // This is a simplified conversion
    // In a real implementation, you'd need more sophisticated geometry analysis
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

  // Helper method to get face center
  getFaceCenter(face) {
    if (face.geometry) {
      face.geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      face.geometry.boundingBox.getCenter(center);
      return center;
    }
    return new THREE.Vector3();
  }

  // Create a simple extrusion preview
  createExtrusionPreview(geometry, distance = 1) {
    const previewGeometry = geometry.clone();
    const previewMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
      wireframe: true
    });

    const preview = new THREE.Mesh(previewGeometry, previewMaterial);
    preview.position.z += distance;
    
    return preview;
  }

  // Apply extrusion to selected objects
  extrudeSelected(distance = 1) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const extrudedObjects = [];

    selected.forEach(obj => {
      const extruded = this.extrudeFace(obj, distance);
      if (extruded) {
        this.editor.addObject(extruded);
        extrudedObjects.push(extruded);
      }
    });

    return extrudedObjects;
  }
} 