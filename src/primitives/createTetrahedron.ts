import { EditableMesh } from '../core/EditableMesh';
import { CreateTetrahedronOptions } from './types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions } from './helpers';
import { validatePrimitive } from './validation';

/**
 * Creates a tetrahedron as an EditableMesh.
 * @param options - Options for creating the tetrahedron.
 * @returns A new EditableMesh instance representing a tetrahedron.
 */
export function createTetrahedron(options: CreateTetrahedronOptions = {}): EditableMesh {
  // Normalize options with defaults
  const normalizedOptions = normalizeOptions(options, {
    radius: 1,
    name: 'Tetrahedron',
    materialId: 0,
    centered: true,
    uvLayout: 'spherical',
    smoothNormals: false,
    validate: true
  }) as Required<CreateTetrahedronOptions>;

  // Validate parameters
  if (normalizedOptions.radius <= 0) {
    throw new Error('Tetrahedron radius must be positive');
  }

  // Create mesh and context
  const mesh = new EditableMesh({ name: normalizedOptions.name });
  const context = createPrimitiveContext(mesh, normalizedOptions);

  // Calculate offsets for centered positioning
  const offsetX = normalizedOptions.centered ? 0 : normalizedOptions.radius;
  const offsetY = normalizedOptions.centered ? 0 : normalizedOptions.radius;
  const offsetZ = normalizedOptions.centered ? 0 : normalizedOptions.radius;

  // Tetrahedron vertices (regular tetrahedron)
  const vertices: number[] = [];
  
  // Create the 4 vertices of a regular tetrahedron
  const vertexPositions = [
    { x: offsetX + normalizedOptions.radius, y: offsetY + normalizedOptions.radius, z: offsetZ + normalizedOptions.radius, uv: { u: 0, v: 0 } },
    { x: offsetX - normalizedOptions.radius, y: offsetY - normalizedOptions.radius, z: offsetZ + normalizedOptions.radius, uv: { u: 1, v: 0 } },
    { x: offsetX, y: offsetY, z: offsetZ - normalizedOptions.radius, uv: { u: 0.5, v: 1 } },
    { x: offsetX, y: offsetY + normalizedOptions.radius, z: offsetZ, uv: { u: 0.5, v: 0.5 } }
  ];

  for (const vertexData of vertexPositions) {
    const result = createVertex(mesh, vertexData, context);
    vertices.push(result.id);
  }

  // Create the 4 triangular faces
  const faceDefinitions = [
    [vertices[0], vertices[1], vertices[2]], // base
    [vertices[0], vertices[2], vertices[3]], // side 1
    [vertices[0], vertices[3], vertices[1]], // side 2
    [vertices[1], vertices[3], vertices[2]]  // side 3
  ];

  for (const vertexIds of faceDefinitions) {
    createFace(mesh, {
      vertexIds,
      materialId: normalizedOptions.materialId
    }, context);
  }

  // Validate if requested
  if (normalizedOptions.validate) {
    const validation = validatePrimitive(mesh, 'Tetrahedron');
    if (!validation.isValid) {
      console.warn('Tetrahedron validation warnings:', validation.warnings);
    }
  }

  return mesh;
}