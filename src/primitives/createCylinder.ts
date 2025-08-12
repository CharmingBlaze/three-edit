import { EditableMesh } from '../core/EditableMesh';
import { CreateCylinderOptions } from './types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions, createFacesFromGrid } from './helpers';
import { validatePrimitive } from './validation';
import { Vector3 } from 'three';

/**
 * Creates a cylinder as an EditableMesh.
 * @param options - Options for creating the cylinder.
 * @returns A new EditableMesh instance representing a cylinder.
 */
export function createCylinder(options: CreateCylinderOptions = {}): EditableMesh {
  // Normalize options with defaults
  const normalizedOptions = normalizeOptions(options, {
    radiusTop: 1,
    radiusBottom: 1,
    height: 2,
    radialSegments: 8,
    heightSegments: 1,
    openEnded: false,
    thetaStart: 0,
    thetaLength: Math.PI * 2,
    name: 'Cylinder',
    materialId: 0,
    centered: true,
    uvLayout: 'cylindrical',
    smoothNormals: false,
    validate: true
  }) as Required<CreateCylinderOptions>;

  // Validate parameters
  if (normalizedOptions.radiusTop < 0) {
    throw new Error('Cylinder radiusTop must be non-negative');
  }
  if (normalizedOptions.radiusBottom < 0) {
    throw new Error('Cylinder radiusBottom must be non-negative');
  }
  if (normalizedOptions.height <= 0) {
    throw new Error('Cylinder height must be positive');
  }
  if (normalizedOptions.radialSegments < 3) {
    throw new Error('Cylinder radialSegments must be at least 3');
  }
  if (normalizedOptions.heightSegments < 1) {
    throw new Error('Cylinder heightSegments must be at least 1');
  }

  // Create mesh and context
  const mesh = new EditableMesh({ name: normalizedOptions.name });
  const context = createPrimitiveContext(mesh, normalizedOptions);

  // Calculate offsets for centered positioning
  const offsetY = normalizedOptions.centered ? 0 : normalizedOptions.height / 2;

  const grid: number[][] = [];

  // Create vertices with UVs
  for (let h = 0; h <= normalizedOptions.heightSegments; h++) {
    const y = offsetY + (h / normalizedOptions.heightSegments - 0.5) * normalizedOptions.height;
    const row: number[] = [];
    
    for (let r = 0; r <= normalizedOptions.radialSegments; r++) {
      const theta = normalizedOptions.thetaStart + (r / normalizedOptions.radialSegments) * normalizedOptions.thetaLength;
      
      // Interpolate radius between top and bottom
      const radius = normalizedOptions.radiusTop + (h / normalizedOptions.heightSegments) * (normalizedOptions.radiusBottom - normalizedOptions.radiusTop);
      
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const u = r / normalizedOptions.radialSegments;
      const v = h / normalizedOptions.heightSegments;
      
      const uv = { u, v };
      
      const result = createVertex(mesh, {
        x,
        y,
        z,
        uv
      }, context);
      row.push(result.id);
    }
    grid.push(row);
  }

  // Create side faces as quads using the helper function
  createFacesFromGrid(mesh, grid, normalizedOptions.materialId, context);

  // Create caps if not open-ended
  if (!normalizedOptions.openEnded) {
    // Bottom cap
    if (normalizedOptions.radiusBottom > 0) {
      const bottomCenterVertex = createVertex(mesh, {
        x: 0,
        y: offsetY - normalizedOptions.height / 2,
        z: 0,
        uv: { u: 0.5, v: 0.5 }
      }, context);

      for (let r = 0; r < normalizedOptions.radialSegments; r++) {
        const v1 = grid[0][r];
        const v2 = grid[0][r + 1];
        
        createFace(mesh, {
          vertexIds: [bottomCenterVertex.id, v1, v2],
          materialId: normalizedOptions.materialId
        }, context);
      }
    }

    // Top cap
    if (normalizedOptions.radiusTop > 0) {
      const topCenterVertex = createVertex(mesh, {
        x: 0,
        y: offsetY + normalizedOptions.height / 2,
        z: 0,
        uv: { u: 0.5, v: 0.5 }
      }, context);

      for (let r = 0; r < normalizedOptions.radialSegments; r++) {
        const v1 = grid[normalizedOptions.heightSegments][r];
        const v2 = grid[normalizedOptions.heightSegments][r + 1];
        
        createFace(mesh, {
          vertexIds: [topCenterVertex.id, v2, v1],
          materialId: normalizedOptions.materialId
        }, context);
      }
    }
  }

  // Calculate face normals
  mesh.faces.forEach(face => {
    if (face.normal) {
      // Recalculate normal to ensure it's correct
      const v1 = mesh.getVertex(face.vertices[0]);
      const v2 = mesh.getVertex(face.vertices[1]);
      const v3 = mesh.getVertex(face.vertices[2]);
      
      if (v1 && v2 && v3) {
        const edge1 = new Vector3(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
        const edge2 = new Vector3(v3.x - v1.x, v3.y - v1.y, v3.z - v1.z);
        face.normal = new Vector3().crossVectors(edge1, edge2).normalize();
      }
    }
  });

  // Validate if requested
  if (normalizedOptions.validate) {
    const validation = validatePrimitive(mesh, 'Cylinder');
    if (!validation.isValid) {
      console.warn('Cylinder validation warnings:', validation.warnings);
    }
  }

  return mesh;
}