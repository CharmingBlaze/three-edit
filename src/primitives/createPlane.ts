import { EditableMesh } from '../core/EditableMesh';
import { CreatePlaneOptions } from './types';
import { 
  createPrimitiveContext, 
  normalizeOptions,
  createVertexGrid,
  createFacesFromGrid
} from './helpers';
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

  // Create a grid of vertices
  const grid = createVertexGrid(
    mesh,
    normalizedOptions.widthSegments + 1,
    normalizedOptions.heightSegments + 1,
    (w, h) => {
      const u = w / normalizedOptions.widthSegments;
      const v = h / normalizedOptions.heightSegments;
      const x = offsetX + (u - 0.5) * normalizedOptions.width;
      const z = offsetZ + (v - 0.5) * normalizedOptions.height;
      
      return { x, y: 0, z, uv: { u, v } };
    },
    context
  );

  // Create faces from the grid
  createFacesFromGrid(mesh, grid, normalizedOptions.materialId, context);

  // Validate if requested
  if (normalizedOptions.validate) {
    const validation = validatePrimitive(mesh, 'Plane');
    if (!validation.isValid) {
      console.warn('Plane validation warnings:', validation.warnings);
    }
  }

  return mesh;
}
 