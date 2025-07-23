import { EditableMesh } from '../core/EditableMesh';
import { CreatePyramidOptions } from './types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions } from './helpers';
import { validatePrimitive } from './validation';

/**
 * Creates a pyramid as an EditableMesh.
 * @param options - Options for creating the pyramid.
 * @returns A new EditableMesh instance representing a pyramid.
 */
export function createPyramid(options: CreatePyramidOptions = {}): EditableMesh {
  // Normalize options with defaults
  const normalizedOptions = normalizeOptions(options, {
    width: 1,
    height: 1,
    depth: 1,
    name: 'Pyramid',
    materialId: 0,
    centered: true,
    uvLayout: 'planar',
    smoothNormals: false,
    validate: true
  }) as Required<CreatePyramidOptions>;

  // Validate parameters
  if (normalizedOptions.width <= 0) {
    throw new Error('Pyramid width must be positive');
  }
  if (normalizedOptions.height <= 0) {
    throw new Error('Pyramid height must be positive');
  }
  if (normalizedOptions.depth <= 0) {
    throw new Error('Pyramid depth must be positive');
  }

  // Create mesh and context
  const mesh = new EditableMesh({ name: normalizedOptions.name });
  const context = createPrimitiveContext(mesh, normalizedOptions);

  // Calculate offsets for centered positioning
  const offsetX = normalizedOptions.centered ? 0 : normalizedOptions.width / 2;
  const offsetY = normalizedOptions.centered ? 0 : normalizedOptions.height / 2;
  const offsetZ = normalizedOptions.centered ? 0 : normalizedOptions.depth / 2;

  const halfWidth = normalizedOptions.width / 2;
  const halfDepth = normalizedOptions.depth / 2;

  // Create vertices
  const vertices: number[] = [];

  // Base vertices
  const baseVertices = [
    { x: offsetX - halfWidth, y: offsetY - normalizedOptions.height / 2, z: offsetZ - halfDepth, uv: { u: 0, v: 0 } },
    { x: offsetX + halfWidth, y: offsetY - normalizedOptions.height / 2, z: offsetZ - halfDepth, uv: { u: 1, v: 0 } },
    { x: offsetX + halfWidth, y: offsetY - normalizedOptions.height / 2, z: offsetZ + halfDepth, uv: { u: 1, v: 1 } },
    { x: offsetX - halfWidth, y: offsetY - normalizedOptions.height / 2, z: offsetZ + halfDepth, uv: { u: 0, v: 1 } }
  ];

  for (const vertexData of baseVertices) {
    const result = createVertex(mesh, vertexData, context);
    vertices.push(result.id);
  }

  // Apex vertex
  const apexVertex = createVertex(mesh, {
    x: offsetX,
    y: offsetY + normalizedOptions.height / 2,
    z: offsetZ,
    uv: { u: 0.5, v: 0.5 }
  }, context);
  vertices.push(apexVertex.id);

  // Create faces
  const faceDefinitions = [
    // Base face
    [vertices[0], vertices[1], vertices[2], vertices[3]],
    // Side faces
    [vertices[0], vertices[1], vertices[4]], // front
    [vertices[1], vertices[2], vertices[4]], // right
    [vertices[2], vertices[3], vertices[4]], // back
    [vertices[3], vertices[0], vertices[4]]  // left
  ];

  for (const vertexIds of faceDefinitions) {
    createFace(mesh, {
      vertexIds,
      materialId: normalizedOptions.materialId
    }, context);
  }

  // Validate if requested
  if (normalizedOptions.validate) {
    const validation = validatePrimitive(mesh, 'Pyramid');
    if (!validation.isValid) {
      console.warn('Pyramid validation warnings:', validation.warnings);
    }
  }

  return mesh;
}