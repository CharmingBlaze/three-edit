import { EditableMesh } from '../core/EditableMesh';
import { CreateIcosahedronOptions } from './types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions } from './helpers';
import { validatePrimitive } from './validation';

/**
 * Creates an icosahedron as an EditableMesh.
 * Note: Icosahedrons naturally have triangular faces, so this creates triangles intentionally.
 * @param options - Options for creating the icosahedron.
 * @returns A new EditableMesh instance representing an icosahedron.
 */
export function createIcosahedron(options: CreateIcosahedronOptions = {}): EditableMesh {
  // Normalize options with defaults
  const normalizedOptions = normalizeOptions(options, {
    radius: 1,
    name: 'Icosahedron',
    materialId: 0,
    centered: true,
    uvLayout: 'spherical',
    smoothNormals: false,
    validate: true
  }) as Required<CreateIcosahedronOptions>;

  // Validate parameters
  if (normalizedOptions.radius <= 0) {
    throw new Error('Icosahedron radius must be positive');
  }

  // Create mesh and context
  const mesh = new EditableMesh({ name: normalizedOptions.name });
  const context = createPrimitiveContext(mesh, normalizedOptions);

  // Calculate offsets for centered positioning
  const offsetX = normalizedOptions.centered ? 0 : normalizedOptions.radius;
  const offsetY = normalizedOptions.centered ? 0 : normalizedOptions.radius;
  const offsetZ = normalizedOptions.centered ? 0 : normalizedOptions.radius;

  // Golden ratio for icosahedron
  const phi = (1 + Math.sqrt(5)) / 2;
  const a = normalizedOptions.radius / Math.sqrt(phi * phi + 1);
  const b = a * phi;

  // Icosahedron vertices (12 vertices)
  const vertices: number[] = [];
  
  // Create the 12 vertices of a regular icosahedron
  const vertexPositions = [
    { x: offsetX + 0, y: offsetY + a, z: offsetZ + b, uv: { u: 0, v: 0.5 } },
    { x: offsetX + 0, y: offsetY - a, z: offsetZ + b, uv: { u: 0.5, v: 0.5 } },
    { x: offsetX + 0, y: offsetY + a, z: offsetZ - b, uv: { u: 1, v: 0.5 } },
    { x: offsetX + 0, y: offsetY - a, z: offsetZ - b, uv: { u: 0.25, v: 0.5 } },
    { x: offsetX + a, y: offsetY + b, z: offsetZ + 0, uv: { u: 0.125, v: 0.25 } },
    { x: offsetX - a, y: offsetY + b, z: offsetZ + 0, uv: { u: 0.375, v: 0.25 } },
    { x: offsetX + a, y: offsetY - b, z: offsetZ + 0, uv: { u: 0.125, v: 0.75 } },
    { x: offsetX - a, y: offsetY - b, z: offsetZ + 0, uv: { u: 0.375, v: 0.75 } },
    { x: offsetX + b, y: offsetY + 0, z: offsetZ + a, uv: { u: 0.625, v: 0.25 } },
    { x: offsetX - b, y: offsetY + 0, z: offsetZ + a, uv: { u: 0.875, v: 0.25 } },
    { x: offsetX + b, y: offsetY + 0, z: offsetZ - a, uv: { u: 0.625, v: 0.75 } },
    { x: offsetX - b, y: offsetY + 0, z: offsetZ - a, uv: { u: 0.875, v: 0.75 } }
  ];

  for (const vertexData of vertexPositions) {
    const result = createVertex(mesh, vertexData, context);
    vertices.push(result.id);
  }

  // Create the 20 triangular faces (icosahedrons naturally have triangular faces)
  const faceDefinitions = [
    [vertices[0], vertices[1], vertices[4]], [vertices[0], vertices[4], vertices[8]],
    [vertices[0], vertices[8], vertices[9]], [vertices[0], vertices[9], vertices[1]],
    [vertices[1], vertices[9], vertices[6]], [vertices[1], vertices[6], vertices[4]],
    [vertices[4], vertices[6], vertices[10]], [vertices[4], vertices[10], vertices[8]],
    [vertices[8], vertices[10], vertices[2]], [vertices[8], vertices[2], vertices[9]],
    [vertices[9], vertices[2], vertices[6]], [vertices[6], vertices[2], vertices[10]],
    [vertices[3], vertices[7], vertices[5]], [vertices[3], vertices[5], vertices[11]],
    [vertices[3], vertices[11], vertices[7]], [vertices[7], vertices[11], vertices[5]],
    [vertices[5], vertices[7], vertices[1]], [vertices[5], vertices[1], vertices[0]],
    [vertices[5], vertices[0], vertices[11]], [vertices[11], vertices[0], vertices[7]]
  ];

  for (const vertexIds of faceDefinitions) {
    createFace(mesh, {
      vertexIds,
      materialId: normalizedOptions.materialId
    }, context);
  }

  // Validate if requested
  if (normalizedOptions.validate) {
    const validation = validatePrimitive(mesh, 'Icosahedron');
    if (!validation.isValid) {
      console.warn('Icosahedron validation warnings:', validation.warnings);
    }
  }

  return mesh;
}
 