import { EditableMesh } from '../core/EditableMesh';
import { CreateCircleOptions } from './types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions, createFacesFromGrid } from './helpers';
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

  // Create a simple triangle fan for the circle
  const segments = normalizedOptions.segments;
  
  // Create center vertex
  const centerVertex = createVertex(mesh, {
    x: offsetX,
    y: 0,
    z: offsetZ,
    uv: { u: 0.5, v: 0.5 }
  }, context);
  
  // Create perimeter vertices
  const perimeterVertices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = normalizedOptions.thetaStart + (i / segments) * normalizedOptions.thetaLength;
    const x = offsetX + normalizedOptions.radius * Math.cos(theta);
    const z = offsetZ + normalizedOptions.radius * Math.sin(theta);
    const u = 0.5 + 0.5 * Math.cos(theta);
    const v = 0.5 + 0.5 * Math.sin(theta);
    
    const result = createVertex(mesh, {
      x,
      y: 0,
      z,
      uv: { u, v }
    }, context);
    perimeterVertices.push(result.id);
  }
  
  // Create triangle faces (triangle fan)
  for (let i = 0; i < perimeterVertices.length - 1; i++) {
    createFace(mesh, {
      vertexIds: [centerVertex.id, perimeterVertices[i]!, perimeterVertices[i + 1]!],
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