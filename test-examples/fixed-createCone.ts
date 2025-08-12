import { EditableMesh } from '../src/core/EditableMesh';
import { CreateConeOptions } from '../src/primitives/types';
import { createVertex, createFace, createPrimitiveContext, normalizeOptions } from '../src/primitives/helpers';
import { validatePrimitive } from '../src/primitives/validation';

/**
 * Creates a cone as an EditableMesh.
 * @param options - Options for creating the cone.
 * @returns A new EditableMesh instance representing a cone.
 */
export function createCone(options: CreateConeOptions = {}): EditableMesh {
  // Normalize options with defaults
  const normalizedOptions = normalizeOptions(options, {
    radius: 1,
    height: 2,
    radialSegments: 8,
    heightSegments: 1,
    openEnded: false,
    thetaLength: Math.PI * 2,
    name: 'Cone',
    materialId: 0,
    centered: true,
    uvLayout: 'cylindrical',
    smoothNormals: false,
    validate: true
  }) as Required<CreateConeOptions>;

  // Validate parameters
  if (normalizedOptions.radius <= 0) {
    throw new Error('Cone radius must be positive');
  }
  if (normalizedOptions.height <= 0) {
    throw new Error('Cone height must be positive');
  }
  if (normalizedOptions.radialSegments < 3) {
    throw new Error('Cone radialSegments must be at least 3');
  }
  if (normalizedOptions.heightSegments < 1) {
    throw new Error('Cone heightSegments must be at least 1');
  }

  // Create mesh and context
  const mesh = new EditableMesh({ name: normalizedOptions.name });
  const context = createPrimitiveContext(mesh, normalizedOptions);

  // Calculate offsets for centered positioning
  const offsetY = normalizedOptions.centered ? 0 : normalizedOptions.height / 2;
  const halfHeight = normalizedOptions.height / 2;

  const apex = createVertex(mesh, {
    x: 0,
    y: offsetY + halfHeight,
    z: 0,
    uv: { u: 0.5, v: 1 }
  }, context);

  const baseVertices: number[] = [];
  for (let r = 0; r < normalizedOptions.radialSegments; r++) {
    const theta = (r / normalizedOptions.radialSegments) * normalizedOptions.thetaLength;
    const x = Math.cos(theta) * normalizedOptions.radius;
    const z = Math.sin(theta) * normalizedOptions.radius;
    const u = r / normalizedOptions.radialSegments;
    const v = 0;

    const result = createVertex(mesh, {
      x,
      y: offsetY - halfHeight,
      z,
      uv: { u, v }
    }, context);
    baseVertices.push(result.id);
  }

  // Create side faces
  for (let r = 0; r < normalizedOptions.radialSegments; r++) {
    const v1 = baseVertices[r];
    const v2 = baseVertices[(r + 1) % normalizedOptions.radialSegments];
    createFace(mesh, {
      vertexIds: [v1, v2, apex.id],
      materialId: normalizedOptions.materialId
    }, context);
  }

  // Create base cap if not open-ended
  if (!normalizedOptions.openEnded) {
    const baseCenterVertex = createVertex(mesh, {
      x: 0,
      y: offsetY - halfHeight,
      z: 0,
      uv: { u: 0.5, v: 0.5 }
    }, context);

    // FIX: For full-circle cones, create proper edges for the base
    if (normalizedOptions.thetaLength === Math.PI * 2) {
      // Create individual triangular faces instead of one large face
      for (let r = 0; r < normalizedOptions.radialSegments; r++) {
        const v1 = baseVertices[r];
        const v2 = baseVertices[(r + 1) % normalizedOptions.radialSegments];
        createFace(mesh, {
          vertexIds: [baseCenterVertex.id, v1, v2],
          materialId: normalizedOptions.materialId
        }, context);
      }
    } else {
      // For partial cones, create individual triangular faces
      for (let r = 0; r < normalizedOptions.radialSegments; r++) {
        const v1 = baseVertices[r];
        const v2 = baseVertices[(r + 1) % normalizedOptions.radialSegments];
        createFace(mesh, {
          vertexIds: [baseCenterVertex.id, v1, v2],
          materialId: normalizedOptions.materialId
        }, context);
      }
    }
  }

  // Validate if requested
  if (normalizedOptions.validate) {
    const validation = validatePrimitive(mesh, 'Cone');
    if (!validation.isValid) {
      console.warn('Cone validation warnings:', validation.warnings);
    }
  }

  return mesh;
}
