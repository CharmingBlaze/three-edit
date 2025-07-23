import { EditableMesh } from '../core/EditableMesh';
import { CreateConeOptions } from './types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions } from './helpers';
import { validatePrimitive } from './validation';

/**
 * Creates a cone as an EditableMesh.
 * @param options - Options for creating the cone.
 * @returns A new EditableMesh instance representing a cone.
 */
export function createCone(options: CreateConeOptions = {}): EditableMesh {
  // Normalize options with defaults
  const normalizedOptions = normalizeOptions(options, {
    radius: 1,
    height: 2,
    radialSegments: 8,
    heightSegments: 1,
    openEnded: false,
    name: 'Cone',
    materialId: 0,
    centered: true,
    uvLayout: 'cylindrical',
    smoothNormals: false,
    validate: true
  }) as Required<CreateConeOptions>;

  // Validate parameters
  if (normalizedOptions.radius <= 0) {
    throw new Error('Cone radius must be positive');
  }
  if (normalizedOptions.height <= 0) {
    throw new Error('Cone height must be positive');
  }
  if (normalizedOptions.radialSegments < 3) {
    throw new Error('Cone radialSegments must be at least 3');
  }
  if (normalizedOptions.heightSegments < 1) {
    throw new Error('Cone heightSegments must be at least 1');
  }

  // Create mesh and context
  const mesh = new EditableMesh({ name: normalizedOptions.name });
  const context = createPrimitiveContext(mesh, normalizedOptions);

  // Calculate offsets for centered positioning
  const offsetY = normalizedOptions.centered ? 0 : normalizedOptions.height / 2;
  const halfHeight = normalizedOptions.height / 2;

  const grid: number[][] = [];

  // Create vertices with UVs
  for (let h = 0; h <= normalizedOptions.heightSegments; h++) {
    const y = offsetY + (h / normalizedOptions.heightSegments - 0.5) * normalizedOptions.height;
    const row: number[] = [];
    
    for (let r = 0; r <= normalizedOptions.radialSegments; r++) {
      const theta = (r / normalizedOptions.radialSegments) * Math.PI * 2;
      
      // Interpolate radius from base to tip
      const radius = normalizedOptions.radius * (1 - h / normalizedOptions.heightSegments);
      
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

  // Create side faces
  for (let h = 0; h < normalizedOptions.heightSegments; h++) {
    for (let r = 0; r < normalizedOptions.radialSegments; r++) {
      const v1 = grid[h][r];
      const v2 = grid[h + 1][r];
      const v3 = grid[h + 1][r + 1];
      const v4 = grid[h][r + 1];
      
      createFace(mesh, {
        vertexIds: [v1, v2, v3, v4],
        materialId: normalizedOptions.materialId
      }, context);
    }
  }

  // Create base cap if not open-ended
  if (!normalizedOptions.openEnded) {
    const baseCenterVertex = createVertex(mesh, {
      x: 0,
      y: offsetY - halfHeight,
      z: 0,
      uv: { u: 0.5, v: 0.5 }
    }, context);

    for (let r = 0; r < normalizedOptions.radialSegments; r++) {
      const v1 = grid[0][r];
      const v2 = grid[0][r + 1];
      
      createFace(mesh, {
        vertexIds: [baseCenterVertex.id, v2, v1],
        materialId: normalizedOptions.materialId
      }, context);
    }
  }

  // Validate if requested
  if (normalizedOptions.validate) {
    const validation = validatePrimitive(mesh, 'Cone');
    if (!validation.isValid) {
      console.warn('Cone validation warnings:', validation.warnings);
    }
  }

  return mesh;
}