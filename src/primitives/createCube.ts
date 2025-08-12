import { EditableMesh } from '../core/EditableMesh';
import { CreateCubeOptions, PrimitiveResult } from './types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions, applySmoothingIfEnabled } from './helpers';
import { validatePrimitive } from './validation';
import { Vector3 } from 'three';

/**
 * Creates a cube as an EditableMesh with quad faces.
 * @param options - Options for creating the cube.
 * @returns A new EditableMesh instance representing a cube.
 */
export function createCube(options: CreateCubeOptions = {}): EditableMesh {
  // Normalize options with defaults
  const normalizedOptions = normalizeOptions(options, {
    width: 1,
    height: 1,
    depth: 1,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
    name: 'Cube',
    materialId: 0,
    centered: true,
    uvLayout: 'box',
    smoothNormals: false,
    validate: true,
    smoothing: {
      enabled: false,
      type: 'vertex',
      iterations: 2,
      factor: 0.3
    }
  }) as Required<CreateCubeOptions>;

  // Validate parameters
  if (normalizedOptions.width <= 0 || normalizedOptions.height <= 0 || normalizedOptions.depth <= 0) {
    throw new Error('Cube dimensions must be positive');
  }
  if (normalizedOptions.widthSegments < 1 || normalizedOptions.heightSegments < 1 || normalizedOptions.depthSegments < 1) {
    throw new Error('Cube segments must be at least 1');
  }

  // Create mesh and context
  const mesh = new EditableMesh({ name: normalizedOptions.name });
  const context = createPrimitiveContext(mesh, normalizedOptions);

  // Calculate offsets for centered positioning
  const offsetX = normalizedOptions.centered ? -normalizedOptions.width / 2 : 0;
  const offsetY = normalizedOptions.centered ? -normalizedOptions.height / 2 : 0;
  const offsetZ = normalizedOptions.centered ? -normalizedOptions.depth / 2 : 0;

  // Create 8 vertices for the cube corners (shared between faces)
  const vertices: number[] = [];
  
  // Front face vertices (Z = depth/2)
  vertices.push(createVertex(mesh, { 
    x: offsetX, 
    y: offsetY, 
    z: offsetZ + normalizedOptions.depth,
    uv: { u: 0, v: 0 }
  }, context).id);
  vertices.push(createVertex(mesh, { 
    x: offsetX + normalizedOptions.width, 
    y: offsetY, 
    z: offsetZ + normalizedOptions.depth,
    uv: { u: 1, v: 0 }
  }, context).id);
  vertices.push(createVertex(mesh, { 
    x: offsetX + normalizedOptions.width, 
    y: offsetY + normalizedOptions.height, 
    z: offsetZ + normalizedOptions.depth,
    uv: { u: 1, v: 1 }
  }, context).id);
  vertices.push(createVertex(mesh, { 
    x: offsetX, 
    y: offsetY + normalizedOptions.height, 
    z: offsetZ + normalizedOptions.depth,
    uv: { u: 0, v: 1 }
  }, context).id);
  
  // Back face vertices (Z = -depth/2)
  vertices.push(createVertex(mesh, { 
    x: offsetX, 
    y: offsetY, 
    z: offsetZ,
    uv: { u: 1, v: 0 }
  }, context).id);
  vertices.push(createVertex(mesh, { 
    x: offsetX + normalizedOptions.width, 
    y: offsetY, 
    z: offsetZ,
    uv: { u: 0, v: 0 }
  }, context).id);
  vertices.push(createVertex(mesh, { 
    x: offsetX + normalizedOptions.width, 
    y: offsetY + normalizedOptions.height, 
    z: offsetZ,
    uv: { u: 0, v: 1 }
  }, context).id);
  vertices.push(createVertex(mesh, { 
    x: offsetX, 
    y: offsetY + normalizedOptions.height, 
    z: offsetZ,
    uv: { u: 1, v: 1 }
  }, context).id);

  const faceMaterialId = normalizedOptions.materialId;

  // Front face (Z = depth/2) - quad
  createFace(mesh, {
    vertexIds: [vertices[0], vertices[1], vertices[2], vertices[3]],
    materialId: faceMaterialId
  }, context);

  // Back face (Z = -depth/2) - quad
  createFace(mesh, {
    vertexIds: [vertices[4], vertices[7], vertices[6], vertices[5]],
    materialId: faceMaterialId
  }, context);

  // Left face (X = -width/2) - quad
  createFace(mesh, {
    vertexIds: [vertices[4], vertices[0], vertices[3], vertices[7]],
    materialId: faceMaterialId
  }, context);

  // Right face (X = width/2) - quad
  createFace(mesh, {
    vertexIds: [vertices[1], vertices[5], vertices[6], vertices[2]],
    materialId: faceMaterialId
  }, context);

  // Top face (Y = height/2) - quad
  createFace(mesh, {
    vertexIds: [vertices[3], vertices[2], vertices[6], vertices[7]],
    materialId: faceMaterialId
  }, context);

  // Bottom face (Y = -height/2) - quad
  createFace(mesh, {
    vertexIds: [vertices[4], vertices[5], vertices[1], vertices[0]],
    materialId: faceMaterialId
  }, context);

  // Apply smoothing if enabled
  const finalMesh = applySmoothingIfEnabled(mesh, normalizedOptions);

  // Validate if requested
  if (normalizedOptions.validate) {
    validatePrimitive(finalMesh, 'Cube');
  }

  return finalMesh;
}