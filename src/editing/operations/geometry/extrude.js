/**
 * @fileoverview Extrude Operation
 * Extrudes selected elements (vertices, edges, or faces)
 */

import * as THREE from 'three';
import { GeometryOperationTypes, OperationResult } from '../../types/operationTypes.js';
import { GeometryOperationValidator } from '../../validation/operationValidator.js';
import { 
  getVerticesFromIndices, 
  getAdjacentFaces, 
  createGeometryFromVertices,
  cloneGeometryWithPositions,
  calculateFaceNormal
} from '../../core/geometryUtils.js';
import { 
  calculateCentroid,
  interpolatePoints 
} from '../../core/mathUtils.js';

/**
 * Extrudes selected elements (vertices, edges, or faces)
 * @param {THREE.BufferGeometry} geometry - The geometry to modify
 * @param {Array<number>} elementIndices - The indices of the elements to extrude
 * @param {Object} options - Configuration options
 * @param {string} options.type - The type of elements to extrude ('vertices', 'edges', 'faces')
 * @param {number} options.distance - Extrusion distance
 * @param {THREE.Vector3} options.direction - Extrusion direction
 * @returns {Object} Operation result
 */
export function extrude(geometry, elementIndices, options = {}) {
  const { distance = 1.0, direction, type = 'faces' } = options;
  
  // Validate parameters
  const validation = GeometryOperationValidator.validateParams(
    { geometry, indices: elementIndices, options }, 
    GeometryOperationTypes.EXTRUDE
  );
  
  if (!validation.isValid) {
    return { ...OperationResult, errors: validation.errors };
  }

  try {
    const originalPositions = geometry.getAttribute('position').array;
    const originalIndices = geometry.getIndex().array;
    const newVertices = Array.from(originalPositions);
    const newIndices = [];
    let nextNewVertexIndex = newVertices.length / 3;

    if (type === 'faces') {
      const extrudeDirection = direction || new THREE.Vector3(0, 1, 0);
      extrudeDirection.normalize();

      // Create extruded vertices for each face
      elementIndices.forEach(faceIndex => {
        const faceVertices = getVerticesFromIndices(geometry, [
          originalIndices[faceIndex * 3],
          originalIndices[faceIndex * 3 + 1],
          originalIndices[faceIndex * 3 + 2]
        ]);

        // Create extruded vertices
        const extrudedVertices = faceVertices.map(vertex => 
          vertex.clone().addScaledVector(extrudeDirection, distance)
        );

        // Add original face vertices
        const originalIndices = [
          originalIndices[faceIndex * 3],
          originalIndices[faceIndex * 3 + 1],
          originalIndices[faceIndex * 3 + 2]
        ];

        // Add extruded vertices to new geometry
        extrudedVertices.forEach(vertex => {
          newVertices.push(vertex.x, vertex.y, vertex.z);
        });

        // Create new faces
        const extrudedIndices = [
          nextNewVertexIndex,
          nextNewVertexIndex + 1,
          nextNewVertexIndex + 2
        ];

        // Add original face
        newIndices.push(...originalIndices);
        
        // Add extruded face
        newIndices.push(...extrudedIndices);

        // Add side faces (simplified - would need proper edge detection)
        for (let i = 0; i < 3; i++) {
          const next = (i + 1) % 3;
          newIndices.push(
            originalIndices[i],
            originalIndices[next],
            extrudedIndices[next],
            originalIndices[i],
            extrudedIndices[next],
            extrudedIndices[i]
          );
        }

        nextNewVertexIndex += 3;
      });
    }

    const newGeometry = new THREE.BufferGeometry();
    newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
    newGeometry.setIndex(newIndices);
    newGeometry.computeVertexNormals();

    return { 
      ...OperationResult, 
      success: true, 
      geometry: newGeometry,
      metadata: { operation: 'extrude', type, distance }
    };
  } catch (error) {
    return { 
      ...OperationResult, 
      errors: [`Extrude operation failed: ${error.message}`] 
    };
  }
} 