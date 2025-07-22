/**
 * UVTool - Handles UV mapping operations
 */

import * as THREE from 'three';

export default class UVTool {
  constructor(editor) {
    this.editor = editor;
    this.uvHelpers = [];
  }

  // Generate UV coordinates
  generateUVs(object, mapping = 'spherical') {
    if (!object || !object.geometry) return false;

    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    
    if (!positionAttribute) return false;

    const uvAttribute = new THREE.Float32BufferAttribute(positionAttribute.count * 2, 2);

    switch (mapping.toLowerCase()) {
      case 'spherical':
        return this.generateSphericalUVs(object, uvAttribute);
      case 'cylindrical':
        return this.generateCylindricalUVs(object, uvAttribute);
      case 'planar':
        return this.generatePlanarUVs(object, uvAttribute);
      case 'box':
        return this.generateBoxUVs(object, uvAttribute);
      default:
        return this.generatePlanarUVs(object, uvAttribute);
    }
  }

  // Generate spherical UV mapping
  generateSphericalUVs(object, uvAttribute) {
    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const center = new THREE.Vector3();

    // Calculate center
    for (let i = 0; i < positionAttribute.count; i++) {
      center.add(new THREE.Vector3(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      ));
    }
    center.divideScalar(positionAttribute.count);

    // Generate UVs
    for (let i = 0; i < positionAttribute.count; i++) {
      const vertex = new THREE.Vector3(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      );

      const direction = new THREE.Vector3().subVectors(vertex, center).normalize();
      
      // Spherical coordinates
      const u = 0.5 + Math.atan2(direction.z, direction.x) / (2 * Math.PI);
      const v = 0.5 + Math.asin(direction.y) / Math.PI;

      uvAttribute.setXY(i, u, v);
    }

    geometry.setAttribute('uv', uvAttribute);
    return true;
  }

  // Generate cylindrical UV mapping
  generateCylindricalUVs(object, uvAttribute) {
    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const center = new THREE.Vector3();

    // Calculate center
    for (let i = 0; i < positionAttribute.count; i++) {
      center.add(new THREE.Vector3(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      ));
    }
    center.divideScalar(positionAttribute.count);

    // Find height range
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < positionAttribute.count; i++) {
      const y = positionAttribute.getY(i);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    // Generate UVs
    for (let i = 0; i < positionAttribute.count; i++) {
      const vertex = new THREE.Vector3(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      );

      const direction = new THREE.Vector3().subVectors(vertex, center);
      direction.y = 0; // Project to XZ plane
      direction.normalize();

      // Cylindrical coordinates
      const u = 0.5 + Math.atan2(direction.z, direction.x) / (2 * Math.PI);
      const v = (vertex.y - minY) / (maxY - minY);

      uvAttribute.setXY(i, u, v);
    }

    geometry.setAttribute('uv', uvAttribute);
    return true;
  }

  // Generate planar UV mapping
  generatePlanarUVs(object, uvAttribute) {
    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');

    // Find bounding box
    const box = new THREE.Box3();
    for (let i = 0; i < positionAttribute.count; i++) {
      box.expandByPoint(new THREE.Vector3(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      ));
    }

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Generate UVs
    for (let i = 0; i < positionAttribute.count; i++) {
      const vertex = new THREE.Vector3(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      );

      const relative = new THREE.Vector3().subVectors(vertex, center);
      
      // Planar mapping (use X and Z for UV)
      const u = 0.5 + relative.x / size.x;
      const v = 0.5 + relative.z / size.z;

      uvAttribute.setXY(i, u, v);
    }

    geometry.setAttribute('uv', uvAttribute);
    return true;
  }

  // Generate box UV mapping
  generateBoxUVs(object, uvAttribute) {
    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');

    // Find bounding box
    const box = new THREE.Box3();
    for (let i = 0; i < positionAttribute.count; i++) {
      box.expandByPoint(new THREE.Vector3(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      ));
    }

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Generate UVs
    for (let i = 0; i < positionAttribute.count; i++) {
      const vertex = new THREE.Vector3(
        positionAttribute.getX(i),
        positionAttribute.getY(i),
        positionAttribute.getZ(i)
      );

      const relative = new THREE.Vector3().subVectors(vertex, center);
      
      // Box mapping (project to dominant face)
      const absX = Math.abs(relative.x);
      const absY = Math.abs(relative.y);
      const absZ = Math.abs(relative.z);

      let u, v;
      if (absX >= absY && absX >= absZ) {
        // Project to YZ plane
        u = 0.5 + relative.z / size.z;
        v = 0.5 + relative.y / size.y;
      } else if (absY >= absZ) {
        // Project to XZ plane
        u = 0.5 + relative.x / size.x;
        v = 0.5 + relative.z / size.z;
      } else {
        // Project to XY plane
        u = 0.5 + relative.x / size.x;
        v = 0.5 + relative.y / size.y;
      }

      uvAttribute.setXY(i, u, v);
    }

    geometry.setAttribute('uv', uvAttribute);
    return true;
  }

