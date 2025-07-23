import { EditableMesh } from '../core/EditableMesh';
import { CreateTorusOptions } from './types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions } from './helpers';
import { validatePrimitive } from './validation';

/**
 * Creates a torus as an EditableMesh.
 * @param options - Options for creating the torus.
 * @returns A new EditableMesh instance representing a torus.
 */
export function createTorus(options: CreateTorusOptions = {}): EditableMesh {
  // Normalize options with defaults
  const normalizedOptions = normalizeOptions(options, {
    radius: 1,
    tube: 0.4,
    radialSegments: 8,
    tubularSegments: 6,
    arc: Math.PI * 2,
    name: 'Torus',
    materialId: 0,
    centered: true,
    uvLayout: 'cylindrical',
    smoothNormals: true,
    validate: true
  }) as Required<CreateTorusOptions>;

  // Validate parameters
  if (normalizedOptions.radius <= 0) {
    throw new Error('Torus radius must be positive');
  }
  if (normalizedOptions.tube <= 0) {
    throw new Error('Torus tube must be positive');
  }
  if (normalizedOptions.radialSegments < 3) {
    throw new Error('Torus radialSegments must be at least 3');
  }
  if (normalizedOptions.tubularSegments < 3) {
    throw new Error('Torus tubularSegments must be at least 3');
  }

  // Create mesh and context
  const mesh = new EditableMesh({ name: normalizedOptions.name });
  const context = createPrimitiveContext(mesh, normalizedOptions);

  // Calculate offsets for centered positioning
  const offsetX = normalizedOptions.centered ? 0 : normalizedOptions.radius;
  const offsetY = normalizedOptions.centered ? 0 : normalizedOptions.tube;
  const offsetZ = normalizedOptions.centered ? 0 : normalizedOptions.radius;

  const grid: number[][] = [];

  // Create vertices with UVs
  for (let i = 0; i <= normalizedOptions.radialSegments; i++) {
    const row: number[] = [];
    const u = i / normalizedOptions.radialSegments;
    const theta = u * normalizedOptions.arc;
    
    for (let j = 0; j <= normalizedOptions.tubularSegments; j++) {
      const v = j / normalizedOptions.tubularSegments;
      const phi = v * Math.PI * 2;
      
      const x = offsetX + (normalizedOptions.radius + normalizedOptions.tube * Math.cos(phi)) * Math.cos(theta);
      const y = offsetY + normalizedOptions.tube * Math.sin(phi);
      const z = offsetZ + (normalizedOptions.radius + normalizedOptions.tube * Math.cos(phi)) * Math.sin(theta);
      
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
  for (let i = 0; i < normalizedOptions.radialSegments; i++) {
    for (let j = 0; j < normalizedOptions.tubularSegments; j++) {
      const v1 = grid[i][j];
      const v2 = grid[i + 1][j];
      const v3 = grid[i + 1][j + 1];
      const v4 = grid[i][j + 1];
      
      createFace(mesh, {
        vertexIds: [v1, v2, v3, v4],
        materialId: normalizedOptions.materialId
      }, context);
    }
  }

  // Validate if requested
  if (normalizedOptions.validate) {
    const validation = validatePrimitive(mesh, 'Torus');
    if (!validation.isValid) {
      console.warn('Torus validation warnings:', validation.warnings);
    }
  }

  return mesh;
}