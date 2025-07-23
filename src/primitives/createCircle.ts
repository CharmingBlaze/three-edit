import { EditableMesh } from '../core/EditableMesh';
import { CreateCircleOptions } from './types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions } from './helpers';
import { validatePrimitive } from './validation';

/**
 * Creates a circle as an EditableMesh.
 * @param options - Options for creating the circle.
 * @returns A new EditableMesh instance representing a circle.
 */
export function createCircle(options: CreateCircleOptions = {}): EditableMesh {
  // Normalize options with defaults
  const normalizedOptions = normalizeOptions(options, {
    radius: 1,
    segments: 32,
    thetaStart: 0,
    thetaLength: Math.PI * 2,
    name: 'Circle',
    materialId: 0,
    centered: true,
    uvLayout: 'planar',
    smoothNormals: false,
    validate: true
  }) as Required<CreateCircleOptions>;

  // Validate parameters
  if (normalizedOptions.radius <= 0) {
    throw new Error('Circle radius must be positive');
  }
  if (normalizedOptions.segments < 3) {
    throw new Error('Circle segments must be at least 3');
  }

  // Create mesh and context
  const mesh = new EditableMesh({ name: normalizedOptions.name });
  const context = createPrimitiveContext(mesh, normalizedOptions);

  // Calculate offsets for centered positioning
  const offsetX = normalizedOptions.centered ? 0 : normalizedOptions.radius;
  const offsetZ = normalizedOptions.centered ? 0 : normalizedOptions.radius;

  const vertices: number[] = [];

  // Create center vertex
  const centerVertex = createVertex(mesh, {
    x: offsetX,
    y: 0,
    z: offsetZ,
    uv: { u: 0.5, v: 0.5 }
  }, context);
  vertices.push(centerVertex.id);

  // Create perimeter vertices
  for (let i = 0; i <= normalizedOptions.segments; i++) {
    const theta = normalizedOptions.thetaStart + (i / normalizedOptions.segments) * normalizedOptions.thetaLength;
    const x = offsetX + normalizedOptions.radius * Math.cos(theta);
    const z = offsetZ + normalizedOptions.radius * Math.sin(theta);
    const u = 0.5 + 0.5 * Math.cos(theta);
    const v = 0.5 + 0.5 * Math.sin(theta);
    
    const uv = { u, v };
    
    const result = createVertex(mesh, {
      x,
      y: 0,
      z,
      uv
    }, context);
    vertices.push(result.id);
  }

  // Create triangular faces
  for (let i = 0; i < normalizedOptions.segments; i++) {
    const v1 = vertices[0]; // center
    const v2 = vertices[i + 1];
    const v3 = vertices[i + 2];
    
    createFace(mesh, {
      vertexIds: [v1, v2, v3],
      materialId: normalizedOptions.materialId
    }, context);
  }

  // Validate if requested
  if (normalizedOptions.validate) {
    const validation = validatePrimitive(mesh, 'Circle');
    if (!validation.isValid) {
      console.warn('Circle validation warnings:', validation.warnings);
    }
  }

  return mesh;
}