import { EditableMesh } from '../core/EditableMesh';
import { CreateOctahedronOptions } from './types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions } from './helpers';
import { validatePrimitive } from './validation';

/**
 * Creates an octahedron as an EditableMesh.
 * @param options - Options for creating the octahedron.
 * @returns A new EditableMesh instance representing an octahedron.
 */
export function createOctahedron(options: CreateOctahedronOptions = {}): EditableMesh {
  // Normalize options with defaults
  const normalizedOptions = normalizeOptions(options, {
    radius: 1,
    name: 'Octahedron',
    materialId: 0,
    centered: true,
    uvLayout: 'spherical',
    smoothNormals: false,
    validate: true
  }) as Required<CreateOctahedronOptions>;

  // Validate parameters
  if (normalizedOptions.radius <= 0) {
    throw new Error('Octahedron radius must be positive');
  }

  // Create mesh and context
  const mesh = new EditableMesh({ name: normalizedOptions.name });
  const context = createPrimitiveContext(mesh, normalizedOptions);

  // Calculate offsets for centered positioning
  const offsetX = normalizedOptions.centered ? 0 : normalizedOptions.radius;
  const offsetY = normalizedOptions.centered ? 0 : normalizedOptions.radius;
  const offsetZ = normalizedOptions.centered ? 0 : normalizedOptions.radius;

  // Octahedron vertices (6 vertices)
  const vertices: number[] = [];
  
  // Create the 6 vertices of a regular octahedron
  const vertexPositions = [
    { x: offsetX + normalizedOptions.radius, y: offsetY, z: offsetZ, uv: { u: 0, v: 0.5 } },     // +X
    { x: offsetX - normalizedOptions.radius, y: offsetY, z: offsetZ, uv: { u: 1, v: 0.5 } },     // -X
    { x: offsetX, y: offsetY + normalizedOptions.radius, z: offsetZ, uv: { u: 0.5, v: 0 } },     // +Y
    { x: offsetX, y: offsetY - normalizedOptions.radius, z: offsetZ, uv: { u: 0.5, v: 1 } },     // -Y
    { x: offsetX, y: offsetY, z: offsetZ + normalizedOptions.radius, uv: { u: 0.25, v: 0.5 } }, // +Z
    { x: offsetX, y: offsetY, z: offsetZ - normalizedOptions.radius, uv: { u: 0.75, v: 0.5 } }  // -Z
  ];

  for (const vertexData of vertexPositions) {
    const result = createVertex(mesh, vertexData, context);
    vertices.push(result.id);
  }

  // Create the 8 triangular faces
  const faceDefinitions = [
    [vertices[0], vertices[2], vertices[4]], // +X, +Y, +Z
    [vertices[0], vertices[4], vertices[3]], // +X, +Z, -Y
    [vertices[0], vertices[3], vertices[5]], // +X, -Y, -Z
    [vertices[0], vertices[5], vertices[2]], // +X, -Z, +Y
    [vertices[1], vertices[2], vertices[5]], // -X, +Y, -Z
    [vertices[1], vertices[5], vertices[3]], // -X, -Z, -Y
    [vertices[1], vertices[3], vertices[4]], // -X, -Y, +Z
    [vertices[1], vertices[4], vertices[2]]  // -X, +Z, +Y
  ];

  for (const vertexIds of faceDefinitions) {
    createFace(mesh, {
      vertexIds,
      materialId: normalizedOptions.materialId
    }, context);
  }

  // Validate if requested
  if (normalizedOptions.validate) {
    const validation = validatePrimitive(mesh, 'Octahedron');
    if (!validation.isValid) {
      console.warn('Octahedron validation warnings:', validation.warnings);
    }
  }

  return mesh;
}
 