  // Transform UV coordinates
  transformUVs(object, transform) {
    if (!object || !object.geometry) return false;

    const geometry = object.geometry;
    const uvAttribute = geometry.getAttribute('uv');
    
    if (!uvAttribute) return false;

    const { offset = { x: 0, y: 0 }, scale = { x: 1, y: 1 }, rotation = 0 } = transform;

    for (let i = 0; i < uvAttribute.count; i++) {
      const u = uvAttribute.getX(i);
      const v = uvAttribute.getY(i);

      // Apply rotation
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const newU = u * cos - v * sin;
      const newV = u * sin + v * cos;

      // Apply scale and offset
      const finalU = newU * scale.x + offset.x;
      const finalV = newV * scale.y + offset.y;

      uvAttribute.setXY(i, finalU, finalV);
    }

    return true;
  }

  // Flip UV coordinates
  flipUVs(object, axis = 'horizontal') {
    if (!object || !object.geometry) return false;

    const geometry = object.geometry;
    const uvAttribute = geometry.getAttribute('uv');
    
    if (!uvAttribute) return false;

    for (let i = 0; i < uvAttribute.count; i++) {
      const u = uvAttribute.getX(i);
      const v = uvAttribute.getY(i);

      if (axis === 'horizontal') {
        uvAttribute.setXY(i, 1 - u, v);
      } else if (axis === 'vertical') {
        uvAttribute.setXY(i, u, 1 - v);
      } else if (axis === 'both') {
        uvAttribute.setXY(i, 1 - u, 1 - v);
      }
    }

    return true;
  }

  // Pack UV coordinates
  packUVs(object, padding = 0.01) {
    if (!object || !object.geometry) return false;

    const geometry = object.geometry;
    const uvAttribute = geometry.getAttribute('uv');
    
    if (!uvAttribute) return false;

    // Find UV bounds
    let minU = Infinity, maxU = -Infinity;
    let minV = Infinity, maxV = -Infinity;

    for (let i = 0; i < uvAttribute.count; i++) {
      const u = uvAttribute.getX(i);
      const v = uvAttribute.getY(i);

      minU = Math.min(minU, u);
      maxU = Math.max(maxU, u);
      minV = Math.min(minV, v);
      maxV = Math.max(maxV, v);
    }

    // Normalize to 0-1 range with padding
    const rangeU = maxU - minU;
    const rangeV = maxV - minV;
    const scale = Math.min((1 - 2 * padding) / rangeU, (1 - 2 * padding) / rangeV);

    for (let i = 0; i < uvAttribute.count; i++) {
      const u = uvAttribute.getX(i);
      const v = uvAttribute.getY(i);

      const normalizedU = (u - minU) * scale + padding;
      const normalizedV = (v - minV) * scale + padding;

      uvAttribute.setXY(i, normalizedU, normalizedV);
    }

    return true;
  }

  // Unwrap UV coordinates
  unwrapUVs(object, method = 'angle') {
    if (!object || !object.geometry) return false;

    const geometry = object.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const indexAttribute = geometry.index;
    
    if (!positionAttribute || !indexAttribute) return false;

    const uvAttribute = new THREE.Float32BufferAttribute(positionAttribute.count * 2, 2);

    // Process each face
    for (let i = 0; i < indexAttribute.count; i += 3) {
      const a = indexAttribute.getX(i);
      const b = indexAttribute.getX(i + 1);
      const c = indexAttribute.getX(i + 2);

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
      const posC = new THREE.Vector3(
        positionAttribute.getX(c),
        positionAttribute.getY(c),
        positionAttribute.getZ(c)
      );

      // Calculate face normal
      const faceV1 = new THREE.Vector3().subVectors(posB, posA);
      const faceV2 = new THREE.Vector3().subVectors(posC, posA);
      const normal = new THREE.Vector3().crossVectors(faceV1, faceV2).normalize();

      // Project to 2D based on dominant axis
      let u1, u2, u3, v1, v2, v3;

      if (Math.abs(normal.x) > Math.abs(normal.y) && Math.abs(normal.x) > Math.abs(normal.z)) {
        // Project to YZ plane
        u1 = posA.y;
        v1 = posA.z;
        u2 = posB.y;
        v2 = posB.z;
        u3 = posC.y;
        v3 = posC.z;
      } else if (Math.abs(normal.y) > Math.abs(normal.z)) {
        // Project to XZ plane
        u1 = posA.x;
        v1 = posA.z;
        u2 = posB.x;
        v2 = posB.z;
        u3 = posC.x;
        v3 = posC.z;
      } else {
        // Project to XY plane
        u1 = posA.x;
        v1 = posA.y;
        u2 = posB.x;
        v2 = posB.y;
        u3 = posC.x;
        v3 = posC.y;
      }

      // Normalize to 0-1 range
      const minU = Math.min(u1, u2, u3);
      const maxU = Math.max(u1, u2, u3);
      const minV = Math.min(v1, v2, v3);
      const maxV = Math.max(v1, v2, v3);
      const rangeU = maxU - minU;
      const rangeV = maxV - minV;

      if (rangeU > 0) {
        u1 = (u1 - minU) / rangeU;
        u2 = (u2 - minU) / rangeU;
        u3 = (u3 - minU) / rangeU;
      }
      if (rangeV > 0) {
        v1 = (v1 - minV) / rangeV;
        v2 = (v2 - minV) / rangeV;
        v3 = (v3 - minV) / rangeV;
      }

      uvAttribute.setXY(a, u1, v1);
      uvAttribute.setXY(b, u2, v2);
      uvAttribute.setXY(c, u3, v3);
    }

    geometry.setAttribute('uv', uvAttribute);
    return true;
  }

