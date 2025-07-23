import { EditableMesh } from '../core/EditableMesh';
import { CreatePlaneOptions } from './types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions } from './helpers';
import { validatePrimitive } from './validation';

/**
 * Creates a plane as an EditableMesh.
 * @param options - Options for creating the plane.
 * @returns A new EditableMesh instance representing a plane.
 */
export function createPlane(options: CreatePlaneOptions = {}): EditableMesh {
  // Normalize options with defaults
  const normalizedOptions = normalizeOptions(options, {
    width: 1,
    height: 1,
    widthSegments: 1,
    heightSegments: 1,
    name: 'Plane',
    materialId: 0,
    centered: true,
    uvLayout: 'planar',
    smoothNormals: false,
    validate: true
  }) as Required<CreatePlaneOptions>;

  // Validate parameters
  if (normalizedOptions.width <= 0) {
    throw new Error('Plane width must be positive');
  }
  if (normalizedOptions.height <= 0) {
    throw new Error('Plane height must be positive');
  }
  if (normalizedOptions.widthSegments < 1) {
    throw new Error('Plane widthSegments must be at least 1');
  }
  if (normalizedOptions.heightSegments < 1) {
    throw new Error('Plane heightSegments must be at least 1');
  }

  // Create mesh and context
  const mesh = new EditableMesh({ name: normalizedOptions.name });
  const context = createPrimitiveContext(mesh, normalizedOptions);

  // Calculate offsets for centered positioning
  const offsetX = normalizedOptions.centered ? 0 : normalizedOptions.width / 2;
  const offsetZ = normalizedOptions.centered ? 0 : normalizedOptions.height / 2;

  const grid: number[][] = [];

  // Create vertices with UVs
  for (let h = 0; h <= normalizedOptions.heightSegments; h++) {
    const row: number[] = [];
    const z = offsetZ + (h / normalizedOptions.heightSegments - 0.5) * normalizedOptions.height;
    
    for (let w = 0; w <= normalizedOptions.widthSegments; w++) {
      const x = offsetX + (w / normalizedOptions.widthSegments - 0.5) * normalizedOptions.width;
      const y = 0;
      const u = w / normalizedOptions.widthSegments;
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

  // Create faces
  for (let h = 0; h < normalizedOptions.heightSegments; h++) {
    for (let w = 0; w < normalizedOptions.widthSegments; w++) {
      const v1 = grid[h][w];
      const v2 = grid[h][w + 1];
      const v3 = grid[h + 1][w + 1];
      const v4 = grid[h + 1][w];
      
      createFace(mesh, {
        vertexIds: [v1, v2, v3, v4],
        materialId: normalizedOptions.materialId
      }, context);
    }
  }

  // Validate if requested
  if (normalizedOptions.validate) {
    const validation = validatePrimitive(mesh, 'Plane');
    if (!validation.isValid) {
      console.warn('Plane validation warnings:', validation.warnings);
    }
  }

  return mesh;
}
 