  // Create UV helper
  createUVHelper(object, size = 1.0) {
    if (!object || !object.geometry) return null;

    const geometry = object.geometry;
    const uvAttribute = geometry.getAttribute('uv');

    if (!uvAttribute) return null;

    // Create a plane to visualize UVs
    const planeGeometry = new THREE.PlaneGeometry(size, size);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(size / 2, size / 2, 0);

    // Add UV points as small spheres
    const points = new THREE.Group();
    for (let i = 0; i < uvAttribute.count; i++) {
      const u = uvAttribute.getX(i);
      const v = uvAttribute.getY(i);

      const pointGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      point.position.set(u * size, v * size, 0.01);

      points.add(point);
    }

    const helper = new THREE.Group();
    helper.add(plane);
    helper.add(points);

    return helper;
  }

  // Get UV statistics
  getUVStatistics(object) {
    if (!object || !object.geometry) return null;

    const geometry = object.geometry;
    const uvAttribute = geometry.getAttribute('uv');

    if (!uvAttribute) return null;

    let minU = Infinity, maxU = -Infinity;
    let minV = Infinity, maxV = -Infinity;

    for (let i = 0; i < uvAttribute.count; i++) {
      const u = uvAttribute.getX(i);
      const v = uvAttribute.getY(i);

      minU = Math.min(minU, u);
      maxU = Math.max(maxU, u);
      minV = Math.min(minV, v);
      maxV = Math.max(maxV, v);
    }

    return {
      uvCount: uvAttribute.count,
      minU: minU,
      maxU: maxU,
      minV: minV,
      maxV: maxV,
      rangeU: maxU - minU,
      rangeV: maxV - minV
    };
  }

  // Apply UV operations to selected objects
  applyToSelected(operation, ...args) {
    const selected = this.editor.selectionManager.getSelectedObjects();
    const results = [];

    selected.forEach(obj => {
      let success = false;
      
      switch (operation) {
        case 'generateUVs':
          success = this.generateUVs(obj, ...args);
          break;
        case 'transformUVs':
          success = this.transformUVs(obj, ...args);
          break;
        case 'flipUVs':
          success = this.flipUVs(obj, ...args);
          break;
        case 'packUVs':
          success = this.packUVs(obj, ...args);
          break;
        case 'unwrapUVs':
          success = this.unwrapUVs(obj, ...args);
          break;
      }

      results.push({ object: obj, success });
    });

    return results;
  }

  // Get supported UV operations
  getSupportedOperations() {
    return [
      'generateUVs', 'transformUVs', 'flipUVs', 
      'packUVs', 'unwrapUVs', 'createHelper'
    ];
  }

  // Get operation description
  getOperationDescription(operation) {
    const descriptions = {
      generateUVs: 'Generate UV coordinates',
      transformUVs: 'Transform UV coordinates',
      flipUVs: 'Flip UV coordinates',
      packUVs: 'Pack UV coordinates',
      unwrapUVs: 'Unwrap UV coordinates',
      createHelper: 'Create UV helper visualization'
    };
    
    return descriptions[operation] || 'Unknown operation';
  }

  // Get UV mapping types
  getUVMappingTypes() {
    return [
      'spherical', 'cylindrical', 'planar', 'box'
    ];
  }

  // Add UV helper to scene
  addUVHelper(object, size = 1.0) {
    const helper = this.createUVHelper(object, size);
    if (helper) {
      this.uvHelpers.push(helper);
      this.editor.scene.add(helper);
      return helper;
    }
    return null;
  }

  // Remove UV helper
  removeUVHelper(helper) {
    const index = this.uvHelpers.indexOf(helper);
    if (index !== -1) {
      this.uvHelpers.splice(index, 1);
      this.editor.scene.remove(helper);
    }
  }

  // Clear all UV helpers
  clearUVHelpers() {
    this.uvHelpers.forEach(helper => {
      this.editor.scene.remove(helper);
    });
    this.uvHelpers = [];
  }

  // Dispose tool
  dispose() {
    this.clearUVHelpers();
  }
}
